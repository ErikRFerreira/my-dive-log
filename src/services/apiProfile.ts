import type { UserProfile } from '@/features/profile';
import { supabase } from './supabase';
import { validateResponse } from '@/lib/validateResponse';
import { profileResponseSchema, stringResponseSchema } from '@/lib/schemas';

/**
 * Retrieves a user profile from Supabase by user ID.
 *
 * This function queries the 'profiles' table for a user with the specified ID.
 *
 * @param userId - The unique identifier of the user whose profile is to be fetched.
 * @returns The user profile object if found, otherwise null.
 * @throws If there is a database error during the fetch operation.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return validateResponse(profileResponseSchema, data ?? null, 'getUserProfile');
}

/**
 * Updates or inserts a user profile in Supabase.
 *
 * This function performs an upsert (update or insert) on the 'profiles' table for the given user ID.
 * If a profile with the specified ID exists, it will be updated; otherwise, a new profile will be created.
 *
 * @param userId - The unique identifier of the user whose profile is to be updated or inserted.
 * @param profileData - Partial profile data to update or insert.
 * @returns The updated or newly created user profile object, or null if not found.
 * @throws If there is a database error during the upsert operation.
 */
export async function upsertUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData }, { onConflict: 'id' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return validateResponse(profileResponseSchema, data, 'upsertUserProfile');
}

/**
 * Uploads a user's avatar image to Supabase Storage and updates the profile with the avatar path.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @param {File} file - The avatar image file to be uploaded.
 * @returns {Promise<string>} The path of the uploaded avatar image.
 */
export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  // store path on profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_path: path })
    .eq('id', userId);

  if (profileError) throw profileError;

  return validateResponse(stringResponseSchema, path, 'uploadAvatar');
}


/**
 * Generates a signed URL for accessing a user's avatar image stored in Supabase Storage.
 * 
 * @param {string} path - The storage path of the avatar image.
 * @returns {Promise<string>} The signed URL for accessing the avatar image.
 */
export async function getAvatarSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error) throw error;
  return validateResponse(stringResponseSchema, data.signedUrl, 'getAvatarSignedUrl');
}
