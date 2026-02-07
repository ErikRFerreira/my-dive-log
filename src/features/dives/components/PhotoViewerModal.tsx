import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Star, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { DivePhoto } from '@/shared/types/domain';

interface PhotoViewerModalProps {
  photos: DivePhoto[];
  currentPhotoId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (photoId: string) => void;
  onSetCover: (photoId: string) => void;
  onRemoveCover: (photoId: string) => void;
  coverPhotoPath?: string | null;
}

export function PhotoViewerModal({
  photos,
  currentPhotoId,
  isOpen,
  onClose,
  onDelete,
  onSetCover,
  onRemoveCover,
  coverPhotoPath,
}: PhotoViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Update current index when modal opens or currentPhotoId changes
  useEffect(() => {
    const index = photos.findIndex((p) => p.id === currentPhotoId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentPhotoId, photos]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  const currentPhoto = photos[currentIndex];
  const isCoverPhoto = currentPhoto?.storage_path === coverPhotoPath;

  useEffect(() => {
    if (isOpen) {
      setIsInitialLoad(true);
      setIsImageLoading(true);
    }
  }, [isOpen]);

  if (!currentPhoto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="inset-0 w-screen h-screen max-w-none p-0 bg-black border-none translate-x-0 translate-y-0 rounded-none sm:rounded-none transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:translate-x-0 data-[state=closed]:translate-x-0 data-[state=open]:translate-y-0 data-[state=closed]:translate-y-0 data-[state=open]:scale-100 data-[state=closed]:scale-100 [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Image */}
          <div className="relative flex-1 flex items-center justify-center p-16">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || 'Dive photo'}
              onLoad={() => {
                if (isInitialLoad) {
                  setIsImageLoading(false);
                  setIsInitialLoad(false);
                }
              }}
              onError={() => {
                if (isInitialLoad) {
                  setIsImageLoading(false);
                  setIsInitialLoad(false);
                }
              }}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                isInitialLoad && isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {isInitialLoad && isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <InlineSpinner size={36} style={{ marginLeft: 0 }} />
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <Button
              variant="destructive"
              onClick={() => onDelete(currentPhoto.id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Photo
            </Button>
            {!isCoverPhoto && (
              <Button
                variant="outline"
                onClick={() => {
                  onSetCover(currentPhoto.id);
                  onClose();
                }}
                className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Star className="h-4 w-4" />
                Set as Cover
              </Button>
            )}
            {isCoverPhoto && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onRemoveCover(currentPhoto.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/20 text-primary border border-primary/30"
                >
                  <Star className="h-4 w-4" />
                  Cover Photo
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
