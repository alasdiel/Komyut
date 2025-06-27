import * as fs from "fs";
import * as readline from "readline";

import { readRouteFile, saveRouteFile } from "./io-functions";
import { calculateTruncatedPath, generateNodeLookup, generateRouteGraph, generateTransferPoints, generateTruncatedFullMapping, readAllRouteFiles, writeAllRouteFiles, writeCacheFile, writeManifestFile, writePathMappingsToFiles, writeTruncatedPathsToFiles } from "./compile-functions";
import { showEditor } from "./editor";
import { getPathFromWaypoints } from "./pathgen";
import { Readline } from "readline/promises";
import { CompileParameters } from "../shared/types";

/**
 * Creates a new route file from scratch
 * @param routeName Proper name of the route
 * @param routeId Route ID
 * @param outputFilePath File to save the new .route file
 */
export async function newRouteFile(routeName: string, routeId: string, outputFilePath: string) {    
    //Complain if file already exists
    if(fs.existsSync(outputFilePath)) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.warn(`A routefile already exists at ${outputFilePath}, overwrite? (y/n)`);
        const response = await new Promise((resolve) => {
            rl.question('', (answer) => {
                resolve(answer);
            });
        });

        if(response !== 'y') {
            console.log('Not overwriting the file, exiting.');
            rl.close();
            return;
        }
        rl.close();
    }

    //Show editor
    //Once editor closes, get waypoints and fullPath        
    const waypoints = await showEditor(routeName, routeId);

    //Get OSRM geometry from entered waypoints
    const path = await getPathFromWaypoints(waypoints);   
    if(path === null)  {
        console.error(`OSRM could not get the path from editor waypoints!`);
        return;
    }

    //Save to routefile
    console.log(`Saving RouteFile to ${outputFilePath}`);
    saveRouteFile(routeName, routeId, waypoints, path, outputFilePath);
}

/**
 * Edits existing file and overwrites it or optionally writes to new file
 * @param inputFilePath 
 * @param outputFilePath 
 * @param hasOutputPath ?  
 */
export async function editRouteFile(inputFilePath: string, outputFilePath: string, hasOutputPath ? : boolean) {
    //Load existing file
    console.log(`Reading existing file from ${inputFilePath}`);
    const routeObject = await readRouteFile(inputFilePath);

    //Show editor, push existing routeData
    //Once editor closes, get waypoints and fullPath        
    const waypoints = await showEditor(routeObject.routeName, routeObject.routeId, routeObject.waypoints);

    //Get OSRM geometry from entered waypoints
    const path = await getPathFromWaypoints(waypoints);   
    if(path === null)  {
        console.error(`OSRM could not get the path from editor waypoints!`);
        return;
    }

    //Save to routefile
    console.log(`Saving RouteFile to ${outputFilePath}`);
    saveRouteFile(routeObject.routeName, routeObject.routeId, waypoints, path, hasOutputPath ? outputFilePath : inputFilePath);
}

export async function compileAll(inputDirectory: string, outputDirectory: string, compileParameters: CompileParameters) {
    if(!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);

    //Read all route files
    const routeFiles = readAllRouteFiles(inputDirectory);    
    const truncatedPaths: { routeId: string, truncatedPath: [number, number][]}[] = [];
    const pathMappings: { routeId: string, mapping: number[] }[] = [];

    routeFiles.forEach(r => {
        console.log(`Read RouteFile ID:${r.routeId}, generating truncatedPaths and mappings now.`);

        const tPath = calculateTruncatedPath(r.path, compileParameters.TRUNCATION_INTERVAL)
        truncatedPaths.push({
            routeId: r.routeId,
            truncatedPath: tPath
        });

        const mapping = generateTruncatedFullMapping(tPath, r.path, compileParameters.MAPPING_RADIUS);
        pathMappings.push({
            routeId: r.routeId,
            mapping: mapping
        });
    });

    console.log(`Generating TransferPoints from ${
        truncatedPaths.reduce((sum, route) => {return sum + route.truncatedPath.length;}, 0)
    } truncated points (tr=${compileParameters.TRANSFER_RADIUS}m, st=${compileParameters.SPATIAL_TOLERANCE}m)`);
    const transferPoints = generateTransferPoints(truncatedPaths, compileParameters.TRANSFER_RADIUS, compileParameters.SPATIAL_TOLERANCE);    
    console.log(`Generated ${transferPoints.length} TransferPoints`);

    console.log(`Generating RouteGraph`);
    const routeGraph = generateRouteGraph(truncatedPaths, transferPoints, compileParameters.CONTINUE_REWARD, compileParameters.TRANSFER_PENALTY);
    console.log(`RouteGraph done generating`);

    console.log(`Generating Node Lookup Table`);
    const nodeLookup = generateNodeLookup(truncatedPaths);
    console.log(`Node Lookup Table done generating`);

    console.log(`Writing to ${outputDirectory}/original`);
    writeAllRouteFiles(outputDirectory, routeFiles);

    console.log(`Writing to ${outputDirectory}/truncated`);
    writeTruncatedPathsToFiles(outputDirectory, truncatedPaths);

    console.log(`Writing to ${outputDirectory}/mappings`);
    writePathMappingsToFiles(outputDirectory, pathMappings);

    console.log(`Writing the TransferPoints file.`);
    writeCacheFile(outputDirectory, 'transferPoints.cache', transferPoints);    

    console.log(`Writing RouteGraph to file`);
    writeCacheFile(outputDirectory, 'routeGraph.cache', routeGraph);

    console.log(`Writing NodeLookUp to file`);
    writeCacheFile(outputDirectory, 'nodeLookup.cache', nodeLookup);

    writeManifestFile(outputDirectory, routeFiles, compileParameters);
    console.log(`Done compiling!`);
}