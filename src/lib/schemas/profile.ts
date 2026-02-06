import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './shared';

/**
 * User profile schema for API responses.
 */
export const userProfileSchema = z.object({
  id: uuidSchema,
  agency: z.string().nullable(),
  avatar_path: z.string().nullable(),
  bio: z.string().nullable(),
  cert_level: z.string().nullable(),
  created_at: isoDateTimeSchema,
});

/**
 * Profile response (can be null if not found).
 */
export const profileResponseSchema = userProfileSchema.nullable();

// Export inferred types
export type UserProfileSchemaType = z.infer<typeof userProfileSchema>;
