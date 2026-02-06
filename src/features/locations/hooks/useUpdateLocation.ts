import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateLocation } from '../../../services/apiLocations';
import type { Location } from '../types';

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
	mutationFn: ({ id, locationData }: { id: string; locationData: Partial<Location> }) =>
		updateLocation(id, locationData),
		onSuccess: (_data, variables) => {
			const { id } = variables;
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ['locations'] });
			queryClient.invalidateQueries({ queryKey: ['location', id] });
			queryClient.invalidateQueries({ queryKey: ['location-dives'] });
			// Show success toast
			toast.success('Location updated successfully.');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update location. Please try again.');
		},
 	});
  return { isPending, mutateAsync };
}
