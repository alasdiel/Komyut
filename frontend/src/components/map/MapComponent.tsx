import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useColorMapStore, useKomyutMapStore, useRouteStore, type RouteLeg } from './useRouteStore.tsx';
import { createMarkers } from './MarkerManager.tsx';
import { getPathlineStyle } from './PathStyler.ts';
import { FarePopup, type JeepneyLeg } from '../FarePopUp.tsx';
import { displayEstimatedTime, displayTotalDistance, populateFarePopupLegs } from './PopupDataManager.tsx';
import { useMapStore } from './useMapStore';
import { createMapLibreGlMapController } from '@maptiler/geocoding-control/maplibregl-controller';



const MapComponent = () => {
  const setMapInstance = useMapStore((s) => s.setMap);
  const setMapController = useMapStore((s) => s.setMapController);
  const setStartPos = useRouteStore(s => s.setStartPos);
	const setEndPos = useRouteStore(s => s.setEndPos);

	const routeColors = useColorMapStore(s => s.routeColors);
	const setRouteColor = useColorMapStore(s => s.setRouteColor);

	const [legs, setLegs] = useState<JeepneyLeg[]>([]);

	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const { routeData } = useRouteStore();
	const stylejson = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;

	//Initialize map on load
	useEffect(() => {
		if (!mapContainer.current) return;

		map.current = new maplibregl.Map({
			container: mapContainer.current,
			style: stylejson,
			center: [125.6088, 7.15],
			zoom: 10,
			minZoom: 8,
			maxZoom: 17,
			maxBounds: [
				[125.204904, 6.795854],
				[125.892734, 7.516401],
			],
		});
    
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapInstance(map.current!);
      setMapController(createMapLibreGlMapController(map.current!, maplibregl));
      
	  const { startMarker, endMarker } = createMarkers(map.current!, { setStartPos, setEndPos });

	  useKomyutMapStore.getState().setStartMarker(startMarker);
	  useKomyutMapStore.getState().setEndMarker(endMarker);
    });

    return () => {
    map.current?.remove();
  };
}, [stylejson, setStartPos, setEndPos, setRouteColor, setMapInstance, setMapController]);

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

				const pathStyle = getPathlineStyle(leg);
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
		
	}, [routeData, setRouteColor]);

	//Effect for when geocoding becomes available
	useEffect(() => {		
		if(!routeData) return;

		let isMounted = true;

		const loadLegs = async() => {
			const legsData = await populateFarePopupLegs(routeData, routeColors);
			if(isMounted) {
				setLegs(legsData);
			}
		};

		loadLegs();

		return () => {
			isMounted = false;
		};
	}, [routeData, routeColors]);

	return (
		<div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
			<div ref={mapContainer} style={{ height: '100%', width: '100%' }} />			
			{routeData && (
				<FarePopup
					eta={displayEstimatedTime(routeData)}
					distance={displayTotalDistance(routeData)}
					legs={legs}															
				/>
			)}
		</div>
	);
};

export default MapComponent;

