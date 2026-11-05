// After Effects spec for reel 4 (educational NFP). Timeline data comes straight from the Remotion reel,
// so captions / keywords / cuts / transitions always match the rendered video. Full-screen scene layouts
// are described here as editable items (images, titles, cards, counters, needles).
import { CAPS, CUT, FS, HOT, R4_DURATION, SPEECH } from "../../../src/Anfaal4/Reel";
import type { ReelSpec } from "../types";

const D = CUT.b - CUT.a;
/** source time -> output time (the fumble between CUT.a and CUT.b is removed) */
const out = (t: number) => (t < CUT.a ? t : t - D);
/** end times: something that ends exactly at the cut stays before it */
const outEnd = (t: number) => (t <= CUT.a ? t : Math.max(CUT.a, t - D));
const cutAway = (t: number) => t >= CUT.a && t < CUT.b;
const r2 = (n: number) => Math.round(n * 1000) / 1000;

const captions = SPEECH.flatMap(([a, b, text]) => {
  const ws = text.split(" ");
  const total = ws.reduce((n, w) => n + w.length + 1, 0);
  let acc = a;
  const timed = ws.map((w) => {
    const d = ((w.length + 1) / total) * (b - a);
    const o = { w, t0: acc };
    acc += d;
    return o;
  });
  const lines: { t0: number; t1: number; words: { w: string; t0: number; hot?: string }[] }[] = [];
  const nLines = Math.max(1, Math.ceil(timed.length / 4));
  const per = Math.ceil(timed.length / nLines);
  for (let i = 0; i < timed.length; i += per) {
    const chunk = timed.slice(i, i + per);
    const end = i + per < timed.length ? timed[i + per].t0 : b + 0.35;
    lines.push({
      t0: chunk[0].t0,
      t1: end,
      words: chunk.map((x) => ({ w: x.w, t0: x.t0, hot: HOT.has(x.w.replace(/[.,?]/g, "").toLowerCase()) ? "hue" : undefined })),
    });
  }
  return lines;
})
  .filter((l) => !cutAway(l.t0) && out(l.t0) < R4_DURATION)
  .map((l) => {
    const inFS = Object.values(FS).some((w) => l.t0 >= w.from && l.t0 < w.to);
    return { t0: r2(out(l.t0)), t1: r2(Math.min(R4_DURATION, outEnd(l.t1))), y: inFS ? 1515 : 1535, words: l.words.map((w) => ({ ...w, t0: r2(out(w.t0)) })) };
  });

const keywords = CAPS.filter((c) => !cutAway(c.t) && out(c.t) < R4_DURATION).map((c) => ({ t: r2(out(c.t)), to: r2(Math.min(R4_DURATION, outEnd(c.to))), lead: c.lead, key: c.key, tone: c.tone ?? "hue", y: 235, scale: 0.56 }));

const sfx: [number, string, number][] = [
  [0.0, "smooth_cammera_shutter", -9], [5.85, "camera_shutter", -6], [11.28, "smooth_cammera_shutter", -8], [18.74, "camera_shutter", -6],
  [24.8, "little_bit_hard_cammera_shutter", -6], [31.5, "smooth_cammera_shutter", -8], [33.65, "little_bit_hard_cammera_shutter", -6],
  [36.53, "smooth_cammera_shutter", -8], [31.35, "premium_riser", -7.5], [29.0, "pop", -14], [6.6, "pop", -15], [58.6, "pop", -13],
];

export const spec: ReelSpec = {
  name: "Anfaal Reel 4 — NFP (editable)",
  width: 1080,
  height: 1920,
  fps: 30,
  duration: R4_DURATION,
  palette: { hue: "#2FD27E", gold: "#E8C77F", red: "#FF5F66", white: "#F3F7F4", soft: "#BFC8C2", bg: "#030A06", glass: "#0E2A1C", pill: "#06120C" },
  fonts: { head: { family: "Anton", style: "Regular", ps: "Anton-Regular" }, body: { family: "Inter", style: "Bold", ps: "Inter-Bold" }, label: { family: "Inter", style: "SemiBold", ps: "Inter-SemiBold" }, mono: { family: "JetBrains Mono", style: "Bold", ps: "JetBrainsMono-Bold" } },
  background: { file: "wall.jpg", from: [540, 960], to: [540, 700], opacity: 90 },
  speaker: {
    file: "speaker.mov",
    anchorY: 900,
    openZoom: true,
    segments: [
      { at: 0, srcIn: 0, srcOut: CUT.a },
      { at: CUT.a, srcIn: CUT.b, srcOut: CUT.b + (R4_DURATION - CUT.a), punch: true },
    ],
  },
  keywords,
  onCamera: [
    { type: "label", text: "XAUUSD · SIRF 2 DIN MEIN", x: 540, y: 225, at: 0.3, out: 5.95 },
    { type: "counter", from: 0, to: 240, plus: true, unit: "$", x: 540, y: 300, size: 120, at: 0.3, out: 5.95, countAt: 0.55, dur: 1.7 },
    { type: "card", text: "CONTACT KARO", sub: "BIO MEIN NUMBER", x: 540, y: 290, w: 620, h: 130, at: out(41.85), out: outEnd(47.95) },
    { type: "button", text: "JOIN COMMUNITY ↑", sub: "LINK UPAR HAI", x: 540, y: 290, at: out(58.45), out: outEnd(61.29) },
    { type: "button", text: "FOLLOW KARO", x: 540, y: 270, at: out(61.29), out: R4_DURATION },
  ],
  fullscreens: [
    {
      name: "Real chart",
      from: FS.chart.from,
      to: FS.chart.to,
      bgFile: "wall.jpg",
      items: [
        { type: "image", file: "gold_chart.png", x: 540, y: 640, w: 960, at: 0.1 },
        { type: "pill", text: "+$240 · 2 DIN", x: 700, y: 430, size: 40, at: 1.8 },
        { type: "label", text: "GOLD FUTURES · 5 MIN · REAL CHART", x: 540, y: 1010, at: 0.3 },
        { type: "title", lead: "do din mein", key: "tez recovery", y: 1110, at: 6.01 - FS.chart.from, out: 8.69 - FS.chart.from },
        { type: "title", lead: "ab kya", key: "move aayega?", tone: "white", y: 1110, at: 8.69 - FS.chart.from, out: FS.chart.to - FS.chart.from },
      ],
    },
    {
      name: "NFP calendar",
      from: FS.nfp.from,
      to: FS.nfp.to,
      bgFile: "wall.jpg",
      items: [
        { type: "card", text: "NONFARM PAYROLLS", sub: "KAL · 6 NOV · 13:30 UTC", x: 540, y: 420, w: 900, h: 160, at: 0.1 },
        { type: "card", text: "65K", sub: "CONSENSUS", x: 250, y: 680, w: 280, h: 150, at: 0.7 },
        { type: "card", text: "29K", sub: "PREVIOUS", x: 540, y: 680, w: 280, h: 150, at: 0.95 },
        { type: "card", text: "90K", sub: "EXPECTED (SEP)", x: 830, y: 680, w: 280, h: 150, at: 1.2 },
        { type: "image", file: "nfp.png", x: 540, y: 880, w: 520, at: 1.5, opacity: 85 },
        { type: "title", lead: "kal ke", key: "NFP mein", y: 1100, at: 0.02, out: 13.46 - FS.nfp.from },
        { type: "title", lead: "is baar mujhe", key: "kuch khaas nahi", tone: "white", y: 1100, at: 13.46 - FS.nfp.from, out: FS.nfp.to - FS.nfp.from },
      ],
    },
    {
      name: "Analysis gauge",
      from: FS.view.from,
      to: FS.view.to,
      bgFile: "wall.jpg",
      items: [
        { type: "rect", name: "Gauge card", w: 900, h: 620, radius: 40, x: 540, y: 610, fill: "glass", fillOpacity: 70, stroke: "hue", strokeOpacity: 25, at: 0.05 },
        { type: "label", text: "MERA NFP ANALYSIS", x: 540, y: 350, at: 0.2 },
        { type: "label", text: "NEGATIVE", x: 290, y: 800, color: "red", at: 0.3 },
        { type: "label", text: "NEUTRAL", x: 540, y: 800, at: 0.3 },
        { type: "label", text: "POSITIVE", x: 790, y: 800, color: "hue", at: 0.3 },
        { type: "needle", x: 540, y: 720, len: 270, glide: false, keys: [[0.35, -80], [27.2 - FS.view.from, -10], [29.0 - FS.view.from, 52]] },
        { type: "button", text: "NFP · POSITIVE EXPECTED", x: 540, y: 870, size: 38, at: 29.0 - FS.view.from },
        { type: "title", lead: "ab main", key: "batata hoon", tone: "white", y: 1100, at: 0.05, out: 27.14 - FS.view.from },
        { type: "title", lead: "mere analysis se", key: "NFP positive", y: 1100, at: 27.14 - FS.view.from, out: FS.view.to - FS.view.from },
      ],
    },
    {
      name: "Timing twist",
      from: FS.time.from,
      to: FS.time.to,
      bgFile: "wall.jpg",
      items: [
        { type: "rect", name: "Clock face", w: 640, h: 640, radius: 320, x: 540, y: 610, fill: "glass", fillOpacity: 70, stroke: "hue", strokeOpacity: 30, at: 0.05 },
        { type: "needle", name: "Minute hand", x: 540, y: 610, len: 230, glide: false, keys: [[0.4, 0], [1.6, -360]] },
        { type: "needle", name: "Hour hand", x: 540, y: 610, len: 150, wid: 14, color: "hue", glide: false, keys: [[0.4, 180], [1.6, 150]] },
        { type: "label", text: "NFP · 6 NOV · 13:30 UTC", x: 540, y: 970, color: "gold", at: 0.6 },
        { type: "title", lead: "NFP aayega", key: "1 ghanta pehle", tone: "gold", y: 1060, at: 0.05, out: FS.time.to - FS.time.from },
      ],
    },
  ],
  captions,
  transitions: Object.values(FS).flatMap((w) => [w.from, w.to]).filter((x, i, a) => a.indexOf(x) === i),
  endFade: 0.5,
  grain: true,
  audio: [
    { role: "Voice", file: "voice.wav", at: 0 },
    { role: "Music", file: "music.wav", at: 0 },
    ...sfx.filter(([t]) => !cutAway(t) && out(t) < R4_DURATION).map(([t, n, g]) => ({ role: "SFX", file: `sfx/${n}.wav`, at: r2(out(t)), gain: g })),
  ],
};
