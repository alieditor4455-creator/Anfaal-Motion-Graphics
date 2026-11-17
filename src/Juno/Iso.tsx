// Juno — isometric glass build (voice-over: 01.MP4, 6.38s; total 7.2s, still ending). 9:16, 60fps.
// Follows the client's "Intentional Build v8 iso" reference, rebuilt as Juno Green glass DOCUMENT PAGES:
//  phrase 1  plate draws on; glass pages (text lines + folded corner) rain in and land scattered
//  phrase 2  pages glide into a neat 4x4 grid; a soft light wave runs across them
//  phrase 3  the grid cools to clear glass and dissolves; a seed pulses; a dashed scaffold grows up
//  phrase 4  page piles drop into the scaffold bottom-up (pages cascade + square up) -> stepped tower; hold
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

export const ISO_FPS = 60;
export const ISO_FRAMES = Math.round(7.2 * ISO_FPS);

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const SIN = Easing.inOut(Easing.sin);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const BG = "#1E1E1E";
type RGB = [number, number, number];
const GREEN: RGB = [28, 228, 155], LIGHT: RGB = [180, 247, 202], DEEP: RGB = [8, 120, 82], CLEAR: RGB = [214, 226, 222];
const mixC = (a: RGB, b: RGB, p: number): RGB => [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)];
const rgba = (c: RGB, a: number) => `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${a.toFixed(3)})`;

// ---- world ----
const HALF = 3;
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(23);
const GRID = [...Array(16)].map((_, n) => { const c = n % 4, k = Math.floor(n / 4); return { x: -1.5 + c, y: -1.5 + k }; });
const SCAT = (() => {
  const pts: { x: number; y: number }[] = [];
  while (pts.length < 16) { const p = { x: (r() - 0.5) * 4.4, y: (r() - 0.5) * 4.4 }; if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.95)) pts.push(p); }
  return pts;
})();
const DROP = [...Array(16)].map(() => ({ h: 6 + r() * 3, d: r() * 0.55, rot: (r() - 0.5) * 40 }));
const GW = 0.62, GD = 0.78, GT = 0.07;               // grid page: width (x), depth (y), thickness
// hero: stepped tower of page piles
const B = 1.3;
const HERO: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [0, 0, 2]];
const heroMin = (h: [number, number, number]) => ({ x: -B + h[0] * B, y: -B + h[1] * B, z: h[2] * B });
const HW = 0.98, HD = 1.16, PAGES = 6, PPITCH = (B - 0.14) / PAGES, PT = 0.1;
const JIT = [...Array(8 * PAGES)].map(() => ({ x: (r() - 0.5) * 0.16, y: (r() - 0.5) * 0.16, rot: (r() - 0.5) * 14 }));

// ---- iso projection ----
const C30 = Math.cos(Math.PI / 6);
type Cam = { S: number; cx: number; cy: number };
const P = (cam: Cam, x: number, y: number, z: number): [number, number] => [cam.cx + (x - y) * C30 * cam.S, cam.cy + (x + y) * 0.5 * cam.S - z * cam.S];
const M = (cam: Cam, z0: number) => `matrix(${C30 * cam.S},${0.5 * cam.S},${-C30 * cam.S},${0.5 * cam.S},${cam.cx},${cam.cy - z0 * cam.S})`;

type Sheet = { id: string; x: number; y: number; z: number; w: number; d: number; th: number; rot: number; tint: RGB; a: number; glow: number; text: boolean };

// one glass document page: footprint (x,y) w*d, thickness th, in-plane rotation rot (deg, about its centre)
const GlassPage: React.FC<{ c: Sheet; cam: Cam; band: number }> = ({ c, cam, band }) => {
  const { w, d, th, tint, a } = c;
  if (a <= 0.003 || w <= 0.01) return null;
  const z = c.z, zt = z + th, R = 0.07;
  const ccx = c.x + w / 2, ccy = c.y + d / 2, ang = (c.rot * Math.PI) / 180;
  const W = (u: number, v: number): [number, number] => { const dx = u - w / 2, dy = v - d / 2; return [ccx + dx * Math.cos(ang) - dy * Math.sin(ang), ccy + dx * Math.sin(ang) + dy * Math.cos(ang)]; };
  // page outline in local (u,v): rounded corners + folded corner at (w,0)
  const F = Math.min(w, d) * 0.22;
  const loc: [number, number][] = [];
  const arcL = (cu: number, cv: number, a0: number, a1: number) => { for (let i = 0; i <= 5; i++) { const an = ((a0 + (a1 - a0) * (i / 5)) * Math.PI) / 180; loc.push([cu + R * Math.cos(an), cv + R * Math.sin(an)]); } };
  arcL(R, R, 180, 270);
  loc.push([w - F, 0], [w, F]);
  arcL(w - R, d - R, 0, 90);
  arcL(R, d - R, 90, 180);
  const worldPts = loc.map(([u, v]) => W(u, v));
  const scr = (zz: number) => worldPts.map(([x, y]) => P(cam, x, y, zz));
  const top = scr(zt), bot = scr(z);
  const toD = (pts: [number, number][]) => "M" + pts.map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join(" L") + " Z";
  const n = top.length;
  let li = 0, ri = 0; top.forEach((q, i) => { if (q[0] < top[li][0]) li = i; if (q[0] > top[ri][0]) ri = i; });
  const walk = (pts: [number, number][], from: number, to: number) => {
    const a1: [number, number][] = [], a2: [number, number][] = [];
    for (let i = from; ; i = (i + 1) % n) { a1.push(pts[i]); if (i === to) break; }
    for (let i = from; ; i = (i - 1 + n) % n) { a2.push(pts[i]); if (i === to) break; }
    const avg = (arr: [number, number][]) => arr.reduce((s, q) => s + q[1], 0) / arr.length;
    return avg(a1) > avg(a2) ? a1 : a2;
  };
  const fTop = walk(top, li, ri), fBot = walk(bot, li, ri);
  const side = toD([...fTop, ...fBot.slice().reverse()]);
  const lit = mixC(tint, [255, 255, 255], 0.3 * c.glow);
  const topC = mixC(lit, LIGHT, 0.5), edge = mixC(lit, [255, 255, 255], 0.65);
  const lines = c.text ? [0.16, 0.3, 0.42, 0.54, 0.66, 0.78].map((v, i) => ({ v: v * d, len: i === 0 ? 0.42 : [0.72, 0.6, 0.76, 0.5, 0.66][i - 1] })) : [];
  const fold = [W(w - F, 0), W(w - F, F), W(w, F)].map(([x, y]) => P(cam, x, y, zt));
  return (
    <g opacity={a}>
      <path d={toD(bot)} fill="none" stroke={rgba(edge, 0.2)} strokeWidth={1} />
      <path d={side} fill={rgba(mixC(lit, DEEP, 0.35), 1)} opacity={c.text ? 0.6 : 0.42} />
      <path d={toD(top)} fill={rgba(topC, 1)} opacity={c.text ? 0.42 : 0.14} />
      <path d={toD(top)} fill="url(#isoDome)" opacity={c.text ? 0.7 : 0.25} />
      {lines.length > 0 && <g transform={M(cam, zt)}>
        <g transform={`translate(${ccx} ${ccy}) rotate(${c.rot}) translate(${-w / 2} ${-d / 2})`}>
          {lines.map((l, i) => <line key={i} x1={0.14 * w} y1={l.v} x2={(0.14 + l.len * 0.72) * w} y2={l.v} stroke={i === 0 ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.42)"} strokeWidth={i === 0 ? 3 : 2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
        </g></g>}
      <path d={toD(fold)} fill="rgba(255,255,255,.35)" stroke={rgba(edge, 0.6)} strokeWidth={1} />
      <path d={toD(top)} fill="none" stroke={rgba(edge, c.text ? 0.8 : 0.5)} strokeWidth={c.text ? 1.4 : 1.1} strokeLinejoin="round" />
      <path d={"M" + fBot.map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join(" L")} fill="none" stroke={rgba(edge, 0.45)} strokeWidth={1.1} />
      {band > 0 && band < 1 && <path d={side} fill="rgba(255,255,255,.5)" opacity={0.5 * Math.sin(Math.PI * band)} />}
    </g>);
};

export const JunoIso: React.FC = () => {
  const f = useCurrentFrame(); const t = f / ISO_FPS;

  const z = pr(t, 2.6, 4.7, MOVE);
  const cam: Cam = { S: mix(92, 104, z), cx: 540, cy: mix(1040, 1120, z) };

  const plateIn = pr(t, 0.0, 0.7, GLIDE);
  const gridLines = pr(t, 0.15, 0.85, DRAW);
  const toGrid = (n: number) => pr(t, 1.3 + n * 0.025, 2.15 + n * 0.025, MOVE);
  const wave = (n: number) => { const g = GRID[n]; const d = (g.x + g.y + 3) / 6; const c = 2.15 + d * 0.45; return Math.exp(-Math.pow((t - c) / 0.12, 2)); };
  const cool = pr(t, 2.6, 3.0, SWAP);
  const dissolve = (n: number) => { const o = ((GRID[n].x + GRID[n].y + 3) / 6) * 0.25; return pr(t, 2.95 + o, 3.35 + o, SWAP); };
  const seed = pr(t, 3.25, 3.55, GLIDE) * (1 - pr(t, 4.6, 4.9, SWAP));
  const ripple = pr(t, 3.3, 4.1, Easing.out(Easing.cubic));
  const scaffold = pr(t, 3.45, 4.45, DRAW);
  const heroT0 = (n: number) => 4.55 + n * 0.12;
  const settled = pr(t, 5.45, 5.95, SIN);
  const bloom = pr(t, 5.6, 6.4, SIN);
  const sweep = pr(t, 5.85, 6.55, SIN);

  const sheets: Sheet[] = [];
  GRID.forEach((g, n) => {
    const land = pr(t, 0.35 + DROP[n].d, 1.05 + DROP[n].d, Easing.out(Easing.cubic));
    const sc = SCAT[n], tg = toGrid(n), dis = dissolve(n);
    const k = 1 - dis, w = GW * k, d = GD * k;
    const cx = mix(sc.x, g.x, tg), cy = mix(sc.y, g.y, tg);
    sheets.push({ id: `g${n}`, x: cx - w / 2, y: cy - d / 2, z: Math.max(0, mix(DROP[n].h, 0, land)), w, d, th: GT, rot: DROP[n].rot * (1 - tg),
      tint: mixC(GREEN, CLEAR, cool), a: (t < 0.35 + DROP[n].d ? 0 : pr(t, 0.35 + DROP[n].d, 0.6 + DROP[n].d)) * k, glow: wave(n), text: true });
  });
  HERO.forEach((h, n) => {
    if (t < heroT0(n)) return;
    const m = heroMin(h);
    for (let p = 0; p < PAGES; p++) {
      const t0 = heroT0(n) + (PAGES - 1 - p) * 0.035;
      const dz = pr(t, t0, t0 + 0.6, GLIDE), sq = pr(t, t0 + 0.35, t0 + 0.95, SIN);
      const j = JIT[n * PAGES + p];
      sheets.push({ id: `h${n}_${p}`, x: m.x + (B - HW) / 2 + j.x * (1 - sq), y: m.y + (B - HD) / 2 + j.y * (1 - sq), z: m.z + 0.03 + p * PPITCH + (1 - dz) * (5.5 + p * 0.3),
        w: HW, d: HD, th: PT, rot: j.rot * (1 - sq), tint: GREEN, a: pr(t, t0, t0 + 0.2), glow: 0.2 * bloom, text: p === PAGES - 1 });
    }
  });
  sheets.sort((a, b) => (a.x + a.y + a.z + (a.w + a.d) / 2) - (b.x + b.y + b.z + (b.w + b.d) / 2));

  const plateC = [P(cam, -HALF, -HALF, 0), P(cam, HALF, -HALF, 0), P(cam, HALF, HALF, 0), P(cam, -HALF, HALF, 0)];
  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const lines: [number, number][][] = [];
  for (let k = -2; k <= 2; k++) { lines.push([P(cam, k, -HALF, 0), P(cam, k, HALF, 0)]); lines.push([P(cam, -HALF, k, 0), P(cam, HALF, k, 0)]); }
  const scafH = scaffold * 3 * B, scafFade = 1 - settled;
  const heroCenter = P(cam, 0, 0, 1.2 * B), seedP = P(cam, 0, 0, 0);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw3/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(248,249,250,.025) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.025) 1.5px,transparent 1.5px)", backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(48% 30% at 50% ${(cam.cy / 1920) * 100 - 2}%, rgba(28,228,155,${0.06 * plateIn + 0.03 * bloom}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.45))" }} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="isoDome" cx="0.3" cy="0.25" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.06} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
          <linearGradient id="isoPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a2f2d" /><stop offset="1" stopColor="#1b1f1d" /></linearGradient>
          <filter id="isoBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="isoBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
        </defs>

        <g opacity={plateIn} transform={`translate(0 ${(1 - plateIn) * 40})`}>
          <polygon points={poly(plateC.map(([x, y]) => [x, y + 16] as [number, number]))} fill="#141615" opacity={0.9} />
          <polygon points={poly(plateC)} fill="url(#isoPlate)" stroke="rgba(180,247,202,.3)" strokeWidth={2} />
          {lines.map((l, n) => <line key={n} x1={l[0][0]} y1={l[0][1]} x2={mix(l[0][0], l[1][0], gridLines)} y2={mix(l[0][1], l[1][1], gridLines)} stroke="rgba(180,247,202,.1)" strokeWidth={1.2} />)}
          <polygon points={poly([plateC[1], plateC[2], [plateC[2][0], plateC[2][1] + 16], [plateC[1][0], plateC[1][1] + 16]])} fill="#101211" />
          <polygon points={poly([plateC[2], plateC[3], [plateC[3][0], plateC[3][1] + 16], [plateC[2][0], plateC[2][1] + 16]])} fill="#171a19" />
          <polyline points={poly([plateC[1], plateC[2], plateC[3]])} fill="none" stroke="rgba(180,247,202,.42)" strokeWidth={2} />
        </g>

        {/* soft contact shadows + faint caustics */}
        <g filter="url(#isoBlur)">
          {sheets.map((c) => { if (c.a <= 0.01 || (c.id[0] === "h" && !c.id.endsWith("_0"))) return null; const near = Math.max(0, 1 - c.z / 4);
            return <g key={`sh${c.id}`} opacity={c.a * near} transform={M(cam, 0)}>
              <rect x={c.x + 0.12} y={c.y + 0.18} width={c.w * 1.05} height={c.d * 1.05} rx={0.08} fill="rgba(0,0,0,.5)" />
              <rect x={c.x} y={c.y} width={c.w} height={c.d} rx={0.08} fill={rgba(c.tint, 0.18)} />
            </g>; })}
        </g>

        {seed > 0 && <g>
          <ellipse cx={seedP[0]} cy={seedP[1]} rx={14 * seed} ry={7 * seed} fill="#1CE49B" style={{ filter: "drop-shadow(0 0 6px rgba(28,228,155,.6))" }} />
          {ripple < 1 && <ellipse cx={seedP[0]} cy={seedP[1]} rx={330 * ripple} ry={165 * ripple} fill="none" stroke="#1CE49B" strokeWidth={3 * (1 - ripple) + 0.5} opacity={0.7 * (1 - ripple)} />}
        </g>}

        {/* dashed scaffold: page-shaped slots, grows upward */}
        {scaffold > 0 && scafFade > 0 && <g opacity={scafFade * 0.75}>
          {HERO.map((h, n) => { const m = heroMin(h); const x = m.x + (B - HW) / 2, y = m.y + (B - HD) / 2, z0 = m.z, z1 = m.z + B - 0.14;
            if (scafH < z0) return null; const top = Math.min(z1, scafH);
            const L = P(cam, x, y + HD, z0), Rr = P(cam, x + HW, y, z0);
            const ring = (zz: number) => <g transform={M(cam, zz)}><rect x={x} y={y} width={HW} height={HD} rx={0.07} fill="none" stroke="#1CE49B" strokeWidth={2} strokeDasharray="6 7" vectorEffect="non-scaling-stroke" /></g>;
            return <g key={n}>{ring(z0)}{scafH >= z1 && ring(z1)}
              {[L, Rr].map((q, i) => <line key={i} x1={q[0]} y1={q[1]} x2={q[0]} y2={q[1] - (top - z0) * cam.S} stroke="#1CE49B" strokeWidth={2} strokeDasharray="6 7" />)}</g>; })}
        </g>}

        {bloom > 0 && <ellipse cx={heroCenter[0]} cy={heroCenter[1]} rx={260} ry={300} fill="#1CE49B" opacity={0.1 * bloom} filter="url(#isoBloom)" />}

        {sheets.map((c) => <GlassPage key={c.id} c={c} cam={cam} band={c.id[0] === "h" ? Math.max(0, Math.min(1, sweep * 1.4 - (c.z / (3 * B)) * 0.4)) : 0} />)}
      </svg>
    </AbsoluteFill>
  );
};
