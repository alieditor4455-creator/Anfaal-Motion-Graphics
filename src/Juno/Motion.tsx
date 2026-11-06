// Juno — "They'll attract talent, they'll retain talent, and they'll grow without hiring. Your talent isn't the problem."
// 9:16, 30fps, Dave's raw take (24fps JPEG sequence + original audio).
// Story: full-bleed Dave -> pull back into the Juno storefront (attract) -> window becomes the hanging frame
// with talent in orbit (retain) -> storefront + INBOX building, same six dots become work packets (grow without
// hiring) -> push back to full-bleed for "Your talent isn't the problem" (green strike, no red).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const JUNO_FPS = 30;
export const JUNO_FRAMES = Math.round(8.2 * JUNO_FPS);
const SRC_FPS = 24, SRC_N = 184;

[["Outfit", 400, "Outfit-400"], ["Outfit", 700, "Outfit-700"], ["Caveat", 500, "Caveat-500"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

// ---- easing library (motion spec) ----
const GLIDE = Easing.bezier(0.16, 1, 0.3, 1);
const PUSH = Easing.bezier(0.6, 0, 0.1, 1);
const SWAP = Easing.bezier(0.83, 0, 0.17, 1);
const DRAW = Easing.bezier(0.33, 0, 0.2, 1);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
// visible between an in-window and an out-window
const vis = (t: number, i0: number, i1: number, o0: number, o1: number, e = GLIDE) => pr(t, i0, i1, e) * (1 - pr(t, o0, o1, SWAP));

type Theme = "dark" | "light";
const tokens = (th: Theme) => {
  const D = th === "dark";
  return {
    D, bg: D ? "#043329" : "#F8F9FA", green: "#1CE49B", ink: D ? "#F8F9FA" : "#043329",
    soft: D ? "rgba(248,249,250,.78)" : "rgba(4,51,41,.75)", muted: D ? "rgba(248,249,250,.35)" : "rgba(4,51,41,.3)",
    line: D ? "rgba(180,247,202,.55)" : "rgba(4,51,41,.45)", hair: D ? "rgba(180,247,202,.25)" : "rgba(4,51,41,.18)",
    grid: D ? "rgba(180,247,202,.035)" : "rgba(4,51,41,.05)", scallop: D ? "#F8F9FA" : "#FFFFFF",
    winOn: D ? "#1CE49B" : "#043329", winOff: D ? "rgba(28,228,155,.18)" : "rgba(4,51,41,.22)",
    bldFill: D ? "rgba(28,228,155,.06)" : "#1CE49B",
  };
};

// ---- footage window states ----
type R = { x: number; y: number; w: number; h: number };
const FULL: R = { x: 0, y: 0, w: 1080, h: 1920 };
const W1: R = { x: 330, y: 840, w: 420, h: 510 };   // storefront (attract)
const W2: R = { x: 350, y: 830, w: 380, h: 461 };   // hanging frame (retain)
const W3: R = { x: 140, y: 930, w: 320, h: 389 };   // storefront left (grow)
const CROP: R = { x: 90, y: 430, w: 900, h: 1093 };  // head + chest of the 1080x1920 source
const mixR = (a: R, b: R, p: number): R => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), w: mix(a.w, b.w, p), h: mix(a.h, b.h, p) });
const SEG: [number, number, R, R][] = [[0.3, 1.1, FULL, W1], [1.32, 1.95, W1, W2], [2.68, 3.3, W2, W3], [4.4, 4.95, W3, FULL]];
const windowAt = (t: number) => {
  let r = FULL, full = 1;
  for (const [a, b, A, B] of SEG) {
    if (t < a) break;
    const p = pr(t, a, b, PUSH); r = mixR(A, B, p);
    full = A === FULL ? 1 - p : B === FULL ? p : 0;
  }
  return { r, full };
};

// ---- dots (the talent) ----
const C0 = { x: 540, y: 1095 };
const A1 = [[200, 880], [150, 1090], [215, 1300], [880, 880], [930, 1090], [865, 1300]];
const ORB = { x: 540, y: 1060, R: 430 };
const ORB_BASE = [-90, -150, 150, -30, 30, 90]; // each dot keeps to its own side: no crossings
const orbit = (i: number, t: number) => { const a = ((ORB_BASE[i] + 9 * (t - 1.32)) * Math.PI) / 180; return [ORB.x + ORB.R * Math.cos(a), ORB.y + ORB.R * Math.sin(a)]; };
const LINES = [[[470, 1030], [640, 960]], [[470, 1125], [640, 1125]], [[470, 1220], [640, 1290]]];
const dotAt = (i: number, t: number): { x: number; y: number; r: number; o: number } => {
  const a1 = A1[i]; const ang = Math.atan2(a1[1] - C0.y, a1[0] - C0.x);
  const s = [a1[0] + Math.cos(ang) * 900, a1[1] + Math.sin(ang) * 900];
  const st = 0.1 + i * 0.07;
  if (t < 1.32) { const p = pr(t, st, st + 1.0, GLIDE); return { x: mix(s[0], a1[0], p), y: mix(s[1], a1[1], p), r: 56, o: t < st ? 0 : 1 }; }
  if (t < 2.68) { const p = pr(t, 1.32, 1.95, PUSH); const o = orbit(i, t); return { x: mix(a1[0], o[0], p), y: mix(a1[1], o[1], p), r: 56, o: 1 }; }
  const L = LINES[i % 3];
  if (t < 3.2) { const p = pr(t, 2.68, 3.2, PUSH); const o = orbit(i, 2.68); return { x: mix(o[0], L[0][0], p), y: mix(o[1], L[0][1], p), r: mix(56, 17, p), o: 1 }; }
  const u = ((t - 3.2) * 0.85 + (i < 3 ? 0 : 0.5)) % 1;
  const fade = Math.min(1, u / 0.12, (1 - u) / 0.12);
  return { x: mix(L[0][0], L[1][0], u), y: mix(L[0][1], L[1][1], u), r: 17, o: fade * (1 - pr(t, 4.38, 4.55, SWAP)) };
};

// ---- text: two centred lines with masked rolls ----
const Roll: React.FC<{ t: number; items: [number, React.ReactNode][]; cls: React.CSSProperties; h: number }> = ({ t, items, cls, h }) => {
  let k = -1; items.forEach(([s], i) => { if (t >= s) k = i; });
  const p = k >= 0 ? pr(t, items[k][0], items[k][0] + 0.5, k === 0 ? GLIDE : SWAP) : 0;
  const prev = k > 0 ? items[k - 1][1] : null; const cur = k >= 0 ? items[k][1] : null;
  const row = (node: React.ReactNode, y: number, op: number, blur: number) => node == null ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${y}%)`, opacity: op, filter: `blur(${blur}px)` }}>{node}</div>);
  return (
    <div style={{ position: "relative", height: h, overflow: "hidden", ...cls }}>
      {row(prev, -105 * p, 1 - p, 6 * p)}
      {row(cur, 105 * (1 - p), p, 6 * (1 - p))}
    </div>);
};

export const JunoMotion: React.FC<{ theme: Theme }> = ({ theme }) => {
  const f = useCurrentFrame(); const t = f / JUNO_FPS; const T = tokens(theme);
  const { r: win, full } = windowAt(t);
  // footage crop: full frame -> head/chest crop as the window shrinks
  const c = 1 - full; const src = mixR({ x: 0, y: 0, w: 1080, h: 1920 }, CROP, c);
  const k = Math.max(win.w / src.w, win.h / src.h);
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const imgL = -src.x * k + (win.w - src.w * k) / 2, imgT = -src.y * k + (win.h - src.h * k) / 2;

  // phase visibilities
  const store1 = vis(t, 0.8, 1.15, 1.3, 1.45);
  const store3 = vis(t, 2.95, 3.35, 4.38, 4.52);
  const store = Math.max(store1, store3);
  const ground1 = vis(t, 0.7, 1.1, 1.3, 1.5, DRAW), ground3 = vis(t, 2.9, 3.3, 4.38, 4.55, DRAW);
  const string = pr(t, 1.4, 1.85, DRAW) * (1 - pr(t, 2.68, 2.95, SWAP));
  const swing = t > 1.6 && t < 2.8 ? 4.5 * Math.exp(-(t - 1.6) * 2.4) * Math.sin((t - 1.6) * Math.PI * 2 * 1.05) : 0;
  const orbitRing = vis(t, 1.45, 1.95, 2.68, 2.95, DRAW);
  const bld = vis(t, 2.95, 3.5, 4.38, 4.55);
  const links = vis(t, 3.1, 3.45, 4.38, 4.5, DRAW);
  const lit = Math.floor(interpolate(t, [3.25, 4.3], [0, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const accents = vis(t, 1.8, 2.2, 4.3, 4.5);
  const note = vis(t, 3.55, 3.95, 4.35, 4.5);
  const gradTop = Math.max(full, 0);

  // storefront geometry follows the window
  const awnW = win.w + 90, awnX = win.x - 45, awnH = win.w * 0.27, scH = win.w * 0.09;
  const awnY = win.y - awnH - scH - 6;
  const baseY = win.y + win.h, groundY = baseY + 30;

  // text
  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 64, letterSpacing: "-0.02em", lineHeight: "84px", color: T.soft };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 124, letterSpacing: "-0.045em", lineHeight: "140px", color: T.ink };
  const G = (s: string) => <>{s}<span style={{ color: T.green }}>.</span></>;
  const isnt = pr(t, 5.5, 5.85);
  const strike = pr(t, 7.0, 7.32, GLIDE), dim = pr(t, 7.05, 7.45);
  const problem = (
    <span style={{ position: "relative", display: "inline-block", color: dim > 0 ? `color-mix(in srgb, ${T.ink} ${100 - dim * 62}%, transparent)` : T.ink }}>
      problem
      <span style={{ position: "absolute", left: "-3%", top: "54%", height: 14, marginTop: -7, width: `${106 * strike}%`, background: T.green, borderRadius: 99, boxShadow: T.D ? "0 0 24px rgba(28,228,155,.55)" : "none" }} />
    </span>);

  // brackets: frame Dave when full-bleed, shrink onto the window as the camera pulls back
  const BRF: R = { x: 130, y: 600, w: 820, h: 980 };
  const br = mixR(BRF, { x: win.x - 22, y: win.y - 22, w: win.w + 44, h: win.h + 44 }, c);
  const brDraw = Math.max(pr(t, 0.05, 0.4, DRAW), pr(t, 4.7, 5.1, DRAW));
  const brOp = (1 - c) * (t < 2 ? 1 : pr(t, 4.7, 4.9));
  const ring = pr(t, 4.95, 5.5, DRAW);
  const strikeGlow = Math.sin(Math.PI * pr(t, 7.0, 7.6, Easing.linear));
  const footer = pr(t, 7.4, 7.8);
  const dots = [0, 1, 2, 3, 4, 5].map((i) => ({ i, d: dotAt(i, t), d0: dotAt(i, Math.max(0, t - 0.12)) }));

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${T.grid} 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />

      {/* back layer: ground lines, orbit, links, building, accents */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          {dots.map(({ i, d, d0 }) => (
            <linearGradient key={i} id={`tr${i}`} gradientUnits="userSpaceOnUse" x1={d0.x} y1={d0.y} x2={d.x} y2={d.y}>
              <stop offset="0" stopColor={T.green} stopOpacity={0} /><stop offset="1" stopColor={T.green} stopOpacity={0.35} />
            </linearGradient>))}
        </defs>
        {ground1 > 0 && <line x1={540 - 470 * ground1} x2={540 + 470 * ground1} y1={W1.y + W1.h + 30} y2={W1.y + W1.h + 30} stroke={T.hair} strokeWidth={3} />}
        {ground3 > 0 && <line x1={540 - 470 * ground3} x2={540 + 470 * ground3} y1={W3.y + W3.h + 30} y2={W3.y + W3.h + 30} stroke={T.hair} strokeWidth={3} />}
        {orbitRing > 0 && <circle cx={ORB.x} cy={ORB.y} r={ORB.R} fill="none" stroke={T.hair} strokeWidth={3}
          strokeDasharray={2 * Math.PI * ORB.R} strokeDashoffset={2 * Math.PI * ORB.R * (1 - orbitRing)} transform={`rotate(-90 ${ORB.x} ${ORB.y})`} />}
        {links > 0 && LINES.map((L, j) => <line key={j} x1={L[0][0]} y1={L[0][1]} x2={mix(L[0][0], L[1][0], links)} y2={mix(L[0][1], L[1][1], links)} stroke={T.line} strokeWidth={3} />)}
        {bld > 0 && (() => {
          const bx = 640, bw = 280, by0 = 790, bh = W3.y + W3.h + 30 - by0; const hh = bh * bld; const by = by0 + bh - hh;
          return (<g opacity={Math.min(1, bld * 1.5)}>
            <rect x={bx} y={by} width={bw} height={hh} rx={18} fill={T.bldFill} stroke={T.green} strokeWidth={6} />
            {bld > 0.6 && [...Array(18)].map((_, n) => { const col = n % 3, row = Math.floor(n / 3); const wy = by0 + 50 + row * 82;
              return <rect key={n} x={bx + 42 + col * 72} y={wy} width={44} height={44} rx={6} fill={n < lit ? T.winOn : T.winOff} opacity={wy > by ? 1 : 0} />; })}
            <g transform={`translate(${bx + bw / 2} ${by - 52}) rotate(-4)`} opacity={pr(t, 3.35, 3.6)}>
              <rect x={-110} y={-30} width={220} height={60} rx={6} fill={T.bg} stroke={T.ink} strokeWidth={3} />
              <text x={0} y={11} textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize={30} letterSpacing={4} fill={T.ink}>INBOX</text>
            </g></g>);
        })()}
        {accents > 0 && <g opacity={accents} stroke={T.green} strokeWidth={3} fill="none">
          <circle cx={900} cy={640} r={22} /><rect x={170} y={1530} width={30} height={30} transform="rotate(45 185 1545)" /></g>}
      </svg>

      {/* dots behind the footage window (retain/grow), so paths never cross Dave */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {t >= 1.32 && dots.map(({ i, d, d0 }) => d.o <= 0 ? null : (
          <g key={i} opacity={d.o}>
            {Math.hypot(d.x - d0.x, d.y - d0.y) > 8 && <line x1={d0.x} y1={d0.y} x2={d.x} y2={d.y} stroke={`url(#tr${i})`} strokeWidth={d.r * 1.6} strokeLinecap="round" />}
            <circle cx={d.x} cy={d.y} r={d.r} fill={T.green} />
          </g>))}
      </svg>

      {/* rig: string + footage window (swings in the retain beat) */}
      <AbsoluteFill style={{ transform: `rotate(${swing}deg)`, transformOrigin: "540px 0px" }}>
        {string > 0 && <div style={{ position: "absolute", left: 538, top: 0, width: 4, height: W2.y * string, background: T.hair }} />}
        <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, overflow: "hidden",
          borderRadius: mix(0, 10, c), boxShadow: c > 0.02 ? `0 0 0 ${8 * c}px ${T.green}` : "none" }}>
          <Img src={staticFile(`juno/raw/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", left: imgL, top: imgT, width: 1080 * k, height: 1920 * k }} />
        </div>
      </AbsoluteFill>

      {/* storefront: awning with Juno logo + scallops, base */}
      {store > 0 && <>
        <div style={{ position: "absolute", left: awnX, top: awnY, width: awnW, height: awnH + scH, transformOrigin: "50% 0", transform: `scaleY(${mix(0.2, 1, store)})`, opacity: Math.min(1, store * 1.4) }}>
          <div style={{ height: awnH, background: T.green, borderRadius: "14px 14px 0 0", display: "grid", placeItems: "center" }}>
            <Img src={staticFile("juno/logo_dark.png")} style={{ width: awnW * 0.48 }} />
          </div>
          <svg width={awnW} height={scH} style={{ display: "block" }}>
            {[...Array(9)].map((_, n) => { const w = awnW / 9; return <path key={n} d={`M${n * w} 0 h${w} v${scH * 0.35} a${w / 2} ${scH * 0.65} 0 0 1 ${-w} 0 z`} fill={T.scallop} stroke={T.D ? "none" : "#043329"} strokeWidth={2} />; })}
          </svg>
        </div>
        <div style={{ position: "absolute", left: win.x - 30, top: baseY, width: win.w + 60, height: 30, background: T.green, opacity: store, transformOrigin: "50% 100%", transform: `scaleX(${mix(0.6, 1, store)})` }} />
      </>}

      {/* opening dots fly in over the full-bleed footage */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {t < 1.32 && dots.map(({ i, d, d0 }) => d.o <= 0 ? null : (
          <g key={i} opacity={d.o}>
            {Math.hypot(d.x - d0.x, d.y - d0.y) > 8 && <line x1={d0.x} y1={d0.y} x2={d.x} y2={d.y} stroke={`url(#tr${i})`} strokeWidth={d.r * 1.6} strokeLinecap="round" />}
            <circle cx={d.x} cy={d.y} r={d.r} fill={T.green} />
          </g>))}
      </svg>

      {/* full-bleed graphics: corner brackets that become the window, talent orbit around Dave */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {brOp > 0 && (() => { const L = 78; const { x, y, w, h } = br;
          const cs = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
          return <g opacity={brOp} stroke={T.green} strokeWidth={7} strokeLinecap="round" fill="none" style={{ filter: strikeGlow > 0 ? `drop-shadow(0 0 ${18 * strikeGlow}px rgba(28,228,155,.8))` : undefined }}>
            {cs.map(([cx, cy, sx, sy], n) => <path key={n} d={`M${cx} ${cy + sy * L * brDraw} L${cx} ${cy} L${cx + sx * L * brDraw} ${cy}`} />)}</g>; })()}
        {ring > 0 && <ellipse cx={540} cy={1090} rx={470} ry={650} fill="none" stroke="rgba(248,249,250,.55)" strokeWidth={2.5} strokeDasharray="3 12" strokeLinecap="round" opacity={ring} />}
        {ring > 0 && [0, 1, 2, 3, 4, 5].map((i) => { const a = ((ORB_BASE[i] + 10 * (t - 4.95)) * Math.PI) / 180; const pop = pr(t, 5.0 + i * 0.06, 5.4 + i * 0.06);
          const pulse = 1 + 0.35 * Math.sin(Math.PI * pr(t, 7.0, 7.45, Easing.linear));
          return <circle key={i} cx={540 + 470 * Math.cos(a)} cy={1090 + 650 * Math.sin(a)} r={24 * pop * pulse} fill={T.green} stroke="rgba(248,249,250,.9)" strokeWidth={3} />; })}
      </svg>
      {footer > 0 && <>
        <AbsoluteFill style={{ opacity: footer, background: `linear-gradient(0deg, ${T.bg}E6 0%, ${T.bg}00 22%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1760, textAlign: "center", opacity: footer, transform: `translateY(${(1 - footer) * 16}px)`, fontFamily: "Outfit", fontWeight: 400, fontSize: 26, letterSpacing: "0.14em", color: T.soft }}>JUNO HANDLES · YOU ADVISE</div>
      </>}

      {/* handwritten note */}
      {note > 0 && <div style={{ position: "absolute", left: 470, top: 560, opacity: note, transform: `rotate(-4deg) translateY(${(1 - note) * 20}px)`, fontFamily: "Caveat", fontWeight: 500, fontSize: 52, color: T.ink, whiteSpace: "nowrap" }}>
        same team, more capacity
        <svg width={200} height={130} style={{ position: "absolute", left: 120, top: 62, overflow: "visible" }}>
          <path d="M10 6 C 0 60, 40 100, 110 112" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={160} strokeDashoffset={160 * (1 - pr(t, 3.75, 4.1, DRAW))} />
          {t > 4.05 && <path d="M86 98 L110 112 L88 126" fill="none" stroke={T.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />}
        </svg></div>}

      {/* text legibility over full-bleed footage */}
      <AbsoluteFill style={{ opacity: gradTop, background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg}EE 18%, ${T.bg}00 42%)` }} />

      {/* two centred lines */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <Roll t={t} h={84} cls={lead} items={[
          [0.05, "they'll attract"], [1.35, "they'll retain"], [2.75, "and they'll grow"],
          [4.62, <>your talent <span style={{ opacity: isnt, display: "inline-block", transform: `translateY(${(1 - isnt) * 30}px)` }}>isn't the</span></>],
        ]} />
        <Roll t={t} h={146} cls={main} items={[
          [0.5, G("talent")], [3.3, G("without hiring")], [4.55, null], [6.6, problem],
        ]} />
      </div>
    </AbsoluteFill>
  );
};
export const JunoDark: React.FC = () => <JunoMotion theme="dark" />;
export const JunoLight: React.FC = () => <JunoMotion theme="light" />;
