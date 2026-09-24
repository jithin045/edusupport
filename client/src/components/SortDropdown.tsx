'use client';

import { useState, useRef, useEffect } from 'react';
import { LuChevronDown, LuCheck } from 'react-icons/lu';

interface Option {
  label: string;
  value: string;
}

interface SortDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = options.find((o) => o.value === value)?.label || 'Sort by';

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer"
      >
        <span>{currentLabel}</span>
        <LuChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${value === option.value ? 'bg-indigo-50/75 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>{option.label}</span>
              {value === option.value && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}