import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = () => {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<maplibregl.Map | null>(null);
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
			maxBounds:
				[

					[125.204904, 6.795854],
					[125.892734, 7.516401],
				]
		});

		const mapGl = map.current;
		mapGl.on('load', () => {			
			//Add route data
			mapGl.addSource('route', {
				type: 'geojson',
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: []
					}
				}
			});			
			//Draw line from route data
			mapGl.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				paint: {
					'line-color': 'green',
					'line-width': 8
				}		
			});
		});

		return () => {
			map.current?.remove();
		};
	}, []);

	return (
		<div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
			<div ref={mapContainer} style={{ height: '95%', width: '95%' }} />
		</div>
	);
};

export default MapComponent;
