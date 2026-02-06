import { useQuery } from '@tanstack/react-query';
import { getAvatarSignedUrl } from '@/services/apiProfile';

export function useAvatarSignedUrl(path: string | null | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['avatarSignedUrl', path],
    enabled: !!path,
    queryFn: () => getAvatarSignedUrl(path as string),
    staleTime: 60_000,
    retry: false,
  });

  return { signedUrl: data, isLoading, isError, error };
}

