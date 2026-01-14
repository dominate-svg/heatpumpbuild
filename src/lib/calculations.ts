import type { Tariff } from '@/hooks/useTariffs';
import { getTariffConfig, calculateTariffCost, type TariffCostResult, type TariffConfig, type DatabaseTariff } from './tariffConfig';

export interface Assumptions {
  gas_rate: number;
  boiler_efficiency: number;
  cosy_blended_rate: number;
  electricity_rate: number;
  full_load_hours: number;
  bus_grant_value: number;
  install_base_3_5kw: number;
  install_base_5_8kw: number;
  install_base_8_12kw: number;
  install_base_12_16kw: number;
  adder_location_6m: number;
  adder_location_9m: number;
  adder_cylinder_150l: number;
  adder_cylinder_210l: number;
  base_customer_contribution: number;
  included_radiators: number;
  rad_upgrade_cost: number;
  min_customer_contribution: number;
  oil_rate_p_per_kwh: number;
  lpg_rate_p_per_kwh?: number;
  // New configurable defaults
  base_useful_heat_kwh?: number;
  oil_price_pence_per_litre?: number;
  oil_kwh_per_litre?: number;
  dhw_cop?: number;
  // Legacy fields (kept for compatibility)
  heat_intensity_kwh_per_m2?: number;
  boiler_efficiency_oil?: number;
  hp_scop_default?: number;
  hp_scop_min?: number;
  hp_scop_max?: number;
  hp_aux_factor?: number;
  offpeak_share_default?: number;
  offpeak_share_min?: number;
  offpeak_share_max?: number;
}

export type { TariffCostResult, TariffConfig };

export interface EPCData {
  address: string;
  postcode: string;
  uprn?: string;
  lmkKey?: string;
  heatingCostCurrent?: number;
  totalFloorArea?: number;
  mainFuel?: string;
  propertyType?: string;
  region?: string;
  spaceHeatingDemand?: number;
  epcBand?: string;
}

export interface EstimateInputs {
  floorArea: number;
  heatingCostCurrent?: number;
  spaceHeatingDemand?: number;
  currentFuel: string;
  propertyType?: string;
  region?: string;
  epcBand?: string;
  scop: number;
  tariff: Tariff | null;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
  userProvidedAnnualCost?: number;
}

// ============================================
// PHYSICALLY ACCURATE SAVINGS MODEL
// Conservative, realistic estimates
// ============================================

// Heat demand by EPC band (kWh/year) - includes space + hot water
const HEAT_DEMAND_BY_EPC: Record<string, number> = {
  'A': 7000,
  'B': 8500,
  'C': 10000,
  'D': 11500,
  'E': 13000,
  'F': 14500,
  'G': 16500,
};

// Seasonal COP (SCOP) by EPC band - accounts for insulation quality
const SCOP_BY_EPC: Record<string, number> = {
  'A': 3.8,
  'B': 3.6,
  'C': 3.4,
  'D': 3.2,
  'E': 3.0,
  'F': 2.8,
  'G': 2.6,
};

// Boiler efficiencies
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.82,
  'oil': 0.78,
  'lpg': 0.75,
  'electric': 1.00,
};

// Effective delivered heat costs (p/kWh)
// These are the "delivered" costs after accounting for boiler efficiency
const DELIVERED_HEAT_COST: Record<string, number> = {
  'gas': 5.93,   // 5.93p/kWh at 82% efficiency
  'oil': 10.5,   // 10.5p/kWh at 78% efficiency  
  'lpg': 11.5,   // 11.5p/kWh at 75% efficiency
  'electric': 28, // Direct electric, no efficiency loss
};

// Cosy tariff structure (3-rate tariff) - PRICE BANDS LOCKED, DO NOT CHANGE
// Profile: 60% at 12p, 25% at 24p, 15% at 38p (with load-shifting uplift)
// Blended rate = 0.60*12 + 0.25*24 + 0.15*38 = 7.2 + 6.0 + 5.7 = 18.9p
const COSY_OFFPEAK_RATE = 0.12;   // 12p/kWh
const COSY_MID_RATE = 0.24;       // 24p/kWh  
const COSY_PEAK_RATE = 0.38;      // 38p/kWh
const COSY_OFFPEAK_SHARE = 0.60;  // 60% (with load-shifting uplift from 40% baseline)
const COSY_MID_SHARE = 0.25;      // 25% (reduced from 45% baseline)
const COSY_PEAK_SHARE = 0.15;     // 15% (unchanged from baseline)
const COSY_BLENDED_RATE = (COSY_OFFPEAK_SHARE * COSY_OFFPEAK_RATE) + 
                          (COSY_MID_SHARE * COSY_MID_RATE) + 
                          (COSY_PEAK_SHARE * COSY_PEAK_RATE); // = 0.189 = 18.9p

// Oil savings guardrail: max £500 unless oil price > 12p/kWh
const OIL_SAVINGS_CAP = 500;
const OIL_HIGH_PRICE_THRESHOLD = 12; // p/kWh - above this, cap doesn't apply

// Near-zero display threshold
const NEAR_ZERO_THRESHOLD = 100; // ±£100 shows as "≈ £0"

// Map efficiency (SCOP) to radiator count
export function getRadiatorsForEfficiency(scop: number): number {
  if (scop >= 4.0) return 11;
  if (scop >= 3.7) return 6;
  return 2;
}

export interface SavingsCalculation {
  heatDemand: number;
  fuelKwh: number;
  currentCost: number;
  hpKwh: number;
  hpCost: number;
  rawSavings: number;
  estimatedSavings: number;
  boilerEfficiency: number;
  optimisticScop: number;
}

export interface SavingsTransparency {
  // Heat demand breakdown
  totalHeatDemand: number;
  spaceHeatDemand: number;
  dhwDemand: number;
  dhwShare: number;
  
  // Current system
  oilPricePerLitre?: number;
  oilLitresUsed?: number;
  oilKwhPerLitre?: number;
  
  // SCOP breakdown
  baseScop: number;
  epcScopMultiplier: number;
  scopSpace: number;
  scopDhw: number;
  
  // Electricity breakdown
  hpKwhSpace: number;
  hpKwhDhw: number;
  
  // Cosy tariff breakdown (LOCKED - DO NOT CHANGE)
  cosyOffpeakRate: number;
  cosyMidRate: number;
  cosyPeakRate: number;
  cosyCheapShare: number;
  cosyMidShare: number;
  cosyPeakShare: number;
  blendedRate: number;
  
  // Non-Cosy tariff info
  isCosy: boolean;
  tariffCostResult?: TariffCostResult;
  
  // Clamp info
  rawSavingsBeforeClamp: number;
  savingsWasClamped: boolean;
  isHighSensitivity: boolean;
}

export interface EstimateResults {
  floorArea: number;
  annualHeatKwh: number;
  heatLossKw: number;
  baselineCost: number;
  hpElectricKwh: number;
  hpCost: number;
  annualSavings: number;
  estimatedSavings: number;
  rawSavings: number;
  installBase: number;
  adders: { location: number; cylinder: number; radiator: number };
  grossInstallPrice: number;
  grantApplied: number;
  grantEligible: boolean;
  netInstallPrice: number;
  radiatorsUpgraded: number;
  extraRads: number;
  radiatorAdder: number;
  rawCustomerContribution: number;
  customerContribution: number;
  efficiencySelected: number;
  heatDemandSource: 'national_average' | 'epc';
  scopUsed: number;
  isBestCase: boolean;
  tariffId?: string;
  tariffPeakRate?: number;
  tariffOffpeakRate?: number;
  // Transparency fields
  currentFuelType: string;
  boilerEfficiency: number;
  fuelInputKwh: number;
  cosyRate: number;
  optimisticScop: number;
  confidenceLabel: string;
  epcBand: string;
  isOilFuel: boolean;
  // Full transparency object
  transparency: SavingsTransparency;
}

// Floor area estimates by range (for manual entry)
const FLOOR_AREA_ESTIMATES: Record<string, number> = {
  '<80': 65,
  '80-120': 100,
  '120-160': 140,
  '160-220': 190,
  '220+': 250,
};

export function getFloorAreaFromRange(range: string): number {
  return FLOOR_AREA_ESTIMATES[range] || 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToNearest10(value: number): number {
  return Math.round(value / 10) * 10;
}

function getEpcBand(band?: string): string {
  if (!band) return 'D';
  const normalized = band.toUpperCase().charAt(0);
  if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(normalized)) {
    return normalized;
  }
  return 'D';
}

function getFuelType(fuel?: string): string {
  if (!fuel) return 'gas';
  const lower = fuel.toLowerCase();
  if (lower.includes('oil')) return 'oil';
  if (lower.includes('lpg') || lower.includes('bottled')) return 'lpg';
  if (lower.includes('electric')) return 'electric';
  return 'gas';
}

function getConfidenceLabel(epcBand: string, fuelType: string): string {
  if (fuelType === 'oil') {
    if (['F', 'G'].includes(epcBand)) {
      return 'Conservative estimate — survey may reveal design improvements';
    }
    return 'Balanced estimate — survey confirms final costs';
  }
  
  if (['A', 'B', 'C'].includes(epcBand)) {
    return 'High confidence estimate';
  } else if (['D', 'E'].includes(epcBand)) {
    return 'Moderate confidence';
  } else {
    return 'Conservative estimate — survey likely to improve result';
  }
}

/**
 * PHYSICALLY ACCURATE SAVINGS CALCULATOR
 * 
 * Model:
 * 1. Heat demand from EPC band (kWh/year)
 * 2. Current cost = Heat demand × Delivered fuel cost
 * 3. SCOP from EPC band (accounts for insulation)
 * 4. HP electricity = Heat demand / SCOP
 * 5. HP cost = HP kWh × blended tariff rate
 * 6. Savings = Current cost − HP cost
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  _scop: number // User-selected SCOP ignored - we use EPC-based SCOP
): SavingsCalculation & { transparency: SavingsTransparency } {
  // ============================================
  // Step 1: Heat demand from EPC band (includes space + DHW)
  // ============================================
  const totalHeatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  
  // For transparency, estimate space vs DHW split (typical 80/20)
  const dhwShare = 0.20;
  const spaceHeatDemand = totalHeatDemand * (1 - dhwShare);
  const dhwDemand = totalHeatDemand * dhwShare;

  // ============================================
  // Step 2: Current heating cost
  // Cost = Heat demand × Delivered fuel cost (p/kWh) / 100
  // ============================================
  const deliveredCostP = DELIVERED_HEAT_COST[fuelType] || DELIVERED_HEAT_COST['gas'];
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.82;
  
  // Current cost in £
  const currentCost = (totalHeatDemand * deliveredCostP) / 100;
  
  // For transparency: fuel input kWh (what you actually burn)
  const fuelKwh = totalHeatDemand / boilerEfficiency;

  // ============================================
  // Step 3: Heat pump SCOP from EPC band
  // ============================================
  const scopFromEpc = SCOP_BY_EPC[epcBand] || SCOP_BY_EPC['D'];

  // ============================================
  // Step 4: Heat pump electricity use
  // ============================================
  const hpKwh = totalHeatDemand / scopFromEpc;
  
  // For transparency breakdown
  const hpKwhSpace = spaceHeatDemand / scopFromEpc;
  const hpKwhDhw = dhwDemand / scopFromEpc;

  // ============================================
  // Step 5: Heat pump running cost (Cosy baseline)
  // Cosy with load-shifting: 60% at 12p, 25% at 24p, 15% at 38p = 18.9p blended
  // ============================================
  const hpCost = hpKwh * COSY_BLENDED_RATE;

  // ============================================
  // Step 6: Savings with guardrails
  // ============================================
  const rawSavingsBeforeClamp = currentCost - hpCost;
  let finalSavings = rawSavingsBeforeClamp;
  let savingsWasClamped = false;
  
  // Oil savings guardrail: max £500 unless oil price > 12p/kWh
  if (fuelType === 'oil' && deliveredCostP <= OIL_HIGH_PRICE_THRESHOLD) {
    if (finalSavings > OIL_SAVINGS_CAP) {
      finalSavings = OIL_SAVINGS_CAP;
      savingsWasClamped = true;
    }
  }
  
  // Allow negative savings (no floor)
  
  const estimatedSavings = roundToNearest10(finalSavings);
  
  // Flag high-sensitivity estimates
  const isHighSensitivity = fuelType === 'oil' && finalSavings > 400;

  return {
    heatDemand: totalHeatDemand,
    fuelKwh,
    currentCost,
    hpKwh,
    hpCost,
    rawSavings: rawSavingsBeforeClamp,
    estimatedSavings,
    boilerEfficiency,
    optimisticScop: scopFromEpc,
    transparency: {
      totalHeatDemand,
      spaceHeatDemand,
      dhwDemand,
      dhwShare,
      oilPricePerLitre: undefined, // Not using litre-based calc anymore
      oilLitresUsed: undefined,
      oilKwhPerLitre: undefined,
      baseScop: scopFromEpc,
      epcScopMultiplier: 1.0, // Not used in new model
      scopSpace: scopFromEpc,
      scopDhw: scopFromEpc,
      hpKwhSpace,
      hpKwhDhw,
      cosyOffpeakRate: COSY_OFFPEAK_RATE * 100,
      cosyMidRate: COSY_MID_RATE * 100,
      cosyPeakRate: COSY_PEAK_RATE * 100,
      cosyCheapShare: COSY_OFFPEAK_SHARE,
      cosyMidShare: COSY_MID_SHARE,
      cosyPeakShare: COSY_PEAK_SHARE,
      blendedRate: COSY_BLENDED_RATE * 100,
      isCosy: true, // This is the Cosy calculation path
      rawSavingsBeforeClamp,
      savingsWasClamped,
      isHighSensitivity,
    },
  };
}

export function calculateEstimate(
  inputs: EstimateInputs,
  assumptions: Assumptions
): EstimateResults {
  const epcBand = getEpcBand(inputs.epcBand);
  const fuelType = getFuelType(inputs.currentFuel);
  
  // ============================================
  // 1. Calculate base savings using Cosy model (always computed for baseline)
  // ============================================
  const cosySavings = calculateSavings(epcBand, fuelType, inputs.scop);
  
  const annualHeatKwh = cosySavings.heatDemand;
  const heatDemandSource: 'national_average' | 'epc' = 'national_average';
  
  // ============================================
  // 2. Check if we need to use a different tariff
  // ============================================
  let hpCost = cosySavings.hpCost;
  let estimatedSavings = cosySavings.estimatedSavings;
  let rawSavings = cosySavings.rawSavings;
  let transparency = { ...cosySavings.transparency };
  
  // Try to find matching tariff config using both supplier and name
  const tariffName = inputs.tariff?.name || '';
  const tariffSupplier = inputs.tariff?.supplier || '';
  const tariffConfig = getTariffConfig(tariffName, tariffSupplier);
  
  
  // Check if this is NOT Cosy
  const isCosy = tariffConfig?.isCosy ?? tariffName.toLowerCase().includes('cosy');
  
  if (tariffConfig && !isCosy) {
    // Build database tariff object for rate overrides
    const dbTariff: DatabaseTariff | undefined = inputs.tariff ? {
      peak_rate_p_per_kwh: inputs.tariff.peak_rate_p_per_kwh,
      offpeak_rate_p_per_kwh: inputs.tariff.offpeak_rate_p_per_kwh,
      offpeak_hours_per_day: inputs.tariff.offpeak_hours_per_day,
    } : undefined;
    
    // Calculate using the selected tariff with actual DB rates
    const tariffResult = calculateTariffCost(cosySavings.hpKwh, epcBand, tariffConfig, dbTariff);
    
    
    
    if (tariffResult) {
      hpCost = tariffResult.annualCost;
      const newRawSavings = cosySavings.currentCost - hpCost;
      
      // Apply oil savings guardrail: max £500 unless oil price > 12p/kWh
      let finalSavings = newRawSavings;
      let savingsWasClamped = false;
      if (fuelType === 'oil') {
        const deliveredCostP = DELIVERED_HEAT_COST['oil'];
        if (deliveredCostP <= OIL_HIGH_PRICE_THRESHOLD && finalSavings > OIL_SAVINGS_CAP) {
          finalSavings = OIL_SAVINGS_CAP;
          savingsWasClamped = true;
        }
      }
      
      estimatedSavings = roundToNearest10(finalSavings);
      rawSavings = newRawSavings;
      
      
      
      // Update transparency with non-Cosy tariff info
      transparency = {
        ...cosySavings.transparency,
        isCosy: false,
        blendedRate: tariffResult.blendedRateP,
        tariffCostResult: tariffResult,
        rawSavingsBeforeClamp: newRawSavings,
        savingsWasClamped,
        isHighSensitivity: fuelType === 'oil' && finalSavings > 800,
      };
    }
  }

  // ============================================
  // Heat loss calculation (for install sizing)
  // ============================================
  let heatLossKw = annualHeatKwh / (assumptions.full_load_hours || 2000);
  heatLossKw = clamp(heatLossKw, 3, 16);
  heatLossKw = Math.round(heatLossKw * 10) / 10;

  // ============================================
  // Install price by heat loss band
  // ============================================
  let installBase: number;
  if (heatLossKw <= 5) {
    installBase = assumptions.install_base_3_5kw;
  } else if (heatLossKw <= 8) {
    installBase = assumptions.install_base_5_8kw;
  } else if (heatLossKw <= 12) {
    installBase = assumptions.install_base_8_12kw;
  } else {
    installBase = assumptions.install_base_12_16kw;
  }

  // ============================================
  // Adders
  // ============================================
  const locationAdder = 
    inputs.locationAdder === '6m' ? assumptions.adder_location_6m :
    inputs.locationAdder === '9m' ? assumptions.adder_location_9m : 0;

  const cylinderAdder =
    inputs.cylinderOption === '150l' ? assumptions.adder_cylinder_150l :
    inputs.cylinderOption === '210l' ? assumptions.adder_cylinder_210l : 0;

  const radiatorsUpgraded = getRadiatorsForEfficiency(inputs.scop);
  const baseRadiators = assumptions.included_radiators;
  const extraRads = Math.max(0, radiatorsUpgraded - baseRadiators);
  const radiatorAdder = extraRads * assumptions.rad_upgrade_cost;
  
  const rawCustomerContribution = 
    assumptions.base_customer_contribution + 
    locationAdder + 
    cylinderAdder + 
    radiatorAdder;
  
  const customerContribution = Math.max(assumptions.min_customer_contribution, rawCustomerContribution);

  const adders = { location: locationAdder, cylinder: cylinderAdder, radiator: radiatorAdder };
  const grossInstallPrice = installBase + locationAdder + cylinderAdder;

  // ============================================
  // Grant eligibility
  // ============================================
  const eligibleFuels = ['gas', 'mains gas', 'oil', 'lpg', 'bottled gas'];
  const eligibleRegions = ['england', 'wales'];
  const fuelLower = inputs.currentFuel?.toLowerCase() || '';
  const regionLower = inputs.region?.toLowerCase() || 'england';
  
  const grantEligible = 
    eligibleFuels.some(f => fuelLower.includes(f)) &&
    eligibleRegions.some(r => regionLower.includes(r));

  const grantApplied = grantEligible ? assumptions.bus_grant_value : 0;
  const netInstallPrice = Math.max(0, grossInstallPrice - grantApplied);

  // Tariff details for storage
  let tariffId: string | undefined;
  let tariffPeakRate: number | undefined;
  let tariffOffpeakRate: number | undefined;
  
  if (inputs.tariff) {
    tariffId = inputs.tariff.id;
    tariffPeakRate = inputs.tariff.peak_rate_p_per_kwh;
    tariffOffpeakRate = inputs.tariff.offpeak_rate_p_per_kwh ?? inputs.tariff.peak_rate_p_per_kwh;
  }

  return {
    floorArea: inputs.floorArea,
    annualHeatKwh,
    heatLossKw,
    baselineCost: roundToNearest10(cosySavings.currentCost),
    hpElectricKwh: roundToNearest10(cosySavings.hpKwh),
    hpCost: roundToNearest10(hpCost),
    annualSavings: estimatedSavings,
    estimatedSavings,
    rawSavings: roundToNearest10(rawSavings),
    installBase,
    adders,
    grossInstallPrice,
    grantApplied,
    grantEligible,
    netInstallPrice,
    radiatorsUpgraded,
    extraRads,
    radiatorAdder,
    rawCustomerContribution,
    customerContribution,
    efficiencySelected: inputs.scop * 100,
    heatDemandSource,
    scopUsed: inputs.scop,
    isBestCase: false,
    tariffId,
    tariffPeakRate,
    tariffOffpeakRate,
    // Transparency fields
    currentFuelType: fuelType,
    boilerEfficiency: cosySavings.boilerEfficiency,
    fuelInputKwh: roundToNearest10(cosySavings.fuelKwh),
    cosyRate: transparency.blendedRate / 100,
    optimisticScop: cosySavings.optimisticScop,
    confidenceLabel: getConfidenceLabel(epcBand, fuelType),
    epcBand,
    isOilFuel: fuelType === 'oil',
    // Full transparency object
    transparency,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getFuelDisplayName(fuel: string): string {
  const names: Record<string, string> = {
    'gas': 'Mains gas',
    'mains gas': 'Mains gas',
    'oil': 'Heating oil',
    'lpg': 'LPG',
    'bottled gas': 'LPG',
    'electric': 'Direct electric',
    'electricity': 'Direct electric',
  };
  return names[fuel.toLowerCase()] || fuel;
}
