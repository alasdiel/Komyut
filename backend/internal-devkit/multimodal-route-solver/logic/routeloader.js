/**
 * 
 * @param {*} routeFile Routefile to process
 * @returns Processed OSRM path
 */
async function calculateOSRMPath(_routeFile) {
    let waypoints = _routeFile.coordinates;

    const coordsStr = [...waypoints, waypoints[0]]
        .map(([lat, long]) => [long, lat].join(',')).join(';');
    const url = `http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;

    const resp = await fetch(url);
    const json = await resp.json();

    if(!json.routes) {
        alert(`No Path can be calculated from ${_routeFile.routeName}`);
        return null;
    }

    const path = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

    return path;
}

/**
 * 
 * @param {*} _fullPath Full OSRM path
 * @param {Number} _interval Minimum coordinate separation in meters
 * @returns Truncated path
 */
function calculateTruncatedPath(_fullPath, _interval) {
    let dist = 0;
    let truncatedCoords = [];
    truncatedCoords.push(_fullPath[0]);
    for (let i = 0; i < _fullPath.length - 1; i++) {
        const wpt = _fullPath[i];
        const nxWpt = _fullPath[i+1];
        
        dist += haversine(wpt[0], wpt[1], nxWpt[0], nxWpt[1]);
        if(dist > _interval) {
            dist = 0;
            truncatedCoords.push(nxWpt);
        }
    }

    return truncatedCoords;
}