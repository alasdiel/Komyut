import { build } from "esbuild";

build({
  entryPoints: [
    "./src/login/login.ts",
    "./src/createUser/createUser.ts",
    "./src/helloWorld/helloWorld.ts",
    // add more as needed
  ],
  entryNames: "[dir]/[name]",
  outdir: "./dist",
  bundle: false,
  platform: "node",
  target: "node22",
  sourcemap: false,
  minify: false,
  logLevel: "info",
}).catch(() => process.exit(1));
