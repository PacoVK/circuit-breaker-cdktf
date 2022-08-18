const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const functionsDir = `lambdas`;
const outDir = `dist`;
const entryPoints = fs
  .readdirSync(path.join(__dirname, functionsDir))
  .map((entry) => `${functionsDir}/${entry}/index.ts`);

console.log("Building functions");

esbuild.build({
  entryPoints,
  bundle: true,
  outdir: path.join(__dirname, outDir),
  outbase: functionsDir,
  platform: "node",
  sourcemap: "inline",
  watch: process.argv.includes("--watch"),
});

console.log("Done");
