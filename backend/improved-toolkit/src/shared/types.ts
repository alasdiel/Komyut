export interface RouteFile {
    routeName: string;
    routeId: string;
    waypoints: [number, number][];
    path: [number, number][];
}

export interface IndexedPoint {
    minX: number, maxX: number,
    minY: number, maxY: number,
    routeId: string,
    coord: [number, number],
    index: number
}

export interface TransferPoint {
    from: { routeId: string, coord: [number, number], index: number, nodeId: string }
    to: { routeId: string, coord: [number, number], index: number, nodeId: string }
    distance: number
}

export type RouteGraph = Record<string, { to: string; cost: number; geometry?: [number, number][] }[]>;

export interface RoutePack {
    routeGraph: RouteGraph,
    transferPoints: TransferPoint[],
    routes: {
        routeId: string,
        routeFile: RouteFile,
        mappings: number[],
        truncatedPath: [number, number][]
    }[]
}

export type MergedPathLegResponse = {
    type: 'walk' | 'jeepney';
    routeId: string | null;
    coordinates: [number, number][];
}