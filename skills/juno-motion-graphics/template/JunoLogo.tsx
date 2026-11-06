// Juno logo animation — 9:16, 60fps, 6.6s, silent, Juno Black. Locked Juno Motion style.
// Opens inside the Junior Mark (screen filled by the green ring band) and pulls back — log-space zoom with
// three parallax depths of OSS-pattern geometry — landing on the centred "o.". The junior (period) orbits the
// senior (ring) once and docks; vector hands over to the exact mark file; the mark glides into the wordmark
// as J-U-N wipe out of it. Final frame = the real logo file at 1/3 screen width.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const LOGO_FPS = 60;
export const LOGO_FRAMES = Math.round(6.6 * LOGO_FPS);

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const ZOOM = Easing.bezier(0.3, 0, 0.12, 1);   // long, soft landing
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const BG = "#1E1E1E", GREEN = "#1CE49B";

// ---- Junior Mark geometry (measured from mark_green.png, 411x337) ----
const C = { x: 540, y: 900 };                  // world centre of the ring (hero)
const S = 0.9246;                              // hero scale (mark 380px wide)
const RING_C = { x: 168.5, y: 167.5 }, R_OUT = 168, R_IN = 99, DOT = { x: 372.5, y: 300, r: 36.5 };
const DOCK = { dx: (DOT.x - RING_C.x) * S, dy: (DOT.y - RING_C.y) * S };
const DOCK_R = Math.hypot(DOCK.dx, DOCK.dy), DOCK_A = Math.atan2(DOCK.dy, DOCK.dx);
const FIT = 0.75; // file ring sits 0.75px lower than the measured centre
// final lockup: logo 1327x337 at 1/3 screen width (360px), centred at y 960; its "o." starts at x=916
const LW = 360, LS = LW / 1327, LX = 540 - LW / 2, LY = 960 - (337 * LS) / 2, MARK_IN_LOGO = 916;

// ---- geometry ----
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(11);
const MID = [...Array(16)].map((_, i) => { const a = (i / 16) * Math.PI * 2 + r() * 0.25; const d = 330 + r() * 260; return [C.x + d * Math.cos(a), C.y + d * Math.sin(a)]; });
const HULL_L = [C.x - 520, C.y], HULL_R = [C.x + 520, C.y];
const FAR = [...Array(26)].map(() => [-200 + r() * 1480, -300 + r() * 2500]);
const FAR_E: [number, number][] = []; FAR.forEach((p, i) => {
  FAR.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j] as [number, number]).sort((a, b) => a[0] - b[0]).slice(1, 3)
    .forEach(([, j]) => { if (i < j) FAR_E.push([i, j]); });
});

export const JunoLogo: React.FC = () => {
  const f = useCurrentFrame(); const t = f / LOGO_FPS;

  // camera: log-space zoom from deep inside the ring band to the hero frame, plus a slow final drift
  const e1 = pr(t, 0, 2.45, ZOOM), e2 = pr(t, 0, 6.6, Easing.bezier(0.2, 0, 0.3, 1));
  const z = Math.exp(Math.log(16) * (1 - e1)) * mix(1.035, 1, e2);
  const band = { x: C.x - ((R_OUT + R_IN) / 2) * S, y: C.y + 40 };          // start focus: left band of the ring
  const F = { x: mix(band.x, C.x, e1), y: mix(band.y, C.y, e1) };
  const A = { x: 540, y: mix(960, 900, e1) };                              // screen anchor
  const cam = `translate(${A.x}px, ${A.y}px) scale(${z}) translate(${-F.x}px, ${-F.y}px)`;
  const zb = Math.pow(z, 0.35);                                            // deep layer parallax
  const camFar = `translate(540px, 960px) scale(${zb}) translate(${-540}px, ${-960}px)`;

  // phases
  const geoIn = pr(t, 0.2, 1.6, GLIDE);
  const geoOut = pr(t, 4.2, 5.2, SWAP);
  const orbitP = pr(t, 2.5, 3.7, MOVE);
  const handover = pr(t, 3.85, 3.95, Easing.linear);
  const toLogo = pr(t, 4.2, 5.3, MOVE);
  const reveal = pr(t, 4.35, 5.3, MOVE);
  const docked = t >= 5.3;
  const settle = pr(t, 4.6, 5.8, GLIDE);

  // the junior: orbits once (slight outward bulge) and docks back on the period
  const jA = DOCK_A + Math.PI * 2 * orbitP;
  const jR = DOCK_R + 70 * Math.sin(Math.PI * orbitP);
  const jx = C.x + jR * Math.cos(jA), jy = C.y + FIT + jR * Math.sin(jA);
  const trail = orbitP > 0.02 && orbitP < 0.98 ? [...Array(14)].map((_, k) => { const p = Math.max(0, orbitP - 0.09 * (1 - k / 13)); const a = DOCK_A + Math.PI * 2 * p, rr = DOCK_R + 70 * Math.sin(Math.PI * p); return `${C.x + rr * Math.cos(a)},${C.y + FIT + rr * Math.sin(a)}`; }).join(" ") : null;

  // mark file placement: hero -> final logo position (world coords, under the same camera)
  const heroL = C.x - RING_C.x * S, heroT = C.y - RING_C.y * S;
  const mScale = mix(S, LS, toLogo);
  const mL = mix(heroL, LX + MARK_IN_LOGO * LS, toLogo), mT = mix(heroT, LY, toLogo);

  const ringPath = (cx: number, cy: number) => {
    const ro = R_OUT * S, ri = R_IN * S;
    return `M${cx - ro} ${cy} a${ro} ${ro} 0 1 0 ${2 * ro} 0 a${ro} ${ro} 0 1 0 ${-2 * ro} 0 Z M${cx - ri} ${cy} a${ri} ${ri} 0 1 1 ${2 * ri} 0 a${ri} ${ri} 0 1 1 ${-2 * ri} 0 Z`;
  };

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* deep layer: grid + constellation, slow parallax */}
      <AbsoluteFill style={{ transform: camFar, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: -1200, top: -1200, right: -1200, bottom: -1200, backgroundImage: `linear-gradient(rgba(248,249,250,.03) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.03) 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px", backgroundPosition: "1200px 1200px" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={0.6 * pr(t, 0.3, 1.8)}>
          {FAR_E.map(([a, b], k) => <line key={k} x1={FAR[a][0]} y1={FAR[a][1]} x2={FAR[b][0]} y2={FAR[b][1]} stroke="rgba(248,249,250,.06)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />)}
          {FAR.map((p, k) => <rect key={k} x={p[0] - 3.5} y={p[1] - 3.5} width={7} height={7} fill={k % 7 === 3 ? "rgba(28,228,155,.4)" : "rgba(248,249,250,.16)"} opacity={0.65 + 0.35 * Math.sin(t * 1.8 + k)} />)}
        </svg>
      </AbsoluteFill>

      {/* world layer: mid geometry + the mark, under the main camera */}
      <AbsoluteFill style={{ transform: cam, transformOrigin: "0 0" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g opacity={geoIn * (1 - geoOut * 0.75)}>
            {MID.map((p, k) => <line key={`s${k}`} x1={C.x} y1={C.y} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.3} vectorEffect="non-scaling-stroke" />)}
            {MID.map((p, k) => k % 2 ? null : <g key={`h${k}`}>
              <line x1={HULL_L[0]} y1={HULL_L[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.05)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
              <line x1={HULL_R[0]} y1={HULL_R[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.05)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" /></g>)}
            {[HULL_L, HULL_R, ...MID].map((p, k) => <rect key={`n${k}`} x={p[0] - 5} y={p[1] - 5} width={10} height={10} fill={k === 6 ? "rgba(28,228,155,.7)" : "rgba(248,249,250,.3)"} />)}
          </g>
          {/* vector Junior Mark (crisp at any zoom) until it hands over to the file */}
          {handover < 1 && <g opacity={1 - handover}>
            <path d={ringPath(C.x, C.y + FIT)} fill={GREEN} fillRule="evenodd" />
            {trail && <polyline points={trail} fill="none" stroke={GREEN} strokeOpacity={0.3} strokeWidth={DOT.r * S * 1.1} strokeLinecap="round" strokeLinejoin="round" />}
            <circle cx={jx} cy={jy} r={DOT.r * S} fill={GREEN} />
          </g>}
        </svg>

        {/* the faint hull that settles behind the final logo */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={0.5 * settle}>
          {(() => { const L = [120, 960], Rr = [960, 960];
            const pts = [[300, 820], [430, 760], [560, 790], [700, 750], [820, 830], [300, 1110], [450, 1170], [600, 1140], [760, 1180], [840, 1090]];
            return <g>
              {pts.map((p, k) => <g key={k}><line x1={L[0]} y1={L[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /><line x1={Rr[0]} y1={Rr[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /></g>)}
              {[L, Rr, ...pts].map((p, k) => <rect key={k} x={p[0] - 4.5} y={p[1] - 4.5} width={9} height={9} fill={k === 4 ? "rgba(28,228,155,.6)" : "rgba(248,249,250,.3)"} />)}
            </g>; })()}
        </svg>

        {handover > 0 && !docked && <Img src={staticFile("juno/mark_green.png")} style={{ position: "absolute", left: mL, top: mT, width: 411 * mScale, opacity: handover }} />}
        {reveal > 0 && <Img src={staticFile("juno/logo_green.png")} style={{
          position: "absolute", left: LX, top: LY, width: LW,
          clipPath: docked ? "none" : `inset(0 ${LW - MARK_IN_LOGO * LS}px 0 ${MARK_IN_LOGO * LS * (1 - reveal)}px)`,
          transform: docked ? "none" : `translateX(${(1 - reveal) * 18}px)`,
        }} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
