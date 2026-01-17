import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDiveCoverPhoto } from '@/services/apiDivePhotos';
import toast from 'react-hot-toast';

type SetCoverPhotoParams = {
  photoId: string;
  diveId: string;
};

/**
 * Hook for setting a dive photo as the cover photo.
 * Invalidates dive and location queries on success.
 */
export function useSetCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, diveId }: SetCoverPhotoParams) =>
      setDiveCoverPhoto(photoId, diveId),

    onSuccess: () => {
      toast.success('Cover photo updated');

      // Invalidate queries to refresh with new cover
      queryClient.invalidateQueries({ queryKey: ['dive'] });
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      queryClient.invalidateQueries({ queryKey: ['cover-photo'] });
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set cover photo');
    },
  });
}
