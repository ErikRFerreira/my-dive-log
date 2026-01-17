import { DiveGalleryCarousel } from './DiveGalleryCarousel';
import { DiveGalleryUpload } from './DiveGalleryUpload';
import InlineSpinner from '@/components/common/InlineSpinner';
import { useGetDivePhotos } from '../hooks/useGetDivePhotos';

interface DiveGalleryProps {
  diveId: string;
  coverPhotoPath?: string | null;
}

export function DiveGallery({ diveId, coverPhotoPath }: DiveGalleryProps) {
  const { gallery, isLoadingGallery } = useGetDivePhotos(diveId);

  // Loading state
  if (isLoadingGallery) {
    return <InlineSpinner />;
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
