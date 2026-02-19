export const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
export const MODEL_SEED = 42;
export const MODEL_TEMPERATURE = 0.2;
export const MODEL_MAX_TOKENS = 260;

export const DIVE_TYPE_LABELS: Record<string, string> = {
  reef: 'Reef',
  wreck: 'Wreck',
  wall: 'Wall',
  cave: 'Cave',
  drift: 'Drift',
  night: 'Night',
  training: 'Training',
  lake_river: 'Lake/River',
};

export const VISIBILITY_LABELS: Record<string, string> = {
  poor: 'Poor',
  fair: 'Fair',
  good: 'Good',
  excellent: 'Excellent',
};

export const WATER_TYPE_LABELS: Record<string, string> = {
  fresh: 'Fresh water',
  salt: 'Salt water',
};

export const EXPOSURE_LABELS: Record<string, string> = {
  'wet-2mm': 'Wetsuit (2mm)',
  'wet-3mm': 'Wetsuit (3mm)',
  'wet-5mm': 'Wetsuit (5mm)',
  'wet-7mm': 'Wetsuit (7mm)',
  'semi-dry': 'Semi-dry suit',
  dry: 'Dry suit',
};

export const CURRENT_LABELS: Record<string, string> = {
  calm: 'Calm',
  mild: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
};

export const GAS_LABELS: Record<string, string> = {
  air: 'Air',
  nitrox: 'Nitrox',
};

export const DEFAULT_SUMMARY = 'No summary available for this dive.';
export const DEFAULT_SIMILAR_LOCATIONS =
  'Not enough information to suggest similar environments.';
export const DEFAULT_TIPS = 'No specific tips for this dive.';
export const DEFAULT_FUTURE_PRACTICE = 'No specific recommendations.';
