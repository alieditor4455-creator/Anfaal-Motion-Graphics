// Juno — on-screen chips, polished Deck (no 3D, no glass). Solid Juno Black cards just below the chin.
// Each point: the card shell builds with a quick mosaic, then icon pops, title + subtitle rise out of masks,
// the live widget fades in. Older cards tuck behind (smaller, peeking below, content cleared).
// Final card: "You decide" — cursor clicks Approve. Every motion eases to rest; ends still.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CARDS, Card, GREEN, INK, SOFT, Mosaic, CHIPS_FPS } from "./Chips";

const SRC_FPS = 24000 / 1001, SRC_N = 197;
const SMOOTH = Easing.bezier(0.16, 1, 0.3, 1);
const MOVE = Easing.bezier(0.45, 0, 0.15, 1);
const pr = (t: number, a: number, b: number, e = SMOOTH) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const W = 820, H = 164, TOP = 888, CX = 540;

const Rise: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}><div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 1.6) }}>{children}</div></div>);

const RIGHT = [180, 220, 120, 170, 236]; // room for each card's widget
const Content: React.FC<{ c: Card; t: number; t0: number; k: number }> = ({ c, t, t0, k }) => {
  const Icon = c.icon;
  const ic = pr(t, t0, t0 + 0.55), ti = pr(t, t0 + 0.08, t0 + 0.68), su = pr(t, t0 + 0.16, t0 + 0.76), rt = pr(t, t0 + 0.24, t0 + 0.8);
  return (<>
    <div style={{ position: "absolute", left: 28, top: (H - 100) / 2, width: 100, height: 100, borderRadius: 26, display: "grid", placeItems: "center",
      background: "rgba(28,228,155,.1)", boxShadow: "inset 0 0 0 1.5px rgba(28,228,155,.45)", opacity: ic, transform: `scale(${mix(0.82, 1, ic)})` }}><Icon /></div>
    <div style={{ position: "absolute", left: 156, top: 0, bottom: 0, right: RIGHT[k], display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Outfit" }}>
      <Rise p={ti}><div style={{ fontWeight: 500, fontSize: 36, color: INK, letterSpacing: "-0.015em", whiteSpace: "nowrap", lineHeight: "44px" }}>{c.title}<span style={{ color: GREEN }}>.</span></div></Rise>
      <Rise p={su} style={{ marginTop: 4 }}><div style={{ fontWeight: 400, fontSize: 24, color: SOFT, whiteSpace: "nowrap", lineHeight: "30px" }}>{c.sub}</div></Rise>
    </div>
    <div style={{ position: "absolute", right: 30, top: 0, bottom: 0, display: "flex", alignItems: "center", opacity: rt, transform: `translateX(${(1 - rt) * 16}px)` }}>{c.right(t)}</div>
    {c.bar && <div style={{ position: "absolute", left: 156, right: 30, bottom: 20, height: 4, borderRadius: 9, background: "rgba(248,249,250,.1)", opacity: ti }}>
      <div style={{ width: `${100 * c.bar(t)}%`, height: "100%", borderRadius: 9, background: GREEN }} /></div>}
  </>);
};

export const JunoChipsFlat: React.FC = () => {
  const t = useCurrentFrame() / CHIPS_FPS;
  const collapse = pr(t, 7.08, 7.7, MOVE);
  const cIn = pr(t, 7.3, 7.76), cOut = pr(t, 7.98, 8.12, MOVE);
  const bx = CX + W / 2 - 112, by = TOP + H / 2 + 8;
  const tap = Math.sin(Math.PI * pr(t, 7.78, 7.92, Easing.linear)), rip = pr(t, 7.8, 8.12, Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw4/audio.m4a")} />
      <Img src={staticFile(`juno/raw4/f${String(Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1)).padStart(4, "0")}.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />

      {CARDS.map((c, k) => {
        if (t < c.tIn) return null;
        const fin = k === 4;
        let d = 0; if (!fin) CARDS.forEach((o, j) => { if (j > k && j < 4) d += pr(t, o.tIn, o.tIn + 0.7, MOVE); });
        const e = pr(t, c.tIn, c.tIn + 0.7);
        const op = (d > 2.4 ? 0 : 1 - 0.3 * d) * (fin ? 1 : 1 - collapse) * pr(t, c.tIn, c.tIn + 0.25, Easing.linear);
        if (op <= 0.003) return null;
        const y = TOP + (1 - e) * 36 + 24 * d + (fin ? 0 : 14 * collapse);
        const sc = mix(0.965, 1, e) * (1 - 0.055 * d);
        const shell = pr(t, c.tIn, c.tIn + 0.45, Easing.linear);
        const content = Math.max(0, 1 - d * 2);
        return (
          <div key={k} style={{ position: "absolute", left: CX - W / 2, top: y, width: W, height: H, transform: `scale(${sc})`, transformOrigin: "50% 100%", opacity: op, zIndex: 10 + k }}>
            {shell < 1 && <Mosaic id={`fl${k}`} p={shell} />}
            <div style={{ position: "absolute", inset: 0, borderRadius: 32, overflow: "hidden", clipPath: shell < 1 ? `url(#fl${k})` : undefined,
              background: d > 0.02 ? `color-mix(in srgb, #1E1E1E ${100 - 18 * Math.min(1, d)}%, #000)` : "#1E1E1E",
              boxShadow: "inset 0 0 0 1.5px rgba(248,249,250,.1), inset 0 1.5px 0 rgba(248,249,250,.08), 0 22px 50px rgba(0,0,0,.45)" }}>
              <div style={{ position: "absolute", left: 0, top: 26, bottom: 26, width: 4, borderRadius: 4, background: GREEN, opacity: content * pr(t, c.tIn + 0.1, c.tIn + 0.5) }} />
              <div style={{ position: "absolute", inset: 0, opacity: content }}><Content c={c} t={t} t0={c.tIn + 0.12} k={k} /></div>
            </div>
          </div>);
      })}

      {cIn > 0 && cOut < 1 && <>
        {rip > 0 && rip < 1 && <div style={{ position: "absolute", left: bx - 58 * rip, top: by - 58 * rip, width: 116 * rip, height: 116 * rip, borderRadius: "50%", border: `2px solid ${GREEN}`, opacity: 0.7 * (1 - rip), zIndex: 40 }} />}
        <svg width={44} height={44} viewBox="0 0 30 30" style={{ position: "absolute", left: mix(bx + 200, bx, cIn) - 6, top: mix(by + 190, by, cIn) - 4, opacity: cIn * (1 - cOut), zIndex: 41,
          transform: `scale(${1 - 0.12 * tap})`, transformOrigin: "6px 4px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
          <path d="M3 3 L27 12 L16 16 L12 27 Z" fill={INK} stroke="#1E1E1E" strokeWidth={2} strokeLinejoin="round" /></svg></>}
    </AbsoluteFill>);
};
