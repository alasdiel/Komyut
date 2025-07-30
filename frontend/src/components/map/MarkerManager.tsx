import { Marker, Map } from 'maplibre-gl';

export interface MarkerHandlers {
	setStartPos: (pos: { lat: number; lng: number }) => void;
	setEndPos: (pos: { lat: number; lng: number }) => void;
}

export function createMarkers(map: Map, handlers: MarkerHandlers) {
	const startMarker = new Marker({
		color: 'red',
		draggable: true,
	})
		.setLngLat([125.588236, 7.050853])
		.addTo(map);

	const endMarker = new Marker({
		color: 'blue',
		draggable: true,
	})
		.setLngLat([125.642093, 7.132042])
		.addTo(map);

	startMarker.on('dragend', () => {
		handlers.setStartPos({
			lat: startMarker.getLngLat().lat,
			lng: startMarker.getLngLat().lng,
		});
	});

	endMarker.on('dragend', () => {
		handlers.setEndPos({
			lat: endMarker.getLngLat().lat,
			lng: endMarker.getLngLat().lng,
		});
	});

	return { startMarker, endMarker };
}