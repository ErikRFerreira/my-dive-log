import type { SupabaseClient } from '@supabase/supabase-js';

export type RateLimitResult =
  | {
      blocked: true;
      payload: {
        error: 'rate_limit';
        next_reset?: string | null;
      };
    }
  | null;

export async function enforceRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabase.rpc('consume_ai_credit', { user: userId, limit: 20 });
    if (error) {
      console.warn('Rate limit check failed (ignored):', error.message);
      return null;
    }

    const payload = Array.isArray(data) ? data[0] : data;
    if (payload && typeof payload === 'object' && 'allowed' in payload && payload.allowed === false) {
      return {
        blocked: true,
        payload: {
          error: 'rate_limit',
          next_reset: typeof payload.next_reset === 'string' ? payload.next_reset : null,
        },
      };
    }
  } catch (error) {
    console.warn('Rate limit RPC unavailable (ignored):', error);
  }

  return null;
}
