import { z } from 'zod';

// enums 
const visibilitySchema = z.enum(['poor', 'fair', 'good', 'excellent']);
const currentsSchema = z.enum(['calm', 'mild', 'moderate', 'strong']);
const diveTypeSchema = z.enum(['reef', 'wreck', 'wall', 'cave', 'drift', 'night', 'training']);
const waterTypeSchema = z.enum(['salt', 'fresh']);
const exposureSchema = z.enum(['wet-2mm', 'wet-5mm', 'wet-7mm', 'semi-dry', 'dry']);
const gasSchema = z.enum(['air', 'nitrox', 'trimix']);

// helpers
const emptyStringToNull = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z.string().trim().nullable()
);

const numberOrNull = z.preprocess((v) => {
  if (v === '' || v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : v; // leave as-is to trigger a zod error
}, z.number().nullable());

const yyyyMmDdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const stringArrayOrNull = z.preprocess((v) => {
  if (v === undefined || v === null) return null;
  if (Array.isArray(v)) {
    const cleaned = v.map(String).map((s) => s.trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  return v;
}, z.array(z.string()).nullable());


// Schema for updating dive with detailed information
export const updateDiveSchema = z.object({
  date: yyyyMmDdSchema,   
  location: z.string().trim().min(2, 'Location is required'),
  country: emptyStringToNull,
  country_code: emptyStringToNull,
  depth: z.number().min(0),
  duration: z.number().min(1),
  notes: emptyStringToNull,

  summary: emptyStringToNull,
  ai_summary: emptyStringToNull,

  water_temp: numberOrNull,
  visibility: visibilitySchema.nullable(),

  start_pressure: numberOrNull,
  end_pressure: numberOrNull,
  air_usage: numberOrNull,

  equipment: stringArrayOrNull,
  wildlife: stringArrayOrNull,

  dive_type: diveTypeSchema.nullable(),
  water_type: waterTypeSchema.nullable(),
  exposure: exposureSchema.nullable(),
  gas: gasSchema.nullable(),
  currents: currentsSchema.nullable(),
  weight: numberOrNull,
});

export type UpdateDiveInput = z.infer<typeof updateDiveSchema>;
