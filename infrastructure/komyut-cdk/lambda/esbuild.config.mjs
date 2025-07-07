import { build } from "esbuild";

build({
  entryPoints: [
    "./login/login.ts",
    "./createUser/createUser.ts",
    "./confirmSignup/confirmSignup.ts",
    "./routepackloader/loader.ts",
    "./findpath/test.ts",
    "./signin/signin.ts",
    "./signup/signup.ts",
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
