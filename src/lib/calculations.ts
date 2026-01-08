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
// All values are defensible and conservative
// ============================================

// National average useful heat demand by EPC band (kWh/year)
// Source: Government/industry averages for typical UK homes
// These represent space + hot water combined useful heat
const NATIONAL_HEAT_DEMAND: Record<string, number> = {
  'A': 6000,
  'B': 8000,
  'C': 10000,
  'D': 12500,
  'E': 15000,
  'F': 17500,
  'G': 20000,
};

// DHW share by EPC band (worse insulation = higher DHW share of total)
const DHW_SHARE: Record<string, number> = {
  'A': 0.15,
  'B': 0.15,
  'C': 0.15,
  'D': 0.18,
  'E': 0.18,
  'F': 0.20,
  'G': 0.20,
};

// Fixed DHW SCOP (lower than space heating due to higher temps)
const DHW_SCOP = 2.2;

// EPC derate factors for space heating SCOP
// Worse insulation = harder to achieve rated SCOP
const EPC_DERATE: Record<string, number> = {
  'A': 1.00,
  'B': 1.00,
  'C': 0.95,
  'D': 0.90,
  'E': 0.85,
  'F': 0.78,
  'G': 0.72,
};

// Fuel unit rates (£/kWh) - conservative
const FUEL_UNIT_RATES: Record<string, number> = {
  'gas': 0.07,
  'oil': 0.105,
  'lpg': 0.12,
  'electric': 0.28,
};

// Boiler efficiencies - realistic for typical UK stock
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.90,
  'oil': 0.78,
  'lpg': 0.85,
  'electric': 1.00,
};

// Base cheap share by efficiency level
const BASE_CHEAP_SHARE: Record<number, number> = {
  3.4: 0.45,
  3.7: 0.55,
  4.0: 0.65,
};

// Map efficiency (SCOP) to radiator count
export function getRadiatorsForEfficiency(scop: number): number {
  if (scop >= 4.0) return 11;
  if (scop >= 3.7) return 6;
  return 2;
}

export interface SavingsResult {
  currentCost: number;
  hpCost: number;
  savings: number;
  hpElectricKwh: number;
  fuelInputKwh: number;
  spaceHeatKwh: number;
  dhwHeatKwh: number;
  spaceScopAdj: number;
  cheapShareUsed: number;
  effectiveRate: number;
}

export interface EstimateResults {
  floorArea: number;
  annualHeatKwh: number;
  heatLossKw: number;
  baselineCost: number;
  hpElectricKwh: number;
  hpCost: number;
  annualSavings: number;
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
  scopAdjusted: number;
  offpeakShareUsed: number;
  weightedRate: number;
  isBestCase: boolean;
  tariffId?: string;
  tariffPeakRate?: number;
  tariffOffpeakRate?: number;
  // New detailed fields
  currentFuelType: string;
  boilerEfficiency: number;
  fuelInputKwh: number;
  spaceHeatKwh: number;
  dhwHeatKwh: number;
  dhwScop: number;
  epcDerateApplied: number;
  savingsCouldIncrease: boolean;
  confidenceLabel: string;
  epcBand: string;
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

function calculateSavings(
  usefulHeat: number,
  epcBand: string,
  fuelType: string,
  selectedScop: number,
  tariff: Tariff | null,
  assumptions: Assumptions
): SavingsResult {
  // 1. Split into space heat + hot water
  const dhwShare = DHW_SHARE[epcBand] || 0.18;
  const dhwHeatKwh = usefulHeat * dhwShare;
  const spaceHeatKwh = usefulHeat - dhwHeatKwh;

  // 2. Adjust space SCOP for EPC band
  const epcDerate = EPC_DERATE[epcBand] || 0.90;
  const spaceScopAdj = selectedScop * epcDerate;

  // 3. Calculate heat pump electricity demand
  const spaceElecKwh = spaceHeatKwh / spaceScopAdj;
  const dhwElecKwh = dhwHeatKwh / DHW_SCOP;
  const hpElectricKwh = spaceElecKwh + dhwElecKwh;

  // 4. Calculate current system cost
  const boilerEff = BOILER_EFFICIENCY[fuelType] || 0.90;
  const fuelInputKwh = usefulHeat / boilerEff;
  const fuelRate = FUEL_UNIT_RATES[fuelType] || 0.07;
  const currentCost = fuelInputKwh * fuelRate;

  // 5. Calculate effective electricity rate with cheap share
  let baseShare = BASE_CHEAP_SHARE[selectedScop] || 0.45;
  
  // Apply EPC penalty to cheap share
  if (epcBand === 'E') {
    baseShare -= 0.05;
  } else if (['F', 'G'].includes(epcBand)) {
    baseShare -= 0.10;
  }
  
  // Clamp cheap share
  const cheapShareUsed = clamp(baseShare, 0.25, 0.70);

  let effectiveRate: number;
  if (tariff && tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null) {
    const peakRate = tariff.peak_rate_p_per_kwh / 100;
    const offpeakRate = tariff.offpeak_rate_p_per_kwh / 100;
    effectiveRate = (cheapShareUsed * offpeakRate) + ((1 - cheapShareUsed) * peakRate);
  } else if (tariff) {
    effectiveRate = tariff.peak_rate_p_per_kwh / 100;
  } else {
    effectiveRate = (assumptions.electricity_rate || 28) / 100;
  }

  // 6. Calculate heat pump cost
  const hpCost = hpElectricKwh * effectiveRate;

  // 7. Calculate savings
  const savings = currentCost - hpCost;

  return {
    currentCost,
    hpCost,
    savings,
    hpElectricKwh,
    fuelInputKwh,
    spaceHeatKwh,
    dhwHeatKwh,
    spaceScopAdj,
    cheapShareUsed,
    effectiveRate,
  };
}

export function calculateEstimate(
  inputs: EstimateInputs,
  assumptions: Assumptions
): EstimateResults {
  const epcBand = getEpcBand(inputs.epcBand);
  const fuelType = getFuelType(inputs.currentFuel);
  
  // ============================================
  // 1. Determine annual useful heat demand
  // Use national average by EPC band
  // ============================================
  const annualHeatKwh = NATIONAL_HEAT_DEMAND[epcBand] || 12500;
  const heatDemandSource: 'national_average' | 'epc' = 'national_average';

  // ============================================
  // 2. Calculate savings using conservative model
  // ============================================
  const savingsResult = calculateSavings(
    annualHeatKwh,
    epcBand,
    fuelType,
    inputs.scop,
    inputs.tariff,
    assumptions
  );

  const annualSavings = roundToNearest10(savingsResult.savings);
  const baselineCost = roundToNearest10(savingsResult.currentCost);
  const hpCost = roundToNearest10(savingsResult.hpCost);
  const hpElectricKwh = roundToNearest10(savingsResult.hpElectricKwh);
  const savingsCouldIncrease = annualSavings < 0;

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
    baselineCost,
    hpElectricKwh,
    hpCost,
    annualSavings,
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
    scopAdjusted: savingsResult.spaceScopAdj,
    offpeakShareUsed: savingsResult.cheapShareUsed,
    weightedRate: savingsResult.effectiveRate,
    isBestCase: false,
    tariffId,
    tariffPeakRate,
    tariffOffpeakRate,
    // Detailed transparency fields
    currentFuelType: fuelType,
    boilerEfficiency: BOILER_EFFICIENCY[fuelType] || 0.90,
    fuelInputKwh: roundToNearest10(savingsResult.fuelInputKwh),
    spaceHeatKwh: roundToNearest10(savingsResult.spaceHeatKwh),
    dhwHeatKwh: roundToNearest10(savingsResult.dhwHeatKwh),
    dhwScop: DHW_SCOP,
    epcDerateApplied: EPC_DERATE[epcBand] || 0.90,
    savingsCouldIncrease,
    confidenceLabel: getConfidenceLabel(epcBand),
    epcBand,
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
