import { GeocodingControl } from '@maptiler/geocoding-control/react';
import '@maptiler/geocoding-control/style.css';
import { useMapStore } from './useMapStore';

const GeocodingComponent  = () => {
  const mapController = useMapStore((s) => s.mapController);

  if (!mapController) return null;

  return (
    <GeocodingControl
      apiKey={import.meta.env.VITE_MAPTILER_KEY}
      mapController={mapController}
    />
  );
};

export default GeocodingComponent;
