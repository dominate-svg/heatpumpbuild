// ============================================
// TARIFF CALCULATIONS
// Per-tariff savings calculation using actual database rates
// ============================================

import type { Tariff } from '@/hooks/useTariffs';

// ============================================
// TARIFF USAGE SHARES
// Fixed shares based on tariff type
// ============================================

// Cosy 3-rate tariff shares (optimized for heat pump scheduling)
// Heat pumps can load-shift to maximize cheap overnight usage
const COSY_SHARES = {
  offpeak: 0.65,  // 65% overnight cheap
  mid: 0.20,      // 20% midday
  peak: 0.15,     // 15% 4-7pm expensive window
};

// 2-rate TOU tariff shares (less off-peak opportunity without Cosy scheduling)
// Users on standard TOU tariffs don't optimize as well
const TWO_RATE_SHARES = {
  offpeak: 0.45,
  peak: 0.55,
};

// Flat rate: all usage at single rate
const FLAT_SHARES = {
  peak: 1.0,
};

// ============================================
// COSY RATES (3-rate tariff) - Typical national rates
// These must match what we show in the UI
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
 * Calculate effective rate for a tariff WITHOUT the guard
 * This is used to compute the base rate before enforcing Cosy-best rule
 */
function calculateRawEffectiveRate(
  tariff: Tariff,
  isCosy: boolean
): { 
  effectiveRateP: number; 
  offpeakShare: number; 
  peakShare: number; 
  midShare?: number;
  offpeakRateP?: number;
  peakRateP?: number;
  midRateP?: number;
} {
  if (isCosy) {
    // ============================================
    // COSY: 3-rate tariff - fixed shares + modelled rates
    // ============================================
    const offpeakShare = COSY_SHARES.offpeak;
    const midShare = COSY_SHARES.mid;
    const peakShare = COSY_SHARES.peak;
    
    const offpeakRateP = COSY_OFFPEAK_RATE_P;
    const midRateP = COSY_MID_RATE_P;
    const peakRateP = COSY_PEAK_RATE_P;
    
    // Weighted average: (0.65 × 12) + (0.20 × 24) + (0.15 × 38) = 17.3p
    const effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (midShare * midRateP) +
      (peakShare * peakRateP);
      
    return {
      effectiveRateP,
      offpeakShare,
      peakShare,
      midShare,
      offpeakRateP,
      peakRateP,
      midRateP,
    };
  } else if (tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null) {
    // ============================================
    // TWO-RATE TOU TARIFF - 45/55 split
    // ============================================
    const offpeakShare = TWO_RATE_SHARES.offpeak;
    const peakShare = TWO_RATE_SHARES.peak;
    
    const offpeakRateP = tariff.offpeak_rate_p_per_kwh;
    const peakRateP = tariff.peak_rate_p_per_kwh;
    
    const effectiveRateP = 
      (offpeakShare * offpeakRateP) +
      (peakShare * peakRateP);
      
    return {
      effectiveRateP,
      offpeakShare,
      peakShare,
      offpeakRateP,
      peakRateP,
    };
  } else {
    // ============================================
    // FLAT RATE TARIFF - all at single rate
    // ============================================
    const offpeakShare = 0;
    const peakShare = FLAT_SHARES.peak;
    const effectiveRateP = tariff.peak_rate_p_per_kwh;
    const peakRateP = tariff.peak_rate_p_per_kwh;
    
    return {
      effectiveRateP,
      offpeakShare,
      peakShare,
      peakRateP,
    };
  }
}

/**
 * Calculate effective blended rate and savings for a given tariff
 * 
 * @param tariff - Database tariff object
 * @param epcBand - EPC band (A-G) - not currently used but kept for future
 * @param heatPumpKwhAnnual - Total HP electricity consumption (kWh/year)
 * @param currentHeatingCostAnnual - Current fuel cost in £/year
 * @param cosyEffectiveRateP - The Cosy effective rate (for enforcing Cosy-best rule)
 * @returns TariffOutcome with all calculated values
 */
export function calculateTariffOutcome(
  tariff: Tariff,
  epcBand: string,
  heatPumpKwhAnnual: number,
  currentHeatingCostAnnual: number,
  fuelType?: string,
  cosyEffectiveRateP?: number
): TariffOutcome {
  const isCosy = tariff.name.toLowerCase().includes('cosy');
  
  // Get raw effective rate
  const rateInfo = calculateRawEffectiveRate(tariff, isCosy);
  let effectiveRateP = rateInfo.effectiveRateP;
  
  // ============================================
  // ENFORCE COSY-BEST RULE
  // If another tariff would show better than Cosy, adjust it
  // ============================================
  if (!isCosy && cosyEffectiveRateP !== undefined && effectiveRateP < cosyEffectiveRateP) {
    // Never let a non-Cosy tariff beat Cosy
    effectiveRateP = cosyEffectiveRateP + 0.1;
  }
  
  // Calculate annual heat pump running cost
  // hpCost = (kWh * p/kWh) / 100 = £
  const heatPumpCostAnnual = (heatPumpKwhAnnual * effectiveRateP) / 100;
  
  // Calculate savings vs current fuel
  const annualSavings = currentHeatingCostAnnual - heatPumpCostAnnual;
  
  // Dev logging
  if (typeof window !== 'undefined' && (window as any).__DEV_TARIFF_DEBUG__) {
    console.log('[Tariff Debug]', {
      tariff: `${tariff.supplier} - ${tariff.name}`,
      isCosy,
      rawEffectiveRateP: rateInfo.effectiveRateP.toFixed(2),
      guardedEffectiveRateP: effectiveRateP.toFixed(2),
      heatPumpKwhAnnual: heatPumpKwhAnnual.toFixed(0),
      heatPumpCostAnnual: heatPumpCostAnnual.toFixed(0),
      currentHeatingCostAnnual: currentHeatingCostAnnual.toFixed(0),
      annualSavings: annualSavings.toFixed(0),
      shares: { 
        offpeak: rateInfo.offpeakShare, 
        mid: rateInfo.midShare, 
        peak: rateInfo.peakShare 
      },
      rates: { 
        offpeak: rateInfo.offpeakRateP, 
        mid: rateInfo.midRateP, 
        peak: rateInfo.peakRateP 
      },
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
    offpeakShare: rateInfo.offpeakShare,
    peakShare: rateInfo.peakShare,
    midShare: rateInfo.midShare,
    offpeakRateP: rateInfo.offpeakRateP,
    peakRateP: rateInfo.peakRateP,
    midRateP: rateInfo.midRateP,
  };
}

/**
 * Calculate outcomes for all tariffs at once
 * Ensures Cosy is computed first to provide the baseline rate
 * Returns a Map keyed by tariff ID for efficient lookup
 */
export function calculateAllTariffOutcomes(
  tariffs: Tariff[],
  epcBand: string,
  heatPumpKwhAnnual: number,
  currentHeatingCostAnnual: number
): Map<string, TariffOutcome> {
  const outcomes = new Map<string, TariffOutcome>();
  
  // First, find Cosy and compute its effective rate
  const cosyTariff = tariffs.find(t => t.name.toLowerCase().includes('cosy'));
  let cosyEffectiveRateP: number | undefined;
  
  if (cosyTariff) {
    const cosyOutcome = calculateTariffOutcome(
      cosyTariff,
      epcBand,
      heatPumpKwhAnnual,
      currentHeatingCostAnnual,
      undefined,
      undefined // No guard needed for Cosy itself
    );
    cosyEffectiveRateP = cosyOutcome.effectiveRateP;
    outcomes.set(cosyTariff.id, cosyOutcome);
  }
  
  // Now compute all other tariffs with the Cosy guard
  tariffs.forEach(tariff => {
    if (tariff.id === cosyTariff?.id) return; // Already computed
    
    const outcome = calculateTariffOutcome(
      tariff,
      epcBand,
      heatPumpKwhAnnual,
      currentHeatingCostAnnual,
      undefined,
      cosyEffectiveRateP // Pass Cosy rate for guard
    );
    outcomes.set(tariff.id, outcome);
  });
  
  // Debug: Log all outcomes if debug enabled
  if (typeof window !== 'undefined' && (window as any).__DEV_TARIFF_DEBUG__) {
    console.log('[Tariff Debug] All Outcomes Summary:', {
      cosyEffectiveRateP,
      heatPumpKwhAnnual,
      currentHeatingCostAnnual,
      outcomes: Array.from(outcomes.values()).map(o => ({
        name: `${o.supplier} - ${o.tariffName}`,
        effectiveRate: o.effectiveRateP.toFixed(2),
        hpCost: o.heatPumpCostAnnual.toFixed(0),
        savings: o.annualSavings.toFixed(0),
      })),
    });
  }
  
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
