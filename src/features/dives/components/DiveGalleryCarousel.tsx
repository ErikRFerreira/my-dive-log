import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Image, Upload, Trash2 } from 'lucide-react';
import type { DivePhoto } from '@/services/apiDivePhotos';
import { useUploadDivePhoto } from '../hooks/useUploadDivePhoto';
import { prepareDiveMedia } from '@/shared/utils/prepareDiveMedia';
import toast from 'react-hot-toast';

interface DiveGalleryCarouselProps {
  photos: DivePhoto[];
  diveId: string;
}

export function DiveGalleryCarousel({ photos, diveId }: DiveGalleryCarouselProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const carouselFileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhotoMutation = useUploadDivePhoto();

  const handleCarouselPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if we already have 5 photos
    if (photos.length >= 5) {
      toast.error('Maximum 5 photos per dive');
      return;
    }

    setIsUploading(true);

    try {
      // Process single photo
      const processedFile = await prepareDiveMedia(file);

      // Upload the photo
      await uploadPhotoMutation.mutateAsync({
        diveId,
        file: processedFile,
      });

      // Reset input
      if (carouselFileInputRef.current) {
        carouselFileInputRef.current.value = '';
      }

      // Auto-advance carousel to show new photo after a brief delay
      setTimeout(() => {
        if (carouselApi) {
          carouselApi.scrollNext();
        }
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    // TODO: Implement delete functionality
    toast(`Delete photo ${photoId} - coming soon!`);
  };

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
              <div className="overflow-hidden rounded-lg group relative aspect-video">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Dive photo'}
                  className="w-full h-full object-cover"
                />
                {/* Delete button overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}

          {/* Upload slide - only show if not at max */}
          {!atMaxPhotos && (
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              <div
                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-video flex flex-col items-center justify-center gap-4 p-6"
                onClick={() => carouselFileInputRef.current?.click()}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{isUploading ? 'Uploading...' : 'Add Photo'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? 'Please wait' : 'Click to upload'}
                  </p>
                </div>
              </div>
              <input
                ref={carouselFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCarouselPhotoSelect}
                className="hidden"
                disabled={isUploading}
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
