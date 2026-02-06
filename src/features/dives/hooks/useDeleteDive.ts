import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDive } from '../../../services/apiDives';
import toast from 'react-hot-toast';

export function useDeleteDive() {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: deleteDive,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      toast.success('Dive deleted successfully.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete dive. Please try again.');
    },
  });
  return { isPending, mutateAsync };
}
