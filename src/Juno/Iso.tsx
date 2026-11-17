// Juno — isometric glass build (voice-over: 01.MP4, 6.38s; total 7.2s, still ending). 9:16, 60fps.
// Follows the client's "Intentional Build v8 iso" reference, rebuilt as soft rounded Juno Green glass pills (no square boxes):
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

type Cube = { id: string; x: number; y: number; z: number; s: number; tint: RGB; a: number; glow: number; h?: number; rr?: number };
// plane z=z0 as an affine matrix: draw world-space rounded rects and they project exactly
const M = (cam: Cam, z0: number) => `matrix(${C30 * cam.S},${0.5 * cam.S},${-C30 * cam.S},${0.5 * cam.S},${cam.cx},${cam.cy - z0 * cam.S})`;


// soft rounded glass pill: world footprint (x,y) size s, height h*s, corner radius rr*s
const GlassPill: React.FC<{ c: Cube; cam: Cam; band: number }> = ({ c, cam, band }) => {
  const { x, y, z, s, tint, a } = c;
  if (a <= 0.003 || s <= 0.01) return null;
  const H = (c.h ?? 1) * s, R = (c.rr ?? 0.35) * s, S = cam.S, zt = z + H;
  const lit = mixC(tint, [255, 255, 255], 0.35 * c.glow);
  const topC = mixC(lit, LIGHT, 0.55), leftC = lit, rightC = mixC(lit, DEEP, 0.5), edge = mixC(lit, [255, 255, 255], 0.65);
  const k = Math.SQRT2;
  const XL = cam.cx + C30 * S * ((x - (y + s)) + 2 * R - R * k), XR = cam.cx + C30 * S * ((x + s - y) - 2 * R + R * k);
  const Yt = cam.cy + 0.5 * S * (x + y + s) - zt * S, Yb = Yt + H * S;
  const XF = cam.cx + C30 * S * (x - y);                                   // front corner (screen x)
  const YfT = cam.cy + 0.5 * S * (x + y + 2 * s - 2 * R + R * k) - zt * S; // front-most point of the top face
  const id = c.id;
  // front half of the bottom rim (left silhouette point -> front corner -> right silhouette point), world -> screen
  const arc = (cx0: number, cy0: number, a0: number, a1: number) => [...Array(9)].map((_, i) => { const an = ((a0 + (a1 - a0) * (i / 8)) * Math.PI) / 180; return P(cam, cx0 + R * Math.cos(an), cy0 + R * Math.sin(an), z); });
  const front = [...arc(x + R, y + s - R, 135, 90), ...arc(x + s - R, y + s - R, 90, 0), ...arc(x + s - R, y + R, 0, -45)];
  const side = `M${XL} ${Yt} ` + front.map((q) => `L${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join(" ") + ` L${XR} ${Yt} Z`;
  const bw = 0.13 * s * S, bx = XF - 0.22 * s * S + band * 0.44 * s * S;
  const rect = (z0: number, inset: number, props: React.SVGProps<SVGRectElement>) => (
    <g transform={M(cam, z0)}><rect x={x + inset} y={y + inset} width={s - 2 * inset} height={s - 2 * inset} rx={Math.max(0.001, R - inset * 0.6)} vectorEffect="non-scaling-stroke" {...props} /></g>);
  return (
    <g opacity={a}>
      <defs>
        <linearGradient id={`ps${id}`} gradientUnits="userSpaceOnUse" x1={XL} y1={0} x2={XR} y2={0}>
          <stop offset="0" stopColor={rgba(mixC(leftC, LIGHT, 0.25), 1)} /><stop offset="0.46" stopColor={rgba(leftC, 1)} />
          <stop offset="0.54" stopColor={rgba(mixC(lit, rightC, 0.5), 1)} /><stop offset="1" stopColor={rgba(rightC, 1)} />
        </linearGradient>
      </defs>
      {/* back rim seen through the glass */}
      {rect(z, 0, { fill: rgba(rightC, 0.08), stroke: rgba(edge, 0.25), strokeWidth: 1.2 })}
      {/* rounded side wall */}
      <path d={side} fill={`url(#ps${id})`} opacity={0.55} />
      <path d={side} fill="url(#isoShade)" />
      {/* soft specular band down the rounded front */}
      <rect x={bx - bw / 2} y={YfT} width={bw} height={H * S} rx={bw / 2} fill="url(#isoBand)" opacity={0.55 + 0.45 * c.glow} />
      {/* top face: tinted glass + dome highlight + inner bevel */}
      <g opacity={0.62}>{rect(zt, 0, { fill: rgba(topC, 1) })}</g>
      {rect(zt, 0, { fill: "url(#isoDome)" })}
      {rect(zt, 0.1 * s, { fill: "none", stroke: "rgba(255,255,255,.24)", strokeWidth: 1 })}
      {/* outlines */}
      {rect(zt, 0, { fill: "none", stroke: rgba(edge, 0.85), strokeWidth: 1.6 })}
      <line x1={XL} y1={Yt} x2={XL} y2={Yb} stroke={rgba(edge, 0.5)} strokeWidth={1.3} />
      <line x1={XR} y1={Yt} x2={XR} y2={Yb} stroke={rgba(edge, 0.4)} strokeWidth={1.3} />
      {rect(z, 0, { fill: "none", stroke: rgba(edge, 0.5), strokeWidth: 1.4 })}
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
    cubes.push({ id: `g${n}`, h: 0.5, rr: 0.42, x: cxw - s / 2, y: cyw - s / 2, z: Math.max(0, zz), s, tint: mixC(GREEN, CLEAR, cool), a: (t < 0.35 + DROP[n].d ? 0 : pr(t, 0.35 + DROP[n].d, 0.6 + DROP[n].d)) * (1 - dis), glow: wave(n) });
  });
  const PS = B - 0.14, PO = 0.07; // pill size + gap inside each slot
  HERO.forEach((h, n) => {
    const m = heroMin(h), d = heroDrop(n);
    if (t < 4.55 + n * 0.12) return;
    cubes.push({ id: `h${n}`, h: 1, rr: 0.36, x: m.x + PO, y: m.y + PO, z: m.z + PO * 0.5 + (1 - d) * 5.5, s: PS, tint: GREEN, a: pr(t, 4.55 + n * 0.12, 4.8 + n * 0.12), glow: 0.25 * bloom });
  });
  cubes.sort((a, b) => (a.x + a.y + a.z + a.s) - (b.x + b.y + b.z + b.s));

  // plate geometry
  const plateC = [P(cam, -HALF, -HALF, 0), P(cam, HALF, -HALF, 0), P(cam, HALF, HALF, 0), P(cam, -HALF, HALF, 0)];
  const lines: [number, number][][] = [];
  for (let k = -2; k <= 2; k++) { lines.push([P(cam, k, -HALF, 0), P(cam, k, HALF, 0)]); lines.push([P(cam, -HALF, k, 0), P(cam, HALF, k, 0)]); }
  const scafH = scaffold * 3 * B; // grows upward
  const PS0 = 0.07;
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
          <linearGradient id="isoBand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.4} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <linearGradient id="isoShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.1} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.2} /></linearGradient>
          <radialGradient id="isoDome" cx="0.32" cy="0.3" r="0.75"><stop offset="0" stopColor="#fff" stopOpacity={0.42} /><stop offset="0.45" stopColor="#fff" stopOpacity={0.08} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
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
            const R0 = (c.rr ?? 0.35) * c.s;
            return <g key={`sh${c.id}`} opacity={c.a * near} transform={M(cam, 0)}>
              <rect x={c.x + 0.15 * c.s} y={c.y + 0.25 * c.s} width={c.s * 1.1} height={c.s * 1.1} rx={R0} fill="rgba(0,0,0,.55)" />
              <rect x={c.x} y={c.y} width={c.s} height={c.s} rx={R0} fill={rgba(c.tint, 0.45)} />
            </g>; })}
        </g>

        {/* seed + ripple */}
        {seed > 0 && <g>
          <ellipse cx={seedP[0]} cy={seedP[1]} rx={14 * seed} ry={7 * seed} fill="#1CE49B" style={{ filter: "drop-shadow(0 0 10px rgba(28,228,155,.9))" }} />
          {ripple < 1 && <ellipse cx={seedP[0]} cy={seedP[1]} rx={330 * ripple} ry={165 * ripple} fill="none" stroke="#1CE49B" strokeWidth={3 * (1 - ripple) + 0.5} opacity={0.8 * (1 - ripple)} />}
        </g>}

        {/* dashed scaffold, grows upward */}
        {scaffold > 0 && scafFade > 0 && <g opacity={scafFade * 0.8}>
          {HERO.map((h, n) => { const m = heroMin(h); const x = m.x + PS0, y = m.y + PS0, sz = B - 2 * PS0, R = 0.36 * sz, z0 = m.z, z1 = m.z + sz;
            const XL = cam.cx + C30 * cam.S * ((x - (y + sz)) + 2 * R - R * Math.SQRT2), XR = cam.cx + C30 * cam.S * ((x + sz - y) - 2 * R + R * Math.SQRT2);
            const Y0 = cam.cy + 0.5 * cam.S * (x + y + sz) - z0 * cam.S; const top = Math.min(z1, scafH); if (scafH < z0) return null;
            const ring = (zz: number) => <g transform={M(cam, zz)}><rect x={x} y={y} width={sz} height={sz} rx={R} fill="none" stroke="#1CE49B" strokeWidth={2} strokeDasharray="6 7" vectorEffect="non-scaling-stroke" /></g>;
            return <g key={n}>{ring(z0)}{scafH >= z1 && ring(z1)}
              {[XL, XR].map((X, q) => <line key={q} x1={X} y1={Y0} x2={X} y2={Y0 - (top - z0) * cam.S} stroke="#1CE49B" strokeWidth={2} strokeDasharray="6 7" />)}</g>; })}
        </g>}

        {/* bloom behind the finished tower */}
        {bloom > 0 && <ellipse cx={heroCenter[0]} cy={heroCenter[1]} rx={270} ry={310} fill="#1CE49B" opacity={0.28 * bloom} filter="url(#isoBloom)" />}

        {/* glass cubes, back to front */}
        {cubes.map((c) => <GlassPill key={c.id} c={c} cam={cam} band={c.id[0] === "h" ? sweep : 0.5} />)}
      </svg>
    </AbsoluteFill>
  );
};
