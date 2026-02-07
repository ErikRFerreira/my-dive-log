export type {
  Dive,
  NewDiveInput,
  UpdateDivePatch,
  Visibility,
  DiveType,
  WaterType,
  Exposure,
  Gas,
  Currents,
} from '@/shared/types/domain';

export type CoverPhotoParams = {
  photoId: string;
  diveId: string;
};

export type UploadDivePhotoParams = {
  diveId: string;
  file: File;
};

export type ProcessedMedia = {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
};
