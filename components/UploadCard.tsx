
import React, { useRef, useState, useMemo } from 'react';
import type { UploadedFile } from '../types';

// FIX: Defined the UploadCardProps interface to resolve the TypeScript error.
interface UploadCardProps {
  title: string;
  subtitle?: string;
  file: UploadedFile | null;
  onFile: (file: File) => void;
  onClear: () => void;
  objectFit?: 'cover' | 'contain';
}

export const UploadCard: React.FC<UploadCardProps> = ({ title, subtitle = "PNG, JPG, WEBP", file, onFile, onClear, objectFit = 'cover' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFile(files[0]);
    }
  };

  const preview = useMemo(() => file?.previewUrl, [file]);

  const handlePlaceholderClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className="relative rounded-2xl border border-dashed p-4 sm:p-5 bg-white/50 border-blue-500/80"
      onDragEnter={handleDragEnter}
    >
      {isDragging && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-400/20"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="text-blue-800 font-medium">Thả ảnh vào đây</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="text-blue-900 text-sm font-semibold">{title}</div>
          <div className="text-xs text-gray-600 mt-0.5">{subtitle}</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 text-xs rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Chọn ảnh
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-xs rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Xóa
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              e.target.value = ''; // Reset input
              onFile(f);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {preview ? (
          <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img src={preview} alt="preview" className={`w-full h-full object-${objectFit}`} />
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border border-blue-300/90 bg-blue-50/50 text-blue-600 cursor-pointer hover:bg-blue-100/40 transition-colors"
            onClick={handlePlaceholderClick}
            role="button"
            aria-label="Tải ảnh lên"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-70 mb-2 pointer-events-none">
              <path d="M19 13v6H5v-6H3v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2ZM11 6.414 8.707 8.707 7.293 7.293 12 2.586l4.707 4.707-1.414 1.414L13 6.414V16h-2V6.414Z"/>
            </svg>
            <span className="pointer-events-none">Kéo-thả hoặc chọn ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
};
