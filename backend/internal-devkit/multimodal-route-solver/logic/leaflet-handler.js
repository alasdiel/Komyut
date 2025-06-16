/**
 * Initializes Leaflet/OSM map in div
 * @returns Returns leaflet map instance
 */
function initializeLeaflet() {
    const map = L.map('map').setView([7.1006, 125.5742], 13);
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

    return { startMarker, stopMarker };
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
    if (_pathLines.length > 0) _pathLines.forEach(pl => _map.removeLayer(pl));
    return [];
}

async function getWalkingPath(_fr, _to) {
    const url = `http://localhost:5000/route/v1/foot/${_fr[1]},${_fr[0]};${_to[1]},${_to[0]}?overview=full&geometries=geojson`;

    const resp = await fetch(url);
    const json = await resp.json();

    if(json.code === 'Ok' && json.routes.length > 0) {
        return json.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);
    } else {
        console.warn(`OSRM walking pathing failed!: ${json}`);
        return [_fr, _to];
    }
}

const routeColorMap = {};
const colorPool = [
    '#AEC6CF', // pastel blue
    '#FFB347', // pastel orange
    '#77DD77', // pastel green
    '#CBAACB', // pastel purple
    '#FFD1DC', // pastel pink
    '#FDFD96', // pastel yellow
    '#B0E0E6', // pastel cyan
    '#F4A7B9', // pastel rose
    '#E6E6FA', // lavender
    '#D5AAFF'  // light violet
];
let colorIdx2 = 0;
let pathPolylines = [];
/**
 * Visualizes the calculated path
 * @param {*} _map Leaflet map instance
 * @param {*} _path Dijkstra algorithm calculated path
 * @param {*} _routes Array of loaded routes
 * @param {*} _startCoord Start coordinate
 * @param {*} _endCoord End coordinate
 */
async function visualizeCalculatedPath(_map, _path, _routes, _startCoord, _endCoord) {
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
        const to = _path[i + 1];

        const fromCoord = getCoord(fr);
        const toCoord = getCoord(to);

        if (!fromCoord || !toCoord) {
            console.warn(`Missing coordinate for segment ${fr} ${to}`);
            continue;
        }

        const segmentCoords = [
            [fromCoord[0], fromCoord[1]],
            [toCoord[0], toCoord[1]]
        ];

        const isStartOrEndWalk = fr === 'START' || to === 'END';
        const [frRouteId] = fr.split('-');
        const [toRouteId] = to.split('-');

        const isTransferWalk = (frRouteId !== toRouteId) && !isStartOrEndWalk;

        if (isStartOrEndWalk || isTransferWalk) {
            const walkingPath = await getWalkingPath(fromCoord, toCoord);

            // Yellow dashed line
            const layer = L.polyline(walkingPath, {
                color: 'yellow',
                weight: 4,
                dashArray: '8,8'
            }).bindTooltip(`Walk`).addTo(_map);
            pathPolylines.push(layer);

            // Add markers for transfer walks
            if (isTransferWalk) {
                // Get off (fromCoord) - red
                const getOffMarker = L.circleMarker(fromCoord, {
                    radius: 6,
                    color: 'red',
                    fillColor: 'red',
                    fillOpacity: 1
                }).bindTooltip(`Get off ${frRouteId}`, { direction: "top", permanent: false }).addTo(_map);
                pathPolylines.push(getOffMarker);

                // Get on (toCoord) - green
                const getOnMarker = L.circleMarker(toCoord, {
                    radius: 6,
                    color: 'lime',
                    fillColor: 'lime',
                    fillOpacity: 1
                }).bindTooltip(`Get on ${toRouteId}`, { direction: "top", permanent: false }).addTo(_map);
                pathPolylines.push(getOnMarker);
            }

        } else {
            // Jeepney segment
            if (!routeColorMap[frRouteId]) {
                routeColorMap[frRouteId] = colorPool[colorIdx2 % colorPool.length];
                colorIdx2++;
            }

            const layer = L.polyline(segmentCoords, {
                color: routeColorMap[frRouteId],
                weight: 5
            }).addTo(_map);

            layer.bindTooltip(`Jeepney Route: ${frRouteId}`, {
                permanent: false,
                direction: 'center',
                offset: [0, -4],
                className: 'jeep-tooltip'
            });

            pathPolylines.push(layer);
        }
    }
}

/**
 * Visualizes the calculated merged path
 * @param {*} _map Leaflet map instance
 * @param {*} _merged Dijkstra algorithm calculated path
 * @param {*} _routes Array of loaded routes
 * @param {*} _startCoord Start coordinate
 * @param {*} _endCoord End coordinate
 */
async function visualizeCalculatedMergedPath(_map, _merged, _routes, _startCoord, _endCoord) {
    pathPolylines = clearPathPolylines(_map, pathPolylines);

    function getCoord(_nodeId) {
        if (_nodeId === 'START') return _startCoord;
        if (_nodeId === 'END') return _endCoord;

        const [routeId, idx] = _nodeId.split('-');
        const route = _routes.find(r => r.routeFile.routeName === routeId);
        return route?.truncatedPath?.[parseInt(idx)];
    }

    for(const leg of _merged) {
        const coords = leg.nodes.map(getCoord).filter(Boolean);

        if(coords.length < 2) continue;

        if(leg.type === 'walk') {
            const walkingPath = await getWalkingPath(coords[0], coords[coords.length - 1]);

            const walkPolyLine = L.polyline(walkingPath, {
                color: 'yellow',
                weight: 4,
                dashArray: '8,8'
            }).bindTooltip(`Walk`).addTo(_map);
            pathPolylines.push(walkPolyLine);

            const isTransfer = !['START', 'END'].includes(leg.nodes[0]) && !['START', 'END'].includes(leg.nodes[1]);
            if(isTransfer) {
                const frRoute = leg.nodes[0].split('-')[0];
                const toRoute = leg.nodes[1].split('-')[0];

                const getOffMarker = L.circleMarker(coords[0], {
                    radius: 6,
                    color: 'red',
                    fillColor: 'red',
                    fillOpacity: 1,
                    className: 'getoff-marker'
                }).bindTooltip(`Get off ${frRoute}`, {direction: 'top'}).addTo(_map);
                pathPolylines.push(getOffMarker);

                const getOnMarker = L.circleMarker(coords[coords.length - 1], {
                    radius: 6,
                    color: 'lime',
                    fillColor: 'lime',
                    fillOpacity: 1,
                    className: 'geton-marker'
                }).bindTooltip(`Get on ${toRoute}`, {direction: 'top'}).addTo(_map);
                pathPolylines.push(getOnMarker);
            }
        } else if (leg.type === 'jeepney') {
            // Jeepney segment
            if (!routeColorMap[leg.routeId]) {
                routeColorMap[leg.routeId] = colorPool[colorIdx2 % colorPool.length];
                colorIdx2++;
            }

            const layer = L.polyline(coords, {
                color: routeColorMap[leg.routeId],
                weight: 8,
                className: 'jeepney-route'
            }).addTo(_map);

            layer.bindTooltip(`Jeepney Route: ${leg.routeId}`, {
                permanent: false,
                direction: 'center',
                offset: [0, -4],
                className: 'jeep-tooltip'
            });

            layer.arrowheads({
                frequency: '200px',                
                size: '20px',
                color: routeColorMap[leg.routeId],
                fill: true,
                offsets: { start: '15px' }
            });

            pathPolylines.push(layer);
        }
    }
}

/**
 * Shows transfer points in map
 * @param {*} _map Leaflet map instance
 * @param {*} _transferPoints Transfer points
 */
function visualizeTransferPoints(_map, _transferPoints) {
    _transferPoints.forEach(t => {
        const coords = [
            [t.from.coord[0], t.from.coord[1]],
            [t.to.coord[0], t.to.coord[1]]
        ];

        // Draw line between transfer points
        const line = L.polyline(coords, {
            color: 'gray',
            dashArray: '4,6',
            weight: 3
        }).addTo(_map);

        // Optional: Tooltip on the line
        line.bindTooltip(`Transfer: ${t.from.routeId} → ${t.to.routeId}`, {
            permanent: false,
            direction: 'center',
            className: 'transfer-tooltip'
        });

        // Optional: Circle markers for 'get off' and 'get on'
        L.circleMarker(coords[0], {
            radius: 5,
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.9
        }).addTo(_map).bindTooltip('Get Off', { permanent: false, direction: 'top' });

        L.circleMarker(coords[1], {
            radius: 5,
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.9
        }).addTo(_map).bindTooltip('Get On', { permanent: false, direction: 'top' });
    });
}