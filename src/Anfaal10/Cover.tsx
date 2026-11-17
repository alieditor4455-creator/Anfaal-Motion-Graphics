import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// Reel 10 cover: "LETE LETE +200 PIPS", face 10 — red/white reference theme, premium poster build.
const R = "#E5172F", R2 = "#8E0A1A", INK = "#0F1A14";
const PERSON = "an10/cover_person_soft.png";
const Phone: React.FC<{ src: string; x: number; y: number; rot: number; tag: string; tagBg: string; fit?: "cover" | "contain" }> = ({ src, x, y, rot, tag, tagBg }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 280, transform: `rotate(${rot}deg)` }}>
    <div style={{ width: 280, height: 580, borderRadius: 40, padding: 9, background: "#0B0B0B", border: "2px solid rgba(255,255,255,.35)", boxShadow: "0 40px 70px rgba(0,0,0,.55), 0 0 0 8px rgba(255,255,255,.08)" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", borderRadius: 32 }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: -30, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "10px 22px", borderRadius: 999, background: tagBg, fontFamily: "Inter", fontWeight: 900, fontSize: 30, color: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,.4)", whiteSpace: "nowrap" }}>{tag}</div>
    </div>
  </div>
);
export const AnfaalReel10Cover: React.FC = () => (
  <AbsoluteFill style={{ background: R2, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 42%, #FF5A6A 0%, ${R} 38%, ${R2} 75%, #3A030B 100%)` }} />
    {/* reference-style white grid lines */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
      {[180, 900].map((x) => <line key={x} x1={x} x2={x} y1={0} y2={1920} stroke="#fff" strokeWidth={2} />)}
      {[120, 700, 1560].map((y) => <line key={y} x1={0} x2={1080} y1={y} y2={y} stroke="#fff" strokeWidth={2} />)}
    </svg>
    {/* light rays behind the head */}
    <div style={{ position: "absolute", left: -460, top: -80, width: 2000, height: 2000, background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.09) 0deg 4deg, rgba(255,255,255,0) 4deg 14deg)", WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)", maskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)" }} />
    {/* falling price line (the sell) */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M -20 610 L 120 640 L 200 600 L 300 700 L 380 670 L 470 790 L 560 760 L 650 900 L 740 870 L 830 1010 L 930 990 L 1100 1120" fill="none" stroke="#fff" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} style={{ filter: "drop-shadow(0 0 14px rgba(255,255,255,.8))" }} />
    </svg>
    {/* headline above the head */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 26px", borderRadius: 999, background: "rgba(255,255,255,.14)", border: "2px solid rgba(255,255,255,.5)", fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: "#fff", letterSpacing: 4 }}>🤒 FLU · BED SE TRADE</div>
      <div style={{ marginTop: 16, fontFamily: "Inter", fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: -6, color: "#fff", textShadow: "0 10px 0 rgba(0,0,0,.18), 0 24px 50px rgba(0,0,0,.45)" }}>LETE LETE</div>
      <div style={{ marginTop: 18, padding: "6px 40px 14px", borderRadius: 30, background: "#fff", transform: "rotate(-3deg)", boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 -6px 0 rgba(0,0,0,.08)" }}>
        <div style={{ fontFamily: "Anton", fontSize: 196, lineHeight: 1.0, letterSpacing: 2, backgroundImage: `linear-gradient(180deg, #FF4D5E 0%, ${R} 55%, ${R2} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>+200 PIPS</div>
      </div>
    </div>
    {/* subject */}
    <AbsoluteFill style={{ transform: "translateY(70px)" }}>
      <Img src={staticFile(PERSON)} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(24px) brightness(2.2) saturate(0) opacity(.45)" }} />
      <Img src={staticFile(PERSON)} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.06) saturate(1.04) drop-shadow(0 -2px 5px rgba(255,255,255,.75)) drop-shadow(0 0 24px rgba(255,90,106,.45))" }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 50%, rgba(255,90,106,0), rgba(142,10,26,.35) 100%)", mixBlendMode: "soft-light", WebkitMaskImage: `url(${staticFile(PERSON)})`, maskImage: `url(${staticFile(PERSON)})`, WebkitMaskSize: "1080px 1920px", maskSize: "1080px 1920px" }} />
    </AbsoluteFill>
    <Phone src="an10/signals.jpg" x={-10} y={960} rot={-10} tag="SELL 3857" tagBg={R} />
    <Phone src="an10/chart.jpg" x={810} y={930} rot={10} tag="TP HIT ✓" tagBg="#12B76A" />
    {/* bottom */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(58,3,11,0) 70%, rgba(58,3,11,.85) 84%, #2A0208 96%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1665, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 34px", borderRadius: 28, background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: R, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>⏱</div>
        <div style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 46, color: INK, letterSpacing: -1.5 }}>sirf 1 minute mein</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1800, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,.85)" }}>@imanfaalpervaiz</div>
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 45%, transparent 60%, rgba(0,0,0,.5) 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an10/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.1 }} />
  </AbsoluteFill>
);
