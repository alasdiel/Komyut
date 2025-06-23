function fareFunction(_dist) {
    const baseFare = 12;
    const baseDistance = 4;
    const additionalRate = 1.8;

    if(_dist < baseDistance) {
        return baseFare;
    }

    return Math.round((baseFare + (additionalRate * (_dist - baseDistance))) * 100) / 100;
}

function calculateFareFromMerged(_merged, _routes) {
    const legFare = {};
    let totalFare = 0;

    function getCoord(_nodeId) {
        if (_nodeId === 'START' || _nodeId === 'END') return null;
        const [routeId, idxStr] = _nodeId.split('-');
        const idx = parseInt(idxStr);
        const route = _routes.find(r => r.routeFile.routeName === routeId);
        if (!route || !route.fullPath || !route.mapping) return null;
        return route.fullPath[route.mapping[idx]];
    }

    for (const leg of _merged) {
        if (leg.type !== 'jeepney') continue;

        let totalKm = 0;

        for (let i = 0; i < leg.nodes.length - 1; i++) {
            const from = getCoord(leg.nodes[i]);
            const to = getCoord(leg.nodes[i + 1]);

            if (!from || !to) continue;

            const dist = geolib.getDistance(
                { latitude: from[0], longitude: from[1] },
                { latitude: to[0], longitude: to[1] }
            );

            totalKm += dist / 1000;
        }

        const routeId = leg.routeId;
        if(!legFare[routeId]) {
            legFare[routeId] = {distance: 0};
        }

        legFare[routeId].distance += totalKm;
    }

    for(const [routeId, data] of Object.entries(legFare)) {
        data.fare = fareFunction(data.distance);
        totalFare += data.fare;
    }

    return {
        totalFare: totalFare,
        legs: legFare
    };
}