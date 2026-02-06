import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateDive } from '../../../services/apiDives';
import { useUser } from '@/features/authentication';

import type { UpdateDivePatch, Dive } from '../types';

export function useUpdateDive() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;

  const { isPending, mutateAsync } = useMutation({
    mutationFn: ({ id, diveData }: { id: string; diveData: UpdateDivePatch }) =>
      updateDive(id, diveData),
    onMutate: async ({ id, diveData }) => {
      // Cancel any outgoing refetches to prevent optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: ['dive', userId, id] });

      // Snapshot the previous value
      const previousDive = queryClient.getQueryData<Dive>(['dive', userId, id]);

      // Optimistically update to the new value
      if (previousDive) {
        queryClient.setQueryData<Dive>(['dive', userId, id], (old) => {
          if (!old) return old;
          return {
            ...old,
            ...diveData,
            // Preserve location relation if not updating it
            locations: diveData.locationName
              ? {
                  id: old.location_id ?? '',
                  name: diveData.locationName,
                  country: diveData.locationCountry ?? null,
                  country_code: diveData.locationCountryCode ?? null,
                }
              : old.locations,
          };
        });
      }

      // Return context with snapshot
      return { previousDive };
    },
    onSuccess: (updatedDive, variables) => {
      const { id } = variables;
      // Invalidate lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['dives'] });
      queryClient.invalidateQueries({ queryKey: ['location-dives'] });

      // Update the detail query with the actual response from the server
      if (userId && updatedDive) {
        queryClient.setQueryData(['dive', userId, id], updatedDive);
      }

      // Show success toast
      toast.success('Dive updated successfully.');
    },
    onError: (error, { id }, context) => {
      // Rollback to the previous value on error
      console.error('Update dive failed:', error);
      if (context?.previousDive) {
        queryClient.setQueryData(['dive', userId, id], context.previousDive);
      }

      toast.error('Failed to save changes. Changes have been reverted. Please try again.');
    },
  });
  return { isPending, mutateAsync };
}
