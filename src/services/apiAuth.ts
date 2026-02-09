import { supabase } from './supabase';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return '';
}

/**
 * Detects auth errors that should be treated as an unauthenticated state.
 */
export function isUnauthenticatedAuthError(error: unknown): boolean {
  const normalized = getErrorMessage(error).toLowerCase();

  return (
    normalized.includes('auth session missing') ||
    normalized.includes('session missing') ||
    normalized.includes('invalid jwt') ||
    normalized.includes('jwt expired') ||
    normalized.includes('refresh token not found') ||
    normalized.includes('invalid refresh token')
  );
}

/**
 * Convert various auth-related errors into user-friendly messages.
 * 
 * @param {unknown} error - The original error thrown during an auth operation.
 * @param {string} fallbackMessage - A generic message to use if the error cannot be parsed.
 * @returns {Error} A user-friendly error object.
 */
function toFriendlyAuthError(error: unknown, fallbackMessage: string): Error {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return new Error('No internet connection. Please check your network and try again.');
  }

  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch failed') ||
    normalized.includes('network request failed') ||
    normalized.includes('project is paused') ||
    normalized.includes('service unavailable')
  ) {
    return new Error('Authentication service is temporarily unavailable. Please try again shortly.');
  }

  if (message) return new Error(message);
  return new Error(fallbackMessage);
}

/**
 * Get the current authenticated user's ID.
 *
 * @returns {Promise<string>} The user ID.
 * @throws {Error} When the user is not authenticated or Supabase returns an error.
 */
export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('User must be authenticated');

  return user.id;
}

/**
 * Sign in a user with Supabase email/password auth.
 *
 * @param {{ email: string; password: string }} params - Credentials to pass to Supabase.
 * @returns {Promise<import('@supabase/supabase-js').AuthTokenResponsePassword>} Auth data (session/user) from Supabase.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function login({ email, password }: { email: string; password: string }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Login failed. Please try again.');
  }
}

/**
 * Start a Google OAuth sign-in flow via Supabase.
 *
 * Note: this redirects the browser to Google, then back to `redirectTo`.
 *
 * @param {{ redirectTo?: string }} [params] - Optional redirect settings.
 * @param {string} [params.redirectTo] - Callback URL; defaults to `${window.location.origin}/auth/callback`.
 * @returns {Promise<import('@supabase/supabase-js').OAuthResponse>} OAuth data used for the redirect flow.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function loginWithGoogle({ redirectTo }: { redirectTo?: string } = {}) {
  try {
    const resolvedRedirectTo =
      redirectTo ??
      (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: resolvedRedirectTo ? { redirectTo: resolvedRedirectTo } : undefined,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Google sign-in failed. Please try again.');
  }
}

/**
 * Request a password reset email via Supabase.
 *
 * Supabase will email a link that redirects back to `redirectTo`.
 *
 * @param {{ email: string; redirectTo?: string }} params - Reset password request settings.
 * @param {string} params.email - Target email address.
 * @param {string} [params.redirectTo] - Callback URL; defaults to `${window.location.origin}/auth/reset`.
 * @returns {Promise<import('@supabase/supabase-js').AuthResponse>} Supabase response data.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function requestPasswordReset({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo?: string;
}) {
  try {
    const resolvedRedirectTo =
      redirectTo ??
      (typeof window !== 'undefined' ? `${window.location.origin}/auth/reset` : undefined);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resolvedRedirectTo,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Unable to send reset email. Please try again.');
  }
}

/**
 * Update the current user's password.
 *
 * Typically used after a recovery/reset flow, but can also be used for signed-in
 * email/password users.
 *
 * @param {{ password: string }} params - Password update settings.
 * @param {string} params.password - New password.
 * @returns {Promise<import('@supabase/supabase-js').UserResponse>} Supabase response data.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function updatePassword({ password }: { password: string }) {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Update the current user's email address.
 *
 * Note: Supabase may require confirmation depending on your Auth settings.
 *
 * @param {{ email: string }} params - Email update settings.
 * @param {string} params.email - New email address.
 * @returns {Promise<import('@supabase/supabase-js').UserResponse>} Supabase response data.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function updateEmail({ email }: { email: string }) {
  const { data, error } = await supabase.auth.updateUser({ email });

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Create a new user via Supabase email/password auth.
 *
 * Depending on your Supabase project settings, this may:
 * - return a session immediately (email confirmations off), OR
 * - return a user only and require email confirmation (confirmations on).
 *
 * @param {object} params - Registration settings.
 * @param {string} params.email - Email address to register.
 * @param {string} params.password - Password to register.
 * @param {string} params.fullName - Display name stored in user metadata.
 * @param {string} [params.emailRedirectTo] - Confirmation redirect URL; defaults to `${window.location.origin}/login`.
 * @returns {Promise<import('@supabase/supabase-js').AuthResponse>} Supabase sign-up response data.
 * @throws {Error} When Supabase returns an auth error.
 */
export async function registerWithEmail({
  email,
  password,
  fullName,
  emailRedirectTo,
}: {
  email: string;
  password: string;
  fullName: string;
  emailRedirectTo?: string;
}) {
  try {
    const resolvedEmailRedirectTo =
      emailRedirectTo ??
      (typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: resolvedEmailRedirectTo,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Registration failed. Please try again.');
  }
}

/**
 * Sign out the current user from Supabase.
 *
 * @returns {Promise<true>} Resolves with true when sign-out succeeds.
 * @throws {Error} When Supabase returns a sign-out error.
 */
export async function logout(): Promise<boolean> {
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

  if (error) {
    if (isUnauthenticatedAuthError(error)) return null;
    throw error;
  }
  return user;
}

/**
 * Delete the current user's account (and their related app data).
 *
 * This calls a server-side API route because Supabase user deletion requires
 * a service role key and must not run in the browser.
 *
 * @returns {Promise<true>} Resolves with true when deletion succeeds.
 * @throws {Error} When the user is not authenticated or deletion fails.
 */
export async function deleteAccount(): Promise<true> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);
  const token = session?.access_token;
  if (!token) throw new Error('User must be authenticated');

  const res = await fetch('/api/delete-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const bodyText = await res.text();
  let data: { error?: string } = {};

  try {
    data = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // keep `data` as {}
  }

  if (!res.ok) {
    throw new Error(data.error || `Delete account failed (${res.status})`);
  }

  await supabase.auth.signOut();
  return true;
}
