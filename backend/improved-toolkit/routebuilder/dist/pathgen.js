"use strict";
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
exports.getPathFromWaypoints = getPathFromWaypoints;
function getPathFromWaypoints(waypoints) {
    return __awaiter(this, void 0, void 0, function* () {
        const coordsStr = [
            ...waypoints,
            [waypoints[0][0], waypoints[0][1]]
        ].map(([lat, lng]) => `${lng},${lat}`).join(';');
        ;
        const res = yield fetch(`http://localhost:5000/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`);
        const json = yield res.json();
        if (!json.routes) {
            console.error(`[pathgen] OSRM response error:`, res.statusText);
            return null;
        }
        return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    });
}
