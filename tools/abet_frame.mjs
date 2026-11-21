import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
const [, , outDir, ...idx] = process.argv;
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
fs.mkdirSync(outDir, { recursive: true });
for (const i of idx) {
  const inputProps = { i: Number(i) };
  const composition = await selectComposition({ serveUrl, id: "AbetFrame", browserExecutable, inputProps });
  await renderStill({ serveUrl, composition, frame: 0, inputProps, output: `${outDir}/sf${i}.png`, browserExecutable });
}
console.log("ok");
