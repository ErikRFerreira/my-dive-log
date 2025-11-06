import { z } from 'zod';

export const newDiveSchema = z.object({
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  location: z.string().min(2, 'Location is required'),
  depth: z
    .number({ invalid_type_error: 'Depth is required' })
    .min(0.5, 'Too shallow to log')
    .max(151, 'Depth seems unrealistic'),
  duration: z
    .number({ invalid_type_error: 'Duration is required' })
    .min(5, 'Too short to log')
    .max(360, 'Duration seems unrealistic'),
  notes: z.string().max(1000).optional(),
});

export type DiveInput = z.infer<typeof newDiveSchema>;
