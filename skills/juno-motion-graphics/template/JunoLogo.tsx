// Juno logo animation — 9:16, 60fps, 4.6s, silent, Juno Black. Locked Juno Motion style.
// Fast pull-back from inside the Junior Mark (green ring band fills the screen) with motion streaks on the
// OSS-pattern geometry rushing past; lands on the centred "o.". The junior (period) whips once around the
// senior (ring), lighting the nodes it passes, docks with a ripple; vector hands over to the exact mark file;
// the mark glides into place while N-U-J slide out of their own masks. Final frame = real logo file, 1/3 width.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const LOGO_FPS = 60;
export const LOGO_FRAMES = Math.round(4.6 * LOGO_FPS);

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const ZOOM = Easing.bezier(0.35, 0, 0.1, 1);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const BG = "#1E1E1E", GREEN = "#1CE49B";

// ---- Junior Mark geometry (measured from mark_green.png 411x337; it matches the logo's "o." at x=916 exactly) ----
const C = { x: 540, y: 960 }; // ring centred on screen the whole time
const S = 0.9246;
const RING_C = { x: 168.5, y: 167.5 }, R_OUT = 168, R_IN = 99, DOT = { x: 372.5, y: 300, r: 36.5 };
const DOCK = { dx: (DOT.x - RING_C.x) * S, dy: (DOT.y - RING_C.y) * S };
const DOCK_R = Math.hypot(DOCK.dx, DOCK.dy), DOCK_A = Math.atan2(DOCK.dy, DOCK.dx);
const FIT = 0.75;
const LW = 360, LS = LW / 1327, LX = 540 - LW / 2, LY = 960 - (337 * LS) / 2, MARK_IN_LOGO = 916;
const LETTERS: [number, number][] = [[611, 862], [306, 549], [0, 244]]; // N, U, J (closest to the "o." first)

// ---- timeline ----
const Z0 = 0, Z1 = 1.3;           // zoom out
const O0 = 1.3, O1 = 2.2;         // junior orbit
const H0 = 2.28, H1 = 2.43;       // vector -> file handover (camera nearly still)
const G0 = 2.45, G1 = 3.15;       // glide into the wordmark
const LT0 = 2.95, LSTAG = 0.07, LDUR = 0.45; // letters start once the mark has nearly landed
const DOCKED = LT0 + 2 * LSTAG + LDUR + 0.02;

// camera zoom as a function of time (log-space), plus a tiny settle drift
const zoomAt = (t: number) => Math.exp(Math.log(4.5) * (1 - pr(t, Z0, Z1, ZOOM))) * mix(1.03, 1, pr(t, 0, 4.6, Easing.bezier(0.2, 0, 0.3, 1)));

// ---- geometry ----
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(11);
const MID = [...Array(16)].map((_, i) => { const a = (i / 16) * Math.PI * 2 + r() * 0.25; const d = 330 + r() * 260; return { x: C.x + d * Math.cos(a), y: C.y + d * Math.sin(a), a }; });
const DUST = [...Array(40)].map(() => { const a = r() * Math.PI * 2, d = 160 + r() * 900; return { x: C.x + d * Math.cos(a), y: C.y + d * Math.sin(a) }; });
const HULL_L = [C.x - 520, C.y], HULL_R = [C.x + 520, C.y];
const FAR = [...Array(26)].map(() => [-200 + r() * 1480, -300 + r() * 2500]);
const FAR_E: [number, number][] = []; FAR.forEach((p, i) => {
  FAR.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j] as [number, number]).sort((a, b) => a[0] - b[0]).slice(1, 3)
    .forEach(([, j]) => { if (i < j) FAR_E.push([i, j]); });
});
const angDist = (a: number, b: number) => { let d = (a - b) % (Math.PI * 2); if (d < -Math.PI) d += Math.PI * 2; if (d > Math.PI) d -= Math.PI * 2; return Math.abs(d); };

export const JunoLogo: React.FC = () => {
  const f = useCurrentFrame(); const t = f / LOGO_FPS;

  const e1 = pr(t, Z0, Z1, ZOOM);
  const z = zoomAt(t), zPrev = zoomAt(Math.max(0, t - 1 / 30));
  const F = { x: C.x, y: C.y }, A = { x: 540, y: 960 };
  const Fp = { x: C.x, y: C.y, ay: 960 };
  const cam = `translate(${A.x}px, ${A.y}px) scale(${z}) translate(${-F.x}px, ${-F.y}px)`;
  const toScreen = (p: { x: number; y: number }) => ({ x: (p.x - F.x) * z + A.x, y: (p.y - F.y) * z + A.y });
  const toScreenPrev = (p: { x: number; y: number }) => ({ x: (p.x - Fp.x) * zPrev + 540, y: (p.y - Fp.y) * zPrev + Fp.ay });
  const zb = Math.pow(z, 0.35);
  const camFar = `translate(540px, 960px) scale(${zb}) translate(-540px, -960px)`;
  const speed = Math.min(1, Math.abs(Math.log(zPrev / z)) * 9);           // 0..1, how fast the camera is moving

  const geoIn = pr(t, 0.05, 0.9, GLIDE);
  const geoOut = pr(t, G0, G1, SWAP);
  const orbitP = pr(t, O0, O1, MOVE);
  const handover = pr(t, H0, H1, Easing.linear);
  const toLogo = pr(t, G0, G1, MOVE);
  const docked = t >= DOCKED;
  const settle = pr(t, 2.7, 3.7, GLIDE);
  const ripple = pr(t, O1 - 0.05, O1 + 0.6, Easing.out(Easing.cubic));

  // junior
  const jA = DOCK_A + Math.PI * 2 * orbitP;
  const bulge = 80 * Math.sin(Math.PI * orbitP);
  const jx = C.x + (DOCK_R + bulge) * Math.cos(jA), jy = C.y + FIT + (DOCK_R + bulge) * Math.sin(jA);
  const trailOp = 0.32 * Math.sin(Math.PI * orbitP);
  const trail = trailOp > 0.002 ? [...Array(16)].map((_, k) => { const p = Math.max(0, orbitP - 0.12 * (1 - k / 15)); const a = DOCK_A + Math.PI * 2 * p, rr = DOCK_R + 80 * Math.sin(Math.PI * p); return `${C.x + rr * Math.cos(a)},${C.y + FIT + rr * Math.sin(a)}`; }).join(" ") : null;

  const heroL = C.x - RING_C.x * S, heroT = C.y - RING_C.y * S;
  const mScale = mix(S, LS, toLogo);
  const mL = mix(heroL, LX + MARK_IN_LOGO * LS, toLogo), mT = mix(heroT, LY, toLogo);
  const ringPath = (cx: number, cy: number) => { const ro = R_OUT * S, ri = R_IN * S;
    return `M${cx - ro} ${cy} a${ro} ${ro} 0 1 0 ${2 * ro} 0 a${ro} ${ro} 0 1 0 ${-2 * ro} 0 Z M${cx - ri} ${cy} a${ri} ${ri} 0 1 1 ${2 * ri} 0 a${ri} ${ri} 0 1 1 ${-2 * ri} 0 Z`; };

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* static screen grid (no scaling -> no shimmer) */}
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(248,249,250,.03) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.03) 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />

      {/* deep constellation, slow parallax */}
      <AbsoluteFill style={{ transform: camFar, transformOrigin: "0 0" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={0.6 * pr(t, 0.1, 1.0)}>
          {FAR_E.map(([a, b], k) => <line key={k} x1={FAR[a][0]} y1={FAR[a][1]} x2={FAR[b][0]} y2={FAR[b][1]} stroke="rgba(248,249,250,.06)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />)}
          {FAR.map((p, k) => <rect key={k} x={p[0] - 3.5} y={p[1] - 3.5} width={7} height={7} fill={k % 7 === 3 ? "rgba(28,228,155,.4)" : "rgba(248,249,250,.16)"} opacity={0.65 + 0.35 * Math.sin(t * 2.4 + k)} />)}
        </svg>
      </AbsoluteFill>

      {/* motion streaks: true screen-space trails of world points while the camera rushes back */}
      {speed > 0.01 && <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[...DUST, ...MID].map((p, k) => { const a = toScreen(p), b = toScreenPrev(p);
          return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k % 9 === 4 ? GREEN : "rgba(248,249,250,1)"} strokeOpacity={0.16 * speed * geoIn} strokeWidth={2} strokeLinecap="round" />; })}
      </svg>}

      {/* world layer */}
      <AbsoluteFill style={{ transform: cam, transformOrigin: "0 0" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g opacity={geoIn * (1 - geoOut * 0.8)}>
            {MID.map((p, k) => <line key={`s${k}`} x1={C.x} y1={C.y} x2={p.x} y2={p.y} stroke="rgba(248,249,250,.07)" strokeWidth={1.3} vectorEffect="non-scaling-stroke" />)}
            {MID.map((p, k) => k % 2 ? null : <g key={`h${k}`}>
              <line x1={HULL_L[0]} y1={HULL_L[1]} x2={p.x} y2={p.y} stroke="rgba(248,249,250,.05)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
              <line x1={HULL_R[0]} y1={HULL_R[1]} x2={p.x} y2={p.y} stroke="rgba(248,249,250,.05)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" /></g>)}
            {[HULL_L, HULL_R].map((p, k) => <rect key={`v${k}`} x={p[0] - 5} y={p[1] - 5} width={10} height={10} fill="rgba(248,249,250,.3)" />)}
            {/* nodes light up as the junior passes them */}
            {MID.map((p, k) => { const lit = orbitP > 0 && orbitP < 1 ? Math.exp(-Math.pow(angDist(jA, Math.atan2(p.y - C.y, p.x - C.x)) / 0.3, 2)) : 0;
              const s = 10 + 8 * lit; return <rect key={`n${k}`} x={p.x - s / 2} y={p.y - s / 2} width={s} height={s}
                fill={`color-mix(in srgb, ${GREEN} ${Math.round(Math.max(lit, k === 4 ? 0.7 : 0) * 100)}%, rgba(248,249,250,.3))`} />; })}
          </g>
          {handover < 1 && <g>
            <path d={ringPath(C.x, C.y + FIT)} fill={GREEN} fillRule="evenodd" />
            {trail && <polyline points={trail} fill="none" stroke={GREEN} strokeOpacity={trailOp} strokeWidth={DOT.r * S * 1.1} strokeLinecap="round" strokeLinejoin="round" />}
            <circle cx={jx} cy={jy} r={DOT.r * S} fill={GREEN} />
          </g>}
          {ripple > 0 && ripple < 1 && <circle cx={C.x + DOCK.dx} cy={C.y + FIT + DOCK.dy} r={DOT.r * S + 120 * ripple} fill="none" stroke={GREEN} strokeWidth={4 * (1 - ripple) + 0.5} opacity={0.7 * (1 - ripple)} />}
        </svg>

        {/* faint hull settling behind the final logo */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={0.5 * settle}>
          {(() => { const L = [120, 960], Rr = [960, 960];
            const pts = [[300, 820], [430, 760], [560, 790], [700, 750], [820, 830], [300, 1110], [450, 1170], [600, 1140], [760, 1180], [840, 1090]];
            return <g>
              {pts.map((p, k) => <g key={k}><line x1={L[0]} y1={L[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /><line x1={Rr[0]} y1={Rr[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /></g>)}
              {[L, Rr, ...pts].map((p, k) => <rect key={k} x={p[0] - 4.5} y={p[1] - 4.5} width={9} height={9} fill={k === 4 ? "rgba(28,228,155,.6)" : "rgba(248,249,250,.3)"} />)}
            </g>; })()}
        </svg>

        {/* exact mark file (from the handover until the dock) */}
        {handover > 0 && !docked && <Img src={staticFile("juno/mark_green.png")} style={{ position: "absolute", left: mL, top: mT, width: 411 * mScale, opacity: handover }} />}
        {/* N, U, J slide out of their own masks, staggered */}
        {!docked && <div style={{ position: "absolute", left: 0, top: 0, width: Math.max(0, mL - 2), height: 1920, overflow: "hidden" }}>{LETTERS.map(([x0, x1], k) => { const p = pr(t, LT0 + k * LSTAG, LT0 + k * LSTAG + LDUR, GLIDE); if (p <= 0) return null;
          const off = (1 - p) * (x1 - x0 + 60) * LS;
          return <div key={k} style={{ position: "absolute", left: LX + x0 * LS - 1, top: LY - 2, width: (x1 - x0) * LS + 3, height: 337 * LS + 4, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: off, top: 0, width: (x1 - x0) * LS + 3, height: 337 * LS + 4, overflow: "hidden" }}>
              <Img src={staticFile("juno/logo_green.png")} style={{ position: "absolute", left: -x0 * LS + 1, top: 2, width: LW }} />
            </div>
          </div>; })}</div>}
        {/* docked: the real logo file, one piece */}
        {docked && <Img src={staticFile("juno/logo_green.png")} style={{ position: "absolute", left: LX, top: LY, width: LW }} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
