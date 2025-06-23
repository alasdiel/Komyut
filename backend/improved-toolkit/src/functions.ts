import { promises as fs } from 'fs';
import * as path from 'path';

export async function saveRouteFile(routeName: String, routeId: String, editorData: {waypoints: any, path: any}, outputPath: string) {
    const jsonObject = {
        routeId: routeId,
        routeName: routeName,
        waypoints: editorData.waypoints,
        path: editorData.path
    };

    const outputFilePath = path.resolve(outputPath)
    const outputFileDir = path.dirname(outputPath);

    await fs.mkdir(outputFileDir, {recursive: true});

    await fs.writeFile(outputFilePath, JSON.stringify(jsonObject, null, '\t'));
    console.log(`RouteFile ${routeName} with ID ${routeId} saved to ${outputFilePath}`);
}

export async function readRouteFile(filePath: string) {
    try {
        const fileContents = await fs.readFile(path.resolve(filePath), 'utf-8');
        const jsonData = JSON.parse(fileContents);
        return jsonData;
    } catch(err) {
        console.error(`Failed to read or parse file ${filePath}!`, err);
        throw err;
    }
}