import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadDivePhotoToBucket } from '@/services/apiDivePhotos';
import toast from 'react-hot-toast';

type UploadDivePhotoParams = {
  diveId: string;
  file: File;
}

/**
 * Hook for uploading a single dive photo to Supabase Storage.
 * Invalidates dive queries on success to reflect the new photo.
 */
export function useUploadDivePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ diveId, file }: UploadDivePhotoParams) =>
      uploadDivePhotoToBucket(diveId, file),
    
    onSuccess: (_storagePath, variables) => {
      toast.success('Photo uploaded successfully');
      
      // Refetch dive photos query to show new photo immediately
      queryClient.refetchQueries({ queryKey: ['divePhotos', variables.diveId] });
      
      // Invalidate dive queries to refetch with new photo
      queryClient.invalidateQueries({ queryKey: ['dive'] });
      queryClient.invalidateQueries({ queryKey: ['dives'] });
    },
    
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload photo');
    },
  });
}
