/**
 * Utility functions for extracting and formatting user avatar data.
 * 
 * This module handles the extraction of avatar URLs and generation of
 * initials from user objects, providing fallbacks for missing data.
 */

import type { User } from '@supabase/supabase-js';

/**
 * Represents user avatar display information.
 * 
 * Contains both the avatar image URL (if available) and initials
 * for fallback display when no image is present.
 */
export type UserAvatarData = {
  /** URL to the user's avatar image, or empty string if unavailable */
  avatarUrl: string;
  /** User's initials for fallback display (1-2 characters) */
  initials: string;
};

/**
 * Generates initials from a seed string (typically a name or email).
 * 
 * Takes up to the first two words, extracts the first character from each,
 * and returns them uppercased. Returns empty string for empty input.
 * 
 * @param seed - The string to extract initials from (name, email, etc.)
 * @returns Initials (1-2 uppercase characters) or empty string
 * 
 * @example
 * getInitialsFromSeed("John Doe") // "JD"
 * getInitialsFromSeed("Alice") // "A"
 * getInitialsFromSeed("user@example.com") // "U"
 * getInitialsFromSeed("") // ""
 * 
 * @internal
 */
function getInitialsFromSeed(seed: string) {
  const normalized = seed.trim();
  if (!normalized) return '';

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/**
 * Extracts avatar display data from a Supabase user object.
 * 
 * Attempts to extract avatar URL from multiple possible sources in user_metadata:
 * 1. avatar_url (standard custom field)
 * 2. picture (OAuth provider field)
 * 
 * Generates initials from the user's full name if available, otherwise
 * falls back to email address or a default "U".
 * 
 * @param user - The Supabase user object (optional, may be null)
 * @returns Object containing avatar URL and initials for display
 * 
 * @example
 * const avatarData = getUserAvatarData(currentUser);
 * // { avatarUrl: "https://...", initials: "JD" }
 * 
 * const noUser = getUserAvatarData(null);
 * // { avatarUrl: "", initials: "U" }
 */
export function getUserAvatarData(user?: User | null): UserAvatarData {
  const email = user?.email ?? '';
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? '';

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    '';

  const initials = getInitialsFromSeed(fullName || email || 'U');

  return { avatarUrl, initials };
}

