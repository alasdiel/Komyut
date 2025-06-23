import express from "express";
import path from "path";
import open from "open";

import { getAssetPath } from './helper';

//Starts a psuedo-webserver to show an editor
export function showEditor(routeName: String, routeId: String, existingWaypoints?: any) : Promise<{waypoints: any, path: any}> {
    return new Promise((resolve) => {
        const app = express();
        const port = 3200;

        //Use JSON
        app.use(express.json({
            limit: '100mb'
        }));
        //For application/x-www-form-urlencoded
        app.use(express.urlencoded({ extended: true, limit: '100mb' }));

        //Start serving static files
        app.use(express.static(path.join(__dirname, 'editor-gui')));        

        //Serve index
        app.get("/", (req: express.Request, res: express.Response) => {            
            res.sendFile(path.join(__dirname, 'editor-gui/index.html'));
        });

        //Server basic data
        app.get("/get-metadata", (req: express.Request, res: express.Response) => {
            res.json({ routeName: routeName, routeId: routeId });
        });

        //Supply existing data if there is
        app.get("/edit-data", (req: express.Request, res: express.Response) => {            
            res.json({ isEditing: existingWaypoints !== null, waypoints: existingWaypoints });
        });

        //On 'DONE' is pressed
        app.post("/update-wp", (req: express.Request, res: express.Response) => {
            res.json({ success: true });

            const result = {
                waypoints: req.body.waypoints,
                path: req.body.path
            }

            server.close(() => {
                console.log(`Editor closed.`);
                resolve(result);
            });
        });

        //Start the server
        const server = app.listen(port, () => {
            console.log(`Route editor running at http://localhost:${port}`);
            open(`http://localhost:${port}`);
        });
    });
}