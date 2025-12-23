import { supabase } from './supabase';

/**
 * Sign in a user with Supabase email/password auth.
 *
 * @param {{ email: string; password: string }} params - Credentials to pass to Supabase.
 * @returns {Promise<import('@supabase/supabase-js').AuthTokenResponsePassword>} Auth data (session/user) from Supabase.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function login({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Sign out the current user from Supabase.
 *
 * @returns {Promise<true>} Resolves with true when sign-out succeeds.
 * @throws {Error} When Supabase returns a sign-out error.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  return true;
}

/**
 * Fetch the currently authenticated user from Supabase.
 *
 * @returns {Promise<import('@supabase/supabase-js').User | null>} The user when authenticated, or null otherwise.
 * @throws {Error} When Supabase fails to read the session.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return user;
}
