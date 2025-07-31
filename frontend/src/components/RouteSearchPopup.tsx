import { useState, useEffect, useRef } from 'react';
import { X, SearchIcon } from 'lucide-react';

export interface LocationResult {
  id: string;
  name: string;
  address?: string;
  coordinates: [number, number];
}

export interface RouteSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteSubmit: (start: LocationResult, end: LocationResult) => void;
}

interface MapTilerFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
}

interface MapTilerGeocodingResponse {
  feature: MapTilerFeature[];
}
export function RouteSearchPopup({ isOpen, onClose, onRouteSubmit }: RouteSearchPopupProps) {
  const VITE_MAPTILER_API = import.meta.env.VITE_MAPTILER_API;

  const [isMobile, setIsMobile] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // Search states
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startResults, setStartResults] = useState<LocationResult[]>([]);
  const [endResults, setEndResults] = useState<LocationResult[]>([]);
  const [selectedStart, setSelectedStart] = useState<LocationResult | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<LocationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const dragRef = useRef(null);

  // Check if the device is mobile, copied from FarePopup
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Search the inputted locations using MapTiler API
    const searchLocations = async (query: string): Promise<LocationResult[]> => {
    if (!query) return [];
    
    try {
      setIsSearching(true);
      const response = await fetch(
        VITE_MAPTILER_API // Replace with maptiler api url or wtv
      );
      const data = await response.json() as MapTilerGeocodingResponse;
      
      return data.feature.map((feature: MapTilerFeature) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: feature.center
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search with debounce timer
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (startQuery) {
        const results = await searchLocations(startQuery);
        setStartResults(results);
      } else {
        setStartResults([]);
      }
    }, 1000); // 1s debounce delay before searching
    
    return () => clearTimeout(timer);
  }, [startQuery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (endQuery) {
        const results = await searchLocations(endQuery);
        setEndResults(results);
      } else {
        setEndResults([]);
      }
    }, 1000); // 1s debounce delay before searching
    
    return () => clearTimeout(timer);
  }, [endQuery]);

  // Mobile drag handlers, copied from FarePopup
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    setDragPosition(diff > 0 ? diff : 0);
  };

  const handleTouchEnd = () => {
    if (dragPosition > 100) {
      onClose();
    }
    setDragPosition(0);
  };

  const handleSubmit = () => {
    if (selectedStart && selectedEnd) {
      onRouteSubmit(selectedStart, selectedEnd);
      onClose();
    }
  };

  // DESKTOP/TABLET VIEW
  if (!isMobile) {
    return isOpen ? (
        <div ref={dragRef} className="fixed left-4 top-4 w-112 bg-white shadow-[0_20px_20px_-5px_rgba(0,0,0,0.5)] z-20 border border-orange-400 rounded-lg flex flex-col">
          <div className="p-6 h-full overflow-y-auto pb-6">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl text-orange-500 font-bold mb-4 text-center">Plan Your Route</h2>
            
            {/* Start Point Search */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-orange-500 mb-1">Start Point</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedStart?.name || startQuery}
                  onChange={(e) => {
                    setStartQuery(e.target.value);
                    if (e.target.value === '') setSelectedStart(null);
                  }}
                  placeholder="Enter starting location"
                  className="w-full p-2 border border-gray-300 rounded-md pl-10"
                />
                <SearchIcon className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
              {startQuery && !selectedStart && (
                <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-2 text-center text-gray-500">Searching...</div>
                  ) : startResults.length > 0 ? (
                    startResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedStart(result);
                          setStartQuery('');
                          setStartResults([]);
                        }}
                      >
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-500">{result.address}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>

            {/* End Point Search */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-orange-500 mb-1">End Point</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedEnd?.name || endQuery}
                  onChange={(e) => {
                    setEndQuery(e.target.value);
                    if (e.target.value === '') setSelectedEnd(null);
                  }}
                  placeholder="Enter destination"
                  className="w-full p-2 border border-gray-300 rounded-md pl-10"
                />
                <SearchIcon className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
              {endQuery && !selectedEnd && (
                <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-2 text-center text-gray-500">Searching...</div>
                  ) : endResults.length > 0 ? (
                    endResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedEnd(result);
                          setEndQuery('');
                          setEndResults([]);
                        }}
                      >
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-gray-500">{result.address}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedStart || !selectedEnd}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                selectedStart && selectedEnd ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-300 cursor-not-allowed'
              }`}
            >
              Find Route
            </button>
          </div>
        </div>
    ) : null;
  }

  // MOBILE VIEW
  return isOpen ? (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transition-transform ${
          dragPosition > 0 ? '' : 'transform translate-y-0'
        }`}
        style={{
          transform: `translateY(${dragPosition}px)`,
          opacity: 1 - (dragPosition / 200),
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">Plan Your Route</h2>
        
        {/* Start Point Search (Mobile) */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Point</label>
          <div className="relative">
            <input
              type="text"
              value={selectedStart?.name || startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                if (e.target.value === '') setSelectedStart(null);
              }}
              placeholder="Enter starting location"
              className="w-full p-2 border border-gray-300 rounded-md pl-10"
            />
            <SearchIcon className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          {startQuery && !selectedStart && (
            <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
              {isSearching ? (
                <div className="p-2 text-center text-gray-500">Searching...</div>
              ) : startResults.length > 0 ? (
                startResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedStart(result);
                      setStartQuery('');
                      setStartResults([]);
                    }}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-gray-500">{result.address}</div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* End Point Search (Mobile) */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Point</label>
          <div className="relative">
            <input
              type="text"
              value={selectedEnd?.name || endQuery}
              onChange={(e) => {
                setEndQuery(e.target.value);
                if (e.target.value === '') setSelectedEnd(null);
              }}
              placeholder="Enter destination"
              className="w-full p-2 border border-gray-300 rounded-md pl-10"
            />
            <SearchIcon className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          {endQuery && !selectedEnd && (
            <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
              {isSearching ? (
                <div className="p-2 text-center text-gray-500">Searching...</div>
              ) : endResults.length > 0 ? (
                endResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedEnd(result);
                      setEndQuery('');
                      setEndResults([]);
                    }}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-gray-500">{result.address}</div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedStart || !selectedEnd}
          className={`w-full py-3 rounded-md text-white font-medium ${
            selectedStart && selectedEnd ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Find Route
        </button>
      </div>
    </div>
  ) : null;
}