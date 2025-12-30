import type { User } from '@supabase/supabase-js';

export type UserAvatarData = {
  avatarUrl: string;
  initials: string;
};

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

