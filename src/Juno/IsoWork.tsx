// Juno — full-screen iso world, NO documents (voice-over 02.MP4, 7.97s; total 8.3s, 24fps, still ending).
// VO: "AI handles the repetitive work, the data movement, the document shuffling.
//      The judgment, your expertise, your sign-off — that's where the work actually happens."
//  repetitive  : opening zoom-out; a glass code panel types code and emits glass data packets (</> { } 01)
//  data moves  : packets glide along the track into an inbox pile
//  shuffling   : packets hop from the pile and sort into three columns
//  judgment    : everything dims; one packet lifts out and grows into a glowing decision node
//  expertise   : a review ring orbits the node and a scan line sweeps its face
//  sign-off    : a toggle on the node switches on, a green check lands with a ripple
//  happens     : camera eases in on the approved node; hold
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { C30, Cam, GlassPage, M, P, Sheet } from "./Iso";

export const WORK_FPS = 24;
export const WORK_FRAMES = Math.round(8.3 * WORK_FPS);

[["Outfit", 400, "juno/fonts/Outfit-400"], ["Outfit", 700, "juno/fonts/Outfit-700"], ["JetBrains Mono", 700, "fonts/JetBrainsMono-Bold"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`${f}.woff2`) }));

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const SIN = Easing.inOut(Easing.sin);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
type RGB = [number, number, number];
const GREEN: RGB = [28, 228, 155], CLEAR: RGB = [200, 214, 208];
const mixC = (a: RGB, b: RGB, p: number): RGB => [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)];
type V = [number, number, number];
const MONO = "JetBrains Mono, monospace";

// ---- layout (world units; plate spans -3..3) ----
const HALF = 3, N = 12, PS = 0.56, PH = 0.3;                         // packet size + height
const PANEL = { x: -2.9, y: -2.9, w: 1.9, d: 1.45, h: 0.32 };          // AI code panel
const TRACK: V[] = [[-1.0, -2.2, 0.12], [1.9, -2.2, 0.12], [1.9, 0.0, 0.12]];
const PILE = { x: 1.9, y: 1.85 };
const COLS = [[-1.9, 0.75], [-0.4, 0.75], [1.1, 0.75]];
const HERO_I = 10, HERO_C: V = [-0.5, -0.5, 1.9], HN = 1.5, HH = 0.42; // decision node size/height
const GLYPHS = ["</>", "{ }", "01", "fn", "=>", "[ ]"];
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(41);
const JIT = [...Array(N)].map(() => ({ rot: (r() - 0.5) * 30 }));
// code lines on the panel (indent, length, green?)
const CODE: [number, number, boolean][] = [[0, 0.55, true], [0.12, 0.7, false], [0.24, 0.48, false], [0.24, 0.62, true], [0.12, 0.4, false], [0, 0.3, true], [0.12, 0.66, false], [0.24, 0.5, false]];

const along = (pts: V[], u: number): V => {
  const seg = pts.slice(1).map((q, n) => Math.hypot(q[0] - pts[n][0], q[1] - pts[n][1], q[2] - pts[n][2])); const tot = seg.reduce((a, b) => a + b, 0);
  let d = u * tot; for (let n = 0; n < seg.length; n++) { if (d <= seg[n] || n === seg.length - 1) { const q = Math.min(1, d / seg[n]); return [mix(pts[n][0], pts[n + 1][0], q), mix(pts[n][1], pts[n + 1][1], q), mix(pts[n][2], pts[n + 1][2], q)]; } d -= seg[n]; }
  return pts[pts.length - 1];
};

const Roll: React.FC<{ t: number; items: [number, React.ReactNode][]; cls: React.CSSProperties; h: number }> = ({ t, items, cls, h }) => {
  let k = -1; items.forEach(([s], i) => { if (t >= s) k = i; });
  const p = k >= 0 ? pr(t, items[k][0], items[k][0] + 0.55, k === 0 ? GLIDE : SWAP) : 0;
  const prev = k > 0 ? items[k - 1][1] : null; const cur = k >= 0 ? items[k][1] : null;
  const row = (node: React.ReactNode, y: number, op: number, blur: number) => node == null ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${y}%)`, opacity: op, filter: `blur(${blur}px)` }}>{node}</div>);
  return <div style={{ position: "relative", height: h, overflow: "hidden", ...cls }}>{row(prev, -90 * p, 1 - p, 4 * p)}{row(cur, 90 * (1 - p), p, 4 * (1 - p))}</div>;
};

export const JunoWork: React.FC = () => {
  const t = useCurrentFrame() / WORK_FPS;

  const dim = pr(t, 3.5, 4.1, SIN);
  const lift = pr(t, 3.55, 4.3, MOVE);
  const ring = pr(t, 4.3, 4.7, GLIDE) * (1 - pr(t, 5.3, 5.7, SWAP)), scan = pr(t, 4.4, 5.25, SIN);
  const toggle = pr(t, 5.38, 5.68, SIN), stamp = pr(t, 5.6, 5.95, GLIDE), ripple = pr(t, 5.65, 6.3, Easing.out(Easing.cubic));
  const endZ = pr(t, 6.1, 7.5, SIN);
  const panelA = pr(t, 0, 0.5) * (1 - pr(t, 3.4, 3.9, SIN));

  const zo = Math.exp(Math.log(2.4) * (1 - pr(t, 0, 1.3, Easing.bezier(0.3, 0, 0.12, 1))));
  const base: Cam = { S: 104, cx: 540, cy: 1060 };
  const topZ = HERO_C[2] + HH;
  const hp = P(base, HERO_C[0], HERO_C[1], topZ);
  const k = zo * mix(1, 1.22, endZ);
  const S = base.S * k;
  const tx = mix(hp[0], 540, endZ), ty = mix(hp[1], 920, endZ);
  const cam: Cam = zo > 1.0001 ? { S, cx: base.cx, cy: base.cy }
    : { S, cx: tx - (HERO_C[0] - HERO_C[1]) * C30 * S, cy: ty - ((HERO_C[0] + HERO_C[1]) * 0.5 - topZ) * S };

  // ---- packets ----
  type Pk = Sheet & { glyph: string; ga: number };
  const packs: Pk[] = [];
  for (let i = 0; i < N; i++) {
    const te = 0.3 + i * 0.15;
    if (t < te) continue;
    const u = pr(t, te, te + 1.0, SIN);
    const start: V = [PANEL.x + PANEL.w * 0.75, PANEL.y + PANEL.d * 0.6, PANEL.h];
    let pos = along([start, ...TRACK, [PILE.x, PILE.y, i * 0.07]], u);
    pos = [pos[0], pos[1], pos[2] + 0.35 * Math.sin(Math.PI * pr(t, te, te + 0.3, SIN))];
    let rot = JIT[i].rot * pr(t, te + 0.7, te + 1.0, SIN);
    const ts = 2.5 + (N - 1 - i) * 0.07, sh = pr(t, ts, ts + 0.55, MOVE);
    const c = i % 3, l = Math.floor(i / 3);
    const slot: V = [COLS[c][0], COLS[c][1], l * (PH + 0.04)];
    if (sh > 0) { pos = [mix(pos[0], slot[0], sh), mix(pos[1], slot[1], sh), mix(pos[2], slot[2], sh) + 0.9 * Math.sin(Math.PI * sh)]; rot = mix(rot, 0, sh); }
    let w = PS, h = PH, glow = 0, a = pr(t, te, te + 0.2), tint = GREEN, ga = 1;
    const hero = i === HERO_I;
    if (hero) {
      pos = [mix(pos[0], HERO_C[0], lift), mix(pos[1], HERO_C[1], lift), mix(pos[2], HERO_C[2], lift)];
      w = mix(PS, HN, lift); h = mix(PH, HH, lift); glow = 0.35 * lift + 0.45 * toggle; ga = 1 - pr(t, 4.0, 4.4);
    } else { a *= (1 - 0.55 * dim) * (1 - 0.6 * endZ); tint = mixC(GREEN, CLEAR, dim * 0.7); }
    packs.push({ id: `k${i}`, x: pos[0] - w / 2, y: pos[1] - w / 2, z: pos[2], w, d: w, th: h, rot, tint, a, glow, text: false, noFold: true, glyph: GLYPHS[i % GLYPHS.length], ga });
  }
  packs.sort((p, q) => (p.x + p.y + p.z + p.w) - (q.x + q.y + q.z + q.w));
  const hero = packs.find((s) => s.id === `k${HERO_I}`);

  const plateC = [P(cam, -HALF, -HALF, 0), P(cam, HALF, -HALF, 0), P(cam, HALF, HALF, 0), P(cam, -HALF, HALF, 0)];
  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const gridL: [number, number][][] = [];
  for (let n = -2; n <= 2; n++) { gridL.push([P(cam, n, -HALF, 0), P(cam, n, HALF, 0)]); gridL.push([P(cam, -HALF, n, 0), P(cam, HALF, n, 0)]); }
  const gridDraw = pr(t, 0, 0.9, DRAW);
  const trackPts = [...TRACK.map((q) => P(cam, q[0], q[1], 0.005)), P(cam, PILE.x, PILE.y - 0.4, 0.005)];
  const worldOp = 1 - 0.5 * dim;
  const panel: Sheet = { id: "panel", x: PANEL.x, y: PANEL.y, z: 0, w: PANEL.w, d: PANEL.d, th: PANEL.h, rot: 0, tint: GREEN, a: panelA, glow: 0.2, text: false, noFold: true };
  const typed = (t * 3.2) % (CODE.length + 2);

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 62, letterSpacing: "-0.02em", lineHeight: "82px", color: "rgba(248,249,250,.78)" };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 120, letterSpacing: "-0.045em", lineHeight: "136px", color: "#F8F9FA" };
  const G = (s: string) => <>{s}<span style={{ color: "#1CE49B" }}>.</span></>;

  return (
    <AbsoluteFill style={{ background: "#1E1E1E", overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw5/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(248,249,250,.025) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.025) 1.5px,transparent 1.5px)", backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(46% 26% at 50% 50%, rgba(28,228,155,${0.05 + 0.04 * lift}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.45))" }} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="isoDome" cx="0.3" cy="0.25" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.06} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
          <linearGradient id="wPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a2f2d" /><stop offset="1" stopColor="#1b1f1d" /></linearGradient>
          <filter id="wBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="wBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28" /></filter>
        </defs>

        <g opacity={worldOp * (1 - 0.5 * endZ)}>
          <polygon points={poly(plateC.map(([x, y]) => [x, y + 16 * k] as [number, number]))} fill="#141615" />
          <polygon points={poly(plateC)} fill="url(#wPlate)" stroke="rgba(180,247,202,.3)" strokeWidth={2} />
          {gridL.map((l, n) => <line key={n} x1={l[0][0]} y1={l[0][1]} x2={mix(l[0][0], l[1][0], gridDraw)} y2={mix(l[0][1], l[1][1], gridDraw)} stroke="rgba(180,247,202,.09)" strokeWidth={1.2} />)}
          <polyline points={poly([plateC[1], plateC[2], plateC[3]])} fill="none" stroke="rgba(180,247,202,.42)" strokeWidth={2} />
          <polyline points={poly(trackPts)} fill="none" stroke="rgba(28,228,155,.5)" strokeWidth={3} strokeDasharray="10 12" strokeDashoffset={-t * 60} strokeLinecap="round"
            opacity={pr(t, 0.2, 0.7) * (1 - 0.7 * pr(t, 2.4, 3.0))} />
          {COLS.map(([sx, sy], n) => <g key={n} transform={M(cam, 0.004)} opacity={pr(t, 2.2, 2.6) * (1 - dim * 0.5)}>
            <rect x={sx - PS / 2 - 0.08} y={sy - PS / 2 - 0.08} width={PS + 0.16} height={PS + 0.16} rx={0.1} fill="none" stroke="rgba(28,228,155,.45)" strokeWidth={2} strokeDasharray="6 7" vectorEffect="non-scaling-stroke" /></g>)}
        </g>

        <g filter="url(#wBlur)">
          {packs.map((c) => { const near = Math.max(0, 1 - c.z / 3); if (c.a * near < 0.02) return null;
            return <g key={`s${c.id}`} transform={M(cam, 0)} opacity={c.a * near}><rect x={c.x + 0.1} y={c.y + 0.15} width={c.w} height={c.d} rx={0.08} fill="rgba(0,0,0,.5)" /></g>; })}
        </g>

        {/* AI code panel */}
        <GlassPage c={panel} cam={cam} band={0} />
        {panelA > 0.01 && <g transform={M(cam, PANEL.h + 0.003)} opacity={panelA}>
          <text x={PANEL.x + 0.16} y={PANEL.y + 0.3} fontFamily={MONO} fontWeight={700} fontSize={0.2} fill="#1CE49B">AI</text>
          {[0, 1, 2].map((n) => <circle key={n} cx={PANEL.x + PANEL.w - 0.18 - n * 0.14} cy={PANEL.y + 0.23} r={0.04} fill={n === 0 ? "#1CE49B" : "rgba(248,249,250,.35)"} />)}
          {CODE.map(([ind, len, g], n) => { const p = Math.max(0, Math.min(1, typed - n)); if (p <= 0) return null;
            const x0 = PANEL.x + 0.16 + ind * PANEL.w * 0.5, y0 = PANEL.y + 0.48 + n * 0.12;
            return <line key={n} x1={x0} y1={y0} x2={x0 + len * (PANEL.w - 0.5) * p} y2={y0} stroke={g ? "#1CE49B" : "rgba(248,249,250,.55)"} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />; })}
        </g>}

        {lift > 0 && (() => { const c0 = P(cam, HERO_C[0], HERO_C[1], HERO_C[2] * lift); return <ellipse cx={c0[0]} cy={c0[1]} rx={230 * k} ry={160 * k} fill="#1CE49B" opacity={0.08 * lift + 0.1 * toggle} filter="url(#wBloom)" />; })()}

        {/* review ring (behind half) */}
        {hero && ring > 0 && <g transform={M(cam, hero.z + hero.th * 0.5)} opacity={ring}>
          <circle cx={HERO_C[0]} cy={HERO_C[1]} r={1.25} fill="none" stroke="rgba(28,228,155,.65)" strokeWidth={2.5} strokeDasharray="8 10" strokeDashoffset={-t * 80} vectorEffect="non-scaling-stroke" />
          <circle cx={HERO_C[0] + 1.25 * Math.cos(t * 3)} cy={HERO_C[1] + 1.25 * Math.sin(t * 3)} r={0.07} fill="#1CE49B" />
        </g>}

        {packs.map((c) => <React.Fragment key={c.id}>
          <GlassPage c={c} cam={cam} band={0} />
          {c.ga > 0.01 && c.a > 0.01 && <g transform={M(cam, c.z + c.th + 0.003)} opacity={c.a * c.ga}>
            <g transform={`translate(${c.x + c.w / 2} ${c.y + c.d / 2}) rotate(${c.rot})`}>
              <text x={0} y={0.07} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={0.2 * (c.w / PS)} fill="#F8F9FA" opacity={0.9}>{c.glyph}</text></g></g>}
        </React.Fragment>)}

        {/* decision node face: scan line, toggle, check */}
        {hero && lift > 0.6 && <g transform={M(cam, hero.z + hero.th + 0.004)}>
          {scan > 0 && scan < 1 && <line x1={hero.x + 0.15} y1={hero.y + hero.d * mix(0.1, 0.9, scan)} x2={hero.x + hero.w - 0.15} y2={hero.y + hero.d * mix(0.1, 0.9, scan)} stroke="#1CE49B" strokeWidth={3} opacity={Math.sin(Math.PI * scan)} vectorEffect="non-scaling-stroke" />}
          <g opacity={pr(t, 4.3, 4.7)}>
            <rect x={hero.x + hero.w * 0.2} y={hero.y + hero.d * 0.38} width={hero.w * 0.6} height={hero.d * 0.24} rx={hero.d * 0.12}
              fill={`rgba(28,228,155,${0.12 + 0.75 * toggle})`} stroke="rgba(28,228,155,.8)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <circle cx={hero.x + hero.w * mix(0.32, 0.68, toggle)} cy={hero.y + hero.d * 0.5} r={hero.d * 0.095} fill={toggle > 0.5 ? "#043329" : "#F8F9FA"} />
          </g>
          {ripple > 0 && ripple < 1 && <circle cx={hero.x + hero.w * 0.5} cy={hero.y + hero.d * 0.5} r={0.6 + 1.0 * ripple} fill="none" stroke="#1CE49B" strokeWidth={3} opacity={0.8 * (1 - ripple)} vectorEffect="non-scaling-stroke" />}
        </g>}
        {hero && stamp > 0 && (() => { const c0 = P(cam, hero.x + hero.w / 2, hero.y + hero.d / 2, hero.z + hero.th); const sc = mix(1.5, 1, stamp) * cam.S / 100;
          return <g transform={`translate(${c0[0]} ${c0[1] - 120 * cam.S / 100}) scale(${sc})`} opacity={Math.min(1, stamp * 1.5)}>
            <circle r={34} fill="#1CE49B" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,.4))" }} />
            <path d="M-15 1 L-4 12 L16 -10" fill="none" stroke="#043329" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></g>; })()}
      </svg>

    </AbsoluteFill>
  );
};
