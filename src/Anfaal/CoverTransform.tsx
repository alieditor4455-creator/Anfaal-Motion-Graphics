import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "./design";

// Transformation cover: diagonal split, faces shown in full.
// Each half = blurred, darkened full-bleed copy of the shot (fills the panel) + the sharp photo
// scaled down so the whole face fits, feathered into the blur.
// BEFORE (shop, tired stare): cold muted film grade + grain, top-left.
// AFTER (cash): premium green grade, bottom-right. Glowing seam + glass arrow badge.
// Headline: "20K JOB SE" (struck out) on top, "3 LAKH DAILY" at the bottom; never on a face;
// everything inside the 3:4 grid crop (y 240–1680).

const L = { y0: 1250, y1: 900 }; // seam y at x=0 and x=1080
const beforeClip = `polygon(0 0, 1080px 0, 1080px ${L.y1}px, 0 ${L.y0}px)`;
const afterClip = `polygon(0 ${L.y0}px, 1080px ${L.y1}px, 1080px 1920px, 0 1920px)`;
const angle = (Math.atan2(L.y1 - L.y0, 1080) * 180) / Math.PI;
const midY = (L.y0 + L.y1) / 2;

const feather = "linear-gradient(90deg, transparent 0%, #000 16%, #000 84%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)";

const Half: React.FC<{ src: string; clip: string; scale: number; left: number; top: number; grade: string; bgGrade: string; tint: React.ReactNode }> = ({ src, clip, scale, left, top, grade, bgGrade, tint }) => (
  <AbsoluteFill style={{ clipPath: clip }}>
    {/* blurred fill */}
    <Img src={staticFile(src)} style={{ position: "absolute", left: -80, top: -140, width: 1240, height: 2200, objectFit: "cover", filter: `blur(34px) ${bgGrade}` }} />
    {/* sharp photo, whole face */}
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left,
        top,
        width: 1080 * scale,
        height: 1920 * scale,
        filter: grade,
        WebkitMaskImage: feather,
        maskImage: feather,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    />
    {tint}
  </AbsoluteFill>
);

export const AnfaalCoverTransform: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void, overflow: "hidden" }}>
    {/* AFTER */}
    <Half
      src="an/cover_after.png"
      clip={afterClip}
      scale={0.56}
      left={700 - 0.56 * 650}
      top={960 - 0.56 * 645}
      grade="saturate(1.1) contrast(1.08)"
      bgGrade="saturate(1.1) brightness(.55)"
      tint={
        <>
          <AbsoluteFill style={{ background: "rgba(18,128,72,.22)", mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 66% 62%, rgba(47,210,126,.18), rgba(47,210,126,0) 70%)` }} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 72%, rgba(3,10,6,.85) 80%, ${K.void} 90%)` }} />
        </>
      }
    />

    {/* BEFORE */}
    <Half
      src="an/cover_before.png"
      clip={beforeClip}
      scale={0.56}
      left={400 - 0.56 * 490}
      top={350 - 0.56 * 216}
      grade="saturate(.3) contrast(1.15) brightness(.82) sepia(.18)"
      bgGrade="saturate(.2) brightness(.42) sepia(.2)"
      tint={
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,40,55,.4), rgba(50,40,30,.25))", mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an/grain.png")})`, backgroundSize: "512px 512px", mixBlendMode: "overlay", opacity: 0.18 }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.25) 15%, rgba(0,0,0,0) 22%)" }} />
        </>
      }
    />

    {/* glowing seam */}
    <div style={{ position: "absolute", left: -100, top: midY - 70, width: 1280, height: 140, transform: `rotate(${angle}deg)`, background: "radial-gradient(50% 50% at 50% 50%, rgba(156,255,201,.5), rgba(47,210,126,0) 70%)", filter: "blur(18px)" }} />
    <div style={{ position: "absolute", left: -100, top: midY - 3, width: 1280, height: 6, transform: `rotate(${angle}deg)`, background: `linear-gradient(90deg, rgba(255,255,255,0), ${K.hueLight} 18%, #FFFFFF 50%, ${K.hueLight} 82%, rgba(255,255,255,0))`, boxShadow: `0 0 24px ${K.hue}, 0 0 60px ${K.glow}` }} />

    {/* arrow badge on the seam, right side (between the faces) */}
    {(() => {
      const x = 960;
      const y = L.y0 + ((L.y1 - L.y0) * x) / 1080;
      return (
        <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, background: "linear-gradient(160deg, rgba(60,140,100,.6), rgba(6,23,15,.95))", border: `2px solid ${K.hueLight}`, boxShadow: `0 0 40px ${K.glow}, 0 20px 40px rgba(0,0,0,.5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={K.hueLight} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(70deg)" }}>
            <path d="M5 12 H19 M13 6 L19 12 L13 18" />
          </svg>
        </div>
      );
    })()}

    {/* BEFORE text */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "8px 22px", borderRadius: 999, background: "rgba(0,0,0,.5)", border: "1.5px solid rgba(255,255,255,.25)", fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 8, color: "rgba(255,255,255,.88)" }}>2 SAAL PEHLE</div>
      <div style={{ position: "relative", width: "fit-content", margin: "8px auto 0" }}>
        <div style={{ fontFamily: "Anton", fontSize: 100, color: "#E9E4DA", letterSpacing: 2, lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,.7)" }}>20K JOB SE</div>
        <div style={{ position: "absolute", left: -10, right: -10, top: "54%", height: 9, borderRadius: 5, background: K.red, boxShadow: "0 0 18px rgba(255,95,102,.5)", transform: "rotate(-2deg)" }} />
      </div>
    </div>

    {/* AFTER text */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1488, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "8px 22px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, border: "1.5px solid rgba(156,255,201,.6)", fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 8, color: "#03140B" }}>AB</div>
      <div
        style={{
          fontFamily: "Anton",
          fontSize: 146,
          whiteSpace: "nowrap",
          lineHeight: 1.02,
          letterSpacing: 2,
          marginTop: 4,
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
