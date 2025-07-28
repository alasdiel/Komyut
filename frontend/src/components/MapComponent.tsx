import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/ui/button'

interface Position {
	lat: number;
	lng: number;
}

interface RouteLeg {
	type: string;
	routeId: string;
	coordinates: [number, number][];
}

interface RouteData {
	legs: RouteLeg[];
}

const MapComponent = () => {
	const [startPos, setStartPos] = useState<Position>({ lat: 7.095888, lng: 125.505776 });
	const [endPos, setEndPos] = useState<Position>({ lat: 7.120814, lng: 125.623431 });
	const [routeData, setRouteData] = useState<RouteData | null>(null);

	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const stylejson = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;

	//click boilerplate
	const handleClick = async () => {
		const response = await fetch("https://stjfocjqw2.execute-api.ap-southeast-1.amazonaws.com/prod/calc-route",
			{
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ startPos, endPos })
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log(data);

		if (!data.legs) {
			throw new Error("No route data returned");
		}

		setRouteData(data);
	};

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
		
		if(!routeData) return;
		map.current.on('load', () => {
			routeData.legs.forEach((leg: RouteLeg, index: number) => {
				const id = `leg-${index}`;

				if(!map.current) return;

				map.current.addSource(id, {
					type: 'geojson',
					data: {
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: leg.coordinates.map(([lat, lng]: [number, number]) => [lng, lat]), // flip to [lng, lat]
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
						...(leg.type === "walk" ? { "line-dasharray": [2, 2] } : {}) // ← only apply if walk
					},
				});
			});
		});

	}, [routeData]);

	const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end', coord: 'lat' | 'lng') => {
		const value = parseFloat(e.target.value);
		if (type === 'start') {
			setStartPos(prev => ({ ...prev, [coord]: value }));
		} else {
			setEndPos(prev => ({ ...prev, [coord]: value }));
		}
	};

	return (
		<div className="flex flex-row min-h-screen justify-center items-center bg-orange-400" style={{ height: '100vh', width: '100%' }}>
			<div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
			{/* <div idName="controls" className="flex items-center justify-center flex-col h-1/3 bg-indigo-950"> */}
			<div className="flex items-center justify-center flex-col h-1/3 bg-indigo-950">

				<div className="text-white m-2">
					<h3 className="font-epilogue">Start Position</h3>
					<div>
						<label>
							Latitude:
							<input className="bg-white text-black"
								value={startPos.lat}
								onChange={(e) => handlePositionChange(e, 'start', 'lat')}
							/>
						</label>
						<br />
						<label>
							Longitude:
							<input className="bg-white text-black"
								value={startPos.lng}
								onChange={(e) => handlePositionChange(e, 'start', 'lng')}
							/>
						</label>
					</div>
				</div>

				<div className="text-white m-2">
					<h3 className="font-epilogue">End Position</h3>
					<div>
						<label>
							Latitude:
							<input className="bg-white text-black"
								value={endPos.lat}
								onChange={(e) => handlePositionChange(e, 'end', 'lat')}
							/>
						</label>
						<br />
						<label>
							Longitude:
							<input className="bg-white text-black"
								value={endPos.lng}
								onChange={(e) => handlePositionChange(e, 'end', 'lng')}
							/>
						</label>
					</div>
				</div>
				<Button className="py-4 m-2" onClick={handleClick}>
					Calc
				</Button>

				{// ends here
				}

			</div>

		</div>
	);
};

export default MapComponent;
