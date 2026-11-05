// Single-pass render (no chunks): one bundle, one browser, muted video; audio is mixed with ffmpeg after.
// usage: node tools/render_one.mjs <CompositionId> <out.mp4> [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs";
const [, , id, out, conc = "3"] = process.argv;
const browserExecutable = fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-headless-shell-linux64/chrome-headless-shell`)[0];
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: process.env.PUBLIC_DIR || undefined });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
let last = -10;
const t0 = Date.now();
await renderMedia({
  serveUrl, composition, codec: "h264", crf: 16, muted: true, outputLocation: out, browserExecutable,
  concurrency: Number(conc), frameRange: process.env.RANGE ? process.env.RANGE.split("-").map(Number) : undefined, logLevel: process.env.LOGLEVEL || "warn", timeoutInMilliseconds: Number(process.env.TMO || 180000), offthreadVideoCacheSizeInBytes: 1.5e9,
  onProgress: ({ progress }) => { const pc = Math.floor(progress * 100); if (pc >= last + 25) { last = pc; console.log(`render ${pc}% ${Math.round((Date.now() - t0) / 1000)}s`); } },
});
console.log("VIDEO_DONE", Math.round((Date.now() - t0) / 1000), "s");
