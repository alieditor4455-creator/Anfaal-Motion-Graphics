import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import TM from "./timing4.json";
import { AbetLogo, BACK, BgDark, BgLight, C, Caption, Cursor, EIO, EO, Eyebrow, FONT, Icon, fontsLoaded, mix, tw } from "./theme";
import { DepositCard, DepositState, TxRow } from "./portal";
import { BigButton, redGrad } from "./frames";
import { MacBook, MacProps } from "./macbook";
import { AccountsG, CalendarG, Glass, SocialG, WalletG } from "./glass";
import { Logo3D } from "./Logo3D";

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
  const tag = k(t, 1.35, 2.05);
  const sw = k(t, 0, 1.75, EO); // swing-in
  const drift = k(t, 1.75, 3.0, EIO);
  return (
    <AbsoluteFill>
      <Logo3D width={1920} height={1080} y={40} rx={mix(28, 5, sw) - 2 * drift} ry={mix(-68, -9, sw) + 5 * drift} rz={mix(-6, 0, sw)} z={mix(-700, 0, sw) + 60 * drift} animals={k(t, 0.85, 1.55, EIO)} sweep={mix(0, 1, k(t, 0.5, 2.4, EIO))} rim={0.6 + 0.6 * k(t, 1.0, 1.8, EIO)} opacity={k(t, 0, 0.35, EIO)} />
      {/* reflection falls off with distance from the floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 655, height: 360, background: "linear-gradient(180deg, rgba(9,12,21,0) 0%, rgba(9,12,21,0.75) 45%, rgba(9,12,21,1) 80%)" }} />
      <div style={{ position: "absolute", top: 905, width: W, textAlign: "center", fontFamily: FONT, fontSize: 19, letterSpacing: `${mix(0.7, 0.42, tag)}em`, paddingLeft: "0.42em", color: "rgba(255,255,255,0.62)", opacity: tag }}>GLOBAL MARKETS · ONE PORTAL</div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 1: what is ABET (3D exploded UI stack) ----------------
const glassD = (accent: number): React.CSSProperties => ({
  position: "absolute", borderRadius: 22, fontFamily: FONT, color: "#fff",
  background: "linear-gradient(150deg, rgba(46,54,76,0.92) 0%, rgba(24,30,46,0.94) 100%)",
  border: `1px solid rgba(255,255,255,${0.12 + 0.1 * accent})`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 30px 60px -20px rgba(0,0,0,0.7), 0 0 ${50 * accent}px -10px rgba(226,70,76,${0.55 * accent})`,
});
const Bar: React.FC<{ w: number; o?: number; mt?: number }> = ({ w, o = 0.12, mt = 12 }) => <div style={{ width: w, height: 10, borderRadius: 6, background: `rgba(255,255,255,${o})`, marginTop: mt }} />;

// a layer of the stack: lifts in z and slides outward when its feature is named
type Lay = { x: number; y: number; w: number; h: number; at: number; out: [number, number] };
const STACK_W = 1000;
const STACK_H = 620;
const SceneWhat: React.FC<{ t: number }> = ({ t }) => {
  const OUT = 6.2;
  const intro = k(t, 6.5, 7.6, EO); // stack swings into isometric (after the headline has cleared)
  const collapse = k(t, 10.75, 11.3, EIO); // "All in one place": layers snap back, stack flattens
  const away = k(t, 11.05, 11.5, EIO);
  const L: Lay[] = [
    { x: 60, y: 70, w: 400, h: 220, at: wt(2, 1), out: [-150, -60] }, // wallet
    { x: 60, y: 330, w: 330, h: 120, at: wt(2, 3), out: [-170, 90] }, // accounts
    { x: 520, y: 360, w: 420, h: 200, at: wt(2, 4), out: [160, 90] }, // social
    { x: 520, y: 70, w: 420, h: 250, at: wt(2, 8), out: [160, -70] }, // calendar
  ];
  // the most recently named layer carries the only crimson in the frame
  const lastIdx = L.reduce((acc, l, i) => (t >= l.at - 0.05 ? i : acc), -1);
  const lift = (l: Lay) => k(t, l.at - 0.08, l.at + 0.55, SNAP) * (1 - collapse);
  const rx = mix(70, 52, intro) * (1 - collapse) + Math.sin(t * 0.5) * 1.5 * (1 - collapse);
  const rz = mix(-58, -34, intro) * (1 - collapse) + (t - 7) * 0.9 * (1 - collapse);
  const s = mix(0.7, 1, intro) * mix(1, 0.62, collapse);
  return (
    <AbsoluteFill>
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
      {t > 6.45 && (
        <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 40%", opacity: k(t, 6.5, 6.95, EIO) * (1 - 0.8 * away), filter: away > 0 ? `blur(${away * 8}px)` : undefined }}>
          <div style={{ position: "absolute", left: 960 - STACK_W / 2, top: 560 - STACK_H / 2, width: STACK_W, height: STACK_H, transformStyle: "preserve-3d", transform: `translate3d(0, ${mix(160, 0, intro)}px, 0) scale(${s}) rotateX(${rx}deg) rotateZ(${rz}deg)` }}>
            {/* soft shadow on the "floor" */}
            <div style={{ position: "absolute", inset: -60, borderRadius: 60, background: "rgba(0,0,0,0.55)", filter: "blur(40px)", transform: "translateZ(-40px)" }} />
            {/* base: the portal itself */}
            <div style={{ ...glassD(0), inset: 0, padding: 34 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <AbetLogo width={110} />
                <div style={{ flex: 1 }} />
                <div style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(34,197,94,0.16)", color: "#4ADE80", fontSize: 15, fontWeight: 500 }}>Verified</div>
              </div>
              <div style={{ position: "absolute", left: 34, right: 34, top: 96, bottom: 34, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }} />
            </div>
            {L.map((l, i) => {
              const p = lift(l);
              const acc = i === lastIdx ? bell(t, l.at - 0.05, l.at + 0.3, 10.6, 10.9) : 0;
              return (
                <div key={i} style={{ ...glassD(acc), left: l.x, top: l.y, width: l.w, height: l.h, padding: 24, transform: `translate3d(${l.out[0] * p}px, ${l.out[1] * p}px, ${4 + p * (110 + i * 26)}px)`, opacity: k(t, 6.75 + i * 0.08, 7.3 + i * 0.08, EIO) }}>
                  {i === 0 && (<>
                    <div style={{ fontSize: 15, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>WALLET BALANCE</div>
                    <div style={{ fontSize: 50, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 10 }}>$4,250<span style={{ color: "rgba(255,255,255,0.4)" }}>.00</span></div>
                    <svg width="352" height="56" viewBox="0 0 352 56" style={{ marginTop: 10 }}><path d="M0 46 C40 40 66 50 96 36 S154 30 186 22 S246 28 276 12 S330 6 352 4" stroke={acc > 0.05 ? "#FF6A62" : "rgba(255,255,255,0.45)"} strokeWidth="3" fill="none" /></svg>
                  </>)}
                  {i === 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 14, height: "100%" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(34,197,94,0.16)", display: "grid", placeItems: "center" }}><Icon name="shieldCheck" size={22} color="#4ADE80" /></div>
                      <div><div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>Real accounts</div><div style={{ fontSize: 30, fontWeight: 600 }}>2</div></div>
                    </div>
                  )}
                  {i === 2 && (<>
                    <div style={{ display: "flex" }}>{["#E2464C", "#6366F1", "#F59E0B", "#22C55E"].map((c, j) => <div key={c} style={{ width: 48, height: 48, borderRadius: 99, marginLeft: j ? -12 : 0, border: "2.5px solid #1E2536", background: `linear-gradient(140deg, ${c}, ${c}AA)`, display: "grid", placeItems: "center" }}><Icon name="user" size={20} color="#fff" /></div>)}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>Social Trading</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Following 6 traders</div>
                  </>)}
                  {i === 3 && (<>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600 }}><Icon name="calendar" size={20} color={acc > 0.05 ? "#FF6A62" : "rgba(255,255,255,0.7)"} />Economic Calendar</div>
                    {[["USD", "Non-Farm Payrolls", 3], ["EUR", "CPI (YoY)", 2], ["GBP", "Rate Decision", 3]].map(([c, e, n]) => (
                      <div key={e as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ width: 46, textAlign: "center", padding: "3px 0", borderRadius: 7, background: "rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 600 }}>{c}</div>
                        <div style={{ flex: 1, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>{e}</div>
                        <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 13, borderRadius: 3, background: d < (n as number) ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)" }} />)}</div>
                      </div>
                    ))}
                  </>)}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
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
  const knock = 0; // scene change is handled by the mosaic transition
  const z = 0;
  const s = 1 + z * 46;
  const top1 = 1;
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
    [23.55, 1300, 980], [wt(7, 4) - 0.05, DEP_BTN.x + 20, DEP_BTN.y + 6], [wt(7, 4) + 0.5, DEP_BTN.x + 34, DEP_BTN.y + 20],
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
  const o = Math.min(1, vis(23.55, wt(7, 4) + 0.45) + vis(28.8, 30.4) + vis(32.5, 33.4) + vis(34.5, 36.1));
  const rip = (c: number) => (t >= c && t <= c + 0.45 ? (t - c) / 0.45 : 0);
  const press = rip(wt(7, 4) + 0.05) || rip(29.45) || rip(29.95) || rip(33.05) || rip(35.05) || rip(wt(11, 0) + 0.05);
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

const DEP_BTN = { x: 550 + 38 + 105, y: 540 - 165 + 330 - 30 - 32, w: 210, h: 64 }; // centre + size of the Deposit button
// neutral glass tiles floating at different depths (background layer, parallax drift)
const TILES: [number, number, number, number, string][] = [
  [90, 110, 1, 0, "bitcoin"], [1660, 130, 0.72, 2.5, "card"], [1740, 860, 0.95, 0.5, "bank"], [110, 880, 0.7, 2.8, "shieldCheck"], [930, 70, 0.55, 3.5, "wallet"],
];
const DepthTiles: React.FC<{ t: number }> = ({ t }) => (
  <>
    {TILES.map(([x, y, s, b, ic], i) => {
      const p = k(t, 22.8 + i * 0.08, 23.7 + i * 0.08, EO);
      return (
        <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 104, height: 104, borderRadius: 30, background: "linear-gradient(160deg, #FFFFFF, rgba(255,255,255,0.82))", boxShadow: "inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,0.05), 0 24px 40px -18px rgba(17,24,39,0.25)", display: "grid", placeItems: "center", opacity: p * (0.55 + 0.45 * s), filter: b ? `blur(${b}px)` : undefined, transform: `translate3d(${x + Math.sin(t * 0.35 + i * 1.7) * 14 * s}px, ${y + Math.cos(t * 0.3 + i) * 10 * s + (1 - p) * 40}px, 0) scale(${s}) rotate(${Math.sin(t * 0.25 + i) * 4}deg)` }}>
          <Icon name={ic} size={42} color={C.faint} sw={1.8} />
        </div>
      );
    })}
  </>
);

const SceneDeposit: React.FC<{ t: number }> = ({ t }) => {
  const st = dep(t);
  const tap = wt(7, 4) + 0.05; // cursor taps "Deposit" on the spoken word
  const dashIn = k(t, 22.75, 23.6, EO);
  const recede = k(t, tap + 0.15, tap + 0.95, EIO); // the dashboard falls back in depth
  const morph = k(t, tap + 0.3, tap + 1.1, EIO);
  const bp = k(t, tap, tap + 0.08, EIO) * (1 - k(t, tap + 0.1, tap + 0.4, EIO));
  // the real Deposit button inside the mini dashboard -> the deposit card on the left
  const cardC = [CX + (900 * CARD_S) / 2, 540];
  const bx = mix(DEP_BTN.x, cardC[0], morph);
  const by = mix(DEP_BTN.y, cardC[1], morph);
  const bw = mix(DEP_BTN.w, 900 * CARD_S, morph);
  const bh = mix(DEP_BTN.h, 590 * CARD_S, morph);
  const lift = 1 + 0.06 * bell(t, tap + 0.05, tap + 0.25, tap + 0.35, tap + 0.8);
  const cur = cursor(t);
  const settle = k(t, tap + 1.0, tap + 2.0, EO);
  const crx = Math.sin(t * 0.7) * 1.2 * settle;
  const cry = mix(8, 0, settle) * morph + Math.cos(t * 0.55) * 1.8 * settle;
  const tx = k(t, 38.3, 39.0, SNAP);
  const flip = k(t, wt(12, 6) + 0.1, wt(12, 6) + 0.45, EIO);
  return (
    <AbsoluteFill>
      <DepthTiles t={t} />
      {/* compact glass dashboard: balance + actions */}
      {recede < 1 && (
        <div style={{ position: "absolute", left: 960 - 410, top: 540 - 165, width: 820, height: 330, borderRadius: 30, padding: "30px 38px", fontFamily: FONT, background: "linear-gradient(165deg, #FFFFFF 0%, rgba(255,255,255,0.9) 100%)", boxShadow: "inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,0.06), 0 30px 60px -24px rgba(17,24,39,0.22), 0 80px 140px -50px rgba(17,24,39,0.25)", opacity: Math.min(1, dashIn * 1.5) * (1 - recede), transform: `translateY(${(1 - dashIn) * 40}px) scale(${mix(0.96, 1, dashIn) * mix(1, 0.9, recede)})`, filter: recede > 0 ? `blur(${recede * 10}px)` : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AbetLogo width={92} ink={C.ink} />
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: C.greenSoft, color: C.green, fontSize: 15, fontWeight: 500 }}><Icon name="shieldCheck" size={15} color={C.green} />Verified</div>
          </div>
          <div style={{ fontSize: 15, letterSpacing: "0.12em", color: C.sub, marginTop: 22 }}>WALLET BALANCE</div>
          <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.035em", color: C.ink, marginTop: 4 }}>$4,250<span style={{ color: C.faint }}>.00</span></div>
          <div style={{ position: "absolute", left: 38 + DEP_BTN.w + 14, top: DEP_BTN.y - (540 - 165) - DEP_BTN.h / 2, display: "flex", gap: 14 }}>
            {[["upload", "Withdraw"], ["swap", "Transfer"]].map(([ic, l]) => (
              <div key={l} style={{ width: 190, height: DEP_BTN.h, borderRadius: 16, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 19, fontWeight: 500, color: C.text }}><Icon name={ic} size={18} color={C.sub} />{l}</div>
            ))}
          </div>
        </div>
      )}
      {t >= 22.75 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: bh, perspective: 1600, willChange: "transform", opacity: Math.min(1, dashIn * 1.5), transform: `translate3d(${bx - bw / 2}px, ${by - bh / 2 + (1 - dashIn) * 40}px, 0) scale(${lift * (1 - bp * 0.05)})` }}>
          <div style={{ position: "absolute", inset: 0, transform: `rotateX(${crx}deg) rotateY(${cry}deg)` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: mix(16, 26, morph), overflow: "hidden", background: "linear-gradient(165deg, #FFFFFF 0%, #FBFBFC 100%)", boxShadow: `inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,${0.06 * morph}), 0 30px 60px -24px rgba(17,24,39,${0.22 * morph}), 0 80px 140px -50px rgba(179,36,42,${0.35 * morph})` }}>
              {morph > 0.35 && (
                <div style={{ position: "absolute", left: (bw - 900 * CARD_S) / 2, top: (bh - 590 * CARD_S) / 2, width: 900, height: 590, transform: `scale(${CARD_S})`, transformOrigin: "0 0", opacity: k(t, tap + 0.85, tap + 1.25, EIO) }}>
                  <DepositCard {...st} h={590} style={{ border: "none", boxShadow: "none", background: "transparent" }} />
                </div>
              )}
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - k(t, tap + 0.7, tap + 1.05, EIO) }}>
              <BigButton glow={0} style={{ left: 0, top: 0, width: bw, height: bh, borderRadius: mix(16, 26, morph), fontSize: 21, gap: 8, color: `rgba(255,255,255,${1 - k(t, tap + 0.3, tap + 0.45, EIO)})` }} />
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
          <Cursor x={cur.x} y={cur.y} press={cur.press} scale={1.2} />
        </div>
      )}
    </AbsoluteFill>
  );
};
// success circle centre on stage (inside the card, view 3)
const SUCCESS_C = toStage(450, 150 + 24 + 64);

// ---------------- Scene 4: outro ----------------
const SceneOutro: React.FC<{ t: number }> = ({ t }) => {
  const cta = (i: number) => k(t, 45.0 + i * 0.12, 45.65 + i * 0.12, BACK);
  return (
    <AbsoluteFill style={{ opacity: 1 - k(t, 47.25, 47.95, EIO) }}>
      <Logo3D width={1920} height={1080} y={175} scale={0.72} reflect={0} rx={mix(-18, 3, k(t, 41.6, 43.4, EO))} ry={mix(58, 6, k(t, 41.6, 43.4, EO)) - 7 * k(t, 43.4, 48, EIO)} z={mix(-600, 0, k(t, 41.6, 43.4, EO))} animals={k(t, 42.4, 43.0, EIO)} sweep={k(t, 42.2, 44.0, EIO)} rim={1.1} opacity={k(t, 41.55, 41.9, EIO)} />
      <div style={{ position: "absolute", top: 520, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...display(54, "#fff", 400) }}>
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
// ---------------- signature transition: gradient mosaic pixel reveal ----------------
// Rounded tiles cascade in a wave until they cover the frame (scene swaps at tm, fully hidden),
// then dissolve in the same wave direction to reveal the next scene.
type Dir = "diag" | "rdiag" | "ltr" | "radial";
const TILE = 96;
const COLS = 20;
const ROWS = 12;
const OX = (1920 - COLS * TILE) / 2;
const OY = (1080 - ROWS * TILE) / 2;
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const GRAD = ["#D0343A", "#9E1A20", "#5A0E1A", "#141B2D"].map(hex);
const gradAt = (u: number) => {
  const x = Math.max(0, Math.min(0.9999, u)) * (GRAD.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return GRAD[i].map((c, j) => Math.round(mix(c, GRAD[i + 1][j], f)));
};
const Mosaic: React.FC<{ t: number; tm: number; dir: Dir; hue?: number }> = ({ t, tm, dir, hue = 0 }) => {
  const SPREAD = 0.42; // wave travel time across the frame
  const DUR = 0.24; // each tile's own animation
  const a = tm - 0.12 - SPREAD - DUR;
  const b = tm + 0.12 + SPREAD + DUR;
  if (t < a || t > b) return null;
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = (c + 0.5) / COLS;
      const cy = (r + 0.5) / ROWS;
      const d = dir === "diag" ? (cx + cy) / 2 : dir === "rdiag" ? 1 - (cx + cy) / 2 : dir === "ltr" ? cx * 0.85 + cy * 0.15 : Math.min(1, Math.hypot(cx - 0.5, (cy - 0.5) * 0.6) * 1.6);
      const jitter = (((c * 73856093) ^ (r * 19349663)) % 1000) / 1000 * 0.06; // tiny per-tile offset, deterministic
      const pin = k(t, tm - 0.12 - SPREAD - DUR + d * SPREAD + jitter, tm - 0.12 - SPREAD + d * SPREAD + jitter, SNAP);
      const pout = k(t, tm + 0.12 + d * SPREAD + jitter, tm + 0.12 + d * SPREAD + DUR + jitter, Easing.bezier(0.6, 0, 0.8, 0.3));
      const sc = 1.22 * pin * (1 - pout); // 1.22 closes the corner gaps where four rounded tiles meet
      if (sc <= 0.001) continue;
      const base = Math.min(1, (cx * 0.7 + cy * 0.3) * (1 - hue) + hue);
      const col = gradAt(base);
      const hi = gradAt(Math.max(0, base - 0.12));
      tiles.push(
        <div key={r * COLS + c} style={{ position: "absolute", left: OX + c * TILE, top: OY + r * TILE, width: TILE, height: TILE, borderRadius: 16, transform: `scale(${sc}) rotate(${(1 - pin) * 35 - pout * 20}deg)`, background: `linear-gradient(145deg, rgb(${hi.join(",")}) 0%, rgb(${col.join(",")}) 70%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)" }} />,
      );
    }
  }
  return <AbsoluteFill style={{ zIndex: 70 }}>{tiles}</AbsoluteFill>;
};

// scene-change times (each is the moment the frame is fully covered)
const SC = { what: 2.85, how: 13.05, ask: 20.7, dep: 22.75, outro: 41.4 };

export const AbetVideoV4: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { let d = false; const fin = () => { if (!d) { d = true; continueRender(h); } }; Promise.race([fontsLoaded.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 6000))]).then(fin, fin); }, [h]);
  const f = useCurrentFrame();
  const t = f / V4_FPS;
  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT, overflow: "hidden" }}>
      {t < SC.how && (
        <AbsoluteFill>
          <BgDark t={f} glow={0.35 + 0.65 * k(t, 0, 0.8, EIO)} by={t < SC.what ? 520 : 620} />
          {t < SC.what ? <SceneLogo t={t} /> : <SceneWhat t={t} />}
        </AbsoluteFill>
      )}
      {t >= SC.how && t < SC.ask && (
        <AbsoluteFill>
          <BgLight t={f} />
          <SceneHow t={t} />
        </AbsoluteFill>
      )}
      {t >= SC.ask && t < SC.dep && <SceneAsk t={t} />}
      {t >= SC.dep && t < SC.outro && (
        <AbsoluteFill>
          <BgLight t={f} />
          <SceneDeposit t={t} />
        </AbsoluteFill>
      )}
      {t >= SC.outro && (
        <AbsoluteFill>
          <BgDark t={f} glow={1} by={520} />
          <SceneOutro t={t} />
        </AbsoluteFill>
      )}
      <Mosaic t={t} tm={SC.what} dir="diag" />
      <Mosaic t={t} tm={SC.how} dir="ltr" hue={0.15} />
      <Mosaic t={t} tm={SC.ask} dir="radial" />
      <Mosaic t={t} tm={SC.dep} dir="rdiag" hue={0.1} />
      <Mosaic t={t} tm={SC.outro} dir="diag" hue={0.2} />
      <Caps t={t} />
    </AbsoluteFill>
  );
};
