import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { AbetLogo, C, FONT, fontsLoaded } from "./theme";
import { FRAMES, H, W } from "./frames";

export const SHEET_W = 2560;
const K = 0.6;
const FW = W * K;
const FH = H * K;
const GAP = 80;
const MX = (SHEET_W - 2 * FW - GAP) / 2;

const META: [string, string, string, string][] = [
  ["01", "Logo intro", "0:00 – 0:05 · dark", "Letters rise out of a mask (expo-out, 4f stagger) → bull charges into the A, bear rises in the T → red line draws from centre, tagline tracks in."],
  ["02", "What is ABET", "0:05 – 0:15 · dark", "Headline word-by-word blur-up. Portal rises in 3D (rotateX 14° → 0°). Camera glides to each feature; glass callouts pop with soft overshoot."],
  ["03", "How it works", "0:15 – 0:26 · light", "Dashboard card morphs to full-frame (radius 24 → 0) and becomes the light world. Cards lift on each VO beat; icons draw on; progress line fills."],
  ["04", "Deposit · Step 1", "0:30 – 0:39 · light", "The 'Fund' card morphs into the Deposit pill → the portal. Cursor glides on a bezier path; cards ring as named; check badge pops on select."],
  ["05", "Deposit · Step 2", "0:39 – 0:43 · light", "Stepper number morphs into a check; line fills green. Amount types in with a caret; summary counts up live."],
  ["06", "Deposit · Step 3", "0:43 – 0:48 · light", "Camera pushes into the review card; each row ticks in sequence on 'double-check every detail'."],
  ["07", "Deposit · Step 4", "0:48 – 0:56 · light", "Confirm button morphs pill → spinner circle → green success check. Transactions card glides in; the new row flips Pending → Approved."],
  ["08", "Outro", "0:56 – 1:05 · dark", "Crimson circle wipe back to navy. Logo rebuilds, tagline reveals, CTA pills spring in; risk line sits quietly at the bottom."],
];

const Swatch: React.FC<{ c: string; n: string; dark?: boolean }> = ({ c, n, dark }) => (
  <div style={{ width: 150 }}>
    <div style={{ height: 110, borderRadius: 18, background: c, border: dark ? "none" : `1px solid ${C.line}` }} />
    <div style={{ marginTop: 10, fontSize: 18, fontWeight: 500, color: C.ink }}>{n}</div>
    <div style={{ fontSize: 15, color: C.sub }}>{c}</div>
  </div>
);

const Curve: React.FC<{ d: string; label: string }> = ({ d, label }) => (
  <div style={{ width: 200 }}>
    <svg width="200" height="130" viewBox="0 0 100 65" style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.line}` }}>
      <path d="M10 55 H90 M10 55 V8" stroke={C.line} strokeWidth="0.8" />
      <path d={d} stroke={C.red} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
    <div style={{ marginTop: 10, fontSize: 16, color: C.sub }}>{label}</div>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "0.16em", color: C.red, marginBottom: 22 }}>{children}</div>;

export const SHEET_H = 1120 + 4 * (FH + 190) + 120;

export const DesignSheet: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { fontsLoaded.then(() => document.fonts.ready).then(() => continueRender(h)); }, [h]);
  return (
    <div style={{ width: SHEET_W, height: SHEET_H, background: "#F3F4F7", fontFamily: FONT, position: "relative" }}>
      {/* Header */}
      <div style={{ position: "absolute", left: MX, top: 90, right: MX, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, letterSpacing: "0.2em", color: C.red, fontWeight: 500 }}>DESIGN SHEET · V1 · FOR APPROVAL</div>
          <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: "-0.035em", color: C.ink, marginTop: 14 }}>ABET Global — What it is & how to deposit</div>
          <div style={{ fontSize: 24, color: C.sub, marginTop: 12 }}>16:9 · 1920×1080 · 30 fps · ~65 s · new male VO (calm, confident, US) · dark → light → dark</div>
        </div>
        <div style={{ padding: "26px 34px", borderRadius: 24, background: C.navy }}><AbetLogo width={260} /></div>
      </div>

      <div style={{ position: "absolute", left: MX, top: 380, right: MX, display: "flex", gap: 70 }}>
        <div>
          <Label>PALETTE</Label>
          <div style={{ display: "flex", gap: 18 }}>
            <Swatch c={C.navy} n="Navy" dark /><Swatch c={C.red} n="ABET Crimson" dark /><Swatch c={C.redDeep} n="Deep Red" dark /><Swatch c={C.redSoft} n="Blush" />
            <Swatch c={C.bg} n="Paper" /><Swatch c={C.ink} n="Ink" dark /><Swatch c={C.green} n="Success" dark />
          </div>
        </div>
        <div>
          <Label>TYPE · LEXEND</Label>
          <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: "-0.035em", color: C.ink, lineHeight: 1 }}>Four simple steps.</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 16 }}>Deposit Details <span style={{ fontWeight: 400, color: C.sub, fontSize: 22 }}> · UI 600 / 400</span></div>
          <div style={{ fontSize: 20, color: C.sub, marginTop: 10 }}>Headlines 500 · −3.5% tracking · eyebrows 500 caps +18%</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: MX, top: 700, right: MX, display: "flex", gap: 70 }}>
        <div>
          <Label>MOTION · EASING</Label>
          <div style={{ display: "flex", gap: 22 }}>
            <Curve d="M10 55 C26 8, 40 8, 90 8" label="Expo-out · arrivals" />
            <Curve d="M10 55 C42 55, 58 8, 90 8" label="Ease-in-out · camera, morphs" />
            <Curve d="M10 55 C38 -6, 60 10, 90 8" label="Soft back · pops" />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Label>STRUCTURE · BREATHING ROOM</Label>
          <div style={{ display: "flex", height: 70, borderRadius: 16, overflow: "hidden", fontSize: 17, fontWeight: 500 }}>
            {[["Logo", 5, C.navy, "#fff"], ["What is ABET", 10, C.navy2, "#fff"], ["How it works", 11, "#fff", C.ink], ["Deposit walkthrough · 4 steps", 30, C.redSoft, C.red], ["Outro", 9, C.navy, "#fff"]].map(([n, d, bg, col]) => (
              <div key={n as string} style={{ flex: d as number, background: bg as string, color: col as string, display: "flex", alignItems: "center", paddingLeft: 18, borderRight: "2px solid #F3F4F7" }}>{n} · {d}s</div>
            ))}
          </div>
          <div style={{ fontSize: 19, color: C.sub, marginTop: 18, lineHeight: 1.5 }}>0.6–1.2 s of air after every VO line · one idea per screen · scenes connect through match cuts and shape morphs, never hard cuts.</div>
        </div>
      </div>

      {/* Frames grid */}
      {FRAMES.map((F, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = MX + col * (FW + GAP);
        const y = 1120 + row * (FH + 190);
        const [n, title, time, note] = META[i];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: FW }}>
            <div style={{ width: FW, height: FH, borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(17,24,39,0.35)" }}>
              <div style={{ width: W, height: H, transform: `scale(${K})`, transformOrigin: "0 0" }}><F /></div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 22, alignItems: "baseline" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: C.red }}>{n}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: C.ink }}>{title}</div>
              <div style={{ fontSize: 18, color: C.faint }}>{time}</div>
            </div>
            <div style={{ fontSize: 18, color: C.sub, marginTop: 8, lineHeight: 1.5, maxWidth: FW - 40 }}>{note}</div>
          </div>
        );
      })}
    </div>
  );
};
