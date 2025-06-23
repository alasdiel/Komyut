import path from 'path';
import fs from 'fs';

export function getAssetPath(relativePath: string): string {
    const isPkg = typeof (process as any).pkg !== 'undefined';
    const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
    const fullPath = path.join(basePath, relativePath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`Asset not found: ${fullPath}`);
    }

    return fullPath;
}