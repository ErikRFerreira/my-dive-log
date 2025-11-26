import { supabase } from './supabase';

/**
 * Logs in a user to Supabase using email and password.
 *
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns - The user data if login is successful, otherwise throws an error.
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
 * Logs out the current user from Supabase.
 *
 * @returns True if logout was successful, otherwise throws an error.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  return true;
}

/**
 * Gets the current user from Supabase.
 *
 * @returns The current user data.
 */
export async function getCurrentUser() {
  console.log('Fetching current user from Supabase');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return user;
}
