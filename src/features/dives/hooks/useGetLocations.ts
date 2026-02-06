import { useUser } from '@/features/authentication';
import { useQuery } from '@tanstack/react-query';

import { fetchLocationsByUser } from '../../../services/apiLocations';

export function useGetLocations() {
  const { user } = useUser();
  const userId = user?.id;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['locations', userId],
    enabled: !!userId,
    queryFn: () => fetchLocationsByUser(userId as string),
    staleTime: 60_000,
  });

  return {
    locations: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
