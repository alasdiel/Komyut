// ===========================
// Icons
// ===========================
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const intermediateIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ===========================
// Marker creation helpers
// ===========================
function createMarker(map, lat, lng, icon, onDrag, onClick) {
    const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
    if (onDrag) marker.on('dragend', onDrag);
    if (onClick) marker.on('click', onClick);
    return marker;
}

function createStartMarker(map, lat, lng) {
    return createMarker(map, lat, lng, startIcon, async () => {
        await visualizeOSRMGeometry(map);
    });
}

function createEndMarker(map, lat, lng) {
    return createMarker(map, lat, lng, endIcon, async () => {
        await visualizeOSRMGeometry(map);
    }, () => {
        map.removeLayer(endMarker);
        if (polyline) map.removeLayer(polyline);
        endMarker = null;
    });
}

function createIntermediateMarker(map, lat, lng, insertIndex = null) {
    const marker = createMarker(map, lat, lng, intermediateIcon, async () => {
        const { lat, lng } = marker.getLatLng();
        marker.setTooltipContent(`WPT #${shortLatLngHash(lat, lng)}`);
        await visualizeOSRMGeometry(map);
    }, async () => {
        const index = intermediateMarkers.indexOf(marker);
        if (index !== -1) intermediateMarkers.splice(index, 1);
        map.removeLayer(marker);        
        await visualizeOSRMGeometry(map);
    });
    marker.bindTooltip(`WPT #${shortLatLngHash(lat, lng)}`);
    if (insertIndex !== null) {
        intermediateMarkers.splice(insertIndex, 0, marker);
    } else {
        intermediateMarkers.push(marker);
    }
    return marker;
}

// ===========================
// Geometry tools
// ===========================
function pointToSegmentDistance(p, a, b) {
    const toRad = deg => deg * Math.PI / 180;
    const latlngToXY = ([lat, lng]) => [toRad(lng), toRad(lat)];
    const [x, y] = latlngToXY(p);
    const [x1, y1] = latlngToXY(a);
    const [x2, y2] = latlngToXY(b);

    const dx = x2 - x1, dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);

    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    const tClamped = Math.max(0, Math.min(1, t));
    const projX = x1 + tClamped * dx, projY = y1 + tClamped * dy;

    return Math.hypot(x - projX, y - projY);
}

// ===========================
// Visualization + Path
// ===========================
let startMarker = null, endMarker = null, intermediateMarkers = [], polyline, loop = false;

async function visualizeOSRMGeometry(map) {
    if (!startMarker || !endMarker) return;

    const coordsStr = [
        [startMarker._latlng.lng, startMarker._latlng.lat],
        ...intermediateMarkers.map(m => [m._latlng.lng, m._latlng.lat]),
        [endMarker._latlng.lng, endMarker._latlng.lat],
        ...(loop ? [[startMarker._latlng.lng, startMarker._latlng.lat]] : [])
    ].map(([lng, lat]) => `${lng},${lat}`).join(';');

    const res = await fetch(`http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`);
    const json = await res.json();
    if (!json.routes) return;

    const geometry = json.routes[0].geometry;
    const fullPathCoords = geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    if (polyline) map.removeLayer(polyline);
    polyline = L.polyline(fullPathCoords, { color: 'skyblue' }).addTo(map);
    polyline.arrowheads({
        frequency: '250px',
        size: '25px',
        color: 'skyblue',
        offsets: { start: '65px' }
    });

    polyline.on('click', e => {
        const clicked = [e.latlng.lat, e.latlng.lng];
        let insertIndex = intermediateMarkers.length, minDist = Infinity;

        for (let i = 0; i < fullPathCoords.length - 1; i++) {
            const dist = pointToSegmentDistance(clicked, fullPathCoords[i], fullPathCoords[i + 1]);
            if (dist < minDist) {
                minDist = dist;
                insertIndex = i;
            }
        }

        createIntermediateMarker(map, clicked[0], clicked[1], insertIndex);
        visualizeOSRMGeometry(map);
    });

    updateList(map);
}

function shortLatLngHash(lat, lng) {
    const str = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // convert to 32bit int
    }
    // Convert to base36 and slice
    return Math.abs(hash).toString(36).slice(0, 6).toUpperCase();
}

//Calculate the final path
async function calculatePathForSaving() {
    const coordsStr = [
        [startMarker._latlng.lng, startMarker._latlng.lat],
        ...intermediateMarkers.map(m => [m._latlng.lng, m._latlng.lat]),
        [endMarker._latlng.lng, endMarker._latlng.lat],
        [startMarker._latlng.lng, startMarker._latlng.lat]
    ].map(([lng, lat]) => `${lng},${lat}`).join(';');

    const res = await fetch(`http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`);
    const json = await res.json();
    if (!json.routes) return [];

    return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

//Change the table display once data is added
function updateList(map) {
    const tbody = $('#wpt-table tbody').empty();
    let count = 0;

    if (startMarker) tbody.append(`<tr><td>START</td><td>${startMarker._latlng.lat}</td><td>${startMarker._latlng.lng}</td><td></td></tr>`);
    intermediateMarkers.forEach((marker, index) => {
        const hash = shortLatLngHash(marker._latlng.lat, marker._latlng.lng);
        const row = $(`
            <tr>
                <td>WPT #${hash}</td>
                <td>${marker._latlng.lat.toFixed(6)}</td>
                <td>${marker._latlng.lng.toFixed(6)}</td>
                <td>
                    <div class="btn btn-move-up" data-index="${index}">↑</div>
                    <div class="btn btn-move-down" data-index="${index}">↓</div>
                </td>
            </tr>`);
        tbody.append(row);
        if (index === 0) row.find('.btn-move-up').attr('disabled', true);
        if (index === intermediateMarkers.length - 1) row.find('.btn-move-down').attr('disabled', true);
    });
    if (endMarker) tbody.append(`<tr><td>END</td><td>${endMarker._latlng.lat}</td><td>${endMarker._latlng.lng}</td><td></td></tr>`);

    $('#wpt-table .btn-move-up').on('click', function () {
        const idx = parseInt($(this).data('index'));
        if (idx > 0) {
            [intermediateMarkers[idx - 1], intermediateMarkers[idx]] = [intermediateMarkers[idx], intermediateMarkers[idx - 1]];
            visualizeOSRMGeometry(map);
        }
    });

    $('#wpt-table .btn-move-down').on('click', function () {
        const idx = parseInt($(this).data('index'));
        if (idx < intermediateMarkers.length - 1) {
            [intermediateMarkers[idx + 1], intermediateMarkers[idx]] = [intermediateMarkers[idx], intermediateMarkers[idx + 1]];
            visualizeOSRMGeometry(map);
        }
    });
}

// ===========================
// Main Setup
// ===========================
$(document).ready(function () {
    //Create leaflet map
    const map = L.map('map').setView([7.0706, 125.4542], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Toggle looping geometry
    $('#calc-loop').change(async function () {
        loop = this.checked;
        await visualizeOSRMGeometry(map);
    });

    //On map click behaviors
    map.on('click', async e => {
        const { lat, lng } = e.latlng;
        if (!startMarker) startMarker = createStartMarker(map, lat, lng);
        else if (!endMarker) endMarker = createEndMarker(map, lat, lng);
        if (startMarker && endMarker) await visualizeOSRMGeometry(map);
    });

    //On route done editing
    $('#btn-done').click(async e => {
        e.preventDefault();
        const waypoints = [
            [startMarker._latlng.lng, startMarker._latlng.lat],
            ...intermediateMarkers.map(m => [m._latlng.lng, m._latlng.lat]),
            [endMarker._latlng.lng, endMarker._latlng.lat]
        ].map(([lng, lat]) => [lat, lng]);

        $.ajax({
            type: "POST",
            url: "/update-wp",
            contentType: "application/json",
            data: JSON.stringify(waypoints),
            dataType: 'json',
            success: res => {
                if (res.success) alert("You can close this window now!");
            }
        });
    });

    //Get metadata
    $.ajax({
        type: "GET",
        url: "/get-metadata",
        contentType: "application/json",        
        dataType: "json",
        success: function (response) {
            $('#metadata-display').html(`Editing: ${response.routeName} (ID: ${response.routeId})`);
        }
    });
    
    //Get existing waypoint data
    $.ajax({
        type: "GET",
        url: "/edit-data",
        contentType: "application/json",        
        dataType: "json",
        success: function (response) {
            if(response.isEditing) {
                const waypoints = response.waypoints;                
                startMarker = createStartMarker(map, waypoints[0][0], waypoints[0][1]);
                for (let i = 1; i < waypoints.length - 1; i++) {
                    const [lat, lng] = waypoints[i];
                    createIntermediateMarker(map, lat, lng);
                }
                endMarker = createEndMarker(map, waypoints[waypoints.length - 1][0], waypoints[waypoints.length - 1][1]);

                //Visualize immediately
                $('#calc-loop').prop(`checked`, true);
                loop = true;
                visualizeOSRMGeometry(map);  
                
                updateList(map);
            }
        }
    });
});
