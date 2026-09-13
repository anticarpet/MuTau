'use client';

import { useState } from 'react';

interface HexInputProps {
  label?: string;
  type?: 'text' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function HexInput({
  label,
  type = 'text',
  placeholder,
  value: controlledValue,
  onChange,
  className = '',
}: HexInputProps) {
  const [value, setValue] = useState(controlledValue ?? '');
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            clip-hex-wide-border bg-black
            ${focused ? 'ring-2 ring-black ring-offset-2' : ''}
            transition-shadow
          `}
          style={{ padding: '2.5px' }}
        >
          <div className="clip-hex-wide bg-white">
            <input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent px-5 py-3 text-sm font-medium outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
