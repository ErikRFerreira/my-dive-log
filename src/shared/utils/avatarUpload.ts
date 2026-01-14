/**
 * Utility functions for processing and optimizing user avatar images.
 * 
 * This module handles avatar image validation, resizing, and compression to ensure
 * uploaded images meet size and dimension constraints while maintaining acceptable quality.
 * It uses progressive quality reduction and multiple format attempts (WebP, JPEG) to
 * achieve the smallest possible file size.
 */

/** Default maximum file size in bytes (100KB) */
const DEFAULT_MAX_BYTES = 100_000;

/** Default maximum width or height in pixels */
const DEFAULT_MAX_DIMENSION = 256;

/** Allowed MIME types for avatar uploads */
export const AVATAR_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Converts a canvas to a Blob using the specified image format and quality.
 * 
 * @param canvas - The canvas element to convert
 * @param type - The MIME type for the output (e.g., 'image/jpeg', 'image/webp')
 * @param quality - Optional quality parameter (0 to 1) for lossy formats
 * @returns Promise that resolves to a Blob or null if conversion fails
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Decodes an image file into an ImageBitmap for manipulation.
 * 
 * Uses the native `createImageBitmap` API when available, falling back to
 * a canvas-based approach for older browsers. Properly cleans up object URLs
 * to prevent memory leaks.
 * 
 * @param file - The image file to decode
 * @returns Promise that resolves to an ImageBitmap
 * @throws Error if the image fails to load or decode
 */
async function decodeImage(file: File) {
  // Use native API if available (faster and more efficient)
  if ('createImageBitmap' in window) {
    return createImageBitmap(file);
  }

  // Fallback for older browsers
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Missing canvas context');
    ctx.drawImage(img, 0, 0);

    return await createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Validates that a file's MIME type is allowed for avatar uploads.
 * 
 * @param file - The file to validate
 * @throws Error if the file type is not in the allowed list
 */
function assertAllowedAvatarType(file: File) {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
    throw new Error('Unsupported image format. Use JPG, PNG, or WebP.');
  }
}

/**
 * Prepares an avatar image for upload by validating, resizing, and compressing it.
 * 
 * This function performs the following operations:
 * 1. Validates the file type against allowed MIME types
 * 2. Returns the original file if it's already within size limits
 * 3. If too large, progressively reduces quality and dimensions to meet constraints
 * 4. Tries WebP format first (better compression), then falls back to JPEG
 * 5. Tests multiple dimension multipliers and quality levels to find optimal result
 * 
 * The optimization strategy uses a nested loop:
 * - Outer loop: Reduces dimensions (100%, 85%, 70%, 55%, 45%)
 * - Inner loop: Reduces quality (85%, 75%, 65%, 55%, 45%, 35%)
 * 
 * @param file - The image file to prepare for upload
 * @param options - Optional configuration
 * @param options.maxBytes - Maximum file size in bytes (default: 100KB)
 * @param options.maxDimension - Maximum width or height in pixels (default: 256px)
 * @returns Promise that resolves to the processed File ready for upload
 * @throws Error if the image type is unsupported or cannot be compressed enough
 * 
 * @example
 * const avatarFile = await prepareAvatarUpload(selectedFile, {
 *   maxBytes: 150_000,
 *   maxDimension: 512
 * });
 */
export async function prepareAvatarUpload(
  file: File,
  options?: { maxBytes?: number; maxDimension?: number }
): Promise<File> {
  assertAllowedAvatarType(file);

  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;

  // Return original file if already within size limit
  if (file.size <= maxBytes) return file;

  const bitmap = await decodeImage(file);
  try {
    // Calculate initial scaling to fit within max dimension while maintaining aspect ratio
    const baseScale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const initialWidth = Math.max(1, Math.round(bitmap.width * baseScale));
    const initialHeight = Math.max(1, Math.round(bitmap.height * baseScale));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Missing canvas context');

    // Progressive dimension reduction multipliers
    const dimensionMultipliers = [1, 0.85, 0.7, 0.55, 0.45];
    // Progressive quality reduction levels
    const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

    // Try progressively smaller dimensions
    for (const multiplier of dimensionMultipliers) {
      canvas.width = Math.max(1, Math.round(initialWidth * multiplier));
      canvas.height = Math.max(1, Math.round(initialHeight * multiplier));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      // Try progressively lower quality settings
      for (const quality of qualities) {
        // Try WebP first (typically better compression)
        const webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
        if (webpBlob?.type === 'image/webp' && webpBlob.size <= maxBytes) {
          return new File([webpBlob], 'avatar.webp', { type: webpBlob.type });
        }

        // Fall back to JPEG
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
        if (jpegBlob?.type === 'image/jpeg' && jpegBlob.size <= maxBytes) {
          return new File([jpegBlob], 'avatar.jpg', { type: jpegBlob.type });
        }
      }
    }

    throw new Error(`Image is too large. Please choose a smaller image (<= ${maxBytes} bytes).`);
  } finally {
    bitmap.close();
  }
}

