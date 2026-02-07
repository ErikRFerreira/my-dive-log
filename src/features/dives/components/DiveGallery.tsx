import { DiveGalleryCarousel } from './DiveGalleryCarousel';
import { DiveGalleryUpload } from './DiveGalleryUpload';
import InlineSpinner from '@/components/common/InlineSpinner';
import InlineError from '@/components/common/InlineError';
import { useGetDivePhotos } from '../hooks/useGetDivePhotos';
import { getErrorMessage } from '@/shared/utils/errorMessage';

interface DiveGalleryProps {
  diveId: string;
  coverPhotoPath?: string | null;
}

export function DiveGallery({ diveId, coverPhotoPath }: DiveGalleryProps) {
  const { gallery, isLoadingGallery, errorGallery } = useGetDivePhotos(diveId);

  // Loading state
  if (isLoadingGallery) {
    return <InlineSpinner />;
  }

  // Error state
  if (errorGallery) {
    return (
      <InlineError
        message={getErrorMessage(
          errorGallery,
          'Failed to load dive photos. Please try refreshing the page.'
        )}
      />
    );
  }

  // Check if we have photos
  const hasPhotos = gallery && gallery.length > 0;

  // Render carousel mode when we have photos
  if (hasPhotos) {
    return <DiveGalleryCarousel photos={gallery} diveId={diveId} coverPhotoPath={coverPhotoPath} />;
  }

  // Render upload mode when we have no photos
  return <DiveGalleryUpload diveId={diveId} />;
}

export default DiveGallery;
