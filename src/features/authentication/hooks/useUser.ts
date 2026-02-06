import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser } from '../../../services/apiAuth';

export function useUser() {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return { user, isLoading, isError, error };
}
