$(document).ready(function () {
    async function multirouteCalculation() {
        //Clear previous polylines
        previewPathsPolyLines = clearPathPolylines(map, previewPathsPolyLines);

        //Find best path using Dijkstra's (USE A* in the future)
        const { coordinates, path } = await findBestPath(
            [markerPositions.startPos.lat, markerPositions.startPos.lng],
            [markerPositions.endPos.lat, markerPositions.endPos.lng],
            routeGraph,
            transferPoints,
            loadedRoutes
        );

        //Merge all waypoints of one jeepney ride        
        const mergedLegs = mergePathLegs(path);
        console.log(mergedLegs);

        // await visualizeCalculatedPath(map, path, loadedRoutes,
        //     [markerPositions.startPos.lat, markerPositions.startPos.lng],
        //     [markerPositions.endPos.lat, markerPositions.endPos.lng]
        // );

        // Visualize merged paths
        await visualizeCalculatedMergedPath(map, mergedLegs, loadedRoutes,
            [markerPositions.startPos.lat, markerPositions.startPos.lng],
            [markerPositions.endPos.lat, markerPositions.endPos.lng]
        );

        // console.log(path);
    }

    let loadedRoutes = [];

    let routeGraph = {};
    let transferPoints = [];

    let previewPathsPolyLines = [];

    //Initialize Leaflet/Open Street Map map kit
    const map = initializeLeaflet();

    //Create the start and end markers
    const markerPositions = { startPos: null, endPos: null };
    leafletCreateMarkers(map, markerPositions);

    //Load the routes as soon as files are uploaded    
    $('#rte-loader').on('change', async function () {
        const files = this.files;
        clearRouteTable();

        const fileLoadPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async function (e) {
                    try {
                        //Create JSON object from rte file
                        const jsonObj = JSON.parse(e.target.result);

                        //From set of coordinates, re-calculate the full route
                        const fullPath = await calculateOSRMPath(jsonObj);
                        if (fullPath === null) {
                            reject(err);
                            return;
                        }

                        //Create a shorter list of coordinates as path, reducing coords to reduce calculations
                        const TRUNCATION_SEPARATION = 300; //METERS
                        const shortPath = calculateTruncatedPath(fullPath, TRUNCATION_SEPARATION);                        

                        //Maps truncated paths to their full conterpart
                        const MAPPING_SEPARATION = 1; //METERS
                        const mapping = calculateTruncatedFullMapping(shortPath, fullPath, MAPPING_SEPARATION);                        

                        //Visualize the full path                    
                        let { polyLine, color } = visualizePath(map, fullPath);
                        appendToRouteTableInfo(jsonObj.routeName, color);
                        previewPathsPolyLines.push(polyLine);

                        //Store loaded routes
                        const lr = {
                            routeFile: jsonObj,
                            fullPath: fullPath,
                            truncatedPath: shortPath,
                            mapping: mapping
                        };
                        loadedRoutes.push(lr);         
                        
                        // debugVisualizeTruncatedToFullMapping(map, lr);

                        resolve();
                    } catch (err) {
                        console.error(err);
                        console.log(`Failed to load RouteFile ${file}`);
                        reject(err);
                    }
                }

                reader.readAsText(file);
            });
        });

        try {
            //Load route files and create the caches: transfer points and route graph
            await timeOperationMultiple([
                ["LOAD ALL FILES", async () => { await Promise.all(fileLoadPromises); }],
                ["BUILD TRANSFER POINTS", async () => { transferPoints = buildTransferPoints(loadedRoutes); }],
                ["CREATE ROUTEGRAPH", async () => { routeGraph = createRouteGraph(loadedRoutes, transferPoints); }],
            ]);

            // debugVisualizeTransferPoints(map, transferPoints);

            console.log("All routes loaded");
        } catch (e) {
            console.log("Some routes failed to load!");
            console.error(e);
        }
    });

    //On button click: Do multiroute calculation
    $('#btn-calc').click(async function (e) {
        await multirouteCalculation();
    });
});