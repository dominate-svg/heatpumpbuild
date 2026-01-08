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
  // Radiator contribution assumptions
  base_customer_contribution: number;
  included_radiators: number;
  rad_upgrade_cost: number;
  min_customer_contribution: number;
  // New savings engine assumptions
  heat_intensity_kwh_per_m2: number;
  boiler_efficiency_oil: number;
  hp_scop_default: number;
  hp_scop_min: number;
  hp_scop_max: number;
  hp_aux_factor: number;
  offpeak_share_default: number;
  offpeak_share_min: number;
  offpeak_share_max: number;
  oil_rate_p_per_kwh: number;
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
  spaceHeatingDemand?: number; // EPC space heating demand in kWh
}

export interface EstimateInputs {
  floorArea: number;
  heatingCostCurrent?: number;
  spaceHeatingDemand?: number;
  currentFuel: string;
  propertyType?: string;
  region?: string;
  scop: number;
  tariff: Tariff | null;
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
}

// Map efficiency (SCOP) to radiator count
export function getRadiatorsForEfficiency(scop: number): number {
  if (scop >= 4.0) return 11;
  if (scop >= 3.7) return 6;
  return 2; // 340% / SCOP 3.4 or lower
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
  // Radiator contribution fields
  radiatorsUpgraded: number;
  extraRads: number;
  radiatorAdder: number;
  rawCustomerContribution: number;
  customerContribution: number;
  efficiencySelected: number;
  // Transparency fields for "How we calculated this"
  heatDemandSource: 'epc' | 'floor_area';
  scopUsed: number;
  offpeakShareUsed: number;
  weightedRate: number;
  isBestCase: boolean;
  // Tariff details for storage
  tariffId?: string;
  tariffPeakRate?: number;
  tariffOffpeakRate?: number;
}

// Default heat intensity by property type (kWh/m²/year)
const HEAT_INTENSITY: Record<string, number> = {
  flat: 90,
  terrace: 110,
  'semi-detached': 120,
  detached: 140,
  default: 120,
};

// Floor area estimates by range
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

export function calculateEstimate(
  inputs: EstimateInputs,
  assumptions: Assumptions
): EstimateResults {
  // ============================================
  // 3.1 Heat demand (kWh heat)
  // ============================================
  let annualHeatKwh: number;
  let heatDemandSource: 'epc' | 'floor_area';

  if (inputs.spaceHeatingDemand && inputs.spaceHeatingDemand > 0) {
    // Prefer EPC space heating demand if available
    annualHeatKwh = inputs.spaceHeatingDemand;
    heatDemandSource = 'epc';
  } else {
    // Fallback: floor area × heat intensity
    const intensity = assumptions.heat_intensity_kwh_per_m2 || 110;
    annualHeatKwh = inputs.floorArea * intensity;
    heatDemandSource = 'floor_area';
  }

  // ============================================
  // 3.2 Current annual cost baseline
  // ============================================
  let baselineCost: number;
  const fuelType = (inputs.currentFuel || 'gas').toLowerCase();

  if (inputs.heatingCostCurrent && inputs.heatingCostCurrent > 0) {
    // Prefer EPC current heating cost if available
    baselineCost = inputs.heatingCostCurrent;
  } else {
    // Calculate from fuel type and heat demand
    const gasRate = (assumptions.gas_rate || 7) / 100; // convert p to £
    const oilRate = (assumptions.oil_rate_p_per_kwh || 10) / 100;
    const electricRate = (assumptions.electricity_rate || 28) / 100;
    const boilerEffGas = assumptions.boiler_efficiency || 0.88;
    const boilerEffOil = assumptions.boiler_efficiency_oil || 0.85;

    if (fuelType.includes('oil')) {
      const fuelInputKwh = annualHeatKwh / boilerEffOil;
      baselineCost = fuelInputKwh * oilRate;
    } else if (fuelType.includes('electric')) {
      baselineCost = annualHeatKwh * electricRate;
    } else {
      // Default to gas/LPG model
      const fuelInputKwh = annualHeatKwh / boilerEffGas;
      baselineCost = fuelInputKwh * gasRate;
    }
  }

  // ============================================
  // 3.3 Heat pump electricity use
  // ============================================
  const scopMin = assumptions.hp_scop_min || 2.8;
  const scopMax = assumptions.hp_scop_max || 3.6;
  const scopUsed = clamp(inputs.scop, scopMin, scopMax);
  const auxFactor = assumptions.hp_aux_factor || 1.05;
  
  const hpElectricKwh = (annualHeatKwh / scopUsed) * auxFactor;

  // ============================================
  // 3.4 Weighted tariff rate
  // ============================================
  let weightedRate: number;
  let offpeakShareUsed = 0;
  let tariffId: string | undefined;
  let tariffPeakRate: number | undefined;
  let tariffOffpeakRate: number | undefined;

  if (inputs.tariff) {
    const tariff = inputs.tariff;
    tariffId = tariff.id;
    tariffPeakRate = tariff.peak_rate_p_per_kwh;
    tariffOffpeakRate = tariff.offpeak_rate_p_per_kwh ?? tariff.peak_rate_p_per_kwh;

    const hasOffpeak = tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null;

    if (hasOffpeak) {
      const offpeakDefault = assumptions.offpeak_share_default || 0.55;
      const offpeakMin = assumptions.offpeak_share_min || 0.30;
      const offpeakMax = assumptions.offpeak_share_max || 0.70;
      offpeakShareUsed = clamp(offpeakDefault, offpeakMin, offpeakMax);

      const peakRatePounds = tariff.peak_rate_p_per_kwh / 100;
      const offpeakRatePounds = (tariff.offpeak_rate_p_per_kwh ?? tariff.peak_rate_p_per_kwh) / 100;
      
      weightedRate = (offpeakShareUsed * offpeakRatePounds) + ((1 - offpeakShareUsed) * peakRatePounds);
    } else {
      weightedRate = tariff.peak_rate_p_per_kwh / 100;
    }
  } else {
    // Fallback if no tariff selected
    weightedRate = (assumptions.electricity_rate || 28) / 100;
  }

  // ============================================
  // 3.5 Heat pump running cost and savings
  // ============================================
  const hpCost = hpElectricKwh * weightedRate;
  let annualSavings = Math.max(baselineCost - hpCost, 0);
  annualSavings = roundToNearest10(annualSavings);

  // Best-case scenario flag: if savings > 40% of current cost
  const isBestCase = annualSavings > 0.4 * baselineCost;

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

  // Radiator calculation based on efficiency selection
  const radiatorsUpgraded = getRadiatorsForEfficiency(inputs.scop);
  const baseRadiators = assumptions.included_radiators; // 2
  const extraRads = Math.max(0, radiatorsUpgraded - baseRadiators);
  const radiatorAdder = extraRads * assumptions.rad_upgrade_cost;
  
  // Customer contribution calculation
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

  return {
    floorArea: inputs.floorArea,
    annualHeatKwh: roundToNearest10(annualHeatKwh),
    heatLossKw,
    baselineCost: roundToNearest10(baselineCost),
    hpElectricKwh: roundToNearest10(hpElectricKwh),
    hpCost: roundToNearest10(hpCost),
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
    // Transparency fields
    heatDemandSource,
    scopUsed,
    offpeakShareUsed,
    weightedRate,
    isBestCase,
    tariffId,
    tariffPeakRate,
    tariffOffpeakRate,
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
