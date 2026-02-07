import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDivePhoto } from '@/services/apiDivePhotos';
import toast from 'react-hot-toast';
import type { CoverPhotoParams } from '../types';

export function useDeleteDivePhoto() {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ photoId }: CoverPhotoParams) => deleteDivePhoto(photoId),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['divePhotos', variables.diveId] });
      queryClient.invalidateQueries({ queryKey: ['dive', variables.diveId] });
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      toast.success('Photo deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete photo. Please try again.');
    },
  });

  return { isPending, mutateAsync };
}
