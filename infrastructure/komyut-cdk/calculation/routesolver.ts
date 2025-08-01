import * as gl from 'geolib';
import AWS from 'aws-sdk';

import { RoutePack, RouteGraph } from "@shared/types";
import { CONSTS } from "@shared/consts";
import { astar, dijkstra } from "./pathfinding";
import { haversine } from './haversine';

let cachedPrivateIp: string | null = null;
async function getEc2OSRMPrivateIp(): Promise<String> {
    if (cachedPrivateIp) return cachedPrivateIp;

    const ssm = new AWS.SSM();
    const param = await ssm.getParameter({ Name: '/komyut/ec2/public-ip' }).promise();
    cachedPrivateIp = param.Parameter?.Value!;
    return cachedPrivateIp;
}

export async function findBestPath(startCoord: [number, number], endCoord: [number, number], routePack: RoutePack) {
    const timing: Record<string, number> = {};
    const now = () => performance.now();

    const startNode = 'START';
    const endNode = 'END';
    const clonedGraph = structuredClone(routePack.routeGraph);
    const WALK_TO_SAMPLE_LIMIT = 5;

    // Step 1: Find nearest nodes to start
    let t0 = now();
    const startLinks = findClosestRouteNodes(startCoord, routePack, WALK_TO_SAMPLE_LIMIT);
    clonedGraph[startNode] = [];
    timing['findClosestStartNodes'] = now() - t0;

    // Step 2: Add start walking links (calls OSRM API)
    const WALK_PENALTY = 200;
    t0 = now();
    for (const link of startLinks) {
        const dist = await getOSRMWalkingDistance(startCoord, link.coord);
        clonedGraph[startNode].push({
            to: link.nodeId,
            cost: dist + WALK_PENALTY,            
        });
    }
    timing['getStartWalks'] = now() - t0;

    // Step 3: Add end walking links
    t0 = now();
    if (!clonedGraph[endNode]) clonedGraph[endNode] = [];
    for (const link of findClosestRouteNodes(endCoord, routePack, WALK_TO_SAMPLE_LIMIT)) {
        const dist = await getOSRMWalkingDistance(link.coord, endCoord);
        if (!clonedGraph[link.nodeId]) clonedGraph[link.nodeId] = [];
        clonedGraph[link.nodeId].push({
            to: endNode,
            cost: dist + WALK_PENALTY,            
        });
    }
    timing['getEndWalks'] = now() - t0;

    // Step 4: Build node lookup
    t0 = now();
    const nodeLookup = buildNodeLookup(routePack);
    timing['buildNodeLookup'] = now() - t0;

    // Step 5: A* pathfinding
    t0 = now();
    const { path, prev } = astar(clonedGraph, startCoord, endCoord, nodeLookup, 0.5);
    // const { path, prev } = await dijkstra(clonedGraph, startNode, endNode);
    timing['astar'] = now() - t0;

    // Step 6: Convert path to coordinates
    t0 = now();
    const coordinates = path.map(nodeId => {
        if (nodeId === startNode) return startCoord;
        if (nodeId === endNode) return endCoord;

        const [routeId, index] = nodeId.split('-');
        const route = routePack.routes.find(r => r.routeId === routeId);
        return route?.truncatedPath[parseInt(index)];
    });
    timing['pathToCoordinates'] = now() - t0;

    // Final timing summary
    console.table(timing);

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

async function getOSRMWalkingDistance(from: [number, number], to: [number, number]) {
    try {
        if(process.env.ROUTECALC_USE_OSRM === "false") {
            return haversine(from, to);
        } else {
            const coordStr = [
                [from[0], from[1]],
                [to[0], to[1]]
            ].map(([lat, lng]) => `${lng},${lat}`).join(';');
            const url = `http://${await getEc2OSRMPrivateIp()}:5000/route/v1/bike/${coordStr}?overview=false`;

            const res = await fetch(url);
            const json: any = await res.json();

            return json.routes[0].distance;
        }        
    } catch (err: any) {
        console.error('Fetch failed:', err.message);
        console.error('Error cause:', err.cause); // More specific: DNS error, ECONNREFUSED, etc.
        console.error(err); // Full error object
    }
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
        route.truncatedPath.forEach((coord, index) => {
            const nodeId = `${route.routeId}-${index}`;
            lookup[nodeId] = coord;
        });
    }

    return lookup;
}

async function getOSRMWalkingPath(from: [number, number], to: [number, number]): Promise<[number, number][]> {
    try {
        if(process.env.ROUTECALC_USE_OSRM === "false") {
            return [from, to];
        } else {

            const url = `http://${await getEc2OSRMPrivateIp()}:5000/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data: any = await res.json();

            if (data?.routes?.[0]?.geometry?.coordinates) {
                return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
            }
        }      
    } catch(err: any) {
        console.error('Fetch failed:', err.message);
        console.error('Error cause:', err.cause); // More specific: DNS error, ECONNREFUSED, etc.
        console.error(err); // Full error object
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
    const result: { type: string, routeId: string | null, routeName: string | null, coordinates: [number, number][] }[] = [];

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
                    routeName: route.routeFile.routeName,
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
                    routeName: null,
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