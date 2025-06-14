/**
 * 
 * @param {*} _routes List of routes
 * @returns List of transfers
 */
function buildTransferPoints(_routes) {
    const spatialIndex = new RBush();
    const indexedPoints = [];

    _routes.forEach(r => {
        r.truncatedPath.forEach((pt, i) => {
            indexedPoints.push({
                minX: pt[1], maxX: pt[1],
                minY: pt[0], maxY: pt[0],
                routeId: r.routeFile.routeName,
                coord: pt,
                index: i
            });
        });
    });

    spatialIndex.load(indexedPoints);

    const transfers = [];
    const TRANSFER_RADIUS = 200;

    indexedPoints.forEach(pt => {
        const SPATIAL_TOLERANCE = 0.001;
        const nearby = spatialIndex.search({
            minX: pt.minX - SPATIAL_TOLERANCE,
            maxX: pt.maxX + SPATIAL_TOLERANCE,
            minY: pt.minY - SPATIAL_TOLERANCE,
            maxY: pt.maxY + SPATIAL_TOLERANCE
        });

        const seen = new Set();
        const pairKey = (a, b) => [a.routeId, b.routeId].sort().join('|');

        nearby.forEach(other => {
            if (!seen.has(pairKey(pt, other))) {
                seen.add(pairKey(pt, other));

                if (other.routeId !== pt.routeId) {
                    const dist = geolib.getDistance(
                        { latitude: pt.coord[0], longitude: pt.coord[1] },
                        { latitude: other.coord[0], longitude: other.coord[1] },
                    );

                    if (dist <= TRANSFER_RADIUS) {
                        transfers.push({
                            from: {
                                routeId: pt.routeId,
                                coord: pt.coord,
                                index: pt.index, 
                                nodeId: `${pt.routeId}-${pt.index}`
                            },
                            to: {
                                routeId: other.routeId,
                                coord: other.coord,
                                index: other.index,
                                nodeId: `${other.routeId}-${other.index}`
                            },
                            distance: dist
                        });
                    }
                }
            }
        });
    });

    return transfers;
}

/**
 * Boilerplate
 * @param {*} _route 
 * @param {*} _coord 
 * @returns 
 */
function findClosestNodeIndex(_route, _coord) {
    let closest = 0; minDist = Infinity;
    _route.truncatedPath.forEach((pt, i) => {
        const d = geolib.getDistance(
            { latitude: pt[0], longitude: pt[1] },
            { latitude: _coord[0], longitude: _coord[1] },
        );
        if(d < minDist) {
            minDist = d;
            closest = i;
        }
    });
    return closest;
}

/**
 * Creates a route graph based on route paths and transfer points
 * @param {*} _routes 
 * @param {*} _transfers 
 * @returns 
 */
function createRouteGraph(_routes, _transfers) {
    const graph = {};

    const CONTINUE_REWARD = -100;
    _routes.forEach(r => {
        const coords = r.truncatedPath;
        for (let i = 0; i < coords.length - 1; i++) {
            const fromId = `${r.routeFile.routeName}-${i}`;
            const toId = `${r.routeFile.routeName}-${i + 1}`;            
            const segmentCost = geolib.getDistance(
                { latitude: coords[i][0], longitude: coords[i][1] },
                { latitude: coords[i+1][0], longitude: coords[i+1][1] },
            );

            const cost = segmentCost + CONTINUE_REWARD;

            if(!graph[fromId]) graph[fromId] = [];
            graph[fromId].push({to: toId, cost});
        }
    });

    const TRANSFER_PENALTY = 10000;
    _transfers.forEach(t => {
        const fromRoute = _routes.find(r => r.routeFile.routeName === t.from.routeId);
        const toRoute = _routes.find(r => r.routeFile.routeName === t.to.routeId);

        const fromIdx = findClosestNodeIndex(fromRoute, t.from.coord);
        const toIdx = findClosestNodeIndex(toRoute, t.to.coord);

        const fromId = `${t.from.routeId}-${fromIdx}`;
        const toId = `${t.to.routeId}-${toIdx}`;

        if(!graph[fromId]) graph[fromId] = [];
        if(!graph[toId]) graph[toId] = [];

        const transferCost = t.distance + TRANSFER_PENALTY;

        graph[fromId].push({to: toId, cost: transferCost});
        graph[toId].push({to: fromId, cost: transferCost});
    });

    return graph;
}


async function findBestPath(_startCoord, _endCoord, _graph, _transferPoints, _routes) {
    function findClosestRouteNodes(_coord, _routes, limit = 5) {
        const all = [];

        for(const r of _routes) {
            for(let i = 0; i < r.truncatedPath.length; i++) {
                const pt = r.truncatedPath[i];                        
                const distance = geolib.getDistance(
                    { latitude: _coord[0], longitude: _coord[1] },
                    { latitude: pt[0], longitude: pt[1] }
                );
                all.push({
                    routeId: r.routeFile.routeName,
                    index: i,
                    coord: pt,
                    distance,
                    nodeId: `${r.routeFile.routeName}-${i}`
                });
            }
        }

        return all.sort((a,b)=> a.distance - b.distance).slice(0, limit);
    }

    async function getWalkingGeometry(_fr, _to) {
        const coordStr = [[_fr[0], _fr[1]], [_to[0], _to[1]]]
            .map(([lat,lng]) => `${lng},${lat}`).join(';');
        const url = `http://localhost:5000/route/v1/foot/${coordStr}?overview=false`;

        const res = await fetch(url);
        const json = await res.json();

        return {
            dist: json.routes[0].distance,
            geometry: json.routes[0].geometry
        };
    }

    function runDijkstra(_graph, _start, _end) {
        const dist = {};
        const prev = {};
        const visited = new Set();
        const queue = new TinyQueue([{node: _start, cost: 0}], (a,b)=>a.cost-b.cost);

        for(const node in _graph) dist[node] = Infinity;
        dist[_start] = 0;

        while(queue.length) {
            const { node, cost } = queue.pop();
            if(visited.has(node)) continue;
            visited.add(node);

            for(const edge of _graph[node] || []) {
                const alt = dist[node] + edge.cost;
                if(alt < dist[edge.to]) {
                    dist[edge.to] = alt;
                    prev[edge.to] = node;
                    queue.push({ node: edge.to, cost: alt });
                }
            }
        }

        const path = [];
        let u = _end;
        while(u) {
            path.unshift(u);
            u = prev[u];
        }

        return { path, prev };
    }

    const startNode = 'START';
    const endNode = 'END';
    const clonedGraph = structuredClone(_graph);
    const WALK_TO_SAMPLE_LIMIT = 5;
    
    const startLinks = findClosestRouteNodes(_startCoord, _routes, WALK_TO_SAMPLE_LIMIT);
    clonedGraph[startNode] = [];

    const WALK_PENALTY = 300;
    for(const link of startLinks) {
        const {dist, geometry} = await getWalkingGeometry(_startCoord, link.coord);
        clonedGraph[startNode].push({
            to: link.nodeId,
            cost: dist + WALK_PENALTY,
            geometry: geometry
        });        
    }
    
    if (!clonedGraph[endNode]) clonedGraph[endNode] = [];    
    for(const link of findClosestRouteNodes(_endCoord, _routes, WALK_TO_SAMPLE_LIMIT)) {
        const {dist, geometry} = await getWalkingGeometry(link.coord, _endCoord);
        if(!clonedGraph[link.nodeId]) clonedGraph[link.nodeId] = [];
        clonedGraph[link.nodeId].push({
            to: endNode,
            cost: dist + WALK_PENALTY,
            geometry: geometry
        });
    }
    
    const { path, prev } = runDijkstra(clonedGraph, startNode, endNode);

    const coordinates = path.map(nodeId => {
        if (nodeId === startNode) return _startCoord;
        if (nodeId === endNode) return _endCoord;

        const [routeId, index] = nodeId.split('-');                
        const route = _routes.find(r => r.routeFile.routeName === routeId);
        
        return route.truncatedPath[parseInt(index)];
    });

    return {coordinates, path};
}