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

    map.createPane('debug_0');
    map.getPane('debug_0').style.zIndex = 60;

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

let allPaths;
const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow'];
let colorIdx = 0;
/**
 * Displays all loaded paths
 */
function previewAllPaths(_map) {
    $.ajax({
        type: "GET",
        url: "/display-paths",
        success: function (response) {
            displayAll(response);
        }
    });

    function displayAll(res) {
        if(allPaths) _map.removeLayer(allPaths);
        allPaths = [];

        Object.entries(res).forEach(([k, v]) => {
            const color = colors[colorIdx % colors.length];
            const polyline = L.polyline(v, {
                color: color
            }).bindTooltip(`Jeepney: ${k}`).addTo(_map);

            polyline.arrowheads({
                frequency: '250px',
                size: '10px',
                color: color,
                offsets: { start: '25px' }
            });

            colorIdx++;
            allPaths.push(polyline);
        });
    }
}

/**
 * Destroys the previews
 * @param {} _map 
 */
function hidePathPreview(_map) {    
    if (allPaths) {
        allPaths.forEach(function (i) {
            _map.removeLayer(i);
        });
    }
    allPaths = [];
}

const routeColorMap = {};
const colorPool = [
    '#AEC6CF', '#FFB347', '#77DD77', '#CBAACB', '#FFD1DC',
    '#FDFD96', '#B0E0E6', '#F4A7B9', '#E6E6FA', '#D5AAFF'
];
let colorIdx2 = 0;
let pathPolylines = [];

function clearPathPolylines(map, pathlines) {
    pathlines.forEach(pl => map.removeLayer(pl));
    pathPolylines = [];
}

function getPolylineStyle(leg) {
    if (leg.type === "walk") {
        return {
            color: 'yellow',
            weight: 3,
            dashArray: '6,6',
            opacity: 0.8
        };
    }

    let color;
    if (routeColorMap[leg.routeId]) {
        color = routeColorMap[leg.routeId];
    } else {
        color = colorPool[colorIdx2 % colorPool.length];
        routeColorMap[leg.routeId] = color;
        colorIdx2++;
    }

    return {
        color,
        weight: 5,
        opacity: 0.9
    };
}

function drawRouteLegs(map, legs) {
    clearPathPolylines(map, pathPolylines);

    legs.forEach(leg => {
        if (!leg.coordinates || leg.coordinates.length < 2) return;;

        const style = getPolylineStyle(leg);
        const polyline = L.polyline(leg.coordinates, style).addTo(map);
        pathPolylines.push(polyline);

        if (leg.type === 'jeepney') {
            console.log(`Jeepney: ${leg.routeId} with color: ${style.color}`);
            polyline.bindTooltip(`Jeep: ${leg.routeId}`, { sticky: true });
        }

        polyline.arrowheads({
            frequency: '250px',
            size: '25px',
            color: style.color,
            offsets: { start: '35px' }
        });
    });

    // Optional: Fit map to bounds
    const allCoords = legs.flatMap(leg => leg.coordinates || []);
    if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords));
    }
}