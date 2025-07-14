import { build } from "esbuild";

build({
  entryPoints: [
    "./findpath/findbestpath.ts",
    // add more as needed
  ],
  entryNames: "[name]/index",
  outdir: "dist",
  bundle: false,
  platform: "node",
  target: "node22",
  sourcemap: false,
  minify: false,
  logLevel: "info",
}).catch(() => process.exit(1));
