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
// Gas unchanged, Oil fixed with proper conversion + EPC uplift
// Cosy modelled with proper blended rate
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

// Oil demand uplift by EPC band (oil homes are larger/rural)
const OIL_DEMAND_UPLIFT: Record<string, number> = {
  'A': 1.0,
  'B': 1.0,
  'C': 1.0,
  'D': 1.10,  // +10%
  'E': 1.20,  // +20%
  'F': 1.35,  // +35%
  'G': 1.50,  // +50%
};

// Boiler efficiencies (slightly pessimistic, common stock)
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.82,  // DO NOT CHANGE
  'oil': 0.78,
  'lpg': 0.82,
  'electric': 1.00,
};

// Fuel prices
// Gas: £/kWh (DO NOT CHANGE)
const GAS_RATE = 0.0593; // £/kWh (Ofgem cap) - DO NOT CHANGE
// Standing charge ignored for savings (already sunk cost)

// LPG: £/kWh
const LPG_RATE = 0.105; // £/kWh

// Oil pricing (stored as pence per litre, converted properly)
// Oil price: £0.75 per litre (typical recent average)
// Energy content: 10 kWh per litre
// Oil boiler efficiency: 78%
// Effective cost = £0.75 ÷ (10 × 0.78) = £0.096 ≈ 9.6p per usable kWh
const OIL_PRICE_POUNDS_PER_LITRE = 0.75; // £0.75 per litre
const OIL_KWH_PER_LITRE = 10; // 10 kWh per litre (not 10.35)

// Cosy tariff structure (proper blended rate)
// Cheap windows: ~12p/kWh (8 hours/day)
// Standard: ~25p/kWh
// Peak: ~38p/kWh (4–7pm)
// Heat pump load distribution: 65% cheap, 25% standard, 10% peak
// Blended = (0.65 × 12) + (0.25 × 25) + (0.10 × 38) = 7.8 + 6.25 + 3.8 = 17.85p/kWh
const COSY_CHEAP_RATE = 0.12;    // 12p/kWh
const COSY_STANDARD_RATE = 0.25; // 25p/kWh
const COSY_PEAK_RATE = 0.38;     // 38p/kWh
const COSY_CHEAP_SHARE = 0.65;
const COSY_STANDARD_SHARE = 0.25;
const COSY_PEAK_SHARE = 0.10;
const COSY_EFFECTIVE_RATE = 
  (COSY_CHEAP_SHARE * COSY_CHEAP_RATE) + 
  (COSY_STANDARD_SHARE * COSY_STANDARD_RATE) + 
  (COSY_PEAK_SHARE * COSY_PEAK_RATE); // ≈ 0.178 (17.8p/kWh)

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
  oilPricePerLitre?: number;
  oilLitresUsed?: number;
  oilDemandUplift?: number;
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

export interface SavingsTransparency {
  oilPricePerLitre?: number;
  oilLitresUsed?: number;
  adjustedHeatDemand?: number;
  oilDemandUplift?: number;
}

/**
 * Calculate savings using balanced model
 * 
 * GAS (DO NOT CHANGE):
 * - Gas cost = Heat demand ÷ 0.82 × 5.93p
 * - Standing charge ignored (sunk cost)
 * 
 * OIL (FIXED):
 * - Oil price: £0.75 per litre
 * - Energy content: 10 kWh per litre
 * - Oil boiler efficiency: 78%
 * - Effective cost = £0.75 ÷ (10 × 0.78) = 9.6p per usable kWh
 * - Apply EPC demand uplift for oil homes (D: +10%, E: +20%, F: +35%, G: +50%)
 * 
 * HEAT PUMP:
 * - Electricity = Adjusted heat demand ÷ SCOP
 * - Electric cost = Electricity × 17.8p (Cosy blended rate)
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  scop: number
): SavingsCalculation & SavingsTransparency {
  // Step 1: Heat demand from EPC band (upper-mid quartile)
  const baseHeatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  
  // Apply oil demand uplift for oil homes (larger, rural properties)
  const oilDemandUplift = fuelType === 'oil' ? (OIL_DEMAND_UPLIFT[epcBand] || 1.0) : 1.0;
  const adjustedHeatDemand = baseHeatDemand * oilDemandUplift;
  
  // Step 2: Current heating cost
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.82;
  
  let currentCost: number;
  let oilPricePerLitre: number | undefined;
  let oilLitresUsed: number | undefined;
  
  if (fuelType === 'oil') {
    // Oil: Calculate using £/litre → kWh → usable heat
    // Fuel kWh needed (accounting for boiler efficiency)
    const fuelKwhNeeded = adjustedHeatDemand / boilerEfficiency;
    // Convert to litres
    oilLitresUsed = fuelKwhNeeded / OIL_KWH_PER_LITRE;
    oilPricePerLitre = OIL_PRICE_POUNDS_PER_LITRE;
    // Cost = litres × price per litre
    currentCost = oilLitresUsed * OIL_PRICE_POUNDS_PER_LITRE;
  } else if (fuelType === 'gas') {
    // Gas: DO NOT CHANGE
    // fuel_kWh = heat_demand / 0.82
    // cost = fuel_kWh × 0.0593 (standing charge ignored - sunk cost)
    const fuelKwh = adjustedHeatDemand / boilerEfficiency;
    currentCost = fuelKwh * GAS_RATE;
  } else if (fuelType === 'lpg') {
    // LPG: simple rate
    const fuelKwh = adjustedHeatDemand / boilerEfficiency;
    currentCost = fuelKwh * LPG_RATE;
  } else {
    // Default to gas calculation
    const fuelKwh = adjustedHeatDemand / boilerEfficiency;
    currentCost = fuelKwh * GAS_RATE;
  }
  
  // Fuel kWh for display (used in non-oil cases)
  const fuelKwh = adjustedHeatDemand / boilerEfficiency;
  
  // Step 3: Heat pump electricity use (balanced SCOP)
  const optimisticScop = SCOP_MAP[scop] || scop;
  const hpKwh = adjustedHeatDemand / optimisticScop;
  
  // Step 4: Heat pump running cost (17.8p/kWh Cosy blended rate)
  const hpCost = hpKwh * COSY_EFFECTIVE_RATE;
  
  // Step 5: Savings (no bias applied)
  const rawSavings = currentCost - hpCost;
  const estimatedSavings = roundToNearest10(rawSavings);
  
  return {
    heatDemand: adjustedHeatDemand,
    fuelKwh,
    currentCost,
    hpKwh,
    hpCost,
    rawSavings,
    estimatedSavings,
    boilerEfficiency,
    optimisticScop,
    oilPricePerLitre,
    oilLitresUsed,
    adjustedHeatDemand,
    oilDemandUplift,
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
    oilPricePerLitre: savings.oilPricePerLitre,
    oilLitresUsed: savings.oilLitresUsed ? Math.round(savings.oilLitresUsed) : undefined,
    oilDemandUplift: savings.oilDemandUplift,
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
