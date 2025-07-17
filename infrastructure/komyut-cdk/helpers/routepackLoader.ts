import { Route } from 'aws-cdk-lib/aws-appmesh';
import { RouteFile, RouteGraph, RoutePack, TransferPoint } from '@shared/types';
import { readS3Buffer, readS3Text, readCloudFrontBuffer, readCloudFrontText } from './s3helpers';
import path from "path";
import * as fs from 'fs';
import fetch from 'node-fetch';

import * as msgp from '@msgpack/msgpack';

//Load from native filesystem
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

        manifestData.includedRoutes.forEach(rId => {
            const { original, truncatedPath, mapping } = loadRouteData(inputDirectory, rId);

            if (original && truncatedPath && mapping) {
                routes.push({ routeId: rId, routeFile: original, mappings: mapping, truncatedPath: truncatedPath });
            } else {
                console.error(`Error loading some of the routes!`);                
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

function loadManifest(manifestPath: string): { includedRoutes: string[] } | null {
    try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        return JSON.parse(content) as { includedRoutes: string[] };         
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

//Load from S3 bucket
export async function loadRoutePackFromS3(bucket: string, prefix: string): Promise<RoutePack | null> {
    
    try {        
        // --- Manifest        
        const manifestText = await readS3Text(bucket, `${prefix}/routepack.json`);        
        const manifestData = JSON.parse(manifestText) as { includedRoutes: string[] };

        // --- Transfer Points        
        const transferPointsBuf = await readS3Buffer(bucket, `${prefix}/transferPoints.cache`);        
        const transferPoints = msgp.decode(transferPointsBuf) as TransferPoint[];

        // --- RouteGraph        
        const routeGraphBuf = await readS3Buffer(bucket, `${prefix}/routeGraph.cache`);        
        const routeGraph = msgp.decode(routeGraphBuf) as RouteGraph;

        // --- Node Lookup        
        const nodeLookUpBuf = await readS3Buffer(bucket, `${prefix}/nodeLookup.cache`);
        const nodeLookUpTable = msgp.decode(nodeLookUpBuf) as Record<string, [number, number]>;

        const routes: RoutePack["routes"] = [];

        // --- Load all expected routes
        for (const rId of manifestData.includedRoutes) {
            const label = (name: string) => `route:${rId} | ${name}`;

            // Original route            
            const originalText = await readS3Text(bucket, `${prefix}/original/${rId}.route`);
            const originalRoute = JSON.parse(originalText) as RouteFile;

            // Truncated            
            const truncatedBuf = await readS3Buffer(bucket, `${prefix}/truncated/${rId}.truncated`);
            const truncatedPath = (msgp.decode(truncatedBuf) as { routeId: string, truncatedPath: [number, number][] }).truncatedPath;

            // Mapping            
            const mappingBuf = await readS3Buffer(bucket, `${prefix}/mappings/${rId}.mapping`);
            const mapping = (msgp.decode(mappingBuf) as { routeId: string, mapping: number[] }).mapping;

            routes.push({
                routeId: rId,
                routeFile: originalRoute,
                mappings: mapping,
                truncatedPath: truncatedPath
            });
        }

        return {
            transferPoints,
            routeGraph,
            routes,
            nodeLookup: nodeLookUpTable
        };
    } catch (err) {
        console.error(`[ROUTE LOADER ERR]: ${err}`);
        return null;
    }
}

export async function loadRoutePackFromS3Parallel(bucket: string, prefix: string): Promise<RoutePack | null> {
    try {
        // --- Manifest        
        const manifestText = await readS3Text(bucket, `${prefix}/routepack.json`);
        const manifestData = JSON.parse(manifestText) as { includedRoutes: string[] };

        // --- Transfer Points        
        const transferPointsBuf = await readS3Buffer(bucket, `${prefix}/transferPoints.cache`);
        const transferPoints = msgp.decode(transferPointsBuf) as TransferPoint[];

        // --- RouteGraph        
        const routeGraphBuf = await readS3Buffer(bucket, `${prefix}/routeGraph.cache`);
        const routeGraph = msgp.decode(routeGraphBuf) as RouteGraph;

        // --- Node Lookup        
        const nodeLookUpBuf = await readS3Buffer(bucket, `${prefix}/nodeLookup.cache`);
        const nodeLookUpTable = msgp.decode(nodeLookUpBuf) as Record<string, [number, number]>;

        const routes: RoutePack["routes"] = [];

        await Promise.all(manifestData.includedRoutes.map(async (rId) => {
            const [originalText, truncatedBuf, mappingBuf] = await Promise.all([
                readS3Text(bucket, `${prefix}/original/${rId}.route`),
                readS3Buffer(bucket, `${prefix}/truncated/${rId}.truncated`),
                readS3Buffer(bucket, `${prefix}/mappings/${rId}.mapping`),
            ]);

            const originalRoute = JSON.parse(originalText) as RouteFile;
            const truncatedPath = (msgp.decode(truncatedBuf) as { routeId: string, truncatedPath: [number, number][] }).truncatedPath;
            const mapping = (msgp.decode(mappingBuf) as { routeId: string, mapping: number[] }).mapping;

            routes.push({
                routeId: rId,
                routeFile: originalRoute,
                mappings: mapping,
                truncatedPath: truncatedPath
            });
        }));

        return {
            transferPoints,
            routeGraph,
            routes,
            nodeLookup: nodeLookUpTable
        };        
    } catch (err) {
        console.error(`[ROUTEPACK LOADER ERR]: ${err}`);
        return null;
    }    
}

export async function laodRoutePackBundle(bucket: string, prefix: string): Promise<RoutePack | null> {
    try {
        // First try CloudFront (NEW)
        console.log(`Attempting CloudFront load from ${prefix}/routepack.bundle`);
        const bundleBuf = await readCloudFrontBuffer(`${prefix}/routepack.bundle`);
        return msgp.decode(bundleBuf) as RoutePack;
    } catch (cloudfrontErr) {
        console.warn('CloudFront failed, falling back to S3:', cloudfrontErr);
        
        // Fallback to S3 if CloudFront fails
        try {
            const bundleBuf = await readS3Buffer(bucket, `${prefix}/routepack.bundle`);
            const bundleData = msgp.decode(bundleBuf) as RoutePack;

        return bundleData;
        } catch (err) {
            console.error(`[ROUTEPACK LOADER ERR]: ${err}`);
            return null;
        }
    }
}



