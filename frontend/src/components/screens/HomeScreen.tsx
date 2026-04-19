import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation2, Search, Loader2, Bus, Car, ChevronDown, Home, Heart, WifiOff } from 'lucide-react';
import { locations, type RouteOption } from '../../data/mockData';
import MapView from '../MapView';
import adamaHero from '../../assets/adama-hero.png';

// Bajaj icon SVG component
function BajajIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M5 18H3V11l4-7h6l3 4h4v6" />
      <path d="M9 18h6" />
      <path d="M19 14V9" />
    </svg>
  );
}

interface HomeScreenProps {
  origin: string;
  setOrigin: (val: string, coords?: [number, number]) => void;
  destination: string;
  setDestination: (val: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  searchError: string | null;
  userLocation: [number, number] | null;
  onScreenChange: (screen: 'OPTIONS') => void;
  routes: RouteOption[];
}

export default function HomeScreen({
  origin,
  setOrigin,
  destination,
  setDestination,
  onSearch,
  isSearching,
  searchError,
  userLocation,
  onScreenChange,
}: HomeScreenProps) {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTransport, setActiveTransport] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Geolocation on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          if (!res.ok) throw new Error("Geocoding failed");
          const data = await res.json();
          if (data && data.address) {
            const { address } = data;
            const place = address.amenity || address.building || address.neighbourhood || address.road || address.suburb;
            const city = address.city || address.town || address.county || '';
            const label = place ? `${place}, ${city}`.replace(/,\s*$/, '') : 'Your Location';
            setLocationStatus('success');
            setOrigin(label, [lat, lon]);
          } else {
            setLocationStatus('success');
            setOrigin('Your Location', [lat, lon]);
          }
        } catch {
          setLocationStatus('success');
          setOrigin('Your Location', [lat, lon]);
        }
      },
      () => {
        setLocationStatus('error');
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const handleSelectDestination = (loc: string) => {
    setDestination(loc);
    setDropdownSearch(loc);
    setIsDropdownOpen(false);
  };

  const handleFindRoutes = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
    setTimeout(() => {
      onScreenChange('OPTIONS');
    }, 700);
  };

  const isFormValid = origin.trim() !== '' && destination.trim() !== '';

  const transportTypes = [
    { id: 'all', label: 'All', icon: <Search size={18} /> },
    { id: 'minibus', label: 'Minibus', icon: <Bus size={18} /> },
    { id: 'taxi', label: 'Taxi', icon: <Car size={18} /> },
    { id: 'bajaj', label: 'Bajaj', icon: <BajajIcon size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 screen-enter">
      {/* ---- LEFT COLUMN / MAIN CONTENT ---- */}
      <div className="flex flex-col h-full md:w-105 lg:w-120 md:shrink-0 md:border-r md:border-gray-200 md:bg-white md:overflow-y-auto">
        {/* Hero Section */}
        <div
          className="relative text-white px-5 pt-10 pb-20 md:pt-8 md:pb-16 md:m-4 md:rounded-2xl shrink-0 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${adamaHero})` }}
        >
          <div className="absolute inset-0 md:rounded-2xl bg-linear-to-br from-black/65 via-emerald-900/55 to-black/45"></div>
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">Navigate Ethiopian Cities</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-px bg-white/40"></div>
              <p className="text-emerald-100 text-sm font-medium">Like a Local</p>
              <div className="w-8 h-px bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="px-4 md:px-5 -mt-14 md:-mt-10 relative z-10">
          <form onSubmit={handleFindRoutes} className="floating-card space-y-3">
            {/* From Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {locationStatus === 'loading' ? (
                  <Loader2 size={16} className="text-gray-400 animate-spin" />
                ) : (
                  <MapPin size={16} className="text-primary" />
                )}
              </div>
              <input
                type="text"
                className="search-input"
                placeholder={locationStatus === 'error' ? "Enter origin (e.g. Posta Bet)" : "Detecting location..."}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                readOnly={locationStatus === 'success' || locationStatus === 'loading'}
                required
              />
            </div>

            {/* To Input (Dropdown) */}
            <div className="relative" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Navigation2 size={16} className="text-secondary" />
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Enter Destination"
                value={isDropdownOpen ? dropdownSearch : (destination || '')}
                onChange={(e) => {
                  setDropdownSearch(e.target.value);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onClick={() => {
                  setIsDropdownOpen(true);
                  setDropdownSearch(destination);
                }}
                required
              />
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    <ul className="py-1">
                      {filteredLocations.map((loc) => (
                        <li key={loc}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            onClick={() => handleSelectDestination(loc)}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              {loc}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-sm text-gray-400 text-center">No locations found</div>
                  )}
                </div>
              )}
            </div>

            {searchError && (
              <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {searchError}
              </p>
            )}

            {/* Find Routes Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSearching}
              className="w-full text-white bg-primary hover:bg-primary-light font-semibold rounded-xl text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 cursor-pointer transition-all duration-200 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Find Routes
            </button>
          </form>
        </div>

        {/* Transport Filter Tabs */}
        <div className="px-4 md:px-5 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {transportTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTransport(t.id)}
                className={`transport-tab ${activeTransport === t.id ? 'active' : ''}`}
              >
                {t.icon}
                <span className="text-xs whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Preview — MOBILE ONLY (below search card) */}
        <div className="px-4 mt-4 flex-1 min-h-0 pb-2 md:hidden">
          <div className="rounded-2xl overflow-hidden shadow-md h-full min-h-50">
            <MapView
              userLocation={userLocation}
              originLabel={origin}
              selectedRoute={null}
              height="100%"
              interactive={true}
              showControls={false}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav shrink-0 md:mt-auto md:border-t md:border-gray-200">
          <button className="bottom-nav-item active">
            <Home size={20} />
            <span>Home</span>
          </button>
          <button className="bottom-nav-item">
            <Heart size={20} />
            <span>Saved</span>
          </button>
          <button className="bottom-nav-item">
            <WifiOff size={20} />
            <span>Offline</span>
          </button>
        </div>
      </div>

      {/* ---- RIGHT COLUMN: MAP (DESKTOP ONLY) ---- */}
      <div className="hidden md:block flex-1 h-full">
        <MapView
          userLocation={userLocation}
          originLabel={origin}
          selectedRoute={null}
          height="100%"
          interactive={true}
          showControls={true}
        />
      </div>
    </div>
  );
}
