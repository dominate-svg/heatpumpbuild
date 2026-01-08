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
  // Fuel rates
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
  epcBand?: string; // A, B, C, D, E, F, G
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
  userProvidedAnnualCost?: number; // User override for current heating cost
}

// Map efficiency (SCOP) to radiator count
export function getRadiatorsForEfficiency(scop: number): number {
  if (scop >= 4.0) return 11;
  if (scop >= 3.7) return 6;
  return 2; // 340% / SCOP 3.4 or lower
}

export interface SavingsScenario {
  savings: number;
  hpCost: number;
  scopUsed: number;
  cheapShareUsed: number;
  label: 'worst' | 'typical' | 'best';
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
  // Transparency fields
  heatDemandSource: 'epc' | 'floor_area';
  scopUsed: number;
  scopAdjusted: number;
  offpeakShareUsed: number;
  weightedRate: number;
  isBestCase: boolean;
  // Tariff details for storage
  tariffId?: string;
  tariffPeakRate?: number;
  tariffOffpeakRate?: number;
  // New: savings range
  savingsRange: {
    worst: SavingsScenario;
    typical: SavingsScenario;
    best: SavingsScenario;
  };
  // New: fuel type info
  currentFuelType: string;
  boilerEfficiency: number;
  // New: whether savings were clamped
  savingsClamped: boolean;
  savingsCouldIncrease: boolean;
}

// Heat intensity by EPC band (kWh/m²/year)
const HEAT_INTENSITY_BY_EPC: Record<string, number> = {
  'A': 70,
  'B': 70,
  'C': 95,
  'D': 125,
  'E': 160,
  'F': 200,
  'G': 200,
};

// SCOP derate factor by EPC band (worse insulation = harder to achieve rated SCOP)
const SCOP_DERATE_BY_EPC: Record<string, number> = {
  'A': 1.00,
  'B': 1.00,
  'C': 0.95,
  'D': 0.90,
  'E': 0.85,
  'F': 0.80,
  'G': 0.80,
};

// Cheap share caps by efficiency level
const CHEAP_SHARE_CAPS: Record<number, number> = {
  3.4: 0.45,
  3.7: 0.55,
  4.0: 0.65,
};

// Boiler efficiency by fuel type
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.82,
  'mains gas': 0.82,
  'oil': 0.80,
  'lpg': 0.80,
  'bottled gas': 0.80,
  'electric': 1.00,
  'electricity': 1.00,
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

function getEpcBand(band?: string): string {
  if (!band) return 'D'; // Default assumption
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

function getBoilerEfficiency(fuelType: string): number {
  return BOILER_EFFICIENCY[fuelType] || 0.82;
}

function getFuelRate(fuelType: string, assumptions: Assumptions): number {
  switch (fuelType) {
    case 'oil':
      return (assumptions.oil_rate_p_per_kwh || 8) / 100;
    case 'lpg':
      return (assumptions.lpg_rate_p_per_kwh || assumptions.oil_rate_p_per_kwh || 12) / 100;
    case 'electric':
      return (assumptions.electricity_rate || 28) / 100;
    default: // gas
      return (assumptions.gas_rate || 7) / 100;
  }
}

function calculateSavingsScenario(
  heatDemandKwh: number,
  baselineCost: number,
  baseSCOP: number,
  epcBand: string,
  tariff: Tariff | null,
  assumptions: Assumptions,
  scopMultiplier: number, // 1.0 for typical, 1.1 for best, 0.9 for worst
  cheapShareMultiplier: number, // 1.0 for typical, 1.1 for best, 0.9 for worst
  fuelType: string,
  label: 'worst' | 'typical' | 'best'
): SavingsScenario {
  // Apply SCOP derate by EPC band
  const derateFactor = SCOP_DERATE_BY_EPC[epcBand] || 0.90;
  const adjustedSCOP = baseSCOP * derateFactor * scopMultiplier;
  const scopUsed = clamp(adjustedSCOP, 2.5, 5.0);
  
  // Calculate HP electricity use
  const hpElectricKwh = heatDemandKwh / scopUsed;
  
  // Get cheap share cap for this efficiency level
  const cheapShareCap = CHEAP_SHARE_CAPS[baseSCOP] || 0.45;
  
  // Calculate effective electricity rate
  let effectiveRate: number;
  let cheapShareUsed = 0;
  
  if (tariff) {
    const hasOffpeak = tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null;
    
    if (hasOffpeak) {
      // Apply cheap share with cap and multiplier
      const baseShare = cheapShareCap * cheapShareMultiplier;
      cheapShareUsed = clamp(baseShare, 0, 0.80); // Never exceed 80%
      
      const peakRate = tariff.peak_rate_p_per_kwh / 100;
      const offpeakRate = (tariff.offpeak_rate_p_per_kwh ?? tariff.peak_rate_p_per_kwh) / 100;
      
      effectiveRate = (cheapShareUsed * offpeakRate) + ((1 - cheapShareUsed) * peakRate);
    } else {
      effectiveRate = tariff.peak_rate_p_per_kwh / 100;
    }
  } else {
    effectiveRate = (assumptions.electricity_rate || 28) / 100;
  }
  
  // Calculate HP running cost
  const hpCost = hpElectricKwh * effectiveRate;
  
  // Calculate raw savings
  let savings = baselineCost - hpCost;
  
  // Apply sanity bounds for mains gas only
  if (fuelType === 'gas') {
    const maxSavings = baselineCost * 0.35;
    const minSavings = baselineCost * -0.15;
    savings = clamp(savings, minSavings, maxSavings);
  }
  // Oil/LPG can have higher savings - no clamping
  
  return {
    savings: roundToNearest10(savings),
    hpCost: roundToNearest10(hpCost),
    scopUsed,
    cheapShareUsed,
    label,
  };
}

export function calculateEstimate(
  inputs: EstimateInputs,
  assumptions: Assumptions
): EstimateResults {
  const epcBand = getEpcBand(inputs.epcBand);
  const fuelType = getFuelType(inputs.currentFuel);
  const boilerEfficiency = getBoilerEfficiency(fuelType);
  
  // ============================================
  // 1. Determine annual useful heat demand (kWh heat)
  // ============================================
  let annualHeatKwh: number;
  let heatDemandSource: 'epc' | 'floor_area';

  if (inputs.spaceHeatingDemand && inputs.spaceHeatingDemand > 0) {
    // Prefer EPC space heating demand if available
    annualHeatKwh = inputs.spaceHeatingDemand;
    heatDemandSource = 'epc';
  } else {
    // Fallback: floor area × kWh/m² by EPC band
    const intensity = HEAT_INTENSITY_BY_EPC[epcBand] || 125;
    annualHeatKwh = inputs.floorArea * intensity;
    heatDemandSource = 'floor_area';
  }

  // ============================================
  // 2. Compute current heating cost baseline
  // ============================================
  let baselineCost: number;
  
  if (inputs.userProvidedAnnualCost && inputs.userProvidedAnnualCost > 0) {
    // User override takes priority
    baselineCost = inputs.userProvidedAnnualCost;
  } else {
    // Calculate from fuel type and heat demand
    const fuelRate = getFuelRate(fuelType, assumptions);
    const fuelInputKwh = annualHeatKwh / boilerEfficiency;
    baselineCost = fuelInputKwh * fuelRate;
  }

  // ============================================
  // 3. Calculate savings scenarios (worst, typical, best)
  // ============================================
  const worstCase = calculateSavingsScenario(
    annualHeatKwh,
    baselineCost,
    inputs.scop,
    epcBand,
    inputs.tariff,
    assumptions,
    0.90, // -10% SCOP
    0.90, // -10% cheap share
    fuelType,
    'worst'
  );
  
  const typicalCase = calculateSavingsScenario(
    annualHeatKwh,
    baselineCost,
    inputs.scop,
    epcBand,
    inputs.tariff,
    assumptions,
    1.0,
    1.0,
    fuelType,
    'typical'
  );
  
  const bestCase = calculateSavingsScenario(
    annualHeatKwh,
    baselineCost,
    inputs.scop,
    epcBand,
    inputs.tariff,
    assumptions,
    1.10, // +10% SCOP
    1.10, // +10% cheap share
    fuelType,
    'best'
  );

  // Use typical case as the main values
  const annualSavings = typicalCase.savings;
  const hpCost = typicalCase.hpCost;
  const scopUsed = typicalCase.scopUsed;
  const offpeakShareUsed = typicalCase.cheapShareUsed;
  
  // Check if savings were clamped (only for gas)
  const rawSavings = baselineCost - hpCost;
  const savingsClamped = fuelType === 'gas' && Math.abs(rawSavings - annualSavings) > 10;
  const savingsCouldIncrease = annualSavings < 0;

  // Calculate HP electricity use for typical case
  const hpElectricKwh = annualHeatKwh / scopUsed;

  // Weighted rate for transparency
  let weightedRate = (assumptions.electricity_rate || 28) / 100;
  let tariffId: string | undefined;
  let tariffPeakRate: number | undefined;
  let tariffOffpeakRate: number | undefined;
  
  if (inputs.tariff) {
    tariffId = inputs.tariff.id;
    tariffPeakRate = inputs.tariff.peak_rate_p_per_kwh;
    tariffOffpeakRate = inputs.tariff.offpeak_rate_p_per_kwh ?? inputs.tariff.peak_rate_p_per_kwh;
    
    const hasOffpeak = inputs.tariff.offpeak_hours_per_day > 0 && inputs.tariff.offpeak_rate_p_per_kwh !== null;
    if (hasOffpeak) {
      const peakRate = inputs.tariff.peak_rate_p_per_kwh / 100;
      const offpeakRate = (inputs.tariff.offpeak_rate_p_per_kwh ?? inputs.tariff.peak_rate_p_per_kwh) / 100;
      weightedRate = (offpeakShareUsed * offpeakRate) + ((1 - offpeakShareUsed) * peakRate);
    } else {
      weightedRate = inputs.tariff.peak_rate_p_per_kwh / 100;
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

  // Radiator calculation based on efficiency selection
  const radiatorsUpgraded = getRadiatorsForEfficiency(inputs.scop);
  const baseRadiators = assumptions.included_radiators;
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

  // SCOP adjusted for transparency
  const derateFactor = SCOP_DERATE_BY_EPC[epcBand] || 0.90;
  const scopAdjusted = inputs.scop * derateFactor;

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
    scopAdjusted,
    offpeakShareUsed,
    weightedRate,
    isBestCase: bestCase.savings > baselineCost * 0.4,
    tariffId,
    tariffPeakRate,
    tariffOffpeakRate,
    // New fields
    savingsRange: {
      worst: worstCase,
      typical: typicalCase,
      best: bestCase,
    },
    currentFuelType: fuelType,
    boilerEfficiency,
    savingsClamped,
    savingsCouldIncrease,
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

// Display-friendly fuel type names
export function getFuelDisplayName(fuelType: string): string {
  switch (fuelType) {
    case 'gas': return 'Mains gas';
    case 'oil': return 'Oil';
    case 'lpg': return 'LPG';
    case 'electric': return 'Electric';
    default: return 'Mains gas';
  }
}
