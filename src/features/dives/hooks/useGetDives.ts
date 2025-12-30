import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useUser } from '@/features/authentication';

import { getDives } from '../../../services/apiDives';

export type DiveFilters = {
  sortBy?: 'date' | 'depth' | 'duration';
  maxDepth?: number;
  country?: string;
  locationId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
};

export function useGetDives(filters?: DiveFilters) {
  const { user } = useUser();
  const userId = user?.id;

  const {
    sortBy,
    maxDepth,
    locationId,
    country,
    page,
    pageSize,
    searchQuery,
  } = filters ?? {};
  
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'dives',
      userId,
      sortBy,
      maxDepth,
      locationId,
      country,
      page,
      pageSize,
      searchQuery,
    ],
    enabled: !!userId,
    queryFn: () => getDives(filters),
    placeholderData: keepPreviousData,
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
