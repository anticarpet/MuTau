'use client';

import { useState } from 'react';

interface HexCheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export default function HexCheckbox({
  label,
  checked: controlledChecked,
  onChange,
  className = '',
}: HexCheckboxProps) {
  const [checked, setChecked] = useState(controlledChecked ?? false);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`
        flex items-center gap-3 group ${className}
      `}
    >
      <div className="relative">
        <div className="clip-hex-regular bg-white border border-black" style={{ width: 32, height: 32 }}>
          <div
            className={`
              clip-hex-regular w-full h-full flex items-center justify-center
              transition-colors duration-150
              ${checked ? 'bg-white' : 'bg-white'}
            `}
          >
            {checked && (
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="#16a34a"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 12 10 18 20 6" />
              </svg>
            )}
          </div>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </button>
  );
}
