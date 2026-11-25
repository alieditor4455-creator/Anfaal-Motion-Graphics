// Anfaal reel 12 (108.3 s) — "gold ko nazar lag gayi" — same bold street/editorial style as reel 11.
// 0–27 s talking head: statements above the head, Roman Urdu captions on the chest.
// 27 s → end screen footage: the clip lands in a taped paper frame on a paper/halftone page, statements above, captions below.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { K, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";
import { LINES } from "./words";

const FPS = 30;
export const R12_DURATION = 108.3;
export const R12_FRAMES = Math.round(R12_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
const INK = "#0B1A11";
const bounce = (f: number, at: number) => spring({ frame: f - at, fps: FPS, config: { stiffness: 260, damping: 11, mass: 0.7 } });
const At: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);

/* ------------------------------------------------ footage: full frame (talking) → taped paper frame (screen part) */
const SCREEN_AT = 26.9;
const PUNCH = [0.05, 5.98, 12.06, 15.45, 22.02, 27.51, 39.43, 54.48, 63.1, 65.83, 74.4, 85.87, 92.39, 97.98, 103.44];
const PAPER_BG = "#EDE8DC";
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let z = interpolate(t, [0, 0.8], [1.15, 1.0], { ...clamp, easing: easeOut }) + 0.025 * Math.sin(t / 3.2);
  for (const a of PUNCH.slice(1)) { const k = f - s(a); if (k >= 0 && k < 24) z += 0.05 * Math.sin((k / 24) * Math.PI) * Math.exp(-k / 14); }
  const idx = Math.min(2600, Math.floor(t * 24) + 1);
  const k = interpolate(t, [SCREEN_AT, SCREEN_AT + 0.6], [0, 1], { ...clamp, easing: easeInOut });
  const W = mix(k, 1080, 780), H = mix(k, 1920, 1387), X = (1080 - W) / 2, Y = mix(k, 0, 300);
  const rot = mix(k, 0, -1.2) + (k ? Math.sin(t / 2.5) * 0.4 : 0);
  return (
    <AbsoluteFill style={{ background: PAPER_BG }}>
      {k > 0 ? (
        <AbsoluteFill style={{ opacity: k }}>
          <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.16) 1.6px, transparent 1.9px)", backgroundSize: "11px 11px", WebkitMaskImage: "linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)", maskImage: "linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)" }} />
          <div style={{ position: "absolute", left: -40, right: -40, top: 760, height: 520, background: BLK, transform: "rotate(-6deg)", clipPath: "polygon(0% 6%, 7% 1%, 15% 5%, 24% 0%, 33% 4%, 42% 1%, 51% 6%, 60% 2%, 69% 5%, 78% 0%, 87% 4%, 94% 1%, 100% 5%, 100% 95%, 92% 99%, 83% 94%, 74% 100%, 65% 95%, 56% 99%, 47% 94%, 38% 100%, 29% 96%, 20% 100%, 11% 95%, 0% 99%)" }} />
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, transform: `rotate(${rot}deg)`, background: "#fff", padding: mix(k, 0, 12), boxShadow: k ? `14px 16px 0 rgba(0,0,0,${0.35 * k})` : undefined }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 1080, height: 1920, transform: `translate(-50%, -50%) scale(${z * mix(k, 1, (780 - 24) / 1080)})` }}>
            <Img src={staticFile(`an12/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920, filter: "contrast(1.12) saturate(.8) brightness(.98)" }} />
          </div>
          {k < 1 ? <AbsoluteFill style={{ opacity: 1 - k, background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.4) 100%), radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.45) 100%)" }} /> : null}
        </div>
        {k > 0.5 ? <><div style={{ position: "absolute", left: -40, top: -14, width: 150, height: 44, background: "rgba(232,224,198,.88)", transform: "rotate(-32deg)", opacity: k }} /><div style={{ position: "absolute", right: -40, bottom: -10, width: 150, height: 44, background: "rgba(232,224,198,.88)", transform: "rotate(-30deg)", opacity: k }} /></> : null}
      </div>
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
    <div style={{ position: "absolute", left: 70, right: 70, top: t < SCREEN_AT ? 1560 : 1700, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 8, rowGap: 8, opacity: 1 - out }}>
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

const ST: { a: number; b: number; rows: Row[] }[] = [
  { a: 0.3, b: 5.9, rows: [{ w: "GOLD KO", size: 100, box: "black" }, { w: "NAZAR LAG GAYI?", size: 120, box: "yellow" }] },
  { a: 5.98, b: 11.9, rows: [{ w: "1 SAAL KA LOW", size: 110, box: "paper" }, { w: "BREAK", size: 160, box: "red" }] },
  { a: 12.06, b: 18.7, rows: [{ w: "FOLLOW NAHI KIYA?", size: 96, box: "black" }, { w: "LOSS", size: 180, box: "red" }] },
  { a: 22.02, b: 26.8, rows: [{ w: "SETUPS", size: 120, box: "black" }, { w: "FREE", size: 180, box: "yellow" }] },
  { a: 27.6, b: 36.3, rows: [{ w: "SELL 3535", size: 100, box: "yellow" }, { w: "TP 3480", size: 80, box: "black" }] },
  { a: 39.43, b: 48.3, rows: [{ w: "PROOF", size: 110, box: "black" }, { w: "YOUNGEST HUB", size: 80, box: "paper" }] },
  { a: 51.09, b: 57.5, rows: [{ w: "HAR VIDEO MEIN", size: 90, box: "paper" }, { w: "ANALYSIS", size: 100, box: "yellow" }] },
  { a: 63.1, b: 68.4, rows: [{ w: "PCE POSITIVE", size: 90, box: "black" }, { w: "GOLD NEGATIVE", size: 96, box: "red" }] },
  { a: 74.4, b: 77.0, rows: [{ w: "LINK", size: 110, box: "yellow" }, { w: "BIO MEIN", size: 80, box: "black" }] },
  { a: 85.87, b: 89.0, rows: [{ w: "1:4", size: 120, box: "yellow" }, { w: "RISK REWARD", size: 76, box: "black" }] },
  { a: 92.39, b: 97.9, rows: [{ w: "COURSES FREE", size: 96, box: "paper" }, { w: "YOUTUBE PE", size: 80, box: "black" }] },
  { a: 97.98, b: 103.4, rows: [{ w: "LOSS HUA?", size: 110, box: "red" }, { w: "", size: 0, box: "black" }] },
  { a: 103.44, b: 108.3, rows: [{ w: "RECOVERY", size: 110, box: "yellow" }, { w: "PLAN", size: 84, box: "black" }] },
];

export const AnfaalReel12: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    {ST.map((x, i) => <At key={i} from={x.a} to={x.b}><Statement rows={x.rows} dur={s(x.b) - s(x.a)} top={x.a < SCREEN_AT ? 110 : 40} /></At>)}
    <At from={80.2} to={83.4}><MoneyRain /></At>
    <Captions />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1872, display: "flex", justifyContent: "center" }}><div style={{ padding: "3px 12px 0", background: BLK, fontFamily: "Anton", fontSize: 24, letterSpacing: 2, color: "#fff" }}>@IMANFAALPERVAIZ</div></div>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.5) 1px, transparent 1.3px)", backgroundSize: "6px 6px", mixBlendMode: "multiply", opacity: 0.12 }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an12/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.14 }} />
    <OpenFlash />
  </AbsoluteFill>
);
const OpenFlash: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - p(f, 0, 10, easeOut);
  return k > 0.01 ? <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${0.85 * k})` }} /> : null;
};
