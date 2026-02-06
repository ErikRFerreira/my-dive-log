import type { z } from 'zod';

/**
 * Development-only API response validator.
 * In production, this function returns data as-is with zero performance cost.
 * In development, it validates responses against Zod schemas and logs warnings.
 *
 * @param schema - Zod schema to validate against
 * @param data - API response data to validate
 * @param endpoint - Optional endpoint name for better error messages
 * @returns The original data (unmodified)
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint?: string
): T {
  // In production, skip validation entirely (zero performance cost)
  if (import.meta.env.PROD) {
    return data as T;
  }

  // Development-only validation
  try {
    return schema.parse(data);
  } catch (error) {
    const endpointInfo = endpoint ? ` (${endpoint})` : '';
    console.warn(`⚠️ API Response Validation Failed${endpointInfo}:`, error);
    console.warn('Received data:', data);
    
    // Return data anyway to avoid breaking the app during development
    return data as T;
  }
}

/**
 * Safe parse that returns { success: true, data } or { success: false, error }.
 * Only runs in development mode.
 */
export function safeValidateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint?: string
): { success: true; data: T } | { success: false; error: z.ZodError } {
  if (import.meta.env.PROD) {
    return { success: true, data: data as T };
  }

  const result = schema.safeParse(data);
  
  if (!result.success) {
    const endpointInfo = endpoint ? ` (${endpoint})` : '';
    console.warn(`⚠️ API Response Validation Failed${endpointInfo}:`, result.error);
    console.warn('Received data:', data);
  }

  return result as { success: true; data: T } | { success: false; error: z.ZodError };
}
