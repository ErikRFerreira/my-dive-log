import { z } from 'zod';

export const createDiveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  location: z.string().min(1, 'Location is required').trim(),
  country_code: z.string().length(2, 'Select a country'),
  depth: z.number({ message: 'Depth is required' }).min(0, 'Depth must be >= 0'),
  duration: z.number({ message: 'Duration is required' }).min(1, 'Duration must be >= 1'),
  notes: z.string().max(500, 'Notes must be <= 500 characters').optional(),
});

export type CreateDiveInput = z.infer<typeof createDiveSchema>;
