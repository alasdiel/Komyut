import { APIGatewayProxyHandler } from "aws-lambda";
import { laodRoutePackBundleFromS3, loadRoutePack, loadRoutePackFromS3, loadRoutePackFromS3Parallel } from "../../helpers/routepackLoader";
import { RoutePack } from "@shared/types";

let cachedRoutePack: RoutePack | null = null;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        if (!cachedRoutePack) {
            console.log("COLD START, loading routepack");
            // cachedRoutePack = await loadRoutePackFromS3Parallel('komyut-routepack-bucket', 'routepack');
            cachedRoutePack = await laodRoutePackBundleFromS3('komyut-routepack-bucket', 'routepack-bundle');
        }

        const routePack = cachedRoutePack;

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Testing routepack loading!`,
                routePackLength: routePack?.routes[0].routeFile.routeName
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