import React from "react";
import { Easing, interpolate, staticFile } from "remotion";
import { LEXEND_CSS } from "./fontData";

// ---------- Brand tokens (sampled from ABET's own logo + client portal) ----------
export const C = {
  navy: "#0A0F19",
  navy2: "#121A2B",
  ink: "#111827",
  text: "#1F2937",
  sub: "#6B7280",
  faint: "#9CA3AF",
  line: "#E9EBF0",
  bg: "#F6F7FA",
  card: "#FFFFFF",
  red: "#B3242A", // logo / brand crimson
  redDeep: "#7A0A0A", // portal primary button
  redSoft: "#FBEAEB",
  rose: "#F6CDD1",
  green: "#16A34A",
  greenSoft: "#E8F7EE",
  amber: "#F59E0B",
  amberSoft: "#FEF3E2",
};

export const FONT = "Lexend";
if (typeof document !== "undefined" && !document.getElementById("lexend-inline")) {
  const el = document.createElement("style");
  el.id = "lexend-inline";
  el.textContent = LEXEND_CSS;
  document.head.appendChild(el);
}
const fontsLoaded: Promise<unknown> =
  typeof document === "undefined" ? Promise.resolve() : Promise.all([300, 400, 500, 600, 700].map((w) => document.fonts.load(`${w} 20px Lexend`)));
export { fontsLoaded };

// ---------- Motion ----------
export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const EO = Easing.bezier(0.3, 0, 0.12, 1); // gentle start, long glide to rest (no velocity pop)
export const EIO = Easing.bezier(0.6, 0, 0.3, 1); // ease-in-out: camera / morphs
export const EI = Easing.bezier(0.7, 0, 0.84, 0); // expo-in: exits
export const BACK = Easing.bezier(0.3, 1.25, 0.5, 1); // very soft overshoot for pops

export const tw = (f: number, a: number, b: number, ease = EO, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- Icons (lucide-style, stroke draw-on via pathLength) ----------
type El = ["p", string] | ["c", number, number, number] | ["r", number, number, number, number, number];
const ICONS: Record<string, El[]> = {
  wallet: [["p", "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"], ["p", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"]],
  userPlus: [["p", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"], ["c", 9, 7, 4], ["p", "M19 8v6"], ["p", "M22 11h-6"]],
  shieldCheck: [["p", "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"], ["p", "m9 12 2 2 4-4"]],
  shield: [["p", "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"]],
  candles: [["p", "M9 5v4"], ["r", 7, 9, 4, 6, 1], ["p", "M9 15v2"], ["p", "M17 3v2"], ["r", 15, 5, 4, 8, 1], ["p", "M17 13v3"], ["p", "M3 3v18h18"]],
  bank: [["p", "M3 22h18"], ["p", "M6 18v-7"], ["p", "M10 18v-7"], ["p", "M14 18v-7"], ["p", "M18 18v-7"], ["p", "M12 2 20 7H4z"]],
  card: [["r", 2, 5, 20, 14, 2], ["p", "M2 10h20"]],
  bitcoin: [["p", "M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"]],
  check: [["p", "M20 6 9 17l-5-5"]],
  arrowRight: [["p", "M5 12h14"], ["p", "m12 5 7 7-7 7"]],
  plus: [["p", "M5 12h14"], ["p", "M12 5v14"]],
  calendar: [["r", 3, 4, 18, 18, 2], ["p", "M16 2v4"], ["p", "M8 2v4"], ["p", "M3 10h18"]],
  users: [["p", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"], ["c", 9, 7, 4], ["p", "M22 21v-2a4 4 0 0 0-3-3.87"], ["p", "M16 3.13a4 4 0 0 1 0 7.75"]],
  bell: [["p", "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"], ["p", "M10.3 21a1.94 1.94 0 0 0 3.4 0"]],
  moon: [["p", "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"]],
  clock: [["c", 12, 12, 10], ["p", "M12 6v6l4 2"]],
  user: [["c", 12, 8, 5], ["p", "M20 21a8 8 0 0 0-16 0"]],
  grid: [["r", 3, 3, 7, 7, 1], ["r", 14, 3, 7, 7, 1], ["r", 14, 14, 7, 7, 1], ["r", 3, 14, 7, 7, 1]],
  trend: [["p", "M22 7 13.5 15.5 8.5 10.5 2 17"], ["p", "M16 7h6v6"]],
  download: [["p", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"], ["p", "M7 10l5 5 5-5"], ["p", "M12 15V3"]],
  upload: [["p", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"], ["p", "M17 8l-5-5-5 5"], ["p", "M12 3v12"]],
  swap: [["p", "M8 3 4 7l4 4"], ["p", "M4 7h16"], ["p", "m16 21 4-4-4-4"], ["p", "M20 17H4"]],
  gift: [["r", 3, 8, 18, 4, 1], ["p", "M12 8v13"], ["p", "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"], ["p", "M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"]],
  trophy: [["p", "M6 9H4.5a2.5 2.5 0 0 1 0-5H6"], ["p", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18"], ["p", "M4 22h16"], ["p", "M18 2H6v7a6 6 0 0 0 12 0V2Z"], ["p", "M12 15v7"]],
  star: [["p", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"]],
  info: [["c", 12, 12, 10], ["p", "M12 16v-4"], ["p", "M12 8h.01"]],
  copy: [["r", 8, 8, 14, 14, 2], ["p", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"]],
  globe: [["c", 12, 12, 10], ["p", "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"], ["p", "M2 12h20"]],
  menu: [["p", "M4 6h16"], ["p", "M4 12h16"], ["p", "M4 18h16"]],
  bars: [["p", "M3 3v18h18"], ["p", "M8 17v-4"], ["p", "M13 17V9"], ["p", "M18 17V5"]],
  chevron: [["p", "m6 9 6 6 6-6"]],
  lock: [["r", 3, 11, 18, 11, 2], ["p", "M7 11V7a5 5 0 0 1 10 0v4"]],
  ticket: [["p", "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"]],
  zap: [["p", "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"]],
};

export const Icon: React.FC<{ name: keyof typeof ICONS | string; size?: number; color?: string; sw?: number; draw?: number; style?: React.CSSProperties }> = ({
  name, size = 20, color = "currentColor", sw = 2, draw = 1, style,
}) => {
  const els = ICONS[name] || [];
  const dash = draw >= 1 ? {} : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0, ...style }}>
      {els.map((e, i) =>
        e[0] === "p" ? <path key={i} d={e[1]} {...dash} /> : e[0] === "c" ? <circle key={i} cx={e[1]} cy={e[2]} r={e[3]} {...dash} /> : <rect key={i} x={e[1]} y={e[2]} width={e[3]} height={e[4]} rx={e[5]} {...dash} />,
      )}
    </svg>
  );
};

// ---------- ABET logo (from brand footage): solid letters + separate bull / bear layers ----------
const SEGS: [number, number][] = [[18, 304], [306, 553], [556, 778], [778, 1022]];
export const LOGO_W = 1040;
export const LOGO_H = 290;

export type LogoState = {
  letters?: number[]; // 0..1 per letter: fade + de-blur + small rise (no masks, no holes)
  bull?: number; // 0..1 wipe left->right
  bear?: number; // 0..1 wipe bottom->top
  sweep?: number; // 0..1 light sweep position (0 = off left, 1 = off right)
  glow?: number; // 0..1 soft bloom
};
const maskStyle = (src: string, w: number, h: number, bg: string): React.CSSProperties => ({
  position: "absolute", left: 0, top: 0, width: w, height: h, background: bg,
  WebkitMaskImage: `url(${staticFile(src)})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile(src)})`, maskSize: "100% 100%",
});
export const AbetLogo: React.FC<{ width: number; ink?: string; state?: LogoState; style?: React.CSSProperties }> = ({ width, ink = "#fff", state = {}, style }) => {
  const k = width / LOGO_W;
  const H = LOGO_H * k;
  const L = state.letters ?? [1, 1, 1, 1];
  const bull = state.bull ?? 1;
  const bear = state.bear ?? 1;
  const sweep = state.sweep ?? -1;
  const glow = state.glow ?? 0;
  return (
    <div style={{ position: "relative", width, height: H, ...style }}>
      {glow > 0 && <div style={{ ...maskStyle("abet/logo_solid.png", width, H, `rgba(226,70,76,${0.55 * glow})`), filter: `blur(${18 * k + 10}px)`, transform: "scale(1.02)" }} />}
      {SEGS.map(([a, b], i) => {
        const p = L[i];
        if (p <= 0) return null;
        return (
          <div key={i} style={{ ...maskStyle("abet/logo_solid.png", width, H, ink), clipPath: `inset(-20% ${(LOGO_W - b) * k}px -20% ${a * k}px)`, opacity: p, transform: `translateY(${(1 - p) * 16 * k * 3}px) scale(${1 + (1 - p) * 0.04})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }} />
        );
      })}
      {bull > 0 && <div style={{ ...maskStyle("abet/logo_bull.png", width, H, C.red), clipPath: `inset(0 ${(1 - bull) * 100}% 0 0)` }} />}
      {bear > 0 && <div style={{ ...maskStyle("abet/logo_bear.png", width, H, C.red), clipPath: `inset(${(1 - bear) * 100}% 0 0 0)` }} />}
      {sweep > -1 && sweep < 1.2 && (
        <div style={{ ...maskStyle("abet/logo_solid.png", width, H, "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 38%, rgba(255,236,236,0.95) 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 100%)"), backgroundSize: "300% 100%", backgroundPosition: `${100 - sweep * 100}% 0`, mixBlendMode: "screen" }} />
      )}
    </div>
  );
};

// ---------- Backgrounds (clean: one soft bloom, vignette, fine grain) ----------
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export const BgDark: React.FC<{ t?: number; glow?: number; bx?: number; by?: number }> = ({ t = 0, glow = 1, bx = 960, by = 600 }) => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B1120 0%, #090D17 60%, #07090F 100%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: bx - 900, top: by - 620, width: 1800, height: 1240, borderRadius: "50%", background: `radial-gradient(ellipse at center, rgba(179,36,42,${0.26 * glow}) 0%, rgba(122,10,10,${0.12 * glow}) 35%, rgba(122,10,10,0) 68%)`, transform: `scale(${1 + 0.03 * Math.sin(t / 70)})` }} />
    <div style={{ position: "absolute", left: 360, top: -700, width: 1200, height: 1000, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(120,140,200,0.10) 0%, rgba(120,140,200,0) 65%)" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: "overlay" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
  </div>
);

export const BgLight: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 60%, #F1F2F5 100%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 160, top: 520, width: 1600, height: 900, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(246,190,196,0.45) 0%, rgba(246,190,196,0) 62%)", transform: `scale(${1 + 0.03 * Math.sin(t / 80)})` }} />
    <div style={{ position: "absolute", left: 1150, top: -420, width: 1100, height: 800, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(226,214,250,0.35) 0%, rgba(226,214,250,0) 65%)" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.06, mixBlendMode: "soft-light" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 95% 95% at 50% 45%, transparent 60%, rgba(17,24,39,0.06) 100%)" }} />
  </div>
);

// ---------- Small shared pieces ----------
export const Eyebrow: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 20px 10px 16px", borderRadius: 99, background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)", border: dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${C.line}`, boxShadow: dark ? "none" : "0 6px 20px -8px rgba(17,24,39,0.12)", fontFamily: FONT, fontWeight: 500, fontSize: 17, letterSpacing: "0.18em", color: dark ? "rgba(255,255,255,0.78)" : C.sub, ...style }}>
    <span style={{ width: 8, height: 8, borderRadius: 9, background: C.red, boxShadow: `0 0 12px ${C.red}` }} />
    {children}
  </div>
);

export const StepBadge: React.FC<{ n: string; label: string; style?: React.CSSProperties }> = ({ n, label, style }) => (
  <div style={{ display: "flex", gap: 10, fontFamily: FONT, ...style }}>
    <div style={{ background: C.red, color: "#fff", fontWeight: 600, fontSize: 22, padding: "10px 16px", borderRadius: 10, letterSpacing: "0.02em", boxShadow: "0 10px 30px -10px rgba(179,36,42,0.6)" }}>{n}</div>
    <div style={{ background: C.ink, color: "#fff", fontWeight: 500, fontSize: 22, padding: "10px 18px", borderRadius: 10 }}>{label}</div>
  </div>
);

export const Cursor: React.FC<{ x: number; y: number; press?: number; scale?: number }> = ({ x, y, press = 0, scale = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, transform: `translate3d(${x}px, ${y}px, 0) scale(${scale * (1 - press * 0.12)})`, transformOrigin: "0 0", willChange: "transform", zIndex: 50 }}>
    {press > 0 && <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 99, border: `3px solid ${C.red}`, opacity: 1 - press, transform: `scale(${0.4 + press * 1.4})` }} />}
    <svg width="34" height="34" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      <path d="M4 2.5 19.5 11l-7 1.8L9 19.8z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  </div>
);

// Word-highlight caption: spoken words full ink, upcoming words dimmed. `k` = words spoken so far (float).
export const Caption: React.FC<{ text: string; k: number; dark?: boolean; opacity?: number; y?: number }> = ({ text, k, dark, opacity = 1, y = 0 }) => {
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center", opacity, transform: `translateY(${y}px)`, zIndex: 80 }}>
      <div style={{ maxWidth: 1500, padding: "12px 28px", borderRadius: 16, background: dark ? "rgba(10,15,25,0.55)" : "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", border: dark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${C.line}`, boxShadow: dark ? "none" : "0 14px 30px -18px rgba(17,24,39,0.35)", fontFamily: FONT, fontSize: 32, fontWeight: 500, letterSpacing: "-0.01em", textAlign: "center", lineHeight: 1.3 }}>
        {words.map((w, i) => {
          const on = Math.max(0, Math.min(1, k - i));
          const col = dark ? `rgba(255,255,255,${0.32 + 0.68 * on})` : `rgba(17,24,39,${0.28 + 0.72 * on})`;
          return <span key={i} style={{ color: col }}>{w}{i < words.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};
