import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
const [, , id, outDir, scale, ...frames] = process.argv;
const browserExecutable = fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-headless-shell-linux64/chrome-headless-shell`).filter((p) => fs.existsSync(p))[0];
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: process.env.PUBLIC_DIR || undefined });
const chromiumOptions = { gl: process.env.GL || "swangle" };
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
fs.mkdirSync(outDir, { recursive: true });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: `${outDir}/f${String(f).padStart(4, "0")}.png`, scale: Number(scale), browserExecutable, chromiumOptions });
  process.stdout.write(f + " ");
}
