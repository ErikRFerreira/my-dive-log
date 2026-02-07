import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from './utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate environment variables
  const env = getSupabaseEnv();
  if ('error' in env) {
    return res.status(500).json({ error: env.error });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY env var' });
  }

  // Verify authentication
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' });
  }

  const authResult = await verifySupabaseToken(token);
  if ('error' in authResult) {
    return res.status(401).json({ error: authResult.error });
  }

  const user = authResult.user;

  try {
    const adminClient = createClient(env.supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const userId = user.id;

    const { error: divesError } = await adminClient.from('dives').delete().eq('user_id', userId);
    if (divesError) return res.status(500).json({ error: divesError.message });

    const { error: locationsError } = await adminClient
      .from('locations')
      .delete()
      .eq('user_id', userId);
    if (locationsError) return res.status(500).json({ error: locationsError.message });

    const { error: profileError } = await adminClient.from('profiles').delete().eq('id', userId);
    if (profileError) return res.status(500).json({ error: profileError.message });

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) return res.status(500).json({ error: deleteUserError.message });

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('delete-account error:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}

