import express from 'express';
import path from 'path';
import { open } from 'openurl';

import { RoutePack } from '../shared/types';
import { buildNodeLookup, findBestPath, mergePathLegs, transformLegsForFrontend, transformLegsFromTruncatedPathsOnly } from './route-solver';

export function showMap(routePackData: RoutePack) {
    const app = express();
    const port = 3201;

    app.use(express.json());

    app.use(express.static(path.join(__dirname, 'map')));

    app.get('/', (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, 'map/index.html'));
    });

    app.get('/display-paths', (req: express.Request, res: express.Response) => {
        let resData: { [routeId: string]: [number, number][] } = {};

        routePackData.routes.forEach(r => {
            resData[r.routeId] = r.routeFile.path;
        });

        res.json(resData);
    });

    app.post('/calc-route', async (req: express.Request, res: express.Response) => {
        const startCoord: [number, number] = [ req.body.startPos.lat, req.body.startPos.lng ];
        const endCoord: [number, number] = [ req.body.endPos.lat, req.body.endPos.lng ];

        const { coordinates, path } = await findBestPath(startCoord, endCoord, routePackData);

        const mergedLegs = mergePathLegs(path);

        const nodeLookup = buildNodeLookup(routePackData);
        const legs = await transformLegsForFrontend(mergedLegs, routePackData, startCoord, endCoord);

        res.json({
            legs,
            plainPath: coordinates
        });
    });

    const server = app.listen(port, () => {
        console.log(`Route tester running at http://localhost:${port}`);
        open(`http://localhost:${port}`);
    });
}