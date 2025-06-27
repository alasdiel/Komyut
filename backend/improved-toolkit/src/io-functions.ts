import { promises as fs } from 'fs';
import * as nPath from 'path';

export async function saveRouteFile(routeName: String, routeId: String, waypoints: any, path: any, outputPath: string) {
    const jsonObject = {
        routeId: routeId,
        routeName: routeName,
        waypoints: waypoints,
        path: path
    };

    const outputFilePath = nPath.resolve(outputPath)
    const outputFileDir = nPath.dirname(outputPath);

    await fs.mkdir(outputFileDir, {recursive: true});

    await fs.writeFile(outputFilePath, JSON.stringify(jsonObject, null, '\t'));
    console.log(`RouteFile ${routeName} with ID ${routeId} saved to ${outputFilePath}`);
}

export async function readRouteFile(filePath: string) {
    try {
        const fileContents = await fs.readFile(nPath.resolve(filePath), 'utf-8');
        const jsonData = JSON.parse(fileContents);
        return jsonData;
    } catch(err) {
        console.error(`Failed to read or parse file ${filePath}!`, err);
        throw err;
    }
}