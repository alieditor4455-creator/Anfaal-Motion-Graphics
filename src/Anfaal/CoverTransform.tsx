import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CandleRain, K, World } from "./design";

// Transformation cover: two full photo cards (nothing cropped) in the green premium world.
// BEFORE card (shop b-roll, tired stare): muted film grade, tilted left, behind.
// AFTER card (cash b-roll): premium grade with green glow, tilted right, in front.
// A glass arrow badge links them. Headline: "20K JOB SE" (struck out) on top, "3 LAKH MONTHLY" below.
// Text never on a face; everything inside the 3:4 grid crop (y 240–1680).

const Card: React.FC<{ src: string; x: number; y: number; w: number; rot: number; mode: "before" | "after"; label: string }> = ({ src, x, y, w, rot, mode, label }) => {
  const h = (w * 16) / 9;
  const before = mode === "before";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rot}deg)`,
        borderRadius: 34,
        overflow: "hidden",
        border: before ? "6px solid rgba(235,230,220,.85)" : `6px solid ${K.hueLight}`,
        boxShadow: before ? "0 40px 80px rgba(0,0,0,.6)" : `0 40px 90px rgba(0,0,0,.6), 0 0 70px ${K.glow}`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: before ? "saturate(.3) contrast(1.15) brightness(.8) sepia(.2)" : "saturate(1.08) contrast(1.08)" }} />
      {before ? (
        <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an/grain.png")})`, backgroundSize: "512px 512px", mixBlendMode: "overlay", opacity: 0.18 }} />
      ) : (
        <AbsoluteFill style={{ background: "rgba(18,128,72,.18)", mixBlendMode: "soft-light" }} />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(0,0,0,.65) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "8px 22px",
            borderRadius: 999,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 7,
            color: before ? "rgba(255,255,255,.9)" : "#03140B",
            background: before ? "rgba(0,0,0,.55)" : `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`,
            border: before ? "1.5px solid rgba(255,255,255,.3)" : "1.5px solid rgba(156,255,201,.6)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export const AnfaalCoverTransform: React.FC = () => (
  <World focusY={50} fog={1.2}>
    <CandleRain speed={0} count={12} />
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 64% 52%, rgba(47,210,126,.32) 0%, rgba(47,210,126,0) 100%)" }} />

    {/* top: before headline */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontFamily: "Anton", fontSize: 104, color: "#E9E4DA", letterSpacing: 2, lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>20K JOB SE</div>
        <div style={{ position: "absolute", left: -10, right: -10, top: "54%", height: 9, borderRadius: 5, background: K.red, boxShadow: "0 0 18px rgba(255,95,102,.5)", transform: "rotate(-2deg)" }} />
      </div>
    </div>

    {/* photo cards */}
    <Card src="an/cover_before.png" x={60} y={440} w={460} rot={-6} mode="before" label="2 SAAL PEHLE" />
    <Card src="an/cover_after.png" x={545} y={420} w={480} rot={5} mode="after" label="AB" />

    {/* arrow badge between the cards (on the lower part, away from faces) */}
    <div style={{ position: "absolute", left: 540 - 64, top: 1080, width: 128, height: 128, borderRadius: 64, background: "linear-gradient(160deg, rgba(60,140,100,.6), rgba(6,23,15,.95))", border: `2px solid ${K.hueLight}`, boxShadow: `0 0 40px ${K.glow}, 0 20px 40px rgba(0,0,0,.55)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={62} height={62} viewBox="0 0 24 24" fill="none" stroke={K.hueLight} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12 H19 M13 6 L19 12 L13 18" />
      </svg>
    </div>

    {/* bottom: after headline */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center" }}>
      <div
        style={{
          fontFamily: "Anton",
          fontSize: 132,
          whiteSpace: "nowrap",
          lineHeight: 1.02,
          letterSpacing: 2,
          backgroundImage: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 70%, ${K.hueDeep} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 24px ${K.glow})`,
        }}
      >
        3 LAKH MONTHLY
      </div>
    </div>
  </World>
);
