# 🛠️ Komyut Developer Toolkit

**Komyut** provides a CLI-based toolkit for developers to design jeepney routes, generate Route Packs, and compile route caches — essential for powering Komyut’s backend routing engine.

**IMPORTANT**: routebuilder requires a local instance of OSRM running at port `5000`.



## 🚀 Getting Started with `routebuilder`
Some sample routes are provided in the `sample_routes` folder.
### 📌 Creating a New Route File
You can create a new route file using the `new` command:  
```bash
routebuilder new -i <route-id> -n <route-name> -o <output-file>
```
- `-i`, `--id` signifies the route's identifier.
- `-n`, `--name` is the route's proper name (ex. Dacudao via Buhangin).
- `-o`, `--output` is the file to write the Route file after editing.

Example: `routebuilder new -i buhangin_01 -n "Dacudao via Buhangin" -o ./routes/buhangin_01.json`

### 📝 Editing an existing Route File
You can edit an existing route file using the `edit` command:
```bash
routebuilder edit -i <input-file>
```
- `-i`, `--input` is the route file to be edited.
- `-o`, `--output` **(OPTIONAL)** when this parameter is populated, instead of overwriting the file the changes will be saved to this new route file.

### 📰 Compiling routes into a Route Pack
Route Packs are files required by Komyut's route planning algorithm. It requires multiple route files of your choosing to be fed into it. You can create a Route Pack using the `compile` command:
```bash
routebuilder compile -i <input-directory> -o <output-directory>
```
- `-i`, `--input` the compiler will read all the `.route` files in the input directory
- `-o`, `--output` sets the destination directory to save the Route Pack and its associated caches

**OPTIONAL PARAMETERS:**
- `--truncationInterval <interval>` specifies the minimum separation (in meters) between waypoints when creating a route's truncated path. (Default value is 300m)
- `--mappingRadius <radius>` specifies maximum proximity (in meters) to allow a point in the full path to be associated with a point in the truncated path. (Default value is 1m)
- `--transferRadius <radius>` specifies the maximum walking distance (in meters) allowed when trasferring jeepneys (Default value is 500m)
- `--spatialTolerance <distance>` specifies the spatial tolerance (in meters) when performing r-tree proximity test for transfer points generation. (Default value is 700m)
- `--continueReward <score>` amount of graph edge weight deduction when maintaining the same jeepney throughout journey. (Default is -100)
- `--transferPenalty <score>` amount of graph edge weight penalty added to a transfer edge in the graph. (Default is 10000)

## 🛠️ Building routebuilder CLI
To build the `routebuilder` CLI locally, follow these steps:

### 1. Navigate to the toolkit directory
From the root of the Komyut project, enter the `improved-toolkit` folder:
```bash
cd backend/improved-toolkit
```

### 2. Install dependencies
Make sure you have Node.js and npm installed. Then, install the required packages:
```bash
npm install
```

### 3. Build the CLI
This will compile the CLI and package it for use:
```bash
npm run bundle:routebuilder
```
The built CLI binary will be available in the `bin/` folder.
**The following binaries will be compiled:**
- `routebuilder.exe` - Windows executable for 64-bit systems.