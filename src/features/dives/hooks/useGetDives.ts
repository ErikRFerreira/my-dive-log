import { keepPreviousData, useQuery } from '@tanstack/react-query';

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
      sortBy,
      maxDepth,
      locationId,
      country,
      page,
      pageSize,
      searchQuery,
    ],
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
