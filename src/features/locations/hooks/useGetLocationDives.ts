import { getDivesByLocationId } from '@/services/apiDives';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { queryRetryConfig } from '@/lib/queryClient';
import { useUser } from '@/features/authentication';

export function useGetLocationDives() {
   const { id } = useParams<{ id: string }>();
   const { user } = useUser();
   const userId = user?.id;
	
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['location-dives', userId, id],
		enabled: !!userId && !!id,
		queryFn: () => getDivesByLocationId(id!),
		...queryRetryConfig,
	});

	return {
		dives: data ?? null,
		isLoading,
		isError,
		refetch,
	};
}
