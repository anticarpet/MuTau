'use client';

import { useState, useRef, useEffect } from 'react';

interface HexDropdownProps {
  label?: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function HexDropdown({
  label,
  options,
  placeholder = 'please select',
  value: controlledValue,
  onChange,
  className = '',
}: HexDropdownProps) {
  const [value, setValue] = useState(controlledValue ?? '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (opt: string) => {
    setValue(opt);
    onChange?.(opt);
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={ref}>
      {label && (
        <label className="text-xs font-medium tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="clip-hex-wide-border bg-black w-full"
          style={{ padding: '2.5px' }}
        >
          <div className="clip-hex-wide bg-white flex items-center justify-between px-5 py-3">
            <span className={`text-sm font-medium ${value ? 'text-black' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-[2.5px] border-black clip-hex-wide z-50 overflow-hidden">
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={`
                    w-full text-left px-5 py-2 text-sm font-medium
                    hover:bg-black hover:text-white transition-colors
                    ${opt === value ? 'bg-gray-100' : ''}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
