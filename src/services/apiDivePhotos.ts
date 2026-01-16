import { supabase } from './supabase';
import { getCurrentUserId } from './apiAuth';

export type DivePhoto = {
  id: string;
  dive_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  url: string; // derived (signed)
};

/**
 * Generates a signed URL for accessing a cover photo stored in Supabase Storage.
 *
 * @param {string} storagePath - The storage path of the cover image.
 * @returns {Promise<string>} The signed URL for accessing the cover image.
 */
export async function getCoverSignedUrl(
  storagePath: string,
  options?: {
    transform?: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill' };
  }
): Promise<string> {
  if (storagePath.startsWith('http')) return storagePath;

  const { data, error } = await supabase.storage
    .from('dive-photos')
    .createSignedUrl(storagePath, 60 * 60, options as never); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Uploads a dive photo to Supabase Storage under the authenticated user's directory.
 * Also creates a database record in the dive_photos table.
 * 
 * @param {string} diveId - Dive primary key.
 * @param {File} file - Photo file to upload.
 * @returns {Promise<string>} Storage path of the uploaded photo. 
 */
export async function uploadDivePhotoToBucket(
  diveId: string,
  file: File
): Promise<string> {
  const userId = await getCurrentUserId();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const photoId = crypto.randomUUID();

  // Path MUST start with userId (matches storage policy)
  // No photo name - random UUID used instead
  const path = `${userId}/dives/${diveId}/${photoId}.${ext}`;

  // 1. Upload to storage
  const { error: storageError } = await supabase.storage
    .from("dive-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    throw storageError;
  }

  // 2. Create database record
  const { error: dbError } = await supabase
    .from("dive_photos")
    .insert({
      id: photoId,
      user_id: userId,
      dive_id: diveId,
      storage_path: path,
      caption: null,
      sort_order: 0,
    });

  if (dbError) {
    // Rollback: delete the uploaded file if DB insert fails
    await supabase.storage.from("dive-photos").remove([path]);
    throw dbError;
  }

  // 3. Set cover photo if the dive doesn't have one yet.
  await supabase
    .from("dives")
    .update({ cover_photo_path: path })
    .eq("id", diveId)
    .eq("user_id", userId)
    .is("cover_photo_path", null);

  return path;
}

/**
 * Fetches all photos for a given dive, generating signed URLs for access.
 * Signed URLs mean the photos can be accessed securely for a limited time.
 * 
 * @param {string} diveId - Dive primary key
 * @returns {Promise<DivePhoto[]>} List of dive photos with signed URLs
 */
export async function fetchDivePhotos(diveId: string): Promise<DivePhoto[]> {
  const { data, error } = await supabase
    .from("dive_photos")
    .select("id, dive_id, storage_path, caption, sort_order, created_at")
    .eq("dive_id", diveId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];

  // Create signed URLs (1 hour)
  const signed = await Promise.all(
    rows.map(async (p) => {
      const { data: urlData, error: urlError } = await supabase.storage
        .from("dive-photos")
        .createSignedUrl(p.storage_path, 60 * 60);

      if (urlError) throw urlError;

      return {
        ...p,
        url: urlData.signedUrl,
      } satisfies DivePhoto;
    })
  );

  return signed;
}
