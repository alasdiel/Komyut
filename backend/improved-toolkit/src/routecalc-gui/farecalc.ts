import { RoutePack } from "@shared/types";
import * as gl from 'geolib';

function getCoord(nodeId: string, routePack: RoutePack): [number, number] | null {
    if (nodeId === 'START' || nodeId === 'END') return null;
    const [routeId, idxStr] = nodeId.split('-');
    const idx = parseInt(idxStr);
    const route = routePack.routes.find(r => r.routeId === routeId);
    if (!route || !route.routeFile.path || !route.mappings) return null;
    return route.routeFile.path[route.mappings[idx]];
}

export function calculateFare(mergedLegs: { type: string; nodes: string[]; routeId: string | null; }[], routePack: RoutePack) {
    const legFare: { [routeId: string]: { distance: number, fare: number } } = {};
    let totalFare = 0;

    for(const leg of mergedLegs) {
        if(leg.type !== 'jeepney') continue;

        let totalKm = 0;

        for(let i = 0; i < leg.nodes.length - 1; i++) {
            const from = getCoord(leg.nodes[i], routePack);
            const to = getCoord(leg.nodes[i+1], routePack);

            if(!from || !to) continue;

            const dist = gl.getDistance(
                { latitude: from[0], longitude: from[1] },
                { latitude: to[0], longitude: to[1] },
            );

            totalKm += dist / 1000;
        }

        const routeId = leg.routeId!;
        if (!legFare[routeId]) {
            legFare[routeId] = { distance: 0, fare: 0 };
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

function fareFunction(dist: number) {
    const baseFare = 12;
    const baseDistanceKm = 4;
    const additionalRate = 1.8;

    if(dist < baseDistanceKm) {
        return baseFare;
    }

    return Math.round((baseFare + (additionalRate * (dist - baseDistanceKm))) * 100) / 100;
}