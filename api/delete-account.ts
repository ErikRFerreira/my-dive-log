import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (!header || Array.isArray(header)) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) return res.status(500).json({ error: 'Missing Supabase URL env var' });
  if (!supabaseAnonKey) return res.status(500).json({ error: 'Missing Supabase anon key env var' });
  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY env var' });
  }

  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });

  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError) return res.status(401).json({ error: userError.message });
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
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

