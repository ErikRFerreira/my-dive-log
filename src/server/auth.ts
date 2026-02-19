import type { VercelRequest } from '@vercel/node';
import { createClient, type User } from '@supabase/supabase-js';

/**
 * Extracts the Bearer token from the Authorization header
 * 
 * @param {VercelRequest} req - The Vercel request object
 * @returns {string | null} The extracted token or null if not found
 */
export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (!header || Array.isArray(header)) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

/**
 * Validates required Supabase environment variables
 * 
 * @returns {{ supabaseUrl: string; supabaseAnonKey: string } | { error: string }} 
 *          Environment variables or error object
 */
export function getSupabaseEnv(): { supabaseUrl: string; supabaseAnonKey: string } | { error: string } {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    return { error: 'Missing Supabase URL environment variable' };
  }
  if (!supabaseAnonKey) {
    return { error: 'Missing Supabase anon key environment variable' };
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Verifies a Supabase JWT token and returns the authenticated user
 * 
 * @param {string} token - The JWT token to verify
 * @returns {Promise<{ user: User } | { error: string }>} User object or error
 */
export async function verifySupabaseToken(
  token: string
): Promise<{ user: User } | { error: string }> {
  const env = getSupabaseEnv();
  
  if ('error' in env) {
    return { error: env.error };
  }

  const { supabaseUrl, supabaseAnonKey } = env;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError) {
    return { error: userError.message };
  }
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  return { user };
}
