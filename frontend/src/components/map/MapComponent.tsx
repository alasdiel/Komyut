import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useColorMapStore, useRouteStore, type RouteLeg } from './useRouteStore.tsx';
import MapRoutingOverlay from './MapRoutingOverlay.tsx';
import { createMarkers } from './MarkerManager.tsx';
import { getPathlineStyle } from './PathStyler.ts';
import { FarePopup } from '../FarePopUp.tsx';
import { populateFarePopupLegs } from './PopupDataManager.tsx';


const MapComponent = () => {
	const setStartPos = useRouteStore(s => s.setStartPos);
	const setEndPos = useRouteStore(s => s.setEndPos);

	const { setRouteColor } = useColorMapStore.getState();
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

		if(map.current) {
			createMarkers(map.current, { setStartPos, setEndPos });
		}

		return () => {
			map.current?.remove();
		};
	}, [stylejson, setStartPos, setEndPos]);

	useEffect(() => {
		if (!map.current) return;

		if (!map.current.isStyleLoaded()) {
			map.current.once("styledata", () => {
				clearOldLegs();
				drawLegs();
			});
			return;
		}

		function clearOldLegs() {
			const existingLegLayers = map.current?.getStyle().layers?.filter(l => l.id.startsWith("leg-")) || [];
			existingLegLayers.forEach(layer => {
				if (map.current?.getLayer(layer.id)) {
					map.current.removeLayer(layer.id);
				}
				if (map.current?.getSource(layer.id)) {
					map.current.removeSource(layer.id);
				}
			});
		}

		function drawLegs() {
			if (!routeData) return;
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

				let pathStyle = getPathlineStyle(leg);
				if(leg.type === 'jeepney') {
					const color = pathStyle!['line-color'] as string;
					setRouteColor(leg.routeId!, color);
				}
				map.current.addLayer({
					id: id,					
					source: id,
					type: 'line',
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: pathStyle
				});
			});
		}

		clearOldLegs();
		drawLegs();		
		
	}, [routeData]);

	return (
		<div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
			<div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
			<MapRoutingOverlay />
			{routeData && (
				<FarePopup
					eta="-- mins"
					distance="-- km"
					legs={populateFarePopupLegs(routeData)}					
				/>
			)}			
		</div>
	);
};

export default MapComponent;

