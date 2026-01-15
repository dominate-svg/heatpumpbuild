// ============================================
// TARIFF CALCULATIONS
// Per-tariff savings calculation using actual database rates
// ============================================

import type { Tariff } from '@/hooks/useTariffs';

// ============================================
// OFF-PEAK SHARE BY EPC BAND
// Represents what % of heat pump usage happens during off-peak hours
// Better insulated homes = more flexibility to shift load
// ============================================
const OFFPEAK_SHARE_BY_EPC: Record<string, number> = {
  'A': 0.60,
  'B': 0.60,
  'C': 0.55,
  'D': 0.50,
  'E': 0.45,
  'F': 0.40,
  'G': 0.35,
};

// For 3-rate tariffs (Cosy), peak share is fixed
const THREE_RATE_PEAK_SHARE = 0.15;

// ============================================
// COSY RATES (3-rate tariff) - MUST MATCH UI (7p / 19p / 40p)
// These are used for Cosy calculations only
// ============================================
const COSY_OFFPEAK_RATE_P = 7;   // p/kWh (overnight)
const COSY_MID_RATE_P = 19;      // p/kWh (midday)
const COSY_PEAK_RATE_P = 40;     // p/kWh (4-7pm)

export interface TariffOutcome {
  tariffId: string;
  tariffName: string;
  supplier: string;
  effectiveRateP: number;       // Blended rate in p/kWh
  heatPumpCostAnnual: number;   // Annual HP running cost in £
  annualSavings: number;        // Savings vs current fuel in £
  isCosy: boolean;
  // Debug info
  offpeakShare: number;
  peakShare: number;
  midShare?: number;
  offpeakRateP?: number;
  peakRateP?: number;
  midRateP?: number;
}

/**
 * Calculate effective blended rate and savings for a given tariff
 * 
 * @param tariff - Database tariff object
 * @param epcBand - EPC band (A-G)
 * @param heatPumpKwhAnnual - Total HP electricity consumption (kWh/year)
 * @param currentHeatingCostAnnual - Current fuel cost in £/year
 * @returns TariffOutcome with all calculated values
 */
// Gas off-peak share nudge (gas homes have more predictable patterns)
const GAS_OFFPEAK_SHARE_NUDGE = 0.05;
const GAS_OFFPEAK_SHARE_MAX = 0.65;

export function calculateTariffOutcome(
  tariff: Tariff,
  epcBand: string,
  heatPumpKwhAnnual: number,
  currentHeatingCostAnnual: number,
  fuelType?: string
): TariffOutcome {
  const normalizedEpc = (epcBand || 'D').toUpperCase().charAt(0);
  const validEpc = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(normalizedEpc) ? normalizedEpc : 'D';
  
  const isCosy = tariff.name.toLowerCase().includes('cosy');
  let offpeakShare = OFFPEAK_SHARE_BY_EPC[validEpc] || 0.45;
  
  // Apply gas off-peak share nudge (gas homes only)
  // Do NOT apply to oil/LPG
  if (fuelType === 'gas') {
    offpeakShare = Math.min(offpeakShare + GAS_OFFPEAK_SHARE_NUDGE, GAS_OFFPEAK_SHARE_MAX);
  }
  
  let effectiveRateP: number;
  let peakShare: number;
  let midShare: number | undefined;
  let offpeakRateP: number | undefined;
  let peakRateP: number | undefined;
  let midRateP: number | undefined;
  
  if (isCosy) {
    // ============================================
    // COSY: 3-rate tariff - use hardcoded rates
    // DO NOT MODIFY COSY LOGIC
    // ============================================
    peakShare = THREE_RATE_PEAK_SHARE;
    midShare = 1 - offpeakShare - peakShare;
    
    offpeakRateP = COSY_OFFPEAK_RATE_P;
    midRateP = COSY_MID_RATE_P;
    peakRateP = COSY_PEAK_RATE_P;
    
    effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (midShare * midRateP) +
      (peakShare * peakRateP);
      
  } else if (tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null) {
    // ============================================
    // TWO-RATE TOU TARIFF (has off-peak window)
    // Use actual database rates
    // ============================================
    peakShare = 1 - offpeakShare;
    
    offpeakRateP = tariff.offpeak_rate_p_per_kwh;
    peakRateP = tariff.peak_rate_p_per_kwh;
    
    effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (peakShare * peakRateP);
      
  } else {
    // ============================================
    // FLAT RATE TARIFF (no off-peak window)
    // Use peak_rate as the flat rate
    // ============================================
    peakShare = 1;
    effectiveRateP = tariff.peak_rate_p_per_kwh;
    peakRateP = tariff.peak_rate_p_per_kwh;
  }
  
  // Calculate annual costs
  const heatPumpCostAnnual = (heatPumpKwhAnnual * effectiveRateP) / 100;
  const annualSavings = currentHeatingCostAnnual - heatPumpCostAnnual;
  
  // Dev logging (remove in production by checking for dev mode)
  if (typeof window !== 'undefined' && (window as any).__DEV_TARIFF_DEBUG__) {
    console.log('[Tariff Debug]', {
      tariff: `${tariff.supplier} - ${tariff.name}`,
      effectiveRateP: effectiveRateP.toFixed(2),
      heatPumpCostAnnual: heatPumpCostAnnual.toFixed(0),
      annualSavings: annualSavings.toFixed(0),
      offpeakShare,
      peakShare,
      midShare,
      rates: { offpeakRateP, midRateP, peakRateP },
      inputs: { heatPumpKwhAnnual, currentHeatingCostAnnual, epcBand: validEpc },
    });
  }
  
  return {
    tariffId: tariff.id,
    tariffName: tariff.name,
    supplier: tariff.supplier,
    effectiveRateP,
    heatPumpCostAnnual,
    annualSavings,
    isCosy,
    offpeakShare,
    peakShare,
    midShare,
    offpeakRateP,
    peakRateP,
    midRateP,
  };
}

/**
 * Calculate outcomes for all tariffs at once
 * Returns a Map keyed by tariff ID for efficient lookup
 */
export function calculateAllTariffOutcomes(
  tariffs: Tariff[],
  epcBand: string,
  heatPumpKwhAnnual: number,
  currentHeatingCostAnnual: number
): Map<string, TariffOutcome> {
  const outcomes = new Map<string, TariffOutcome>();
  
  tariffs.forEach(tariff => {
    const outcome = calculateTariffOutcome(
      tariff,
      epcBand,
      heatPumpKwhAnnual,
      currentHeatingCostAnnual
    );
    outcomes.set(tariff.id, outcome);
  });
  
  return outcomes;
}

/**
 * Round savings for display (to nearest £10)
 */
export function roundSavingsForDisplay(savings: number): number {
  return Math.round(savings / 10) * 10;
}

/**
 * Format savings for display
 */
export function formatSavingsLabel(savings: number): string {
  const rounded = roundSavingsForDisplay(savings);
  if (rounded > 0) {
    return `£${rounded}/yr`;
  } else if (rounded < 0) {
    return `£${Math.abs(rounded)}/yr more`;
  }
  return 'No savings';
}

/**
 * Enable debug logging for tariff calculations
 * Call this from browser console: window.__DEV_TARIFF_DEBUG__ = true
 */
export function enableTariffDebug(): void {
  if (typeof window !== 'undefined') {
    (window as any).__DEV_TARIFF_DEBUG__ = true;
    console.log('[Tariff Debug] Enabled - tariff calculations will be logged');
  }
}
