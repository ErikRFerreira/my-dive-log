import type { User } from '@supabase/supabase-js';

function normalizeProviders(rawProviders: unknown): string[] {
  if (!Array.isArray(rawProviders)) return [];
  return rawProviders.filter((p): p is string => typeof p === 'string');
}

export function getUserAuthProviders(user?: User | null): string[] {
  const providersFromAppMetadata = normalizeProviders(user?.app_metadata?.providers);
  const providerFromAppMetadata =
    typeof user?.app_metadata?.provider === 'string' ? [user.app_metadata.provider] : [];
  const providersFromIdentities =
    user?.identities?.map((identity) => identity.provider).filter(Boolean) ?? [];

  return Array.from(
    new Set([...providersFromAppMetadata, ...providerFromAppMetadata, ...providersFromIdentities])
  );
}

export function userHasEmailPasswordIdentity(user?: User | null): boolean {
  return getUserAuthProviders(user).includes('email');
}

export function userIsGoogleOnly(user?: User | null): boolean {
  const providers = getUserAuthProviders(user);
  return providers.includes('google') && !providers.includes('email');
}

