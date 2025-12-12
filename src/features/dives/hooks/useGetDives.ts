import { useQuery } from '@tanstack/react-query';
import { getDives } from '../../../services/apiDives';

export type DiveFilters = {
  sortBy?: 'date' | 'depth' | 'duration';
  maxDepth?: number;
  location?: string;
};

export function useGetDives(filters?: DiveFilters) {
  const {
    data: dives,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dives', filters],
    queryFn: () => getDives(filters),
  });

  return { dives, isLoading, isFetching, isError, refetch };
}
