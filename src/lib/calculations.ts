import type { Tariff } from '@/hooks/useTariffs';

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
// CONSERVATIVE SAVINGS CALCULATOR CONFIG
// Based on national averages and Ofgem cap pricing
// ============================================

// National average heat demand by EPC band (kWh/year)
const HEAT_DEMAND_BY_EPC: Record<string, number> = {
  'A': 6000,
  'B': 8000,
  'C': 10000,
  'D': 12000,
  'E': 14000,
  'F': 17000,
  'G': 20000,
};

// Boiler efficiencies
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.85,
  'oil': 0.80,
  'lpg': 0.85,
  'electric': 1.00,
};

// Ofgem cap tariffs (£/kWh and £/day)
const OFGEM_RATES = {
  gas_unit: 0.0593,
  gas_standing: 0.3509,
  electric_unit: 0.2769,
  electric_standing: 0.5475,
};

// Cosy tariff assumption
// 60% cheap rate (£0.12), 40% standard rate (£0.2769)
const COSY_CHEAP_SHARE = 0.60;
const COSY_CHEAP_RATE = 0.12;
const COSY_STANDARD_RATE = 0.2769;
const COSY_WEIGHTED_RATE = (COSY_CHEAP_SHARE * COSY_CHEAP_RATE) + ((1 - COSY_CHEAP_SHARE) * COSY_STANDARD_RATE);

// Oil and LPG rates (£/kWh)
const OIL_RATE = 0.0586; // ~60.63p/litre ÷ 10.35 kWh/litre
const LPG_RATE = 0.122;

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
  confidenceLabel: string;
  epcBand: string;
  isOilFuel: boolean;
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

function getConfidenceLabel(epcBand: string): string {
  if (['A', 'B', 'C'].includes(epcBand)) {
    return 'High confidence estimate';
  } else if (['D', 'E'].includes(epcBand)) {
    return 'Moderate confidence';
  } else {
    return 'Conservative estimate — survey likely to improve result';
  }
}

// Get fuel unit rate in £/kWh
function getFuelRate(fuelType: string): number {
  switch (fuelType) {
    case 'gas': return OFGEM_RATES.gas_unit;
    case 'oil': return OIL_RATE;
    case 'lpg': return LPG_RATE;
    case 'electric': return OFGEM_RATES.electric_unit;
    default: return OFGEM_RATES.gas_unit;
  }
}

// Get standing charge per day in £
function getStandingCharge(fuelType: string): number {
  switch (fuelType) {
    case 'gas': return OFGEM_RATES.gas_standing;
    case 'electric': return OFGEM_RATES.electric_standing;
    // Oil and LPG typically don't have standing charges
    default: return 0;
  }
}

/**
 * Calculate savings using the simplified national average model
 * 
 * Step 1: heat_demand = lookup(EPC_band)
 * Step 2: fuel_kWh = heat_demand / boiler_efficiency
 *         current_cost = fuel_kWh × fuel_unit_rate + (fuel_standing × 365)
 * Step 3: hp_kWh = heat_demand / SCOP
 * Step 4: hp_cost = hp_kWh × cosy_rate + (electric_standing × 365)
 * Step 5: raw_savings = current_cost − hp_cost
 *         estimated_savings = raw_savings × 0.9 (rounded to nearest 10)
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  scop: number
): SavingsCalculation {
  // Step 1: Heat demand from EPC band
  const heatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  
  // Step 2: Current heating cost
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.85;
  const fuelKwh = heatDemand / boilerEfficiency;
  const fuelRate = getFuelRate(fuelType);
  const fuelStanding = getStandingCharge(fuelType);
  const currentCost = (fuelKwh * fuelRate) + (fuelStanding * 365);
  
  // Step 3: Heat pump electricity use
  const hpKwh = heatDemand / scop;
  
  // Step 4: Heat pump annual cost
  const hpCost = (hpKwh * COSY_WEIGHTED_RATE) + (OFGEM_RATES.electric_standing * 365);
  
  // Step 5: Savings with conservative bias
  const rawSavings = currentCost - hpCost;
  let estimatedSavings = rawSavings * 0.9; // 10% conservative reduction
  estimatedSavings = roundToNearest10(estimatedSavings);
  
  return {
    heatDemand,
    fuelKwh,
    currentCost,
    hpKwh,
    hpCost,
    rawSavings,
    estimatedSavings,
    boilerEfficiency,
  };
}

export function calculateEstimate(
  inputs: EstimateInputs,
  assumptions: Assumptions
): EstimateResults {
  const epcBand = getEpcBand(inputs.epcBand);
  const fuelType = getFuelType(inputs.currentFuel);
  
  // ============================================
  // 1. Calculate savings using simplified model
  // ============================================
  const savings = calculateSavings(epcBand, fuelType, inputs.scop);
  
  const annualHeatKwh = savings.heatDemand;
  const heatDemandSource: 'national_average' | 'epc' = 'national_average';

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
    baselineCost: roundToNearest10(savings.currentCost),
    hpElectricKwh: roundToNearest10(savings.hpKwh),
    hpCost: roundToNearest10(savings.hpCost),
    annualSavings: savings.estimatedSavings,
    estimatedSavings: savings.estimatedSavings,
    rawSavings: roundToNearest10(savings.rawSavings),
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
    boilerEfficiency: savings.boilerEfficiency,
    fuelInputKwh: roundToNearest10(savings.fuelKwh),
    cosyRate: COSY_WEIGHTED_RATE,
    confidenceLabel: getConfidenceLabel(epcBand),
    epcBand,
    isOilFuel: fuelType === 'oil',
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
    'oil': 'Heating oil',
    'lpg': 'LPG',
    'electric': 'Direct electric',
  };
  return names[fuel] || fuel;
}
