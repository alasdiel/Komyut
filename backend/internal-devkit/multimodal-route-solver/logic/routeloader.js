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
    // const mapping = [];

    // for (let i = 0; i < _tPath.length; i++) {
    //     const tCoord = _tPath[i];
    //     let minDist = Infinity;
    //     let closestIdx = -1;

    //     for (let j = 0; j < _fPath.length; j++) {
    //         const fCoord = _fPath[j];
            
    //         const dist = geolib.getDistance(
    //             { longitude: tCoord[0], latitude: tCoord[1] },
    //             { longitude: fCoord[0], latitude: fCoord[1] },
    //         );

    //         if(dist < minDist) {
    //             minDist = dist;
    //             closestIdx = j;
    //         }
    //     }

    //     mapping.push(closestIdx);
    // }
    return _tPath.map(t => {
        return _fPath.findIndex(f => f[0] === t[0] && f[1] === t[1]);
    });
}