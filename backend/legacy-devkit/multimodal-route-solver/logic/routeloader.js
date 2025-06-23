/**
 * 
 * @param {*} routeFile Routefile to process
 * @returns Processed OSRM path
 */
async function calculateOSRMPath(_routeFile) {
    let waypoints = _routeFile.coordinates;

    //Create OSRM calculation request
    const coordsStr = [...waypoints, waypoints[0]]
        .map(([lat, long]) => [long, lat].join(',')).join(';');
    const url = `http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;

    //Push FETCH to OSRM
    const resp = await fetch(url);
    const json = await resp.json();

    //Handle no OSRM return
    if(!json.routes) {
        alert(`No Path can be calculated from ${_routeFile.routeName}`);
        return null;
    }

    //Swap longitude and lattitude
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
    truncatedCoords.push(_fullPath[0]); //Add the first waypoint to the truncation
    for (let i = 0; i < _fullPath.length - 1; i++) {
        const wpt = _fullPath[i];
        const nxWpt = _fullPath[i+1];
        
        //Accumulate distance over waypoints
        dist += haversine(wpt[0], wpt[1], nxWpt[0], nxWpt[1]);
        if(dist > _interval) {
            dist = 0;
            truncatedCoords.push(nxWpt); //Add waypoint once separation is exceeded
        }
    }

    return truncatedCoords;
}

/**
 * Generates a map of truncated waypoints => full waypoint equivalent
 * @param {*} _route Route file to select truncated and fullPaths from
 * @returns mapping
 */
function calculateTruncatedFullMapping(_tPath, _fPath, _separation) {
    function findClosestIndex(fullPath, target, minIndex = 0) {
        let minDist = Infinity;
        let bestIdx = -1;

        for (let i = minIndex; i < fullPath.length; i++) {
            const d = geolib.getDistance(
                { latitude: fullPath[i][0], longitude: fullPath[i][1] },
                { latitude: target[0], longitude: target[1] }
            );
            if (d < minDist) {
                minDist = d;
                bestIdx = i;
            }
            if (d < 1) break; // short-circuit if very close
        }

        return bestIdx;
    }

    let last = 0;
    return _tPath.map(t => {
        const idx = findClosestIndex(_fPath, t, last);
        last = idx;
        return idx;
    });
}