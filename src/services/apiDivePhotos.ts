import { getCurrentUserId } from './apiAuth';
import { supabase } from './supabase';

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

  return path;
}

/**
 * Deletes a dive photo by ID, including its storage object.
 *
 * @param {string} photoId - Dive photo primary key.
 * @returns {Promise<boolean>} True when delete succeeds.
 * @throws {Error} When Supabase returns an error.
 */
export async function deleteDivePhoto(photoId: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  const { data: photo, error: fetchError } = await supabase
    .from('dive_photos')
    .select('storage_path, dive_id')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;
  if (!photo) throw new Error('Photo not found');

  // If the photo is the cover photo, clear the cover_photo_path field
  const { error: coverError } = await supabase
    .from('dives')
    .update({ cover_photo_path: null })
    .eq('id', photo.dive_id)
    .eq('user_id', userId)
    .eq('cover_photo_path', photo.storage_path);

  if (coverError) throw coverError;

  // Delete the database record
  const { error: deleteError } = await supabase
    .from('dive_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  const { error: storageError } = await supabase.storage
    .from('dive-photos')
    .remove([photo.storage_path]);

  if (storageError) {
    console.warn('Failed to delete photo from storage:', storageError);
  }

  return true;
}

/**
 * Sets a dive photo as the cover photo for its dive.
 * 
 * @param {string} photoId - Dive photo primary key.
 * @param {string} diveId - Dive primary key.
 * @returns {Promise<boolean>} True when update succeeds.
 * @throws {Error} When Supabase returns an error.
 */
export async function setDiveCoverPhoto(photoId: string, diveId: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  // Fetch the photo to get its storage_path
  const { data: photo, error: fetchError } = await supabase
    .from('dive_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;
  if (!photo) throw new Error('Photo not found');

  // Update the dive's cover_photo_path
  const { error: updateError } = await supabase
    .from('dives')
    .update({ cover_photo_path: photo.storage_path })
    .eq('id', diveId)
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return true;
}

/**
 * Removes the cover photo designation from a dive photo if it is currently set as the cover.
 * 
 * @param {string} photoId - Dive photo primary key.
 * @param {string} diveId - Dive primary key.
 * @returns {Promise<boolean>} True when update succeeds.
 * @throws {Error} When Supabase returns an error.
 */
export async function removeDiveCoverPhoto(photoId: string, diveId: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  // Fetch the photo to get its storage_path
  const { data: photo, error: fetchError } = await supabase
    .from('dive_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;
  if (!photo) throw new Error('Photo not found');

  // Only clear cover_photo_path if it matches the photo being removed
  const { error: updateError } = await supabase
    .from('dives')
    .update({ cover_photo_path: null })
    .eq('id', diveId)
    .eq('user_id', userId)
    .eq('cover_photo_path', photo.storage_path);

  if (updateError) throw updateError;

  return true;
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
        id: p.id,
        dive_id: p.dive_id,
        storage_path: p.storage_path,
        caption: p.caption,
        sort_order: p.sort_order,
        created_at: p.created_at,
        url: urlData.signedUrl,
      } satisfies DivePhoto;
    })
  );

  return signed;
}

