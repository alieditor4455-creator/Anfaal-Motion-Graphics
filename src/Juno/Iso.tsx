// Juno — isometric glass build (voice-over: 01.MP4, 6.38s; total 7.2s, still ending). 9:16, 60fps.
// Follows the client's "Intentional Build v8 iso" reference, rebuilt in premium Juno Green glass:
//  phrase 1  plate draws on; glass cubes rain in and land scattered (caustic light + soft shadow on the plate)
//  phrase 2  cubes glide into a 4x4 grid; a light wave runs across them
//  phrase 3  the grid cools to clear glass and dissolves; a seed pulses; a dashed scaffold grows up
//  phrase 4  big glass cubes drop into the scaffold bottom-up -> the stepped tower; bloom + light sweep; hold
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
const HALF = 3; // plate spans [-3,3] x [-3,3]
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(23);
const GRID = [...Array(16)].map((_, n) => { const c = n % 4, k = Math.floor(n / 4); return { x: -1.5 + c, y: -1.5 + k }; });
const SCAT = (() => { // scattered landing spots (loose cluster, no overlaps)
  const pts: { x: number; y: number }[] = [];
  while (pts.length < 16) { const p = { x: (r() - 0.5) * 4.4, y: (r() - 0.5) * 4.4 }; if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.95)) pts.push(p); }
  return pts;
})();
const DROP = [...Array(16)].map(() => ({ h: 6 + r() * 3, d: r() * 0.55 }));
const SMALL = 0.74;
// hero: stepped tower from the reference, block size 1.3
const B = 1.3;
const HERO: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [0, 0, 2]];
const heroMin = (h: [number, number, number]) => ({ x: -B + h[0] * B, y: -B + h[1] * B, z: h[2] * B });

// ---- iso projection ----
const C30 = Math.cos(Math.PI / 6);
type Cam = { S: number; cx: number; cy: number };
const P = (cam: Cam, x: number, y: number, z: number): [number, number] => [cam.cx + (x - y) * C30 * cam.S, cam.cy + (x + y) * 0.5 * cam.S - z * cam.S];
const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");

type Hide = { r: number; l: number; t: number; b1: number; b2: number };
type Cube = { id: string; x: number; y: number; z: number; s: number; tint: RGB; a: number; glow: number; hide?: Hide };

// one glass cube (min corner x,y,z; size s)
const GlassCube: React.FC<{ c: Cube; cam: Cam; sweep: number }> = ({ c, cam, sweep }) => {
  const { x, y, z, s, tint, a } = c; const H = c.hide || { r: 0, l: 0, t: 0, b1: 0, b2: 0 };
  if (a <= 0.003 || s <= 0.01) return null;
  const v = (dx: number, dy: number, dz: number) => P(cam, x + dx * s, y + dy * s, z + dz * s);
  const top = [v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)];
  const right = [v(1, 0, 0), v(1, 1, 0), v(1, 1, 1), v(1, 0, 1)];   // x = max
  const left = [v(0, 1, 0), v(1, 1, 0), v(1, 1, 1), v(0, 1, 1)];    // y = max
  const back1 = [v(0, 0, 0), v(0, 1, 0), v(0, 1, 1), v(0, 0, 1)];   // x = min
  const back2 = [v(0, 0, 0), v(1, 0, 0), v(1, 0, 1), v(0, 0, 1)];   // y = min
  const lit = mixC(tint, [255, 255, 255], 0.35 * c.glow);
  const topC = mixC(lit, LIGHT, 0.55), leftC = lit, rightC = mixC(lit, DEEP, 0.45);
  const edge = mixC(lit, [255, 255, 255], 0.65);
  // inset bevel on the top face (thickness cue)
  const k = 0.12, bev = [v(k, k, 1), v(1 - k, k, 1), v(1 - k, 1 - k, 1), v(k, 1 - k, 1)];
  // specular streak across the two front faces (u along the face width)
  const strip = (q: [number, number][], u0: number, u1: number) => {
    const L = (p0: [number, number], p1: [number, number], u: number): [number, number] => [mix(p0[0], p1[0], u), mix(p0[1], p1[1], u)];
    return [L(q[0], q[1], u0), L(q[0], q[1], u1), L(q[3], q[2], u1), L(q[3], q[2], u0)];
  };
  const sw = sweep;
  return (
    <g opacity={a}>
      {/* back faces + hidden edges (glass: you see through) */}
      <polygon points={poly(back1)} fill={rgba(rightC, 0.1 * (1 - H.b1))} />
      <polygon points={poly(back2)} fill={rgba(leftC, 0.1 * (1 - H.b2))} />
      <polyline points={poly([v(0, 0, 1), v(0, 0, 0), v(1, 0, 0)])} fill="none" stroke={rgba(edge, 0.22)} strokeWidth={1.2} />
      <line x1={v(0, 0, 0)[0]} y1={v(0, 0, 0)[1]} x2={v(0, 1, 0)[0]} y2={v(0, 1, 0)[1]} stroke={rgba(edge, 0.22)} strokeWidth={1.2} />
      {/* front faces */}
      <g opacity={1 - H.l}><polygon points={poly(left)} fill={rgba(leftC, 0.5)} /><polygon points={poly(left)} fill="url(#isoSheenL)" /></g>
      <g opacity={1 - H.r}><polygon points={poly(right)} fill={rgba(rightC, 0.56)} /><polygon points={poly(right)} fill="url(#isoSheenR)" /></g>
      <g opacity={1 - H.t}><polygon points={poly(top)} fill={rgba(topC, 0.62)} /><polygon points={poly(top)} fill="url(#isoSheenT)" />
        <polygon points={poly(bev)} fill="none" stroke={rgba([255, 255, 255], 0.22)} strokeWidth={1} /></g>
      {sw > 0 && sw < 1 && H.l < 0.5 && (() => { const u = sw * 1.5 - 0.25, w = 0.16; const u0 = Math.max(0, u - w), u1 = Math.min(1, u + w);
        return u1 > u0 ? <polygon points={poly(strip(left as any, u0, u1))} fill="url(#isoSweep)" opacity={Math.sin(Math.PI * sw)} /> : null; })()}
      {/* visible edges */}
      <polygon points={poly(top)} fill="none" stroke={rgba(edge, 0.85)} strokeWidth={1.6} strokeLinejoin="round" />
      <polyline points={poly([v(0, 1, 1), v(0, 1, 0), v(1, 1, 0), v(1, 0, 0), v(1, 0, 1)])} fill="none" stroke={rgba(edge, 0.6)} strokeWidth={1.4} strokeLinejoin="round" />
      <line x1={v(1, 1, 0)[0]} y1={v(1, 1, 0)[1]} x2={v(1, 1, 1)[0]} y2={v(1, 1, 1)[1]} stroke={rgba([255, 255, 255], 0.85)} strokeWidth={1.8} />
    </g>);
};

export const JunoIso: React.FC = () => {
  const f = useCurrentFrame(); const t = f / ISO_FPS;

  // camera: grid stage -> hero stage (finishes by 4.7s; nothing moves after 6.6s)
  const z = pr(t, 2.6, 4.7, MOVE);
  const cam: Cam = { S: mix(92, 104, z), cx: 540, cy: mix(1040, 1120, z) };

  // ---- phases ----
  const plateIn = pr(t, 0.0, 0.7, GLIDE);
  const gridLines = pr(t, 0.15, 0.85, DRAW);
  const toGrid = (n: number) => pr(t, 1.3 + n * 0.025, 2.15 + n * 0.025, MOVE);
  const wave = (n: number) => { const g = GRID[n]; const d = (g.x + g.y + 3) / 6; const c = 2.15 + d * 0.45; return Math.exp(-Math.pow((t - c) / 0.12, 2)); };
  const cool = pr(t, 2.6, 3.0, SWAP);
  const dissolve = (n: number) => pr(t, 2.95 + ((GRID[n].x + GRID[n].y + 3) / 6) * 0.25, 3.35 + ((GRID[n].x + GRID[n].y + 3) / 6) * 0.25, SWAP);
  const seed = pr(t, 3.25, 3.55, GLIDE) * (1 - pr(t, 4.6, 4.9, SWAP));
  const ripple = pr(t, 3.3, 4.1, Easing.out(Easing.cubic));
  const scaffold = pr(t, 3.45, 4.45, DRAW);
  const heroDrop = (n: number) => pr(t, 4.55 + n * 0.12, 5.15 + n * 0.12, GLIDE);
  const settled = pr(t, 5.45, 5.95, SIN);
  const bloom = pr(t, 5.6, 6.4, SIN);
  const sweep = pr(t, 5.85, 6.55, SIN);

  // ---- cubes ----
  const cubes: Cube[] = [];
  GRID.forEach((g, n) => {
    const land = pr(t, 0.35 + DROP[n].d, 1.05 + DROP[n].d, Easing.out(Easing.cubic));
    const sc = SCAT[n], tg = toGrid(n);
    const cxw = mix(sc.x, g.x, tg), cyw = mix(sc.y, g.y, tg);
    const dis = dissolve(n);
    const s = SMALL * (1 - dis);
    const zz = mix(DROP[n].h, 0, land) - 0.25 * dis;
    cubes.push({ id: `g${n}`, x: cxw - s / 2, y: cyw - s / 2, z: Math.max(0, zz), s, tint: mixC(GREEN, CLEAR, cool), a: (t < 0.35 + DROP[n].d ? 0 : pr(t, 0.35 + DROP[n].d, 0.6 + DROP[n].d)) * (1 - dis), glow: wave(n) });
  });
  const idxOf = (a: number, b: number, c: number) => HERO.findIndex((q) => q[0] === a && q[1] === b && q[2] === c);
  const landed = (n: number) => (n < 0 ? 0 : pr(heroDrop(n), 0.94, 1, Easing.linear));
  HERO.forEach((h, n) => {
    const m = heroMin(h), d = heroDrop(n);
    if (t < 4.55 + n * 0.12) return;
    const me = landed(n);
    const hide = { r: Math.min(me, landed(idxOf(h[0] + 1, h[1], h[2]))), l: Math.min(me, landed(idxOf(h[0], h[1] + 1, h[2]))), t: Math.min(me, landed(idxOf(h[0], h[1], h[2] + 1))),
      b1: Math.min(me, landed(idxOf(h[0] - 1, h[1], h[2]))), b2: Math.min(me, landed(idxOf(h[0], h[1] - 1, h[2]))) };
    cubes.push({ id: `h${n}`, x: m.x, y: m.y, z: m.z + (1 - d) * 5.5, s: B, tint: GREEN, a: pr(t, 4.55 + n * 0.12, 4.8 + n * 0.12), glow: 0.25 * bloom, hide });
  });
  cubes.sort((a, b) => (a.x + a.y + a.z + 1.5 * a.s) - (b.x + b.y + b.z + 1.5 * b.s));

  // plate geometry
  const plateC = [P(cam, -HALF, -HALF, 0), P(cam, HALF, -HALF, 0), P(cam, HALF, HALF, 0), P(cam, -HALF, HALF, 0)];
  const lines: [number, number][][] = [];
  for (let k = -2; k <= 2; k++) { lines.push([P(cam, k, -HALF, 0), P(cam, k, HALF, 0)]); lines.push([P(cam, -HALF, k, 0), P(cam, HALF, k, 0)]); }
  // scaffold edges (unique) for the hero slots
  const scafEdges: [number, number, number, number, number, number][] = [];
  const seen = new Set<string>();
  const addE = (a: number[], b: number[]) => { const key = [a, b].map((q) => q.map((v) => v.toFixed(2)).join(",")).sort().join("|"); if (seen.has(key)) return; seen.add(key); scafEdges.push([a[0], a[1], a[2], b[0], b[1], b[2]]); };
  HERO.forEach((h) => { const m = heroMin(h); const X = [m.x, m.x + B], Y = [m.y, m.y + B], Z = [m.z, m.z + B];
    for (const xx of X) for (const yy of Y) addE([xx, yy, Z[0]], [xx, yy, Z[1]]);
    for (const xx of X) for (const zz of Z) addE([xx, Y[0], zz], [xx, Y[1], zz]);
    for (const yy of Y) for (const zz of Z) addE([X[0], yy, zz], [X[1], yy, zz]); });
  const scafH = scaffold * 3 * B; // grows upward
  const scafFade = 1 - settled;

  const heroCenter = P(cam, 0, 0, 1.2 * B);
  const seedP = P(cam, 0, 0, 0);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw3/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(248,249,250,.025) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.025) 1.5px,transparent 1.5px)", backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(48% 30% at 50% ${(cam.cy / 1920) * 100 - 2}%, rgba(28,228,155,${0.1 * plateIn + 0.08 * bloom}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.45))" }} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="isoSheenT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.38} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.06} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <linearGradient id="isoSheenL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.2} /><stop offset="0.6" stopColor="#fff" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.12} /></linearGradient>
          <linearGradient id="isoSheenR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.1} /><stop offset="0.7" stopColor="#000" stopOpacity={0.05} /><stop offset="1" stopColor="#000" stopOpacity={0.22} /></linearGradient>
          <linearGradient id="isoSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.28} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <linearGradient id="isoPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a2f2d" /><stop offset="1" stopColor="#1b1f1d" /></linearGradient>
          <filter id="isoBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="isoBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
        </defs>

        {/* plate */}
        <g opacity={plateIn} transform={`translate(0 ${(1 - plateIn) * 40})`}>
          <polygon points={poly(plateC.map(([x, y]) => [x, y + 16]))} fill="#141615" opacity={0.9} />
          <polygon points={poly(plateC)} fill="url(#isoPlate)" stroke="rgba(180,247,202,.35)" strokeWidth={2} />
          {lines.map((l, n) => <line key={n} x1={l[0][0]} y1={l[0][1]} x2={mix(l[0][0], l[1][0], gridLines)} y2={mix(l[0][1], l[1][1], gridLines)} stroke="rgba(180,247,202,.12)" strokeWidth={1.2} />)}
          {/* front rim thickness */}
          <polygon points={poly([plateC[1], plateC[2], [plateC[2][0], plateC[2][1] + 16], [plateC[1][0], plateC[1][1] + 16]])} fill="#101211" />
          <polygon points={poly([plateC[2], plateC[3], [plateC[3][0], plateC[3][1] + 16], [plateC[2][0], plateC[2][1] + 16]])} fill="#171a19" />
          <polyline points={poly([plateC[1], plateC[2], plateC[3]])} fill="none" stroke="rgba(180,247,202,.5)" strokeWidth={2} />
        </g>

        {/* caustics + contact shadows on the plate */}
        <g filter="url(#isoBlur)">
          {cubes.map((c) => { if (c.a <= 0.01) return null; const near = Math.max(0, 1 - c.z / 4);
            const fp = [P(cam, c.x, c.y, 0), P(cam, c.x + c.s, c.y, 0), P(cam, c.x + c.s, c.y + c.s, 0), P(cam, c.x, c.y + c.s, 0)];
            const sh = [P(cam, c.x + 0.15 * c.s, c.y + 0.25 * c.s, 0), P(cam, c.x + 1.25 * c.s, c.y + 0.25 * c.s, 0), P(cam, c.x + 1.25 * c.s, c.y + 1.35 * c.s, 0), P(cam, c.x + 0.15 * c.s, c.y + 1.35 * c.s, 0)];
            return <g key={`sh${c.id}`} opacity={c.a * near}>
              <polygon points={poly(sh)} fill="rgba(0,0,0,.55)" />
              <polygon points={poly(fp)} fill={rgba(c.tint, 0.45)} />
            </g>; })}
        </g>

        {/* seed + ripple */}
        {seed > 0 && <g>
          <ellipse cx={seedP[0]} cy={seedP[1]} rx={14 * seed} ry={7 * seed} fill="#1CE49B" style={{ filter: "drop-shadow(0 0 10px rgba(28,228,155,.9))" }} />
          {ripple < 1 && <ellipse cx={seedP[0]} cy={seedP[1]} rx={330 * ripple} ry={165 * ripple} fill="none" stroke="#1CE49B" strokeWidth={3 * (1 - ripple) + 0.5} opacity={0.8 * (1 - ripple)} />}
        </g>}

        {/* dashed scaffold, grows upward */}
        {scaffold > 0 && scafFade > 0 && <g opacity={scafFade} stroke="#1CE49B" strokeWidth={2} strokeDasharray="6 7" strokeLinecap="round">
          {scafEdges.map((e, n) => {
            const z0 = Math.min(e[2], e[5]), z1 = Math.max(e[2], e[5]);
            if (z0 > scafH + 1e-6) return null;
            let b = [e[3], e[4], e[5]]; const a = [e[0], e[1], e[2]];
            if (z1 > scafH) { const q = (scafH - z0) / (z1 - z0); const lo = e[2] < e[5] ? a : b, hi = e[2] < e[5] ? b : a; b = [mix(lo[0], hi[0], q), mix(lo[1], hi[1], q), mix(lo[2], hi[2], q)]; return (() => { const p0 = P(cam, lo[0], lo[1], lo[2]), p1 = P(cam, b[0], b[1], b[2]); return <line key={n} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} opacity={0.75} />; })(); }
            const p0 = P(cam, a[0], a[1], a[2]), p1 = P(cam, b[0], b[1], b[2]);
            return <line key={n} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} opacity={0.75} />;
          })}
        </g>}

        {/* bloom behind the finished tower */}
        {bloom > 0 && <ellipse cx={heroCenter[0]} cy={heroCenter[1]} rx={270} ry={310} fill="#1CE49B" opacity={0.28 * bloom} filter="url(#isoBloom)" />}

        {/* glass cubes, back to front */}
        {cubes.map((c) => <GlassCube key={c.id} c={c} cam={cam} sweep={c.id[0] === "h" ? sweep : 0} />)}
      </svg>
    </AbsoluteFill>
  );
};
