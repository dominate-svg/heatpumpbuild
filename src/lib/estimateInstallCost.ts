/**
 * Single-Figure Contribution Estimator for UK Air Source Heat Pumps
 * 
 * The £7,500 BUS grant covers a standard installation.
 * Customer contribution starts at £0 and only increases based on EPC-inferred extras.
 */

import type { EPCData } from './calculations';

// ============================================
// TYPES
// ============================================

export interface ContributionBreakdown {
  sizeAdder: number;
  builtFormAdder: number;
  ageAdder: number;
  ratingAdder: number;
  cylinderAdder: number;
  cylinderUpsizingAdder: number;
  radiatorAdder: number;
}

export interface ContributionExplanation {
  key: string;
  label: string;
  amount: number;
  description: string;
}

export interface ContributionResult {
  contribution: number;
  breakdown: ContributionBreakdown;
  explanations: ContributionExplanation[];
  debug?: {
    floorArea: number;
    builtForm: string;
    ageBand: string;
    epcRating: string;
    hotWater: string;
    radiatorScore: number;
  };
}

// ============================================
// CONSTANTS
// ============================================

const CONTRIBUTION_CAP = 8000;

// Size adders
const SIZE_ADDERS: Array<{ max: number; adder: number }> = [
  { max: 90, adder: 0 },
  { max: 130, adder: 500 },
  { max: 180, adder: 1500 },
  { max: 250, adder: 2750 },
  { max: Infinity, adder: 4000 },
];

// Built form adders
const BUILT_FORM_ADDERS: Record<string, number> = {
  'mid-terrace': 0,
  'mid terrace': 0,
  'enclosed mid-terrace': 0,
  'end-terrace': 250,
  'end terrace': 250,
  'enclosed end-terrace': 250,
  'semi-detached': 500,
  'semi detached': 500,
  'detached': 1250,
  'flat': 750,
  'maisonette': 750,
  'apartment': 750,
};

// Age adders
const AGE_PATTERNS = {
  post1980: ['1980', '1990', '2000', '2010', '2020', '199', '200', '201', '202'],
  mid1950to1979: ['1950', '1960', '1970', '195', '196', '197'],
  pre1950: ['pre-1900', 'before 1900', '1900-1929', '1900 to 1929', '1930-1949', '1930 to 1949', 'pre 1900', 'pre-1919', '1919'],
};

// EPC rating adders
const RATING_ADDERS: Record<string, number> = {
  'A': 0, 'B': 0, 'C': 0,
  'D': 500,
  'E': 1250,
  'F': 2250, 'G': 2250,
};
const RATING_MISSING_ADDER = 750;

// Radiator score adders
const RADIATOR_ADDERS: Array<{ maxScore: number; adder: number }> = [
  { maxScore: 1, adder: 0 },
  { maxScore: 3, adder: 1250 },
  { maxScore: Infinity, adder: 3000 },
];

// Cylinder adders
const CYLINDER_REQUIRED_ADDER = 1250;
const CYLINDER_UPSIZING_ADDER = 500;

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeBuiltForm(propertyType?: string): string {
  if (!propertyType) return 'unknown';
  
  const lower = propertyType.toLowerCase().trim();
  
  if (lower.includes('flat') || lower.includes('apartment') || lower.includes('maisonette')) {
    return 'flat';
  }
  if (lower.includes('mid-terrace') || lower.includes('mid terrace') || lower.includes('enclosed mid')) {
    return 'mid-terrace';
  }
  if (lower.includes('end-terrace') || lower.includes('end terrace') || lower.includes('enclosed end')) {
    return 'end-terrace';
  }
  if (lower.includes('terrace')) {
    return 'mid-terrace';
  }
  if (lower.includes('semi')) {
    return 'semi-detached';
  }
  if (lower.includes('detached')) {
    return 'detached';
  }
  if (lower.includes('bungalow')) {
    return 'semi-detached';
  }
  
  return 'unknown';
}

function getAgeBand(constructionAge?: string): 'post1980' | 'mid' | 'pre1950' | 'unknown' {
  if (!constructionAge) return 'unknown';
  const lower = constructionAge.toLowerCase();
  
  if (AGE_PATTERNS.pre1950.some(p => lower.includes(p))) return 'pre1950';
  if (AGE_PATTERNS.mid1950to1979.some(p => lower.includes(p))) return 'mid';
  if (AGE_PATTERNS.post1980.some(p => lower.includes(p))) return 'post1980';
  
  return 'unknown';
}

function isCombiBoiler(hotWaterDescription?: string): boolean {
  if (!hotWaterDescription) return false;
  const lower = hotWaterDescription.toLowerCase();
  return lower.includes('combi') || lower.includes('instantaneous') || lower.includes('multipoint');
}

function getEpcRating(epcBand?: string): string {
  if (!epcBand) return 'unknown';
  return epcBand.toUpperCase().charAt(0);
}

function getSizeAdder(floorArea: number): number {
  for (const band of SIZE_ADDERS) {
    if (floorArea <= band.max) return band.adder;
  }
  return SIZE_ADDERS[SIZE_ADDERS.length - 1].adder;
}

function getBuiltFormAdder(builtForm: string): number {
  return BUILT_FORM_ADDERS[builtForm] ?? 500; // Default to semi-detached equivalent if unknown
}

function getAgeAdder(ageBand: 'post1980' | 'mid' | 'pre1950' | 'unknown'): number {
  switch (ageBand) {
    case 'post1980': return 0;
    case 'mid': return 500;
    case 'pre1950': return 1250;
    default: return 250; // Neutral default
  }
}

function getRatingAdder(rating: string): number {
  if (rating === 'unknown') return RATING_MISSING_ADDER;
  return RATING_ADDERS[rating] ?? RATING_MISSING_ADDER;
}

function getRadiatorScore(rating: string, ageBand: string, floorArea: number, builtForm: string): number {
  let score = 0;
  
  // EPC rating score
  if (rating === 'D') score += 1;
  else if (rating === 'E') score += 2;
  else if (rating === 'F' || rating === 'G') score += 3;
  
  // Pre-1950 score
  if (ageBand === 'pre1950') score += 1;
  
  // Large home score
  if (floorArea >= 131) score += 1;
  
  // Detached score
  if (builtForm === 'detached') score += 1;
  
  return score;
}

function getRadiatorAdder(score: number): number {
  for (const band of RADIATOR_ADDERS) {
    if (score <= band.maxScore) return band.adder;
  }
  return RADIATOR_ADDERS[RADIATOR_ADDERS.length - 1].adder;
}

function roundToNearest100(value: number): number {
  return Math.round(value / 100) * 100;
}

// ============================================
// MAIN ESTIMATOR FUNCTION
// ============================================

export function estimateContributionFromEpc(epc: EPCData): ContributionResult | { error: string } {
  const floorArea = epc.totalFloorArea;
  
  if (!floorArea || floorArea <= 0) {
    return { error: 'We need floor area from EPC to estimate costs. Please select a different EPC record or enter details manually.' };
  }
  
  // Normalize inputs
  const builtForm = normalizeBuiltForm(epc.propertyType);
  const ageBand = getAgeBand(epc.constructionAgeBand);
  const rating = getEpcRating(epc.epcBand);
  const needsCylinder = isCombiBoiler(epc.hotWaterDescription);
  
  // Calculate adders
  const sizeAdder = getSizeAdder(floorArea);
  const builtFormAdder = getBuiltFormAdder(builtForm);
  const ageAdder = getAgeAdder(ageBand);
  const ratingAdder = getRatingAdder(rating);
  const cylinderAdder = needsCylinder ? CYLINDER_REQUIRED_ADDER : 0;
  const cylinderUpsizingAdder = (needsCylinder && floorArea >= 131) ? CYLINDER_UPSIZING_ADDER : 0;
  
  const radiatorScore = getRadiatorScore(rating, ageBand, floorArea, builtForm);
  const radiatorAdder = getRadiatorAdder(radiatorScore);
  
  // Calculate total
  const rawContribution = sizeAdder + builtFormAdder + ageAdder + ratingAdder + cylinderAdder + cylinderUpsizingAdder + radiatorAdder;
  const contribution = Math.min(CONTRIBUTION_CAP, Math.max(0, roundToNearest100(rawContribution)));
  
  // Build explanations (only for items that apply)
  const explanations: ContributionExplanation[] = [];
  
  if (sizeAdder > 0) {
    explanations.push({
      key: 'size',
      label: 'Property size',
      amount: sizeAdder,
      description: `At ${Math.round(floorArea)} m², your home may require a larger heat pump system`,
    });
  }
  
  if (builtFormAdder > 0) {
    const formLabel = builtForm.charAt(0).toUpperCase() + builtForm.slice(1).replace('-', ' ');
    explanations.push({
      key: 'builtForm',
      label: 'Property type',
      amount: builtFormAdder,
      description: `${formLabel} properties can have more complex installation requirements`,
    });
  }
  
  if (ageAdder > 0) {
    const ageLabel = ageBand === 'pre1950' ? 'pre-1950' : '1950–1979';
    explanations.push({
      key: 'age',
      label: 'Property age',
      amount: ageAdder,
      description: `Homes built ${ageLabel} often need additional preparation work`,
    });
  }
  
  if (ratingAdder > 0) {
    const ratingLabel = rating === 'unknown' ? 'unknown rating' : `rating ${rating}`;
    explanations.push({
      key: 'rating',
      label: 'Energy efficiency',
      amount: ratingAdder,
      description: `Your EPC ${ratingLabel} suggests some efficiency improvements may help`,
    });
  }
  
  if (cylinderAdder > 0) {
    explanations.push({
      key: 'cylinder',
      label: 'Hot water cylinder',
      amount: cylinderAdder + cylinderUpsizingAdder,
      description: 'Your current system uses a combi boiler, so a hot water cylinder will be needed',
    });
  }
  
  if (radiatorAdder > 0) {
    explanations.push({
      key: 'radiators',
      label: 'Radiator upgrades',
      amount: radiatorAdder,
      description: 'Based on your home\'s age and efficiency, some radiators may need upgrading',
    });
  }
  
  return {
    contribution,
    breakdown: {
      sizeAdder,
      builtFormAdder,
      ageAdder,
      ratingAdder,
      cylinderAdder,
      cylinderUpsizingAdder,
      radiatorAdder,
    },
    explanations,
    debug: {
      floorArea,
      builtForm,
      ageBand,
      epcRating: rating,
      hotWater: needsCylinder ? 'combi' : 'cylinder',
      radiatorScore,
    },
  };
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatContribution(amount: number): string {
  return `£${amount.toLocaleString()}`;
}
