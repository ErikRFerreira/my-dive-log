import { z } from 'zod';
import { emailSchema, uuidSchema } from './shared';

/**
 * Supabase user schema.
 * Matches Supabase's User type with all required fields.
 * Uses passthrough to allow additional fields.
 */
export const supabaseUserSchema = z.object({
  id: uuidSchema,
  email: emailSchema.optional(),
  phone: z.string().optional(),
  app_metadata: z.record(z.string(), z.unknown()),
  user_metadata: z.record(z.string(), z.unknown()).optional(),
  aud: z.string(),
  confirmation_sent_at: z.string().optional(),
  recovery_sent_at: z.string().optional(),
  email_change_sent_at: z.string().optional(),
  new_email: z.string().optional(),
  new_phone: z.string().optional(),
  invited_at: z.string().optional(),
  action_link: z.string().optional(),
  email_confirmed_at: z.string().optional(),
  phone_confirmed_at: z.string().optional(),
  confirmed_at: z.string().optional(),
  last_sign_in_at: z.string().optional(),
  role: z.string().optional(),
  updated_at: z.string().optional(),
  created_at: z.string(),
  banned_until: z.string().optional(),
  deleted_at: z.string().optional(),
  is_anonymous: z.boolean().optional(),
}).passthrough();

/**
 * Supabase session schema.
 */
export const supabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  user: supabaseUserSchema,
});

/**
 * Auth response with session and user.
 */
export const authResponseSchema = z.object({
  session: supabaseSessionSchema.nullable(),
  user: supabaseUserSchema.nullable(),
});

/**
 * User response (can be null if not authenticated).
 */
export const userResponseSchema = supabaseUserSchema.nullable();

/**
 * Boolean response for simple operations.
 */
export const booleanResponseSchema = z.boolean();

/**
 * String response (e.g., user ID, photo path, etc.).
 */
export const stringResponseSchema = z.string();

/**
 * UUID response.
 */
export const uuidResponseSchema = uuidSchema;

// Export inferred types
export type SupabaseUserSchemaType = z.infer<typeof supabaseUserSchema>;
export type AuthResponseSchemaType = z.infer<typeof authResponseSchema>;
