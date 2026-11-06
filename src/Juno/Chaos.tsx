// Juno — "60-hour weeks, data entry, all hands-on deck chaos." (Dave, 4.46s take + 0.85s calm hold)
// Juno Motion Graphics foundation (Juno Black, Dave in the green window, two centred lines, Juno Green, no red),
// new scene language for this clip:
//  60-hour weeks : a Mon–Sun week grid draws on behind Dave; Mon–Fri fill with 12 green hour blocks each (= 60).
//  data entry    : the blocks cool into spreadsheet cells; a caret types tax fields into them, cell by cell.
//  chaos         : the cells lift off and swirl around the window in a slow, smooth storm.
//  strike        : green strike through "chaos"; every tile glides home into one clean, calm grid. Hold.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const CHAOS_FPS = 60;
export const CHAOS_FRAMES = Math.round(5.3 * CHAOS_FPS);
const SRC_FPS = 24, SRC_N = 107;

[["Outfit", 400, "Outfit-400"], ["Outfit", 500, "Outfit-500"], ["Outfit", 700, "Outfit-700"], ["Caveat", 500, "Caveat-500"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const vis = (t: number, i0: number, i1: number, o0: number, o1: number, e = GLIDE) => pr(t, i0, i1, e) * (1 - pr(t, o0, o1, SWAP));

const T = { bg: "#1E1E1E", green: "#1CE49B", ink: "#F8F9FA", soft: "rgba(248,249,250,.78)", grid: "rgba(248,249,250,.03)" };

const W = { x: 330, y: 760, w: 420, h: 510 };
const CROP = { x: 90, y: 430, w: 900, h: 1093 };
const C = { x: W.x + W.w / 2, y: W.y + W.h / 2 };

// week grid: 7 days x 12 hours
const COLS = 7, ROWS = 12, GX0 = 70, PX = 134, CW = 118, GY0 = 650, PY = 88, CH = 72;
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
type Cell = { c: number; r: number; x: number; y: number; visible: boolean; order: number; filled: boolean };
const CELLS: Cell[] = [];
for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
  const x = GX0 + c * PX + (PX - CW) / 2, y = GY0 + r * PY;
  const hidden = x + CW > W.x - 12 && x < W.x + W.w + 12 && y + CH > W.y - 12 && y < W.y + W.h + 12;
  CELLS.push({ c, r, x, y, visible: !hidden, order: c * ROWS + (ROWS - 1 - r), filled: c < 5 });
}
const VIS = CELLS.filter((k) => k.visible);
const TYPE_ORDER = [...VIS].sort((a, b) => a.r - b.r || a.c - b.c).filter((_, n) => n % 3 !== 2).slice(0, 22);
const VALUES = ["W-2", "1099", "Box 14", "$4,210", "K-1", "12,880", "Box 1", "$918", "1040", "Sch C", "3,402", "1099-B",
  "$7,115", "Box 12", "W-2G", "$260", "K-1", "8,940", "1098", "$1,507", "Box 3", "Sch E"];
const TY0 = 1.55, TSTEP = 0.04, TDUR = 0.14;

const stormPos = (k: Cell, i: number, t: number) => {
  const gx = k.x + CW / 2, gy = k.y + CH / 2;
  const th0 = Math.atan2(gy - C.y, gx - C.x);
  const rr = 360 + (i % 5) * 42, w = 0.9 + 0.25 * (i % 3);
  const th = th0 + w * Math.max(0, t - 2.65);
  return { x: C.x + rr * 1.12 * Math.cos(th), y: C.y + rr * 0.86 * Math.sin(th), rot: (i % 2 ? 1 : -1) * (14 + (i % 4) * 6) + 8 * Math.sin(1.3 * t + i) };
};

const ROLL = 0.6;
const Roll: React.FC<{ t: number; items: [number, React.ReactNode][]; cls: React.CSSProperties; h: number }> = ({ t, items, cls, h }) => {
  let k = -1; items.forEach(([s], i) => { if (t >= s) k = i; });
  const p = k >= 0 ? pr(t, items[k][0], items[k][0] + ROLL, k === 0 ? GLIDE : SWAP) : 0;
  const prev = k > 0 ? items[k - 1][1] : null; const cur = k >= 0 ? items[k][1] : null;
  const row = (node: React.ReactNode, y: number, op: number, blur: number) => node == null ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${y}%)`, opacity: op, filter: `blur(${blur}px)` }}>{node}</div>);
  return <div style={{ position: "relative", height: h, overflow: "hidden", ...cls }}>{row(prev, -90 * p, 1 - p, 4 * p)}{row(cur, 90 * (1 - p), p, 4 * (1 - p))}</div>;
};

export const JunoChaos: React.FC = () => {
  const f = useCurrentFrame(); const t = f / CHAOS_FPS;
  const k = Math.max(W.w / CROP.w, W.h / CROP.h);
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const imgL = -CROP.x * k + (W.w - CROP.w * k) / 2, imgT = -CROP.y * k + (W.h - CROP.h * k) / 2;
  const intro = pr(t, 0, 0.7);
  const drift = 1 + 0.025 * (t / 5.3);

  const gridDraw = pr(t, 0.1, 0.75, DRAW);
  const stormV = vis(t, 2.65, 3.2, 4.45, 5.0);
  const gridLines = gridDraw * (1 - 0.65 * stormV);
  const cool = pr(t, 1.45, 1.85, SWAP);
  const counter = vis(t, 0.35, 0.6, 1.45, 1.75);
  const fillProg = pr(t, 0.35, 1.4, Easing.inOut(Easing.sin)) * 60;
  const note = vis(t, 0.55, 0.95, 1.35, 1.6);
  const calm = pr(t, 4.6, 5.2, GLIDE);

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 64, letterSpacing: "-0.02em", lineHeight: "84px", color: T.soft };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 124, letterSpacing: "-0.045em", lineHeight: "140px", color: T.ink };
  const G = (s: string) => <>{s}<span style={{ color: T.green }}>.</span></>;
  const strike = pr(t, 4.45, 4.8), dim = pr(t, 4.5, 4.95);
  const chaosWord = (
    <span style={{ position: "relative", display: "inline-block", color: `color-mix(in srgb, ${T.ink} ${100 - dim * 62}%, transparent)` }}>
      chaos
      <span style={{ position: "absolute", left: "-4%", top: "54%", height: 14, marginTop: -7, width: `${108 * strike}%`, background: T.green, borderRadius: 99, boxShadow: "0 0 24px rgba(28,228,155,.5)" }} />
    </span>);

  const caretOp = (0.6 + 0.4 * Math.cos(t * Math.PI * 2 * 2.2)) * vis(t, TY0, TY0 + 0.1, 2.45, 2.65);

  const tiles = VIS.map((cell, i) => {
    const fillIn = cell.filled ? Math.max(0, Math.min(1, (fillProg - cell.order) / 2.5)) : 0;
    const fillEase = GLIDE(fillIn);
    const ti = TYPE_ORDER.indexOf(cell);
    const typeP = ti >= 0 ? pr(t, TY0 + ti * TSTEP, TY0 + ti * TSTEP + TDUR, Easing.linear) : 0;
    const label = ti >= 0 ? VALUES[ti % VALUES.length] : "";
    const lift = pr(t, 2.65 + (i % 12) * 0.035, 3.45 + (i % 12) * 0.035, MOVE);
    const home = pr(t, 4.45 + (i % 9) * 0.025, 5.15 + (i % 9) * 0.025, MOVE);
    const sp = stormPos(cell, i, t);
    const sx = mix(cell.x + CW / 2, sp.x, lift), sy = mix(cell.y + CH / 2, sp.y, lift);
    const x = mix(sx, cell.x + CW / 2, home), y = mix(sy, cell.y + CH / 2, home);
    const rot = mix(sp.rot * lift, 0, home), sc = mix(mix(1, 0.62, lift), 1, home);
    const blockA = fillEase * mix(0.92, 0.1, cool);
    const fillA = mix(blockA, 0.14, home);
    const strokeA = mix(0.5 * Math.max(cool, gridDraw * 0.3), 0.6, home) * (cell.filled ? 1 : 0.7);
    const labelA = typeP > 0 ? 1 - home : 0;
    const caret = ti >= 0 && typeP > 0 && typeP < 1;
    return { x, y, rot, sc, fillA, strokeA, label: label.slice(0, Math.ceil(label.length * typeP)), labelA, caret };
  });

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw2/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${T.grid} 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />

      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: `${C.x}px ${C.y}px` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g opacity={gridLines}>
            {[...Array(COLS + 1)].map((_, c) => { const x = GX0 + c * PX; const y1 = GY0 - 14, y2 = GY0 - 14 + (ROWS * PY + 8) * gridDraw;
              return <line key={`v${c}`} x1={x} y1={y1} x2={x} y2={y2} stroke="rgba(248,249,250,.1)" strokeWidth={1.5} />; })}
            {[0, ROWS].map((r) => { const y = GY0 - 14 + r * PY + (r ? 8 : 0); return <line key={`h${r}`} x1={GX0} y1={y} x2={GX0 + COLS * PX * gridDraw} y2={y} stroke="rgba(248,249,250,.1)" strokeWidth={1.5} />; })}
          </g>
          {DAYS.map((d, c) => <text key={d} x={GX0 + c * PX + PX / 2} y={GY0 - 34} textAnchor="middle" fontFamily="Outfit" fontWeight={400} fontSize={22} letterSpacing={3}
            fill={c < 5 ? T.green : "rgba(248,249,250,.55)"} opacity={pr(t, 0.2 + c * 0.04, 0.6 + c * 0.04) * (1 - 0.6 * stormV)}>{d}</text>)}
        </svg>

        {tiles.map(({ x, y, rot, sc, fillA, strokeA, label, labelA, caret }, i) => (
          <div key={i} style={{ position: "absolute", left: x - CW / 2, top: y - CH / 2, width: CW, height: CH, borderRadius: 10,
            transform: `rotate(${rot}deg) scale(${sc})`, background: `rgba(28,228,155,${fillA})`, boxShadow: `inset 0 0 0 2px rgba(28,228,155,${strokeA})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit", fontWeight: 500, fontSize: 24, color: T.ink, letterSpacing: "-0.01em" }}>
            <span style={{ opacity: labelA }}>{label}</span>
            {caret && <span style={{ width: 3, height: 30, marginLeft: 3, background: T.green, opacity: caretOp }} />}
          </div>))}

        <div style={{ position: "absolute", left: W.x, top: W.y, width: W.w, height: W.h, overflow: "hidden", borderRadius: 10,
          boxShadow: `0 0 0 8px ${T.green}, 0 30px 80px rgba(0,0,0,.45)`, opacity: intro, transform: `scale(${mix(0.9, 1, intro)})` }}>
          <Img src={staticFile(`juno/raw2/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", left: imgL, top: imgT, width: 1080 * k, height: 1920 * k }} />
        </div>

        {note > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: GY0 + ROWS * PY + 70, textAlign: "center", opacity: note, transform: `rotate(-3deg) translateY(${(1 - note) * 14}px)`, fontFamily: "Caveat", fontWeight: 500, fontSize: 54, color: T.ink }}>
          every. single. year.</div>}
        {counter > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: GY0 + ROWS * PY + 22, textAlign: "center", opacity: counter, fontFamily: "Outfit", fontWeight: 400, fontSize: 26, letterSpacing: "0.14em", color: T.soft }}>
          HOURS <span style={{ color: T.green, fontWeight: 700 }}>{String(Math.round(fillProg)).padStart(2, "0")}</span> / WEEK
        </div>}
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <div style={{ opacity: 1 - 0.5 * dim }}>
          <Roll t={t} h={84} cls={lead} items={[[0.1, "60-hour"], [1.5, "data"], [2.6, "all hands on deck"]]} />
        </div>
        <Roll t={t} h={146} cls={main} items={[[0.65, G("weeks")], [1.5, null], [1.9, G("entry")], [2.6, null], [3.7, chaosWord]]} />
      </div>
    </AbsoluteFill>
  );
};
