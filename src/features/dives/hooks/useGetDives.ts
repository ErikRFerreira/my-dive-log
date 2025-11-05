import { useQuery } from '@tanstack/react-query';
import { getDives } from '../services/apiDives';

export function useGetDives() {
  const {
    data: dives,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dives'],
    queryFn: getDives,
  });

  return { dives, isLoading, isError };
}
