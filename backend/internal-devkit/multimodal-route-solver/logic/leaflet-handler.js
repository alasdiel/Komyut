/**
 * Initializes Leaflet/OSM map in div
 * @returns Returns leaflet map instance
 */
function initializeLeaflet() {
    const map = L.map('map').setView([7.0706, 125.4542], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
}

/**
 * Creates Start and End markers on leaflet map
 * @param {*} map Leaflet map instance
 * @param {*} markerPositions Pass-by-reference for start and end marker LatLongs everytime it is dragged
 * @returns startMarker and stopMarker objects
 */
function leafletCreateMarkers(_map, _markerPositions) {
    const startMarker = L.marker(
        [7.0931191, 125.5037824], {
            draggable: true,
            icon: new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }
    ).addTo(_map);

    const stopMarker = L.marker(
        [7.0571564, 125.5797422], {
            draggable: true,
            icon: new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }
    ).addTo(_map);

    //Set start pos when startMarker is dragged
    startMarker.on('dragend', function (e) {
        const latlng = startMarker.getLatLng();
        _markerPositions.startPos = latlng;
        $('#start-coords').html(`(Red) START: ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`);
    });

    //Set end pos when startMarker is dragged
    stopMarker.on('dragend', function (e) {
        const latlng = stopMarker.getLatLng();
        _markerPositions.endPos = latlng;
        $('#end-coords').html(`(Blue) END: ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`);
    });

    return {startMarker, stopMarker};
}

let colorIdx = 0;
const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow'];
/**
 * 
 * @param {*} _coords Path to visualize 
 * @returns The Leaflet polyline and the color automatically chosen
 */
function visualizePath(_map, _path) {
    const color = colors[colorIdx % colors.length];
    colorIdx++;

    //Create polyline from path
    const polyLine = L.polyline(_path, {
        color: color
    }).addTo(_map);
    //Add arrowheads to show directionality
    polyLine.arrowheads({
        frequency: '250px',
        size: '10px',
        color: color,
        offsets: { start: '25px' }
    });

    return {
        polyLine, color
    }
}

/**
 * Clears the specified polylines
 * @param {*} _map Leaflet Map instance
 * @param {*} _pathLines Leaflet layers to delete
 * @returns 
 */
function clearPathPolylines(_map, _pathLines) {
    if(_pathLines.length > 0) _pathLines.forEach(pl => _map.removeLayer(pl));
    return [];
}