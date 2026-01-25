/**
 * Install Cost Estimator for UK Air Source Heat Pumps
 * 
 * Calculates estimated install cost based on EPC data with:
 * - Floor area bands for base pricing
 * - Built form adjustments
 * - Cylinder adders (based on hot water type)
 * - Radiator upgrade estimates
 * - Complexity scoring
 * - BUS grant deduction
 */

import type { EPCData } from './calculations';

// ============================================
// TYPES
// ============================================

export type CylinderOverride = 'yes' | 'no' | 'unknown';
export type RadiatorOverride = 'none' | 'some' | 'many' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface UserOverrides {
  hasCylinder?: CylinderOverride;
  radiatorUpgrades?: RadiatorOverride;
}

export interface CostRange {
  low: number;
  mid: number;
  high: number;
}

export interface BreakdownItem {
  label: string;
  range: CostRange;
  description?: string;
}

export interface InstallCostResult {
  // Total before BUS grant
  totalBeforeGrant: CostRange;
  // Customer contribution after grant
  contribution: CostRange;
  // Detailed breakdown
  breakdown: {
    base: BreakdownItem;
    builtForm: BreakdownItem;
    cylinder: BreakdownItem;
    cylinderUpsizing?: BreakdownItem;
    radiators: BreakdownItem;
    complexity: BreakdownItem;
  };
  // Assumptions made
  assumptions: string[];
  // Confidence level
  confidence: ConfidenceLevel;
  // Debug info
  debug?: {
    floorAreaBand: string;
    builtFormDetected: string;
    radScore: number;
    complexityLevel: string;
    cylinderDetected: string;
  };
}

// ============================================
// CONSTANTS
// ============================================

const BUS_GRANT = 7500;

// Floor area bands → base price (before grant)
const FLOOR_AREA_BANDS: Array<{ max: number; label: string; range: CostRange }> = [
  { max: 60, label: '0–60 m²', range: { low: 9500, mid: 10500, high: 11500 } },
  { max: 90, label: '61–90 m²', range: { low: 10500, mid: 11500, high: 12500 } },
  { max: 130, label: '91–130 m²', range: { low: 11750, mid: 12750, high: 13750 } },
  { max: 180, label: '131–180 m²', range: { low: 13250, mid: 14250, high: 15250 } },
  { max: 250, label: '181–250 m²', range: { low: 15000, mid: 16000, high: 17000 } },
  { max: Infinity, label: '250+ m²', range: { low: 17000, mid: 18000, high: 19500 } },
];

// Built form adjustments (added to all low/mid/high equally)
const BUILT_FORM_ADJUSTMENTS: Record<string, number> = {
  'flat': 750,
  'mid-terrace': -500,
  'mid terrace': -500,
  'end-terrace': 0,
  'end terrace': 0,
  'enclosed mid-terrace': -500,
  'enclosed end-terrace': 0,
  'semi-detached': 250,
  'semi detached': 250,
  'detached': 750,
};

// Cylinder costs (no cylinder = new required)
const CYLINDER_COSTS = {
  required: { low: 900, mid: 1200, high: 1600 },
  allowance: { low: 0, mid: 200, high: 400 },
};

// Cylinder upsizing for large homes (≥130 m²)
const CYLINDER_UPSIZING = { low: 300, mid: 600, high: 900 };

// Radiator upgrade costs by score
const RADIATOR_COSTS = {
  low: { low: 0, mid: 300, high: 600 },     // score 0-1
  some: { low: 900, mid: 1500, high: 2100 }, // score 2-3
  many: { low: 2400, mid: 3300, high: 4200 }, // score 4+
};

// Complexity adders
const COMPLEXITY_COSTS = {
  easy: { low: 0, mid: 0, high: 600 },
  standard: { low: 500, mid: 900, high: 1400 },
  complex: { low: 1100, mid: 1800, high: 2500 },
  veryComplex: { low: 1800, mid: 2800, high: 3800 },
};

// Age band scoring for radiator estimation
const PRE_1950_PATTERNS = [
  'pre-1900', 'before 1900',
  '1900-1929', '1900 to 1929', '1900-29',
  '1930-1949', '1930 to 1949', '1930-49',
  'pre 1900', 'pre-1919', '1919',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeBuiltForm(propertyType?: string): string {
  if (!propertyType) return 'unknown';
  
  const lower = propertyType.toLowerCase().trim();
  
  // Check for flat variants
  if (lower.includes('flat') || lower.includes('apartment') || lower.includes('maisonette')) {
    return 'flat';
  }
  
  // Check for terrace variants
  if (lower.includes('mid-terrace') || lower.includes('mid terrace') || lower.includes('enclosed mid')) {
    return 'mid-terrace';
  }
  if (lower.includes('end-terrace') || lower.includes('end terrace') || lower.includes('enclosed end')) {
    return 'end-terrace';
  }
  if (lower.includes('terrace')) {
    // Generic terrace - assume mid as more common
    return 'mid-terrace';
  }
  
  // Check for semi-detached
  if (lower.includes('semi')) {
    return 'semi-detached';
  }
  
  // Check for detached (must be after semi check)
  if (lower.includes('detached')) {
    return 'detached';
  }
  
  // Bungalow - treat as semi-detached for pricing
  if (lower.includes('bungalow')) {
    return 'semi-detached';
  }
  
  return 'unknown';
}

function isPre1950(constructionAge?: string): boolean {
  if (!constructionAge) return false;
  const lower = constructionAge.toLowerCase();
  return PRE_1950_PATTERNS.some(pattern => lower.includes(pattern));
}

function isPost1980(constructionAge?: string): boolean {
  if (!constructionAge) return false;
  const lower = constructionAge.toLowerCase();
  return lower.includes('1980') || lower.includes('1990') || lower.includes('2000') || 
         lower.includes('2010') || lower.includes('2020') || lower.includes('199') ||
         lower.includes('200') || lower.includes('201') || lower.includes('202');
}

function hasExistingCylinder(hotWaterDescription?: string): boolean | null {
  if (!hotWaterDescription) return null;
  
  const lower = hotWaterDescription.toLowerCase();
  
  // Combi/instantaneous = no cylinder
  if (lower.includes('combi') || lower.includes('instantaneous') || lower.includes('multipoint')) {
    return false;
  }
  
  // Cylinder indicators
  if (lower.includes('cylinder') || lower.includes('tank') || lower.includes('stored') ||
      lower.includes('immersion') || lower.includes('hot water tank')) {
    return true;
  }
  
  // Unknown
  return null;
}

function getEpcRatingScore(epcBand?: string): number {
  if (!epcBand) return 1; // Unknown = assume D-ish
  const band = epcBand.toUpperCase().charAt(0);
  const scores: Record<string, number> = {
    'A': 0, 'B': 0, 'C': 0,
    'D': 1,
    'E': 2,
    'F': 3, 'G': 3,
  };
  return scores[band] ?? 1;
}

function getFloorAreaBand(floorArea: number): { label: string; range: CostRange } {
  for (const band of FLOOR_AREA_BANDS) {
    if (floorArea <= band.max) {
      return { label: band.label, range: band.range };
    }
  }
  return FLOOR_AREA_BANDS[FLOOR_AREA_BANDS.length - 1];
}

function addRanges(...ranges: CostRange[]): CostRange {
  return ranges.reduce(
    (acc, r) => ({
      low: acc.low + r.low,
      mid: acc.mid + r.mid,
      high: acc.high + r.high,
    }),
    { low: 0, mid: 0, high: 0 }
  );
}

function addToRange(range: CostRange, amount: number): CostRange {
  return {
    low: range.low + amount,
    mid: range.mid + amount,
    high: range.high + amount,
  };
}

function clampRange(range: CostRange, min: number): CostRange {
  return {
    low: Math.max(min, range.low),
    mid: Math.max(min, range.mid),
    high: Math.max(min, range.high),
  };
}

function subtractFromRange(range: CostRange, amount: number): CostRange {
  return {
    low: range.low - amount,
    mid: range.mid - amount,
    high: range.high - amount,
  };
}

// ============================================
// MAIN ESTIMATOR FUNCTION
// ============================================

export function estimateInstallCostFromEpc(
  epc: EPCData,
  overrides: UserOverrides = {}
): InstallCostResult | { error: string } {
  const assumptions: string[] = [];
  let confidence: ConfidenceLevel = 'high';
  
  // ============================================
  // VALIDATION
  // ============================================
  const floorArea = epc.totalFloorArea;
  if (!floorArea || floorArea <= 0) {
    return { error: 'We need floor area from EPC to estimate costs. Please select a different EPC record or enter details manually.' };
  }
  
  // ============================================
  // STEP 1: Base price from floor area
  // ============================================
  const floorBand = getFloorAreaBand(floorArea);
  const baseRange = { ...floorBand.range };
  
  // ============================================
  // STEP 2: Built form adjustment
  // ============================================
  const builtForm = normalizeBuiltForm(epc.propertyType);
  let builtFormAdjustment = 0;
  
  if (builtForm === 'unknown') {
    assumptions.push('Property type unknown — no built-form adjustment applied');
    confidence = confidence === 'high' ? 'medium' : confidence;
  } else {
    builtFormAdjustment = BUILT_FORM_ADJUSTMENTS[builtForm] ?? 0;
    if (builtFormAdjustment !== 0) {
      const sign = builtFormAdjustment > 0 ? '+' : '';
      assumptions.push(`${builtForm.charAt(0).toUpperCase() + builtForm.slice(1)} property (${sign}£${Math.abs(builtFormAdjustment).toLocaleString()})`);
    }
  }
  
  const builtFormRange: CostRange = {
    low: builtFormAdjustment,
    mid: builtFormAdjustment,
    high: builtFormAdjustment,
  };
  
  // ============================================
  // STEP 3: Cylinder adder
  // ============================================
  let cylinderNeeded: boolean;
  let cylinderRange: CostRange;
  let cylinderDetected = 'unknown';
  
  const cylinderOverride = overrides.hasCylinder ?? 'unknown';
  
  if (cylinderOverride === 'no') {
    cylinderNeeded = true;
    cylinderDetected = 'override-no';
    assumptions.push('You indicated no existing cylinder — new cylinder included');
  } else if (cylinderOverride === 'yes') {
    cylinderNeeded = false;
    cylinderDetected = 'override-yes';
    assumptions.push('You indicated existing cylinder — allowance only');
  } else {
    // Infer from EPC hot water description
    const hasCylinder = hasExistingCylinder(epc.hotWaterDescription);
    if (hasCylinder === false) {
      cylinderNeeded = true;
      cylinderDetected = 'epc-combi';
      assumptions.push('EPC indicates combi boiler — new hot water cylinder included');
    } else if (hasCylinder === true) {
      cylinderNeeded = false;
      cylinderDetected = 'epc-cylinder';
      assumptions.push('EPC indicates existing hot water cylinder — allowance only');
    } else {
      // Unknown - assume cylinder exists (more common in older homes)
      cylinderNeeded = false;
      cylinderDetected = 'assumed-yes';
      assumptions.push('Hot water type unknown — assumed existing cylinder');
      confidence = confidence === 'high' ? 'medium' : confidence;
    }
  }
  
  cylinderRange = cylinderNeeded ? CYLINDER_COSTS.required : CYLINDER_COSTS.allowance;
  
  // Cylinder upsizing for large homes
  let cylinderUpsizingRange: CostRange | undefined;
  if (floorArea >= 130) {
    cylinderUpsizingRange = CYLINDER_UPSIZING;
    assumptions.push('Large home (≥130 m²) — larger cylinder allowance included');
  }
  
  // ============================================
  // STEP 4: Radiator upgrade estimation
  // ============================================
  let radScore = 0;
  
  // EPC rating score
  const epcScore = getEpcRatingScore(epc.epcBand);
  radScore += epcScore;
  if (!epc.epcBand) {
    assumptions.push('EPC rating unknown — assumed moderate radiator needs');
    confidence = confidence === 'high' ? 'medium' : confidence;
  }
  
  // Age band score
  if (epc.constructionAgeBand) {
    if (isPre1950(epc.constructionAgeBand)) {
      radScore += 1;
      assumptions.push('Pre-1950 property — higher radiator upgrade likelihood');
    }
  } else {
    // Missing age band reduces confidence but doesn't add score
    confidence = confidence === 'high' ? 'medium' : confidence;
  }
  
  // Large home score
  if (floorArea >= 131) {
    radScore += 1;
  }
  
  // Detached score
  if (builtForm === 'detached') {
    radScore += 1;
  }
  
  // Determine radiator level
  let radiatorLevel: 'low' | 'some' | 'many';
  const radOverride = overrides.radiatorUpgrades ?? 'unknown';
  
  if (radOverride !== 'unknown') {
    radiatorLevel = radOverride === 'none' ? 'low' : radOverride;
    assumptions.push(`You indicated ${radOverride === 'none' ? 'no' : radOverride} radiator upgrades needed`);
  } else {
    if (radScore <= 1) {
      radiatorLevel = 'low';
      assumptions.push('Based on EPC rating and property type — minimal radiator changes expected');
    } else if (radScore <= 3) {
      radiatorLevel = 'some';
      assumptions.push('Based on EPC rating and property age — some radiator upgrades likely');
    } else {
      radiatorLevel = 'many';
      assumptions.push('Based on EPC rating, age and size — significant radiator upgrades expected');
    }
  }
  
  const radiatorRange = RADIATOR_COSTS[radiatorLevel];
  
  // ============================================
  // STEP 5: Complexity adder
  // ============================================
  let complexityLevel: 'easy' | 'standard' | 'complex' | 'veryComplex';
  
  const isFlat = builtForm === 'flat';
  const isDetached = builtForm === 'detached';
  const isOldAndLarge = floorArea >= 181 && epc.constructionAgeBand && isPre1950(epc.constructionAgeBand);
  const isEasyCandidate = floorArea <= 90 && 
    ['A', 'B', 'C', 'D'].includes(epc.epcBand?.toUpperCase().charAt(0) || '') &&
    !isFlat &&
    epc.constructionAgeBand && isPost1980(epc.constructionAgeBand);
  
  if (isOldAndLarge) {
    complexityLevel = 'veryComplex';
    assumptions.push('Large pre-1950 property — higher complexity expected');
  } else if (floorArea >= 131 || (epc.constructionAgeBand && isPre1950(epc.constructionAgeBand)) || isFlat || isDetached) {
    complexityLevel = 'complex';
    if (isFlat) {
      assumptions.push('Flat property — additional complexity considerations');
    }
  } else if (isEasyCandidate) {
    complexityLevel = 'easy';
    assumptions.push('Modern, efficient property — straightforward installation expected');
  } else {
    complexityLevel = 'standard';
  }
  
  const complexityRange = COMPLEXITY_COSTS[complexityLevel];
  
  // ============================================
  // STEP 6: Calculate totals
  // ============================================
  let totalBeforeGrant = addRanges(
    baseRange,
    builtFormRange,
    cylinderRange,
    radiatorRange,
    complexityRange
  );
  
  if (cylinderUpsizingRange) {
    totalBeforeGrant = addRanges(totalBeforeGrant, cylinderUpsizingRange);
  }
  
  // Customer contribution (after grant, clamped to £0 minimum)
  const contribution = clampRange(subtractFromRange(totalBeforeGrant, BUS_GRANT), 0);
  
  // ============================================
  // BUILD RESULT
  // ============================================
  return {
    totalBeforeGrant,
    contribution,
    breakdown: {
      base: {
        label: `Base install (${floorBand.label})`,
        range: baseRange,
        description: 'Heat pump, installation, and commissioning',
      },
      builtForm: {
        label: 'Property type',
        range: builtFormRange,
        description: builtForm !== 'unknown' ? builtForm.charAt(0).toUpperCase() + builtForm.slice(1) : 'Unknown',
      },
      cylinder: {
        label: 'Hot water cylinder',
        range: cylinderRange,
        description: cylinderNeeded ? 'New cylinder required' : 'Existing cylinder allowance',
      },
      ...(cylinderUpsizingRange && {
        cylinderUpsizing: {
          label: 'Cylinder upsizing',
          range: cylinderUpsizingRange,
          description: 'Larger cylinder for bigger home',
        },
      }),
      radiators: {
        label: 'Radiator upgrades',
        range: radiatorRange,
        description: radiatorLevel === 'low' ? 'Minimal changes' : 
                     radiatorLevel === 'some' ? 'Some upgrades likely' : 'Significant upgrades expected',
      },
      complexity: {
        label: 'Installation complexity',
        range: complexityRange,
        description: complexityLevel.charAt(0).toUpperCase() + complexityLevel.slice(1),
      },
    },
    assumptions,
    confidence,
    debug: {
      floorAreaBand: floorBand.label,
      builtFormDetected: builtForm,
      radScore,
      complexityLevel,
      cylinderDetected,
    },
  };
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatCostRange(range: CostRange): string {
  if (range.low === range.high) {
    return `£${range.mid.toLocaleString()}`;
  }
  return `£${range.low.toLocaleString()}–£${range.high.toLocaleString()}`;
}

export function formatTypicalCost(range: CostRange): string {
  return `£${range.mid.toLocaleString()}`;
}
