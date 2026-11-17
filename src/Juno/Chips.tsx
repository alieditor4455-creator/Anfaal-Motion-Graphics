// Juno — on-screen chips over the speaker (chips.MP4, 8.17s, 24fps). Dark glass "doc chips" placed just
// below the chin, in the same language as the iso doc-pages animation (glass, Juno Green, doc pages, mosaic).
// VO: "You see every data point. You see what we flagged, you see what we're confident about,
//      and where we flagged something that needs a second look. You decide what's right."
// Each point lands as a glass card revealed by a mosaic tile wave; older cards stack behind it.
// Final card: "You decide" — a cursor clicks Approve. Ends still.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const CHIPS_FPS = 24;
export const CHIPS_FRAMES = 196;
const SRC_FPS = 24000 / 1001, SRC_N = 197;

[["Outfit", 400, "Outfit-400"], ["Outfit", 500, "Outfit-500"], ["Outfit", 700, "Outfit-700"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const SIN = Easing.inOut(Easing.sin);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const GREEN = "#1CE49B", INK = "#F8F9FA", SOFT = "rgba(248,249,250,.62)";
const CW = 780, CH = 150, CX = 540, TOP = 880; // card size, centre x, top y (just below the chin)

// ---- icons (Juno Green line icons on a glass tile) ----
const Doc = () => <svg width={44} height={52} viewBox="0 0 44 52"><path d="M6 2h22l12 12v32a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="rgba(28,228,155,.16)" stroke={GREEN} strokeWidth={3} strokeLinejoin="round" /><path d="M28 2v12h12" fill="none" stroke={GREEN} strokeWidth={3} strokeLinejoin="round" /><path d="M10 24h20M10 31h24M10 38h16" stroke={GREEN} strokeWidth={3} strokeLinecap="round" /></svg>;
const Flag = () => <svg width={44} height={48} viewBox="0 0 44 48"><path d="M8 46V4" stroke={GREEN} strokeWidth={3.5} strokeLinecap="round" /><path d="M8 6h26l-6 9 6 9H8" fill="rgba(28,228,155,.18)" stroke={GREEN} strokeWidth={3} strokeLinejoin="round" /></svg>;
const Check = () => <svg width={48} height={48} viewBox="0 0 48 48"><circle cx={24} cy={24} r={20} fill="rgba(28,228,155,.16)" stroke={GREEN} strokeWidth={3} /><path d="M15 24.5l6 6 12-13" fill="none" stroke={GREEN} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Lens = () => <svg width={48} height={48} viewBox="0 0 48 48"><circle cx={20} cy={20} r={14} fill="rgba(28,228,155,.14)" stroke={GREEN} strokeWidth={3} /><path d="M31 31l12 12" stroke={GREEN} strokeWidth={4} strokeLinecap="round" /><path d="M13 20h14" stroke={GREEN} strokeWidth={3} strokeLinecap="round" /></svg>;
const Person = () => <svg width={48} height={48} viewBox="0 0 48 48"><circle cx={24} cy={16} r={9} fill="rgba(28,228,155,.16)" stroke={GREEN} strokeWidth={3} /><path d="M7 44c2-10 9-15 17-15s15 5 17 15" fill="rgba(28,228,155,.12)" stroke={GREEN} strokeWidth={3} strokeLinecap="round" /></svg>;

// ---- mosaic reveal mask (objectBoundingBox tiles, diagonal wave) ----
const COLS = 14, ROWS = 4;
const Mosaic: React.FC<{ id: string; p: number }> = ({ id, p }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}><defs><clipPath id={id} clipPathUnits="objectBoundingBox">
    {[...Array(COLS * ROWS)].map((_, n) => { const c = n % COLS, r = Math.floor(n / COLS); const d = (c / (COLS - 1) + r / (ROWS - 1)) / 2;
      const s = Math.min(1.06, pr(p, d * 0.6, d * 0.6 + 0.4, SIN) * 1.06); if (s <= 0) return null;
      const w = s / COLS, h = s / ROWS; return <rect key={n} x={(c + 0.5) / COLS - w / 2} y={(r + 0.5) / ROWS - h / 2} width={w} height={h} rx={0.004} />; })}
  </clipPath></defs></svg>);

type Card = { tIn: number; icon: React.FC; title: string; sub: string; right: (t: number) => React.ReactNode; bar?: (t: number) => number };
const pill = (txt: React.ReactNode, filled = false, outline = false) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, fontFamily: "Outfit", fontWeight: 500, fontSize: 26,
    background: filled ? GREEN : outline ? "rgba(248,249,250,.06)" : "rgba(28,228,155,.14)", color: filled ? "#043329" : outline ? INK : GREEN,
    boxShadow: `inset 0 0 0 1.5px ${filled ? GREEN : outline ? "rgba(248,249,250,.4)" : "rgba(28,228,155,.5)"}` }}>{txt}</div>);

const CARDS: Card[] = [
  { tIn: 0.05, icon: Doc, title: "Every data point", sub: "W-2 · 1099 · K-1 · source docs",
    right: (t) => <div style={{ textAlign: "right", fontFamily: "Outfit" }}><div style={{ fontWeight: 700, fontSize: 40, color: INK, letterSpacing: "-0.02em" }}>{Math.round(1248 * pr(t, 0.3, 1.45, SIN)).toLocaleString("en-US")}</div><div style={{ fontSize: 20, color: SOFT, letterSpacing: "0.1em" }}>FIELDS</div></div>,
    bar: (t) => pr(t, 0.3, 1.45, SIN) },
  { tIn: 1.68, icon: Flag, title: "What we flagged", sub: "Mismatches vs. source",
    right: (t) => pill(<><span style={{ width: 10, height: 10, borderRadius: 99, background: GREEN, opacity: 0.6 + 0.4 * Math.cos(t * 6) }} />{Math.max(1, Math.min(3, 1 + Math.floor(pr(t, 2.3, 2.95, Easing.linear) * 2.999)))} flagged</>) },
  { tIn: 3.12, icon: Check, title: "What we're confident about", sub: "Matched to source docs",
    right: (t) => { const v = pr(t, 3.55, 4.45, SIN); const R = 26, L = 2 * Math.PI * R;
      return <div style={{ position: "relative", width: 72, height: 72 }}><svg width={72} height={72}><circle cx={36} cy={36} r={R} fill="none" stroke="rgba(248,249,250,.14)" strokeWidth={6} />
        <circle cx={36} cy={36} r={R} fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - 0.98 * v)} transform="rotate(-90 36 36)" /></svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "Outfit", fontWeight: 700, fontSize: 20, color: INK }}>{Math.round(98 * v)}%</div></div>; } },
  { tIn: 4.9, icon: Lens, title: "Needs a second look", sub: "Box 14 · Line 8",
    right: () => pill("Review", false, true) },
  { tIn: 7.08, icon: Person, title: "You decide what's right", sub: "Nothing moves without your sign-off",
    right: (t) => { const click = pr(t, 7.78, 7.92, Easing.linear), done = pr(t, 7.82, 8.02);
      return <div style={{ transform: `scale(${1 - 0.06 * Math.sin(Math.PI * click)})` }}>{done > 0.5 ? pill(<><svg width={22} height={22} viewBox="0 0 22 22"><path d="M4 11.5l4.5 4.5L18 6" fill="none" stroke="#043329" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>Approved</>, true) : pill("Approve")}</div>; } },
];

export const JunoChips: React.FC = () => {
  const f = useCurrentFrame(); const t = f / CHIPS_FPS;
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const collapse = pr(t, 7.08, 7.55, MOVE);

  // cursor for the final card: glides in, clicks Approve
  const cIn = pr(t, 7.3, 7.76, GLIDE), cOut = pr(t, 8.0, 8.15);
  const btnX = CX + CW / 2 - 110, btnY = TOP + CH / 2 + 6;
  const cx = mix(CX + 330, btnX, cIn), cy = mix(TOP + CH + 160, btnY, cIn);
  const tap = Math.sin(Math.PI * pr(t, 7.78, 7.92, Easing.linear));
  const ripple = pr(t, 7.8, 8.15, Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw4/audio.m4a")} />
      <Img src={staticFile(`juno/raw4/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      {/* soft shade behind the chip zone so glass reads on the dark sweater */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 9% at 50% ${((TOP + CH / 2) / 1920) * 100}%, rgba(0,0,0,.28), transparent 70%)` }} />

      {CARDS.map((c, k) => {
        if (t < c.tIn) return null;
        const reveal = pr(t, c.tIn, c.tIn + 0.6, Easing.linear);
        const rise = pr(t, c.tIn, c.tIn + 0.6, GLIDE);
        let depth = 0; CARDS.forEach((o, j) => { if (j > k && j < 4) depth += pr(t, o.tIn, o.tIn + 0.55, MOVE); });
        const isFinal = k === 4;
        const op = (depth > 2.6 ? 0 : 1 - 0.32 * depth) * (isFinal ? 1 : 1 - collapse) * pr(t, c.tIn, c.tIn + 0.2);
        if (op <= 0.003) return null;
        const y = TOP + 30 * depth + (1 - rise) * 34;
        const content = Math.max(0, 1 - depth * 1.8);
        const sc = (1 - 0.055 * depth) * mix(0.97, 1, rise);
        const id = `mz${k}`, Icon = c.icon;
        return (
          <div key={k} style={{ position: "absolute", left: CX - CW / 2, top: y, width: CW, height: CH, transform: `scale(${sc})`, transformOrigin: "50% 0", opacity: op, zIndex: 10 + k - Math.round(depth) }}>
            {reveal < 1 && <Mosaic id={id} p={reveal} />}
            <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden", clipPath: reveal < 1 ? `url(#${id})` : undefined,
              background: "linear-gradient(135deg, rgba(52,58,55,.8) 0%, rgba(24,27,26,.84) 100%)", backdropFilter: "blur(22px) saturate(1.2)", WebkitBackdropFilter: "blur(22px) saturate(1.2)",
              boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.22), inset 0 0 0 1.5px rgba(248,249,250,.12), 0 24px 60px rgba(0,0,0,.35)",
              filter: depth > 0.05 ? `blur(${Math.min(2.5, depth * 1.4)}px)` : undefined }}>
              {/* faint mosaic texture in the glass */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: `${CW / COLS}px ${CH / ROWS}px` }} />
              <div style={{ position: "absolute", inset: 0, opacity: content }}>
              <div style={{ position: "absolute", left: 26, top: (CH - 92) / 2, width: 92, height: 92, borderRadius: 24, display: "grid", placeItems: "center",
                background: "linear-gradient(145deg, rgba(28,228,155,.2), rgba(28,228,155,.04))", boxShadow: "inset 0 0 0 1.5px rgba(28,228,155,.45), inset 0 1px 0 rgba(255,255,255,.25)" }}><Icon /></div>
              <div style={{ position: "absolute", left: 142, top: 0, bottom: 0, right: 230, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Outfit" }}>
                <div style={{ fontWeight: 500, fontSize: 34, color: INK, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{c.title}<span style={{ color: GREEN }}>.</span></div>
                <div style={{ fontWeight: 400, fontSize: 23, color: SOFT, marginTop: 6, whiteSpace: "nowrap" }}>{c.sub}</div>
              </div>
              <div style={{ position: "absolute", right: 28, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>{c.right(t)}</div>
              {c.bar && <div style={{ position: "absolute", left: 142, right: 28, bottom: 18, height: 5, borderRadius: 9, background: "rgba(248,249,250,.12)" }}>
                <div style={{ width: `${100 * c.bar(t)}%`, height: "100%", borderRadius: 9, background: GREEN, boxShadow: "0 0 10px rgba(28,228,155,.5)" }} /></div>}
              </div>
            </div>
          </div>);
      })}

      {/* cursor + click ripple on the final card */}
      {cIn > 0 && cOut < 1 && <>
        {ripple > 0 && ripple < 1 && <div style={{ position: "absolute", left: btnX - 60 * ripple, top: btnY - 60 * ripple, width: 120 * ripple, height: 120 * ripple, borderRadius: "50%", border: `2px solid ${GREEN}`, opacity: 0.8 * (1 - ripple), zIndex: 30 }} />}
        <svg width={46} height={46} viewBox="0 0 30 30" style={{ position: "absolute", left: cx - 6, top: cy - 4, opacity: cIn * (1 - cOut), transform: `scale(${1 - 0.12 * tap})`, transformOrigin: "6px 4px", zIndex: 31, filter: "drop-shadow(0 6px 10px rgba(0,0,0,.4))" }}>
          <path d="M3 3 L27 12 L16 16 L12 27 Z" fill={INK} stroke="#1E1E1E" strokeWidth={2} strokeLinejoin="round" />
        </svg></>}
    </AbsoluteFill>
  );
};
