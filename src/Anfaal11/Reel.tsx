// Anfaal reel 11 (56.2 s) — ATM / "money is the man" — bouncing kinetic typography + clean English captions.
// Bold street/editorial theme: Anton in black boxes + yellow highlighter, torn paper strips with tape, halftone grit.
// Head ≈ 480–840 px: statements slam on the wall ABOVE the head,
// English captions (translated from Urdu) bounce word-by-word on the dark jacket below the face.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { K, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";
import { LINES } from "./words";

const FPS = 30;
export const R11_DURATION = 56.12;
export const R11_FRAMES = Math.round(R11_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
const INK = "#0B1A11";
const bounce = (f: number, at: number) => spring({ frame: f - at, fps: FPS, config: { stiffness: 260, damping: 11, mass: 0.7 } });
const At: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);

/* ------------------------------------------------ footage + punch zooms */
const PUNCH = [0.05, 8.22, 11.16, 19.1, 24.84, 27.84, 33.44, 36.08, 44.3, 51.43];
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // smooth drift + a quick bounce-zoom on every statement
  let z = interpolate(t, [0, 0.8], [1.15, 1.0], { ...clamp, easing: easeOut }) + 0.03 * Math.sin(t / 3.2);
  for (const a of PUNCH.slice(1)) { const k = f - s(a); if (k >= 0 && k < 24) z += 0.06 * Math.sin((k / 24) * Math.PI) * Math.exp(-k / 14); }
  const idx = Math.min(1685, f + 1);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 700px" }}>
      <Img src={staticFile(`an11/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920, filter: "contrast(1.14) saturate(.72) brightness(.97)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.4) 100%), radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ editorial kit: black boxes, yellow highlighter, torn paper, tape */
const YEL = "#FFE419", BLK = "#0A0A0A", PAPER = "#F3EFE6", RED = "#E8231B";
const tear = (seed: number) => {
  // jagged top/bottom edges for a torn-paper strip
  const r = (n: number) => Math.abs(Math.sin(seed * 9.13 + n * 3.71) * 43758.5453) % 1;
  const top = Array.from({ length: 15 }, (_, i) => `${(i / 14) * 100}% ${r(i) * 7}%`);
  const bot = Array.from({ length: 15 }, (_, i) => `${100 - (i / 14) * 100}% ${100 - r(i + 30) * 7}%`);
  return `polygon(${[...top, ...bot].join(",")})`;
};
const Tape: React.FC<{ x: string; rot: number }> = ({ x, rot }) => (
  <div style={{ position: "absolute", left: x, top: -18, width: 90, height: 34, background: "rgba(235,228,205,.78)", transform: `rotate(${rot}deg)`, boxShadow: "0 2px 4px rgba(0,0,0,.15)" }} />
);
type Box = "black" | "yellow" | "paper" | "red";
const boxStyle = (k: Box): React.CSSProperties =>
  k === "yellow" ? { background: YEL, color: BLK } : k === "paper" ? { background: PAPER, color: BLK } : k === "red" ? { background: RED, color: "#fff" } : { background: BLK, color: "#fff" };

/* ------------------------------------------------ English captions: each word slams in its own box */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.06 && t < Math.min(LINES[k + 1]?.t0 ?? 1e9, l.t1 + 0.5));
  if (i < 0) return null;
  const line = LINES[i];
  const end = Math.min(LINES[i + 1]?.t0 ?? 1e9, line.t1 + 0.5);
  const out = p(f, s(end) - 4, 4, easeIn);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1440, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 8, rowGap: 8, opacity: 1 - out }}>
      {line.words.map((w, k) => {
        const shown = f >= s(w.t) - 1;
        const b = shown ? bounce(f, s(w.t) - 1) : 0;
        const hl = shown ? p(f, s(w.t) - 1, 5, easeOut) : 0;
        const txt = w.w.toUpperCase();
        return (
          <span key={k} style={{ position: "relative", display: "inline-block", padding: "2px 14px 0", fontFamily: "Anton", fontSize: w.hero ? 74 : 62, lineHeight: 1.12, letterSpacing: 0.5, visibility: shown ? "visible" : "hidden", transform: `scale(${mix(Math.min(b, 1.2), 1.5, 1)}) rotate(${w.hero ? -2 : 0}deg)` }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${hl * 100}%`, ...boxStyle(w.hero ? "yellow" : "black"), boxShadow: w.hero ? `5px 5px 0 ${BLK}` : undefined }} />
            <span style={{ position: "relative", color: w.hero ? BLK : "#fff" }}>{txt}</span>
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------ statements: stacked editorial blocks above the head */
type Row = { w: string; size: number; box: Box; rot?: number };
const Statement: React.FC<{ rows: Row[]; dur: number; top?: number }> = ({ rows, dur, top = 110 }) => {
  const f = useCurrentFrame();
  const out = p(f, dur - 6, 6, easeIn);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - out, transform: `translateX(${out * -120}px)` }}>
      {rows.filter((r) => r.w).map((r, ri) => {
        const at = ri * 6;
        const b = bounce(f, at);
        const wipe = p(f, at, 7, easeOut);
        const rot = r.rot ?? (ri % 2 ? 2.5 : -2.5);
        const paper = r.box === "paper";
        return (
          <div key={ri} style={{ position: "relative", transform: `rotate(${rot}deg) scale(${mix(Math.min(b, 1.15), 1.6, 1)})`, opacity: Math.min(1, b * 3), filter: "drop-shadow(0 14px 18px rgba(0,0,0,.35))" }}>
            <div style={{ ...boxStyle(r.box), padding: paper ? "18px 34px 12px" : "4px 26px 0", fontFamily: "Anton", fontSize: r.size, lineHeight: 1.05, letterSpacing: 1, clipPath: paper ? tear(ri + r.w.length) : `inset(0 ${(1 - wipe) * 100}% 0 0)`, boxShadow: r.box === "yellow" ? `8px 8px 0 ${BLK}` : undefined }}>{r.w}</div>
            {paper ? <><Tape x="-30px" rot={-28} /><Tape x="calc(100% - 60px)" rot={24} /></> : null}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------ money rain: paper-cutout notes (30.25 → 33.4) */
const MoneyRain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 22 }, (_, i) => {
        const r = (n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
        const y = -260 + (f - r(1) * 30) * (16 + r(2) * 12);
        const x = r(3) * 1080 - 90 + Math.sin(f / 8 + i) * 30;
        const rot = r(4) * 360 + f * (r(5) > 0.5 ? 4 : -4);
        const sc = 0.6 + r(6) * 0.6;
        const onFace = x > 260 && x < 800 && y > 360 && y < 900;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 200, height: 92, padding: 6, background: "#fff", opacity: onFace ? 0 : 1, transform: `rotate(${rot}deg) scale(${sc})`, boxShadow: "4px 6px 0 rgba(0,0,0,.35)" }}>
            <div style={{ width: "100%", height: "100%", background: i % 3 ? "#6FA77D" : YEL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 50, color: BLK, backgroundImage: "radial-gradient(rgba(0,0,0,.25) 1.2px, transparent 1.4px)", backgroundSize: "7px 7px" }}>$</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ $100 ending */
const HundredBadge: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [4, 30], [0, 100], { ...clamp, easing: easeOut }));
  const b = bounce(f, 0), b2 = bounce(f, 14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ transform: `rotate(-3deg) scale(${mix(Math.min(b, 1.15), 1.7, 1)})`, opacity: Math.min(1, b * 3), padding: "0 36px", background: YEL, fontFamily: "Anton", fontSize: 200, lineHeight: 1.08, color: BLK, boxShadow: `10px 10px 0 ${BLK}` }}>${v}</div>
      <div style={{ marginTop: 22, transform: `rotate(2deg) scale(${mix(Math.min(b2, 1.15), 1.6, 1)})`, opacity: Math.min(1, b2 * 3), padding: "6px 26px 2px", background: BLK, fontFamily: "Anton", fontSize: 60, color: "#fff", letterSpacing: 2 }}>KAAFI HAI SHURU KE LIYE</div>
    </div>
  );
};

const ST: { a: number; b: number; rows: Row[] }[] = [
  { a: 2.5, b: 5.2, rows: [{ w: "MUSHKIL HAI", size: 96, box: "black" }, { w: "PAKISTAN MEIN?", size: 120, box: "yellow" }] },
  { a: 8.22, b: 11.1, rows: [{ w: "BHAAGO.", size: 140, box: "paper" }, { w: "KAMAO.", size: 150, box: "yellow" }] },
  { a: 11.16, b: 14.2, rows: [{ w: "PAISA =", size: 100, box: "black" }, { w: "IZZAT", size: 180, box: "paper" }] },
  { a: 19.1, b: 21.9, rows: [{ w: "PAISA HI", size: 110, box: "black" }, { w: "MARD HAI", size: 170, box: "yellow" }] },
  { a: 24.84, b: 27.8, rows: [{ w: "KOI FLEX", size: 120, box: "black" }, { w: "NAHI", size: 180, box: "paper" }] },
  { a: 27.84, b: 30.2, rows: [{ w: "20 SAAL KA", size: 110, box: "paper" }, { w: "DAILY", size: 150, box: "yellow" }] },
  { a: 33.44, b: 36.0, rows: [{ w: "TIME", size: 130, box: "black" }, { w: "WASTE?", size: 170, box: "red" }] },
  { a: 36.08, b: 39.2, rows: [{ w: "FOREX", size: 180, box: "yellow" }, { w: "SEEKHO", size: 100, box: "black" }, { w: "", size: 0, box: "black" }] },
  { a: 44.3, b: 46.6, rows: [{ w: "LINK", size: 160, box: "yellow" }, { w: "BIO MEIN", size: 120, box: "black" }] },
  { a: 46.63, b: 51.4, rows: [{ w: "ROADMAP", size: 160, box: "paper" }, { w: "MAIN DUNGA", size: 100, box: "black" }, { w: "", size: 0, box: "black" }] },
];

export const AnfaalReel11: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    {ST.map((x, i) => <At key={i} from={x.a} to={x.b}><Statement rows={x.rows} dur={s(x.b) - s(x.a)} /></At>)}
    <At from={30.25} to={33.44}><MoneyRain /></At>
    <At from={51.43} to={56.12}><HundredBadge /></At>
    <Captions />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1820, display: "flex", justifyContent: "center" }}><div style={{ padding: "4px 14px 0", background: BLK, fontFamily: "Anton", fontSize: 30, letterSpacing: 2, color: "#fff" }}>@IMANFAALPERVAIZ</div></div>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.5) 1px, transparent 1.3px)", backgroundSize: "6px 6px", mixBlendMode: "multiply", opacity: 0.12 }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an11/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.14 }} />
    <OpenFlash />
  </AbsoluteFill>
);
const OpenFlash: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - p(f, 0, 10, easeOut);
  return k > 0.01 ? <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${0.85 * k})` }} /> : null;
};
