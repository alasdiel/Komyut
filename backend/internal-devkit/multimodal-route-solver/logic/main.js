$(document).ready(function () {
    let loadedRoutes = [];

    let routeGraph = {};
    let transferPoints = [];

    let previewPathsPolyLines = [];    

    //Initialize Leaflet/Open Street Map map kit
    const map = initializeLeaflet();
    
    //Create the start and end markers
    const markerPositions = {startPos: null, endPos: null};
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

                        const fullPath = await calculateOSRMPath(jsonObj);

                        if(fullPath === null) {
                            reject(err);
                            return;
                        }
                        const shortPath = calculateTruncatedPath(fullPath, 200);

                        //Visualize the full path                    
                        let { polyLine, color } = visualizePath(map, fullPath);
                        appendToRouteTableInfo(jsonObj.routeName, color);   
                        previewPathsPolyLines.push(polyLine);

                        //Store loaded routes
                        loadedRoutes.push({
                            routeFile: jsonObj,
                            processedPath: fullPath,
                            truncatedPath: shortPath
                        });

                        resolve();
                    } catch(err) {
                        console.error(err);
                        console.log(`Failed to load RouteFile ${file}`);
                        reject(err);
                    }
                }
                
                reader.readAsText(file);
            });
        });

        try {
            await Promise.all(fileLoadPromises);          
            transferPoints = buildTransferPoints(loadedRoutes);
            routeGraph = createRouteGraph(loadedRoutes, transferPoints);

            // previewPathsPolyLines.forEach(l => map.removeLayer(l));
            // transferPoints.forEach(t => {
            //     const fromCoord = t.from.coord;
            //     const toCoord = t.to.coord;

            //     L.polyline([fromCoord, toCoord], {
            //         color: 'orange',
            //         dashArray: '4',
            //         weight: 2,
            //         opacity: 0.6,
            //     }).bindTooltip(`${t.from.routeId} → ${t.to.routeId}`).addTo(map);
            // });            

            console.log("All routes loaded");
        } catch(e) {
            console.log("Some routes failed to load!");
            console.error(e);
        }
    });

    //On button click: Do multiroute calculation
    $('#btn-calc').click(async function(e) {                  
        // console.log(`p1: ${markerPositions.startPos}, p2: ${markerPositions.endPos}`);
        previewPathsPolyLines = clearPathPolylines(map, previewPathsPolyLines);

        const {coordinates, path} = await findBestPath(
            [markerPositions.startPos.lat, markerPositions.startPos.lng],
            [markerPositions.endPos.lat, markerPositions.endPos.lng],
            routeGraph,
            transferPoints,
            loadedRoutes
        );

        visualizeCalculatedPath(map, path, loadedRoutes,
            [markerPositions.startPos.lat, markerPositions.startPos.lng],
            [markerPositions.endPos.lat, markerPositions.endPos.lng]
        );

        console.log(path);
    });
});