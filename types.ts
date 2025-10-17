
export interface UploadedFile {
  file: File;
  previewUrl: string;
}

export interface ImageFilePayload {
  name: 'model' | 'clothing' | 'logo' | 'product';
  file: UploadedFile;
}
