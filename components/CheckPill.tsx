import React from 'react';
import { cx } from '../utils';

interface CheckPillProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckPill: React.FC<CheckPillProps> = ({ label, checked, onChange }) => {
  return (
    <label className="inline-flex items-center gap-2 select-none cursor-pointer text-sm text-gray-700">
      <span
        className={cx(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400"
        )}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
            <path d="M20.285 6.709 9 18l-5.285-5.291 1.414-1.418L9 15.172l9.871-9.881 1.414 1.418z" />
          </svg>
        )}
      </span>
      {label}
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
};