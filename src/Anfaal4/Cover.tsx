import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CandleRain, K } from "../Anfaal/design";

// Reel 4 cover (educational, Forex Premium look): chart-wall world, the real gold chart as a glass card
// behind the head, big "NFP" behind the head, cut-out of face 6 (63.3 s) with a soft light wrap,
// headline "KAL NFP / GOLD KIDHAR?" + two chips. Inside the 3:4 crop (y 240–1680), no text on the face.
export const AnfaalReel4Cover: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 38%, ${K.mid} 0%, ${K.deep} 45%, ${K.void} 100%)`, overflow: "hidden" }}>
    <Img src={staticFile("an4/wall.jpg")} style={{ position: "absolute", left: -260, top: -420, width: 1600, height: 2600, opacity: 0.85 }} />
    <CandleRain speed={0} count={10} />
    <AbsoluteFill style={{ background: "radial-gradient(40% 26% at 50% 36%, rgba(47,210,126,.32), rgba(47,210,126,0) 100%)" }} />

    {/* real chart, tilted, behind */}
    <div style={{ position: "absolute", left: 470, top: 300, width: 600, transform: "rotate(5deg)", padding: 10, borderRadius: 26, background: "linear-gradient(160deg, rgba(60,140,100,.4), rgba(10,30,20,.7))", border: "1.5px solid rgba(156,255,201,.3)", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
      <Img src={staticFile("an4/gold_chart.png")} style={{ display: "block", width: 580, borderRadius: 18, filter: "brightness(.85)" }} />
    </div>

    {/* NFP behind the head */}
    <div style={{ position: "absolute", left: 40, top: 240, fontFamily: "Anton", fontSize: 330, lineHeight: 1, letterSpacing: 4, backgroundImage: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 55%, ${K.hueDeep} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 40px ${K.glow}) drop-shadow(0 14px 30px rgba(0,0,0,.4))` }}>NFP</div>

    {/* speaker with light wrap */}
    <AbsoluteFill style={{ transform: "translateY(60px) scale(.9)", transformOrigin: "540px 1920px" }}>
      <Img src={staticFile("an4/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(22px) brightness(1.5) saturate(1.2) opacity(.45)" }} />
      <Img src={staticFile("an4/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.05) drop-shadow(0 40px 60px rgba(0,0,0,.6))" }} />
    </AbsoluteFill>

    {/* shade + headline */}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 60%, rgba(3,10,6,.82) 70%, ${K.void} 86%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 38, letterSpacing: 14, color: K.soft }}>KAL NFP · 6 NOV</div>
      <div style={{ fontFamily: "Anton", fontSize: 160, lineHeight: 1.02, letterSpacing: 2, marginTop: 6, whiteSpace: "nowrap", backgroundImage: `linear-gradient(180deg, ${K.goldLight} 0%, ${K.gold} 60%, ${K.goldDeep} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 24px rgba(232,199,127,.45))" }}>GOLD KIDHAR?</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
        {[
          { t: "+$240 · 2 DIN", c: K.hue },
          { t: "CONSENSUS 65K", c: K.white },
        ].map((x) => (
          <div key={x.t} style={{ padding: "12px 24px", borderRadius: 999, background: "linear-gradient(160deg, rgba(60,140,100,.32), rgba(10,30,20,.7))", border: "1.5px solid rgba(156,255,201,.25)", fontFamily: "Anton", fontSize: 36, letterSpacing: 2, color: x.c }}>{x.t}</div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
