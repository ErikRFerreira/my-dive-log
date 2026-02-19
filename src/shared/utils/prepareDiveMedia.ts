/**
 * Utilities for preparing dive media uploads.
 *
 * This module validates supported formats, converts HEIC/HEIF images,
 * and compresses media to stay within size and dimension limits.
 */

/** Maximum file size in bytes after compression (1MB) */
const DEFAULT_MAX_BYTES = 1_000_000;
/** Maximum width or height in pixels for compressed images */
const DEFAULT_MAX_DIMENSION = 1600;

/** Supported output image formats after compression */
const ALLOWED_OUTPUT_TYPES = ['image/jpeg', 'image/webp'] as const;
/** HEIC/HEIF image MIME types that require conversion */
const HEIC_TYPES = ['image/heic', 'image/heif'];

/** Allowed output MIME types for processed images */
type AllowedOutputType = (typeof ALLOWED_OUTPUT_TYPES)[number];

/**
 * Checks if a file is in HEIC/HEIF format
 * @param file - The file to check
 * @returns True if the file is HEIC/HEIF format
 */
function isHeicFile(file: File) {
  return (
    HEIC_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

/**
 * Validates if a file is an accepted input format (JPEG, WebP, or HEIC)
 * @param file - The file to validate
 * @returns True if the file type is supported
 */
function isAllowedInput(file: File) {
  return ALLOWED_OUTPUT_TYPES.includes(file.type as AllowedOutputType) || isHeicFile(file);
}

/**
 * Determines the output MIME type for a given file
 * @param file - The input file
 * @returns 'image/webp' if input is WebP, otherwise 'image/jpeg'
 */
function getOutputType(file: File): AllowedOutputType {
  return file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
}

/**
 * Generates an output filename with the appropriate extension
 * @param originalName - The original filename
 * @param type - The target MIME type
 * @returns A new filename with the correct extension (.webp or .jpg)
 */
function getOutputName(originalName: string, type: AllowedOutputType) {
  const extension = type === 'image/webp' ? 'webp' : 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName || 'photo'}.${extension}`;
}

/**
 * Converts a HEIC/HEIF image file to JPEG format
 * @param file - The HEIC/HEIF file to convert
 * @returns A Promise that resolves to a JPEG File
 * @throws Error if heic2any package is not installed
 */
async function convertHeicToJpeg(file: File) {
  let heic2any: (options: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;

  try {
    heic2any = (await import('heic2any')).default;
  } catch (error: unknown) {
    console.error('heic2any package is not installed:', error);
    throw new Error('HEIC images require the heic2any package to be installed.');
  }

  const output = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  const blob = Array.isArray(output) ? output[0] : output;
  return new File([blob], getOutputName(file.name, 'image/jpeg'), { type: 'image/jpeg' });
}

/**
 * Lazily loads browser-image-compression so the main app bundle stays smaller.
 */
async function loadImageCompression() {
  return (await import('browser-image-compression')).default;
}

/**
 * Prepares and compresses an image file for dive media upload.
 *
 * Handles HEIC/HEIF conversion, image compression, and size validation.
 * Output will be in JPEG or WebP format depending on input.
 * Uses iterative compression with progressively lower quality settings
 * to ensure the file meets size requirements.
 *
 * @param file - The image file to process
 * @param options - Optional compression settings
 * @param options.maxBytes - Maximum file size in bytes (default: 1MB)
 * @param options.maxDimension - Maximum width or height in pixels (default: 1600)
 * @returns A Promise that resolves to the processed File
 * @throws Error if the file format is unsupported or cannot be compressed below maxBytes
 *
 * @example
 * const processed = await prepareDiveMedia(file, { maxBytes: 750_000, maxDimension: 1400 });
 */
export async function prepareDiveMedia(
  file: File,
  options?: { maxBytes?: number; maxDimension?: number }
) {
  if (!isAllowedInput(file)) {
    throw new Error('Unsupported image format. Use JPEG, WebP, or HEIC.');
  }

  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;

  const baseFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  const outputType = getOutputType(baseFile);
  const outputName = getOutputName(baseFile.name, outputType);
  const imageCompression = await loadImageCompression();

  if (baseFile.size <= maxBytes) {
    return baseFile;
  }

  // Try compression with progressively lower quality if needed
  const qualitySteps = [0.95, 0.85, 0.75, 0.65, 0.5];
  let compressed: Blob | File | undefined;

  for (const quality of qualitySteps) {
    compressed = await imageCompression(baseFile, {
      maxSizeMB: maxBytes / 1_000_000,
      maxWidthOrHeight: maxDimension,
      useWebWorker: true,
      fileType: outputType,
      initialQuality: quality
    });

    const testFile = new File([compressed], outputName, { type: outputType });
    
    // If under limit, use this version
    if (testFile.size <= maxBytes) {
      if (testFile.size >= baseFile.size) {
        return baseFile;
      }
      return testFile;
    }
  }

  // If still too large after all attempts, throw error
  throw new Error('Image is too large. Please choose a smaller photo or reduce dimensions.');
}
