import { z } from 'zod';
import {
  visibilitySchema,
  currentsSchema,
  diveTypeSchema,
  waterTypeSchema,
  exposureSchema,
  gasSchema,
  isoDateSchema,
  isoDateTimeSchema,
  uuidSchema,
} from './shared';

/**
 * Location schema for API responses.
 */
export const locationSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  country: z.string().nullable(),
  country_code: z.string().nullable(),
  is_favorite: z.boolean().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

/**
 * Base dive schema for API responses.
 */
export const diveSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  location_id: uuidSchema.nullable(),
  date: isoDateSchema,
  depth: z.number(),
  duration: z.number(),
  notes: z.string().nullable(),
  summary: z.string().nullable(),
  created_at: isoDateTimeSchema,
  water_temp: z.number().nullable(),
  visibility: visibilitySchema.nullable(),
  start_pressure: z.number().nullable(),
  end_pressure: z.number().nullable(),
  air_usage: z.number().nullable(),
  equipment: z.array(z.string()).nullable(),
  wildlife: z.array(z.string()).nullable(),
  dive_type: diveTypeSchema.nullable(),
  water_type: waterTypeSchema.nullable(),
  exposure: exposureSchema.nullable(),
  gas: gasSchema.nullable(),
  currents: currentsSchema.nullable(),
  weight: z.number().nullable(),
  nitrox_percent: z.number().nullable(),
  cylinder_type: z.string().nullable(),
  cylinder_size: z.number().nullable(),
  locations: locationSchema.nullable().optional(),
  cover_photo_path: z.string().nullable(),
});

/**
 * Dive photo schema for API responses.
 */
export const divePhotoSchema = z.object({
  id: uuidSchema,
  dive_id: uuidSchema,
  photo_path: z.string(),
  created_at: isoDateTimeSchema,
  caption: z.string().nullable().optional(),
});

/**
 * Paginated dives response.
 */
export const divesResponseSchema = z.object({
  dives: z.array(diveSchema),
  totalCount: z.number().int().nonnegative(),
});

/**
 * Single dive response (can be null if not found).
 */
export const diveResponseSchema = diveSchema.nullable();

/**
 * Array of dive photos.
 */
export const divePhotosResponseSchema = z.array(divePhotoSchema);

// Export inferred types
export type LocationSchemaType = z.infer<typeof locationSchema>;
export type DiveSchemaType = z.infer<typeof diveSchema>;
export type DivePhotoSchemaType = z.infer<typeof divePhotoSchema>;
