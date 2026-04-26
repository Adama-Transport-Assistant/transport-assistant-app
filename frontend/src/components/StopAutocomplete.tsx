import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, X } from 'lucide-react';
import type { Stop } from '../types/Stop';

interface StopAutocompleteProps {
  stops: Stop[];
  placeholder: string;
  value: Stop | null;
  onChange: (stop: Stop | null) => void;
  /** Icon color class, e.g. "text-green-600" or "text-red-600" */
  iconColor?: string;
}

export default function StopAutocomplete({
  stops,
  placeholder,
  value,
  onChange,
  iconColor = 'text-gray-400',
}: StopAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Sync display text with selected value
  useEffect(() => {
    if (value) setQuery(value.stop_name);
  }, [value]);

  // Filtered suggestions — limit to 30 for performance
  const suggestions = useMemo(() => {
    if (!query.trim() || query === value?.stop_name) return [];
    const q = query.toLowerCase();
    return stops
      .filter((s) => s.stop_name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, stops, value]);

  const handleSelect = (stop: Stop) => {
    onChange(stop);
    setQuery(stop.stop_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <MapPin size={16} className={iconColor} />
        </div>
        <input
          type="text"
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-10 pr-9 py-3 placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange(null); // Clear selection when typing
          }}
          onFocus={() => {
            if (query.trim() && !value) setIsOpen(true);
          }}
        />
        {/* Clear button */}
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected indicator */}
      {value && (
        <div className="absolute right-9 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500"></div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <ul className="max-h-48 overflow-y-auto py-1">
            {suggestions.map((stop) => (
              <li key={stop.stop_id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => handleSelect(stop)}
                >
                  <MapPin size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">{stop.stop_name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1.5 text-[10px] text-gray-400 border-t border-gray-100 bg-gray-50">
            {suggestions.length} matches
          </div>
        </div>
      )}
    </div>
  );
}
