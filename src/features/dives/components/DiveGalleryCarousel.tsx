import Modal from '@/components/common/Modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import type { CarouselApi } from '@/components/ui/carousel';
import { Image, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import type { DivePhoto } from '@/services/apiDivePhotos';
import { useUploadDivePhoto } from '../hooks/useUploadDivePhoto';
import { useDeleteDivePhoto } from '../hooks/useDeleteDivePhoto';
import { useSetCoverPhoto } from '../hooks/useSetCoverPhoto';
import { prepareDiveMedia } from '@/shared/utils/prepareDiveMedia';
import { PhotoViewerModal } from './PhotoViewerModal';
import toast from 'react-hot-toast';

/**
 * Represents a media file that has been processed and is ready for upload.
 * Includes both original and compressed file information for user feedback.
 */
interface ProcessedMedia {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * Props for the DiveGalleryCarousel component.
 * @property {DivePhoto[]} photos - Array of existing photos for this dive
 * @property {string} diveId - Unique identifier for the dive
 * @property {string | null} [coverPhotoPath] - Path to the current cover photo, if any
 */
interface DiveGalleryCarouselProps {
  photos: DivePhoto[];
  diveId: string;
  coverPhotoPath?: string | null;
}

/**
 * A carousel component for managing dive photos with upload, delete, and cover photo functionality.
 *
 * Features:
 * - Display up to 5 photos per dive in a responsive carousel
 * - Upload new photos with automatic compression and preview
 * - Delete photos with confirmation modal
 * - Set cover photo for the dive
 * - View photos in fullscreen modal
 * - Real-time file size comparison (original vs compressed)
 *
 * @param {DiveGalleryCarouselProps} props - Component props
 * @returns {JSX.Element} The rendered gallery carousel
 */
export function DiveGalleryCarousel({ photos, diveId, coverPhotoPath }: DiveGalleryCarouselProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [viewingPhotoId, setViewingPhotoId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProcessedMedia | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const carouselFileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhotoMutation = useUploadDivePhoto();
  const deletePhotoMutation = useDeleteDivePhoto();
  const setCoverPhotoMutation = useSetCoverPhoto();

  /**
   * Handles photo selection from the file input.
   * Validates photo limit, processes/compresses the image, and creates a preview.
   * The processed photo is stored in state until the user confirms the upload.
   */
  const handleCarouselPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if we already have 5 photos
    if (photos.length >= 5) {
      toast.error('Maximum 5 photos per dive');
      return;
    }

    // Check if there's already a photo being previewed
    if (selectedMedia) {
      toast.error('Please upload the current photo before selecting another');
      return;
    }

    setIsProcessing(true);

    try {
      const originalSize = file.size;
      const processedFile = await prepareDiveMedia(file);
      const preview = URL.createObjectURL(processedFile);

      setSelectedMedia({
        id: crypto.randomUUID(),
        file: processedFile,
        preview,
        originalSize,
        compressedSize: processedFile.size,
      });

      // Reset input
      if (carouselFileInputRef.current) {
        carouselFileInputRef.current.value = '';
      }

      toast.success('Photo processed and ready to upload');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process photo');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Uploads the currently selected and processed photo to the server.
   * After successful upload, clears the preview and advances the carousel to show the new photo.
   */
  const handleUploadPhoto = async () => {
    if (!selectedMedia) return;

    setIsUploading(true);

    try {
      await uploadPhotoMutation.mutateAsync({
        diveId,
        file: selectedMedia.file,
      });

      // Clear selected media
      URL.revokeObjectURL(selectedMedia.preview);
      setSelectedMedia(null);

      // Auto-advance carousel to show new photo after a brief delay
      setTimeout(() => {
        if (carouselApi) {
          carouselApi.scrollNext();
        }
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Cancels the current photo upload by removing the selected media from state
   * and cleaning up the object URL to prevent memory leaks.
   */
  const removeMedia = () => {
    if (selectedMedia) {
      URL.revokeObjectURL(selectedMedia.preview);
      setSelectedMedia(null);
    }
  };

  /**
   * Formats a byte count into a human-readable file size string.
   * @param {number} bytes - The number of bytes to format
   * @returns {string} Formatted string (e.g., "1.5 MB", "250 KB", "512 B")
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Executes the photo deletion after user confirmation.
   * Closes the modal and resets state after successful deletion.
   */
  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      await deletePhotoMutation.mutateAsync({ photoId: photoToDelete, diveId });
      setIsDeleteModalOpen(false);
      setPhotoToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  /** Cancels the photo deletion operation and closes the confirmation modal. */
  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPhotoToDelete(null);
  };

  /** Opens the fullscreen photo viewer modal for the specified photo. */
  const handlePhotoClick = (photoId: string) => {
    setViewingPhotoId(photoId);
    setIsPhotoViewerOpen(true);
  };

  /**
   * Initiates photo deletion from within the photo viewer modal.
   * Closes the viewer and opens the delete confirmation modal.
   */
  const handlePhotoViewerDelete = (photoId: string) => {
    setIsPhotoViewerOpen(false);
    setPhotoToDelete(photoId);
    setIsDeleteModalOpen(true);
  };

  /** Sets the specified photo as the cover photo for this dive. */
  const handleSetCover = async (photoId: string) => {
    try {
      await setCoverPhotoMutation.mutateAsync({ photoId, diveId });
    } catch (error) {
      console.error('Set cover error:', error);
    }
  };

  // Check if the dive has reached the maximum allowed photos (5)
  const atMaxPhotos = photos.length >= 5;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
        </div>
        <Badge variant={atMaxPhotos ? 'destructive' : 'secondary'}>
          {photos.length === 1 ? '1 photo' : atMaxPhotos ? '5/5 photos' : `${photos.length} photos`}
        </Badge>
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {/* Existing photos */}
          {photos.map((photo) => (
            <CarouselItem key={photo.id} className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="overflow-hidden rounded-lg relative aspect-video">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Dive photo'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handlePhotoClick(photo.id)}
                />
              </div>
            </CarouselItem>
          ))}

          {/* Upload slide - only show if not at max */}
          {!atMaxPhotos && (
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              {selectedMedia ? (
                // Preview mode
                <Card className="overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="aspect-video relative">
                      <img
                        src={selectedMedia.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Remove button - top left corner */}
                      <div className="absolute top-2 left-2 z-10">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={removeMedia}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Upload button - top right corner */}
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          onClick={handleUploadPhoto}
                          disabled={isUploading || isProcessing}
                          size="sm"
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Original:</span>
                        <span>{formatFileSize(selectedMedia.originalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processed:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatFileSize(selectedMedia.compressedSize)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Upload prompt
                <div
                  className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-video flex flex-col items-center justify-center gap-4 p-6"
                  onClick={() => carouselFileInputRef.current?.click()}
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{isProcessing ? 'Processing...' : 'Add Photo'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isProcessing ? 'Please wait' : 'Photos are optimized to max 1MB'}
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={carouselFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCarouselPhotoSelect}
                className="hidden"
                disabled={isUploading || isProcessing}
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal title="Delete Photo" closeModal={cancelDelete}>
          <p className="text-foreground mb-6">
            Are you sure you want to delete this photo? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deletePhotoMutation.isPending}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePhoto}
              disabled={deletePhotoMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {deletePhotoMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Photo Viewer Modal */}
      {isPhotoViewerOpen && viewingPhotoId && (
        <PhotoViewerModal
          photos={photos}
          currentPhotoId={viewingPhotoId}
          isOpen={isPhotoViewerOpen}
          onClose={() => setIsPhotoViewerOpen(false)}
          onDelete={handlePhotoViewerDelete}
          onSetCover={handleSetCover}
          coverPhotoPath={coverPhotoPath}
        />
      )}
    </div>
  );
}
