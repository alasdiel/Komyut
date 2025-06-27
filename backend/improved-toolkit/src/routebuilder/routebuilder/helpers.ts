import path from 'path';
import fs from 'fs';

export function getGuiAssetPath(file: string): string {
    const isPkg = typeof (process as any).pkg !== 'undefined';
    const basePath = isPkg
        ? path.join(path.dirname(process.execPath), 'editor-gui') // packaged .exe
        : path.join(__dirname, 'editor-gui'); // dev

    return path.join(basePath, file);
}

export function haversine(lat1: number, long1: number, lat2: number, long2: number) {
    function toRad(deg: number) {
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