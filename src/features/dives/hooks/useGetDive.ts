import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { queryRetryConfig } from '@/lib/queryClient';
import { getDiveById } from '../../../services/apiDives';
import { useUser } from '@/features/authentication';
import { useCoverPhotoUrl } from './useCoverPhotoUrl';

export function useGetDive() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const userId = user?.id;

  const {
    data: dive,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dive', userId, id],
    queryFn: () => getDiveById(id!),
    enabled: !!userId && !!id,
    ...queryRetryConfig,
  });

  const { coverPhotoUrl } = useCoverPhotoUrl(dive?.cover_photo_path);

  return { dive, isLoading, error, coverPhotoUrl, refetch };
}
