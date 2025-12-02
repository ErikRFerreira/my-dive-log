import type { UserProfile } from '@/features/profile';
import { supabase } from './supabase';

/**
 * Fetches the user profile from Supabase by user ID.
 *
 * @param userId - The ID of the user whose profile is to be fetched.
 * @returns
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
 * Updates or inserts the user profile in Supabase.
 *
 * @param userId - The ID of the user whose profile is to be updated.
 * @param profileData - The profile data to update.
 * @returns
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
