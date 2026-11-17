// Juno — full-screen iso doc world (voice-over 02.MP4, 7.97s; total 8.3s, 24fps, still ending).
// VO: "AI handles the repetitive work, the data movement, the document shuffling.
//      The judgment, your expertise, your sign-off — that's where the work actually happens."
//  repetitive  : opening zoom-out; the AI module pulses and emits glass pages
//  data moves  : pages glide along the track into an inbox pile
//  shuffling   : pages hop from the pile into three neat stacks (mosaic order)
//  judgment    : everything dims; one page lifts up, grows and glows
//  expertise   : a lens sweeps the page and its lines fill green, one by one
//  sign-off    : a green check stamp lands with a ripple
//  happens     : camera eases in on the signed page; hold
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { C30, Cam, GlassPage, M, P, Sheet } from "./Iso";

export const WORK_FPS = 24;
export const WORK_FRAMES = Math.round(8.3 * WORK_FPS);

[["Outfit", 400, "Outfit-400"], ["Outfit", 700, "Outfit-700"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

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

// ---- layout (world units; plate spans -3..3) ----
const HALF = 3, N = 12, PW = 0.9, PD = 1.1, PT = 0.07;
const MOD = { x: -2.85, y: -2.85, s: 1.3, h: 0.55 };              // AI module (min corner, size, height)
const TRACK: V[] = [[-2.2, -2.2, MOD.h + 0.05], [-1.2, -2.2, 0.12], [1.9, -2.2, 0.12], [1.9, 0.0, 0.12]];
const PILE = { x: 1.9, y: 1.85 };
const STACKS = [[-1.9, 0.75], [-0.4, 0.75], [1.1, 0.75]];
const HERO_I = 10, HERO_C: V = [-0.5, -0.5, 2.0], HS = 2.5;
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(41);
const JIT = [...Array(N)].map(() => ({ rot: (r() - 0.5) * 26, x: (r() - 0.5) * 0.18, y: (r() - 0.5) * 0.18 }));

const along = (pts: V[], u: number): V => {
  const seg = pts.slice(1).map((q, n) => Math.hypot(q[0] - pts[n][0], q[1] - pts[n][1], q[2] - pts[n][2])); const tot = seg.reduce((a, b) => a + b, 0);
  let d = u * tot; for (let n = 0; n < seg.length; n++) { if (d <= seg[n] || n === seg.length - 1) { const q = Math.min(1, d / seg[n]); return [mix(pts[n][0], pts[n + 1][0], q), mix(pts[n][1], pts[n + 1][1], q), mix(pts[n][2], pts[n + 1][2], q)]; } d -= seg[n]; }
  return pts[pts.length - 1];
};

// ---- two centred lines ----
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

  // ---- phases ----
  const dim = pr(t, 3.5, 4.1, SIN);                 // non-hero world steps back
  const lift = pr(t, 3.55, 4.3, MOVE);              // hero page rises
  const lens = pr(t, 4.35, 5.25, SIN);              // expertise scan
  const stamp = pr(t, 5.42, 5.82, GLIDE), ripple = pr(t, 5.5, 6.2, Easing.out(Easing.cubic));
  const endZ = pr(t, 6.1, 7.5, SIN);                // closing push-in on the signed page
  const modPulse = 0.5 + 0.5 * Math.sin(t * 5) * (1 - pr(t, 2.2, 2.6));

  // ---- camera: opening zoom-out, closing push-in on the hero page ----
  const zo = Math.exp(Math.log(2.4) * (1 - pr(t, 0, 1.3, Easing.bezier(0.3, 0, 0.12, 1))));
  const base: Cam = { S: 100, cx: 540, cy: 1230 };
  const hp = P(base, HERO_C[0], HERO_C[1], HERO_C[2] + PT);
  const k = zo * mix(1, 1.22, endZ);
  const S = base.S * k;
  const tx = mix(hp[0], 540, endZ), ty = mix(hp[1], 1080, endZ);
  const cam: Cam = zo > 1.0001 ? { S, cx: base.cx, cy: base.cy }
    : { S, cx: tx - (HERO_C[0] - HERO_C[1]) * C30 * S, cy: ty - ((HERO_C[0] + HERO_C[1]) * 0.5 - (HERO_C[2] + PT)) * S };

  // ---- pages ----
  const sheets: Sheet[] = [];
  for (let i = 0; i < N; i++) {
    const te = 0.3 + i * 0.15;
    if (t < te) continue;
    const u = pr(t, te, te + 1.0, SIN);
    const pileZ = i * 0.065;
    let pos = along([...TRACK, [PILE.x, PILE.y, pileZ + 0.0]], u);
    let rot = JIT[i].rot * pr(t, te + 0.7, te + 1.0, SIN);
    // shuffle into stacks
    const ts = 2.5 + (N - 1 - i) * 0.07, sh = pr(t, ts, ts + 0.55, MOVE);
    const s = i % 3, l = Math.floor(i / 3);
    const slot: V = [STACKS[s][0] + JIT[i].x * 0.4, STACKS[s][1] + JIT[i].y * 0.4, l * 0.13];
    if (sh > 0) { pos = [mix(pos[0], slot[0], sh), mix(pos[1], slot[1], sh), mix(pos[2], slot[2], sh) + 0.9 * Math.sin(Math.PI * sh)]; rot = mix(rot, 0, sh); }
    let w = PW, d = PD, glow = 0, a = pr(t, te, te + 0.2), tint = GREEN;
    const hero = i === HERO_I;
    if (hero) {
      pos = [mix(pos[0], HERO_C[0], lift), mix(pos[1], HERO_C[1], lift), mix(pos[2], HERO_C[2], lift)];
      w = PW * mix(1, HS, lift); d = PD * mix(1, HS, lift); glow = 0.35 * lift + 0.4 * stamp;
    } else { a *= 1 - 0.55 * dim; tint = mixC(GREEN, CLEAR, dim * 0.7); a *= 1 - 0.6 * endZ; }
    const fills = hero ? [0, 1, 2, 3, 4, 5].map((n) => pr(t, 4.4 + n * 0.12, 4.68 + n * 0.12, SIN)) : undefined;
    sheets.push({ id: `p${i}`, x: pos[0] - w / 2, y: pos[1] - d / 2, z: pos[2], w, d, th: hero ? mix(PT, 0.11, lift) : PT, rot, tint, a, glow, text: true, fills: hero && lift > 0.3 ? fills : undefined });
  }
  sheets.sort((p, q) => (p.x + p.y + p.z + (p.w + p.d) / 2) - (q.x + q.y + q.z + (q.w + q.d) / 2));
  const hero = sheets.find((s) => s.id === `p${HERO_I}`);

  // ---- plate ----
  const plateC = [P(cam, -HALF, -HALF, 0), P(cam, HALF, -HALF, 0), P(cam, HALF, HALF, 0), P(cam, -HALF, HALF, 0)];
  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const gridL: [number, number][][] = [];
  for (let n = -2; n <= 2; n++) { gridL.push([P(cam, n, -HALF, 0), P(cam, n, HALF, 0)]); gridL.push([P(cam, -HALF, n, 0), P(cam, HALF, n, 0)]); }
  const gridDraw = pr(t, 0, 0.9, DRAW);
  const trackPts = TRACK.slice(1).map((q) => P(cam, q[0], q[1], 0.005));
  const trackPts2 = [...trackPts, P(cam, PILE.x, PILE.y - 0.6, 0.005)];
  const worldOp = 1 - 0.5 * dim;

  // ---- AI module (glass slab) ----
  const modSheet: Sheet = { id: "mod", x: MOD.x, y: MOD.y, z: 0, w: MOD.s, d: MOD.s, th: MOD.h, rot: 0, tint: GREEN, a: pr(t, 0, 0.5) * (1 - pr(t, 3.4, 3.9, SIN)), glow: 0.4 * modPulse, text: false };

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 62, letterSpacing: "-0.02em", lineHeight: "82px", color: "rgba(248,249,250,.78)" };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 120, letterSpacing: "-0.045em", lineHeight: "136px", color: "#F8F9FA" };
  const G = (s: string) => <>{s}<span style={{ color: "#1CE49B" }}>.</span></>;

  return (
    <AbsoluteFill style={{ background: "#1E1E1E", overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw5/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(248,249,250,.025) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.025) 1.5px,transparent 1.5px)", backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(46% 26% at 50% 60%, rgba(28,228,155,${0.05 + 0.04 * lift}), transparent 70%)` }} />
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
          {/* track: dashed path with moving dashes while data moves */}
          <polyline points={poly(trackPts2)} fill="none" stroke="rgba(28,228,155,.5)" strokeWidth={3} strokeDasharray="10 12" strokeDashoffset={-t * 60} strokeLinecap="round"
            opacity={pr(t, 0.2, 0.7) * (1 - 0.7 * pr(t, 2.4, 3.0))} />
          {/* stack slots */}
          {STACKS.map(([sx, sy], n) => <g key={n} transform={M(cam, 0.004)} opacity={pr(t, 2.2, 2.6) * (1 - dim * 0.5)}>
            <rect x={sx - PW / 2 - 0.06} y={sy - PD / 2 - 0.06} width={PW + 0.12} height={PD + 0.12} rx={0.09} fill="none" stroke="rgba(28,228,155,.45)" strokeWidth={2} strokeDasharray="6 7" vectorEffect="non-scaling-stroke" /></g>)}
        </g>

        {/* soft shadows */}
        <g filter="url(#wBlur)">
          {sheets.map((c) => { const near = Math.max(0, 1 - c.z / 3); if (c.a * near < 0.02) return null;
            return <g key={`s${c.id}`} transform={M(cam, 0)} opacity={c.a * near}><rect x={c.x + 0.1} y={c.y + 0.15} width={c.w} height={c.d} rx={0.08} fill="rgba(0,0,0,.5)" /></g>; })}
        </g>

        <GlassPage c={modSheet} cam={cam} band={0} />
        {modSheet.a > 0.01 && <g transform={M(cam, MOD.h + 0.002)} opacity={modSheet.a}>
          <text x={MOD.x + MOD.s / 2} y={MOD.y + MOD.s / 2 + 0.17} textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize={0.5} fill="#F8F9FA">AI</text>
          <circle cx={MOD.x + MOD.s / 2} cy={MOD.y + MOD.s / 2} r={0.48} fill="none" stroke="#1CE49B" strokeWidth={2} opacity={0.4 + 0.6 * modPulse} vectorEffect="non-scaling-stroke" /></g>}

        {/* hero bloom */}
        {lift > 0 && (() => { const c0 = P(cam, HERO_C[0], HERO_C[1], HERO_C[2] * lift); return <ellipse cx={c0[0]} cy={c0[1]} rx={240 * k} ry={170 * k} fill="#1CE49B" opacity={0.08 * lift + 0.08 * stamp} filter="url(#wBloom)" />; })()}

        {sheets.map((c) => <GlassPage key={c.id} c={c} cam={cam} band={0} />)}

        {/* lens sweep over the hero page */}
        {hero && lens > 0 && lens < 1 && <g transform={M(cam, hero.z + hero.th + 0.003)} opacity={Math.sin(Math.PI * lens)}>
          <circle cx={hero.x + hero.w * 0.55} cy={hero.y + hero.d * mix(0.12, 0.84, lens)} r={0.38} fill="rgba(28,228,155,.12)" stroke="#1CE49B" strokeWidth={3} vectorEffect="non-scaling-stroke" />
        </g>}

        {/* sign-off stamp */}
        {hero && stamp > 0 && <g transform={M(cam, hero.z + hero.th + 0.004)}>
          {ripple > 0 && ripple < 1 && <circle cx={hero.x + hero.w * 0.74} cy={hero.y + hero.d * 0.78} r={0.42 + 1.1 * ripple} fill="none" stroke="#1CE49B" strokeWidth={3} opacity={0.8 * (1 - ripple)} vectorEffect="non-scaling-stroke" />}
          <g transform={`translate(${hero.x + hero.w * 0.74} ${hero.y + hero.d * 0.78}) scale(${mix(1.6, 1, stamp)})`} opacity={Math.min(1, stamp * 1.5)}>
            <circle r={0.42} fill="#1CE49B" />
          </g></g>}
        {hero && stamp > 0 && (() => { const c0 = P(cam, hero.x + hero.w * 0.74, hero.y + hero.d * 0.78, hero.z + hero.th); const sc = mix(1.6, 1, stamp) * cam.S / 100;
          return <path transform={`translate(${c0[0]} ${c0[1]}) scale(${sc})`} d="M-16 1 L-5 12 L17 -11" fill="none" stroke="#043329" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, stamp * 1.5)} />; })()}
      </svg>

      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <Roll t={t} h={82} cls={lead} items={[[0.05, "AI handles the"], [1.6, "the data"], [2.42, "the document"], [3.48, "you bring the"], [4.32, "your"], [5.32, "your"], [6.08, "that's where the work"]]} />
        <Roll t={t} h={140} cls={main} items={[[0.3, G("repetitive")], [1.66, G("movement")], [2.5, G("shuffling")], [3.52, G("judgment")], [4.38, G("expertise")], [5.38, G("sign-off")], [6.3, G("happens")]]} />
      </div>
    </AbsoluteFill>
  );
};
