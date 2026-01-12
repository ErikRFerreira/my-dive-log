import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useUser } from '@/features/authentication';
import type { Location } from '@/features/locations/types';

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

type UseGetDivesOptions = {
  locations?: Location[];
};

export function useGetDives(filters?: DiveFilters, options: UseGetDivesOptions = {}) {
  const { user } = useUser();
  const userId = user?.id;
  const locations = options.locations ?? [];

  const { sortBy, maxDepth, locationId, country, page, pageSize, searchQuery } = filters ?? {};

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['dives', userId, sortBy, maxDepth, locationId, country, page, pageSize, searchQuery],
    enabled: !!userId,
    queryFn: () => getDives(filters),
    placeholderData: keepPreviousData,
  });

  const locationsById = useMemo(() => {
    if (!locations.length) return null;
    return new Map(locations.map((location) => [location.id, location]));
  }, [locations]);

  const normalizedDives = useMemo(() => {
    const dives = data?.dives ?? null;
    if (!dives) return null;
    if (!locationsById) return dives;

    return dives.map((dive) => {
      if (dive.locations) return dive;
      if (!dive.location_id) return dive;

      const location = locationsById.get(dive.location_id) ?? null;
      return { ...dive, locations: location };
    });
  }, [data, locationsById]);

  return {
    dives: normalizedDives,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
