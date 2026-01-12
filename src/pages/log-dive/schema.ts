import { z } from 'zod';

const DIVE_TYPES = [
  '',
  'reef',
  'wreck',
  'wall',
  'cave',
  'drift',
  'night',
  'training',
  'lake-river',
] as const;

const WATER_TYPES = ['', 'salt', 'fresh'] as const;
const EXPOSURE_TYPES = ['', '3mm', '5mm', '7mm', 'semi-dry', 'drysuit', 'other'] as const;
const CURRENTS = ['', 'calm', 'mild', 'moderate', 'strong'] as const;
const VISIBILITY = ['', 'poor', 'fair', 'good', 'excellent'] as const;
const GAS_MIX = ['', 'air', 'nitrox', 'trimix', 'rebreather'] as const;
const UNIT_SYSTEMS = ['metric', 'imperial'] as const;

const requiredNumberString = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number`);

const optionalNumberString = (label: string) =>
  z
    .string()
    .refine(
      (value) => value.trim() === '' || Number.isFinite(Number(value)),
      `${label} must be a number`
    );

export const logDiveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  countryCode: z.string().length(2, 'Select a country'),
  location: z.string().min(1, 'Location is required').trim(),
  maxDepth: requiredNumberString('Max depth'),
  depthUnit: z.enum(UNIT_SYSTEMS).default('metric'),
  duration: requiredNumberString('Duration'),
  diveType: z.enum(DIVE_TYPES),
  waterType: z.enum(WATER_TYPES),
  exposure: z.enum(EXPOSURE_TYPES),
  currents: z.enum(CURRENTS),
  weight: optionalNumberString('Weight'),
  waterTemp: optionalNumberString('Water temperature'),
  temperatureUnit: z.enum(UNIT_SYSTEMS).default('metric'),
  visibility: z.enum(VISIBILITY),
  equipment: z.array(z.string()).default([]),
  wildlife: z.array(z.string()).default([]),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less'),
  cylinderType: z.string(),
  cylinderSize: z.string(),
  gasMix: z.enum(GAS_MIX),
  nitroxPercent: z.number().min(21).max(100).default(32),
  weightUnit: z.enum(UNIT_SYSTEMS).default('metric'),
  pressureUnit: z.enum(UNIT_SYSTEMS).default('metric'),
  startingPressure: optionalNumberString('Starting pressure'),
  endingPressure: optionalNumberString('Ending pressure'),
});

export type LogDiveFormData = z.infer<typeof logDiveSchema>;
