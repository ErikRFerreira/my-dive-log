import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../../services/apiProfile';
import { useUser } from '@/features/authentication';

export function useGetProfile() {
  const { user } = useUser();
  const userId = user?.id;

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
    retry: false,
  });

  return { profile, isLoading, isFetching, isError, refetch };
}
