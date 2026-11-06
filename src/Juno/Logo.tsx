// Juno logo animation — 9:16, 60fps, 6.6s, silent, Juno Black. Locked Juno Motion style.
// Story (from the brand guide): the "o." is a senior figure, the period a junior assistant orbiting it.
// OSS-pattern geometry: square nodes on hairlines form a diamond hull -> fold into a starburst around a big
// centre square -> the square becomes the ring, one green node orbits once and docks as the period ->
// exact Junior Mark -> glides into the wordmark while J-U-N wipe out of it. Final frame = the real logo file.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const LOGO_FPS = 60;
export const LOGO_FRAMES = Math.round(6.6 * LOGO_FPS);

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const BG = "#1E1E1E", GREEN = "#1CE49B", INK = "#F8F9FA";
const NODE = "rgba(248,249,250,.55)", HAIR = "rgba(248,249,250,.14)";

// ---- Junior Mark geometry (measured from mark_green.png, 411x337) ----
const C = { x: 540, y: 880 };                 // ring centre while the mark is the hero
const S = 0.9246;                              // hero scale (mark width 380px)
const RING_C = { x: 168.5, y: 167.5 }, R_OUT = 168, R_IN = 99, DOT = { x: 372.5, y: 300, r: 36.5 };
const DOCK = { dx: (DOT.x - RING_C.x) * S, dy: (DOT.y - RING_C.y) * S };
const DOCK_R = Math.hypot(DOCK.dx, DOCK.dy), DOCK_A = Math.atan2(DOCK.dy, DOCK.dx);
// final lockup: logo 1327x337 at 1/3 screen width (360px), centred; its "o." starts at x=916
const LW = 360, LS = LW / 1327, LX = 540 - LW / 2, LY = 960 - (337 * LS) / 2, MARK_IN_LOGO = 916;

// ---- nodes ----
const N = 14, JR = 3; // JR = the junior (accent green node)
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = rng(7);
const HULL = [...Array(N)].map((_, i) => {
  if (i === 0) return [90, C.y]; if (i === 1) return [990, C.y];
  const k = i - 2, top = k % 2 === 0, col = Math.floor(k / 2), u = (col + 0.5) / 6;
  const x = mix(210, 870, u), bulge = Math.sin(Math.PI * u);
  return [x + (r() - 0.5) * 40, C.y + (top ? -1 : 1) * (120 + 200 * bulge + r() * 40)];
});
const STAR_R = [...Array(N)].map((_, i) => (i % 2 ? 300 : 370) + r() * 30);
const starAt = (i: number, t: number) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2 + ((12 * Math.max(0, t - 1.25)) * Math.PI) / 180; return [C.x + STAR_R[i] * Math.cos(a), C.y + STAR_R[i] * Math.sin(a)]; };

// background constellation (very faint, whole piece)
const BGN = [...Array(22)].map(() => [60 + r() * 960, 140 + r() * 1640]);
const BGE: [number, number][] = []; BGN.forEach((p, i) => {
  const near = BGN.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 3);
  near.forEach(([, j]) => { if (i < (j as number)) BGE.push([i, j as number]); });
});

const sq = (x: number, y: number, s: number, fill: string, op = 1) => <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={fill} opacity={op} />;

export const JunoLogo: React.FC = () => {
  const f = useCurrentFrame(); const t = f / LOGO_FPS;

  // phases
  const hullLines = pr(t, 0.25, 1.15, DRAW) * (1 - pr(t, 1.25, 1.6, SWAP));
  const toStar = pr(t, 1.25, 2.25, MOVE);
  const spokes = pr(t, 1.6, 2.2, DRAW) * (1 - pr(t, 2.4, 2.85, SWAP));
  const absorb = pr(t, 2.4, 3.1, MOVE);                     // other nodes spiral into the core
  const sqIn = pr(t, 1.45, 2.05, GLIDE);                     // centre square appears
  const round = pr(t, 2.45, 2.9, MOVE);                      // square -> disc
  const grow = pr(t, 2.5, 3.1, MOVE);                        // disc grows to ring size
  const tint = pr(t, 2.5, 2.9, SWAP);                        // off-white -> Juno Green
  const hole = pr(t, 2.85, 3.35, GLIDE);                     // disc -> ring
  const handover = pr(t, 3.9, 4.0, Easing.linear);           // vector -> exact mark file (identical geometry)
  const toLogo = pr(t, 4.3, 5.4, MOVE);                      // mark -> wordmark position
  const reveal = pr(t, 4.45, 5.4, MOVE);                     // J-U-N wipe out of the "o."
  const settle = pr(t, 4.6, 5.6, GLIDE);
  const drift = 1 + 0.02 * pr(t, 0, 6.6, Easing.linear);

  // centre shape (square -> disc -> ring), all in hero coordinates
  const size = mix(mix(0, 120, sqIn), 2 * R_OUT * S, grow);
  const rad = (size / 2) * round;
  const coreFill = `color-mix(in srgb, ${GREEN} ${tint * 100}%, ${INK})`;

  // junior: star position -> orbit (one turn) -> docks on the period
  const jStart = starAt(JR, 2.4);
  const jA0 = Math.atan2(jStart[1] - C.y, jStart[0] - C.x);
  const orbitP = pr(t, 2.45, 3.9, MOVE);
  const jAng = mix(jA0, DOCK_A + Math.PI * 2 * (jA0 > DOCK_A ? 1 : 1), orbitP);
  const jRad = mix(Math.hypot(jStart[0] - C.x, jStart[1] - C.y), DOCK_R, pr(t, 2.45, 3.6, MOVE));
  const jr = t < 2.45 ? null : { x: C.x + jRad * Math.cos(jAng), y: C.y + jRad * Math.sin(jAng), s: mix(14, DOT.r * 2 * S, pr(t, 2.6, 3.7, MOVE)), round: pr(t, 2.6, 3.3, MOVE) };

  // node positions
  const nodePos = (i: number) => { const h = HULL[i], s = starAt(i, t); return [mix(h[0], s[0], toStar), mix(h[1], s[1], toStar)]; };
  const nodeIn = (i: number) => pr(t, 0.05 + i * 0.035, 0.55 + i * 0.035, GLIDE);

  // mark image placement: hero -> final logo position
  const heroL = C.x - RING_C.x * S, heroT = C.y - RING_C.y * S;
  const finL = LX + MARK_IN_LOGO * LS, finT = LY;
  const mScale = mix(S, LS, toLogo);
  const mL = mix(heroL, finL, toLogo), mT = mix(heroT, finT, toLogo);
  const docked = t >= 5.4;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(248,249,250,.03) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(248,249,250,.03) 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: "540px 920px" }}>
        {/* faint background constellation */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} opacity={0.55 * pr(t, 0.1, 1.2)}>
          {BGE.map(([a, b], k) => <line key={k} x1={BGN[a][0]} y1={BGN[a][1]} x2={BGN[b][0]} y2={BGN[b][1]} stroke="rgba(248,249,250,.06)" strokeWidth={1.2} />)}
          {BGN.map((p, k) => sq(p[0], p[1], 7, k % 6 === 2 ? "rgba(28,228,155,.35)" : "rgba(248,249,250,.16)", 0.6 + 0.4 * Math.sin(t * 2 + k)))}
        </svg>

        {/* hero geometry */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={1 - handover * 0 /* stays until handover */}>
          {/* hull lines from the two vertices */}
          {hullLines > 0 && [...Array(N)].map((_, i) => i < 2 ? null : [0, 1].map((v) => {
            const a = nodePos(v), b = nodePos(i); return <line key={`${v}-${i}`} x1={a[0]} y1={a[1]} x2={mix(a[0], b[0], hullLines)} y2={mix(a[1], b[1], hullLines)} stroke={HAIR} strokeWidth={1.6} />; }))}
          {hullLines > 0 && <line x1={nodePos(0)[0]} y1={C.y} x2={mix(nodePos(0)[0], nodePos(1)[0], hullLines)} y2={C.y} stroke={HAIR} strokeWidth={1.6} />}
          {/* starburst spokes (retract toward the core) */}
          {spokes > 0 && [...Array(N)].map((_, i) => { if (i === JR) return null; const p = nodePos(i);
            return <line key={`s${i}`} x1={C.x} y1={C.y} x2={mix(C.x, p[0], spokes)} y2={mix(C.y, p[1], spokes)} stroke="rgba(248,249,250,.22)" strokeWidth={1.6} />; })}
          {/* nodes (all but the junior get absorbed) */}
          {[...Array(N)].map((_, i) => {
            if (i === JR && t >= 2.45) return null;
            const p = nodePos(i); const s = 14 * nodeIn(i) * (1 - absorb);
            const x = mix(p[0], C.x, absorb), y = mix(p[1], C.y, absorb);
            if (s <= 0.2) return null;
            return <g key={`n${i}`}>{sq(x, y, s, i === JR ? GREEN : NODE)}</g>;
          })}
          {/* centre: square -> disc -> ring */}
          {size > 0.5 && handover < 1 && <>
            <rect x={C.x - size / 2} y={C.y + 0.75 - size / 2} width={size} height={size} rx={rad} fill={coreFill} />
            {hole > 0 && <circle cx={C.x} cy={C.y + 0.75} r={R_IN * S * hole} fill={BG} />}
          </>}
          {/* the junior */}
          {jr && handover < 1 && <rect x={jr.x - jr.s / 2} y={jr.y - jr.s / 2} width={jr.s} height={jr.s} rx={(jr.s / 2) * jr.round} fill={GREEN} />}
          {jr && t > 2.6 && t < 3.95 && (() => { const a0 = jAng - 0.5; const pts = [...Array(12)].map((_, k) => { const a = mix(a0, jAng, k / 11); return `${C.x + jRad * Math.cos(a)},${C.y + jRad * Math.sin(a)}`; }).join(" ");
            return <polyline points={pts} fill="none" stroke={GREEN} strokeOpacity={0.35 * (1 - pr(t, 3.6, 3.95))} strokeWidth={jr.s * 0.55} strokeLinecap="round" />; })()}
        </svg>

        {/* final: faint hull settles behind the logo */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }} opacity={0.5 * settle}>
          {(() => { const L: [number, number] = [120, 960], Rr: [number, number] = [960, 960];
            const pts = [[300, 820], [430, 760], [560, 790], [700, 750], [820, 830], [300, 1110], [450, 1170], [600, 1140], [760, 1180], [840, 1090]];
            return <g>
              {pts.map((p, k) => <g key={k}><line x1={L[0]} y1={L[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /><line x1={Rr[0]} y1={Rr[1]} x2={p[0]} y2={p[1]} stroke="rgba(248,249,250,.07)" strokeWidth={1.2} /></g>)}
              {[L, Rr, ...pts].map((p, k) => sq(p[0], p[1], 9, k === 4 ? "rgba(28,228,155,.6)" : "rgba(248,249,250,.3)"))}
            </g>; })()}
        </svg>
        {/* exact Junior Mark (file) takes over where the vector matches it, then glides into the wordmark */}
        {handover > 0 && !docked && <Img src={staticFile("juno/mark_green.png")} style={{ position: "absolute", left: mL, top: mT, width: 411 * mScale, opacity: handover }} />}
        {/* wordmark: J-U-N wipe out from behind the "o." */}
        {reveal > 0 && <Img src={staticFile("juno/logo_green.png")} style={{
          position: "absolute", left: LX, top: LY, width: LW,
          clipPath: docked ? "none" : `inset(0 ${LW - MARK_IN_LOGO * LS}px 0 ${MARK_IN_LOGO * LS * (1 - reveal)}px)`,
          transform: docked ? "none" : `translateX(${(1 - reveal) * 18}px)`,
        }} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
