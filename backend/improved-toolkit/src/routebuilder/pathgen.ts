export async function getPathFromWaypoints(waypoints: [number, number][]) {
    const coordsStr = [
        ...waypoints,
        [waypoints[0][0], waypoints[0][1]]
    ].map(([lat, lng]) => `${lng},${lat}`).join(';');;

    const res = await fetch(`http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`);
    const json = await res.json();

    if(!json.routes) {
        console.error(`[pathgen] OSRM response error:`, res.statusText);
        return null;
    }

    return (json.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]);
}