// Anfaal reel 11 (56.2 s) — ATM / "money is the man" — bouncing kinetic typography + clean English captions.
// Head ≈ 480–840 px: big statements bounce on the bright wall ABOVE the head (dark ink + green/gold),
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
const GRAD = `linear-gradient(100deg, #1FB96A 0%, ${K.hue} 40%, ${K.gold} 100%)`;
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
      <Img src={staticFile(`an11/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0) 62%, rgba(0,0,0,.42) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ English captions: word-by-word bounce on the jacket */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.06 && t < Math.min(LINES[k + 1]?.t0 ?? 1e9, l.t1 + 0.5));
  if (i < 0) return null;
  const line = LINES[i];
  const end = Math.min(LINES[i + 1]?.t0 ?? 1e9, line.t1 + 0.5);
  const out = p(f, s(end) - 4, 4, easeIn);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 4, opacity: 1 - out, transform: `scale(${mix(out, 1, 0.9)})` }}>
      {line.words.map((w, k) => {
        const b = bounce(f, s(w.t) - 1);
        if (f < s(w.t) - 1) return <span key={k} style={{ visibility: "hidden", fontFamily: "Inter", fontWeight: 900, fontSize: w.hero ? 76 : 62 }}>{w.w}</span>;
        const txt = w.w.toUpperCase();
        return (
          <span key={k} style={{ display: "inline-block", fontFamily: "Inter", fontWeight: 900, fontSize: w.hero ? 76 : 62, letterSpacing: -1.5, lineHeight: 1.12, transform: `translateY(${(1 - b) * 40}px) scale(${b}) rotate(${(1 - b) * (k % 2 ? 8 : -8)}deg)`, transformOrigin: "50% 80%" }}>
            {w.hero ? (
              <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 0 rgba(0,0,0,.8)) drop-shadow(0 8px 18px rgba(0,0,0,.6))" }}>{txt}</span>
            ) : (
              <span style={{ color: "#fff", textShadow: "0 3px 0 rgba(0,0,0,.75), 0 8px 22px rgba(0,0,0,.65)" }}>{txt}</span>
            )}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------ big bouncing statements above the head */
type Row = { w: string; size: number; grad?: boolean; red?: boolean; ink?: boolean };
const Statement: React.FC<{ rows: Row[]; dur: number; top?: number; step?: number }> = ({ rows, dur, top = 120, step = 4 }) => {
  const f = useCurrentFrame();
  const out = p(f, dur - 7, 7, easeIn);
  let n = 0;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out, transform: `translateY(${-out * 40}px) scale(${mix(out, 1, 0.92)})`, filter: out ? `blur(${out * 8}px)` : undefined }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: "flex", gap: r.size * 0.22, justifyContent: "center" }}>
          {r.w.split(" ").map((word, wi) => {
            const at = (n++) * step;
            const b = bounce(f, at);
            const col = r.red ? "#E5172F" : INK;
            return (
              <span key={wi} style={{ display: "inline-block", fontFamily: "Anton", fontSize: r.size, lineHeight: 1.0, letterSpacing: 1, opacity: Math.min(1, b * 2), transform: `translateY(${(1 - b) * -80}px) scale(${mix(Math.min(b, 1.3), 0.2, 1)}) rotate(${(1 - b) * (wi % 2 ? 10 : -10)}deg)`, transformOrigin: "50% 100%" }}>
                {r.grad ? (
                  <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 5px 0 #0B3A22) drop-shadow(0 14px 22px rgba(0,0,0,.35))", padding: "0 4px" }}>{word}</span>
                ) : (
                  <span style={{ color: col, textShadow: "0 5px 0 rgba(255,255,255,.65), 0 14px 26px rgba(0,0,0,.25)" }}>{word}</span>
                )}
              </span>
            );
          })}
        </div>
      ))}
      <Underline at={n * step + 2} />
    </div>
  );
};
const Underline: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const d = p(f, at, 10, easeInOut);
  return (
    <svg width={520} height={40} style={{ marginTop: 6 }}>
      <defs><linearGradient id="ul" x1="0" x2="1"><stop offset="0" stopColor="#1FB96A" /><stop offset="1" stopColor={K.gold} /></linearGradient></defs>
      <path d="M 10 26 Q 140 6 260 20 T 510 14" fill="none" stroke="url(#ul)" strokeWidth={10} strokeLinecap="round" strokeDasharray={560} strokeDashoffset={560 * (1 - d)} />
    </svg>
  );
};

/* ------------------------------------------------ money rain (30.25 → 33.4) */
const MoneyRain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 26 }, (_, i) => {
        const r = (n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
        const y = -260 + (f - r(1) * 30) * (16 + r(2) * 12);
        const x = r(3) * 1080 - 90 + Math.sin(f / 8 + i) * 30;
        const rot = r(4) * 360 + f * (r(5) > 0.5 ? 4 : -4);
        const sc = 0.6 + r(6) * 0.6;
        // keep the face box clear (x 300–800, y 420–880)
        const onFace = x > 260 && x < 800 && y > 360 && y < 900;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 190, height: 90, borderRadius: 10, opacity: onFace ? 0 : 0.95, background: "linear-gradient(135deg, #7FD99A, #2F9E5B)", border: "3px solid #D8F5DF", transform: `rotate(${rot}deg) scale(${sc}) rotateX(${Math.sin(f / 5 + i) * 50}deg)`, boxShadow: "0 10px 20px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 50, color: "#E9FFF0" }}>$</div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ $100 counter badge */
const HundredBadge: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [4, 30], [0, 100], { ...clamp, easing: easeOut }));
  const b = bounce(f, 0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${b})` }}>
      <div style={{ fontFamily: "Anton", fontSize: 230, lineHeight: 1, backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 0 #0B3A22) drop-shadow(0 16px 30px rgba(0,0,0,.35))" }}>${v}</div>
      <div style={{ marginTop: -6, padding: "8px 26px", borderRadius: 999, background: INK, fontFamily: "Inter", fontWeight: 900, fontSize: 36, color: "#fff", letterSpacing: 3, transform: `scale(${bounce(f, 18)})` }}>IS ENOUGH TO START</div>
    </div>
  );
};

const ST: { a: number; b: number; rows: Row[] }[] = [
  { a: 2.5, b: 5.2, rows: [{ w: "HARD IN", size: 120 }, { w: "PAKISTAN?", size: 160, grad: true }] },
  { a: 8.22, b: 11.1, rows: [{ w: "CHASE IT.", size: 150 }, { w: "EARN IT.", size: 150, grad: true }] },
  { a: 11.16, b: 14.2, rows: [{ w: "MONEY =", size: 120 }, { w: "RESPECT", size: 170, grad: true }] },
  { a: 19.1, b: 21.9, rows: [{ w: "MONEY IS", size: 130 }, { w: "THE MAN", size: 180, grad: true }] },
  { a: 24.84, b: 27.8, rows: [{ w: "NOT A", size: 120 }, { w: "FLEX", size: 200, grad: true }] },
  { a: 27.84, b: 30.2, rows: [{ w: "20 YEARS OLD", size: 120 }, { w: "DAILY", size: 160, grad: true }] },
  { a: 33.44, b: 36.0, rows: [{ w: "WASTING", size: 130, red: true }, { w: "TIME?", size: 170, red: true }] },
  { a: 36.08, b: 39.2, rows: [{ w: "START", size: 120 }, { w: "FOREX", size: 190, grad: true }] },
  { a: 44.3, b: 46.6, rows: [{ w: "LINK", size: 170, grad: true }, { w: "IN BIO", size: 130 }] },
  { a: 46.63, b: 51.4, rows: [{ w: "YOUR", size: 120 }, { w: "ROADMAP", size: 170, grad: true }] },
];

export const AnfaalReel11: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    {ST.map((x, i) => <At key={i} from={x.a} to={x.b}><Statement rows={x.rows} dur={s(x.b) - s(x.a)} /></At>)}
    <At from={30.25} to={33.44}><MoneyRain /></At>
    <At from={51.43} to={56.12}><HundredBadge /></At>
    <Captions />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1830, textAlign: "center", fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,.55)" }}>@imanfaalpervaiz</div>
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an11/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.06 }} />
    <OpenFlash />
  </AbsoluteFill>
);
const OpenFlash: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - p(f, 0, 10, easeOut);
  return k > 0.01 ? <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${0.85 * k})` }} /> : null;
};
