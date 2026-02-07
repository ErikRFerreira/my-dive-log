import { removeDiveCoverPhoto } from '@/services/apiDivePhotos';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CoverPhotoParams } from '../types';
import toast from 'react-hot-toast';

/**
 * Hook for removing a dive photo as the cover photo.
 * Invalidates dive and location queries on success.
 */
export function useRemoveCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, diveId }: CoverPhotoParams) =>
      removeDiveCoverPhoto(photoId, diveId),

    onSuccess: () => {
      toast.success('Cover photo removed');

      // Invalidate queries to refresh with new cover
      queryClient.invalidateQueries({ queryKey: ['dive'] });
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      queryClient.invalidateQueries({ queryKey: ['cover-photo'] });
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove cover photo');
    },
  });
}