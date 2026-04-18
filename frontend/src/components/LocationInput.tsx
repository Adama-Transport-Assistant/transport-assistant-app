import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (val: string, coords?: [number, number]) => void;
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
      async (_position) => {
        const lat = _position.coords.latitude;
        const lon = _position.coords.longitude;

        try {
          // Reverse geocoding using Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          if (!res.ok) throw new Error("Geocoding failed");
          const data = await res.json();

          if (data && data.address) {
            const { address } = data;
            const place = address.amenity || address.building || address.neighbourhood || address.road || address.suburb;
            const city = address.city || address.town || address.county || '';
            const label = place ? `${place}, ${city}`.replace(/,\s*$/, '') : 'Your Location';

            setStatus('success');
            onChange(label, [lat, lon]);
          } else {
            setStatus('success');
            onChange('Your Location', [lat, lon]);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setStatus('success');
          onChange('Your Location', [lat, lon]);
        }
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

