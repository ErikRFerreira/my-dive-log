import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { uploadAvatar } from '@/services/apiProfile';

export function useUploadAvatar(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error('Missing user ID');
      return uploadAvatar(userId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['avatarSignedUrl'] });
      toast.success('Avatar updated.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar.';
      toast.error(message);
    },
  });

  return { isPending, uploadAvatar: mutateAsync };
}
