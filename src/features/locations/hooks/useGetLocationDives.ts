import { getDivesByLocationId } from '@/services/apiDives';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

export function useGetLocationDives() {
   const { id } = useParams<{ id: string }>();
	
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['location-dives', id],
		enabled: !!id,
		queryFn: () => getDivesByLocationId(id!),
	});

	return {
		dives: data ?? null,
		isLoading,
		isError,
		refetch,
	};
}