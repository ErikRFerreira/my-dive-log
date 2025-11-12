import { z } from 'zod';

export const diveFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required').trim(),
  countryCode: z.string().length(2, 'Select a country'),
  depth: z.number({ message: 'Depth is required' }).min(0, 'Depth must be >= 0'),
  duration: z.number({ message: 'Duration is required' }).min(1, 'Duration must be >= 1'),
  notes: z.string().max(500, 'Notes must be <= 500 characters').optional(),
});

export type DiveFormInput = z.infer<typeof diveFormSchema>;
