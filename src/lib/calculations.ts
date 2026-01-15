import type { Tariff } from '@/hooks/useTariffs';
import { calculateTariffOutcome } from './tariffCalculations';
import { type TariffCostResult, type TariffConfig } from './tariffConfig';

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
// BALANCED SAVINGS CALCULATOR CONFIG
// Gas unchanged, Oil fixed with proper conversion + EPC uplift
// Cosy modelled with proper blended rate
// ============================================

// Heat demand by EPC band (kWh/year) - national average approximation
// These represent "useful heat delivered" (space + DHW)
const HEAT_DEMAND_BY_EPC: Record<string, number> = {
  'A': 8000,
  'B': 8000,
  'C': 10500,
  'D': 13500,
  'E': 16500,
  'F': 20000,
  'G': 24000,
};

// DHW share by EPC band (DHW share rises with better insulation)
const DHW_SHARE_BY_EPC: Record<string, number> = {
  'A': 0.30,  // 30% DHW, 70% space
  'B': 0.30,
  'C': 0.25,
  'D': 0.20,
  'E': 0.18,
  'F': 0.15,
  'G': 0.15,
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

// LPG: £/kWh
const LPG_RATE = 0.105; // £/kWh

// Oil pricing (stored as pence per litre, converted properly)
// Default: 65p per litre (conservative mid)
// Energy content: 10.35 kWh per litre (kerosene)
const OIL_PENCE_PER_LITRE = 65;
const OIL_KWH_PER_LITRE = 10.35;

// Cosy tariff structure (3-rate tariff)
// Cheap windows: 7p/kWh
// Mid/Standard: 19p/kWh
// Peak: 40p/kWh (4–7pm)
// NOTE: These values must match what we show in the UI.
const COSY_OFFPEAK_RATE = 0.07;  // 7p/kWh
const COSY_MID_RATE = 0.19;     // 19p/kWh
const COSY_PEAK_RATE = 0.40;    // 40p/kWh

// Peak share is constant (15% - people still heat at peak)
const COSY_PEAK_SHARE = 0.15;

// Cheap usage share by EPC band (more conservative for poor insulation)
const COSY_CHEAP_SHARE_BY_EPC: Record<string, number> = {
  'A': 0.60,
  'B': 0.60,
  'C': 0.55,
  'D': 0.50,
  'E': 0.45,
  'F': 0.40,
  'G': 0.35,
};

// Base SCOP mapping
const BASE_SCOP_MAP: Record<number, number> = {
  3.4: 3.5,
  3.7: 3.8,
  4.0: 4.1,
};

// EPC SCOP multiplier (reduce SCOP for poor insulation homes)
const EPC_SCOP_MULTIPLIER: Record<string, number> = {
  'A': 1.00,
  'B': 1.00,
  'C': 0.97,
  'D': 0.94,
  'E': 0.90,
  'F': 0.85,
  'G': 0.80,
};

// DHW COP penalty (hot water runs at higher temps)
const DHW_SCOP_PENALTY = 0.75;

// SCOP clamps
const SCOP_SPACE_MAX = 4.2;
const SCOP_SPACE_MIN = 2.2;
const SCOP_DHW_MIN = 1.7;

// Display savings clamps by EPC (for oil homes)
const OIL_SAVINGS_CLAMP: Record<string, { min: number; max: number }> = {
  'A': { min: -300, max: 700 },
  'B': { min: -300, max: 700 },
  'C': { min: -300, max: 700 },
  'D': { min: -600, max: 900 },
  'E': { min: -600, max: 900 },
  'F': { min: -900, max: 900 },
  'G': { min: -900, max: 900 },
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
  // Raw values for per-tariff comparison (unrounded)
  rawHpElectricKwh: number;
  rawBaselineCost: number;
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
 * Calculate savings using comprehensive model with:
 * - EPC-sensitive SCOP
 * - DHW penalty
 * - Conservative Cosy blending by EPC
 * - Proper oil pricing from litres
 * - Space vs DHW heat demand split
 * 
 * GAS (DO NOT CHANGE):
 * - Gas cost = Heat demand ÷ 0.82 × 5.93p
 * 
 * OIL (FIXED):
 * - Oil price: 65p/litre (configurable)
 * - Energy content: 10.35 kWh/litre
 * - Oil boiler efficiency: 78%
 * - No demand uplift (removed - now using national average model)
 */
function calculateSavings(
  epcBand: string,
  fuelType: string,
  scop: number
): SavingsCalculation & { transparency: SavingsTransparency } {
  // ============================================
  // Step 1: Heat demand from EPC band
  // ============================================
  const totalHeatDemand = HEAT_DEMAND_BY_EPC[epcBand] || HEAT_DEMAND_BY_EPC['D'];
  const dhwShare = DHW_SHARE_BY_EPC[epcBand] || 0.20;
  const spaceHeatDemand = totalHeatDemand * (1 - dhwShare);
  const dhwDemand = totalHeatDemand * dhwShare;

  // ============================================
  // Step 2: Current heating cost
  // ============================================
  const boilerEfficiency = BOILER_EFFICIENCY[fuelType] || 0.82;
  
  // Calculate fuel input needed (accounting for boiler efficiency)
  const fuelKwh = totalHeatDemand / boilerEfficiency;
  
  let currentCost: number;
  let oilLitresUsed: number | undefined;
  
  if (fuelType === 'oil') {
    // Oil: Calculate using pence/litre → kWh → cost
    // Clamp oil price to sensible range (45-95p/L)
    const oilPriceClampedPence = clamp(OIL_PENCE_PER_LITRE, 45, 95);
    // Convert fuel kWh to litres
    oilLitresUsed = fuelKwh / OIL_KWH_PER_LITRE;
    // Cost = litres × price per litre (convert pence to pounds)
    currentCost = oilLitresUsed * (oilPriceClampedPence / 100);
  } else if (fuelType === 'gas') {
    // Gas: DO NOT CHANGE
    currentCost = fuelKwh * GAS_RATE;
  } else if (fuelType === 'lpg') {
    // LPG: simple rate
    currentCost = fuelKwh * LPG_RATE;
  } else {
    // Default to gas calculation
    currentCost = fuelKwh * GAS_RATE;
  }

  // ============================================
  // Step 3: Calculate EPC-adjusted SCOP
  // ============================================
  const baseScop = BASE_SCOP_MAP[scop] || scop;
  const epcScopMultiplier = EPC_SCOP_MULTIPLIER[epcBand] || 0.94;
  
  // Calculate space heating SCOP (with EPC adjustment and clamp)
  let scopSpace = baseScop * epcScopMultiplier;
  scopSpace = clamp(scopSpace, SCOP_SPACE_MIN, SCOP_SPACE_MAX);
  
  // Calculate DHW SCOP (with penalty and clamp)
  let scopDhw = scopSpace * DHW_SCOP_PENALTY;
  scopDhw = Math.max(scopDhw, SCOP_DHW_MIN);

  // ============================================
  // Step 4: Heat pump electricity use
  // ============================================
  const hpKwhSpace = spaceHeatDemand / scopSpace;
  const hpKwhDhw = dhwDemand / scopDhw;
  const hpKwh = hpKwhSpace + hpKwhDhw;

  // ============================================
  // Step 5: Calculate EPC-sensitive Cosy blended rate
  // ============================================
  const cosyCheapShare = COSY_CHEAP_SHARE_BY_EPC[epcBand] || 0.50;
  const cosyMidShare = 1 - cosyCheapShare - COSY_PEAK_SHARE;
  
  const blendedRate = 
    (cosyCheapShare * COSY_OFFPEAK_RATE) +
    (cosyMidShare * COSY_MID_RATE) +
    (COSY_PEAK_SHARE * COSY_PEAK_RATE);

  // ============================================
  // Step 6: Heat pump running cost
  // ============================================
  const hpCost = hpKwh * blendedRate;

  // ============================================
  // Step 7: Savings with optional clamping
  // ============================================
  const rawSavingsBeforeClamp = currentCost - hpCost;
  let finalSavings = rawSavingsBeforeClamp;
  let savingsWasClamped = false;
  
  // Apply clamp for oil homes only
  if (fuelType === 'oil') {
    const clampRange = OIL_SAVINGS_CLAMP[epcBand] || { min: -600, max: 900 };
    const clampedValue = clamp(rawSavingsBeforeClamp, clampRange.min, clampRange.max);
    savingsWasClamped = clampedValue !== rawSavingsBeforeClamp;
    finalSavings = clampedValue;
  }
  
  const estimatedSavings = roundToNearest10(finalSavings);
  
  // Flag high-sensitivity estimates
  const isHighSensitivity = fuelType === 'oil' && finalSavings > 800;

  // Use effective SCOP for display (weighted average based on demand split)
  const effectiveScop = totalHeatDemand / hpKwh;

  return {
    heatDemand: totalHeatDemand,
    fuelKwh,
    currentCost,
    hpKwh,
    hpCost,
    rawSavings: rawSavingsBeforeClamp,
    estimatedSavings,
    boilerEfficiency,
    optimisticScop: effectiveScop,
    transparency: {
      totalHeatDemand,
      spaceHeatDemand,
      dhwDemand,
      dhwShare,
      oilPricePerLitre: fuelType === 'oil' ? OIL_PENCE_PER_LITRE : undefined,
      oilLitresUsed,
      oilKwhPerLitre: fuelType === 'oil' ? OIL_KWH_PER_LITRE : undefined,
      baseScop,
      epcScopMultiplier,
      scopSpace,
      scopDhw,
      hpKwhSpace,
      hpKwhDhw,
      cosyOffpeakRate: COSY_OFFPEAK_RATE * 100,
      cosyMidRate: COSY_MID_RATE * 100,
      cosyPeakRate: COSY_PEAK_RATE * 100,
      cosyCheapShare,
      cosyMidShare,
      cosyPeakShare: COSY_PEAK_SHARE,
      blendedRate: blendedRate * 100,
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
  // 2. Calculate tariff-specific costs using ACTUAL database rates
  // ============================================
  let hpCost = cosySavings.hpCost;
  let estimatedSavings = cosySavings.estimatedSavings;
  let rawSavings = cosySavings.rawSavings;
  let transparency = { ...cosySavings.transparency };
  
  // Check if we have a non-Cosy tariff selected
  const isCosy = inputs.tariff?.name?.toLowerCase().includes('cosy') ?? true;
  
  if (inputs.tariff && !isCosy) {
    // ============================================
    // Non-Cosy tariffs: compute running cost & savings
    // from the SAME hp kWh + current cost model.
    // Rate modelling + safety gates live in calculateTariffOutcome.
    // ============================================
    const outcome = calculateTariffOutcome(
      inputs.tariff,
      epcBand,
      cosySavings.hpKwh,
      cosySavings.currentCost
    );

    hpCost = outcome.heatPumpCostAnnual;
    const newRawSavings = outcome.annualSavings;

    // Apply clamp for oil homes (existing behaviour)
    let finalSavings = newRawSavings;
    let savingsWasClamped = false;
    if (fuelType === 'oil') {
      const clampRange = OIL_SAVINGS_CLAMP[epcBand] || { min: -600, max: 900 };
      const clampedValue = clamp(newRawSavings, clampRange.min, clampRange.max);
      savingsWasClamped = clampedValue !== newRawSavings;
      finalSavings = clampedValue;
    }

    estimatedSavings = roundToNearest10(finalSavings);
    rawSavings = newRawSavings;

    // Update transparency with actual tariff info (keep shape stable for UI)
    transparency = {
      ...cosySavings.transparency,
      isCosy: false,
      blendedRate: outcome.effectiveRateP,
      rawSavingsBeforeClamp: newRawSavings,
      savingsWasClamped,
      isHighSensitivity: fuelType === 'oil' && finalSavings > 800,
    };
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
    // Raw values for per-tariff comparison (unrounded)
    rawHpElectricKwh: cosySavings.hpKwh,
    rawBaselineCost: cosySavings.currentCost,
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
