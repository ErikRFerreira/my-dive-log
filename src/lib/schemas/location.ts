import { z } from 'zod';
import { locationSchema } from './dive';

/**
 * Array of locations response.
 */
export const locationsResponseSchema = z.array(locationSchema).nullable();

/**
 * Single location response.
 */
export const locationResponseSchema = locationSchema;

// Export inferred types
export type LocationsResponseType = z.infer<typeof locationsResponseSchema>;
