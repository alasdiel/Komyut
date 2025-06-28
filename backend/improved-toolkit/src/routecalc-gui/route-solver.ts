import * as gl from 'geolib';

const TinyQueue = require('tinyqueue');
import { RoutePack, RouteGraph } from "../shared/types";

export async function findBestPath(startCoord: [number, number], endCoord: [number, number], routePack: RoutePack) {
    const startNode = 'START';
    const endNode = 'END';
    const clonedGraph = structuredClone(routePack.routeGraph);
    const WALK_TO_SAMPLE_LIMIT = 5;

    const startLinks = findClosestRouteNodes(startCoord, routePack, WALK_TO_SAMPLE_LIMIT);
    clonedGraph[startNode] = [];

    const WALK_PENALTY = 200;
    for (const link of startLinks) {
        const { dist, geometry } = await getWalkingGeometry(startCoord, link.coord);
        clonedGraph[startNode].push({
            to: link.nodeId,
            cost: dist + WALK_PENALTY,
            geometry: geometry
        });
    }

    if (!clonedGraph[endNode]) clonedGraph[endNode] = [];
    for (const link of findClosestRouteNodes(endCoord, routePack, WALK_TO_SAMPLE_LIMIT)) {
        const { dist, geometry } = await getWalkingGeometry(link.coord, endCoord);
        if (!clonedGraph[link.nodeId]) clonedGraph[link.nodeId] = [];
        clonedGraph[link.nodeId].push({
            to: endNode,
            cost: dist + WALK_PENALTY,
            geometry: geometry
        });
    }

    const { path, prev } = await dijkstra(clonedGraph, startNode, endNode);

    const coordinates = path.map(nodeId => {
        if (nodeId === startNode) return startCoord;
        if (nodeId === endNode) return endCoord;

        const [routeId, index] = nodeId.split('-');
        const route = routePack.routes.find(r => r.routeId === routeId);

        return route?.truncatedPath[parseInt(index)];
    });
    
    return { coordinates, path };
}

function findClosestRouteNodes(coord: [number, number], routePack: RoutePack, limit: number = 5) {
    const all = [];

    for (const r of routePack.routes) {
        for (let i = 0; i < r.truncatedPath.length; i++) {
            const pt = r.truncatedPath[i];
            const distance = gl.getDistance(
                { latitude: coord[0], longitude: coord[1] },
                { latitude: pt[0], longitude: pt[1] }
            );

            all.push({
                routeId: r.routeId,
                index: i,
                coord: pt,
                distance,
                nodeId: `${r.routeId}-${i}`
            });
        }
    }

    return all.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

async function getWalkingGeometry(from: [number, number], to: [number, number]) {
    const coordStr = [
        [from[0], from[1]],
        [to[0], to[1]]
    ].map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `http://localhost:5000/route/v1/bike/${coordStr}?overview=false`;

    const res = await fetch(url);
    const json = await res.json();

    return {
        dist: json.routes[0].distance,
        geometry: json.routes[0].geometry
    };
}

async function dijkstra(routeGraph: RouteGraph, startNode: string, endNode: string) {
    const dist: { [id: string]: number } = {};
    const prev: { [id: string]: string } = {};
    const visited = new Set();
    
    const queue = new TinyQueue([{ node: startNode, cost: 0 }], (a: any, b: any) => a.cost - b.cost);

    for (const node in routeGraph) dist[node] = Infinity;
    dist[startNode] = 0;

    while (queue.length) {
        const popped = queue.pop();
        if (!popped) continue;

        const { node, cost } = popped;

        if (visited.has(node)) continue;
        visited.add(node);

        for (const edge of routeGraph[node] || []) {
            const alt = dist[node] + edge.cost;

            if (alt < dist[edge.to]) {
                dist[edge.to] = alt;
                prev[edge.to] = node;
                queue.push({
                    node: edge.to,
                    cost: alt
                });
            }
        }
    }

    const path = [];
    let u = endNode;
    while (u) {
        path.unshift(u);
        u = prev[u];
    }

    return { path, prev };
}

export function mergePathLegs(path: string[]) {
    const legs = [];

    let currentLeg = null;

    for(let i = 0; i < path.length - 1; i++) {
        const fr = path[i];
        const to = path[i+1];
        const type = getLegType(fr, to);

        if(!currentLeg || currentLeg.type !== type || (type === 'jeepney' && currentLeg.routeId !== fr.split('-')[0])) {
            if(currentLeg) legs.push(currentLeg);            
            currentLeg = {
                type,
                nodes: [fr],
                routeId: type === 'jeepney' ? fr.split('-')[0] : null
            };
        }

        currentLeg.nodes.push(to);
    }

    if(currentLeg) legs.push(currentLeg);
    return legs;
}

function getLegType(fr: string, to: string) {
    if (fr === 'START' || to === 'END') return 'walk';
    const [frRoute] = fr.split('-');
    const [toRoute] = to.split('-');

    return frRoute === toRoute ? 'jeepney' : 'walk';
}

export function buildNodeLookup(routePack: RoutePack): Record<string, [number, number]> {
    const lookup: Record<string, [number, number]> = {};

    for (const route of routePack.routes) {
        const routeId = route.routeId;
        const coords = route.truncatedPath;

        coords.forEach((coord, index) => {
            const nodeId = `${routeId}-${index}`;
            lookup[nodeId] = coord;
        });
    }

    return lookup;
}

async function getOSRMWalkingPath(from: [number, number], to: [number, number]): Promise<[number, number][]> {
    const url = `http://localhost:5000/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
    }

    return [from, to]; // fallback to straight line
}

export async function transformLegsForFrontend(
    mergedLegs: {
        type: string;
        nodes: string[];
        routeId: string | null;
    }[],
    routePack: RoutePack,
    startCoord: [number, number],
    endCoord: [number, number]
) {
    const result: { type: string, routeId: string | null, coordinates: [number, number][] }[] = [];

    for (const leg of mergedLegs) {
        if (leg.type === 'jeepney' && leg.routeId) {
            const route = routePack.routes.find(r => r.routeId === leg.routeId);
            if (!route) continue;

            const fromId = leg.nodes[0];
            const toId = leg.nodes[leg.nodes.length - 1];

            const fromIdx = route.truncatedPath.findIndex((_, i) => `${leg.routeId}-${i}` === fromId);
            const toIdx = route.truncatedPath.findIndex((_, i) => `${leg.routeId}-${i}` === toId);

            if (fromIdx !== -1 && toIdx !== -1) {
                const fullFrom = route.mappings[fromIdx];
                const fullTo = route.mappings[toIdx];
                const coords = route.routeFile.path.slice(fullFrom, fullTo + 1);

                result.push({
                    type: 'jeepney',
                    routeId: leg.routeId,
                    coordinates: coords
                });
            }
        } else if (leg.type === 'walk') {
            let from: [number, number] | null = null;
            let to: [number, number] | null = null;

            const first = leg.nodes[0];
            const last = leg.nodes[leg.nodes.length - 1];

            if (first === 'START') {
                from = startCoord;
            } else {
                const [routeId, node] = first.split('-');
                const route = routePack.routes.find(r => r.routeId === routeId);
                if (route) {
                    const truncatedIdx = parseInt(node);
                    const fullIdx = route.mappings[truncatedIdx];
                    from = route.routeFile.path[fullIdx];
                }
            }

            if (last === 'END') {
                to = endCoord;
            } else {
                const [routeId, node] = last.split('-');
                const route = routePack.routes.find(r => r.routeId === routeId);
                if (route) {
                    const truncatedIdx = parseInt(node);
                    const fullIdx = route.mappings[truncatedIdx];
                    to = route.routeFile.path[fullIdx];
                }
            }

            if (from && to) {
                const walkCoords = await getOSRMWalkingPath(from, to);
                result.push({
                    type: 'walk',
                    routeId: null,
                    coordinates: walkCoords
                });
            }
        }
    }

    return result;
}

export function transformLegsFromTruncatedPathsOnly(
    mergedLegs: {
        type: string;
        nodes: string[];
        routeId: string | null;
    }[],
    routePack: RoutePack,
    startCoord: [number, number],
    endCoord: [number, number]
) {
    const legs = [];

    for (let i = 0; i < mergedLegs.length; i++) {
        const leg = mergedLegs[i];

        if (leg.type === 'walk') {
            let coords = leg.nodes.map(nodeId => {
                const [routeId, idxStr] = nodeId.split('-');
                const index = parseInt(idxStr);
                const route = routePack.routes.find(r => r.routeId === routeId);
                return route?.truncatedPath[index] ?? null;
            }).filter((c): c is [number, number] => !!c);

            // Inject actual start or end coords if needed
            if (i === 0 && coords.length === 1) {
                coords.unshift(startCoord);
            }
            if (i === mergedLegs.length - 1 && coords.length === 1) {
                coords.push(endCoord);
            }

            legs.push({ type: 'walk', routeId: null, coordinates: coords });
            continue;
        }

        // Jeepney leg
        const route = routePack.routes.find(r => r.routeId === leg.routeId);
        if (!route || !leg.nodes.length) {
            legs.push({ type: leg.type, routeId: leg.routeId, coordinates: [] });
            continue;
        }

        const coords = leg.nodes.map(nodeId => {
            const [_, idxStr] = nodeId.split('-');
            const index = parseInt(idxStr);
            return route.truncatedPath[index] ?? null;
        }).filter((c): c is [number, number] => !!c);

        legs.push({
            type: 'jeepney',
            routeId: leg.routeId,
            coordinates: coords,
        });
    }

    return legs;
}