import { useQuery } from '@tanstack/react-query';
import { getDives } from '../../../services/apiDives';

export function useGetDives() {
  const {
    data: dives,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dives'],
    queryFn: getDives,
  });

  return { dives, isLoading, isFetching, isError, refetch };
}
