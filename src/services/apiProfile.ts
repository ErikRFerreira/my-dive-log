import type { UserProfile } from '@/features/profile';
import { supabase } from './supabase';

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
  return data ?? null;
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
  return data;
}
