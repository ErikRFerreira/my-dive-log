import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prepareDiveMedia } from './prepareDiveMedia';
import imageCompression from 'browser-image-compression';

// Mock browser-image-compression
vi.mock('browser-image-compression');

// Mock heic2any (will be dynamically imported)
vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('prepareDiveMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Format validation', () => {
    it('should accept JPEG files', async () => {
      const jpegFile = new File(['fake-content'], 'photo.jpg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(jpegFile);
      
      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/jpeg');
    });

    it('should accept WebP files', async () => {
      const webpFile = new File(['fake-content'], 'photo.webp', { type: 'image/webp' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.webp', { type: 'image/webp' })
      );

      const result = await prepareDiveMedia(webpFile);
      
      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/webp');
    });

    it('should accept HEIC files by MIME type', async () => {
      const heicFile = new File(['fake-content'], 'photo.heic', { type: 'image/heic' });
      
      // Mock heic2any conversion
      const heic2any = (await import('heic2any')).default;
      vi.mocked(heic2any).mockResolvedValue(
        new Blob(['converted'], { type: 'image/jpeg' })
      );

      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(heicFile);
      
      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/jpeg');
      expect(heic2any).toHaveBeenCalled();
    });

    it('should accept HEIC files by extension', async () => {
      const heicFile = new File(['fake-content'], 'photo.HEIC', { type: '' });
      
      const heic2any = (await import('heic2any')).default;
      vi.mocked(heic2any).mockResolvedValue(
        new Blob(['converted'], { type: 'image/jpeg' })
      );

      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(heicFile);
      
      expect(result).toBeInstanceOf(File);
      expect(result.type).toBe('image/jpeg');
    });

    it('should reject unsupported formats', async () => {
      const pngFile = new File(['fake-content'], 'photo.png', { type: 'image/png' });
      
      await expect(prepareDiveMedia(pngFile)).rejects.toThrow(
        'Unsupported image format. Use JPEG, WebP, or HEIC.'
      );
    });

    it('should reject non-image files', async () => {
      const pdfFile = new File(['fake-content'], 'document.pdf', { type: 'application/pdf' });
      
      await expect(prepareDiveMedia(pdfFile)).rejects.toThrow(
        'Unsupported image format. Use JPEG, WebP, or HEIC.'
      );
    });
  });

  describe('Compression', () => {
    it('should compress file to under 1MB on first attempt', async () => {
      const largeFile = new File(['x'.repeat(2_000_000)], 'large.jpg', { type: 'image/jpeg' });
      
      // First attempt succeeds
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['x'.repeat(800_000)], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(largeFile);
      
      expect(result.size).toBeLessThanOrEqual(1_000_000);
      expect(imageCompression).toHaveBeenCalledTimes(1);
      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          initialQuality: 0.95,
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
        })
      );
    });

    it('should try multiple quality levels if first attempt is too large', async () => {
      const largeFile = new File(['x'.repeat(3_000_000)], 'large.jpg', { type: 'image/jpeg' });
      
      // First two attempts fail, third succeeds
      vi.mocked(imageCompression)
        .mockResolvedValueOnce(new File(['x'.repeat(1_100_000)], 'compressed.jpg', { type: 'image/jpeg' })) // 1.1MB - too large
        .mockResolvedValueOnce(new File(['x'.repeat(1_050_000)], 'compressed.jpg', { type: 'image/jpeg' })) // 1.05MB - still too large
        .mockResolvedValueOnce(new File(['x'.repeat(900_000)], 'compressed.jpg', { type: 'image/jpeg' })); // 0.9MB - success

      const result = await prepareDiveMedia(largeFile);
      
      expect(result.size).toBeLessThanOrEqual(1_000_000);
      expect(imageCompression).toHaveBeenCalledTimes(3);
      
      // Verify quality degradation
      expect(imageCompression).toHaveBeenNthCalledWith(1, expect.any(File), expect.objectContaining({ initialQuality: 0.95 }));
      expect(imageCompression).toHaveBeenNthCalledWith(2, expect.any(File), expect.objectContaining({ initialQuality: 0.85 }));
      expect(imageCompression).toHaveBeenNthCalledWith(3, expect.any(File), expect.objectContaining({ initialQuality: 0.75 }));
    });

    it('should throw error if all compression attempts fail', async () => {
      const largeFile = new File(['x'.repeat(5_000_000)], 'huge.jpg', { type: 'image/jpeg' });
      
      // All attempts return files over 1MB
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['x'.repeat(1_500_000)], 'compressed.jpg', { type: 'image/jpeg' })
      );

      await expect(prepareDiveMedia(largeFile)).rejects.toThrow(
        'Image is too large. Please choose a smaller photo or reduce dimensions.'
      );
      
      // Should try all 5 quality levels
      expect(imageCompression).toHaveBeenCalledTimes(5);
    });

    it('should respect custom maxBytes option', async () => {
      const file = new File(['x'.repeat(600_000)], 'photo.jpg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['x'.repeat(400_000)], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(file, { maxBytes: 500_000 });
      
      expect(result.size).toBeLessThanOrEqual(500_000);
      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxSizeMB: 0.5,
        })
      );
    });

    it('should respect custom maxDimension option', async () => {
      const file = new File(['fake-content'], 'photo.jpg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      await prepareDiveMedia(file, { maxDimension: 1200 });
      
      expect(imageCompression).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          maxWidthOrHeight: 1200,
        })
      );
    });
  });

  describe('Output format', () => {
    it('should preserve WebP format', async () => {
      const webpFile = new File(['fake-content'], 'photo.webp', { type: 'image/webp' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.webp', { type: 'image/webp' })
      );

      const result = await prepareDiveMedia(webpFile);
      
      expect(result.type).toBe('image/webp');
      expect(result.name).toMatch(/\.webp$/);
    });

    it('should convert JPEG to JPEG', async () => {
      const jpegFile = new File(['fake-content'], 'photo.jpg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(jpegFile);
      
      expect(result.type).toBe('image/jpeg');
      expect(result.name).toMatch(/\.jpg$/);
    });

    it('should convert HEIC to JPEG', async () => {
      const heicFile = new File(['fake-content'], 'photo.heic', { type: 'image/heic' });
      
      const heic2any = (await import('heic2any')).default;
      vi.mocked(heic2any).mockResolvedValue(
        new Blob(['converted'], { type: 'image/jpeg' })
      );

      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(heicFile);
      
      expect(result.type).toBe('image/jpeg');
      expect(result.name).toMatch(/\.jpg$/);
    });
  });

  describe('Filename handling', () => {
    it('should preserve base filename and change extension', async () => {
      const file = new File(['fake-content'], 'vacation-photo.jpeg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(file);
      
      expect(result.name).toBe('vacation-photo.jpg');
    });

    it('should handle files without extension', async () => {
      const file = new File(['fake-content'], 'photo', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(file);
      
      expect(result.name).toBe('photo.jpg');
    });

    it('should use "photo" as fallback for empty filename', async () => {
      const file = new File(['fake-content'], '', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['compressed'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(file);
      
      expect(result.name).toBe('photo.jpg');
    });
  });

  describe('HEIC conversion errors', () => {
    it('should throw error if heic2any is not installed', async () => {
      const heicFile = new File(['fake-content'], 'photo.heic', { type: 'image/heic' });
      
      // Simulate import failure
      vi.doMock('heic2any', () => {
        throw new Error('Cannot find module heic2any');
      });

      await expect(prepareDiveMedia(heicFile)).rejects.toThrow(
        'HEIC images require the heic2any package to be installed.'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle very small files without compression', async () => {
      const smallFile = new File(['tiny'], 'small.jpg', { type: 'image/jpeg' });
      
      vi.mocked(imageCompression).mockResolvedValue(
        new File(['tiny'], 'compressed.jpg', { type: 'image/jpeg' })
      );

      const result = await prepareDiveMedia(smallFile);
      
      expect(result.size).toBeLessThanOrEqual(1_000_000);
    });

    it('should handle Blob returned by imageCompression', async () => {
		const file = new File(['fake-content'], 'photo.jpg', { type: 'image/jpeg' });
		
		// Return a Blob instead of File
		vi.mocked(imageCompression).mockResolvedValue(
			new Blob(['compressed'], { type: 'image/jpeg' }) as File
		);

		const result = await prepareDiveMedia(file);
		
		expect(result).toBeInstanceOf(File);
		expect(result.type).toBe('image/jpeg');
	});
  });
});
