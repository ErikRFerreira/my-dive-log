/**
 * Utilities for resolving which avatar image to show for a user.
 *
 * Centralizes the precedence rules between stored uploads, auth provider avatars,
 * and fallback initials while exposing a pending state for UI spinners.
 */

/** Inputs used to resolve the avatar display state. */
export type AvatarDisplayInput = {
  isProfileResolved: boolean;
  hasStoredAvatar: boolean;
  signedUrl: string | null | undefined;
  isLoadingSignedUrl: boolean;
  googleAvatarUrl: string | null | undefined;
};

/** Result of avatar resolution, including URL and loading state. */
export type AvatarDisplayResult = {
  avatarUrl: string;
  isPending: boolean;
};

/**
 * Resolves the avatar URL and loading state for a user.
 *
 * Avatar resolution order:
 * 1) Uploaded avatar (signed URL)
 * 2) Google/auth avatar
 * 3) Fallback initials
 *
 * While profile or signed-url data is being determined, return `isPending: true`
 * so callers can render a spinner instead of flashing initials.
 *
 * @param input - Avatar resolution inputs from profile and storage state
 * @returns Resolved avatar URL and whether the display should be pending
 *
 * @example
 * const result = getAvatarDisplay({
 *   isProfileResolved: true,
 *   hasStoredAvatar: false,
 *   signedUrl: null,
 *   isLoadingSignedUrl: false,
 *   googleAvatarUrl: 'https://...',
 * });
 * // { avatarUrl: 'https://...', isPending: false }
 */
export function getAvatarDisplay({
  isProfileResolved,
  hasStoredAvatar,
  signedUrl,
  isLoadingSignedUrl,
  googleAvatarUrl,
}: AvatarDisplayInput): AvatarDisplayResult {
  const google = googleAvatarUrl ?? '';

  if (!isProfileResolved) {
    return { avatarUrl: '', isPending: true };
  }

  if (hasStoredAvatar) {
    if (isLoadingSignedUrl || !signedUrl) {
      return { avatarUrl: '', isPending: true };
    }
    return { avatarUrl: signedUrl, isPending: false };
  }

  if (google) {
    return { avatarUrl: google, isPending: false };
  }

  return { avatarUrl: '', isPending: false };
}
