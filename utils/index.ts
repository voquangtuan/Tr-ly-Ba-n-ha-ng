/** Utility: classNames */
export function cx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}

/** Utility: read file as data URL for preview */
export const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

/** Utility: read file as base64 string for API */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

/** Utility: crop an image file to a specific aspect ratio */
export const cropImageToAspectRatio = (file: File, aspectRatio: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    if (!widthRatio || !heightRatio) {
      return reject(new Error('Invalid aspect ratio format.'));
    }
    const targetAspectRatio = widthRatio / heightRatio;

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up object URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      const originalWidth = img.width;
      const originalHeight = img.height;
      const originalAspectRatio = originalWidth / originalHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = originalWidth;
      let sourceHeight = originalHeight;

      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider than target, crop width from center
        sourceWidth = originalHeight * targetAspectRatio;
        sourceX = (originalWidth - sourceWidth) / 2;
      } else if (originalAspectRatio < targetAspectRatio) {
        // Image is taller than target, crop height from center
        sourceHeight = originalWidth / targetAspectRatio;
        sourceY = (originalHeight - sourceHeight) / 2;
      }
      
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Canvas to Blob conversion failed'));
        }
        const newFile = new File([blob], file.name, { type: blob.type });
        resolve(newFile);
      }, file.type, 0.95);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      reject(err);
    };
    img.src = URL.createObjectURL(file);
  });
};