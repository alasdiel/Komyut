import * as fs from 'fs';
import path from "path";
import { RoutePack, RouteGraph, TransferPoint, RouteFile } from "../shared/types";

import * as msgp from '@msgpack/msgpack';

export function loadRoutePack(inputDirectory: string): RoutePack | null {
    if (!fs.existsSync(inputDirectory)) {
        console.error(`[ROUTE LOADER ERR]: selected file doesn't exist`);
        return null;
    } else if (path.basename(inputDirectory) !== 'routepack.json') {
        console.error(`[ROUTE LOADER ERR]: selected file isn't routepack manifest`);
        return null;
    }

    const manifestData = loadManifest(inputDirectory);    
    const transferPoints = loadCacheFile<TransferPoint[]>(inputDirectory, 'transferPoints.cache');
    const routeGraph = loadCacheFile<RouteGraph>(inputDirectory, 'routeGraph.cache');
    const nodeLookup = loadCacheFile<Record<string, [number, number]>>(inputDirectory, 'nodeLookup.cache');
    if (routeGraph && transferPoints && manifestData && nodeLookup) {
        const routes: {
            routeId: string,
            routeFile: RouteFile,
            mappings: number[],
            truncatedPath: [number, number][]
        }[] = [];

        manifestData.expectedRoutes.forEach(rId => {
            const { original, truncatedPath, mapping } = loadRouteData(inputDirectory, rId);

            if (original && truncatedPath && mapping) {
                routes.push({ routeId: rId, routeFile: original, mappings: mapping, truncatedPath: truncatedPath });
            } else {
                console.error(`Error loading some of the routes!`);
                return null;
            }
        });

        return {
            transferPoints: transferPoints,
            routeGraph: routeGraph,
            routes: routes,
            nodeLookup: nodeLookup
        };
    } else {
        console.error(`There was an error trying to load the RoutePack!`);
        return null;
    }
}

function loadCacheFile<T>(filePath: string, fileName: string): T | null {
    try {
        const fullPath = path.join(path.dirname(filePath), fileName);
        const buffer = fs.readFileSync(fullPath);
        return msgp.decode(buffer) as T;
    } catch(err) {
        console.error(`Error reading ${fileName} file:`, err);
        return null;
    }
}

interface ManifestData {
    expectedRoutes: string[]
}
function loadManifest(manifestPath: string): ManifestData | null {
    try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        const jsonObject = JSON.parse(content);
        return {
            expectedRoutes: jsonObject.includedRoutes
        };
    } catch (err) {
        console.error(`Error reading routepack.json manifest:`, err);
        return null;
    }
}

function loadRouteData(inputDirectory: string, routeId: string) {
    function loadOriginalRoute(filePath: string): RouteFile | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const jsonObject = JSON.parse(content);

            return jsonObject as RouteFile;
        } catch (err) {
            console.error(`Failed to load original routedata from ${filePath}`, err);
            return null;
        }
    }

    function loadTruncatedPath(filePath: string): [number, number][] | null {
        try {
            const buffer = fs.readFileSync(filePath);

            const tPathData = msgp.decode(buffer) as { routeId: string, truncatedPath: [number, number][] };
            return tPathData.truncatedPath;
        } catch (err) {
            console.error(`Failed to load original truncated path data from ${filePath}`, err);
            return null;
        }
    }

    function loadMapping(filePath: string): number[] | null {
        try {
            const buffer = fs.readFileSync(filePath);

            const mappingData = msgp.decode(buffer) as { routeId: string, mapping: number[] };
            return mappingData.mapping;
        } catch (err) {
            console.error(`Failed to load original truncated path data from ${filePath}`, err);
            return null;
        }
    }

    const parentDir = path.dirname(inputDirectory);

    const original = loadOriginalRoute(path.join(parentDir, `/original/${routeId}.route`));
    const truncatedPath = loadTruncatedPath(path.join(parentDir, `/truncated/${routeId}.truncated`));
    const mapping = loadMapping(path.join(parentDir, `/mappings/${routeId}.mapping`));

    return {
        original, truncatedPath, mapping
    }
}