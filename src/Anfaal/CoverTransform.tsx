import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "./design";

// Transformation cover: diagonal split.
// BEFORE (shop b-roll, tired stare): muted film grade, grain, top-left.
// AFTER (cash b-roll): premium green grade, bottom-right.
// A glowing light seam joins them, with a glass arrow badge on the seam.
// Headline is split across the story: "20K JOB SE" on the before side, "3 LAKH DAILY" on the after side.
// All text sits on hair, shelves or shirt (never on the face) and inside the 3:4 grid crop (y 240–1680).

const L = { x0: 0, y0: 1180, x1: 1080, y1: 720 }; // seam: left edge y -> right edge y
const before = `polygon(0 0, 1080px 0, 1080px ${L.y1}px, 0 ${L.y0}px)`;
const after = `polygon(0 ${L.y0}px, 1080px ${L.y1}px, 1080px 1920px, 0 1920px)`;
const angle = (Math.atan2(L.y1 - L.y0, L.x1 - L.x0) * 180) / Math.PI;
const midY = (L.y0 + L.y1) / 2;

const Chip: React.FC<{ text: string; color: string; bg: string; border: string }> = ({ text, color, bg, border }) => (
  <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 999, background: bg, border: `1.5px solid ${border}`, fontFamily: "Inter", fontWeight: 700, fontSize: 26, letterSpacing: 8, color }}>{text}</div>
);

export const AnfaalCoverTransform: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void, overflow: "hidden" }}>
    {/* AFTER */}
    <AbsoluteFill style={{ clipPath: after }}>
      <Img src={staticFile("an/cover_after.png")} style={{ position: "absolute", width: 1080, height: 1920, top: -140, filter: "saturate(1.08) contrast(1.08) brightness(.96)" }} />
      <AbsoluteFill style={{ background: "rgba(18,128,72,.20)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 66%, rgba(3,10,6,.82) 76%, ${K.void} 88%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(110% 70% at 60% 62%, transparent 55%, rgba(0,0,0,.45) 100%)" }} />
    </AbsoluteFill>

    {/* BEFORE */}
    <AbsoluteFill style={{ clipPath: before }}>
      <Img src={staticFile("an/cover_before.png")} style={{ position: "absolute", width: 1080, height: 1920, top: -90, filter: "saturate(.35) contrast(1.15) brightness(.78) sepia(.18)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,40,50,.35), rgba(60,40,20,.25))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an/grain.png")})`, backgroundSize: "512px 512px", mixBlendMode: "overlay", opacity: 0.16 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 17%, rgba(0,0,0,0) 26%)" }} />
    </AbsoluteFill>

    {/* light seam */}
    <div style={{ position: "absolute", left: -100, top: midY - 60, width: 1280, height: 120, transform: `rotate(${angle}deg)`, transformOrigin: "50% 50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(156,255,201,.45), rgba(47,210,126,0) 70%)", filter: "blur(18px)" }} />
    <div style={{ position: "absolute", left: -100, top: midY - 3, width: 1280, height: 6, transform: `rotate(${angle}deg)`, transformOrigin: "50% 50%", background: `linear-gradient(90deg, rgba(255,255,255,0), ${K.hueLight} 20%, #FFFFFF 50%, ${K.hueLight} 80%, rgba(255,255,255,0))`, boxShadow: `0 0 24px ${K.hue}, 0 0 60px ${K.glow}` }} />

    {/* arrow badge on the seam (off the faces, right side) */}
    <div style={{ position: "absolute", left: 830 - 62, top: L.y0 + ((L.y1 - L.y0) * 830) / 1080 - 62, width: 124, height: 124, borderRadius: 62, background: "linear-gradient(160deg, rgba(60,140,100,.55), rgba(6,23,15,.9))", border: `2px solid ${K.hueLight}`, boxShadow: `0 0 40px ${K.glow}, 0 20px 40px rgba(0,0,0,.5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={K.hueLight} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(65deg)" }}>
        <path d="M5 12 H19 M13 6 L19 12 L13 18" />
      </svg>
    </div>

    {/* BEFORE text (top, on hair / shelves) */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center" }}>
      <div>
        <Chip text="2 SAAL PEHLE" color="rgba(255,255,255,.85)" bg="rgba(0,0,0,.45)" border="rgba(255,255,255,.25)" />
      </div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
        <div style={{ fontFamily: "Anton", fontSize: 112, color: "#E9E4DA", letterSpacing: 2, lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>20K JOB SE</div>
        <div style={{ position: "absolute", left: -8, right: -8, top: "54%", height: 9, borderRadius: 5, background: K.red, boxShadow: "0 0 18px rgba(255,95,102,.5)", transform: "rotate(-2deg)" }} />
      </div>
    </div>

    {/* AFTER text (bottom, on the shirt) */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1452, textAlign: "center" }}>
      <Chip text="AB" color="#03140B" bg={`linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`} border="rgba(156,255,201,.6)" />
      <div
        style={{
          fontFamily: "Anton",
          fontSize: 150,
          whiteSpace: "nowrap",
          lineHeight: 1.02,
          letterSpacing: 2,
          marginTop: 6,
          backgroundImage: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 70%, ${K.hueDeep} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 24px ${K.glow})`,
        }}
      >
        3 LAKH DAILY
      </div>
    </div>
  </AbsoluteFill>
);
