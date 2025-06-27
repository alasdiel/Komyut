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
exports.saveRouteFile = saveRouteFile;
exports.readRouteFile = readRouteFile;
const fs_1 = require("fs");
const nPath = __importStar(require("path"));
function saveRouteFile(routeName, routeId, waypoints, path, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonObject = {
            routeId: routeId,
            routeName: routeName,
            waypoints: waypoints,
            path: path
        };
        const outputFilePath = nPath.resolve(outputPath);
        const outputFileDir = nPath.dirname(outputPath);
        yield fs_1.promises.mkdir(outputFileDir, { recursive: true });
        yield fs_1.promises.writeFile(outputFilePath, JSON.stringify(jsonObject, null, '\t'));
        console.log(`RouteFile ${routeName} with ID ${routeId} saved to ${outputFilePath}`);
    });
}
function readRouteFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fileContents = yield fs_1.promises.readFile(nPath.resolve(filePath), 'utf-8');
            const jsonData = JSON.parse(fileContents);
            return jsonData;
        }
        catch (err) {
            console.error(`Failed to read or parse file ${filePath}!`, err);
            throw err;
        }
    });
}
