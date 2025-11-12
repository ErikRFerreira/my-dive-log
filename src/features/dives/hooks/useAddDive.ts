import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDive } from '../../../services/apiDives';

export function useAddDive() {
  const queryClient = useQueryClient();

  const { isPending, mutate: mutateAdd } = useMutation({
    mutationFn: createDive,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dives'] });
    },
    onError: (error) => {
      console.error('Error adding dive:', error);
    },
  });
  return { isPending, mutateAdd };
}
