// Render laptop screen textures -> public/abet/screens/*.png (2x for crispness)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
fs.mkdirSync("public/abet/screens", { recursive: true });
for (const s of ["dash", "dep1", "success"]) {
  const inputProps = { s };
  const composition = await selectComposition({ serveUrl, id: "AbetScreen", browserExecutable, inputProps });
  await renderStill({ serveUrl, composition, frame: 0, inputProps, output: `public/abet/screens/${s}.png`, scale: 1.5, browserExecutable });
  console.log(s);
}
