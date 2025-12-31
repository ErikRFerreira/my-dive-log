export type AvatarDisplayInput = {
  isProfileResolved: boolean;
  hasStoredAvatar: boolean;
  signedUrl: string | null | undefined;
  isLoadingSignedUrl: boolean;
  googleAvatarUrl: string | null | undefined;
};

export type AvatarDisplayResult = {
  avatarUrl: string;
  isPending: boolean;
};

/**
 * Avatar resolution order:
 * 1) Uploaded avatar (signed URL)
 * 2) Google/auth avatar
 * 3) Fallback initials
 *
 * While profile/signed-url data is being determined, return `isPending: true`
 * so callers can render a spinner instead of flashing initials.
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

