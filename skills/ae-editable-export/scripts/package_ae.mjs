#!/usr/bin/env node
// Package ANY finished video / motion graphic as an editable After Effects project.
//   node package_ae.mjs <spec.json> <outParentDir>
// The spec is the JSON format in references/schema.md plus a "media" map: { "<name>": "<source path on disk>" }.
// Output (one folder, all assets inside):
//   <outParentDir>/<Project Name>/
//       project.json          <- load this in AnfaalBuilder (file refs point into assets/)
//       AnfaalBuilder.jsx      <- the After Effects script
//       README.md              <- install + use
//       assets/…               <- every image, clip, voice, music, SFX
// Also writes <Project Name>.zip next to the folder (and a no-video zip if the clips push it past 400 MB).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const [specPath, outParent = "."] = process.argv.slice(2);
if (!specPath) { console.error("usage: node package_ae.mjs <spec.json> <outParentDir>"); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const media = spec.media || {};
delete spec.media;

const safeName = String(spec.name || "Editable project").replace(/[^\w .()-]+/g, "").trim() || "Editable project";
const dir = path.resolve(outParent, safeName);
const assets = path.join(dir, "assets");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(assets, { recursive: true });

// copy media (folders are copied recursively), then point every file reference at assets/
const copied = new Set();
for (const [name, src] of Object.entries(media)) {
  if (!fs.existsSync(src)) throw new Error(`media "${name}": source not found: ${src}`);
  const dst = path.join(assets, name);
  if (fs.statSync(src).isDirectory()) fs.cpSync(src, dst, { recursive: true });
  else { fs.mkdirSync(path.dirname(dst), { recursive: true }); try { fs.linkSync(src, dst); } catch { fs.copyFileSync(src, dst); } }
  copied.add(name.replace(/\/$/, ""));
}
const fix = (rel) => {
  if (!rel || rel.startsWith("assets/")) return rel;
  const top = rel.split("/")[0];
  if (!copied.has(rel) && !copied.has(top)) throw new Error(`spec references "${rel}" but it is not in the media map`);
  return "assets/" + rel;
};
if (spec.background?.file) spec.background.file = fix(spec.background.file);
if (spec.speaker?.file) spec.speaker.file = fix(spec.speaker.file);
for (const fs_ of spec.fullscreens || []) { if (fs_.bgFile) fs_.bgFile = fix(fs_.bgFile); for (const it of fs_.items || []) if (it.file) it.file = fix(it.file); }
for (const it of spec.onCamera || []) if (it.file) it.file = fix(it.file);
for (const a of spec.audio || []) a.file = fix(a.file);

fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(spec, null, 1));
fs.copyFileSync(path.join(here, "AnfaalBuilder.jsx"), path.join(dir, "AnfaalBuilder.jsx"));
fs.copyFileSync(path.join(here, "..", "references", "install.md"), path.join(dir, "README.md"));

// zip (store only: media is already compressed)
const zip = path.resolve(outParent, safeName + ".zip");
fs.rmSync(zip, { force: true });
// standard Deflate (macOS Archive Utility fails with "Error 94" on large stored entries)
execFileSync("zip", ["-r", "-q", "-6", zip, safeName, "-x", "*/.*"], { cwd: path.resolve(outParent) });
const mb = fs.statSync(zip).size / 1048576;
console.log(`FOLDER: ${dir}`);
console.log(`ZIP   : ${zip} (${mb.toFixed(0)} MB)`);
if (mb > 400) {
  const lite = path.resolve(outParent, safeName + " (no video).zip");
  fs.rmSync(lite, { force: true });
  execFileSync("zip", ["-r", "-q", lite, safeName, "-x", "*.mov", "*.mp4"], { cwd: path.resolve(outParent) });
  console.error(`TOO BIG for one upload (${mb.toFixed(0)} MB > 400 MB): trim the speaker clip to the used segments and raise -qscale:v (see SKILL.md step 6), then package again. (${lite} written only for reference.)`);
  process.exitCode = 2;
}
