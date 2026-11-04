import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CandleRain, K, World } from "../Anfaal/design";

// Reel 2 cover: loss vs profit. The client's real screenshots as tilted glass cards behind the head
// (loss = red glow, profit = green glow), cut-out of the chosen frame (19.0 s) in front,
// headline "−5K SE +10K" below the chin. Inside the 3:4 grid crop (y 240–1680), no text on the face.

const FACE = { x: 585, y: 1260 };
const FACE_TO = 1000;

const ShotCard: React.FC<{ src: string; x: number; y: number; w: number; ratio: number; rot: number; glow: string; border: string; label: string; value: string; color: string; align?: string }> = ({ src, x, y, w, ratio, rot, glow, border, label, value, color, align = "center" }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot}deg)` }}>
    <div style={{ padding: 10, borderRadius: 30, background: "linear-gradient(160deg, rgba(60,140,100,.35), rgba(10,30,20,.7))", border: `2px solid ${border}`, boxShadow: `0 30px 70px rgba(0,0,0,.6), 0 0 50px ${glow}` }}>
      <Img src={staticFile(src)} style={{ display: "block", width: w - 24, height: (w - 24) * ratio, borderRadius: 22, objectFit: "cover", objectPosition: "top" }} />
    </div>
    <div style={{ display: "flex", justifyContent: align, marginTop: 14, paddingLeft: align === "flex-start" ? 20 : 0 }}>
      <div style={{ padding: "8px 20px", borderRadius: 999, background: "rgba(6,18,12,.82)", border: `1.5px solid ${border}`, display: "flex", gap: 10, alignItems: "baseline" }}>
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, letterSpacing: 5, color: K.soft }}>{label}</span>
        <span style={{ fontFamily: "Anton", fontSize: 34, color }}>{value}</span>
      </div>
    </div>
  </div>
);

export const AnfaalReel2Cover: React.FC = () => (
  <World focusY={38} fog={1.2}>
    <CandleRain speed={0} count={12} />
    <AbsoluteFill style={{ background: "radial-gradient(40% 26% at 50% 40%, rgba(47,210,126,.3) 0%, rgba(47,210,126,0) 100%)" }} />

    {/* screenshots behind the head */}
    <ShotCard src="an2/loss.jpg" x={40} y={330} w={520} ratio={542 / 1320} rot={-7} glow="rgba(255,95,102,.35)" border="rgba(255,95,102,.6)" label="KAL RAAT" value="−$4,311" color={K.red} align="flex-start" />
    <ShotCard src="an2/profit.jpg" x={690} y={270} w={350} ratio={0.95} rot={6} glow={K.glow} border="rgba(156,255,201,.6)" label="AAJ" value="+$12,499" color={K.hue} />

    {/* speaker cut-out */}
    <AbsoluteFill style={{ transform: `translate(${540 - FACE.x}px, ${FACE_TO - FACE.y}px)` }}>
      <Img src={staticFile("an2/cover_person.png")} style={{ width: 1080, height: 1920, filter: "saturate(1.04) contrast(1.05) drop-shadow(0 0 26px rgba(156,255,201,.3)) drop-shadow(0 30px 60px rgba(0,0,0,.55))" }} />
    </AbsoluteFill>

    {/* chest shade + headline */}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 62%, rgba(3,10,6,.8) 69%, ${K.void} 78%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 32, letterSpacing: 12, color: K.soft }}>WOH TRADER HI KYA JO LOSS NA KARE</div>
      <div style={{ fontFamily: "Anton", fontSize: 176, lineHeight: 1.02, letterSpacing: 2, marginTop: 10, whiteSpace: "nowrap" }}>
        <span style={{ backgroundImage: `linear-gradient(180deg, #FFD0D2 0%, ${K.red} 70%, #B9353B 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 22px rgba(255,95,102,.45))" }}>−5K SE </span>
        <span style={{ backgroundImage: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 70%, ${K.hueDeep} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 24px ${K.glow})` }}>+10K</span>
      </div>
    </div>
  </World>
);
