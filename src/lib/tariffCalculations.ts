// ============================================
// TARIFF CALCULATIONS
// Per-tariff savings calculation using actual database rates
// ============================================

import type { Tariff } from '@/hooks/useTariffs';

// ============================================
// TARIFF USAGE SHARES
// Fixed shares based on tariff type (not EPC-dependent)
// ============================================

// Cosy 3-rate tariff shares (optimized for heat pump scheduling)
const COSY_SHARES = {
  offpeak: 0.65,  // 6+ hours overnight cheap
  mid: 0.10,      // Midday/afternoon
  peak: 0.25,     // 4-7pm expensive window
};

// 2-rate TOU tariff shares (less off-peak opportunity)
const TWO_RATE_SHARES = {
  offpeak: 0.40,
  peak: 0.60,
};

// Flat rate: all usage at single rate
const FLAT_SHARES = {
  peak: 1.0,
};

// ============================================
// COSY RATES (3-rate tariff) - Typical national rates
// These must match calculations.ts
// ============================================
const COSY_OFFPEAK_RATE_P = 12;  // p/kWh (overnight)
const COSY_MID_RATE_P = 24;      // p/kWh (midday)
const COSY_PEAK_RATE_P = 38;     // p/kWh (4-7pm)

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

export function calculateTariffOutcome(
  tariff: Tariff,
  epcBand: string,
  heatPumpKwhAnnual: number,
  currentHeatingCostAnnual: number,
  fuelType?: string
): TariffOutcome {
  const isCosy = tariff.name.toLowerCase().includes('cosy');
  
  let effectiveRateP: number;
  let offpeakShare: number;
  let peakShare: number;
  let midShare: number | undefined;
  let offpeakRateP: number | undefined;
  let peakRateP: number | undefined;
  let midRateP: number | undefined;
  
  if (isCosy) {
    // ============================================
    // COSY: 3-rate tariff - fixed shares + modelled rates
    // ============================================
    offpeakShare = COSY_SHARES.offpeak;
    midShare = COSY_SHARES.mid;
    peakShare = COSY_SHARES.peak;
    
    offpeakRateP = COSY_OFFPEAK_RATE_P;
    midRateP = COSY_MID_RATE_P;
    peakRateP = COSY_PEAK_RATE_P;
    
    // Weighted average: (0.65 × 12) + (0.10 × 24) + (0.25 × 38) = 19.7p
    effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (midShare * midRateP) +
      (peakShare * peakRateP);
      
  } else if (tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null) {
    // ============================================
    // TWO-RATE TOU TARIFF - fixed 40/60 split
    // ============================================
    offpeakShare = TWO_RATE_SHARES.offpeak;
    peakShare = TWO_RATE_SHARES.peak;
    
    offpeakRateP = tariff.offpeak_rate_p_per_kwh;
    peakRateP = tariff.peak_rate_p_per_kwh;
    
    effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (peakShare * peakRateP);
      
  } else {
    // ============================================
    // FLAT RATE TARIFF - all at single rate
    // ============================================
    offpeakShare = 0;
    peakShare = FLAT_SHARES.peak;
    effectiveRateP = tariff.peak_rate_p_per_kwh;
    peakRateP = tariff.peak_rate_p_per_kwh;
  }
  
  // Calculate annual heat pump running cost
  const heatPumpCostAnnual = (heatPumpKwhAnnual * effectiveRateP) / 100;
  
  // Calculate savings vs current fuel
  const annualSavings = currentHeatingCostAnnual - heatPumpCostAnnual;
  
  // Dev logging
  if (typeof window !== 'undefined' && (window as any).__DEV_TARIFF_DEBUG__) {
    console.log('[Tariff Debug]', {
      tariff: `${tariff.supplier} - ${tariff.name}`,
      effectiveRateP: effectiveRateP.toFixed(2),
      heatPumpCostAnnual: heatPumpCostAnnual.toFixed(0),
      annualSavings: annualSavings.toFixed(0),
      shares: { offpeakShare, midShare, peakShare },
      rates: { offpeakRateP, midRateP, peakRateP },
      inputs: { heatPumpKwhAnnual, currentHeatingCostAnnual },
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
