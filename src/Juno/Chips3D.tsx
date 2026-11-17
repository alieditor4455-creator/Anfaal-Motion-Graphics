// Juno — on-screen chips, three premium 3D directions (chips.MP4, 8.17s, 24fps, chips just below the chin):
//  A  JunoChipsDeck : thick 3D glass cards flip up into view; older cards recede back in space like a deck
//  B  JunoChipsIso  : isometric glass doc pages stack up under the chin, a 3D glass label chip tracks each point
//  C  JunoChipsHero : one thick 3D glass card that slowly turns; its content swaps point by point with a mosaic
// Same VO points/content as Chips.tsx. Every motion eases to rest; the last half-second is still.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CARDS, Card, GREEN, INK, SOFT, Mosaic, CHIPS_FPS } from "./Chips";
import { Cam, GlassPage, Sheet, P } from "./Iso";

const SRC_FPS = 24000 / 1001, SRC_N = 197;
const SMOOTH = Easing.bezier(0.16, 1, 0.3, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SIN = Easing.inOut(Easing.sin);
const pr = (t: number, a: number, b: number, e = SMOOTH) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const W = 780, H = 168, TOP = 890;
const still = (t: number) => 1 - pr(t, 7.4, 8.1, SIN); // idle motion fades to zero for a still ending

const Footage: React.FC<{ t: number }> = ({ t }) => (<>
  <Audio src={staticFile("juno/raw4/audio.m4a")} />
  <Img src={staticFile(`juno/raw4/f${String(Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1)).padStart(4, "0")}.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
  <AbsoluteFill style={{ background: `radial-gradient(62% 10% at 50% ${((TOP + H / 2 + 20) / 1920) * 100}%, rgba(0,0,0,.32), transparent 72%)` }} />
</>);

// card content (icon tile, title, subtitle, live widget, optional bar)
const Content: React.FC<{ c: Card; t: number }> = ({ c, t }) => { const Icon = c.icon; return (<>
  <div style={{ position: "absolute", left: 30, top: (H - 104) / 2, width: 104, height: 104, borderRadius: 28, display: "grid", placeItems: "center",
    background: "linear-gradient(145deg, rgba(28,228,155,.26), rgba(28,228,155,.04))", boxShadow: "inset 0 0 0 1.5px rgba(28,228,155,.5), inset 0 1.5px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,0,0,.25)" }}><Icon /></div>
  <div style={{ position: "absolute", left: 160, top: 0, bottom: 0, right: 230, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Outfit" }}>
    <div style={{ fontWeight: 500, fontSize: 36, color: INK, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{c.title}<span style={{ color: GREEN }}>.</span></div>
    <div style={{ fontWeight: 400, fontSize: 24, color: SOFT, marginTop: 6, whiteSpace: "nowrap" }}>{c.sub}</div>
  </div>
  <div style={{ position: "absolute", right: 32, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>{c.right(t)}</div>
  {c.bar && <div style={{ position: "absolute", left: 160, right: 32, bottom: 20, height: 5, borderRadius: 9, background: "rgba(248,249,250,.12)" }}>
    <div style={{ width: `${100 * c.bar(t)}%`, height: "100%", borderRadius: 9, background: GREEN, boxShadow: "0 0 10px rgba(28,228,155,.5)" }} /></div>}
</>); };

// thick glass slab with edge slices, frosted face, moving sheen
const Glass3D: React.FC<{ tf: string; sheen: number; op?: number; glow?: number; children?: React.ReactNode }> = ({ tf, sheen, op = 1, glow = 0, children }) => (
  <div style={{ position: "absolute", left: 540 - W / 2, top: TOP, width: W, height: H, transformStyle: "preserve-3d", transform: tf, opacity: op }}>
    {[14, 11, 8, 5, 2].map((z) => <div key={z} style={{ position: "absolute", inset: 0, borderRadius: 36, transform: `translateZ(${-z}px)`,
      background: z === 14 ? "rgba(6,10,8,.9)" : "transparent", boxShadow: `inset 0 0 0 2px rgba(28,228,155,${0.12 + 0.025 * (14 - z)})` }} />)}
    <div style={{ position: "absolute", inset: 0, borderRadius: 36, overflow: "hidden",
      background: "linear-gradient(140deg, rgba(66,74,70,.9) 0%, rgba(30,34,32,.92) 55%, rgba(20,24,22,.94) 100%)",
      boxShadow: `inset 0 2px 0 rgba(255,255,255,.32), inset 0 0 0 1.5px rgba(248,249,250,.16), inset 0 -30px 60px rgba(28,228,155,${0.06 + 0.12 * glow})` }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(112deg, transparent ${sheen - 18}%, rgba(255,255,255,.11) ${sheen}%, transparent ${sheen + 18}%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 12% 115%, rgba(28,228,155,.16), transparent 70%)" }} />
      {children}
    </div>
  </div>);

// content with mosaic in/out (for swaps and reveals)
const MosaicLayer: React.FC<{ id: string; p: number; out?: boolean; children: React.ReactNode }> = ({ id, p, out, children }) => {
  if (out ? p >= 1 : p <= 0) return null;
  const clip = (out ? p > 0 : p < 1);
  return <>{clip && <Mosaic id={id} p={p} out={out} />}<div style={{ position: "absolute", inset: 0, clipPath: clip ? `url(#${id})` : undefined }}>{children}</div></>;
};

const Shadow: React.FC<{ y: number; w: number; op: number }> = ({ y, w, op }) => (
  <div style={{ position: "absolute", left: 540 - w / 2, top: y, width: w, height: 70, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(26px)", opacity: op }} />);

const Cursor: React.FC<{ t: number; bx: number; by: number }> = ({ t, bx, by }) => {
  const cIn = pr(t, 7.3, 7.76), cOut = pr(t, 7.98, 8.12, SIN); if (cIn <= 0 || cOut >= 1) return null;
  const tap = Math.sin(Math.PI * pr(t, 7.78, 7.92, Easing.linear)), rip = pr(t, 7.8, 8.12, Easing.out(Easing.cubic));
  const x = mix(bx + 220, bx, cIn), y = mix(by + 200, by, cIn);
  return <>{rip > 0 && rip < 1 && <div style={{ position: "absolute", left: bx - 60 * rip, top: by - 60 * rip, width: 120 * rip, height: 120 * rip, borderRadius: "50%", border: `2px solid ${GREEN}`, opacity: 0.8 * (1 - rip) }} />}
    <svg width={46} height={46} viewBox="0 0 30 30" style={{ position: "absolute", left: x - 6, top: y - 4, opacity: cIn * (1 - cOut), transform: `scale(${1 - 0.12 * tap})`, transformOrigin: "6px 4px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
      <path d="M3 3 L27 12 L16 16 L12 27 Z" fill={INK} stroke="#1E1E1E" strokeWidth={2} strokeLinejoin="round" /></svg></>;
};

// ================= A: 3D glass deck =================
export const JunoChipsDeck: React.FC = () => {
  const t = useCurrentFrame() / CHIPS_FPS; const idle = still(t);
  const collapse = pr(t, 7.08, 7.7, MOVE);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Footage t={t} />
      <Shadow y={TOP + H - 10} w={W * 0.9} op={pr(t, 0.1, 0.8)} />
      <div style={{ position: "absolute", inset: 0, perspective: 1300, perspectiveOrigin: `540px ${TOP + 40}px` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          {CARDS.map((c, k) => {
            if (t < c.tIn) return null;
            const e = pr(t, c.tIn, c.tIn + 0.95);
            let d = 0; CARDS.forEach((o, j) => { if (j > k && j < 4) d += pr(t, o.tIn, o.tIn + 0.85, MOVE); });
            const fin = k === 4; if (fin) d = 0;
            const op = (d > 2.6 ? 0 : 1 - 0.28 * d) * (fin ? 1 : 1 - collapse) * pr(t, c.tIn, c.tIn + 0.3);
            if (op <= 0.003) return null;
            const ry = 6 * Math.sin(t * 0.7 + k) * idle * (1 - 0.5 * d), rx = mix(78, 9, e) + 5 * d, fl = 5 * Math.sin(t * 1.1 + k * 1.7) * idle;
            const tf = `translateY(${(1 - e) * 240 - 24 * d + fl}px) translateZ(${-170 * d - (1 - e) * 120}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            const content = Math.max(0, 1 - d * 1.8) * (fin ? 1 : 1);
            return <Glass3D key={k} tf={tf} sheen={20 + 70 * e + ry * 3} op={op} glow={fin ? pr(t, 7.82, 8.1) : 0}>
              <div style={{ position: "absolute", inset: 0, opacity: content }}>
                <MosaicLayer id={`dk${k}`} p={pr(t, c.tIn + 0.1, c.tIn + 0.7, Easing.linear)}><Content c={c} t={t} /></MosaicLayer>
              </div></Glass3D>;
          })}
        </div>
      </div>
      <Cursor t={t} bx={540 + W / 2 - 115} by={TOP + H / 2 + 8} />
    </AbsoluteFill>);
};

// ================= C: one hero card that evolves =================
export const JunoChipsHero: React.FC = () => {
  const t = useCurrentFrame() / CHIPS_FPS; const idle = still(t);
  let k = 0; CARDS.forEach((c, j) => { if (t >= c.tIn) k = j; });
  const e = pr(t, 0.02, 1.0);
  const pulse = CARDS.reduce((a, c, j) => a + (j ? Math.sin(Math.PI * pr(t, c.tIn, c.tIn + 0.8, SIN)) : 0), 0);
  const ry = mix(-14, 10, pr(t, 0, 7.6, SIN)) + 7 * pulse, rx = mix(70, 10, e) - 2 * pulse;
  const tf = `translateY(${(1 - e) * 220 + 4 * Math.sin(t * 1.1) * idle}px) translateZ(${-(1 - e) * 140}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  const sw = pr(t, CARDS[k].tIn, CARDS[k].tIn + 0.6, Easing.linear);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Footage t={t} />
      <Shadow y={TOP + H - 10} w={W * 0.9} op={e} />
      <div style={{ position: "absolute", inset: 0, perspective: 1300, perspectiveOrigin: `540px ${TOP - 200}px` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          <Glass3D tf={tf} sheen={30 + ry * 3 + 40 * pr(t, 0, 8, Easing.linear)} glow={pr(t, 7.82, 8.1)}>
            {k > 0 && <MosaicLayer id={`ho${k}`} p={sw} out><Content c={CARDS[k - 1]} t={t} /></MosaicLayer>}
            <MosaicLayer id={`hi${k}`} p={k === 0 ? pr(t, 0.3, 0.95, Easing.linear) : sw}><Content c={CARDS[k]} t={t} /></MosaicLayer>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center", gap: 8 }}>
              {CARDS.map((c, j) => <div key={j} style={{ width: j === k ? 26 : 8, height: 4, borderRadius: 4, background: j <= k ? GREEN : "rgba(248,249,250,.2)", opacity: j === k ? 1 : 0.7 }} />)}
            </div>
          </Glass3D>
        </div>
      </div>
      <Cursor t={t} bx={540 + W / 2 - 115} by={TOP + H / 2 + 8} />
    </AbsoluteFill>);
};

// ================= B: isometric glass doc stack + 3D label chip =================
export const JunoChipsIso: React.FC = () => {
  const t = useCurrentFrame() / CHIPS_FPS; const idle = still(t);
  const cam: Cam = { S: 66, cx: 300, cy: 1095 };
  const PW = 1.75, PD = 2.15, PT = 0.12, GAP = 0.2;
  let k = 0; CARDS.forEach((c, j) => { if (t >= c.tIn) k = j; });
  const fin = pr(t, 7.1, 7.9, SIN);
  const sheets: Sheet[] = [];
  CARDS.forEach((c, j) => {
    if (t < c.tIn) return;
    const d = pr(t, c.tIn, c.tIn + 0.75), sq = pr(t, c.tIn + 0.3, c.tIn + 0.9, SIN);
    const top = j === k;
    const fills = top ? [0, 1, 2, 3, 4, 5].map((i) => pr(t, c.tIn + 0.35 + i * 0.08, c.tIn + 0.6 + i * 0.08, SIN)) : undefined;
    sheets.push({ id: `p${j}`, x: -PW / 2, y: -PD / 2, z: j * GAP + (1 - d) * 3.2 + 0.05 * Math.sin(t * 1.2) * idle * 0, w: PW, d: PD, th: PT,
      rot: (1 - sq) * (j % 2 ? 9 : -9), tint: [28, 228, 155], a: pr(t, c.tIn, c.tIn + 0.2), glow: 0.35 * fin, text: top, fl: pr(t, c.tIn, c.tIn + 0.4), fills });
  });
  const topZ = k * GAP + PT;
  const anchor = P(cam, PW / 2 - 0.15, -PD / 2 + 0.3, topZ);
  const e = pr(t, 0.05, 0.95);
  const ry = -22 + 4 * Math.sin(t * 0.7) * idle, rx = mix(70, 12, e);
  const chipTf = `translate(155px, 18px) translateY(${(1 - e) * 160 + 4 * Math.sin(t * 1.1) * idle}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(0.7)`;
  const sw = pr(t, CARDS[k].tIn, CARDS[k].tIn + 0.6, Easing.linear);
  const lineOp = pr(t, 0.6, 1.1);
  const chipL: [number, number] = [540 + 155 - W * 0.35 + 10, TOP + 18 + H / 2];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Footage t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="isoDome" cx="0.3" cy="0.25" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.06} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
          <filter id="cBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
        </defs>
        <ellipse cx={P(cam, 0, 0, 0)[0]} cy={P(cam, 0, 0, 0)[1] + 20} rx={150} ry={50} fill="#000" opacity={0.5 * pr(t, 0.1, 0.8)} filter="url(#cBlur)" />
        {fin > 0 && <ellipse cx={P(cam, 0, 0, topZ)[0]} cy={P(cam, 0, 0, topZ / 2)[1]} rx={160} ry={110} fill={GREEN} opacity={0.14 * fin} filter="url(#cBlur)" />}
        {sheets.map((s) => <GlassPage key={s.id} c={s} cam={cam} band={0} />)}
        {fin > 0.02 && (() => { const c0 = P(cam, 0, 0, topZ + 0.01); return <g opacity={fin}><circle cx={c0[0]} cy={c0[1] - 6} r={26 * fin} fill={GREEN} />
          <path d={`M${c0[0] - 11} ${c0[1] - 6} l7 7 l14 -15`} fill="none" stroke="#043329" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></g>; })()}
        {lineOp > 0 && <g opacity={lineOp}>
          <path d={`M${anchor[0]} ${anchor[1]} C ${anchor[0] + 50} ${anchor[1] - 10}, ${chipL[0] - 50} ${chipL[1]}, ${chipL[0]} ${chipL[1]}`} fill="none" stroke={GREEN} strokeWidth={2} strokeDasharray="5 6" />
          <circle cx={anchor[0]} cy={anchor[1]} r={6} fill={GREEN} /></g>}
      </svg>
      <div style={{ position: "absolute", inset: 0, perspective: 1300, perspectiveOrigin: `700px ${TOP - 200}px` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          <Glass3D tf={chipTf} sheen={30 + 60 * e + ry} op={pr(t, 0.05, 0.35)} glow={pr(t, 7.82, 8.1)}>
            {k > 0 && <MosaicLayer id={`io${k}`} p={sw} out><Content c={CARDS[k - 1]} t={t} /></MosaicLayer>}
            <MosaicLayer id={`ii${k}`} p={k === 0 ? pr(t, 0.25, 0.85, Easing.linear) : sw}><Content c={CARDS[k]} t={t} /></MosaicLayer>
          </Glass3D>
        </div>
      </div>
    </AbsoluteFill>);
};
