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
        [7.09, 125.50], {
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
        [7.13, 125.62], {
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

const routeColorMap = {};
const colorPool = ['green', 'red', 'purple', 'orange', 'blue', 'magenta', 'cyan'];
let colorIdx2 = 0;
let pathPolylines = [];
/**
 * Visualizes the calculated
 * @param {*} _map Leaflet map instance
 * @param {*} _path Dijkstra algorithm calculated path
 * @param {*} _routes Array of loaded routes
 * @param {*} _startCoord Start coordinate
 * @param {*} _endCoord End coordinate
 */
function visualizeCalculatedPath(_map, _path, _routes, _startCoord, _endCoord) {
    pathPolylines = clearPathPolylines(_map, pathPolylines);

    function getCoord(_nodeId) {
        if (_nodeId === 'START') return _startCoord;
        if (_nodeId === 'END') return _endCoord;

        const [routeId, idx] = _nodeId.split('-');
        const route = _routes.find(r => r.routeFile.routeName === routeId);
        return route?.truncatedPath?.[parseInt(idx)];
    }

    for (let i = 0; i < _path.length - 1; i++) {
        const fr = _path[i];
        const to = _path[i+1];

        const fromCoord = getCoord(fr);
        const toCoord = getCoord(to);

        if(!fromCoord || !toCoord) {
            console.warn(`Missing coordinate for segment ${fr} ${to}`);
            continue;
        }

        const segmentCoords = [
            [fromCoord[0], fromCoord[1]],
            [toCoord[0], toCoord[1]]
        ];

        const isWalk = fr === 'START' || to === 'END';

        if(isWalk) {
            const layer = L.polyline(segmentCoords, {
                color: 'yellow',
                weight: 4,
                dashArray: '8,8'
            }).addTo(_map);
            layer.bindTooltip(`Walk`, {
                permanent: false,
                direction: 'center',
                offset: [0, -4],
                className: 'walk-tooltip'
            });
            pathPolylines.push(layer);
        } else {
            const [routeId] = fr.split('-');            

            if(!routeColorMap[routeId]) {
                routeColorMap[routeId] = colorPool[colorIdx2 % colorPool.length];
                colorIdx2++;
            }

            const layer = L.polyline(segmentCoords, {
                color: routeColorMap[routeId],
                weight: 5
            }).addTo(_map);
            layer.bindTooltip(`Jeepney Route: ${routeId}`, {
                permanent: false,
                direction: 'center',
                offset: [0, -4],
                className: 'jeep-tooltip'
            });
            pathPolylines.push(layer);
        }
    }
}