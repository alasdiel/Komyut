import { useState, useEffect } from 'react';
import { GeocodingControl } from '@maptiler/geocoding-control/react';
import '@maptiler/geocoding-control/style.css';
import { useMapStore } from './useMapStore';
import { useRouteStore } from './useRouteStore';
import { CalculateButton } from './CalculateButton';
import type React from 'react';

export default function GeocodingComponent({}) {
  const mapController = useMapStore((s) => s.mapController);
  const setStartPos = useRouteStore((s) => s.setStartPos);
  const setEndPos = useRouteStore((s) => s.setEndPos);
  const [ isMobile, setIsMobile ] = useState(false);
  useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }, []); 
  if (!mapController) return null;

  const GeocoderField = ({
    label,
    onSelect,
  }: {
    label: string;
    onSelect: (lngLat: { lat: number; lng: number }) => void;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-orange-500 mb-1">{label}</label>
      <div className="w-full relative z-10">
        <GeocodingControl
          apiKey={import.meta.env.VITE_MAPTILER_KEY}
          mapController={mapController}
          placeholder={`Enter ${label.toLowerCase()}`}
          onSelect={(feature) => {
            console.log('Selected feature:', feature);
            if (feature?.geometry?.type === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;
              onSelect({ lat, lng });
            }
          }}
        />
      </div>
    </div>
  );

  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    return !isMobile ? (
      <div className="left-4 top-4 bg-white shadow-lg border border-orange-400 rounded-lg z-20 flex flex-col">
        <div className="p-6 h-full overflow-y-auto pb-6 relative">
          <button className="absolute top-4 right-4 text-black hover:text-gray-700">
          </button>
          {children}
        </div>
      </div>
    ) : (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <LayoutWrapper>
      <h2 className="flex justify-center text-xl font-bold text-orange-500 mb-4 text-center">Plan Your Route</h2>
      <div className="flex flex-col gap-10 my-5">
        <GeocoderField label="Start Point" onSelect={setStartPos} />
        <GeocoderField label="End Point" onSelect={setEndPos} />
      </div>
      <div className="flex justify-center">
        <CalculateButton />
      </div>
    </LayoutWrapper>
  );
}
