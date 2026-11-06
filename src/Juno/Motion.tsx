// Juno — "They'll attract talent, they'll retain talent, and they'll grow without hiring. Your talent isn't the problem."
// 9:16, 30fps, dark theme. The graphic world fills the screen from first to last frame; Dave only ever
// appears inside the window: storefront (attract) -> hanging frame + orbit (retain) -> storefront + INBOX,
// same six dots as work packets (grow without hiring) -> centred window, dots regroup into a calm grid
// beside him, green strike on "problem" (no red).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const JUNO_FPS = 30;
export const JUNO_FRAMES = Math.round(8.2 * JUNO_FPS);
const SRC_FPS = 24, SRC_N = 184;

[["Outfit", 400, "Outfit-400"], ["Outfit", 700, "Outfit-700"], ["Caveat", 500, "Caveat-500"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

// ---- easing (smoothed: softer curves, longer moves) ----
const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);   // entrances
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);    // camera / layout moves
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);    // text rolls, exits
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);     // lines
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const vis = (t: number, i0: number, i1: number, o0: number, o1: number, e = GLIDE) => pr(t, i0, i1, e) * (1 - pr(t, o0, o1, SWAP));

const T = {
  bg: "#043329", green: "#1CE49B", ink: "#F8F9FA", soft: "rgba(248,249,250,.78)",
  line: "rgba(180,247,202,.55)", hair: "rgba(180,247,202,.25)", grid: "rgba(180,247,202,.035)",
  winOn: "#1CE49B", winOff: "rgba(28,228,155,.18)", bldFill: "rgba(28,228,155,.06)",
};

// ---- footage window states ----
type R = { x: number; y: number; w: number; h: number };
const W1: R = { x: 330, y: 840, w: 420, h: 510 };   // storefront (attract)
const W2: R = { x: 350, y: 830, w: 380, h: 461 };   // hanging frame (retain)
const W3: R = { x: 140, y: 930, w: 320, h: 389 };   // storefront left (grow)
const W4: R = { x: 330, y: 760, w: 420, h: 510 };   // centred (reframe)
const CROP: R = { x: 90, y: 430, w: 900, h: 1093 };  // head + chest of the 1080x1920 source
const mixR = (a: R, b: R, p: number): R => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), w: mix(a.w, b.w, p), h: mix(a.h, b.h, p) });
const SEG: [number, number, R, R][] = [[1.25, 2.1, W1, W2], [2.6, 3.45, W2, W3], [4.35, 5.25, W3, W4]];
const windowAt = (t: number) => { let r = W1; for (const [a, b, A, B] of SEG) { if (t < a) break; r = mixR(A, B, pr(t, a, b, MOVE)); } return r; };

// ---- dots (the talent) ----
const C0 = { x: 540, y: 1095 };
const A1 = [[200, 880], [150, 1090], [215, 1300], [880, 880], [930, 1090], [865, 1300]];
const ORB = { x: 540, y: 1060, R: 430 };
const ORB_BASE = [-90, -150, 150, -30, 30, 90]; // each dot keeps to its own side: no crossings
const orbit = (i: number, t: number) => { const a = ((ORB_BASE[i] + 8 * (t - 1.25)) * Math.PI) / 180; return [ORB.x + ORB.R * Math.cos(a), ORB.y + ORB.R * Math.sin(a)]; };
const LINES = [[[470, 1030], [640, 960]], [[470, 1125], [640, 1125]], [[470, 1220], [640, 1290]]];
const FIN = [[190, 840], [190, 1015], [190, 1190], [890, 840], [890, 1015], [890, 1190]]; // calm grid beside him
type Dot = { x: number; y: number; r: number; o: number };
const packet = (i: number, t: number): Dot => {
  const L = LINES[i % 3]; const u = ((t - 3.35) * 0.8 + (i < 3 ? 0 : 0.5)) % 1;
  return { x: mix(L[0][0], L[1][0], u), y: mix(L[0][1], L[1][1], u), r: 17, o: Math.min(1, u / 0.12, (1 - u) / 0.12) };
};
const dotAt = (i: number, t: number): Dot => {
  const a1 = A1[i]; const ang = Math.atan2(a1[1] - C0.y, a1[0] - C0.x);
  const s = [a1[0] + Math.cos(ang) * 900, a1[1] + Math.sin(ang) * 900];
  const st = 0.1 + i * 0.07;
  if (t < 1.25) { const p = pr(t, st, st + 1.1, GLIDE); return { x: mix(s[0], a1[0], p), y: mix(s[1], a1[1], p), r: 56, o: t < st ? 0 : 1 }; }
  if (t < 2.6) { const p = pr(t, 1.25, 2.1, MOVE); const o = orbit(i, t); return { x: mix(a1[0], o[0], p), y: mix(a1[1], o[1], p), r: 56, o: 1 }; }
  if (t < 3.35) { const L = LINES[i % 3]; const p = pr(t, 2.6, 3.35, MOVE); const o = orbit(i, 2.6); return { x: mix(o[0], L[0][0], p), y: mix(o[1], L[0][1], p), r: mix(56, 17, p), o: 1 }; }
  if (t < 4.35) return packet(i, t);
  const from = packet(i, 4.35); const p = pr(t, 4.35 + i * 0.04, 5.3 + i * 0.04, MOVE);
  const pulse = 1 + 0.18 * Math.sin(Math.PI * pr(t, 7.0, 7.6, Easing.linear));
  return { x: mix(from.x, FIN[i][0], p), y: mix(from.y, FIN[i][1], p), r: mix(17, 52, p) * pulse, o: Math.max(from.o, p) };
};

// ---- text: two centred lines with soft masked rolls ----
const ROLL = 0.65;
const Roll: React.FC<{ t: number; items: [number, React.ReactNode][]; cls: React.CSSProperties; h: number }> = ({ t, items, cls, h }) => {
  let k = -1; items.forEach(([s], i) => { if (t >= s) k = i; });
  const p = k >= 0 ? pr(t, items[k][0], items[k][0] + ROLL, k === 0 ? GLIDE : SWAP) : 0;
  const prev = k > 0 ? items[k - 1][1] : null; const cur = k >= 0 ? items[k][1] : null;
  const row = (node: React.ReactNode, y: number, op: number, blur: number) => node == null ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${y}%)`, opacity: op, filter: `blur(${blur}px)` }}>{node}</div>);
  return (
    <div style={{ position: "relative", height: h, overflow: "hidden", ...cls }}>
      {row(prev, -90 * p, 1 - p, 4 * p)}
      {row(cur, 90 * (1 - p), p, 4 * (1 - p))}
    </div>);
};

export const JunoMotion: React.FC = () => {
  const f = useCurrentFrame(); const t = f / JUNO_FPS;
  const win = windowAt(t);
  const k = Math.max(win.w / CROP.w, win.h / CROP.h);
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const imgL = -CROP.x * k + (win.w - CROP.w * k) / 2, imgT = -CROP.y * k + (win.h - CROP.h * k) / 2;
  const intro = pr(t, 0.0, 0.8, GLIDE);
  const drift = 1 + 0.028 * (t / 8.2); // slow continuous camera push

  const store1 = vis(t, 0.25, 0.8, 1.25, 1.55);
  const store3 = vis(t, 2.9, 3.45, 4.3, 4.6);
  const store = Math.max(store1, store3);
  const ground1 = vis(t, 0.2, 0.8, 1.25, 1.55, DRAW), ground3 = vis(t, 2.9, 3.4, 4.3, 4.6, DRAW);
  const string = pr(t, 1.3, 1.95, DRAW) * (1 - pr(t, 2.6, 2.9, SWAP));
  const swing = t > 1.75 && t < 2.9 ? 2.6 * Math.exp(-(t - 1.75) * 1.8) * Math.sin((t - 1.75) * Math.PI * 2 * 0.8) : 0;
  const orbitRing = vis(t, 1.4, 2.1, 2.6, 2.9, DRAW);
  const bld = vis(t, 2.95, 3.6, 4.3, 4.6);
  const links = vis(t, 3.15, 3.55, 4.3, 4.5, DRAW);
  const lit = Math.floor(interpolate(t, [3.3, 4.25], [0, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const accents = Math.max(vis(t, 1.8, 2.3, 4.2, 4.45), pr(t, 5.2, 5.8));
  const note = vis(t, 3.55, 4.0, 4.25, 4.45);
  const ground4 = pr(t, 5.0, 5.6, DRAW);
  const footer = pr(t, 7.45, 8.0);

  const awnW = win.w + 90, awnX = win.x - 45, awnH = win.w * 0.27, scH = win.w * 0.09;
  const awnY = win.y - awnH - scH - 6, baseY = win.y + win.h;

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 64, letterSpacing: "-0.02em", lineHeight: "84px", color: T.soft };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 124, letterSpacing: "-0.045em", lineHeight: "140px", color: T.ink };
  const G = (s: string) => <>{s}<span style={{ color: T.green }}>.</span></>;
  const isnt = pr(t, 5.5, 5.95);
  const strike = pr(t, 7.0, 7.4, GLIDE), dim = pr(t, 7.05, 7.55);
  const problem = (
    <span style={{ position: "relative", display: "inline-block", color: `color-mix(in srgb, ${T.ink} ${100 - dim * 62}%, transparent)` }}>
      problem
      <span style={{ position: "absolute", left: "-3%", top: "54%", height: 14, marginTop: -7, width: `${106 * strike}%`, background: T.green, borderRadius: 99, boxShadow: "0 0 24px rgba(28,228,155,.5)" }} />
    </span>);

  const dots = [0, 1, 2, 3, 4, 5].map((i) => ({ i, d: dotAt(i, t), d0: dotAt(i, Math.max(0, t - 0.1)) }));
  const dotLayer = (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>{dots.map(({ i, d, d0 }) => (
        <linearGradient key={i} id={`tr${i}`} gradientUnits="userSpaceOnUse" x1={d0.x} y1={d0.y} x2={d.x} y2={d.y}>
          <stop offset="0" stopColor={T.green} stopOpacity={0} /><stop offset="1" stopColor={T.green} stopOpacity={0.3} /></linearGradient>))}</defs>
      {dots.map(({ i, d, d0 }) => d.o <= 0 ? null : (
        <g key={i} opacity={d.o}>
          {Math.hypot(d.x - d0.x, d.y - d0.y) > 8 && <line x1={d0.x} y1={d0.y} x2={d.x} y2={d.y} stroke={`url(#tr${i})`} strokeWidth={d.r * 1.6} strokeLinecap="round" />}
          <circle cx={d.x} cy={d.y} r={d.r} fill={T.green} />
        </g>))}
    </svg>);

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${T.grid} 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />

      <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: "540px 1060px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {ground1 > 0 && <line x1={540 - 470 * ground1} x2={540 + 470 * ground1} y1={W1.y + W1.h + 30} y2={W1.y + W1.h + 30} stroke={T.hair} strokeWidth={3} />}
          {ground3 > 0 && <line x1={540 - 470 * ground3} x2={540 + 470 * ground3} y1={W3.y + W3.h + 30} y2={W3.y + W3.h + 30} stroke={T.hair} strokeWidth={3} />}
          {ground4 > 0 && <line x1={540 - 470 * ground4} x2={540 + 470 * ground4} y1={W4.y + W4.h + 60} y2={W4.y + W4.h + 60} stroke={T.hair} strokeWidth={3} />}
          {orbitRing > 0 && <circle cx={ORB.x} cy={ORB.y} r={ORB.R} fill="none" stroke={T.hair} strokeWidth={3}
            strokeDasharray={2 * Math.PI * ORB.R} strokeDashoffset={2 * Math.PI * ORB.R * (1 - orbitRing)} transform={`rotate(-90 ${ORB.x} ${ORB.y})`} />}
          {links > 0 && LINES.map((L, j) => <line key={j} x1={L[0][0]} y1={L[0][1]} x2={mix(L[0][0], L[1][0], links)} y2={mix(L[0][1], L[1][1], links)} stroke={T.line} strokeWidth={3} />)}
          {bld > 0 && (() => {
            const bx = 640, bw = 280, by0 = 790, bh = W3.y + W3.h + 30 - by0; const hh = bh * bld; const by = by0 + bh - hh;
            return (<g opacity={Math.min(1, bld * 1.5)}>
              <rect x={bx} y={by} width={bw} height={hh} rx={18} fill={T.bldFill} stroke={T.green} strokeWidth={6} />
              {bld > 0.6 && [...Array(18)].map((_, n) => { const col = n % 3, row = Math.floor(n / 3); const wy = by0 + 50 + row * 82;
                return <rect key={n} x={bx + 42 + col * 72} y={wy} width={44} height={44} rx={6} fill={n < lit ? T.winOn : T.winOff} opacity={wy > by ? 1 : 0} />; })}
              <g transform={`translate(${bx + bw / 2} ${by - 52}) rotate(-4)`} opacity={pr(t, 3.4, 3.7)}>
                <rect x={-110} y={-30} width={220} height={60} rx={6} fill={T.bg} stroke={T.ink} strokeWidth={3} />
                <text x={0} y={11} textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize={30} letterSpacing={4} fill={T.ink}>INBOX</text>
              </g></g>);
          })()}
          {accents > 0 && <g opacity={accents} stroke={T.green} strokeWidth={3} fill="none">
            <circle cx={900} cy={640} r={22} /><rect x={170} y={1530} width={30} height={30} transform="rotate(45 185 1545)" /></g>}
        </svg>

        {/* dots stay behind the window so a path never crosses Dave */}
        {dotLayer}

        {/* rig: string + footage window */}
        <AbsoluteFill style={{ transform: `rotate(${swing}deg)`, transformOrigin: "540px 0px" }}>
          {string > 0 && <div style={{ position: "absolute", left: 538, top: 0, width: 4, height: W2.y * string, background: T.hair }} />}
          <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, overflow: "hidden", borderRadius: 10,
            boxShadow: `0 0 0 8px ${T.green}, 0 30px 80px rgba(0,0,0,.35)`, opacity: intro, transform: `scale(${mix(0.9, 1, intro)})` }}>
            <Img src={staticFile(`juno/raw/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", left: imgL, top: imgT, width: 1080 * k, height: 1920 * k }} />
          </div>
        </AbsoluteFill>

        {store > 0 && <>
          <div style={{ position: "absolute", left: awnX, top: awnY, width: awnW, height: awnH + scH, transformOrigin: "50% 0", transform: `scaleY(${mix(0.2, 1, store)})`, opacity: Math.min(1, store * 1.4) }}>
            <div style={{ height: awnH, background: T.green, borderRadius: "14px 14px 0 0", display: "grid", placeItems: "center" }}>
              <Img src={staticFile("juno/logo_dark.png")} style={{ width: awnW * 0.48 }} />
            </div>
            <svg width={awnW} height={scH} style={{ display: "block" }}>
              {[...Array(9)].map((_, n) => { const w = awnW / 9; return <path key={n} d={`M${n * w} 0 h${w} v${scH * 0.35} a${w / 2} ${scH * 0.65} 0 0 1 ${-w} 0 z`} fill="#F8F9FA" />; })}
            </svg>
          </div>
          <div style={{ position: "absolute", left: win.x - 30, top: baseY, width: win.w + 60, height: 30, background: T.green, opacity: store, transformOrigin: "50% 100%", transform: `scaleX(${mix(0.6, 1, store)})` }} />
        </>}

        {note > 0 && <div style={{ position: "absolute", left: 470, top: 560, opacity: note, transform: `rotate(-4deg) translateY(${(1 - note) * 20}px)`, fontFamily: "Caveat", fontWeight: 500, fontSize: 52, color: T.ink, whiteSpace: "nowrap" }}>
          same team, more capacity
          <svg width={200} height={130} style={{ position: "absolute", left: 120, top: 62, overflow: "visible" }}>
            <path d="M10 6 C 0 60, 40 100, 110 112" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={160} strokeDashoffset={160 * (1 - pr(t, 3.75, 4.15, DRAW))} />
            {t > 4.1 && <path d="M86 98 L110 112 L88 126" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />}
          </svg></div>}
      </AbsoluteFill>

      {footer > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1720, textAlign: "center", opacity: footer, transform: `translateY(${(1 - footer) * 14}px)`, fontFamily: "Outfit", fontWeight: 400, fontSize: 26, letterSpacing: "0.14em", color: T.soft }}>JUNO HANDLES · YOU ADVISE</div>}

      {/* two centred lines */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <Roll t={t} h={84} cls={lead} items={[
          [0.05, "they'll attract"], [1.3, "they'll retain"], [2.7, "and they'll grow"],
          [4.55, <>your talent <span style={{ opacity: isnt, display: "inline-block", transform: `translateY(${(1 - isnt) * 24}px)` }}>isn't the</span></>],
        ]} />
        <Roll t={t} h={146} cls={main} items={[
          [0.45, G("talent")], [3.25, G("without hiring")], [4.5, null], [6.55, problem],
        ]} />
      </div>
    </AbsoluteFill>
  );
};
export const JunoDark: React.FC = () => <JunoMotion />;
