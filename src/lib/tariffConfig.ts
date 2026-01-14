// ============================================
// TARIFF CONFIGURATION
// DO NOT MODIFY COSY - it is locked and handled separately
// ============================================

export type TariffType = "FLAT" | "TOU_2_RATE" | "TOU_3_RATE" | "DYNAMIC";

export interface TariffModelling {
  // EPC-sensitive offpeak share (remaining goes to peak/shoulder)
  assumedSplitByEpc?: Record<string, { offpeak: number; shoulder?: number; peak: number }>;
  // Default split if EPC unknown
  defaultSplit?: { offpeak: number; shoulder?: number; peak: number };
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
// STANDARD TOU SPLIT FOR ALL NON-COSY TARIFFS
// 35% off-peak, 65% peak (conservative assumption)
// ============================================
const STANDARD_TOU_SPLIT = { offpeak: 0.35, peak: 0.65 };

// ============================================
// TARIFF CONFIGURATIONS
// ============================================
export const TARIFF_CONFIGS: TariffConfig[] = [
  // ============================================
  // COSY - DO NOT MODIFY (handled separately in calculations)
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
      explainer: 'Cosy uses a 3-rate structure with cheap overnight/midday periods. We model based on when heat pumps typically run.',
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
      explainer: 'Agile prices vary every 30 minutes based on wholesale rates. We estimate using a conservative average blended rate. Actual costs depend on usage patterns and market conditions.',
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
      defaultSplit: STANDARD_TOU_SPLIT,
      explainer: 'Go has a 4-hour overnight off-peak window. We assume 35% off-peak, 65% peak usage.',
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
      defaultSplit: STANDARD_TOU_SPLIT,
      explainer: 'Heat pump tariffs offer extended off-peak periods. We assume 35% off-peak, 65% peak usage.',
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
      defaultSplit: STANDARD_TOU_SPLIT,
      explainer: 'Heat pump tariffs offer extended off-peak periods. We assume 35% off-peak, 65% peak usage.',
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
      defaultSplit: STANDARD_TOU_SPLIT,
      explainer: 'Heat pump tariffs offer extended off-peak periods. We assume 35% off-peak, 65% peak usage.',
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
      defaultSplit: STANDARD_TOU_SPLIT,
      explainer: 'Heat pump tariffs offer extended off-peak periods. We assume 35% off-peak, 65% peak usage.',
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
  
  // FLAT tariff
  if (tariffConfig.type === 'FLAT') {
    // Use DB rate if available, otherwise fall back to config
    const flatRateP = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.unit?.flatP ?? 27.69;
    const annualCost = (hpKwhTotal * flatRateP) / 100;
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP: flatRateP,
      ratesLabel: `${flatRateP}p/kWh`,
      flatRateP,
    };
  }
  
  // TOU_2_RATE tariff
  if (tariffConfig.type === 'TOU_2_RATE') {
    // Use DB rates if available, otherwise fall back to config
    const offpeakP = dbTariff?.offpeak_rate_p_per_kwh ?? tariffConfig.tou2?.offpeakP ?? 12;
    const peakP = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.tou2?.peakP ?? 24;
    
    // Use standard 35/65 split for all non-Cosy tariffs
    const split = tariffConfig.modelling?.defaultSplit || { offpeak: 0.35, peak: 0.65 };
    
    const offpeakKwh = hpKwhTotal * split.offpeak;
    const peakKwh = hpKwhTotal * split.peak;
    
    const annualCost = ((offpeakKwh * offpeakP) + (peakKwh * peakP)) / 100;
    const blendedRateP = (split.offpeak * offpeakP) + (split.peak * peakP);
    
    // Generate dynamic label based on actual rates
    const ratesLabel = `${offpeakP}p off-peak / ${peakP}p peak`;
    
    return {
      ...baseResult,
      displayLabel: `${tariffConfig.supplier} — ${tariffConfig.displayName} (${offpeakP}p / ${peakP}p)`,
      annualCost,
      blendedRateP,
      ratesLabel,
      offpeakShare: split.offpeak,
      peakShare: split.peak,
      offpeakRateP: offpeakP,
      peakRateP: peakP,
    };
  }
  
  // DYNAMIC tariff
  if (tariffConfig.type === 'DYNAMIC') {
    // For dynamic tariffs, use DB peak rate as approximation if available
    const fallbackRate = dbTariff?.peak_rate_p_per_kwh ?? tariffConfig.modelling?.fallbackBlendedP ?? 28.0;
    const annualCost = (hpKwhTotal * fallbackRate) / 100;
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP: fallbackRate,
      ratesLabel: `~${fallbackRate}p/kWh average`,
      flatRateP: fallbackRate,
    };
  }
  
  // TOU_3_RATE (not Cosy, future use)
  if (tariffConfig.type === 'TOU_3_RATE' && tariffConfig.tou3) {
    const { offpeakP, shoulderP, peakP, label } = tariffConfig.tou3;
    
    // Default 3-rate split
    const offpeakShare = 0.40;
    const shoulderShare = 0.45;
    const peakShare = 0.15;
    
    const offpeakKwh = hpKwhTotal * offpeakShare;
    const shoulderKwh = hpKwhTotal * shoulderShare;
    const peakKwh = hpKwhTotal * peakShare;
    
    const annualCost = ((offpeakKwh * offpeakP) + (shoulderKwh * shoulderP) + (peakKwh * peakP)) / 100;
    const blendedRateP = (offpeakShare * offpeakP) + (shoulderShare * shoulderP) + (peakShare * peakP);
    
    return {
      ...baseResult,
      annualCost,
      blendedRateP,
      ratesLabel: label,
      offpeakShare,
      shoulderShare,
      peakShare,
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
