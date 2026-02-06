import { z } from 'zod';

/**
 * Geocode result schema.
 */
export const geocodeResultSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

/**
 * AI summary response schema.
 */
export const aiSummaryResponseSchema = z.string();

// Export inferred types
export type GeocodeResultSchemaType = z.infer<typeof geocodeResultSchema>;
