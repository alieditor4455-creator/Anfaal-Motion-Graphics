import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import TM from "./timing4.json";
import { AbetLogo, BACK, BgDark, BgLight, C, Caption, Cursor, EIO, EO, Eyebrow, FONT, Icon, fontsLoaded, mix, tw } from "./theme";
import { DepositCard, DepositState, TxRow } from "./portal";
import { BigButton, redGrad } from "./frames";
import { MacBook, MacProps } from "./macbook";
import { AccountsG, CalendarG, Glass, SocialG, WalletG } from "./glass";

// v4 — energetic SaaS cut on a 118 BPM grid. ~48 s.
export const V4_FPS = 30;
export const V4_DUR = 48;
export const V4_FRAMES = V4_DUR * V4_FPS;
const W = 1920;

const LIN = Easing.linear;
const ACC = Easing.bezier(0.55, 0, 0.9, 0.35);
const SNAP = Easing.bezier(0.2, 0.9, 0.1, 1); // quick, decisive arrival for type hits
const k = (t: number, a: number, b: number, e = EO) => tw(t, a, b, e);
const bell = (t: number, a: number, b: number, c: number, d: number) => k(t, a, b, EIO) * (1 - k(t, c, d, EIO));
const wt = (l: number, w: number) => TM[l].t[w];

// ---------------- typography primitives ----------------
const display = (size: number, color: string, weight = 500): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, fontWeight: weight, letterSpacing: "-0.04em", lineHeight: 1.08, color, whiteSpace: "nowrap" });

// word rising out of its own mask (clean, no blur), keyed to a time; `out` pushes it up and away
const MaskWord: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ t, at, out = 99, children, style, dur = 0.55 }) => {
  const p = k(t, at - 0.06, at + dur, SNAP);
  const o = k(t, out, out + 0.45, Easing.bezier(0.6, 0, 0.8, 0.4));
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.16em", marginBottom: "-0.16em" }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105 - o * 105}%)`, whiteSpace: "pre", ...style }}>{children}</span>
    </span>
  );
};

// big word hit: scales down onto the screen with a short blur, lands on the beat
const HitWord: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => {
  const p = k(t, at - 0.04, at + 0.32, SNAP);
  if (p <= 0) return <span style={{ display: "inline-block", opacity: 0, whiteSpace: "pre", ...style }}>{children}</span>;
  return <span style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p * 2.2), transform: `scale(${mix(1.45, 1, p)})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, ...style }}>{children}</span>;
};

// inline icon chip that opens inside a sentence (pushes the next word)
const InlineChip: React.FC<{ t: number; at: number; icon: string; size?: number; dark?: boolean }> = ({ t, at, icon, size = 88, dark }) => {
  const p = k(t, at, at + 0.5, SNAP);
  const pop = k(t, at + 0.1, at + 0.55, BACK);
  return (
    <span style={{ display: "inline-block", width: (size + 22) * p, height: size, verticalAlign: "middle", position: "relative", top: -size * 0.06 }}>
      <span style={{ position: "absolute", left: 10, top: 0, width: size, height: size, borderRadius: size * 0.28, background: "linear-gradient(140deg, #E2464C, #8E1218)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 30px -10px rgba(226,70,76,${dark ? 0.8 : 0.55})`, display: "grid", placeItems: "center", transform: `scale(${pop}) rotate(${(1 - pop) * -18}deg)`, opacity: Math.min(1, pop * 2) }}>
        <Icon name={icon} size={size * 0.5} color="#fff" sw={2} />
      </span>
    </span>
  );
};

// vertical slot roll between several items; idx is continuous
const SlotRoll: React.FC<{ items: React.ReactNode[]; idx: number; h: number; style?: React.CSSProperties }> = ({ items, idx, h, style }) => {
  const frac = idx - Math.floor(idx);
  const moving = frac > 0.001 && frac < 0.999;
  return (
    <div style={{ height: h, overflow: "hidden", position: "relative", ...style }}>
      <div style={{ transform: `translateY(${-idx * h}px)`, filter: moving ? `blur(${Math.sin(frac * Math.PI) * 6}px)` : undefined }}>
        {items.map((it, i) => <div key={i} style={{ height: h, display: "flex", alignItems: "center" }}>{it}</div>)}
      </div>
    </div>
  );
};

// laptop with a crisp pre-rendered screen
const MacImg: React.FC<Omit<MacProps, "children"> & { src: string; src2?: string; mixT?: number }> = ({ src, src2, mixT = 0, ...mac }) => (
  <MacBook {...mac}>
    <Img src={staticFile(`abet/screens/${src}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    {src2 && mixT > 0 && <Img src={staticFile(`abet/screens/${src2}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: mixT }} />}
  </MacBook>
);

// ---------------- Scene 0: logo ----------------
const LogoFast: React.FC<{ t: number; t0: number; width: number }> = ({ t, t0, width }) => (
  <AbetLogo
    width={width}
    state={{
      letters: [0, 1, 2, 3].map((i) => k(t, t0 + i * 0.06, t0 + 0.62 + i * 0.06, SNAP)),
      bull: k(t, t0 + 0.5, t0 + 1.0, EIO),
      bear: k(t, t0 + 0.6, t0 + 1.1, EIO),
      sweep: mix(-0.25, 1.25, k(t, t0 + 0.95, t0 + 1.85, EIO)),
      glow: 0.75 * k(t, t0 + 0.8, t0 + 1.4, EIO) * (1 - 0.6 * k(t, t0 + 2.0, t0 + 3.0, EIO)),
    }}
  />
);
const SceneLogo: React.FC<{ t: number }> = ({ t }) => {
  const tag = k(t, 1.15, 1.85);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${mix(1, 1.05, k(t, 0, 2.9, EIO))})` }}>
      <LogoFast t={t} t0={0.08} width={700} />
      <div style={{ marginTop: 44, fontFamily: FONT, fontSize: 19, letterSpacing: `${mix(0.7, 0.42, tag)}em`, paddingLeft: "0.42em", color: "rgba(255,255,255,0.62)", opacity: tag }}>GLOBAL MARKETS · ONE PORTAL</div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 1: what is ABET ----------------
const SceneWhat: React.FC<{ t: number }> = ({ t }) => {
  const OUT = 6.2;
  const rise = k(t, 6.3, 7.35, EO);
  const push = k(t, 7.3, 11.1, EIO);
  const hitIn = k(t, 10.95, 11.35, EIO); // laptop recedes for the word hit
  const card = (at: number, from: [number, number], tilt: number, ph: number) => {
    const p = k(t, at - 0.05, at + 0.6, SNAP);
    return {
      style: { opacity: Math.min(1, p * 2.5) * (1 - hitIn), transform: `translate3d(${(1 - p) * from[0]}px, ${(1 - p) * from[1] + Math.sin(t * 1.2 + ph) * 5}px, 0) scale(${mix(0.75, 1, p)})` } as React.CSSProperties,
      rx: mix(16, 4, p) + Math.sin(t * 0.8 + ph) * 1.2,
      ry: tilt * mix(1.7, 1, p) + Math.cos(t * 0.7 + ph) * 1.5,
      sheen: mix(-0.3, 1.2, k(t, at + 0.1, at + 1.1, EIO)),
    };
  };
  const wa = card(wt(2, 1), [520, 80], 16, 0);
  const ac = card(wt(2, 3), [420, -140], 14, 1.3);
  const so = card(wt(2, 4), [-440, -40], -16, 2.1);
  const ca = card(wt(2, 8), [-440, 160], -14, 3.4);
  return (
    <AbsoluteFill>
      {/* opening headline: masked line reveals + inline icon chip */}
      {t < 6.9 && (
        <div style={{ position: "absolute", top: 330, width: W, textAlign: "center" }}>
          <div style={display(104, "#fff")}>
            <MaskWord t={t} at={wt(1, 0)} out={OUT}>One </MaskWord>
            <MaskWord t={t} at={wt(1, 1)} out={OUT + 0.04}>clean</MaskWord>
            <InlineChip t={t} at={wt(1, 1) + 0.22} icon="grid" dark />
            <MaskWord t={t} at={wt(1, 2)} out={OUT + 0.08}>portal,</MaskWord>
          </div>
          <div style={{ ...display(104, "rgba(255,255,255,0.5)"), marginTop: 6 }}>
            <MaskWord t={t} at={wt(1, 3)} out={OUT + 0.1}>for </MaskWord>
            <MaskWord t={t} at={wt(1, 4)} out={OUT + 0.12}>the </MaskWord>
            <MaskWord t={t} at={wt(1, 5)} out={OUT + 0.14} style={redGrad}>global </MaskWord>
            <MaskWord t={t} at={wt(1, 6)} out={OUT + 0.16} style={redGrad}>markets.</MaskWord>
          </div>
        </div>
      )}
      {/* laptop + glass feature cards */}
      {t > 6.25 && (
        <AbsoluteFill style={{ transform: `scale(${mix(1, 0.9, hitIn)})`, opacity: 1 - 0.75 * hitIn, filter: hitIn > 0 ? `blur(${hitIn * 8}px)` : undefined }}>
          <div style={{ position: "absolute", inset: 0, opacity: k(t, 6.3, 6.8, EIO) }}>
            <MacImg src="dash" x={W / 2} y={mix(1060, 760, rise) - 14 * push} scale={0.44 + 0.03 * push} rx={mix(-30, -14, rise)} ry={mix(-34, -14, rise) + 6 * push} lid={16} rim={0.9} />
          </div>
          <Glass dark rx={ca.rx} ry={ca.ry} sheen={ca.sheen} style={{ left: 1430, top: 270, ...ca.style }}><CalendarG /></Glass>
          <Glass dark rx={wa.rx} ry={wa.ry} sheen={wa.sheen} style={{ left: 130, top: 330, ...wa.style }}><WalletG /></Glass>
          <Glass dark rx={ac.rx} ry={ac.ry} sheen={ac.sheen} radius={20} style={{ left: 220, top: 690, ...ac.style }}><AccountsG /></Glass>
          <Glass dark rx={so.rx} ry={so.ry} sheen={so.sheen} style={{ left: 1460, top: 620, ...so.style }}><SocialG /></Glass>
        </AbsoluteFill>
      )}
      {/* full-screen word hit */}
      {t > 11.0 && (
        <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
          <div style={display(150, "#fff", 600)}>
            <HitWord t={t} at={wt(3, 0)}>All </HitWord>
            <HitWord t={t} at={wt(3, 1)}>in </HitWord>
            <HitWord t={t} at={wt(3, 2)} style={redGrad}>one </HitWord>
            <HitWord t={t} at={wt(3, 3)} style={redGrad}>place.</HitWord>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------- Scene 2: how it works ----------------
const STEPS4 = [
  { icon: "userPlus", text: "Create your account" },
  { icon: "shieldCheck", text: "Verify your profile" },
  { icon: "wallet", text: "Fund your wallet" },
  { icon: "candles", text: "Start trading" },
];
const PH_AT = [wt(5, 0), wt(5, 3), wt(5, 6), wt(5, 9)];
const CHIP_X = 520;
const CHIP_Y = 520;
const SceneHow: React.FC<{ t: number }> = ({ t }) => {
  const OUT = 15.0;
  const idx = PH_AT.slice(1).reduce((s, a) => s + k(t, a - 0.12, a + 0.33, EIO), 0);
  const stepsIn = k(t, 15.1, 15.55, SNAP);
  return (
    <AbsoluteFill>
      {t < 15.6 && (
        <div style={{ position: "absolute", top: 360, width: W, textAlign: "center" }}>
          <div style={display(104, C.ink)}>
            <MaskWord t={t} at={wt(4, 0)} out={OUT}>Getting </MaskWord>
            <MaskWord t={t} at={wt(4, 1)} out={OUT + 0.04}>started</MaskWord>
          </div>
          <div style={{ ...display(104, C.ink), marginTop: 6 }}>
            <MaskWord t={t} at={wt(4, 2)} out={OUT + 0.08}>is </MaskWord>
            <MaskWord t={t} at={wt(4, 3)} out={OUT + 0.12} style={{ color: C.red }}>simple.</MaskWord>
          </div>
          <svg width="330" height="24" viewBox="0 0 330 24" style={{ position: "absolute", left: 1010, top: 222, overflow: "visible", opacity: 1 - k(t, OUT, OUT + 0.3, EIO) }}>
            <path d="M4 16 C 90 4, 220 4, 326 14" stroke={C.red} strokeWidth="6" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, wt(4, 3) + 0.25, wt(4, 3) + 0.8, EIO)} />
          </svg>
        </div>
      )}
      {t > 15.0 && (
        <AbsoluteFill style={{ opacity: stepsIn }}>
          {/* rolling icon chip */}
          <div style={{ position: "absolute", left: CHIP_X - 70, top: CHIP_Y - 70, width: 140, height: 140, perspective: 800, transform: `scale(${mix(0.6, 1, stepsIn)})` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 38, background: "linear-gradient(140deg, #E2464C, #8E1218)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 26px 50px -16px rgba(179,36,42,0.6)", display: "grid", placeItems: "center", transform: `rotateY(${(idx % 1) * 180 > 90 ? (idx % 1) * 180 - 180 : (idx % 1) * 180}deg)` }}>
              <Icon name={STEPS4[Math.min(3, Math.round(idx))].icon} size={66} color="#fff" sw={1.8} />
            </div>
          </div>
          <div style={{ position: "absolute", left: CHIP_X + 110, top: CHIP_Y - 112 }}>
            <SlotRoll idx={idx} h={56} items={STEPS4.map((_, i) => <span key={i} style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, letterSpacing: "0.14em", color: C.red }}>STEP 0{i + 1}</span>)} />
            <SlotRoll idx={idx} h={124} items={STEPS4.map((s, i) => <span key={i} style={display(96, C.ink)}>{s.text}</span>)} />
          </div>
          {/* progress */}
          <div style={{ position: "absolute", left: CHIP_X - 70, top: CHIP_Y + 150, display: "flex", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 200, height: 6, borderRadius: 6, background: C.line, overflow: "hidden" }}>
                <div style={{ width: `${k(t, PH_AT[i] - 0.1, PH_AT[i] + 0.6, EIO) * 100}%`, height: "100%", background: i < 3 ? `linear-gradient(90deg, ${C.green}, #3CC46F)` : C.red }} />
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------- Scene 3a: "So, how do you deposit?" on crimson + typographic mask ----------------
const DEP_TXT = { x: 960, y: 640, size: 230 };
const MASK_A: [number, number] = [625, 488]; // a point inside the stem of the "d" (verified from a test render)
const MASK_T0 = 22.5;
const MASK_T1 = 23.2;
const SceneAsk: React.FC<{ t: number; asMask?: boolean }> = ({ t }) => {
  const p = k(t, wt(6, 4) - 0.04, wt(6, 4) + 0.32, SNAP);
  const knock = k(t, 22.3, 22.5, EIO); // word turns from white ink into a window
  const z = k(t, MASK_T0, MASK_T1, ACC);
  const s = 1 + z * 46;
  const top1 = 1 - k(t, 22.25, 22.5, EIO);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="dep-knock" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
            <rect x="0" y="0" width="1920" height="1080" fill="#fff" />
            <g transform={`translate(${MASK_A[0]} ${MASK_A[1]}) scale(${s}) translate(${-MASK_A[0]} ${-MASK_A[1]})`}>
              <text x={DEP_TXT.x} y={DEP_TXT.y} textAnchor="middle" fontFamily="Lexend" fontWeight={600} fontSize={DEP_TXT.size} letterSpacing="-9" fill="#000" opacity={knock}>deposit?</text>
            </g>
          </mask>
          <linearGradient id="crim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C8303A" /><stop offset="1" stopColor="#7E0E14" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="1920" height="1080" fill="url(#crim)" mask="url(#dep-knock)" />
        {/* the white word itself (hit animation) */}
        {knock < 1 && (
          <g style={{ transformOrigin: `${DEP_TXT.x}px ${DEP_TXT.y - 80}px`, transform: `scale(${mix(1.45, 1, p)})`, opacity: Math.min(1, p * 2.2) * (1 - knock) }}>
            <text x={DEP_TXT.x} y={DEP_TXT.y} textAnchor="middle" fontFamily="Lexend" fontWeight={600} fontSize={DEP_TXT.size} letterSpacing="-9" fill="#fff">deposit?</text>
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", top: 300, width: W, textAlign: "center", opacity: top1 }}>
        <div style={display(76, "rgba(255,255,255,0.78)", 400)}>
          <HitWord t={t} at={wt(6, 0)}>So, </HitWord>
          <HitWord t={t} at={wt(6, 1)}>how </HitWord>
          <HitWord t={t} at={wt(6, 2)}>do </HitWord>
          <HitWord t={t} at={wt(6, 3)}>you</HitWord>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 3b: deposit walkthrough ----------------
const CARD_S = 0.9;
const CX = 160; // card top-left on stage
const CY = 540 - (590 * CARD_S) / 2;
const toStage = (x: number, y: number): [number, number] => [CX + x * CARD_S, CY + y * CARD_S];
const RX = 1150; // right text column x

function dep(t: number): DepositState {
  const SW: [number, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3][] = [[30.05, 0, 1], [33.2, 1, 2], [35.2, 2, 3]];
  let view: 0 | 1 | 2 | 3 = 0;
  let viewT = 1;
  let out = false;
  for (const [c, from, to] of SW) {
    if (t >= c && t < c + 0.16) { view = from; viewT = 1 - k(t, c, c + 0.16, EIO); out = true; }
    else if (t >= c + 0.16) { view = to; viewT = k(t, c + 0.16, c + 0.56, EO); out = false; }
  }
  const step = k(t, 30.05, 30.55, EIO) + k(t, 33.2, 33.7, EIO) + k(t, 35.2, 35.7, EIO) + k(t, 36.45, 36.85, EIO);
  const w8 = (i: number) => wt(8, i);
  const rings = [bell(t, w8(3) - 0.12, w8(3) + 0.2, w8(5) - 0.12, w8(5) + 0.15), bell(t, w8(5) - 0.12, w8(5) + 0.2, w8(7) - 0.12, w8(7) + 0.15), bell(t, w8(7) - 0.12, w8(7) + 0.2, 29.3, 29.6)];
  const press = (c: number) => k(t, c, c + 0.08, EIO) * (1 - k(t, c + 0.1, c + 0.35, EIO));
  const confirmAt = wt(11, 0) + 0.05;
  return {
    step, view, viewT, out,
    cardsIn: [0, 1, 2].map((i) => k(t, 25.75 + i * 0.1, 26.45 + i * 0.1, SNAP)),
    rings,
    sel: k(t, 29.45, 29.75, BACK),
    amount: "$500.00".slice(0, Math.floor(k(t, 31.1, 31.75, LIN) * 7 + 0.0001)),
    caret: t < 31.75 || Math.floor(t * 2.4) % 2 === 0,
    chip: k(t, 31.85, 32.1, EIO),
    checks: [0, 1, 2, 3].map((i) => k(t, 33.75 + i * 0.2, 34.05 + i * 0.2, EIO)),
    continuePress: press(29.95) + press(33.05) + press(35.05),
    confirmPress: press(confirmAt),
    morph: k(t, confirmAt + 0.12, confirmAt + 0.55, EIO) + Math.max(0, t - (confirmAt + 0.55)) * 1.4,
    success: k(t, 36.2, 37.1, LIN),
  };
}

function cursor(t: number) {
  const crypto = toStage(165, 280);
  const cont = toStage(450, 530);
  const K: [number, number, number][] = [
    [23.75, 1520, 980], [24.45, 1060, 548], [24.8, 1075, 560],
    [28.8, 900, 900], [29.4, crypto[0], crypto[1]], [29.6, crypto[0] + 10, crypto[1] + 8], [29.9, cont[0], cont[1]], [30.3, cont[0] + 30, cont[1] + 40],
    [32.5, 900, 980], [33.0, cont[0], cont[1]], [33.4, cont[0] + 30, cont[1] + 40],
    [34.5, 900, 980], [35.0, cont[0], cont[1]], [35.4, cont[0] + 10, cont[1] + 10], [35.6, cont[0], cont[1]], [36.0, cont[0] + 40, cont[1] + 60],
  ];
  let x = K[0][1];
  let y = K[0][2];
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, xa, ya] = K[i];
    const [tb, xb, yb] = K[i + 1];
    if (t >= ta && t <= tb) { x = mix(xa, xb, k(t, ta, tb, EIO)); y = mix(ya, yb, k(t, ta, tb, Easing.bezier(0.5, 0, 0.3, 1))); }
    else if (t > tb) { x = xb; y = yb; }
  }
  const vis = (a: number, b: number) => k(t, a, a + 0.25, EIO) * (1 - k(t, b, b + 0.25, EIO));
  const o = Math.min(1, vis(23.75, 25.0) + vis(28.8, 30.4) + vis(32.5, 33.4) + vis(34.5, 36.1));
  const rip = (c: number) => (t >= c && t <= c + 0.45 ? (t - c) / 0.45 : 0);
  const press = rip(24.56) || rip(29.45) || rip(29.95) || rip(33.05) || rip(35.05) || rip(wt(11, 0) + 0.05);
  return { x, y, o, press };
}

// right-hand kinetic column, one block per step
const StepText: React.FC<{ t: number; a: number; b: number; n: string; title: string; children?: React.ReactNode }> = ({ t, a, b, n, title, children }) => {
  if (t < a - 0.1 || t > b + 0.6) return null;
  return (
    <div style={{ position: "absolute", left: RX, top: 330, width: 700 }}>
      <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, letterSpacing: "0.16em", color: C.red }}><MaskWord t={t} at={a} out={b}>{n}</MaskWord></div>
      <div style={{ ...display(76, C.ink), marginTop: 14 }}>{title.split(" ").map((w, i) => <MaskWord key={i} t={t} at={a + 0.06 + i * 0.07} out={b + i * 0.03}>{w + " "}</MaskWord>)}</div>
      <div style={{ marginTop: 30, opacity: 1 - k(t, b, b + 0.35, EIO), transform: `translateY(${-k(t, b, b + 0.45, EIO) * 30}px)` }}>{children}</div>
    </div>
  );
};

const MethodSwap: React.FC<{ t: number }> = ({ t }) => {
  const w8 = (i: number) => wt(8, i);
  const idx = k(t, w8(5) - 0.1, w8(5) + 0.3, EIO) + k(t, w8(7) - 0.1, w8(7) + 0.3, EIO);
  const icons = ["bitcoin", "card", "bank"];
  const names = ["Crypto wallet", "E-wallet", "Local bank"];
  const inn = k(t, w8(3) - 0.1, w8(3) + 0.4, SNAP);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: inn, transform: `translateY(${(1 - inn) * 30}px)` }}>
      <div style={{ width: 92, height: 92, borderRadius: 26, background: "linear-gradient(140deg, #E2464C, #8E1218)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 34px -12px rgba(179,36,42,0.6)", overflow: "hidden" }}>
        <SlotRoll idx={idx} h={92} items={icons.map((ic) => <div key={ic} style={{ width: 92, display: "grid", placeItems: "center" }}><Icon name={ic} size={44} color="#fff" /></div>)} />
      </div>
      <SlotRoll idx={idx} h={92} items={names.map((n) => <span key={n} style={display(64, C.red, 600)}>{n}</span>)} />
    </div>
  );
};

const SceneDeposit: React.FC<{ t: number }> = ({ t }) => {
  const push = k(t, 22.9, 24.1, EIO);
  const blur = 10 * k(t, 23.9, 24.6, EIO);
  const st = dep(t);
  const lift = k(t, 23.95, 24.75, SNAP);
  const morph = k(t, 24.95, 25.75, EIO);
  const bp = k(t, 24.56, 24.64, EIO) * (1 - k(t, 24.66, 24.95, EIO));
  // button centre -> card centre (left side)
  const cardC = [CX + (900 * CARD_S) / 2, 540];
  const bx = mix(mix(820, W / 2, lift), cardC[0], morph);
  const by = mix(mix(600, 520, lift), cardC[1], morph);
  const bw = mix(440, 900 * CARD_S, morph);
  const bh = mix(118, 590 * CARD_S, morph);
  const ghosts = k(t, 24.1, 24.7) * (1 - k(t, 24.9, 25.25, EIO));
  const cur = cursor(t);
  const settle = k(t, 25.6, 26.5, EO);
  const crx = Math.sin(t * 0.7) * 1.2 * settle;
  const cry = mix(8, 0, settle) * morph + Math.cos(t * 0.55) * 1.8 * settle;
  const tx = k(t, 38.3, 39.0, SNAP);
  const flip = k(t, wt(12, 6) + 0.1, wt(12, 6) + 0.45, EIO);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, opacity: 1 - 0.35 * k(t, 24.6, 25.6, EIO) }}>
        <MacImg src="dash" x={W / 2} y={mix(780, 830, push)} scale={mix(0.44, 0.5, push)} rx={-14} ry={mix(-12, -15, push)} lid={16} />
      </div>
      {ghosts > 0 && (
        <>
          <Glass ry={14} style={{ left: 330 + (1 - ghosts) * 120, top: 472, opacity: 0.75 * ghosts, filter: "blur(4px)" }} inner={{ width: 300, height: 96, display: "grid", placeItems: "center", fontSize: 30, color: C.red }}>Withdrawal</Glass>
          <Glass ry={-14} style={{ left: 1290 - (1 - ghosts) * 120, top: 472, opacity: 0.75 * ghosts, filter: "blur(4px)" }} inner={{ width: 300, height: 96, display: "grid", placeItems: "center", fontSize: 30, color: C.red }}>Transfer</Glass>
        </>
      )}
      {t >= 23.95 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: bh, perspective: 1600, willChange: "transform", opacity: k(t, 23.95, 24.4, EIO), transform: `translate3d(${bx - bw / 2}px, ${by - bh / 2}px, 0) scale(${mix(0.4, 1, lift) * (1 - bp * 0.05)})` }}>
          <div style={{ position: "absolute", inset: 0, transform: `rotateX(${crx}deg) rotateY(${cry}deg)` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: mix(30, 26, morph), overflow: "hidden", background: "linear-gradient(165deg, #FFFFFF 0%, #FBFBFC 100%)", boxShadow: `inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,${0.06 * morph}), 0 30px 60px -24px rgba(17,24,39,${0.22 * morph}), 0 80px 140px -50px rgba(179,36,42,${0.35 * morph})` }}>
              {morph > 0.35 && (
                <div style={{ position: "absolute", left: (bw - 900 * CARD_S) / 2, top: (bh - 590 * CARD_S) / 2, width: 900, height: 590, transform: `scale(${CARD_S})`, transformOrigin: "0 0", opacity: k(t, 25.45, 25.85, EIO) }}>
                  <DepositCard {...st} h={590} style={{ border: "none", boxShadow: "none", background: "transparent" }} />
                </div>
              )}
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - k(t, 25.3, 25.65, EIO) }}>
              <BigButton glow={1 - morph} style={{ left: 0, top: 0, width: bw, height: bh, borderRadius: mix(30, 26, morph), fontSize: 40, color: `rgba(255,255,255,${1 - k(t, 24.95, 25.12, EIO)})` }} />
            </div>
          </div>
        </div>
      )}
      {/* right column — kinetic type per step */}
      <StepText t={t} a={25.95} b={29.95} n="STEP 01" title="Choose your method"><MethodSwap t={t} /></StepText>
      <StepText t={t} a={30.25} b={33.05} n="STEP 02" title="Enter the amount">
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={display(104, C.red, 600)}>${Math.round(k(t, 31.1, 31.8, EIO) * 500)}<span style={{ color: "rgba(179,36,42,0.45)" }}>.00</span></span>
          <span style={{ padding: "8px 16px", borderRadius: 99, background: C.redSoft, color: C.red, fontFamily: FONT, fontSize: 20, fontWeight: 500, opacity: k(t, 32.2, 32.6, EIO) }}>USDT · TRC20</span>
        </div>
      </StepText>
      <StepText t={t} a={33.4} b={35.05} n="STEP 03" title="Review your summary">
        <div style={{ display: "flex", gap: 12 }}>
          {["Method", "Network", "Amount"].map((l, i) => {
            const c = k(t, 33.75 + i * 0.2, 34.1 + i * 0.2, BACK);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 16, background: "#fff", boxShadow: "0 10px 30px -14px rgba(17,24,39,0.3), 0 0 0 1px rgba(17,24,39,0.05)", fontFamily: FONT, fontSize: 22, fontWeight: 500, color: C.ink, opacity: Math.min(1, c * 2), transform: `translateY(${(1 - c) * 20}px) scale(${mix(0.85, 1, c)})` }}>
                <span style={{ width: 28, height: 28, borderRadius: 99, background: C.green, display: "grid", placeItems: "center" }}><Icon name="check" size={16} color="#fff" sw={3} draw={k(t, 33.9 + i * 0.2, 34.2 + i * 0.2, EIO)} /></span>{l}
              </div>
            );
          })}
        </div>
      </StepText>
      <StepText t={t} a={35.4} b={37.45} n="STEP 04" title="Confirm.">
        <div style={display(104, C.green, 600)}><HitWord t={t} at={wt(11, 3)}>Done.</HitWord></div>
      </StepText>
      {t > 37.5 && (
        <div style={{ position: "absolute", left: RX, top: 300, width: 700 }}>
          <div style={display(76, C.ink)}>
            {"Track it anytime.".split(" ").map((w, i) => <MaskWord key={i} t={t} at={wt(12, 0) + i * 0.09}>{w + " "}</MaskWord>)}
          </div>
          {tx > 0 && (
            <Glass rx={mix(14, 2, tx) + Math.sin(t * 0.7) * 1} ry={mix(-26, -8, tx) + Math.cos(t * 0.6) * 1.5} sheen={mix(-0.3, 1.2, k(t, 38.8, 39.9, EIO))} style={{ left: 0, top: 130, opacity: Math.min(1, tx * 2), transform: `translate3d(${(1 - tx) * 120}px, ${Math.sin(t * 1.1) * 4}px, 0)` }} inner={{ width: 560, padding: "22px 28px" }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Latest Transactions</div>
              <div style={{ position: "relative" }}>
                <div style={{ opacity: 1 - flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Pending" flash={1 - flip} /></div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: flip }}><TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Approved" flash={0.6 * (1 - k(t, 40.3, 40.9, EIO))} /></div>
              </div>
              <TxRow method="Crypto Wallet · Nov 18" amount="$750.00" status="Approved" />
            </Glass>
          )}
        </div>
      )}
      {cur.o > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: cur.o }}>
          <Cursor x={cur.x} y={cur.y} press={cur.press} scale={t < 25 ? 1.6 : 1.2} />
        </div>
      )}
    </AbsoluteFill>
  );
};
// success circle centre on stage (inside the card, view 3)
const SUCCESS_C = toStage(450, 150 + 24 + 64);

// ---------------- Scene 4: outro ----------------
const SceneOutro: React.FC<{ t: number }> = ({ t }) => {
  const cta = (i: number) => k(t, 45.2 + i * 0.12, 45.85 + i * 0.12, BACK);
  return (
    <AbsoluteFill style={{ opacity: 1 - k(t, 47.25, 47.95, EIO) }}>
      <div style={{ position: "absolute", top: 290, width: W, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${mix(1, 1.03, k(t, 41.8, 48, EIO))})` }}>
        <LogoFast t={t} t0={41.9} width={560} />
        <div style={{ ...display(54, "#fff", 400), marginTop: 56 }}>
          <MaskWord t={t} at={wt(13, 2)}>Your </MaskWord>
          <MaskWord t={t} at={wt(13, 3)}>markets, </MaskWord>
          <MaskWord t={t} at={wt(13, 4)} style={redGrad}>simplified.</MaskWord>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, background: "linear-gradient(180deg, #D0343A, #9E1A20)", color: "#fff", fontFamily: FONT, fontSize: 21, fontWeight: 500, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 40px -16px rgba(226,70,76,0.8)", opacity: Math.min(1, cta(0)), transform: `translateY(${(1 - cta(0)) * 14}px) scale(${mix(0.92, 1, cta(0))})` }}>Open your account <Icon name="arrowRight" size={20} color="#fff" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.18)", background: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)", color: "#fff", fontFamily: FONT, fontSize: 21, opacity: Math.min(1, cta(1)), transform: `translateY(${(1 - cta(1)) * 14}px) scale(${mix(0.92, 1, cta(1))})` }}><Icon name="globe" size={20} color="rgba(255,255,255,0.8)" />abetglobal.com</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 46, width: W, textAlign: "center", fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.4)", opacity: k(t, 45.6, 46.3, EIO) }}>Trading involves risk. Only trade with capital you can afford to lose.</div>
    </AbsoluteFill>
  );
};

// ---------------- transitions ----------------
// T1 glass wipe (dark): glide in, rest covering, glide out
const GlassWipe: React.FC<{ t: number; tm: number; light?: boolean }> = ({ t, tm, light }) => {
  const a = tm - 0.6;
  const b = tm + 0.6;
  if (t < a || t > b) return null;
  const x = 1980 - 2640 * k(t, a, tm - 0.08, EIO) - 2640 * k(t, tm + 0.08, b, EIO);
  const solid = 0.92 * bell(t, tm - 0.3, tm - 0.15, tm + 0.12, tm + 0.26);
  const base = light ? [255, 255, 255] : [30, 38, 56];
  return (
    <div style={{ position: "absolute", left: 0, top: -70, width: 3200, height: 1220, borderRadius: 72, transform: `translate3d(${x}px, 0, 0)`, willChange: "transform", backdropFilter: "blur(38px) saturate(150%)", background: `rgba(${base.join(",")},${mix(light ? 0.58 : 0.5, 0.97, solid)})`, boxShadow: `inset 1.5px 0 0 rgba(255,255,255,${light ? 0.9 : 0.35}), -40px 0 90px rgba(0,0,0,${light ? 0.12 : 0.35})`, overflow: "hidden", zIndex: 60 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: `linear-gradient(90deg, rgba(255,255,255,${light ? 0.5 : 0.16}) 0%, rgba(255,255,255,0) 100%)` }} />
    </div>
  );
};

// T2 whip pan: both worlds slide together with a horizontal streak blur
const WHIP_A = 12.75;
const WHIP_B = 13.3;
const whipU = (t: number) => k(t, WHIP_A, WHIP_B, EIO);
const WhipDefs: React.FC<{ t: number }> = ({ t }) => {
  const u = whipU(t);
  const b = Math.sin(u * Math.PI) * 70;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="whip" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${b} 0`} /></filter>
    </svg>
  );
};

// T3 shape morph: the step chip grows into a full-screen crimson field
const MORPH_A = 20.35;
const MORPH_B = 21.0;

// T6 circle morph: the success check grows into the outro
const OUT_A = 41.05;

// ---------------- captions (only where the screen isn't already saying it) ----------------
const CAP_LINES = [2, 7];
const Caps: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CAP_LINES.map((li) => {
      const L = TM[li];
      const a = L.t[0] - 0.15;
      const b = L.t[L.t.length - 1] + 0.7;
      const op = k(t, a - 0.15, a + 0.1, EIO) * (1 - k(t, b, b + 0.25, EIO));
      if (op <= 0) return null;
      const spoken = L.t.reduce((s, w) => s + Math.max(0, Math.min(1, (t - w) / 0.14)), 0);
      return <Caption key={li} text={L.text} k={spoken} dark={li === 2} opacity={op} y={(1 - op) * 10} />;
    })}
  </>
);

// ---------------- root ----------------
export const AbetVideoV4: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { let d = false; const fin = () => { if (!d) { d = true; continueRender(h); } }; Promise.race([fontsLoaded.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 6000))]).then(fin, fin); }, [h]);
  const f = useCurrentFrame();
  const t = f / V4_FPS;
  const T1 = 2.85;
  const u = whipU(t);
  const whipping = t >= WHIP_A && t <= WHIP_B;
  const m = k(t, MORPH_A, MORPH_B, EIO);
  // chip (scene 2) -> full frame
  const mw = mix(140, 2300, m);
  const mh = mix(140, 1400, m);
  const mx = mix(CHIP_X, 960, m);
  const my = mix(CHIP_Y, 540, m);
  // outro circle
  const r1 = k(t, OUT_A, OUT_A + 0.7, EIO) * 2300;
  const r2 = k(t, OUT_A + 0.15, OUT_A + 0.85, EIO) * 2300;
  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT, overflow: "hidden" }}>
      <WhipDefs t={t} />
      {/* dark world: logo + what is ABET */}
      {t < WHIP_B && (
        <AbsoluteFill style={{ transform: whipping ? `translate3d(${-1920 * u}px,0,0)` : undefined, filter: whipping ? "url(#whip)" : undefined }}>
          <BgDark t={f} glow={0.35 + 0.65 * k(t, 0, 0.8, EIO)} by={t < T1 ? 520 : 620} />
          {t < T1 && <SceneLogo t={t} />}
          {t >= T1 && <SceneWhat t={t} />}
        </AbsoluteFill>
      )}
      {/* light world: how it works */}
      {t >= WHIP_A && t < MORPH_B && (
        <AbsoluteFill style={{ transform: whipping ? `translate3d(${1920 * (1 - u)}px,0,0)` : undefined, filter: whipping ? "url(#whip)" : undefined }}>
          <BgLight t={f} />
          <SceneHow t={t} />
        </AbsoluteFill>
      )}
      {/* light world: deposit (revealed through the "deposit?" letters) */}
      {t >= MASK_T0 - 0.3 && t < OUT_A + 0.9 && (
        <AbsoluteFill>
          <BgLight t={f} />
          <SceneDeposit t={t} />
        </AbsoluteFill>
      )}
      {/* crimson world: the chip grows into it, then "deposit?" opens a window into the next scene */}
      {t >= MORPH_A && t < MASK_T1 && (
        <>
          {t < MORPH_B + 0.05 && (
            <div style={{ position: "absolute", left: mx - mw / 2, top: my - mh / 2, width: mw, height: mh, borderRadius: mix(38, 0, m), background: "linear-gradient(140deg, #C8303A, #7E0E14)", boxShadow: "0 26px 50px -16px rgba(179,36,42,0.6)" }} />
          )}
          {t >= MORPH_B - 0.1 && <SceneAsk t={t} />}
        </>
      )}
      {/* outro: crimson ring leads, navy follows from the success check */}
      {t >= OUT_A && (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(140deg, #C8303A, #7E0E14)", clipPath: `circle(${Math.max(58, r1)}px at ${SUCCESS_C[0]}px ${SUCCESS_C[1]}px)`, opacity: k(t, OUT_A, OUT_A + 0.12, EIO) }} />
          <AbsoluteFill style={{ clipPath: `circle(${r2}px at ${SUCCESS_C[0]}px ${SUCCESS_C[1]}px)` }}>
            <BgDark t={f} glow={1} by={520} />
            {t > OUT_A + 0.5 && <SceneOutro t={t} />}
          </AbsoluteFill>
        </>
      )}
      <GlassWipe t={t} tm={T1} />
      <Caps t={t} />
    </AbsoluteFill>
  );
};
