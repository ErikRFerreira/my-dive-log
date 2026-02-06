import { useQuery } from '@tanstack/react-query';
import { queryRetryConfig } from '@/lib/queryClient';
import { getUserProfile } from '../../../services/apiProfile';

export function useGetProfile(userId: string | undefined) {
  const {
    data: profile,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: () => getUserProfile(userId as string),
    staleTime: 60_000,
    ...queryRetryConfig,
  });

  return { profile, isLoading, isFetching, isError, refetch };
}
