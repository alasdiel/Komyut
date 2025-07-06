import { APIGatewayProxyHandler } from "aws-lambda";
import { loadRoutePackFromS3 } from "../routepackloader/loader";

export const handler: APIGatewayProxyHandler = async(event) => {
    const routePack = await loadRoutePackFromS3('komyut-routepack-bucket', 'routepack');

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Testing routepack loading!`,
            routePack: JSON.stringify(routePack)
        })
    };
}