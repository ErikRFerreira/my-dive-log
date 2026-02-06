import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDive } from '../../../services/apiDives';

export function useAddDive() {
  const queryClient = useQueryClient();

  const { isPending, mutate: mutateAdd } = useMutation({
    mutationFn: createDive,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dives'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add dive. Please try again.');
    },
  });
  return { isPending, mutateAdd };
}
