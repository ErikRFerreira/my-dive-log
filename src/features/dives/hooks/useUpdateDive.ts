import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateDive } from '../../../services/apiDives';
import { useUser } from '@/features/authentication';

import type { UpdateDivePatch } from '../types';

export function useUpdateDive() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ id, diveData }: { id: string; diveData: UpdateDivePatch }) =>
      updateDive(id, diveData),
      onSuccess: (updatedDive, variables) => {
        const { id } = variables;
        // Invalidate lists and detail queries.
        queryClient.invalidateQueries({ queryKey: ['dives'] });
        queryClient.invalidateQueries({ queryKey: ['location-dives'] });

        // Keep the currently viewed dive in sync immediately (user-scoped key).
        if (userId && updatedDive) {
          queryClient.setQueryData(['dive', userId, id], updatedDive);
        } else {
          queryClient.invalidateQueries({ queryKey: ['dive'] });
        }

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
