import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=E79wjmuo7MACxeX5KvXK',
      center: [125.6088, 7.15],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14,
      maxBounds: 
      [

      [125.204904, 6.795854], 
      [125.892734, 7.516401], 

      ]
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '85%', width: '85%' }} />
    </div>
  );
};

export default MapComponent;
