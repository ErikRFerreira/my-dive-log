import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from './utils/auth';

const DIVE_PHOTOS_BUCKET = 'dive-photos';
const STORAGE_PAGE_SIZE = 1000;
const STORAGE_REMOVE_BATCH_SIZE = 1000;

type StorageListEntry = {
  name?: string | null;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Joins a parent storage path with a child name, normalizing slashes.
 * @param parent - The parent folder path
 * @param childName - The child file or folder name
 * @returns A normalized path with no duplicate or trailing slashes
 */
function joinStoragePath(parent: string, childName: string): string {
  return `${parent}/${childName}`.replace(/\/+/g, '/').replace(/\/$/, '');
}

/**
 * Determines if a storage entry represents a folder or a file.
 * Folders have null id and metadata in Supabase storage listings.
 * @param item - The storage list entry to check
 * @returns True if the entry is a folder, false if it's a file
 */
function isFolderEntry(item: StorageListEntry): boolean {
  // Supabase list() returns folder-like entries with null id/metadata.
  return item.id == null || item.metadata == null;
}

/**
 * Recursively deletes all dive photos for a user from Supabase storage.
 * Traverses the user's folder structure, collecting all file paths, then removes them in batches.
 * @param adminClient - Supabase admin client with service role permissions
 * @param userId - The user ID whose photos should be deleted
 * @throws {Error} If listing or removing files fails
 */
async function deleteAllUserDivePhotos(
  adminClient: SupabaseClient,
  userId: string
): Promise<void> {
  const rootPrefix = userId.replace(/\/+$/, '');
  const pendingFolders: string[] = [rootPrefix];
  const filePaths: string[] = [];

  while (pendingFolders.length > 0) {
    const currentFolder = pendingFolders.pop();
    if (!currentFolder) break;

    let offset = 0;
    while (true) {
      const { data, error } = await adminClient.storage.from(DIVE_PHOTOS_BUCKET).list(currentFolder, {
        limit: STORAGE_PAGE_SIZE,
        offset,
      });

      if (error) {
        throw new Error(`Failed to list dive photos: ${error.message}`);
      }

      const entries = (data ?? []) as StorageListEntry[];
      if (entries.length === 0) {
        break;
      }

      for (const entry of entries) {
        const name = entry.name?.trim();
        if (!name || name === '.emptyFolderPlaceholder') continue;

        const fullPath = joinStoragePath(currentFolder, name);
        if (isFolderEntry(entry)) {
          pendingFolders.push(fullPath);
        } else {
          filePaths.push(fullPath);
        }
      }

      if (entries.length < STORAGE_PAGE_SIZE) {
        break;
      }
      offset += STORAGE_PAGE_SIZE;
    }
  }

  for (let i = 0; i < filePaths.length; i += STORAGE_REMOVE_BATCH_SIZE) {
    const batch = filePaths.slice(i, i + STORAGE_REMOVE_BATCH_SIZE);
    const { error: removeError } = await adminClient.storage.from(DIVE_PHOTOS_BUCKET).remove(batch);
    if (removeError) {
      throw new Error(`Failed to remove dive photos: ${removeError.message}`);
    }
  }
}

/**
 * Serverless API handler for user account deletion.
 * Requires JWT authentication. Deletes all user data including:
 * - Dive photos from storage
 * - Dive records
 * - Location records
 * - Profile record
 * - Auth user account
 * @param req - Vercel request object (must include Authorization header)
 * @param res - Vercel response object
 * @returns JSON response with success status or error message
 */
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

    try {
      await deleteAllUserDivePhotos(adminClient, userId);
    } catch (storageErr) {
      const storageErrorMessage =
        storageErr instanceof Error ? storageErr.message : 'Failed to cleanup dive photos';
      console.error('delete-account storage cleanup failed:', storageErrorMessage);
      return res.status(500).json({ error: storageErrorMessage });
    }

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
