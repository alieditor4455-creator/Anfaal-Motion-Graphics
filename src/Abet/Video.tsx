import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import TM from "./timing.json";
import { AbetLogo, BACK, BgDark, BgLight, C, Caption, Cursor, EIO, EO, Eyebrow, FONT, Icon, StepBadge, fontsLoaded, mix, tw } from "./theme";
import { Dashboard, DepositCard, DepositPage, DepositState, TxRow } from "./portal";
import { BigButton, CW, CGAP, CH, ROW_X, StepCard, W, redGrad } from "./frames";
import { MacBook, MacProps } from "./macbook";
import { AccountsG, CalendarG, Glass, SocialG, WalletG } from "./glass";

export const ABET_FPS = 30;
export const ABET_DUR = 71;
export const ABET_FRAMES = ABET_DUR * ABET_FPS;

const LIN = Easing.linear;
// time helpers (seconds)
const k = (t: number, a: number, b: number, e = EO) => tw(t, a, b, e);
const wt = (line: number, word: number) => TM[line].t[word];
const bell = (t: number, a: number, b: number, c: number, d: number) => k(t, a, b, EIO) * (1 - k(t, c, d, EIO));
const lerp2 = (p: number, a: [number, number], b: [number, number]): [number, number] => [mix(a[0], b[0], p), mix(a[1], b[1], p)];

const head = (size: number, color: string): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, fontWeight: 400, letterSpacing: "-0.035em", lineHeight: 1.1, color });

// Word that rises in with blur, keyed to a time
const RiseWord: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => {
  const p = k(t, at - 0.12, at + 0.6);
  return <span style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, whiteSpace: "pre", ...style }}>{children}</span>;
};

// ---------------- Captions (chunked, word-highlight) ----------------
const SKIP = new Set([0, 1, 14]);
type Chunk = { words: string[]; t: number[]; a: number; b: number; dark: boolean };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  TM.forEach((L, li) => {
    if (SKIP.has(li)) return;
    let cur: number[] = [];
    const groups: number[][] = [];
    L.words.forEach((w, i) => {
      cur.push(i);
      const end = /[.,:?]$/.test(w);
      if ((end && cur.length >= 4 && L.words.length - i - 1 >= 3) || cur.length >= 10) { groups.push(cur); cur = []; }
    });
    if (cur.length) groups.push(cur);
    groups.forEach((g) => {
      const ts = g.map((i) => L.t[i]);
      out.push({ words: g.map((i) => L.words[i]), t: ts, a: ts[0] - 0.18, b: ts[ts.length - 1] + 0.75, dark: L.start < 17.4 || L.start > 63 });
    });
  });
  // never overlap: end each chunk when the next begins
  // hand-over: previous chunk fully fades out (0.25s) before the next fades in (0.25s) — no pops
  for (let i = 0; i < out.length - 1; i++) {
    const last = out[i].t[out[i].t.length - 1];
    out[i].b = Math.min(out[i].b, Math.max(last + 0.22, out[i + 1].a - 0.47));
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CHUNKS.filter((x) => t >= x.a - 0.2 && t <= x.b + 0.25).map((c) => {
      const op = k(t, c.a - 0.2, c.a + 0.05, EIO) * (1 - k(t, c.b, c.b + 0.25, EIO));
      if (op <= 0) return null;
      const spoken = c.t.reduce((s, wtime) => s + Math.max(0, Math.min(1, (t - wtime) / 0.16)), 0);
      return <Caption key={c.a} text={c.words.join(" ")} k={spoken} dark={c.dark} opacity={op} y={(1 - op) * 10} />;
    })}
  </>
);

// ---------------- transitions: zoom-through ----------------
const ACC = Easing.bezier(0.55, 0, 0.9, 0.35); // accelerate into the camera
const zoomOut = (t: number, a: number, b: number, S: number, ox: number, oy: number): React.CSSProperties => {
  const p = k(t, a, b, ACC);
  if (p <= 0) return {};
  return { transform: `scale(${1 + p * S})`, transformOrigin: `${ox}px ${oy}px`, filter: `blur(${Math.pow(p, 1.4) * 22}px)`, opacity: 1 - k(t, a + (b - a) * 0.5, b, EIO) };
};
const zoomIn = (t: number, a: number, b: number): React.CSSProperties => {
  const p = k(t, a, b, EO);
  if (p >= 1) return {};
  return { transform: `scale(${mix(1.16, 1, p)})`, transformOrigin: "960px 540px", filter: `blur(${(1 - p) * 14}px)`, opacity: k(t, a, a + (b - a) * 0.45, EIO) };
};
const merge = (x: React.CSSProperties, y: React.CSSProperties): React.CSSProperties => ({
  ...x, ...y,
  transform: [x.transform, y.transform].filter(Boolean).join(" ") || undefined,
  filter: [x.filter, y.filter].filter(Boolean).join(" ") || undefined,
  opacity: (x.opacity === undefined ? 1 : Number(x.opacity)) * (y.opacity === undefined ? 1 : Number(y.opacity)),
});

// laptop with a pre-rendered screen texture (crisp, no shimmer)
const MacImg: React.FC<Omit<MacProps, "children"> & { src: string; src2?: string; mixT?: number }> = ({ src, src2, mixT = 0, ...mac }) => (
  <MacBook {...mac}>
    <Img src={staticFile(`abet/screens/${src}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    {src2 && mixT > 0 && <Img src={staticFile(`abet/screens/${src2}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: mixT }} />}
  </MacBook>
);

// ---------------- Scene 1: logo intro (light sweep reveal) ----------------
const LogoReveal: React.FC<{ t: number; t0: number; width: number }> = ({ t, t0, width }) => (
  <AbetLogo
    width={width}
    state={{
      letters: [0, 1, 2, 3].map((i) => k(t, t0 + i * 0.09, t0 + 1.0 + i * 0.09)),
      bull: k(t, t0 + 0.9, t0 + 1.7, EIO),
      bear: k(t, t0 + 1.05, t0 + 1.85, EIO),
      sweep: mix(-0.25, 1.25, k(t, t0 + 1.75, t0 + 2.95, EIO)),
      glow: 0.7 * k(t, t0 + 1.4, t0 + 2.4, EIO) * (1 - 0.6 * k(t, t0 + 2.9, t0 + 4.2, EIO)),
    }}
  />
);

const SceneLogo: React.FC<{ t: number }> = ({ t }) => {
  const push = mix(1, 1.035, k(t, 0, 5.0, EIO));
  const tag = k(t, 2.4, 3.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}>
        <LogoReveal t={t} t0={0.35} width={700} />
        <div style={{ marginTop: 44, fontFamily: FONT, fontSize: 19, fontWeight: 400, letterSpacing: `${mix(0.7, 0.42, tag)}em`, paddingLeft: "0.42em", color: "rgba(255,255,255,0.62)", opacity: tag, filter: tag < 1 ? `blur(${(1 - tag) * 6}px)` : undefined }}>GLOBAL MARKETS · ONE PORTAL</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- Scene 2: what is ABET ----------------
const S2_SCREEN: [number, number] = [960, 515];
const SceneWhat: React.FC<{ t: number }> = ({ t }) => {
  const rise = k(t, 5.3, 8.2, EIO);
  const drift = k(t, 8.7, 16.4, EIO);
  const one = k(t, wt(2, 10) - 0.1, wt(2, 10) + 1.1, EIO);
  // each card: glides out from the screen into place, then breathes
  const card = (at: number, from: [number, number], tilt: number, ph: number): { style: React.CSSProperties; rx: number; ry: number; sheen: number } => {
    const p = k(t, at - 0.1, at + 1.1);
    const g = one * 0.1;
    return {
      style: { opacity: k(t, at - 0.1, at + 0.5, EIO), transform: `translate(${(1 - p) * from[0] - from[0] * g * 0}px, ${(1 - p) * from[1] + Math.sin(t * 0.9 + ph) * 5}px) scale(${mix(0.82, 1, p) * (1 - g * 0.3)})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined },
      rx: mix(14, 4, p) + Math.sin(t * 0.6 + ph) * 1.2,
      ry: tilt * mix(1.8, 1, p) + Math.cos(t * 0.5 + ph) * 1.5,
      sheen: mix(-0.3, 1.2, k(t, at + 0.2, at + 1.6, EIO)),
    };
  };
  const w = card(wt(2, 1), [520, 80], 16, 0);
  const a = card(wt(2, 3), [420, -140], 14, 1.3);
  const so = card(wt(2, 4), [-440, -40], -16, 2.1);
  const ca = card(wt(2, 8), [-440, 160], -14, 3.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", width: W, top: 78, textAlign: "center" }}>
        <div style={head(58, "#fff")}>
          {["One ", "clean ", "portal"].map((x, i) => <RiseWord key={i} t={t} at={wt(1, i)}>{x}</RiseWord>)}
        </div>
        <div style={{ ...head(58, "rgba(255,255,255,0.5)"), marginTop: 4 }}>
          <RiseWord t={t} at={wt(1, 3)}>for </RiseWord>
          <RiseWord t={t} at={wt(1, 4)}>the </RiseWord>
          <RiseWord t={t} at={wt(1, 5)} style={redGrad}>global </RiseWord>
          <RiseWord t={t} at={wt(1, 6)} style={redGrad}>markets.</RiseWord>
        </div>
      </div>
      {rise > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: k(t, 5.3, 6.3, EIO) }}>
          <MacImg src="dash" x={W / 2} y={mix(980, 745, rise) - 6 * drift} scale={0.42 + 0.022 * drift} rx={mix(-24, -14, rise)} ry={mix(-30, -14, rise) + 5 * drift} lid={16} rim={0.7 + 0.5 * one} />
        </div>
      )}
      <Glass dark rx={ca.rx} ry={ca.ry} sheen={ca.sheen} style={{ left: 1430, top: 280, ...ca.style, transform: `${ca.style.transform} scale(0.9)` }}><CalendarG /></Glass>
      <Glass dark rx={w.rx} ry={w.ry} sheen={w.sheen} style={{ left: 140, top: 390, ...w.style }}><WalletG /></Glass>
      <Glass dark rx={a.rx} ry={a.ry} sheen={a.sheen} radius={20} style={{ left: 230, top: 730, ...a.style }}><AccountsG /></Glass>
      <Glass dark rx={so.rx} ry={so.ry} sheen={so.sheen} style={{ left: 1450, top: 600, ...so.style }}><SocialG /></Glass>
    </AbsoluteFill>
  );
};

// ---------------- Scene 3: how it works ----------------
const STEP_AT = [TM[4].start, TM[5].start, TM[6].start, TM[7].start];
const CARD3: [number, number] = [ROW_X + 2 * (CW + CGAP) + CW / 2, 520 + CH / 2];
const SceneHow: React.FC<{ t: number }> = ({ t }) => {
  const line = STEP_AT.reduce((acc, s, i) => (i === 0 ? acc : acc + k(t, s - 0.1, s + 0.7, EIO)), 0) / 3;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 150, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ opacity: k(t, 16.95, 17.9, EIO), transform: `translateY(${(1 - k(t, 16.95, 17.9)) * 12}px)` }}><Eyebrow>HOW IT WORKS</Eyebrow></div>
        <div style={{ ...head(78, C.ink), marginTop: 30 }}>
          <RiseWord t={t} at={wt(3, 3)} style={{ color: C.red }}>Four </RiseWord>
          <RiseWord t={t} at={wt(3, 4)}>simple </RiseWord>
          <RiseWord t={t} at={wt(3, 5)}>steps.</RiseWord>
        </div>
      </div>
      <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 592, width: 3 * (CW + CGAP), height: 2, borderRadius: 2, background: C.line, transformOrigin: "0 50%", transform: `scaleX(${k(t, 20.9, 22.2, EIO)})` }} />
      <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 592, width: 3 * (CW + CGAP), height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${C.green}, ${C.red})`, transformOrigin: "0 50%", transform: `scaleX(${line})` }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        {[0, 1, 2, 3].map((i) => {
          const s = STEP_AT[i];
          const next = STEP_AT[i + 1];
          const a = k(t, 20.85 + i * 0.13, 22.0 + i * 0.13);
          const on = k(t, s - 0.05, s + 0.8, EIO) * (next ? 1 - k(t, next - 0.05, next + 0.6, EIO) : 1);
          const done = next ? k(t, next - 0.05, next + 0.7, EIO) : 0;
          const dim = 0.5 * (1 - k(t, s - 0.25, s + 0.45, EIO));
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: 0, transform: `rotateX(${(1 - a) * 22}deg)`, transformOrigin: `${ROW_X + i * (CW + CGAP) + CW / 2}px 860px` }}>
              <StepCard i={i} a={a} on={on} done={done} dim={dim} style={{ left: ROW_X + i * (CW + CGAP), top: 520 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scenes 4–5: deposit walkthrough ----------------
const CARD_X = (W - 900) / 2;
const CARD_Y = 200;
const CARD_H = 590;

function depositState(t: number): DepositState & { cardStep: number } {
  // panel transitions: [time, fromView, toView]
  const SW: [number, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3][] = [[43.75, 0, 1], [49.05, 1, 2], [54.65, 2, 3]];
  let view: 0 | 1 | 2 | 3 = 0;
  let viewT = 1;
  let out = false;
  for (const [c, from, to] of SW) {
    if (t >= c && t < c + 0.18) { view = from; viewT = 1 - k(t, c, c + 0.18, EIO); out = true; }
    else if (t >= c + 0.18) { view = to; viewT = k(t, c + 0.18, c + 0.66, EO); out = false; }
  }
  const step = k(t, 43.75, 44.35, EIO) + k(t, 49.05, 49.65, EIO) + k(t, 54.65, 55.25, EIO) + k(t, 57.3, 57.8, EIO);
  // step 1
  const cardsIn = [0, 1, 2].map((i) => k(t, 38.45 + i * 0.12, 39.3 + i * 0.12));
  const w10 = (i: number) => wt(10, i);
  const rings = [bell(t, w10(5) - 0.15, w10(5) + 0.25, w10(7) - 0.15, w10(7) + 0.2), bell(t, w10(7) - 0.15, w10(7) + 0.25, w10(9) - 0.15, w10(9) + 0.2), bell(t, w10(9) - 0.15, w10(9) + 0.25, 42.2, 42.6)];
  const sel = k(t, 42.78, 43.15, BACK);
  // step 2
  const typed = Math.floor(k(t, 45.35, 46.15, LIN) * 7 + 0.0001);
  const amount = "$500.00".slice(0, typed);
  const caret = t < 46.15 || Math.floor(t * 2.2) % 2 === 0;
  const chip = k(t, 46.3, 46.6, EIO);
  // step 3
  const w12 = (i: number) => wt(12, i);
  const checks = [0, 1, 2, 3].map((i) => k(t, w12(6) + i * 0.32, w12(6) + i * 0.32 + 0.4, EIO));
  // presses
  const pressAt = (c: number) => k(t, c, c + 0.1, EIO) * (1 - k(t, c + 0.12, c + 0.4, EIO));
  const continuePress = pressAt(43.55) + pressAt(48.75) + pressAt(54.35);
  const confirmAt = wt(13, 2) + 0.05;
  const confirmPress = pressAt(confirmAt);
  const morph = k(t, confirmAt + 0.15, confirmAt + 0.75, EIO) + Math.max(0, t - (confirmAt + 0.75)) * 1.2;
  const success = k(t, 57.05, 58.25, LIN);
  return { step, view, viewT, out, cardsIn, rings, sel, amount, caret, chip, checks, continuePress, confirmPress, morph, success, summaryAmount: t > 46.2 ? "$500.00" : "—", cardStep: step };
}


function cursorAt(t: number): { x: number; y: number; o: number; press: number } {
  // keyframes: [time, x, y]
  const K: [number, number, number][] = [
    [35.3, 1500, 960], [36.25, 1060, 548], [36.9, 1070, 556],
    [41.9, 1180, 900], [42.7, 700, 470], [43.0, 720, 520], [43.45, 960, 730], [43.9, 990, 760],
    [47.9, 1300, 980], [48.6, 960, 730], [49.2, 1000, 780],
    [53.6, 1300, 960], [54.25, 960, 730], [54.8, 1000, 780],
    [55.2, 1300, 960], [55.85, 960, 730], [56.4, 1020, 800],
  ];
  let x = K[0][1];
  let y = K[0][2];
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, xa, ya] = K[i];
    const [tb, xb, yb] = K[i + 1];
    if (t >= ta && t <= tb) {
      const p = k(t, ta, tb, EIO);
      // gentle arc: y eases slightly later than x
      x = mix(xa, xb, p);
      y = mix(ya, yb, k(t, ta, tb, Easing.bezier(0.5, 0, 0.3, 1)));
    } else if (t > tb) { x = xb; y = yb; }
  }
  const vis = (a: number, b: number) => k(t, a, a + 0.3, EIO) * (1 - k(t, b, b + 0.3, EIO));
  const o = Math.min(1, vis(35.3, 37.0) + vis(41.9, 44.0) + vis(47.9, 49.2) + vis(53.6, 54.8) + vis(55.2, 56.6));
  const ripple = (c: number) => (t >= c && t <= c + 0.5 ? (t - c) / 0.5 : 0);
  const press = ripple(36.52) || ripple(42.78) || ripple(43.55) || ripple(48.75) || ripple(54.35) || ripple(wt(13, 2) + 0.05);
  return { x, y, o, press };
}

const SceneDeposit: React.FC<{ t: number }> = ({ t }) => {
  // one continuous laptop path: settle (zoom-in) -> gentle push -> rack out of focus -> rack back to 3/4
  const push = k(t, 32.4, 34.8, EIO);
  const blurIn = k(t, 34.45, 35.45, EIO);
  const back = k(t, 58.7, 60.0, EIO);
  const blur = 9 * blurIn * (1 - back);
  const mac = {
    x: mix(W / 2, 820, back),
    y: mix(mix(770, 830, push), 760, back),
    scale: mix(mix(0.42, 0.5, push), 0.44, back),
    rx: -14,
    ry: mix(mix(-12, -14, push), -20, back),
    lid: 16,
  };
  const st = depositState(t);
  const titleIn = k(t, 30.5, 31.5);
  const titleOut = k(t, 33.9, 34.7, EIO);

  // hero button lifts off the screen, gets pressed, then morphs into the deposit card
  const lift = k(t, 34.75, 35.9, EO);
  const morph = k(t, 37.15, 38.1, EIO);
  const bp = k(t, 36.52, 36.62, EIO) * (1 - k(t, 36.64, 37.0, EIO));
  const bx = mix(mix(800, W / 2, lift), W / 2, morph);
  const by = mix(mix(610, 520, lift), CARD_Y + CARD_H / 2, morph);
  const bw = mix(440, 900, morph);
  const bh = mix(118, CARD_H, morph);
  const cardBack = k(t, 58.75, 59.75, EIO);
  const ghosts = k(t, 35.1, 36.0) * (1 - k(t, 36.95, 37.4, EIO));
  const cur = cursorAt(t);
  // the card breathes in 3D once it is a card
  const settle = k(t, 37.9, 39.0, EO);
  const crx = mix(10, 0, settle) * morph + Math.sin(t * 0.55) * 1.1 * settle;
  const cry = Math.cos(t * 0.45) * 1.6 * settle;
  const tx = k(t, 59.8, 61.0);
  const flip = k(t, 61.35, 61.75, EIO);

  return (
    <AbsoluteFill>
      {t < 34.8 && (
        <div style={{ position: "absolute", top: 96, width: W, display: "flex", flexDirection: "column", alignItems: "center", opacity: titleIn * (1 - titleOut), transform: `translateY(${(1 - titleIn) * 18 - titleOut * 24}px)`, filter: titleOut > 0 ? `blur(${titleOut * 8}px)` : undefined }}>
          <Eyebrow>DEPOSIT GUIDE</Eyebrow>
          <div style={{ ...head(62, C.ink), marginTop: 22 }}>
            <RiseWord t={t} at={30.75}>Make </RiseWord><RiseWord t={t} at={30.9}>a </RiseWord><RiseWord t={t} at={31.05} style={{ color: C.red }}>deposit </RiseWord>
            <RiseWord t={t} at={31.3}>in </RiseWord><RiseWord t={t} at={31.45}>4 </RiseWord><RiseWord t={t} at={31.6}>steps.</RiseWord>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
        <MacImg src={t < 37.4 ? "dash" : "dep1"} src2="success" mixT={k(t, 58.4, 58.9, EIO)} {...mac} rim={0} />
      </div>
      {ghosts > 0 && (
        <>
          <Glass rx={0} ry={14} style={{ left: 330 + (1 - ghosts) * 120, top: 472, opacity: 0.75 * ghosts, filter: "blur(4px)" }} inner={{ width: 300, height: 96, display: "grid", placeItems: "center", fontSize: 30, color: C.red }}>Withdrawal</Glass>
          <Glass rx={0} ry={-14} style={{ left: 1290 - (1 - ghosts) * 120, top: 472, opacity: 0.75 * ghosts, filter: "blur(4px)" }} inner={{ width: 300, height: 96, display: "grid", placeItems: "center", fontSize: 30, color: C.red }}>Transfer</Glass>
        </>
      )}
      {t >= 34.75 && t < 59.8 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: bh, perspective: 1600, willChange: "transform", opacity: k(t, 34.75, 35.35, EIO) * (1 - k(t, 59.15, 59.75, EIO)), transform: `translate3d(${bx - bw / 2 - 150 * cardBack}px, ${by - bh / 2 - 10 * cardBack}px, 0) scale(${mix(0.4, 1, lift) * (1 - bp * 0.05) * mix(1, 0.5, cardBack)})`, filter: lift < 1 ? `blur(${(1 - lift) * 8}px)` : cardBack > 0 ? `blur(${cardBack * 6}px)` : undefined }}>
          <div style={{ position: "absolute", inset: 0, transform: `rotateX(${crx}deg) rotateY(${cry}deg)` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: mix(30, 28, morph), overflow: "hidden", background: "linear-gradient(165deg, #FFFFFF 0%, #FBFBFC 100%)", boxShadow: `inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,${0.06 * morph}), 0 30px 60px -24px rgba(17,24,39,${0.22 * morph}), 0 80px 140px -50px rgba(179,36,42,${0.35 * morph})` }}>
              {morph > 0.35 && (
                <div style={{ position: "absolute", left: (bw - 900) / 2, top: (bh - CARD_H) / 2, opacity: k(t, 37.85, 38.35, EIO) }}>
                  <DepositCard {...st} h={CARD_H} style={{ border: "none", boxShadow: "none", background: "transparent" }} />
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(115deg, rgba(255,255,255,0) ${mix(-30, 130, k(t, 38.2, 39.6, EIO)) - 20}%, rgba(255,255,255,0.55) ${mix(-30, 130, k(t, 38.2, 39.6, EIO))}%, rgba(255,255,255,0) ${mix(-30, 130, k(t, 38.2, 39.6, EIO)) + 20}%)` }} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - k(t, 37.62, 38.0, EIO) }}>
              <BigButton press={0} glow={1 - morph} style={{ left: 0, top: 0, width: bw, height: bh, borderRadius: mix(30, 28, morph), fontSize: 40, color: `rgba(255,255,255,${1 - k(t, 37.12, 37.32, EIO)})` }} />
            </div>
          </div>
        </div>
      )}
      {tx > 0 && (
        <Glass rx={mix(12, 2, tx) + Math.sin(t * 0.6) * 1} ry={mix(-24, -10, tx) + Math.cos(t * 0.5) * 1.5} sheen={mix(-0.3, 1.2, k(t, 60.3, 61.7, EIO))} style={{ left: 1290, top: 380, opacity: k(t, 59.8, 60.4, EIO), transform: `translate(${(1 - tx) * 90}px, ${Math.sin(t * 0.9) * 5}px)`, filter: tx < 1 ? `blur(${(1 - tx) * 8}px)` : undefined }} inner={{ width: 520, padding: "22px 28px" }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Latest Transactions</div>
          <div style={{ position: "relative" }}>
            <div style={{ opacity: 1 - flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Pending" flash={1 - flip} /></div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Approved" flash={0.6 * (1 - k(t, 61.8, 62.4, EIO))} /></div>
          </div>
          <TxRow method="Crypto Wallet · Nov 18" amount="$750.00" status="Approved" />
        </Glass>
      )}
      {cur.o > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: cur.o }}>
          <Cursor x={cur.x} y={cur.y} press={cur.press} scale={t < 37.5 ? 1.6 : 1.15} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// step badge that cross-fades between labels
const BADGES: [number, number, string, string][] = [
  [34.8, 37.9, "START", "Tap Deposit"],
  [38.15, 43.9, "STEP 01/04", "Choose a method"],
  [44.0, 49.15, "STEP 02/04", "Enter details"],
  [49.25, 54.75, "STEP 03/04", "Review"],
  [54.85, 62.2, "STEP 04/04", "Confirm & track"],
];
const Badges: React.FC<{ t: number }> = ({ t }) => (
  <>
    {BADGES.map(([a, b, n, l]) => {
      const o = k(t, a, a + 0.45) * (1 - k(t, b - 0.05, b + 0.25, EIO));
      if (o <= 0) return null;
      return <StepBadge key={n} n={n} label={l} style={{ position: "absolute", left: 72, top: 56, opacity: o, transform: `translateY(${(1 - o) * -12}px)` }} />;
    })}
  </>
);

// ---------------- Scene 6: outro ----------------
const SceneOutro: React.FC<{ t: number }> = ({ t }) => {
  const cta = (i: number) => k(t, 67.2 + i * 0.15, 68.1 + i * 0.15, BACK);
  const fade = k(t, 70.1, 70.95, EIO);
  return (
    <AbsoluteFill style={{ opacity: 1 - fade }}>
      <div style={{ position: "absolute", top: 300, width: W, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${mix(1, 1.025, k(t, 63, 70.8, EIO))})` }}>
        <LogoReveal t={t} t0={62.8} width={560} />
        <div style={{ ...head(50, "#fff"), marginTop: 56 }}>
          <RiseWord t={t} at={wt(14, 2)}>Your </RiseWord>
          <RiseWord t={t} at={wt(14, 3)}>markets, </RiseWord>
          <RiseWord t={t} at={wt(14, 4)} style={redGrad}>simplified.</RiseWord>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, background: "linear-gradient(180deg, #D0343A, #9E1A20)", color: "#fff", fontFamily: FONT, fontSize: 21, fontWeight: 500, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 40px -16px rgba(226,70,76,0.8)", opacity: Math.min(1, cta(0)), transform: `translateY(${(1 - cta(0)) * 14}px) scale(${mix(0.94, 1, cta(0))})` }}>Open your account <Icon name="arrowRight" size={20} color="#fff" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.18)", background: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)", color: "#fff", fontFamily: FONT, fontSize: 21, opacity: Math.min(1, cta(1)), transform: `translateY(${(1 - cta(1)) * 14}px) scale(${mix(0.94, 1, cta(1))})` }}><Icon name="globe" size={20} color="rgba(255,255,255,0.8)" />abetglobal.com</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 46, width: W, textAlign: "center", fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.4)", opacity: k(t, 67.8, 68.7, EIO) }}>Trading involves risk. Only trade with capital you can afford to lose.</div>
    </AbsoluteFill>
  );
};

// ---------------- Transition: frosted-glass panel wipe ----------------
// A large glass panel glides right -> left. The scene swaps at `tm`, the moment the panel fully covers the frame.
const TR: { tm: number; from: number; to: number }[] = [
  { tm: 5.6, from: 0, to: 0 },
  { tm: 17.0, from: 0, to: 1 },
  { tm: 30.2, from: 1, to: 1 },
  { tm: 62.6, from: 1, to: 0 },
];
const WIPE = 1.5;
const GlassWipe: React.FC<{ t: number }> = ({ t }) => (
  <>
    {TR.map((tr) => {
      const a = tr.tm - WIPE / 2;
      const b = tr.tm + WIPE / 2;
      if (t < a || t > b) return null;
      // glide in -> brief rest fully covering the frame (swap happens here) -> glide out. Zero velocity at the joins.
      const x = 1980 - 2640 * k(t, a, tr.tm - 0.1, EIO) - 2640 * k(t, tr.tm + 0.1, b, EIO);
      const swap = tr.from !== tr.to;
      const L = mix(tr.from, tr.to, k(t, tr.tm - 0.08, tr.tm + 0.08, EIO)); // 0 dark glass, 1 light glass
      const solid = swap ? bell(t, tr.tm - 0.3, tr.tm - 0.1, tr.tm + 0.1, tr.tm + 0.3) : 0; // hide the world change
      const c = (d: number, l: number) => Math.round(mix(d, l, L));
      return (
        <div key={tr.tm} style={{ position: "absolute", left: 0, top: -70, width: 3200, height: 1220, borderRadius: 72, transform: `translate3d(${x}px, 0, 0)`, willChange: "transform", backdropFilter: "blur(38px) saturate(150%)", WebkitBackdropFilter: "blur(38px) saturate(150%)", background: `linear-gradient(100deg, rgba(${c(40, 255)},${c(48, 255)},${c(66, 255)},${mix(mix(0.5, 0.62, L), 0.97, solid)}) 0%, rgba(${c(16, 246)},${c(21, 247)},${c(34, 250)},${mix(mix(0.42, 0.5, L), 0.97, solid)}) 100%)`, boxShadow: `inset 1.5px 0 0 rgba(255,255,255,${mix(0.35, 0.9, L)}), inset 0 1px 0 rgba(255,255,255,${mix(0.25, 0.9, L)}), -40px 0 90px rgba(0,0,0,${mix(0.35, 0.12, L)})`, overflow: "hidden", zIndex: 60 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: `linear-gradient(90deg, rgba(255,255,255,${mix(0.16, 0.5, L)}) 0%, rgba(255,255,255,0) 100%)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.2px)", backgroundSize: "6px 6px", opacity: 0.5 }} />
        </div>
      );
    })}
  </>
);
// scenes drift in the wipe's direction for depth: outgoing eases left, incoming settles from the right
const slide = (t: number, tin: number | null, tout: number | null): React.CSSProperties => {
  let x = 0;
  if (tin !== null) x += 110 * (1 - k(t, tin - 0.25, tin + 0.95, EO));
  if (tout !== null) x -= 90 * k(t, tout - 0.65, tout + 0.05, Easing.bezier(0.5, 0, 0.9, 0.5));
  return x ? { transform: `translate3d(${x}px, 0, 0)` } : {};
};

// ---------------- Root ----------------
export const AbetVideo: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { let done = false; const fin = () => { if (!done) { done = true; continueRender(h); } }; Promise.race([fontsLoaded.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 6000))]).then(fin, fin); }, [h]);
  const f = useCurrentFrame();
  const t = f / ABET_FPS;
  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT }}>
      {t < 17.0 && (
        <AbsoluteFill>
          <BgDark t={f} glow={0.35 + 0.65 * k(t, 0, 1.6, EIO)} by={t < 5.6 ? 520 : 620} />
          {t < 5.6 && <AbsoluteFill style={slide(t, null, 5.6)}><SceneLogo t={t} /></AbsoluteFill>}
          {t >= 5.6 && <AbsoluteFill style={slide(t, 5.6, 17.0)}><SceneWhat t={t} /></AbsoluteFill>}
        </AbsoluteFill>
      )}
      {t >= 17.0 && t < 62.6 && (
        <AbsoluteFill>
          <BgLight t={f} />
          {t < 30.2 && <AbsoluteFill style={slide(t, 17.0, 30.2)}><SceneHow t={t} /></AbsoluteFill>}
          {t >= 30.2 && <AbsoluteFill style={slide(t, 30.2, 62.6)}><SceneDeposit t={t} /></AbsoluteFill>}
          <Badges t={t} />
        </AbsoluteFill>
      )}
      {t >= 62.6 && (
        <AbsoluteFill>
          <BgDark t={f} glow={1} by={520} />
          <AbsoluteFill style={slide(t, 62.6, null)}><SceneOutro t={t} /></AbsoluteFill>
        </AbsoluteFill>
      )}
      <GlassWipe t={t} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
