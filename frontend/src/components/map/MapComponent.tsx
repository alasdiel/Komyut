import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRouteStore, type RouteLeg } from './useRouteStore.tsx';
import MapRoutingOverlay from './MapRoutingOverlay.tsx';


const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { routeData } = useRouteStore(); 
  const stylejson = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: stylejson,
      center: [125.6088, 7.15],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14,
      maxBounds: [
        [125.204904, 6.795854],
        [125.892734, 7.516401],
      ],
    });

    return () => {
      map.current?.remove(); 
    };
  }, []);

  useEffect(() => {
    if (!map.current || !routeData) return;

    routeData.legs.forEach((leg: RouteLeg, index: number) => {
      const id = `leg-${index}`;

      if (map.current?.getSource(id)) return;
      if (!map.current) return;
      map.current.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: leg.coordinates.map(([lat, lng]) => [lng, lat]), // [lng, lat]
          },
          properties: {
            type: leg.type,
            routeId: leg.routeId,
          },
        },
      });

      map.current.addLayer({
        id: id,
        type: 'line',
        source: id,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': leg.type === 'walk' ? '#888' : '#007aff',
          'line-width': leg.type === 'walk' ? 3 : 5,
          ...(leg.type === 'walk' ? { 'line-dasharray': [2, 2] } : {}),
        },
      });
    });
  }, [routeData]);

  return (
    <div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      <MapRoutingOverlay />
    </div>
  );
};

export default MapComponent;

