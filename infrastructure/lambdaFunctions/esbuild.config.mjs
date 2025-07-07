import { build } from "esbuild";
import path from "path";

build({
  packages: 'external',
  entryPoints: [
    "./src/helloWorld/helloWorld.ts",
    "./src/confirmSignup/confirmSignup.ts",
    "./src/signup/signup.ts",
    "./src/signin/signin.ts",
    // add more as needed
  ],
  entryNames: "[dir]/index",
  outdir: path.join("./dist"),
  bundle: false,
  platform: "node",
  target: "node18",
  format: "cjs",
  sourcemap: false,
  minify: false,
  logLevel: "info",
  
}).catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});