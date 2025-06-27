"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showEditor = showEditor;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const open_1 = __importDefault(require("open"));
//Starts a psuedo-webserver to show an editor
function showEditor(routeName, routeId, existingWaypoints) {
    return new Promise((resolve) => {
        const app = (0, express_1.default)();
        const port = 3200;
        //Use JSON
        app.use(express_1.default.json({
            limit: '100mb'
        }));
        //For application/x-www-form-urlencoded
        app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
        //Start serving static files
        app.use(express_1.default.static(path_1.default.join(__dirname, 'editor-gui')));
        //Serve index
        app.get("/", (req, res) => {
            res.sendFile(path_1.default.join(__dirname, 'editor-gui/index.html'));
        });
        //Server basic data
        app.get("/get-metadata", (req, res) => {
            res.json({ routeName: routeName, routeId: routeId });
        });
        //Supply existing data if there is
        app.get("/edit-data", (req, res) => {
            res.json({ isEditing: existingWaypoints !== null, waypoints: existingWaypoints });
        });
        //On 'DONE' is pressed
        app.post("/update-wp", (req, res) => {
            res.json({ success: true });
            server.close(() => {
                console.log(`Editor closed.`);
                resolve(req.body);
            });
        });
        //Start the server
        const server = app.listen(port, () => {
            console.log(`Route editor running at http://localhost:${port}`);
            (0, open_1.default)(`http://localhost:${port}`);
        });
    });
}
