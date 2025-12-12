import { useQuery } from '@tanstack/react-query';
import { getDives } from '../../../services/apiDives';

export type DiveFilters = {
  sortBy?: 'date' | 'depth' | 'duration';
  maxDepth?: number;
  location?: string;
  page?: number;
  pageSize?: number;
};

export function useGetDives(filters?: DiveFilters) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dives', filters],
    queryFn: () => getDives(filters),
  });

  return { 
    dives: data?.dives ?? null, 
    totalCount: data?.totalCount ?? 0,
    isLoading, 
    isFetching, 
    isError, 
    refetch 
  };
}
