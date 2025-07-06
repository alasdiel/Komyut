import { Route } from 'aws-cdk-lib/aws-appmesh';
import { RouteFile, RouteGraph, RoutePack, TransferPoint } from '../../../../shared/types';
import { readS3Buffer, readS3Text } from '../../helpers/s3helpers';

import * as msgp from '@msgpack/msgpack';

export async function loadRoutePackFromS3(bucket: string, prefix: string): Promise<RoutePack | null> {
    try {
        //Load manifest file from text, then to list of expected routes
        const manifestText = await readS3Text(bucket, `${prefix}/routepack.json`);
        const manifestData = JSON.parse(manifestText) as { includedRoutes: string[] };

        //Load transfer points from bytes then to TransferPoint[]
        const transferPointsBuf = await readS3Buffer(bucket, `${prefix}/transferPoints.cache`);
        const transferPoints = msgp.decode(transferPointsBuf) as TransferPoint[];

        //Load routeGraph from bytes then to RouteGraph
        const routeGraphBuf = await readS3Buffer(bucket, `${prefix}/routeGraph.cache`);
        const routeGraph = msgp.decode(routeGraphBuf) as RouteGraph;

        //Load nodeLookup table from bytes then to Record<string, [number, number]>
        const nodeLookUpBuf = await readS3Buffer(bucket, `${prefix}/nodeLookup.cache`);
        const nodeLookUpTable = msgp.decode(nodeLookUpBuf) as Record<string, [number, number]>

        const routes: {
            routeId: string,
            routeFile: RouteFile,
            mappings: number[],
            truncatedPath: [number, number][]
        }[] = [];

        //Load all the expected routes
        for(const rId of manifestData.includedRoutes) {
            //Load the original route file
            const originalText = await readS3Text(bucket, `${prefix}/original/${rId}.route`);
            const originalRoute = JSON.parse(originalText) as RouteFile;

            //Load the .truncated file
            const truncatedBuf = await readS3Buffer(bucket, `${prefix}/truncated/${rId}.truncated`);
            const truncatedPath = (msgp.decode(truncatedBuf) as { routeId: string, truncatedPath: [number, number][] }).truncatedPath;

            //Load the .mapping file
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
            transferPoints: transferPoints,
            routeGraph: routeGraph,
            routes: routes,
            nodeLookup: nodeLookUpTable
        };
    } catch(err) {
        console.error(`[ROUTE LOADER ERR]: ${err}`);
        return null;
    }
}