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
    onError: (error) => {
      console.error('Error deleting dive:', error);
      toast.error('Failed to delete dive. Please try again.');
    },
  });
  return { isPending, mutateAsync };
}
