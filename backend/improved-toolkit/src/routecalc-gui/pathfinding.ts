import * as gl from 'geolib';

import { RouteGraph } from "@shared/types";
const TinyQueue = require('tinyqueue');

export function astar(
    routeGraph: RouteGraph,
    startCoord: [number, number],
    endCoord: [number, number],
    nodeLookup: Record<string, [number, number]>,
    heuristicFactor: number
) {
    function findNearestNode(coord: [number, number], nodeLookup: Record<string, [number, number]>): string {
        let minDist = Infinity;
        let nearest = "";
        for (const [nodeId, [lat, lng]] of Object.entries(nodeLookup)) {
            const dist = gl.getDistance(
                { latitude: coord[0], longitude: coord[1] },
                { latitude: lat, longitude: lng }
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = nodeId;
            }
        }
        return nearest;
    }

    const startNode = findNearestNode(startCoord, nodeLookup);
    const endNode = findNearestNode(endCoord, nodeLookup);

    const gScore: Record<string, number> = {};
    const prev: Record<string, string | undefined> = {};
    const visited = new Set<string>();

    for (const node in routeGraph) gScore[node] = Infinity;
    gScore[startNode] = 0;

    const heuristic = (nodeId: string, heuristicFactor: number) => {        
        const from = nodeLookup[nodeId];
        const to = nodeLookup[endNode];
        return from && to ? gl.getDistance(
            { latitude: from[0], longitude: from[1] },
            { latitude: to[0], longitude: to[1] }
        ) * heuristicFactor : Infinity;
    };

    const queue = new TinyQueue(
        [{ node: startNode, g: 0, f: heuristic(startNode, heuristicFactor) }],
        (a: any, b: any) => a.f - b.f
    );

    while (queue.length) {
        const current = queue.pop();
        if (!current) continue;

        const { node, g } = current;
        if (visited.has(node)) continue;
        visited.add(node);

        if (node === endNode) break;

        for (const edge of routeGraph[node] || []) {
            const tentativeG = g + edge.cost;
            if (tentativeG < gScore[edge.to]) {
                gScore[edge.to] = tentativeG;
                prev[edge.to] = node;

                const fScore = tentativeG + heuristic(edge.to, heuristicFactor);
                queue.push({ node: edge.to, g: tentativeG, f: fScore });
            }
        }
    }

    const path: string[] = [];
    let u: string | undefined = endNode;

    while (u) {
        path.unshift(u);
        u = prev[u];
        if (u === startNode) {
            path.unshift(startNode);
            break;
        }
    }

    if (path[0] !== startNode) {
        console.warn("[ASTAR] No path found from start to end.");
        return { path: [], prev };
    }
    
    path[0] = 'START';
    path[path.length - 1] = 'END';

    return { path, prev };
}

export async function dijkstra(routeGraph: RouteGraph, startNode: string, endNode: string) {
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
