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
}

export interface EstimateInputs {
  floorArea: number;
  heatingCostCurrent?: number;
  currentFuel: string;
  propertyType?: string;
  region?: string;
  scop: number;
  tariff: 'cosy' | 'standard';
  locationAdder: 'included' | '6m' | '9m';
  cylinderOption: 'existing' | '150l' | '210l';
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
  adders: { location: number; cylinder: number };
  grossInstallPrice: number;
  grantApplied: number;
  grantEligible: boolean;
  netInstallPrice: number;
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
  let annualHeatKwh: number;
  let baselineCost: number;

  // Preferred path: Use heating cost from EPC if available
  if (inputs.heatingCostCurrent && inputs.heatingCostCurrent > 0) {
    baselineCost = inputs.heatingCostCurrent;
    annualHeatKwh = (baselineCost / assumptions.gas_rate) * assumptions.boiler_efficiency;
  } else {
    // Fallback: Use floor area × heat intensity
    const propertyType = inputs.propertyType?.toLowerCase() || 'default';
    const intensity = HEAT_INTENSITY[propertyType] || HEAT_INTENSITY.default;
    annualHeatKwh = inputs.floorArea * intensity;
    baselineCost = (annualHeatKwh / assumptions.boiler_efficiency) * assumptions.gas_rate;
  }

  // Heat loss calculation
  let heatLossKw = annualHeatKwh / assumptions.full_load_hours;
  heatLossKw = clamp(heatLossKw, 3, 16);
  heatLossKw = Math.round(heatLossKw * 10) / 10;

  // Heat pump electricity usage
  const hpElectricKwh = annualHeatKwh / inputs.scop;

  // Running cost based on tariff
  const rate = inputs.tariff === 'cosy' 
    ? assumptions.cosy_blended_rate 
    : assumptions.electricity_rate;
  const hpCost = hpElectricKwh * rate;

  // Savings calculation
  let annualSavings = baselineCost - hpCost;
  annualSavings = roundToNearest10(annualSavings);

  // Install price by heat loss band
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

  // Adders
  const locationAdder = 
    inputs.locationAdder === '6m' ? assumptions.adder_location_6m :
    inputs.locationAdder === '9m' ? assumptions.adder_location_9m : 0;

  const cylinderAdder =
    inputs.cylinderOption === '150l' ? assumptions.adder_cylinder_150l :
    inputs.cylinderOption === '210l' ? assumptions.adder_cylinder_210l : 0;

  const adders = { location: locationAdder, cylinder: cylinderAdder };
  const grossInstallPrice = installBase + locationAdder + cylinderAdder;

  // Grant eligibility: England/Wales and gas/oil/LPG
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
