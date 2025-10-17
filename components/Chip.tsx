import React from 'react';
import { cx } from '../utils';

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition font-medium",
        active
          ? "bg-blue-500 text-white border-blue-500 shadow"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      )}
    >
      {label}
    </button>
  );
};