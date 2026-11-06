import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 5 cover — split: PKR (red, rupee notes) vs DOLLAR (green, dollar notes), the client cut out in the
// middle with a glowing seam behind him, big "PKR · YA · $" type, question line below. 3:4 safe (y 240–1680).
const RED = "#FF4D57";
const Notes: React.FC<{ src: string; x: number; y: number; w: number; rot: number; tint: string }> = ({ src, x, y, w, rot, tint }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot}deg)`, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
    <Img src={staticFile(src)} style={{ display: "block", width: w, filter: "contrast(1.1) saturate(1.1)" }} />
    <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />
  </div>
);
export const AnfaalReel5Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
    {/* left: PKR world */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 1920, clipPath: "polygon(0 0, 600px 0, 480px 1920px, 0 1920px)", background: "radial-gradient(90% 60% at 30% 40%, #5A0D12 0%, #2A0507 55%, #0D0203 100%)" }}>
      <Notes src="an5/pkr_notes.png" x={30} y={370} w={470} rot={-7} tint="rgba(255,60,70,.15)" />
    </div>
    {/* right: DOLLAR world */}
    <div style={{ position: "absolute", left: 480, top: 0, width: 600, height: 1920, clipPath: "polygon(120px 0, 600px 0, 600px 1920px, 0 1920px)", background: `radial-gradient(90% 60% at 70% 40%, ${K.hueDeep} 0%, #06301A 55%, #020C06 100%)` }}>
      <div style={{ position: "absolute", left: 100, top: 370 }}>
        <Notes src="an5/usd_notes.png" x={0} y={0} w={470} rot={7} tint="rgba(47,210,126,.12)" />
      </div>
    </div>
    {/* glowing seam */}
    <div style={{ position: "absolute", left: 535, top: -100, width: 10, height: 2200, transform: "rotate(3.6deg)", background: "linear-gradient(180deg, rgba(255,255,255,0), #FFFFFF 30%, #FFF1C9 60%, rgba(255,255,255,0))", boxShadow: "0 0 40px rgba(255,241,201,.8), 0 0 120px rgba(255,241,201,.4)" }} />

    {/* big type behind the head */}
    <div style={{ position: "absolute", left: 70, top: 590, fontFamily: "Anton", fontSize: 200, lineHeight: 1, color: RED, textShadow: "0 0 50px rgba(255,77,87,.55)" }}>PKR</div>
    <div style={{ position: "absolute", right: 90, top: 590, fontFamily: "Anton", fontSize: 200, lineHeight: 1, color: K.hue, textShadow: `0 0 50px ${K.glow}` }}>$</div>

    {/* the speaker */}
    <AbsoluteFill style={{ transform: "scale(1)", transformOrigin: "540px 1920px" }}>
      <Img src={staticFile("an5/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(20px) brightness(1.4) opacity(.4)" }} />
      <Img src={staticFile("an5/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.06) drop-shadow(0 30px 60px rgba(0,0,0,.7))" }} />
    </AbsoluteFill>

    {/* "YA" badge on the seam */}
    <div style={{ position: "absolute", left: 540 - 75, top: 395, width: 150, height: 150, borderRadius: 85, background: "rgba(5,5,5,.88)", border: "3px solid #FFF1C9", boxShadow: "0 0 50px rgba(255,241,201,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 76, color: "#FFF1C9" }}>YA</div>

    {/* question line */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 85%, rgba(0,0,0,.6) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 38, letterSpacing: 10, color: K.white }}>AAP KIS KE PEECHE HO?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 55, margin: "0 auto", width: "fit-content", padding: "10px 28px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, fontFamily: "Anton", fontSize: 40, letterSpacing: 3, color: "#03140B" }}>COMMENT KARO ↓</div>
    </div>
  </AbsoluteFill>
);
