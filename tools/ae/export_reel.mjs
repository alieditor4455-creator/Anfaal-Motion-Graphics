// Export an After Effects package for a finished reel:
//   node tools/ae/export_reel.mjs reel4
// -> out/ae/<reel>/<reel>.json  +  media files  +  AnfaalBuilder.jsx  +  README.md  (and a .zip of it all)
import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const reel = process.argv[2] || "reel4";
// media files each reel needs: name inside the package -> source on this machine
const MEDIA = {
  reel4: {
    "speaker.mov": "out/an4_unused/person.mov",
    "wall.jpg": "public/an4/wall.jpg",
    "gold_chart.png": "public/an4/gold_chart.png",
    "nfp.png": "public/an4/nfp.png",
    "voice.wav": "public/an4/voice_cut.wav",
    "music.wav": "public/an4/music.wav",
    "sfx/": "public/an4/sfx/",
  },
};
if (!MEDIA[reel]) throw new Error(`no media map for ${reel}`);

const outDir = path.resolve("out/ae", reel);
fs.mkdirSync(outDir, { recursive: true });
const tmp = path.join(outDir, ".spec.cjs");
await build({ entryPoints: [`tools/ae/specs/${reel}.ts`], bundle: true, platform: "node", format: "cjs", outfile: tmp, logLevel: "error", jsx: "automatic", loader: { ".tsx": "tsx" } });
const { spec } = await import(tmp + "?" + Date.now()).then((m) => m.default ?? m);
fs.rmSync(tmp);
fs.writeFileSync(path.join(outDir, `${reel}.json`), JSON.stringify(spec, null, 1));

for (const [dst, src] of Object.entries(MEDIA[reel])) {
  const d = path.join(outDir, dst);
  if (dst.endsWith("/")) {
    fs.mkdirSync(d, { recursive: true });
    for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(d, f));
  } else {
    if (!fs.existsSync(src)) throw new Error(`missing media ${src}`);
    fs.rmSync(d, { force: true });
    try { fs.linkSync(src, d); } catch { fs.copyFileSync(src, d); }
  }
}
fs.copyFileSync("tools/ae/AnfaalBuilder.jsx", path.join(outDir, "AnfaalBuilder.jsx"));
fs.copyFileSync("tools/ae/README.md", path.join(outDir, "README.md"));
const zip = path.resolve("out/ae", `${reel}_AE_package.zip`);
fs.rmSync(zip, { force: true });
execFileSync("zip", ["-r", "-q", "-0", zip, "."], { cwd: outDir });
console.log("JSON:", path.join(outDir, `${reel}.json`));
console.log("ZIP :", zip, (fs.statSync(zip).size / 1e6).toFixed(0) + " MB");
