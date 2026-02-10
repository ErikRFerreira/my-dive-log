import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, X } from 'lucide-react';
import { useUploadDivePhoto } from '../hooks/useUploadDivePhoto';
import { prepareDiveMedia } from '@/shared/utils/prepareDiveMedia';
import toast from 'react-hot-toast';
import type { ProcessedMedia } from '../types';

interface DiveGalleryUploadProps {
  diveId: string;
}

/**
 * Upload widget for adding a single photo to a dive.
 *
 * Features:
 * - Toggleable upload UI with progress feedback
 * - Client-side processing/compression with preview
 * - Restricts to one photo at a time to simplify flow
 * - Uploads via `useUploadDivePhoto` and resets state on success
 *
 * @param {DiveGalleryUploadProps} props - Component props
 * @returns {JSX.Element} Rendered upload UI
 */
export function DiveGalleryUpload({ diveId }: DiveGalleryUploadProps) {
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProcessedMedia[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhotoMutation = useUploadDivePhoto();

  /**
   * Handles file selection and prepares the image for upload.
   * - Enforces single-photo selection
   * - Processes/compresses the image and generates a preview URL
   * - Updates progress state during processing
   */
  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Only allow 1 photo at a time
    if (selectedMedia.length > 0) {
      toast.error('Please upload the current photo before selecting another');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Only process the first file
      const file = files[0];
      const originalSize = file.size;

      setProcessingProgress(50);

      const processedFile = await prepareDiveMedia(file);
      const preview = URL.createObjectURL(processedFile);

      setProcessingProgress(100);

      setSelectedMedia([
        {
          id: crypto.randomUUID(),
          file: processedFile,
          preview,
          originalSize,
          compressedSize: processedFile.size,
        },
      ]);

      toast.success('Photo processed and ready to upload');
    } catch (error: unknown) {
      console.error('Error processing media:', error);
      toast.error('Failed to process photo');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  /**
   * Removes a selected media item and revokes its preview URL
   * to avoid memory leaks.
   */
  const removeMedia = (id: string) => {
    setSelectedMedia((prev) => {
      const media = prev.find((m) => m.id === id);
      if (media) {
        URL.revokeObjectURL(media.preview);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  /**
   * Converts a byte count into a human-readable size string.
   * @param {number} bytes - Raw byte count
   * @returns {string} Formatted size (e.g., "1.2 MB")
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Uploads the currently selected (single) photo to the server.
   * On success, cleans up preview URLs, resets state, and hides
   * the upload UI.
   */
  const handleUploadPhoto = async () => {
    if (selectedMedia.length === 0) return;

    setIsUploading(true);

    try {
      // Upload the single photo
      const media = selectedMedia[0];
      await uploadPhotoMutation.mutateAsync({
        diveId,
        file: media.file,
      });

      // Clear selected media after successful upload
      URL.revokeObjectURL(media.preview);
      setSelectedMedia([]);
      setShowMediaUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-2">
          <Image className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="media-upload"
            checked={showMediaUpload}
            onCheckedChange={setShowMediaUpload}
          />
          <Label htmlFor="media-upload" className="cursor-pointer">
            Add Photos
          </Label>
        </div>
      </div>

      {showMediaUpload && (
        <div className="space-y-4">
          {/* File Input - Only show if no photo selected */}
          {selectedMedia.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Upload Photo</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select 1 photo (Photos are optimized to max 1MB for faster uploads.)
                  </p>
                  <Button asChild variant="outline">
                    <label className="cursor-pointer">
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMediaSelect}
                        className="hidden"
                        disabled={isProcessing || isUploading}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing photo...</span>
                <span className="font-medium">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}

          {/* Selected Photo - Centered */}
          {selectedMedia.length > 0 && (
            <div className="flex justify-center py-4">
              <Card className="overflow-hidden relative max-w-xl w-full">
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img
                      src={selectedMedia[0].preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Remove button - top left corner */}
                    <div className="absolute top-2 left-2 z-10">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMedia(selectedMedia[0].id)}
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
                        {isUploading ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Original:</span>
                      <span>{formatFileSize(selectedMedia[0].originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processed:</span>
                      <span className="text-green-400">
                        {formatFileSize(selectedMedia[0].compressedSize)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
