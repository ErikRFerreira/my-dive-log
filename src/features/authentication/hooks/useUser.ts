import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../../../services/apiAuth';

export function useUser() {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return { user, isLoading, isError, error };
}
