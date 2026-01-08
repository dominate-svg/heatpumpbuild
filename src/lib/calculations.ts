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
// Based on national averages and research-anchored assumptions
// ============================================

// Base useful heat for a medium UK home (space + hot water)
const BASE_USEFUL_HEAT_KWH = 11500;

// EPC multiplier: scales base heat by EPC band
const EPC_MULTIPLIER: Record<string, number> = {
  'A': 0.60,
  'B': 0.70,
  'C': 0.85,
  'D': 1.00,
  'E': 1.20,
  'F': 1.40,
  'G': 1.60,
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

// Fixed DHW COP (lower than space heating due to higher temps)
const DHW_COP = 2.2;

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

// Fuel unit rates (£/kWh) - based on Ofgem cap typical
const FUEL_UNIT_RATES: Record<string, number> = {
  'gas': 0.0593,
  'lpg': 0.122,
  'electric': 0.2769,
};

// Oil pricing: pence per litre and kWh per litre
const OIL_PRICE_PENCE_PER_LITRE = 60.63;
const OIL_KWH_PER_LITRE = 10.35;
const OIL_RATE = OIL_PRICE_PENCE_PER_LITRE / OIL_KWH_PER_LITRE / 100;

// Boiler efficiencies - realistic for typical UK stock
const BOILER_EFFICIENCY: Record<string, number> = {
  'gas': 0.90,
  'oil_modern': 0.85,
  'oil_old': 0.70,
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

export interface SavingsScenario {
  currentCost: number;
  hpCost: number;
  savings: number;
  hpElectricKwh: number;
  spaceScopAdj: number;
  cheapShareUsed: number;
  effectiveRate: number;
}

export interface OilSavingsResult {
  modernBoiler: SavingsScenario;
  oldBoiler: SavingsScenario;
}

export interface SavingsResult {
  // Core figures
  usefulHeatKwh: number;
  spaceHeatKwh: number;
  dhwHeatKwh: number;
  fuelInputKwh: number;
  
  // Scenarios
  typical: SavingsScenario;
  best: SavingsScenario;
  worst: SavingsScenario;
  
  // Oil-specific (only populated for oil fuel)
  oilScenarios?: {
    typical: OilSavingsResult;
    best: OilSavingsResult;
    worst: OilSavingsResult;
  };
  
  // Metadata
  isOil: boolean;
  boilerEfficiency: number;
  epcDerateApplied: number;
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
  // Detailed transparency fields
  currentFuelType: string;
  boilerEfficiency: number;
  fuelInputKwh: number;
  spaceHeatKwh: number;
  dhwHeatKwh: number;
  dhwCop: number;
  epcDerateApplied: number;
  savingsCouldIncrease: boolean;
  confidenceLabel: string;
  epcBand: string;
  // Savings ranges
  savingsRange: {
    typical: number;
    best: number;
    worst: number;
  };
  hpCostRange: {
    typical: number;
    best: number;
    worst: number;
  };
  // Oil-specific
  isOilFuel: boolean;
  oilSavings?: {
    modernBoiler: { typical: number; best: number; worst: number };
    oldBoiler: { typical: number; best: number; worst: number };
  };
  oilCurrentCost?: {
    modernBoiler: number;
    oldBoiler: number;
  };
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

function calculateCheapShare(baseScop: number, epcBand: string, adjustment: number = 0): number {
  let baseShare = BASE_CHEAP_SHARE[baseScop] || 0.45;
  
  // Apply EPC penalty
  if (epcBand === 'E') {
    baseShare -= 0.05;
  } else if (['F', 'G'].includes(epcBand)) {
    baseShare -= 0.10;
  }
  
  // Apply scenario adjustment
  baseShare += adjustment;
  
  // Clamp between 0.25 and 0.70
  return clamp(baseShare, 0.25, 0.70);
}

function calculateEffectiveRate(
  cheapShare: number,
  tariff: Tariff | null,
  fallbackRate: number
): number {
  if (tariff && tariff.offpeak_hours_per_day && tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null) {
    const peakRate = tariff.peak_rate_p_per_kwh / 100;
    const offpeakRate = tariff.offpeak_rate_p_per_kwh / 100;
    return (cheapShare * offpeakRate) + ((1 - cheapShare) * peakRate);
  } else if (tariff) {
    return tariff.peak_rate_p_per_kwh / 100;
  }
  return fallbackRate / 100;
}

function calculateScenario(
  spaceHeatKwh: number,
  dhwHeatKwh: number,
  baseScop: number,
  epcBand: string,
  tariff: Tariff | null,
  fallbackElecRate: number,
  scopAdjustment: number,
  cheapShareAdjustment: number
): SavingsScenario {
  const epcDerate = EPC_DERATE[epcBand] || 0.90;
  const adjustedScop = baseScop * (1 + scopAdjustment);
  const spaceScopAdj = adjustedScop * epcDerate;
  
  const spaceElecKwh = spaceHeatKwh / spaceScopAdj;
  const dhwElecKwh = dhwHeatKwh / DHW_COP;
  const hpElectricKwh = spaceElecKwh + dhwElecKwh;
  
  const cheapShareUsed = calculateCheapShare(baseScop, epcBand, cheapShareAdjustment);
  const effectiveRate = calculateEffectiveRate(cheapShareUsed, tariff, fallbackElecRate);
  const hpCost = hpElectricKwh * effectiveRate;
  
  return {
    currentCost: 0, // Will be set by caller
    hpCost,
    savings: 0, // Will be set by caller
    hpElectricKwh,
    spaceScopAdj,
    cheapShareUsed,
    effectiveRate,
  };
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
  
  const epcDerate = EPC_DERATE[epcBand] || 0.90;
  const fallbackElecRate = assumptions.electricity_rate || 28;
  const isOil = fuelType === 'oil';
  
  // Calculate typical, best, worst scenarios
  const typicalScenario = calculateScenario(
    spaceHeatKwh, dhwHeatKwh, selectedScop, epcBand, tariff, fallbackElecRate, 0, 0
  );
  const bestScenario = calculateScenario(
    spaceHeatKwh, dhwHeatKwh, selectedScop, epcBand, tariff, fallbackElecRate, 0.10, 0.05
  );
  const worstScenario = calculateScenario(
    spaceHeatKwh, dhwHeatKwh, selectedScop, epcBand, tariff, fallbackElecRate, -0.10, -0.05
  );
  
  let boilerEfficiency: number;
  let fuelInputKwh: number;
  let currentCost: number;
  let oilScenarios: SavingsResult['oilScenarios'];
  
  if (isOil) {
    // Oil has two baselines: modern and old boiler
    const modernEff = BOILER_EFFICIENCY['oil_modern'];
    const oldEff = BOILER_EFFICIENCY['oil_old'];
    
    const modernFuelKwh = usefulHeat / modernEff;
    const oldFuelKwh = usefulHeat / oldEff;
    
    const modernCost = modernFuelKwh * OIL_RATE;
    const oldCost = oldFuelKwh * OIL_RATE;
    
    // Use modern as the primary for display
    boilerEfficiency = modernEff;
    fuelInputKwh = modernFuelKwh;
    currentCost = modernCost;
    
    // Create oil-specific scenarios
    const createOilResult = (scenario: SavingsScenario): OilSavingsResult => ({
      modernBoiler: {
        ...scenario,
        currentCost: modernCost,
        savings: modernCost - scenario.hpCost,
      },
      oldBoiler: {
        ...scenario,
        currentCost: oldCost,
        savings: oldCost - scenario.hpCost,
      },
    });
    
    oilScenarios = {
      typical: createOilResult(typicalScenario),
      best: createOilResult(bestScenario),
      worst: createOilResult(worstScenario),
    };
    
    // Set typical savings using modern boiler
    typicalScenario.currentCost = modernCost;
    typicalScenario.savings = modernCost - typicalScenario.hpCost;
    bestScenario.currentCost = modernCost;
    bestScenario.savings = modernCost - bestScenario.hpCost;
    worstScenario.currentCost = modernCost;
    worstScenario.savings = modernCost - worstScenario.hpCost;
  } else {
    // Non-oil fuels
    boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.90;
    fuelInputKwh = usefulHeat / boilerEfficiency;
    const fuelRate = FUEL_UNIT_RATES[fuelType] || 0.0593;
    currentCost = fuelInputKwh * fuelRate;
    
    typicalScenario.currentCost = currentCost;
    typicalScenario.savings = currentCost - typicalScenario.hpCost;
    bestScenario.currentCost = currentCost;
    bestScenario.savings = currentCost - bestScenario.hpCost;
    worstScenario.currentCost = currentCost;
    worstScenario.savings = currentCost - worstScenario.hpCost;
  }
  
  return {
    usefulHeatKwh: usefulHeat,
    spaceHeatKwh,
    dhwHeatKwh,
    fuelInputKwh,
    typical: typicalScenario,
    best: bestScenario,
    worst: worstScenario,
    oilScenarios,
    isOil,
    boilerEfficiency,
    epcDerateApplied: epcDerate,
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
  // Use BASE × EPC multiplier
  // ============================================
  const baseHeat = assumptions.base_useful_heat_kwh || BASE_USEFUL_HEAT_KWH;
  const multiplier = EPC_MULTIPLIER[epcBand] || 1.0;
  const annualHeatKwh = Math.round(baseHeat * multiplier);
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

  const typicalSavings = roundToNearest10(savingsResult.typical.savings);
  const bestSavings = roundToNearest10(savingsResult.best.savings);
  const worstSavings = roundToNearest10(savingsResult.worst.savings);
  
  const baselineCost = roundToNearest10(savingsResult.typical.currentCost);
  const hpCost = roundToNearest10(savingsResult.typical.hpCost);
  const hpElectricKwh = roundToNearest10(savingsResult.typical.hpElectricKwh);
  const savingsCouldIncrease = worstSavings < 0;

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

  // Oil-specific data
  let oilSavings: EstimateResults['oilSavings'];
  let oilCurrentCost: EstimateResults['oilCurrentCost'];
  
  if (savingsResult.oilScenarios) {
    oilSavings = {
      modernBoiler: {
        typical: roundToNearest10(savingsResult.oilScenarios.typical.modernBoiler.savings),
        best: roundToNearest10(savingsResult.oilScenarios.best.modernBoiler.savings),
        worst: roundToNearest10(savingsResult.oilScenarios.worst.modernBoiler.savings),
      },
      oldBoiler: {
        typical: roundToNearest10(savingsResult.oilScenarios.typical.oldBoiler.savings),
        best: roundToNearest10(savingsResult.oilScenarios.best.oldBoiler.savings),
        worst: roundToNearest10(savingsResult.oilScenarios.worst.oldBoiler.savings),
      },
    };
    oilCurrentCost = {
      modernBoiler: roundToNearest10(savingsResult.oilScenarios.typical.modernBoiler.currentCost),
      oldBoiler: roundToNearest10(savingsResult.oilScenarios.typical.oldBoiler.currentCost),
    };
  }

  return {
    floorArea: inputs.floorArea,
    annualHeatKwh,
    heatLossKw,
    baselineCost,
    hpElectricKwh,
    hpCost,
    annualSavings: typicalSavings,
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
    scopAdjusted: savingsResult.typical.spaceScopAdj,
    offpeakShareUsed: savingsResult.typical.cheapShareUsed,
    weightedRate: savingsResult.typical.effectiveRate,
    isBestCase: false,
    tariffId,
    tariffPeakRate,
    tariffOffpeakRate,
    // Detailed transparency fields
    currentFuelType: fuelType,
    boilerEfficiency: savingsResult.boilerEfficiency,
    fuelInputKwh: roundToNearest10(savingsResult.fuelInputKwh),
    spaceHeatKwh: roundToNearest10(savingsResult.spaceHeatKwh),
    dhwHeatKwh: roundToNearest10(savingsResult.dhwHeatKwh),
    dhwCop: DHW_COP,
    epcDerateApplied: savingsResult.epcDerateApplied,
    savingsCouldIncrease,
    confidenceLabel: getConfidenceLabel(epcBand),
    epcBand,
    // Savings ranges
    savingsRange: {
      typical: typicalSavings,
      best: bestSavings,
      worst: worstSavings,
    },
    hpCostRange: {
      typical: hpCost,
      best: roundToNearest10(savingsResult.best.hpCost),
      worst: roundToNearest10(savingsResult.worst.hpCost),
    },
    // Oil-specific
    isOilFuel: savingsResult.isOil,
    oilSavings,
    oilCurrentCost,
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