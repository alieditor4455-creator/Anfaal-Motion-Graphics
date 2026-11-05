// Runs AnfaalBuilder.jsx against a simulated After Effects object model (no AE needed) to catch bugs:
// bad property paths, broken expressions, missing media, wrong timings. usage: node tools/ae/test_builder.mjs out/ae/reel4/reel4.json
import fs from "fs";
import path from "path";
import vm from "vm";

const jsonPath = process.argv[2];
const spec = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const mediaDir = path.dirname(path.resolve(jsonPath));
const problems = [];
const stats = { layers: 0, keys: 0, expressions: 0, comps: 0, imports: 0, texts: 0 };

// ---- valid match names we rely on (anything else is flagged)
const OK = new Set(("ADBE Text Properties|ADBE Text Document|ADBE Text Animators|ADBE Text Animator|ADBE Text Animator Properties|ADBE Text Opacity|ADBE Text Selectors|ADBE Text Selector|ADBE Text Range Advanced|ADBE Text Range Units|ADBE Text Range Type2|ADBE Text Index Start|ADBE Text Index End|" +
  "ADBE Transform Group|ADBE Anchor Point|ADBE Position|ADBE Scale|ADBE Opacity|ADBE Rotate Z|ADBE Root Vectors Group|ADBE Vector Group|ADBE Vectors Group|ADBE Vector Shape - Rect|ADBE Vector Rect Size|ADBE Vector Rect Roundness|ADBE Vector Rect Position|" +
  "ADBE Vector Graphic - Fill|ADBE Vector Fill Color|ADBE Vector Fill Opacity|ADBE Vector Graphic - Stroke|ADBE Vector Stroke Color|ADBE Vector Stroke Width|ADBE Vector Stroke Opacity|ADBE Effect Parade|ADBE Drop Shadow|ADBE Drop Shadow-0001|ADBE Drop Shadow-0002|ADBE Drop Shadow-0003|ADBE Drop Shadow-0004|ADBE Drop Shadow-0005|" +
  "ADBE Gaussian Blur 2|ADBE Gaussian Blur 2-0001|ADBE Gaussian Blur 2-0003|ADBE Noise|ADBE Noise-0001|ADBE Mask Parade|ADBE Mask Atom|ADBE Mask Shape|ADBE Mask Feather|ADBE Audio Group|ADBE Audio Levels").split("|"));

function Prop(name, owner) {
  if (!OK.has(name)) problems.push(`unknown property match name: "${name}"`);
  const p = { name, matchName: name, keys: [], numKeys: 0, _v: name === "ADBE Text Document" ? new TextDocument("") : [0, 0], _expr: "", children: {}, inverted: false, propertyValueType: 1 };
  Object.defineProperty(p, "value", { get: () => p._v });
  Object.defineProperty(p, "expression", {
    get: () => p._expr,
    set: (s) => { stats.expressions++; p._expr = s; try { new Function("time", "linear", "sourceRectAtTime", `var thisLayer={};${s}`); } catch (e) { problems.push(`bad expression on ${name}: ${e.message}\n   ${s}`); } },
  });
  p.property = (n) => (p.children[n] ||= Prop(n, p));
  p.addProperty = (n) => { const c = Prop(n, p); p.children[n + "#" + Math.random()] = c; return c; };
  p.setValue = (v) => { if (v === undefined || (typeof v === "number" && !isFinite(v))) problems.push(`bad value on ${name}: ${v}`); p._v = v; };
  p.setValueAtTime = (t, v) => { if (!isFinite(t)) problems.push(`bad key time on ${name}`); if (Array.isArray(v) && v.some((x) => !isFinite(x))) problems.push(`bad key value on ${name}`); p.keys.push([t, v]); p.numKeys = p.keys.length; stats.keys++; };
  p.setTemporalEaseAtKey = (k) => { if (k < 1 || k > p.numKeys) problems.push(`ease on missing key ${k} of ${name}`); };
  return p;
}
const INSTALLED = new Set((process.env.FONTS ?? "Anton-Regular,Inter-Bold,Inter-SemiBold,JetBrainsMono-Bold").split(",").filter(Boolean));
class TextDocument {
  constructor(t) { this.text = t; this._font = "ArialMT"; this.fontSize = 48; }
  get font() { return this._font; }
  set font(v) { if (INSTALLED.has(v)) this._font = v; }   // AE silently ignores unknown fonts
  set allCaps(v) { throw new Error("allCaps is read-only in AE 2026"); }
  resetCharStyle() {}
  characterRange(a, b) { if (a < 0 || b > this.text.length || a >= b) problems.push(`characterRange ${a}-${b} outside "${this.text}"`); return {}; }
}
function Layer(comp, kind, name) {
  stats.layers++;
  const L = Prop("ADBE Transform Group"); // root container
  delete L.setValue;
  Object.assign(L, { name, kind, inPoint: 0, outPoint: comp.duration, startTime: 0, adjustmentLayer: false, audioEnabled: true, hasAudio: kind === "av" });
  L.property = (n) => (L.children[n] ||= Prop(n, L));
  L.moveAfter = () => {};
  L.sourceRectAtTime = () => {
    const td = L.children["ADBE Text Properties"]?.children["ADBE Text Document"]?._v;
    const w = td ? String(td.text).length * (td.fontSize || 48) * (td._font === "Anton-Regular" ? 0.42 : 0.6) : 400;
    return { left: -w / 2, top: -40, width: w, height: 60 };
  };
  comp._layers.push(L);
  return L;
}
function Comp(name, w, h, pa, dur, fps) {
  stats.comps++;
  if (!(dur > 0)) problems.push(`comp "${name}" has bad duration ${dur}`);
  const c = { name, width: w, height: h, duration: dur, frameRate: fps, _layers: [], openInViewer() {}, parentFolder: null };
  c.layers = {
    addText: (s) => { stats.texts++; const L = Layer(c, "text", s); L.property("ADBE Text Properties").property("ADBE Text Document")._v = new TextDocument(s); return L; },
    addShape: () => Layer(c, "shape", "shape"),
    addSolid: (col, n, W, H, pa2, d) => { if (!(d > 0)) problems.push(`solid "${n}" bad duration ${d}`); return Layer(c, "solid", n); },
    add: (item) => Layer(c, item.isComp ? "comp" : "av", item.name),
  };
  return c;
}
const sandbox = {
  console,
  $: { global: { __ANFAAL_TEST__: true } },
  JSON,
  KeyframeEase: function (a, b) { this.speed = a; this.influence = b; },
  Shape: function () {},
  PropertyValueType: { TwoD_SPATIAL: 6, ThreeD_SPATIAL: 7 },
  ParagraphJustification: { CENTER_JUSTIFY: 2 },
  ImportOptions: function (f) { this.file = f; },
  Panel: function () {},
  Window: function () {},
  alert: (m) => console.log("ALERT:", m),
  File: function (p) { this.fsName = p; this.exists = fs.existsSync(p); if (!this.exists) problems.push(`media not found: ${p}`); },
  app: {
    project: {
      items: {
        addFolder: (n) => ({ name: n, parentFolder: null }),
        addComp: (n, w, h, pa, d, fps) => Object.assign(Comp(n, w, h, pa, d, fps), { isComp: true }),
      },
      importFile: (io) => { stats.imports++; return { name: path.basename(io.file.fsName), width: 1080, height: 1920, hasAudio: /\.(mov|wav)$/.test(io.file.fsName), parentFolder: null }; },
    },
    beginUndoGroup() {}, endUndoGroup() {}, newProject() {},
    fonts: {
      getFontsByFamilyNameAndStyleName: (fam, sty) => {
        const ps = { "Anton Regular": "Anton-Regular", "Inter Bold": "Inter-Bold", "Inter SemiBold": "Inter-SemiBold", "JetBrains Mono Bold": "JetBrainsMono-Bold" }[fam + " " + sty];
        return ps && INSTALLED.has(ps) ? [{ postScriptName: ps, familyName: fam, styleName: sty }] : [];
      },
      allFonts: [],
    },
  },
};
sandbox.$.global = sandbox.$.global;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("./AnfaalBuilder.jsx", import.meta.url), "utf8"), sandbox, { filename: "AnfaalBuilder.jsx" });
const build = sandbox.$.global.__anfaalBuild;
if (typeof build !== "function") throw new Error("builder did not expose __anfaalBuild");

// --- spec sanity checks
for (const k of spec.keywords) if (!(k.to > k.t)) problems.push(`keyword "${k.key}" ends before it starts`);
for (const c of spec.captions) { if (!(c.t1 > c.t0)) problems.push(`caption @${c.t0} has no length`); if (c.t1 > spec.duration + 0.01) problems.push(`caption @${c.t0} runs past the end`); }
for (const f of spec.fullscreens) if (!(f.to > f.from)) problems.push(`full screen ${f.name} bad window`);
for (const a of spec.audio) if (a.at > spec.duration) problems.push(`audio ${a.file} starts after the end`);

build(spec, { fsName: mediaDir });
// the builder's own report (warnings collected while building)
const fontNotes = [];
for (const r of sandbox.$.global.__anfaalReport()) (r.startsWith("Font not found") ? fontNotes : problems).push("builder: " + r);
if (fontNotes.length) console.log("font notes:\n- " + fontNotes.join("\n- "));
console.log(`comps ${stats.comps}, layers ${stats.layers}, texts ${stats.texts}, keyframes ${stats.keys}, expressions ${stats.expressions}, imports ${stats.imports}`);
if (problems.length) { console.log(`\n${problems.length} PROBLEM(S):\n- ` + [...new Set(problems)].join("\n- ")); process.exit(1); }
console.log("ALL CHECKS PASSED");
