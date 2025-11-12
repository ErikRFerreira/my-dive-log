import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getDiveById } from '../../../services/apiDives';

export function useGetDive() {
  const { id } = useParams<{ id: string }>();

  const {
    data: dive,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dive', id],
    queryFn: () => getDiveById(id!),
    enabled: !!id,
    retry: false,
  });

  return { dive, isLoading, error };
}
