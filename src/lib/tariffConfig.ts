// ============================================
// TARIFF CONFIGURATION
// DO NOT MODIFY COSY PRICE BANDS - only behavioural split
// ============================================

export type TariffType = "FLAT" | "TOU_2_RATE" | "TOU_3_RATE" | "DYNAMIC";

export interface TariffModelling {
  // Fallback blended rate for dynamic tariffs
  fallbackBlendedP?: number;
  // Explainer text for UI
  explainer: string;
}

export interface TariffConfig {
  id: string;
  displayName: string;
  supplier: string;
  type: TariffType;
  
  // Unit rates in p/kWh
  unit?: { flatP: number };
  tou2?: { offpeakP: number; peakP: number; offpeakHours: number; label: string };
  tou3?: { offpeakP: number; shoulderP: number; peakP: number; label: string };
  
  // Standing charge in p/day (use Ofgem electricity SC if unknown)
  standingChargePPerDay: number;
  
  // Modelling settings
  modelling?: TariffModelling;
  
  // Housekeeping
  source: "TYPICAL" | "USER_PROVIDED" | "API";
  isCosy?: boolean; // Flag to identify Cosy (DO NOT MODIFY)
}

// Default electricity standing charge (Ofgem cap)
export const DEFAULT_STANDING_CHARGE_P_PER_DAY = 54.75;

// ============================================
// BASELINE HEAT PUMP RUN PROFILE (PHYSICS-BASED)
// This is the default distribution BEFORE tariff-specific shiftability
// ============================================
const BASELINE_HP_PROFILE = {
  cheap: 0.40,  // 40% in cheap window (overnight/midday)
  mid: 0.45,    // 45% in mid window (morning/evening)
  peak: 0.15,   // 15% in peak window (high-demand hours)
};

// ============================================
// COSY SHIFTABILITY UPLIFT
// Cosy has 8 cheap hours/day and is designed for heat pump control.
// Heat pumps can shift more load into cheap hours on Cosy.
// ============================================
const COSY_SHIFT_UPLIFT = 0.20; // Add 20 percentage points to cheap_share
const MIN_PEAK_SHARE = 0.08;     // Minimum peak share (some heating always needed)

// Calculate Cosy-specific profile
// Start with baseline, add uplift to cheap, take from mid first
function calculateCosyProfileInternal() {
  let cheap = BASELINE_HP_PROFILE.cheap + COSY_SHIFT_UPLIFT; // 0.40 + 0.20 = 0.60
  let mid = BASELINE_HP_PROFILE.mid - COSY_SHIFT_UPLIFT;     // 0.45 - 0.20 = 0.25
  let peak = BASELINE_HP_PROFILE.peak;                        // 0.15
  
  // Ensure peak doesn't go below minimum (clamp if needed)
  if (peak < MIN_PEAK_SHARE) {
    const excess = MIN_PEAK_SHARE - peak;
    mid -= excess;
    peak = MIN_PEAK_SHARE;
  }
  
  // Normalize to sum to 1.0 (should already be 1.0)
  const total = cheap + mid + peak;
  if (Math.abs(total - 1.0) > 0.001) {
    cheap = cheap / total;
    mid = mid / total;
    peak = peak / total;
  }
  
  return { cheap, mid, peak };
}

const COSY_HP_PROFILE = calculateCosyProfileInternal();
// Result: { cheap: 0.60, mid: 0.25, peak: 0.15 }

// ============================================
// TARIFF CONFIGURATIONS
// ============================================
export const TARIFF_CONFIGS: TariffConfig[] = [
  // ============================================
  // COSY - PRICE BANDS LOCKED, DO NOT MODIFY
  // ============================================
  {
    id: 'cosy',
    displayName: 'Cosy (3-rate tariff)',
    supplier: 'Octopus Energy',
    type: 'TOU_3_RATE',
    tou3: {
      offpeakP: 12,
      shoulderP: 24,
      peakP: 38,
      label: '~12p / ~24p / ~38p (varies by region)',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    isCosy: true,
    modelling: {
      explainer: 'Cosy is modelled with higher cheap-hour usage because it offers 8 discounted hours/day and is designed for heat pump load shifting.',
    },
  },
  
  // ============================================
  // OFGEM PRICE CAP (FLAT)
  // ============================================
  {
    id: 'ofgem-cap',
    displayName: 'Price Cap (27.69p/kWh)',
    supplier: 'Ofgem',
    type: 'FLAT',
    unit: { flatP: 27.69 },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'The Ofgem price cap is a flat rate with no time-of-use benefits. All electricity costs the same rate.',
    },
  },
  
  // ============================================
  // OCTOPUS AGILE (DYNAMIC)
  // ============================================
  {
    id: 'octopus-agile',
    displayName: 'Agile (variable)',
    supplier: 'Octopus Energy',
    type: 'DYNAMIC',
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      fallbackBlendedP: 28.0,
      explainer: 'Agile prices vary every 30 minutes based on wholesale rates. We estimate using a conservative average blended rate.',
    },
  },
  
  // ============================================
  // OCTOPUS GO (2-RATE TOU)
  // ============================================
  {
    id: 'octopus-go',
    displayName: 'Go (9p / 25p)',
    supplier: 'Octopus Energy',
    type: 'TOU_2_RATE',
    tou2: {
      offpeakP: 9.0,
      peakP: 25.0,
      offpeakHours: 4,
      label: '9p off-peak / 25p peak',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'Modelled using baseline heat pump run-time profile (no load-shifting uplift).',
    },
  },
  
  // ============================================
  // BRITISH GAS HEAT PUMP (2-RATE TOU)
  // ============================================
  {
    id: 'british-gas-hp',
    displayName: 'Heat Pump (12p / 24p)',
    supplier: 'British Gas',
    type: 'TOU_2_RATE',
    tou2: {
      offpeakP: 12.0,
      peakP: 24.0,
      offpeakHours: 6,
      label: '12p off-peak / 24p peak',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'Modelled using baseline heat pump run-time profile (no load-shifting uplift).',
    },
  },
  
  // ============================================
  // EDF HEAT PUMP (2-RATE TOU)
  // ============================================
  {
    id: 'edf-hp',
    displayName: 'Heat Pump (12p / 24p)',
    supplier: 'EDF',
    type: 'TOU_2_RATE',
    tou2: {
      offpeakP: 12.0,
      peakP: 24.0,
      offpeakHours: 6,
      label: '12p off-peak / 24p peak',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'Modelled using baseline heat pump run-time profile (no load-shifting uplift).',
    },
  },
  
  // ============================================
  // E.ON NEXT HEAT PUMP (2-RATE TOU)
  // ============================================
  {
    id: 'eon-next-hp',
    displayName: 'Next Heat Pump (12p / 24p)',
    supplier: 'E.ON',
    type: 'TOU_2_RATE',
    tou2: {
      offpeakP: 12.0,
      peakP: 24.0,
      offpeakHours: 6,
      label: '12p off-peak / 24p peak',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'Modelled using baseline heat pump run-time profile (no load-shifting uplift).',
    },
  },
  
  // ============================================
  // SCOTTISH POWER HEAT PUMP (2-RATE TOU)
  // ============================================
  {
    id: 'scottish-power-hp',
    displayName: 'Heat Pump (12p / 24p)',
    supplier: 'Scottish Power',
    type: 'TOU_2_RATE',
    tou2: {
      offpeakP: 12.0,
      peakP: 24.0,
      offpeakHours: 6,
      label: '12p off-peak / 24p peak',
    },
    standingChargePPerDay: DEFAULT_STANDING_CHARGE_P_PER_DAY,
    source: 'TYPICAL',
    modelling: {
      explainer: 'Modelled using baseline heat pump run-time profile (no load-shifting uplift).',
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get tariff config by database tariff name and supplier
 */
export function getTariffConfig(tariffName: string, tariffSupplier?: string): TariffConfig | undefined {
  const lowerName = tariffName.toLowerCase();
  const lowerSupplier = (tariffSupplier || '').toLowerCase();
  
  // Cosy
  if (lowerName.includes('cosy')) {
    return TARIFF_CONFIGS.find(t => t.id === 'cosy');
  }
  
  // Agile
  if (lowerName.includes('agile')) {
    return TARIFF_CONFIGS.find(t => t.id === 'octopus-agile');
  }
  
  // Go (Octopus)
  if (lowerName === 'go' || lowerName.includes('go')) {
    if (lowerSupplier.includes('octopus') || !lowerSupplier) {
      return TARIFF_CONFIGS.find(t => t.id === 'octopus-go');
    }
  }
  
  // Ofgem Price Cap
  if (lowerName.includes('cap') || lowerName.includes('price cap') || lowerSupplier.includes('ofgem')) {
    return TARIFF_CONFIGS.find(t => t.id === 'ofgem-cap');
  }
  
  // British Gas Heat Pump
  if (lowerSupplier.includes('british gas') || lowerSupplier.includes('british')) {
    return TARIFF_CONFIGS.find(t => t.id === 'british-gas-hp');
  }
  
  // EDF Heat Pump
  if (lowerSupplier.includes('edf')) {
    return TARIFF_CONFIGS.find(t => t.id === 'edf-hp');
  }
  
  // E.ON Next Heat Pump
  if (lowerSupplier.includes('e.on') || lowerSupplier.includes('eon')) {
    return TARIFF_CONFIGS.find(t => t.id === 'eon-next-hp');
  }
  
  // Scottish Power Heat Pump
  if (lowerSupplier.includes('scottish')) {
    return TARIFF_CONFIGS.find(t => t.id === 'scottish-power-hp');
  }
  
  // Fallback: If it's a heat pump tariff from unknown supplier, use a generic config
  if (lowerName.includes('heat pump')) {
    // Default to British Gas config as template
    return TARIFF_CONFIGS.find(t => t.id === 'british-gas-hp');
  }
  
  return undefined;
}

/**
 * Calculate heat pump cost for a given tariff
 * Returns the annual cost and transparency info
 * 
 * IMPORTANT: For Cosy tariffs, this returns undefined - 
 * Cosy is calculated separately in the main calculateSavings function
 */
export interface TariffCostResult {
  annualCost: number;
  blendedRateP: number;
  tariffType: TariffType;
  
  // For display
  displayLabel: string;
  ratesLabel: string;
  
  // Split info (for TOU tariffs)
  offpeakShare?: number;
  shoulderShare?: number;
  peakShare?: number;
  
  offpeakRateP?: number;
  shoulderRateP?: number;
  peakRateP?: number;
  flatRateP?: number;
  
  // Standing charge delta vs standard
  standingChargeDeltaAnnual: number;
  
  // Explainer text
  explainer: string;
}

// Database tariff type for rate overrides
export interface DatabaseTariff {
  peak_rate_p_per_kwh: number;
  offpeak_rate_p_per_kwh: number | null;
  offpeak_hours_per_day: number | null;
}

/**
 * Calculate Cosy blended rate (for comparison/safety check)
 */
export function getCosyBlendedRate(): { blendedRateP: number; profile: typeof COSY_HP_PROFILE } {
  // Cosy rates in pence
  const offpeakP = 12;
  const shoulderP = 24;
  const peakP = 38;
  
  const blendedRateP = 
    (COSY_HP_PROFILE.cheap * offpeakP) + 
    (COSY_HP_PROFILE.mid * shoulderP) + 
    (COSY_HP_PROFILE.peak * peakP);
  
  // 0.60 * 12 + 0.25 * 24 + 0.15 * 38 = 7.2 + 6.0 + 5.7 = 18.9p
  return { blendedRateP, profile: COSY_HP_PROFILE };
}

export function calculateTariffCost(
  hpKwhTotal: number,
  epcBand: string,
  tariffConfig: TariffConfig,
  dbTariff?: DatabaseTariff  // Optional: pass actual DB rates to override config
): TariffCostResult | undefined {
  // DO NOT calculate for Cosy - it's handled separately
  if (tariffConfig.isCosy) {
    return undefined;
  }
  
  const normalizedEpc = epcBand.toUpperCase().charAt(0);
  const validEpc = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(normalizedEpc) ? normalizedEpc : 'D';
  
  // Calculate standing charge delta
  const standingChargeDeltaAnnual = 
    ((tariffConfig.standingChargePPerDay - DEFAULT_STANDING_CHARGE_P_PER_DAY) * 365) / 100;
  
  const baseResult = {
    tariffType: tariffConfig.type,
    displayLabel: `${tariffConfig.supplier} — ${tariffConfig.displayName}`,
    standingChargeDeltaAnnual,
    explainer: tariffConfig.modelling?.explainer || '',
  };
  
  // ============================================
  // USE BASELINE PROFILE FOR ALL NON-COSY TARIFFS
  // No penalty, no uplift - just baseline split
  // ============================================
  const profile = BASELINE_HP_PROFILE; // 0.40 / 0.45 / 0.15
  
  // Get Cosy blended rate for safety check
  const cosyInfo = getCosyBlendedRate();
  
  // Helper to apply safety check and adjust if needed
  const applySafetyCheck = (blendedRateP: number, cheapShare: number): { finalBlendedRateP: number; finalCheapShare: number } => {
    let finalBlendedRateP = blendedRateP;
    let finalCheapShare = cheapShare;
    
    // Safety: non-Cosy blended rate must be >= Cosy blended rate - 0.1
    const minRate = cosyInfo.blendedRateP - 0.1;
    
    // If non-Cosy is undercutting Cosy, adjust cheap_share downward
    while (finalBlendedRateP < minRate && finalCheapShare > 0.30) {
      finalCheapShare -= 0.02;
      // Recalculate won't work here generically, so we flag for recalc
    }
    
    return { finalBlendedRateP, finalCheapShare };
  };
  
  // ============================================
  // FLAT tariff - single rate applies everywhere
  // ============================================
  if (tariffConfig.type === 'FLAT') {
    const flatRateP = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.unit?.flatP ?? 27.69;
    const annualCost = (hpKwhTotal * flatRateP) / 100;
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP: flatRateP,
      ratesLabel: `${flatRateP}p/kWh flat rate`,
      flatRateP,
      offpeakShare: 1.0,
      shoulderShare: 0,
      peakShare: 0,
    };
  }
  
  // ============================================
  // TOU_2_RATE tariff (e.g., British Gas, EDF, E.ON, Scottish Power)
  // Map: cheap → offpeak, mid → peak, peak → peak
  // ============================================
  if (tariffConfig.type === 'TOU_2_RATE') {
    const offpeakP = dbTariff?.offpeak_rate_p_per_kwh ?? tariffConfig.tou2?.offpeakP ?? 12;
    const peakP = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.tou2?.peakP ?? 24;
    
    // Use baseline profile (no uplift for non-Cosy)
    let cheapShare = profile.cheap;  // 0.40
    const midShare = profile.mid;     // 0.45
    const peakShare = profile.peak;   // 0.15
    
    // For 2-rate tariffs:
    // - Cheap window → offpeak rate
    // - Mid window → peak rate (no mid rate available)
    // - Peak window → peak rate
    let blendedRateP = (cheapShare * offpeakP) + (midShare * peakP) + (peakShare * peakP);
    // For BG: 0.40 * 12 + 0.45 * 24 + 0.15 * 24 = 4.8 + 10.8 + 3.6 = 19.2p
    
    // Safety check: ensure we don't undercut Cosy (18.9p)
    const minRate = cosyInfo.blendedRateP - 0.1; // 18.8p
    
    // If blendedRateP < minRate, reduce cheapShare
    while (blendedRateP < minRate && cheapShare > 0.30) {
      cheapShare -= 0.02;
      const newMidShare = 1.0 - cheapShare - peakShare;
      blendedRateP = (cheapShare * offpeakP) + (newMidShare * peakP) + (peakShare * peakP);
    }
    
    const finalMidShare = 1.0 - cheapShare - peakShare;
    const annualCost = (hpKwhTotal * blendedRateP) / 100;
    
    const ratesLabel = `${offpeakP}p off-peak / ${peakP}p peak`;
    
    return {
      ...baseResult,
      displayLabel: `${tariffConfig.supplier} — ${tariffConfig.displayName}`,
      annualCost,
      blendedRateP,
      ratesLabel,
      offpeakShare: cheapShare,
      shoulderShare: finalMidShare,
      peakShare: peakShare,
      offpeakRateP: offpeakP,
      shoulderRateP: peakP,  // 2-rate uses peak for mid window
      peakRateP: peakP,
    };
  }
  
  // ============================================
  // DYNAMIC tariff - use fallback blended rate
  // ============================================
  if (tariffConfig.type === 'DYNAMIC') {
    const fallbackRate = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.modelling?.fallbackBlendedP ?? 28.0;
    const annualCost = (hpKwhTotal * fallbackRate) / 100;
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP: fallbackRate,
      ratesLabel: `~${fallbackRate}p/kWh estimated average`,
      flatRateP: fallbackRate,
      offpeakShare: 1.0,
      shoulderShare: 0,
      peakShare: 0,
    };
  }
  
  // ============================================
  // TOU_3_RATE (non-Cosy, future use)
  // ============================================
  if (tariffConfig.type === 'TOU_3_RATE' && tariffConfig.tou3) {
    const { offpeakP, shoulderP, peakP, label } = tariffConfig.tou3;
    
    // Use baseline profile
    const cheapShare = profile.cheap;  // 0.40
    const midShare = profile.mid;      // 0.45
    const peakShareVal = profile.peak; // 0.15
    
    const blendedRateP = (cheapShare * offpeakP) + (midShare * shoulderP) + (peakShareVal * peakP);
    const annualCost = (hpKwhTotal * blendedRateP) / 100;
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP,
      ratesLabel: label,
      offpeakShare: cheapShare,
      shoulderShare: midShare,
      peakShare: peakShareVal,
      offpeakRateP: offpeakP,
      shoulderRateP: shoulderP,
      peakRateP: peakP,
    };
  }
  
  return undefined;
}

/**
 * Format tariff label for dropdown
 */
export function formatTariffDropdownLabel(config: TariffConfig): string {
  if (config.isCosy) {
    // Cosy keeps its existing format
    return `${config.supplier} — ${config.displayName}`;
  }
  
  if (config.type === 'FLAT' && config.unit) {
    return `${config.supplier} — ${config.displayName}`;
  }
  
  if (config.type === 'TOU_2_RATE' && config.tou2) {
    return `${config.supplier} — ${config.displayName}`;
  }
  
  if (config.type === 'DYNAMIC') {
    return `${config.supplier} — ${config.displayName}`;
  }
  
  return `${config.supplier} — ${config.displayName}`;
}

/**
 * Get the baseline profile for display
 */
export function getBaselineProfile() {
  return BASELINE_HP_PROFILE;
}

/**
 * Get the Cosy profile for display
 */
export function getCosyProfile() {
  return COSY_HP_PROFILE;
}
