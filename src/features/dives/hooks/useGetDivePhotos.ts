import { useQuery } from "@tanstack/react-query";
import {fetchDivePhotos} from '@/services/apiDivePhotos';

export function useGetDivePhotos(diveId: string) {
	const {
		data: gallery,
		isLoading: isLoadingGallery,
		error: errorGallery,
	} = useQuery({
			queryKey: ["divePhotos", diveId],
			queryFn: () => fetchDivePhotos(diveId!),
			enabled: !!diveId,
			staleTime: 1000 * 60 * 10, // 10 min (signed URLs last 1 hour)
		});

	return { gallery, isLoadingGallery, errorGallery };
}