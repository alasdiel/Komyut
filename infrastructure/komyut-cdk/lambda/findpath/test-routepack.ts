import { APIGatewayProxyHandler } from "aws-lambda";
import { loadRoutePack, loadRoutePackFromS3, loadRoutePackFromS3Parallel } from "../routepackloader/loader";
import { RoutePack } from "../../../../shared/types";

let cachedRoutePack: RoutePack | null = null;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        if (!cachedRoutePack) {
            console.log("COLD START, loading routepack");
            cachedRoutePack = await loadRoutePackFromS3Parallel('komyut-routepack-bucket', 'routepack');
        }

        const routePack = cachedRoutePack;

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Testing routepack loading!`,
                routePackLength: routePack?.routes.length
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