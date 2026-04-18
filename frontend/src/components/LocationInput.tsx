import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function LocationInput({ value, onChange }: LocationInputProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Attempt to get user location on mount
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (_position) => {
        // Here we could use reverse geocoding if we had an API.
        // For MVP, we simply show "Your Location"
        setStatus('success');
        onChange('Your Location');
      },
      (_error) => {
        // Permission denied or unavailable
        setStatus('error');
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {status === 'loading' ? (
          <Loader2 size={18} className="text-gray-400 animate-spin" />
        ) : (
          <MapPin size={18} className="text-gray-400" />
        )}
      </div>
      <input
        type="text"
        className={`w-full bg-gray-900 border ${status === 'error' ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500 focus:border-green-500'} text-gray-200 text-sm rounded-lg block pl-10 p-2.5 placeholder-gray-500 outline-none transition-colors`}
        placeholder={status === 'error' ? "Location access required. (e.g. Posta Bet)" : "Detecting location..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={status === 'success' || status === 'loading'}
        required
      />
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-1 ml-1">Location access denied. Please enter manually.</p>
      )}
    </div>
  );
}
