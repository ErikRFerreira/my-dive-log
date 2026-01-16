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
const GAS_MIX = ['', 'air', 'nitrox'] as const;
const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
const WATER_TEMP_LIMITS = {
  metric: { min: -2, max: 40 },
  imperial: { min: 28, max: 104 },
} as const;
const DEPTH_LIMITS = {
  metric: 50,
  imperial: 164,
} as const;
const DURATION_LIMIT = 200;
const NITROX_CONFIG = {
  MIN_O2_PERCENT: 21,  // Air
  MAX_O2_PERCENT: 100, // Pure O2
  DEFAULT_NITROX: 32,  // EAN32
} as const;

const isFutureDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed > today;
};

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

const optionalPositiveIntegerString = (label: string) =>
  z
    .string()
    .refine((value) => {
      const trimmed = value.trim();
      if (!trimmed) return true;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed);
    }, `${label} must be a whole number greater than 0`);

export const logDiveSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((value) => !isFutureDate(value), 'Dive date cannot be in the future'),
    countryCode: z.string().length(2, 'Select a country'),
    location: z.string().min(1, 'Location is required').trim(),
    maxDepth: requiredNumberString('Max depth'),
    duration: requiredNumberString('Duration'),
    diveType: z.enum(DIVE_TYPES),
    waterType: z.enum(WATER_TYPES),
    exposure: z.enum(EXPOSURE_TYPES),
    currents: z.enum(CURRENTS),
    weight: optionalPositiveIntegerString('Weight'),
    waterTemp: optionalNumberString('Water temperature'),
    unitSystem: z.enum(UNIT_SYSTEMS).default('metric'),
    visibility: z.enum(VISIBILITY),
    equipment: z.array(z.string()).default([]),
    wildlife: z.array(z.string()).default([]),
    notes: z.string().max(2000, 'Notes must be 2000 characters or less'),
    cylinderType: z.string(),
    cylinderSize: z.string(),
    gasMix: z.enum(GAS_MIX),
    nitroxPercent: z.number().min(NITROX_CONFIG.MIN_O2_PERCENT).max(NITROX_CONFIG.MAX_O2_PERCENT).default(NITROX_CONFIG.DEFAULT_NITROX),
    startingPressure: optionalNumberString('Starting pressure'),
    endingPressure: optionalNumberString('Ending pressure'),
  })
  .superRefine((data, ctx) => {
    const trimmed = data.waterTemp.trim();
    if (!trimmed) return;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return;
    const limits =
      data.unitSystem === 'imperial' ? WATER_TEMP_LIMITS.imperial : WATER_TEMP_LIMITS.metric;
    if (parsed < limits.min || parsed > limits.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['waterTemp'],
        message: `Water temperature must be between ${limits.min} and ${limits.max} ${
          data.unitSystem === 'imperial' ? 'F' : 'C'
        }.`,
      });
    }

    const depthTrimmed = data.maxDepth.trim();
    if (!depthTrimmed) return;
    const depthParsed = Number(depthTrimmed);
    if (!Number.isFinite(depthParsed)) return;
    const depthLimit = data.unitSystem === 'imperial' ? DEPTH_LIMITS.imperial : DEPTH_LIMITS.metric;
    if (depthParsed > depthLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxDepth'],
        message: `Max depth must be ${depthLimit} ${
          data.unitSystem === 'imperial' ? 'ft' : 'm'
        } or less.`,
      });
    }

    const weightTrimmed = data.weight.trim();
    if (!weightTrimmed) return;
    const weightParsed = Number(weightTrimmed);
    if (!Number.isFinite(weightParsed)) return;
    const maxKg = 20;
    const maxWeight = data.unitSystem === 'imperial' ? maxKg * 2.20462 : maxKg;
    if (weightParsed > maxWeight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weight'],
        message:
          data.unitSystem === 'imperial'
            ? `Weight must be ${maxWeight.toFixed(1)} lbs or less.`
            : `Weight must be ${maxKg} kg or less.`,
      });
    }

    const durationTrimmed = data.duration.trim();
    if (!durationTrimmed) return;
    const durationParsed = Number(durationTrimmed);
    if (!Number.isFinite(durationParsed)) return;
    if (durationParsed > DURATION_LIMIT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['duration'],
        message: `Duration must be ${DURATION_LIMIT} minutes or less.`,
      });
    }
  });

export type LogDiveFormInput = z.input<typeof logDiveSchema>;
export type LogDiveFormData = z.output<typeof logDiveSchema>;
