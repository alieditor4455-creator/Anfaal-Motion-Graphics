import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, useCurrentFrame } from "remotion";
import TM from "./timing.json";
import { AbetLogo, BACK, BgDark, BgLight, C, Caption, Cursor, EIO, EO, Eyebrow, FONT, Icon, StepBadge, fontsLoaded, mix, tw } from "./theme";
import { Dashboard, DepositCard, DepositPage, DepositState, TxRow } from "./portal";
import { BigButton, CalendarFloat, CW, CGAP, H, LogoLockup, MacPortal, ROW_X, SocialFloat, StepCard, W, WalletFloat, glass, redGrad } from "./frames";

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

// ---------------- Scene 1: logo intro ----------------
const SceneLogo: React.FC<{ t: number }> = ({ t }) => {
  const out = k(t, 4.95, 5.9, EIO);
  const push = mix(0.965, 1.02, k(t, 0, 5.6, EIO));
  return (
    <AbsoluteFill style={{ display: "grid", placeItems: "center", opacity: 1 - out, transform: `translateY(${-50 * out}px) scale(${push - 0.05 * out})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined }}>
      <LogoLockup
        width={760}
        logo={{ letters: [0, 1, 2, 3].map((i) => k(t, 0.45 + i * 0.12, 1.45 + i * 0.12)), bull: k(t, 1.3, 2.25, EIO), bear: k(t, 1.5, 2.45, EIO) }}
        line={k(t, 0.9, 2.5, EIO)}
        tag={k(t, 2.2, 3.3)}
      />
    </AbsoluteFill>
  );
};

// ---------------- Scene 2: what is ABET ----------------
const S2_FOCUS: [number, number] = [960, 500];
const SceneWhat: React.FC<{ t: number }> = ({ t }) => {
  const up = k(t, 8.7, 9.9, EIO); // headline travels to top
  const rise = k(t, 8.9, 10.6, EO);
  const lid = k(t, 9.1, 10.9, EIO);
  const drift = k(t, 10.6, 16.6, EIO);
  const zoom = k(t, 16.35, 17.45, Easing.bezier(0.55, 0, 0.75, 0.2)); // accelerate into the screen
  const one = k(t, wt(2, 10) - 0.1, wt(2, 10) + 1.0, EIO); // "All in one place" -> cards gather
  const floatsOut = k(t, 16.2, 16.75, EIO);
  const bob = (ph: number) => Math.sin(t * 1.1 + ph) * 6;
  const card = (at: number, from: [number, number]) => {
    const p = k(t, at - 0.05, at + 0.95);
    return { opacity: p * (1 - floatsOut), transform: `translate(${(1 - p) * from[0] + floatsOut * from[0] * -0.6}px, ${(1 - p) * from[1] + bob(at)}px) scale(${mix(0.7, 1, p) * (1 - 0.06 * one) + floatsOut * 0.25})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined };
  };
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + zoom * 3.4})`, transformOrigin: `${S2_FOCUS[0]}px ${S2_FOCUS[1]}px`, filter: `blur(${Math.max(0, zoom - 0.3) * 10}px)` }}>
      {/* headline */}
      <div style={{ position: "absolute", width: W, top: mix(385, 74, up), textAlign: "center", transform: `scale(${mix(1.22, 1, up)})`, opacity: 1 - floatsOut }}>
        <div style={head(58, "#fff")}>
          {["One ", "clean ", "portal"].map((w, i) => <RiseWord key={i} t={t} at={wt(1, i)}>{w}</RiseWord>)}
        </div>
        <div style={{ ...head(58, "rgba(255,255,255,0.5)"), marginTop: 4 }}>
          <RiseWord t={t} at={wt(1, 3)}>for </RiseWord>
          <RiseWord t={t} at={wt(1, 4)}>the </RiseWord>
          <RiseWord t={t} at={wt(1, 5)} style={redGrad}>global </RiseWord>
          <RiseWord t={t} at={wt(1, 6)} style={redGrad}>markets.</RiseWord>
        </div>
      </div>
      {/* laptop */}
      {rise > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: k(t, 8.9, 9.5, EIO) }}>
          <MacPortal x={W / 2} y={mix(1180, 740, rise) - 10 * drift} scale={mix(0.38, 0.42, rise) + 0.02 * drift} rx={mix(-38, -14, rise)} ry={mix(-46, -14, rise) + 4 * drift} lid={mix(-62, 16, lid)} rim={0.8}>
            <Dashboard />
          </MacPortal>
        </div>
      )}
      {/* floating feature cards: they arrive from the screen */}
      <CalendarFloat blur={3} style={{ left: 1430, top: 300, ...card(wt(2, 8), [-420, 160]), transform: `${card(wt(2, 8), [-420, 160]).transform} scale(0.86)` }} />
      <WalletFloat style={{ left: 150, top: 410, ...card(wt(2, 1), [520, 40]) }} />
      <div style={{ ...glass, left: 250, top: 735, padding: "16px 22px", display: "flex", alignItems: "center", gap: 12, fontSize: 19, fontWeight: 500, color: C.ink, ...card(wt(2, 3), [420, -160]) }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenSoft, display: "grid", placeItems: "center" }}><Icon name="shieldCheck" size={18} color={C.green} /></div>
        Real accounts <span style={{ padding: "3px 10px", borderRadius: 99, background: C.redSoft, color: C.red, fontSize: 15 }}>2</span>
      </div>
      <SocialFloat style={{ left: 1440, top: 610, ...card(wt(2, 4), [-420, -60]) }} />
    </AbsoluteFill>
  );
};

// ---------------- Scene 3: how it works ----------------
const STEP_AT = [TM[4].start, TM[5].start, TM[6].start, TM[7].start];
const SceneHow: React.FC<{ t: number }> = ({ t }) => {
  const up = k(t, 20.4, 21.3, EIO);
  const exit = (d: number) => k(t, 29.7 + d, 30.5 + d, EIO);
  const line = STEP_AT.reduce((acc, s, i) => (i === 0 ? acc : acc + k(t, s - 0.1, s + 0.6, EIO)), 0) / 3;
  const ex = exit(0);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: mix(360, 130, up), width: W, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - ex, transform: `translateY(${-30 * ex}px)`, filter: ex > 0 ? `blur(${ex * 8}px)` : undefined }}>
        <div style={{ opacity: k(t, 17.7, 18.4), transform: `translateY(${(1 - k(t, 17.7, 18.4)) * 14}px)` }}><Eyebrow>HOW IT WORKS</Eyebrow></div>
        <div style={{ ...head(78, C.ink), marginTop: 30 }}>
          <RiseWord t={t} at={wt(3, 3)} style={{ color: C.red }}>Four </RiseWord>
          <RiseWord t={t} at={wt(3, 4)}>simple </RiseWord>
          <RiseWord t={t} at={wt(3, 5)}>steps.</RiseWord>
        </div>
      </div>
      {/* connector */}
      <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 592, width: 3 * (CW + CGAP), height: 2, background: C.line, transformOrigin: "0 50%", transform: `scaleX(${k(t, 20.9, 22.0, EIO)})`, opacity: 1 - exit(0.1) }} />
      <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 592, width: 3 * (CW + CGAP), height: 2, background: `linear-gradient(90deg, ${C.green}, ${C.red})`, transformOrigin: "0 50%", transform: `scaleX(${line})`, opacity: 1 - exit(0.1) }} />
      {[0, 1, 2, 3].map((i) => {
        const s = STEP_AT[i];
        const next = STEP_AT[i + 1];
        const a = k(t, 20.85 + i * 0.12, 21.85 + i * 0.12);
        const on = k(t, s - 0.05, s + 0.7, EIO) * (next ? 1 - k(t, next - 0.05, next + 0.5, EIO) : 1);
        const done = next ? k(t, next - 0.05, next + 0.6, EIO) : 0;
        const dim = 0.55 * (1 - k(t, s - 0.2, s + 0.4, EIO));
        const e = exit(0.05 * i);
        return <StepCard key={i} i={i} a={a * (1 - e)} on={on} done={done} dim={dim} style={{ left: ROW_X + i * (CW + CGAP), top: 520 + 50 * e, filter: e > 0 ? `blur(${e * 8}px)` : undefined }} />;
      })}
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
    if (t >= c && t < c + 0.25) { view = from; viewT = 1 - k(t, c, c + 0.25, EIO); out = true; }
    else if (t >= c + 0.25) { view = to; viewT = k(t, c + 0.25, c + 0.75, EO); out = false; }
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
  // laptop: rises sharp (30.3), pushes in, racks out of focus (34.5), racks back in at the end (58.7)
  const rise = k(t, 30.3, 31.9, EO);
  const push = k(t, 32.6, 34.8, EIO);
  const blurIn = k(t, 34.45, 35.35, EIO);
  const back = k(t, 58.7, 59.9, EIO);
  const blur = 9 * blurIn * (1 - back);
  const mac = {
    x: mix(W / 2, 820, back),
    y: mix(mix(1150, 760, rise), 820, push) * (1 - back) + 760 * back,
    scale: mix(mix(0.4, 0.42, rise), 0.5, push) * (1 - back) + 0.44 * back,
    rx: mix(mix(-30, -14, rise), -14, push),
    ry: mix(mix(-30, -14, rise), -14, push) * (1 - back) - 20 * back,
    lid: 16,
  };
  const st = depositState(t);
  const onScreen = t < 37.4 ? <Dashboard depositGlow={k(t, 34.5, 35.2)} depositPress={0} /> : <DepositPage {...st} />;

  // title
  const titleIn = k(t, 30.55, 31.5);
  const titleOut = k(t, 33.9, 34.6, EIO);

  // big button lift + morph into the card
  const lift = k(t, 34.75, 35.75, EO);
  const morph = k(t, 37.15, 38.05, EIO);
  const bp = k(t, 36.52, 36.62, EIO) * (1 - k(t, 36.64, 36.95, EIO));
  const bx = mix(mix(780, W / 2, lift), W / 2, morph);
  const by = mix(mix(600, 520, lift), CARD_Y + CARD_H / 2, morph);
  const bw = mix(440, 900, morph);
  const bh = mix(118, CARD_H, morph);
  const showBtn = t >= 34.75 && t < 59.9;

  // card leaves back into the screen
  const cardBack = k(t, 58.75, 59.65, EIO);
  const ghosts = k(t, 35.1, 35.9) * (1 - k(t, 36.95, 37.35, EIO));
  const cur = cursorAt(t);

  // transactions card
  const tx = k(t, 59.75, 60.75);
  const flip = k(t, 61.35, 61.7, EIO);

  return (
    <AbsoluteFill>
      {/* title */}
      {t < 34.7 && (
        <div style={{ position: "absolute", top: 92, width: W, display: "flex", flexDirection: "column", alignItems: "center", opacity: titleIn * (1 - titleOut), transform: `translateY(${(1 - titleIn) * 20 - titleOut * 30}px)`, filter: titleOut > 0 ? `blur(${titleOut * 8}px)` : undefined }}>
          <Eyebrow>DEPOSIT GUIDE</Eyebrow>
          <div style={{ ...head(62, C.ink), marginTop: 22 }}>
            <RiseWord t={t} at={30.75}>Make </RiseWord><RiseWord t={t} at={30.9}>a </RiseWord><RiseWord t={t} at={31.05} style={{ color: C.red }}>deposit </RiseWord>
            <RiseWord t={t} at={31.3}>in </RiseWord><RiseWord t={t} at={31.45}>4 </RiseWord><RiseWord t={t} at={31.6}>steps.</RiseWord>
          </div>
        </div>
      )}
      {/* laptop */}
      {rise > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: k(t, 30.3, 30.8, EIO), filter: `blur(${blur}px)` }}>
          <MacPortal {...mac} active={t < 37.4 ? "Discover" : "Funds"} sub={t < 37.4 ? undefined : "Deposit"}>{onScreen}</MacPortal>
        </div>
      )}
      {/* ghost siblings of the deposit button (depth of field) */}
      {ghosts > 0 && (
        <>
          <div style={{ ...glass, left: 330 + (1 - ghosts) * 120, top: 472, width: 300, height: 96, display: "grid", placeItems: "center", filter: "blur(4px)", opacity: 0.7 * ghosts, fontSize: 30, color: C.red }}>Withdrawal</div>
          <div style={{ ...glass, left: 1290 - (1 - ghosts) * 120, top: 472, width: 300, height: 96, display: "grid", placeItems: "center", filter: "blur(4px)", opacity: 0.7 * ghosts, fontSize: 30, color: C.red }}>Transfer</div>
        </>
      )}
      {/* hero button that morphs into the deposit card */}
      {showBtn && (
        <div style={{ position: "absolute", left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, opacity: lift * (1 - cardBack), transform: `translate(${-140 * cardBack}px, ${-20 * cardBack}px) scale(${mix(0.35, 1, lift) * (1 - bp * 0.05) * mix(1, 0.55, cardBack)})`, filter: lift < 1 ? `blur(${(1 - lift) * 8}px)` : cardBack > 0 ? `blur(${cardBack * 6}px)` : undefined }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: mix(30, 28, morph), background: "#fff", boxShadow: `0 60px 110px -40px rgba(10,15,25,${mix(0.0, 0.55, morph)}), 0 0 0 1px rgba(17,24,39,${0.05 * morph})`, overflow: "hidden" }}>
            {morph > 0.35 && (
              <div style={{ position: "absolute", left: (bw - 900) / 2, top: (bh - CARD_H) / 2, opacity: k(t, 37.85, 38.3, EIO) }}>
                <DepositCard {...st} h={CARD_H} style={{ border: "none", boxShadow: "none", background: "transparent" }} />
              </div>
            )}
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - k(t, 37.62, 38.0, EIO) }}>
            <BigButton press={0} glow={1 - morph} style={{ left: 0, top: 0, width: bw, height: bh, borderRadius: mix(30, 28, morph), fontSize: 40, color: `rgba(255,255,255,${1 - k(t, 37.12, 37.32, EIO)})` }} />
          </div>
        </div>
      )}
      {/* transactions card */}
      {tx > 0 && (
        <div style={{ ...glass, left: 1290, top: 380, width: 520, padding: "22px 28px", opacity: tx, transform: `translate(${(1 - tx) * 80}px, ${Math.sin(t * 1.1) * 5}px)`, filter: tx < 1 ? `blur(${(1 - tx) * 8}px)` : undefined }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Latest Transactions</div>
          <div style={{ position: "relative" }}>
            <div style={{ opacity: 1 - flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Pending" flash={1 - flip} /></div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Approved" flash={0.6 * (1 - k(t, 61.8, 62.4, EIO))} /></div>
          </div>
          <TxRow method="Crypto Wallet · Nov 18" amount="$750.00" status="Approved" />
        </div>
      )}
      {/* cursor */}
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
  const settle = k(t, 65.55, 66.5, EIO);
  const cta = (i: number) => k(t, 67.2 + i * 0.14, 67.9 + i * 0.14, BACK);
  const fade = k(t, 70.2, 70.95, EIO);
  return (
    <AbsoluteFill style={{ opacity: 1 - fade }}>
      <div style={{ position: "absolute", top: 280, width: W, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - settle) * 120}px) scale(${mix(1.03, 1, k(t, 63.4, 70.5, EIO))})` }}>
        <AbetLogo width={560} state={{ letters: [0, 1, 2, 3].map((i) => k(t, 63.55 + i * 0.1, 64.5 + i * 0.1)), bull: k(t, 64.25, 65.1, EIO), bear: k(t, 64.4, 65.25, EIO) }} />
        <div style={{ ...head(50, "#fff"), marginTop: 54, opacity: settle > 0 ? 1 : 0 }}>
          <RiseWord t={t} at={wt(14, 2)}>Your </RiseWord>
          <RiseWord t={t} at={wt(14, 3)}>markets, </RiseWord>
          <RiseWord t={t} at={wt(14, 4)} style={redGrad}>simplified.</RiseWord>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, background: C.red, color: "#fff", fontFamily: FONT, fontSize: 21, fontWeight: 500, boxShadow: "0 20px 40px -16px rgba(226,70,76,0.8)", opacity: Math.min(1, cta(0)), transform: `translateY(${(1 - cta(0)) * 16}px) scale(${mix(0.92, 1, cta(0))})` }}>Open your account <Icon name="arrowRight" size={20} color="#fff" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: FONT, fontSize: 21, opacity: Math.min(1, cta(1)), transform: `translateY(${(1 - cta(1)) * 16}px) scale(${mix(0.92, 1, cta(1))})` }}><Icon name="globe" size={20} color="rgba(255,255,255,0.8)" />abetglobal.com</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 46, width: W, textAlign: "center", fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.4)", opacity: k(t, 67.8, 68.6, EIO) }}>Trading involves risk. Only trade with capital you can afford to lose.</div>
    </AbsoluteFill>
  );
};

// ---------------- Root ----------------
export const AbetVideo: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { let done = false; const fin = () => { if (!done) { done = true; continueRender(h); } }; Promise.race([fontsLoaded.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 6000))]).then(fin, fin); }, [h]);
  const f = useCurrentFrame();
  const t = f / ABET_FPS;

  const lightIn = k(t, 17.0, 17.65, EIO);
  // circle wipe to the outro: crimson leads, navy follows
  const wipe = k(t, 62.35, 63.45, EIO);
  const wipe2 = k(t, 62.5, 63.6, EIO);
  const R = 2300;

  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT }}>
      {/* dark world */}
      {t < 17.7 && (
        <AbsoluteFill>
          <BgDark t={f} />
          {t < 6.2 && <SceneLogo t={t} />}
          {t > 5.5 && <SceneWhat t={t} />}
        </AbsoluteFill>
      )}
      {/* light world */}
      {t > 16.95 && t < 63.7 && (
        <AbsoluteFill style={{ opacity: lightIn }}>
          <BgLight t={f} />
          {t < 31 && <SceneHow t={t} />}
          {t > 30 && <SceneDeposit t={t} />}
          <Badges t={t} />
        </AbsoluteFill>
      )}
      {/* outro world */}
      {t > 62.3 && (
        <>
          <AbsoluteFill style={{ background: C.red, clipPath: `circle(${wipe * R}px at 960px 560px)` }} />
          <AbsoluteFill style={{ clipPath: `circle(${wipe2 * R}px at 960px 560px)` }}>
            <BgDark t={f} glow={1.1} />
            {t > 63.3 && <SceneOutro t={t} />}
          </AbsoluteFill>
        </>
      )}
      <Captions t={t} />
    </AbsoluteFill>
  );
};
