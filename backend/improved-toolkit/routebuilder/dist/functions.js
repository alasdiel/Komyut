"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRouteFile = newRouteFile;
exports.editRouteFile = editRouteFile;
exports.compileAll = compileAll;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const io_functions_1 = require("./io-functions");
const compile_functions_1 = require("./compile-functions");
const editor_1 = require("./editor");
const pathgen_1 = require("./pathgen");
/**
 * Creates a new route file from scratch
 * @param routeName Proper name of the route
 * @param routeId Route ID
 * @param outputFilePath File to save the new .route file
 */
function newRouteFile(routeName, routeId, outputFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        //Complain if file already exists
        if (fs.existsSync(outputFilePath)) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            console.warn(`A routefile already exists at ${outputFilePath}, overwrite? (y/n)`);
            const response = yield new Promise((resolve) => {
                rl.question('', (answer) => {
                    resolve(answer);
                });
            });
            if (response !== 'y') {
                console.log('Not overwriting the file, exiting.');
                rl.close();
                return;
            }
            rl.close();
        }
        //Show editor
        //Once editor closes, get waypoints and fullPath        
        const waypoints = yield (0, editor_1.showEditor)(routeName, routeId);
        //Get OSRM geometry from entered waypoints
        const path = yield (0, pathgen_1.getPathFromWaypoints)(waypoints);
        if (path === null) {
            console.error(`OSRM could not get the path from editor waypoints!`);
            return;
        }
        //Save to routefile
        console.log(`Saving RouteFile to ${outputFilePath}`);
        (0, io_functions_1.saveRouteFile)(routeName, routeId, waypoints, path, outputFilePath);
    });
}
/**
 * Edits existing file and overwrites it or optionally writes to new file
 * @param inputFilePath
 * @param outputFilePath
 * @param hasOutputPath ?
 */
function editRouteFile(inputFilePath, outputFilePath, hasOutputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        //Load existing file
        console.log(`Reading existing file from ${inputFilePath}`);
        const routeObject = yield (0, io_functions_1.readRouteFile)(inputFilePath);
        //Show editor, push existing routeData
        //Once editor closes, get waypoints and fullPath        
        const waypoints = yield (0, editor_1.showEditor)(routeObject.routeName, routeObject.routeId, routeObject.waypoints);
        //Get OSRM geometry from entered waypoints
        const path = yield (0, pathgen_1.getPathFromWaypoints)(waypoints);
        if (path === null) {
            console.error(`OSRM could not get the path from editor waypoints!`);
            return;
        }
        //Save to routefile
        console.log(`Saving RouteFile to ${outputFilePath}`);
        (0, io_functions_1.saveRouteFile)(routeObject.routeName, routeObject.routeId, waypoints, path, hasOutputPath ? outputFilePath : inputFilePath);
    });
}
function compileAll(inputDirectory, outputDirectory, truncationInterval, mappingRadius, TRANSFER_RADIUS, SPATIAL_TOLERANCE, CONTINUE_REWARD, TRANSFER_PENALTY) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(outputDirectory))
            fs.mkdirSync(outputDirectory);
        //Read all route files
        const routeFiles = (0, compile_functions_1.readAllRouteFiles)(inputDirectory);
        const truncatedPaths = [];
        const pathMappings = [];
        routeFiles.forEach(r => {
            console.log(`Read RouteFile ID:${r.routeId}, generating truncatedPaths and mappings now.`);
            const tPath = (0, compile_functions_1.calculateTruncatedPath)(r.path, truncationInterval);
            truncatedPaths.push({
                routeId: r.routeId,
                truncatedPath: tPath
            });
            const mapping = (0, compile_functions_1.generateTruncatedFullMapping)(tPath, r.path, mappingRadius);
            pathMappings.push({
                routeId: r.routeId,
                mapping: mapping
            });
        });
        console.log(`Generating TransferPoints from ${truncatedPaths.reduce((sum, route) => { return sum + route.truncatedPath.length; }, 0)} truncated points (tr=${TRANSFER_RADIUS}m, st=${SPATIAL_TOLERANCE}m)`);
        const transferPoints = (0, compile_functions_1.generateTransferPoints)(truncatedPaths, TRANSFER_RADIUS, SPATIAL_TOLERANCE);
        console.log(`Generated ${transferPoints.length} TransferPoints`);
        console.log(`Generating RouteGraph`);
        const routeGraph = (0, compile_functions_1.generateRouteGraph)(truncatedPaths, transferPoints, CONTINUE_REWARD, TRANSFER_PENALTY);
        console.log(`RouteGraph done generating`);
        console.log(`Writing to ${outputDirectory}/original`);
        (0, compile_functions_1.writeAllRouteFiles)(outputDirectory, routeFiles);
        console.log(`Writing to ${outputDirectory}/truncated`);
        (0, compile_functions_1.writeTruncatedPathsToFiles)(outputDirectory, truncatedPaths);
        console.log(`Writing to ${outputDirectory}/mappings`);
        (0, compile_functions_1.writePathMappingsToFiles)(outputDirectory, pathMappings);
        console.log(`Writing the TransferPoints file.`);
        (0, compile_functions_1.writeTransferPointsToFile)(outputDirectory, transferPoints);
        console.log(`Writing RouteGraph to file`);
        (0, compile_functions_1.writeRouteGraphToFile)(outputDirectory, routeGraph);
        (0, compile_functions_1.writeManifestFile)(outputDirectory, routeFiles);
        console.log(`Done compiling!`);
    });
}
