import { z } from 'zod';

/**
 * Shared Zod schemas and preprocessing utilities.
 * Used for both form validation and API response validation.
 */

// ========== Enums ==========

export const visibilitySchema = z.enum(['poor', 'fair', 'good', 'excellent']);
export const currentsSchema = z.enum(['calm', 'mild', 'moderate', 'strong']);
export const diveTypeSchema = z.enum([
  'reef',
  'wreck',
  'wall',
  'cave',
  'drift',
  'night',
  'training',
  'lake-river',
]);
export const waterTypeSchema = z.enum(['salt', 'fresh']);
export const exposureSchema = z.enum(['wet-2mm', 'wet-3mm', 'wet-5mm', 'wet-7mm', 'semi-dry', 'dry']);
export const gasSchema = z.enum(['air', 'nitrox']);

// ========== Preprocessing Helpers ==========

/**
 * Converts empty strings to null for nullable string fields.
 */
export const emptyStringToNull = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z.string().trim().nullable()
);

/**
 * Converts various inputs to number or null.
 * Handles empty strings, undefined, and non-finite numbers.
 */
export const numberOrNull = z.preprocess((v) => {
  if (v === '' || v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().nullable());

/**
 * Validates and cleans string arrays, converting to null if empty.
 * Filters out empty strings and trims items.
 */
export const stringArrayOrNull = (maxItems = 20, maxLength = 40) =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null) return null;
      if (Array.isArray(v)) {
        const cleaned = v.map(String).map((s) => s.trim()).filter(Boolean);
        return cleaned.length ? cleaned : null;
      }
      return v;
    },
    z
      .array(z.string().max(maxLength, `Each item must be ${maxLength} characters or less`))
      .max(maxItems, `Maximum ${maxItems} items allowed`)
      .nullable()
  );

/**
 * ISO 8601 date string (YYYY-MM-DD).
 */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * ISO 8601 datetime string (flexible format).
 * Accepts any ISO 8601 datetime format from Supabase including microseconds.
 * Examples: 2024-01-15T10:30:00+00:00, 2024-01-15T10:30:00.123456+00:00
 */
export const isoDateTimeSchema = z.string().refine(
  (val) => {
    // Accept any string that looks like an ISO datetime
    // More permissive - just check basic structure
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);
  },
  { message: 'Must be a valid ISO datetime' }
);

/**
 * UUID v4 string.
 */
export const uuidSchema = z.string().uuid();

/**
 * Email validation.
 */
export const emailSchema = z.string().email('Invalid email address');

// ========== Constants ==========

export const DEPTH_LIMITS = {
  metric: { min: 0, max: 100 },
  imperial: { min: 0, max: 330 },
} as const;

export const WATER_TEMP_LIMITS = {
  metric: { min: -2, max: 40 },
  imperial: { min: 28, max: 104 },
} as const;

export const DURATION_LIMIT = 200;
export const TAG_LIST_LIMIT = 20;
export const TAG_ITEM_LIMIT = 40;

export const NITROX_CONFIG = {
  MIN_O2_PERCENT: 21,
  MAX_O2_PERCENT: 100,
} as const;
