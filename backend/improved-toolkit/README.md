# 🛠️ Komyut Developer Toolkit

**Komyut** provides a CLI-based toolkit for developers to design jeepney routes, generate Route Packs, and compile route caches — essential for powering Komyut’s backend routing engine.

**IMPORTANT**: routebuilder requires a local instance of OSRM running at port `5000`.

## 🚀 Getting Started with `routebuilder`
### 📌 Creating a New Route File
You can create a new route file using the `new` command:  
```bash
routebuilder new -i <route-id> -n <route-name> -o <output-file>
```
- `-i`, `--id` signifies the route's identifier.
- `-n`, `--name` is the route's proper name (ex. Dacudao via Buhangin).
- `-o`, `--output` is the file to write the Route file after editing.

Example: `routebuilder new -i buhangin_01 -n "Dacudao via Buhangin" -o ./routes/buhangin_01.json`

Some sample routes are provided in the `sample_routes` folder.

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
npm run pkg
```
The built CLI binary will be available in the `dist/` folder.
**The following binaries will be compiled:**
- `routebuilder.exe` - Windows executable for 64-bit systems.