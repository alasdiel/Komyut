import express from "express";
import path from "path";
import { open } from 'openurl';
import { getGuiAssetPath } from "./helpers";
import * as fs from 'fs';

//Starts a psuedo-webserver to show an editor
export function showEditor(routeName: String, routeId: String, existingWaypoints?: any): Promise<[number, number][]> {
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

            server.close(() => {
                console.log(`Editor closed.`);
                resolve(req.body as [number, number][]);
            });
        });

        //Start the server
        const server = app.listen(port, () => {
            console.log(`Route editor running at http://localhost:${port}`);
            open(`http://localhost:${port}`);
        });
    });
}