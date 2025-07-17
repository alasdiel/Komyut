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
      style: 'https://demotiles.maplibre.org/style.json',
      center: [125.6088, 7.15],
      zoom: 10,
      minZoom: 8,
      // maxBounds: 
      // [
      //  [],
      //
      //  []]
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default MapComponent;
