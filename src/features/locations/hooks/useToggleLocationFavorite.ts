import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { toggleLocationFavorite } from '../../../services/apiLocations';

export function useToggleLocationFavorite() {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
	mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
	  toggleLocationFavorite(id, isFavorite),
		onSuccess: () => {
			// Invalidate and refetch any views that derive favorite status.
			queryClient.invalidateQueries({ queryKey: ['locations'] });
			queryClient.invalidateQueries({ queryKey: ['dives'] });
			queryClient.invalidateQueries({ queryKey: ['location-dives'] });
			// Show success toast
			toast.success('Favorite status updated successfully.');
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Error toggling location favorite status.');
		},
 	});
  return { isPending, mutateAsync };
}
