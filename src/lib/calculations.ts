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
// OPTIMISTIC SAVINGS CALCULATOR CONFIG
// Upper-quartile homes, older boilers, best-case Cosy performance
// ============================================

// Heat demand by EPC band (kWh/year) - upper quartile homes
const HEAT_DEMAND_BY_EPC: Record<string, number> = {
  'A': 7000,
  'B': 9000,
  'C': 12000,
  'D': 15000,
  'E': 18000,
  'F': 21000,
  'G': 24000,
};

// Boiler efficiencies (older stock assumptions)
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.80,
  'oil': 0.75,
  'lpg': 0.80,
  'electric': 1.00,
};

// Fuel prices (£/kWh) - Ofgem cap, no standing charges
const FUEL_RATES: Record<string, number> = {
  'gas': 0.0593,
  'oil': 0.10,
  'lpg': 0.11,
  'electric': 0.2769,
};

// Cosy tariff - best-case smart shifting (75% cheap)
const COSY_CHEAP_SHARE = 0.75;
const COSY_CHEAP_RATE = 0.12;
const COSY_STANDARD_RATE = 0.2769;
const COSY_EFFECTIVE_RATE = (COSY_CHEAP_SHARE * COSY_CHEAP_RATE) + ((1 - COSY_CHEAP_SHARE) * COSY_STANDARD_RATE);

// Optimistic SCOP mapping (well-designed system)
const SCOP_MAP: Record<number, number> = {
  3.4: 3.6,
  3.7: 3.9,
  4.0: 4.2,
};

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

// Get fuel unit rate in £/kWh (no standing charges for clarity)
function getFuelRate(fuelType: string): number {
  return FUEL_RATES[fuelType] || FUEL_RATES['gas'];
}

/**
 * Calculate savings using the optimistic model
 * 
 * Step 1: heat_demand = lookup(EPC_band) - upper quartile
 * Step 2: fuel_kWh = heat_demand / boiler_efficiency (older stock)
 *         current_cost = fuel_kWh × fuel_unit_rate (no standing charges)
 * Step 3: hp_kWh = heat_demand / SCOP (optimistic mapping)
 * Step 4: hp_cost = hp_kWh × cosy_effective_rate (75% cheap)
 * Step 5: estimated_savings = current_cost − hp_cost (rounded to nearest 10)
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  scop: number
): SavingsCalculation {
  // Step 1: Heat demand from EPC band (upper quartile)
  const heatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  
  // Step 2: Current heating cost (older boiler stock, no standing charges)
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.80;
  const fuelKwh = heatDemand / boilerEfficiency;
  const fuelRate = getFuelRate(fuelType);
  const currentCost = fuelKwh * fuelRate;
  
  // Step 3: Heat pump electricity use (optimistic SCOP)
  const optimisticScop = SCOP_MAP[scop] || scop;
  const hpKwh = heatDemand / optimisticScop;
  
  // Step 4: Heat pump running cost (best-case Cosy performance)
  const hpCost = hpKwh * COSY_EFFECTIVE_RATE;
  
  // Step 5: Savings (no conservative reduction)
  const rawSavings = currentCost - hpCost;
  const estimatedSavings = roundToNearest10(rawSavings);
  
  return {
    heatDemand,
    fuelKwh,
    currentCost,
    hpKwh,
    hpCost,
    rawSavings,
    estimatedSavings,
    boilerEfficiency,
    optimisticScop,
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
    cosyRate: COSY_EFFECTIVE_RATE,
    optimisticScop: savings.optimisticScop,
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
