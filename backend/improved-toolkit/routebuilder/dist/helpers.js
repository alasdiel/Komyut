"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetPath = getAssetPath;
exports.haversine = haversine;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getAssetPath(relativePath) {
    const isPkg = typeof process.pkg !== 'undefined';
    const basePath = isPkg ? path_1.default.dirname(process.execPath) : __dirname;
    const fullPath = path_1.default.join(basePath, relativePath);
    if (!fs_1.default.existsSync(fullPath)) {
        console.warn(`Asset not found: ${fullPath}`);
    }
    return fullPath;
}
function haversine(lat1, long1, lat2, long2) {
    function toRad(deg) {
        return deg * Math.PI / 180;
    }
    const lat1Rad = toRad(lat1);
    const long1Rad = toRad(long1);
    const lat2Rad = toRad(lat2);
    const long2Rad = toRad(long2);
    const R = 6731;
    const dLat = lat2Rad - lat1Rad;
    const dLong = long2Rad - long1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000;
}
