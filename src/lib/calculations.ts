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
// BALANCED SAVINGS CALCULATOR CONFIG
// Upper-mid quartile homes, typical boilers, reasonable Cosy performance
// ============================================

// Heat demand by EPC band (kWh/year) - upper-mid quartile
const HEAT_DEMAND_BY_EPC: Record<string, number> = {
  'A': 6500,
  'B': 8500,
  'C': 11000,
  'D': 13500,
  'E': 16000,
  'F': 19000,
  'G': 22000,
};

// Boiler efficiencies (slightly pessimistic, common stock)
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.82,
  'oil': 0.78,
  'lpg': 0.82,
  'electric': 1.00,
};

// Fuel prices
// Gas, LPG, Electric: £/kWh
// Oil: pence per litre (converted using 10.35 kWh/litre)
const GAS_RATE = 0.0593; // £/kWh (Ofgem cap)
const GAS_STANDING_CHARGE = 0.3509; // £/day
const LPG_RATE = 0.105; // £/kWh
const ELECTRIC_RATE = 0.2769; // £/kWh
const ELECTRIC_STANDING_CHARGE = 0.5475; // £/day

// Oil pricing (stored as pence per litre, converted properly)
const OIL_PENCE_PER_LITRE = 65; // Default oil price in pence per litre
const OIL_KWH_PER_LITRE = 10.35; // Energy content of heating oil

// Cosy tariff - reasonable shifting (65% cheap)
const COSY_CHEAP_SHARE = 0.65;
const COSY_CHEAP_RATE = 0.12;
const COSY_PEAK_RATE = 0.2769;
const COSY_EFFECTIVE_RATE = (COSY_CHEAP_SHARE * COSY_CHEAP_RATE) + ((1 - COSY_CHEAP_SHARE) * COSY_PEAK_RATE);

// Balanced SCOP mapping (good design)
const SCOP_MAP: Record<number, number> = {
  3.4: 3.5,
  3.7: 3.8,
  4.0: 4.1,
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
  // Oil-specific transparency
  oilPencePerLitre?: number;
  oilLitresUsed?: number;
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

// Get oil cost in £ for a given number of litres
function calculateOilCost(litres: number): number {
  return litres * (OIL_PENCE_PER_LITRE / 100);
}

export interface SavingsTransparency {
  oilPencePerLitre?: number;
  oilLitresUsed?: number;
}

/**
 * Calculate savings using balanced model with correct oil pricing
 * 
 * Step 1: heat_demand = lookup(EPC_band) - upper-mid quartile
 * Step 2: Calculate baseline cost:
 *         - Gas: fuel_kWh = heat_demand / 0.82, cost = (fuel_kWh × 0.0593) + (standing × 365)
 *         - Oil: fuel_kWh = heat_demand / 0.78, litres = fuel_kWh / 10.35, cost = litres × (p_per_litre / 100)
 *         - LPG: fuel_kWh = heat_demand / 0.82, cost = fuel_kWh × 0.105
 * Step 3: hp_kWh = heat_demand / SCOP
 * Step 4: hp_cost = hp_kWh × 0.173 (Cosy effective rate)
 * Step 5: estimated_savings = current_cost − hp_cost (rounded to nearest 10)
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  scop: number
): SavingsCalculation & SavingsTransparency {
  // Step 1: Heat demand from EPC band (upper-mid quartile)
  const heatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  
  // Step 2: Current heating cost
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.82;
  const fuelKwh = heatDemand / boilerEfficiency;
  
  let currentCost: number;
  let oilPencePerLitre: number | undefined;
  let oilLitresUsed: number | undefined;
  
  if (fuelType === 'oil') {
    // Oil: convert fuel kWh to litres, then calculate cost from p/litre
    oilLitresUsed = fuelKwh / OIL_KWH_PER_LITRE;
    oilPencePerLitre = OIL_PENCE_PER_LITRE;
    currentCost = calculateOilCost(oilLitresUsed);
  } else if (fuelType === 'gas') {
    // Gas: include standing charge for comparison
    currentCost = (fuelKwh * GAS_RATE) + (GAS_STANDING_CHARGE * 365);
  } else if (fuelType === 'lpg') {
    // LPG: simple rate
    currentCost = fuelKwh * LPG_RATE;
  } else {
    // Default to gas calculation
    currentCost = (fuelKwh * GAS_RATE) + (GAS_STANDING_CHARGE * 365);
  }
  
  // Step 3: Heat pump electricity use (balanced SCOP)
  const optimisticScop = SCOP_MAP[scop] || scop;
  const hpKwh = heatDemand / optimisticScop;
  
  // Step 4: Heat pump running cost (65% cheap Cosy performance)
  const hpCost = hpKwh * COSY_EFFECTIVE_RATE;
  
  // Step 5: Savings (no bias applied)
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
    oilPencePerLitre,
    oilLitresUsed,
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
    // Oil-specific transparency
    oilPencePerLitre: savings.oilPencePerLitre,
    oilLitresUsed: savings.oilLitresUsed ? Math.round(savings.oilLitresUsed) : undefined,
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
