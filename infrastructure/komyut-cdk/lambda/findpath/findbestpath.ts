import { APIGatewayProxyHandler } from "aws-lambda";
import { laodRoutePackBundleFromS3, loadRoutePack, loadRoutePackFromS3, loadRoutePackFromS3Parallel } from "../../helpers/routepackLoader";
import { RoutePack } from "@shared/types";
import { findBestPath, mergePathLegs, transformLegsForFrontend } from "../../calculation/routesolver";

let cachedRoutePack: RoutePack | null = null;
const CLOUDFRONT_DOMAIN = 'https://d2zt5474mwwtx6.cloudfront.net'; 


export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');        
        const startCoord: [number, number] = [ body.startPos.lat, body.startPos.lng ];
        const endCoord: [number, number] = [ body.endPos.lat, body.endPos.lng ];

        //Load path
        if (!cachedRoutePack) {
            console.log("COLD START, loading routepack");
            // cachedRoutePack = await loadRoutePackFromS3Parallel('komyut-routepack-bucket', 'routepack');
            const time1 = performance.now();
            console.log(`start function laodRoutePackBundleFromS3`);
            cachedRoutePack = await laodRoutePackBundleFromS3('komyut-routepack-bucket', 'routepack-bundle');
            console.log(`laodRoutePackBundleFromS3 TOOK ${(performance.now() - time1)}ms`);
            
            if (!cachedRoutePack) {
                console.error(`RoutePack failed to load`);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        error: `RoutePack failed to load`
                    })                                                 
                };
            }
        }

        //Find best path
        const time2 = performance.now();
        console.log(`start function findBestPath`);
        const { coordinates, path } = await findBestPath(startCoord, endCoord, cachedRoutePack);
        console.log(`findBestPath TOOK ${(performance.now() - time2)}ms`);

        //Merge
        const time3 = performance.now();
        console.log(`start function mergePathLegs`);
        const mergedLegs = mergePathLegs(path);
        console.log(`mergePathLegs TOOK ${(performance.now() - time3)}ms`);

        //Transfer from nodes->coords
        const time4 = performance.now();
        console.log(`start function transformLegsForFrontend`);
        const legs = await transformLegsForFrontend(mergedLegs, cachedRoutePack, startCoord, endCoord);       
        console.log(`transformLegsForFrontend TOOK ${(performance.now() - time4)}ms`);

        //FOR KARLO:
        /*
            According to CloudWatch logs, loading RoutePack from S3 takes 12.2s which is fine,
            I've found out that currently findBestPath() does indeed start but ApiGateway times out before it finishes,
            you can dive in to the findBestPath(), and try pinpointing which functions inside findBestPath are taking too long kato langggg

            To upload the routepack to AWS, use this command:
            aws s3 cp "C:\Path\to\routepack\folder" s3://komyut-routepack-bucket/routepack-bundle --recursive

            Ill send the RoutePack in bundle version sa VC chat

            ayown lng thx
        */

        return {
            statusCode: 200,
            body: JSON.stringify({
                legs,                
            })
        };
    } catch (err) {
        console.error(`[ROUTE HANDLER ERR]: ${err}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `${err}`
            })
        };
    }
};