import { useState, useRef, useEffect } from 'react';
import { Navigation2, ChevronDown } from 'lucide-react';
import { locations } from '../data/mockData';

interface RouteDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

export default function RouteDropdown({ value, onChange }: RouteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: string) => {
    onChange(loc);
    setSearchTerm(loc);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Navigation2 size={18} className="text-green-500" />
      </div>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <input
        type="text"
        aria-label="Where to?"
        className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-base md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block px-10 py-3.5 placeholder-gray-500 outline-none transition-colors cursor-text touch-manipulation"
        placeholder="Where to?"
        value={isOpen ? searchTerm : (value || '')}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={() => {
          setIsOpen(true);
          setSearchTerm(value); // Let user edit current selection or clear
        }}
        required
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-72 md:max-h-60 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            <ul className="py-1 text-sm text-gray-200">
              {filteredLocations.map((loc) => (
                <li key={loc}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-base md:text-sm hover:bg-gray-700 hover:text-green-400 transition-colors touch-manipulation"
                    onClick={() => handleSelect(loc)}
                  >
                    {loc}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-400 text-center">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
