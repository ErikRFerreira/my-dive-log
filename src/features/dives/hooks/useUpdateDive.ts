import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDive } from '../../../services/apiDives';
import toast from 'react-hot-toast';
import type { UpdateDivePatch } from '../types';

export function useUpdateDive() {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ id, diveData }: { id: string; diveData: UpdateDivePatch }) =>
      updateDive(id, diveData),
    onSuccess: (_data, variables) => {
      const { id } = variables;
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      queryClient.invalidateQueries({ queryKey: ['dive', id] });
      // Show success toast
      toast.success('Dive updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating dive:', error);
      toast.error('Failed to update dive. Please try again.');
    },
  });
  return { isPending, mutateAsync };
}
