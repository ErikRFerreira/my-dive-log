import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDivePhoto } from '@/services/apiDivePhotos';
import type { CoverPhotoParams } from '../types';
import toast from 'react-hot-toast';

/**
 * Hook for deleting a dive photo.
 * Invalidates dive queries so UI updates.
 */
export function useDeleteDivePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId }: CoverPhotoParams) => deleteDivePhoto(photoId),
    onSuccess: (_result, variables) => {
      toast.success('Photo deleted successfully');
      queryClient.refetchQueries({ queryKey: ['divePhotos', variables.diveId] });
      queryClient.invalidateQueries({ queryKey: ['dive'] });
      queryClient.invalidateQueries({ queryKey: ['dives'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete photo');
    },
  });
}
