const DEFAULT_MAX_BYTES = 100_000;
const DEFAULT_MAX_DIMENSION = 256;

export const AVATAR_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

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

async function decodeImage(file: File) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file);
  }

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

function assertAllowedAvatarType(file: File) {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
    throw new Error('Unsupported image format. Use JPG, PNG, or WebP.');
  }
}

export async function prepareAvatarUpload(
  file: File,
  options?: { maxBytes?: number; maxDimension?: number }
): Promise<File> {
  assertAllowedAvatarType(file);

  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;

  if (file.size <= maxBytes) return file;

  const bitmap = await decodeImage(file);
  try {
    const baseScale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const initialWidth = Math.max(1, Math.round(bitmap.width * baseScale));
    const initialHeight = Math.max(1, Math.round(bitmap.height * baseScale));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Missing canvas context');

    const dimensionMultipliers = [1, 0.85, 0.7, 0.55, 0.45];
    const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

    for (const multiplier of dimensionMultipliers) {
      canvas.width = Math.max(1, Math.round(initialWidth * multiplier));
      canvas.height = Math.max(1, Math.round(initialHeight * multiplier));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of qualities) {
        const webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
        if (webpBlob?.type === 'image/webp' && webpBlob.size <= maxBytes) {
          return new File([webpBlob], 'avatar.webp', { type: webpBlob.type });
        }

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

