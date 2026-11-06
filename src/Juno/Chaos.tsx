// Juno — "60-hour weeks, data entry, all hands-on deck chaos." (Dave, 4.46s take + 0.85s calm hold)
// Juno Motion Graphics skill: Juno Black, Dave only in the green window, two centred lines, no red.
// Pains stack up, then one green strike and the chaos settles into order.
//  60-hour weeks : timer ring around the window, a green arc winds faster and faster, hour ticks light,
//                  the six talent dots get dragged round with it. Note: "every. single. year."
//  data entry    : window slides left, a fan of tax forms (W-2 / 1099 / K-1) opens; dots fly in and type the fields.
//  chaos         : window back to centre; the dots burst off the form and circle Dave with tangled lines.
//  strike        : green strike through "chaos"; dots glide into the calm grid beside him; hold.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const CHAOS_FPS = 60;
export const CHAOS_FRAMES = Math.round(5.7 * CHAOS_FPS); // ends on a still hold from ~5.15s
const SRC_FPS = 24, SRC_N = 107;

[["Outfit", 400, "Outfit-400"], ["Outfit", 700, "Outfit-700"], ["Caveat", 500, "Caveat-500"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const vis = (t: number, i0: number, i1: number, o0: number, o1: number, e = GLIDE) => pr(t, i0, i1, e) * (1 - pr(t, o0, o1, SWAP));

const T = {
  bg: "#1E1E1E", green: "#1CE49B", ink: "#F8F9FA", soft: "rgba(248,249,250,.78)",
  line: "rgba(180,247,202,.55)", hair: "rgba(180,247,202,.25)", grid: "rgba(248,249,250,.03)",
  winOn: "#1CE49B", winOff: "rgba(28,228,155,.18)", bldFill: "rgba(28,228,155,.06)",
};

type R = { x: number; y: number; w: number; h: number };
const WC: R = { x: 330, y: 760, w: 420, h: 510 };
const WL: R = { x: 110, y: 820, w: 340, h: 413 };
const CROP: R = { x: 90, y: 430, w: 900, h: 1093 };
const mixR = (a: R, b: R, p: number): R => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), w: mix(a.w, b.w, p), h: mix(a.h, b.h, p) });
const SEG: [number, number, R, R][] = [[1.45, 2.2, WC, WL], [2.55, 3.25, WL, WC]];
const windowAt = (t: number) => { let r = WC; for (const [a, b, A, B] of SEG) { if (t < a) break; r = mixR(A, B, pr(t, a, b, MOVE)); } return r; };

// ---- beat 1: timer ring ----
const RC = { x: 540, y: 1015 }, RR = 430;
const wind = (t: number) => 360 * 2.6 * pr(t, 0.3, 1.45, Easing.in(Easing.quad)); // accelerating degrees
const BASE = [-90, -30, 30, 90, 150, 210];
const ringDot = (i: number, t: number) => { const a = ((BASE[i] + 0.35 * wind(t)) * Math.PI) / 180; return [RC.x + RR * Math.cos(a), RC.y + RR * Math.sin(a)]; };

// ---- beat 2: INBOX building, packets, roof pile ----
const FX = 630, FY = 840, FWD = 260, FHT = 340, BYB = WL.y + WL.h + 30; // front form box, ground at BYB
const ROWY = (r: number) => FY + 118 + r * 34;
const LINES = [[[450, 930], [630, 930]], [[450, 1030], [630, 1030]], [[450, 1130], [630, 1130]]];
const PILE = [0, 1, 2, 3, 4, 5].map((r) => [FX + 30, ROWY(r) + 9]); // field start on the front form
type Dot = { x: number; y: number; r: number };
const packetPhase = (i: number, t: number): Dot => {
  const L = LINES[i % 3], start = ringDot(i, 1.45);
  const a = pr(t, 1.45, 1.9, MOVE);                                       // ring -> line start
  const st = 1.9 + i * 0.05, b = pr(t, st, st + 0.35, MOVE);             // along the line
  const c = pr(t, st + 0.35, st + 0.62, MOVE);                            // up onto the pile
  let x = mix(start[0], L[0][0], a), y = mix(start[1], L[0][1], a);
  x = mix(x, L[1][0], b); y = mix(y, L[1][1], b);
  x = mix(x, PILE[i][0], c); y = mix(y, PILE[i][1], c);
  return { x, y, r: mix(46, 17, a) };
};
// ---- beat 3: chaos ----
const DIR = [1, -1, 1, -1, 1, -1], PH = [0.3, 1.7, 2.9, 4.1, 5.2, 0.9];
// darting around (not through) the window: clashing directions, jittered radius and speed
const chaosAt = (i: number, t: number) => {
  const th = (BASE[i] * Math.PI) / 180 + DIR[i] * (1.35 * (t - 2.55)) + 0.3 * Math.sin(1.6 * t + PH[i]);
  const k = 1 + 0.07 * Math.sin(1.8 * t + i * 1.3);
  return { x: 540 + 400 * k * Math.cos(th), y: 1040 + 420 * k * Math.sin(th) };
};
const FIN = [[190, 840], [190, 1015], [190, 1190], [890, 840], [890, 1015], [890, 1190]];
const dotAt = (i: number, t: number): Dot => {
  if (t < 1.45) { const p = ringDot(i, t); return { x: p[0], y: p[1], r: 46 * pr(t, 0.1 + i * 0.05, 0.6 + i * 0.05) }; }
  if (t < 2.55) return packetPhase(i, t);
  const pile = packetPhase(i, 2.55), c = chaosAt(i, t);
  const a = pr(t, 2.55, 3.15, MOVE);
  const ch = { x: mix(pile.x, c.x, a), y: mix(pile.y, c.y, a), r: mix(17, 40, a) };
  const s = pr(t, 4.45, 5.15, MOVE);                                       // settle into the calm grid
  return { x: mix(ch.x, FIN[i][0], s), y: mix(ch.y, FIN[i][1], s), r: mix(ch.r, 50, s) };
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
  const win = windowAt(t);
  const k = Math.max(win.w / CROP.w, win.h / CROP.h);
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const imgL = -CROP.x * k + (win.w - CROP.w * k) / 2, imgT = -CROP.y * k + (win.h - CROP.h * k) / 2;
  const intro = pr(t, 0, 0.7);
  const drift = 1 + 0.025 * pr(t, 0, 5.15, Easing.inOut(Easing.sin)); // stops: still ending
  const chaosE = vis(t, 2.8, 3.3, 4.45, 4.85);
  const sway = 0 * chaosE;

  const ring = vis(t, 0.1, 0.7, 1.45, 1.85, DRAW);
  const w = wind(t), head = -90 + w;
  const cometLen = Math.min(140, 30 + w * 0.12);
  const ticks = [...Array(12)].map((_, n) => -90 + n * 30);
  const note = vis(t, 0.55, 0.95, 1.35, 1.55);
  const bld = vis(t, 1.6, 2.15, 2.6, 2.95, MOVE);
  const links = vis(t, 1.7, 2.0, 2.6, 2.85, DRAW);
  const tangle = vis(t, 2.85, 3.3, 4.45, 4.85, DRAW);
  const arc = pr(t, 0.4, 1.4, DRAW);
  const ground = vis(t, 1.6, 2.0, 2.6, 2.95, DRAW);
  const accents = pr(t, 0.6, 1.1);

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 64, letterSpacing: "-0.02em", lineHeight: "84px", color: T.soft };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 124, letterSpacing: "-0.045em", lineHeight: "140px", color: T.ink };
  const G = (s: string) => <>{s}<span style={{ color: T.green }}>.</span></>;
  const strike = pr(t, 4.45, 4.8), dim = pr(t, 4.5, 4.95);
  const leadDim = 1 - 0.5 * dim;
  const chaosWord = (
    <span style={{ position: "relative", display: "inline-block", color: `color-mix(in srgb, ${T.ink} ${100 - dim * 62}%, transparent)` }}>
      chaos
      <span style={{ position: "absolute", left: "-4%", top: "54%", height: 14, marginTop: -7, width: `${108 * strike}%`, background: T.green, borderRadius: 99, boxShadow: "0 0 24px rgba(28,228,155,.5)" }} />
    </span>);

  const dots = [0, 1, 2, 3, 4, 5].map((i) => ({ i, d: dotAt(i, t), d0: dotAt(i, Math.max(0, t - 0.08)) }));
  const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy + r * Math.sin((a0 * Math.PI) / 180)], p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy + r * Math.sin((a1 * Math.PI) / 180)];
    return `M${p0[0]} ${p0[1]} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1[0]} ${p1[1]}`;
  };
  const tickLit = (deg: number) => { if (w < 2) return 0; let d = ((head - deg) % 360 + 360) % 360; return d < cometLen ? 1 - d / cometLen : 0; };

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw2/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${T.grid} 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />

      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: "540px 1015px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* big arc top-right */}
          {arc > 0 && <>
            <circle cx={1190} cy={470} r={330} fill="none" stroke={T.green} strokeWidth={3} opacity={0.85}
              strokeDasharray={2 * Math.PI * 330} strokeDashoffset={2 * Math.PI * 330 * (1 - arc)} transform="rotate(120 1190 470)" />
            {(() => { const a = ((150 - 30 * pr(t, 0, 5.15, Easing.inOut(Easing.sin))) * Math.PI) / 180; return <circle cx={1190 + 330 * Math.cos(a)} cy={470 + 330 * Math.sin(a)} r={17} fill={T.green} opacity={pr(t, 1.0, 1.4)} />; })()}
          </>}
          {accents > 0 && <g opacity={accents} stroke={T.green} strokeWidth={3} fill="none">
            <circle cx={150} cy={1480} r={18} /><rect x={170} y={1600} width={28} height={28} transform="rotate(45 184 1614)" /></g>}
          {/* timer ring */}
          {ring > 0 && <g opacity={ring}>
            <circle cx={RC.x} cy={RC.y} r={RR} fill="none" stroke={T.hair} strokeWidth={3} />
            {ticks.map((deg, n) => { const l = tickLit(deg); const x = RC.x + RR * Math.cos((deg * Math.PI) / 180), y = RC.y + RR * Math.sin((deg * Math.PI) / 180); const s = 12 + 6 * l;
              return <rect key={n} x={x - s / 2} y={y - s / 2} width={s} height={s} fill={`color-mix(in srgb, ${T.green} ${Math.round(l * 100)}%, rgba(248,249,250,.3))`} />; })}
            {w > 1 && <path d={arcPath(RC.x, RC.y, RR, head - cometLen, head)} fill="none" stroke={T.green} strokeWidth={7} strokeLinecap="round" />}
          </g>}
          {/* tax forms + links + ground */}
          {ground > 0 && <line x1={540 - 470 * ground} x2={540 + 470 * ground} y1={BYB} y2={BYB} stroke={T.hair} strokeWidth={3} />}
          {links > 0 && LINES.map((L, j) => <line key={j} x1={L[0][0]} y1={L[0][1]} x2={mix(L[0][0], L[1][0], links)} y2={mix(L[0][1], L[1][1], links)} stroke={T.line} strokeWidth={3} />)}
          {bld > 0 && (() => {
            const sheets: [string, number, number, number][] = [["K-1", -10, -34, -18], ["1099", 7, 30, -8], ["W-2", 0, 0, 0]];
            return <g>{sheets.map(([lab, rot, dx, dy], n) => {
              const o = n === 2 ? bld : pr(t, 1.7 + n * 0.08, 2.25 + n * 0.08, MOVE) * (1 - pr(t, 2.6, 2.95, SWAP));
              const cx = FX + FWD / 2 + dx * o, cy = FY + FHT / 2 + dy * o + (1 - bld) * 40;
              return <g key={lab} opacity={Math.min(1, o * 1.4)} transform={`rotate(${rot * o} ${cx} ${cy})`}>
                <rect x={cx - FWD / 2} y={cy - FHT / 2} width={FWD} height={FHT} rx={14} fill={T.bg} stroke={n === 2 ? T.green : T.hair} strokeWidth={n === 2 ? 5 : 3} />
                <text x={cx - FWD / 2 + 28} y={cy - FHT / 2 + 52} fontFamily="Outfit" fontWeight={700} fontSize={30} letterSpacing={3} fill={n === 2 ? T.ink : "rgba(248,249,250,.4)"}>{lab}</text>
                <line x1={cx - FWD / 2 + 28} y1={cy - FHT / 2 + 74} x2={cx + FWD / 2 - 28} y2={cy - FHT / 2 + 74} stroke={T.hair} strokeWidth={2} />
                {n === 2 && [0, 1, 2, 3, 4, 5].map((r) => { const y = ROWY(r) + (cy - FY - FHT / 2); const fill = pr(t, 2.27 + r * 0.05, 2.62 + r * 0.05, GLIDE);
                  return <g key={r}><rect x={FX + 28} y={y} width={FWD - 56} height={18} rx={5} fill="none" stroke="rgba(248,249,250,.16)" strokeWidth={2} />
                    {fill > 0 && <rect x={FX + 28} y={y} width={(FWD - 56) * fill * (0.55 + 0.45 * ((r * 37) % 10) / 10)} height={18} rx={5} fill={T.green} opacity={0.85} />}</g>; })}
              </g>; })}</g>;
          })()}
          {/* tangled lines in the chaos */}
          {tangle > 0 && dots.map(({ i, d }) => [2, 3].map((o) => { const e = dots[(i + o) % 6].d; return <line key={`${i}-${o}`} x1={d.x} y1={d.y} x2={mix(d.x, e.x, tangle)} y2={mix(d.y, e.y, tangle)} stroke={T.hair} strokeWidth={2.5} />; }))}
          {/* dots + trails (behind the window) */}
          <defs>{dots.map(({ i, d, d0 }) => <linearGradient key={i} id={`ct${i}`} gradientUnits="userSpaceOnUse" x1={d0.x} y1={d0.y} x2={d.x} y2={d.y}>
            <stop offset="0" stopColor={T.green} stopOpacity={0} /><stop offset="1" stopColor={T.green} stopOpacity={0.3} /></linearGradient>)}</defs>
          {dots.map(({ i, d, d0 }) => d.r <= 0.3 ? null : <g key={i}>
            {Math.hypot(d.x - d0.x, d.y - d0.y) > 6 && <line x1={d0.x} y1={d0.y} x2={d.x} y2={d.y} stroke={`url(#ct${i})`} strokeWidth={d.r * 1.6} strokeLinecap="round" />}
            <circle cx={d.x} cy={d.y} r={d.r} fill={T.green} /></g>)}
        </svg>

        {/* window */}
        <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, overflow: "hidden", borderRadius: 10,
          boxShadow: `0 0 0 8px ${T.green}, 0 30px 80px rgba(0,0,0,.35)`, opacity: intro, transform: `scale(${mix(0.9, 1, intro)}) rotate(${sway}deg)` }}>
          <Img src={staticFile(`juno/raw2/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", left: imgL, top: imgT, width: 1080 * k, height: 1920 * k }} />
        </div>

        {note > 0 && <div style={{ position: "absolute", left: 120, top: 545, opacity: note, transform: `rotate(-5deg) translateY(${(1 - note) * 18}px)`, fontFamily: "Caveat", fontWeight: 500, fontSize: 54, color: T.ink, whiteSpace: "nowrap" }}>
          every. single. year.
          <svg width={220} height={140} style={{ position: "absolute", left: 230, top: 64, overflow: "visible" }}>
            <path d="M10 4 C 30 60, 70 92, 150 104" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={190} strokeDashoffset={190 * (1 - pr(t, 0.7, 1.05, DRAW))} />
            <path opacity={pr(t, 1.0, 1.15)} d="M126 90 L150 104 L126 118" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg></div>}
      </AbsoluteFill>

      {/* two centred lines */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <div style={{ opacity: leadDim }}>
          <Roll t={t} h={84} cls={lead} items={[[0.1, "60-hour"], [1.5, "data"], [2.6, "all hands on deck"]]} />
        </div>
        <Roll t={t} h={146} cls={main} items={[[0.65, G("weeks")], [1.5, null], [1.9, G("entry")], [2.6, null], [3.7, chaosWord]]} />
      </div>
    </AbsoluteFill>
  );
};
