
import React from 'react';

interface LightboxProps {
  url: string | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <img src={url} alt="preview" className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};
