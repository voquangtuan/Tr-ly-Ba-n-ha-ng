
export interface UploadedFile {
  file: File;
  previewUrl: string;
}

export interface ImageFilePayload {
  name: 'model' | 'clothing' | 'logo' | 'product';
  file: UploadedFile;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
