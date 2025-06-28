import path from "path";
import * as fs from "fs";

import { RouteFile, IndexedPoint, TransferPoint, RouteGraph, CompileParameters } from "../shared/types";
import RBush from 'rbush';

import { haversine } from "./helpers";
import * as gl from 'geolib';
import * as msgp from '@msgpack/msgpack';

export function readAllRouteFiles(inputDirectory: string) : RouteFile[] {
    try {
        const loaded: RouteFile[] = [];

        const files = fs.readdirSync(inputDirectory).filter(file =>
            file.endsWith('.route') && fs.statSync(path.join(inputDirectory, file)).isFile()
        );

        files.forEach(file => {
            const fullPath = path.join(inputDirectory, file);
            
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const json = JSON.parse(fileContents) as RouteFile;

            loaded.push(json);
        });

        return loaded;
    } catch (err) {
        console.error('Error:', err);
        return[];
    }
}

export function writeAllRouteFiles(outputDirectory: string, routefiles: RouteFile[]) {
    try {
        const targetDir = path.join(outputDirectory, 'original');
        if(!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

        routefiles.forEach(f => {
            const filePath = path.join(targetDir, `${f.routeId}.route`);
            fs.writeFileSync(filePath, JSON.stringify(f, null, '\t'));
        })
    } catch(err) {
        console.error('Error:', err);
        return [];
    }
}

export function calculateTruncatedPath(fullPath: [number, number][], truncationInterval: number) {
    let dist = 0;
    let truncatedCoords: [number, number][] = [];
    truncatedCoords.push(fullPath[0]); //Add the first waypoint to the truncation
    for (let i = 0; i < fullPath.length - 1; i++) {
        const wpt = fullPath[i];
        const nxWpt = fullPath[i+1];
        
        //Accumulate distance over waypoints
        dist += haversine(wpt[0], wpt[1], nxWpt[0], nxWpt[1]);
        if(dist > truncationInterval) {
            dist = 0;
            truncatedCoords.push(nxWpt); //Add waypoint once separation is exceeded
        }
    }

    return truncatedCoords;
}

export function generateTruncatedFullMapping(truncatedPath: [number, number][], fullPath: [number, number][], mappingRadius: number) {
    function findClosestIndex(fullPath: [number, number][], target: [number, number], minIdx: number) {
        let minDist = Infinity;
        let bestIdx = -1;

        for (let i = minIdx; i < fullPath.length; i++) {
            const d = gl.getDistance(
                { latitude: fullPath[i][0], longitude: fullPath[i][1] },
                { latitude: target[0], longitude: target[1] }
            );
            if(d < minDist) {
                minDist = d;
                bestIdx = i;
            }
            if(d < mappingRadius) break;
        }

        return bestIdx;
    }

    let last = 0;
    return truncatedPath.map(t => {
        const idx = findClosestIndex(fullPath, t, last);
        last = idx;
        return idx;
    })
}

export function generateTransferPoints(truncatedPaths: { routeId: string, truncatedPath: [number, number][]}[], TRANSFER_RADIUS: number, SPATIAL_TOLERANCE: number, verbose: boolean = false) : TransferPoint[] {
    const spatialIndex = new RBush<IndexedPoint>();
    
    const indexedPoints: IndexedPoint[] = [];

    truncatedPaths.forEach(tp => {
        tp.truncatedPath.forEach((pt, i) => {
            indexedPoints.push({
                minX: pt[1], maxX: pt[1],
                minY: pt[0], maxY: pt[0],
                routeId: tp.routeId,
                coord: pt,
                index: i
            });
        });
    });

    spatialIndex.load(indexedPoints);

    const transfers: TransferPoint[] = [];

    indexedPoints.forEach(pt => {
        const nearby = spatialIndex.search({
            minX: pt.minX - SPATIAL_TOLERANCE,
            maxX: pt.maxX + SPATIAL_TOLERANCE,
            minY: pt.minY - SPATIAL_TOLERANCE,
            maxY: pt.maxY + SPATIAL_TOLERANCE,
        });

        const seen = new Set();
        const pairKey = (a: IndexedPoint, b: IndexedPoint) => {
            const idA = `${a.routeId}-${a.index}`;
            const idB = `${b.routeId}-${b.index}`;
            return [idA, idB];
        };

        nearby.forEach(other => {
            if(!seen.has(pairKey(pt, other))) {
                seen.add(pairKey(pt, other));

                if(verbose) console.log(`Unseen nearby points ${pt.routeId}-${pt.index} and ${other.routeId}-${other.index}`);

                if(other.routeId !== pt.routeId) {
                    const dist = gl.getDistance(
                        { longitude: pt.coord[0], latitude: pt.coord[1] },
                        { longitude: other.coord[0], latitude: other.coord[1] },
                    );
                    
                    if(dist <= TRANSFER_RADIUS) {
                        transfers.push({
                            from: {
                                routeId: pt.routeId,
                                coord: pt.coord,
                                index: pt.index,
                                nodeId: `${pt.routeId}-${pt.index}`
                            },
                            to: {
                                routeId: other.routeId,
                                coord: other.coord,
                                index: other.index,
                                nodeId: `${other.routeId}-${other.index}`
                            },
                            distance: dist
                        });
                    }
                }
            }
        });
    });

    return transfers;
}

export function generateRouteGraph(truncatedPaths: { routeId: string, truncatedPath: [number, number][]}[], transferPoints: TransferPoint[], CONTINUE_REWARD: number, TRANSFER_PENALTY: number) : RouteGraph {
    function findClosestNodeIndex(truncatedPath: [number, number][], coord: [number, number]) {
        let closest = 0; let minDist = Infinity;
        truncatedPath.forEach((pt, i) => {
            const d = gl.getDistance(
                { latitude: pt[0], longitude: pt[1] },
                { latitude: coord[0], longitude: coord[1] },
            );
            if(d < minDist) {
                minDist = d;
                closest = i;
            }
        });
        return closest;
    }

    const graph: RouteGraph = {};
    
    truncatedPaths.forEach(r => {
        const coords = r.truncatedPath;
        for (let i = 0; i < coords.length - 1; i++) {
            const fromId = `${r.routeId}-${i}`;
            const toId = `${r.routeId}-${i+1}`;
            const segmentCost = gl.getDistance(
                { latitude: coords[i][0], longitude: coords[i][1] },
                { latitude: coords[i+1][0], longitude: coords[i+1][1] },
            );

            const cost = segmentCost + CONTINUE_REWARD;

            if(!graph[fromId]) graph[fromId] = [];
            graph[fromId].push({to: toId, cost: cost});
        }
    });

    transferPoints.forEach(t => {
        const fromRoute = truncatedPaths.find(r => r.routeId === t.from.routeId);
        const toRoute = truncatedPaths.find(r => r.routeId === t.to.routeId);
        if(!fromRoute || !toRoute) {
            throw new Error(`Route ID:${t.from.routeId} has no fromRoute or no toRoute`);
        }

        const fromIdx = findClosestNodeIndex(fromRoute.truncatedPath, t.from.coord);
        const toIdx = findClosestNodeIndex(toRoute.truncatedPath, t.from.coord);

        const fromId = `${t.from.routeId}-${fromIdx}`;
        const toId = `${t.to.routeId}-${toIdx}`;

        if(!graph[fromId]) graph[fromId] = [];
        if(!graph[toId]) graph[toId] = [];

        const transferCost = t.distance + TRANSFER_PENALTY;

        graph[fromId].push({ to: toId, cost: transferCost });
        graph[toId].push({ to: fromId, cost: transferCost});
    });

    return graph;
}

export function writeTruncatedPathsToFiles(outputDirectory: string, truncatedPaths: { routeId: string, truncatedPath: [number, number][]}[]) {
    try {
        const targetDir = path.join(outputDirectory, 'truncated');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

        truncatedPaths.forEach(t => {
            const filePath = path.join(targetDir, `${t.routeId}.truncated`);
            fs.writeFileSync(filePath, msgp.encode(t));
        })
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

export function writePathMappingsToFiles(outputDirectory: string, mappings: { routeId: string, mapping: number[] }[]) {
    try {
        const targetDir = path.join(outputDirectory, 'mappings');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

        mappings.forEach(m => {
            const filePath = path.join(targetDir, `${m.routeId}.mapping`);
            fs.writeFileSync(filePath, msgp.encode(m));
        })
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

export function writeTransferPointsToFile(outputDirectory: string, transferPoints: TransferPoint[]) {
    try {
        const filePath = path.join(outputDirectory, `transferPoints.cache`);
        fs.writeFileSync(filePath, msgp.encode(transferPoints));
    } catch(err) {
        console.error(`Error:`, err);        
    }
}

export function writeRouteGraphToFile(outputDirectory: string, routeGraph: RouteGraph) {
    try {
        const filePath = path.join(outputDirectory, `routeGraph.cache`);        
        fs.writeFileSync(filePath, msgp.encode(routeGraph));
    } catch(err) {
        console.error(`Error:`, err);
    }
}

export function writeManifestFile(outputDirectory: string, routeFiles: RouteFile[], compileParameters: CompileParameters) {
    function generateBuildId(): string {
        return Date.now().toString(36).toUpperCase();
    }

    let manifestFile: { includedRoutes: string[], buildID: string, dateBuilt: string, compileParameters: CompileParameters } = {
        includedRoutes: [],
        buildID: generateBuildId(),
        dateBuilt: new Date().toISOString(),
        compileParameters: compileParameters
    };

    routeFiles.forEach(r => {
        manifestFile.includedRoutes.push(r.routeId);
    });

    const filePath = path.join(outputDirectory, 'routepack.json');
    fs.writeFileSync(filePath, JSON.stringify(manifestFile, null, '\t'));
}