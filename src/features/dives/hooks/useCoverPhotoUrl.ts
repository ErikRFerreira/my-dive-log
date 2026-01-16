import { useQuery } from '@tanstack/react-query';
import { getCoverSignedUrl } from '@/services/apiDivePhotos';

type CoverTransform = {
  width?: number;
  height?: number;
  resize?: 'cover' | 'contain' | 'fill';
};

type UseCoverPhotoUrlOptions = {
  transform?: CoverTransform;
};

export function useCoverPhotoUrl(
  storagePath?: string | null,
  options?: UseCoverPhotoUrlOptions
) {
  const transform = options?.transform;

  const {
    data: coverPhotoUrl,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'cover-photo',
      storagePath ?? null,
      transform?.width ?? null,
      transform?.height ?? null,
      transform?.resize ?? null,
    ],
    queryFn: () => getCoverSignedUrl(storagePath!, options),
    enabled: !!storagePath,
    staleTime: 1000 * 60 * 30,
  });

  return { coverPhotoUrl, isLoading, error };
}
