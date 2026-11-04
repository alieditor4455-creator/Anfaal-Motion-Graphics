import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 3 cover (documentary, dark): explosion plate, real BBC / WSJ clippings pinned behind,
// big "GOLD" behind the head, keyed speaker (face 6, 56.0 s, legs + chair kept),
// headline "GOLD: CRASH YA TRAP?" low on the frame. Inside the 3:4 crop (y 240–1680), no text on the face.
const D = { ink: "#050607", ember: "#E5484D", amber: "#E8A35A", paper: "#EDEBE6" };

const Clipping: React.FC<{ src: string; x: number; y: number; w: number; crop: number; imgW: number; rot: number }> = ({ src, x, y, w, crop, imgW, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: (crop * w) / imgW, overflow: "hidden", borderRadius: 4, transform: `rotate(${rot}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,.75)" }}>
    <Img src={staticFile(src)} style={{ width: w, filter: "sepia(.25) contrast(1.05) brightness(.7)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(255,240,220,.06), rgba(0,0,0,.35))" }} />
  </div>
);

export const AnfaalReel3Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: D.ink, overflow: "hidden" }}>
    <Img src={staticFile("an3/cover_bg.png")} style={{ position: "absolute", left: -60, top: -80, width: 1200, height: 2133, objectFit: "cover", filter: "saturate(.5) contrast(1.2) brightness(.45) blur(3px)" }} />
    <AbsoluteFill style={{ background: "rgba(229,72,77,.22)", mixBlendMode: "soft-light" }} />
    <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 35%, rgba(255,170,110,.18), rgba(0,0,0,0) 70%)" }} />

    {/* clippings behind */}
    <Clipping src="an3/bbc.png" x={-30} y={300} w={430} crop={500} imgW={826} rot={-8} />
    <Clipping src="an3/wsj.png" x={690} y={270} w={420} crop={560} imgW={826} rot={7} />

    {/* GOLD behind the head */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: "Anton", fontSize: 380, lineHeight: 1, letterSpacing: 6, backgroundImage: `linear-gradient(180deg, ${K.goldLight} 0%, ${K.gold} 50%, ${K.goldDeep} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 16px 40px rgba(0,0,0,.6))" }}>GOLD</div>

    {/* speaker */}
    <AbsoluteFill style={{ transform: "scale(.88)", transformOrigin: "540px 1920px" }}>
      {/* light wrap: soft warm halo from a blurred copy, so edges melt into the scene */}
      <Img src={staticFile("an3/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(22px) brightness(1.6) sepia(.6) saturate(1.4) opacity(.55)" }} />
      <Img src={staticFile("an3/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.05) saturate(.95) drop-shadow(0 40px 60px rgba(0,0,0,.7))" }} />
    </AbsoluteFill>

    {/* grade + headline */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,7,0) 62%, rgba(5,6,7,.82) 72%, rgba(5,6,7,.95) 90%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 45%, transparent 50%, rgba(0,0,0,.7) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1395, textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 8, background: "rgba(5,6,7,.75)", border: `1px solid ${D.ember}66` }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: D.ember, boxShadow: `0 0 10px ${D.ember}` }} />
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: D.ember }}>US–IRAN · NUCLEAR TALK · MARKETS</span>
      </div>
      <div style={{ fontFamily: "Anton", fontSize: 132, lineHeight: 1.02, letterSpacing: 2, marginTop: 14, whiteSpace: "nowrap", color: D.paper, textShadow: "0 10px 30px rgba(0,0,0,.7)" }}>
        <span style={{ color: D.ember, textShadow: "0 0 26px rgba(229,72,77,.5)" }}>CRASH</span> YA <span style={{ color: K.gold, textShadow: "0 0 26px rgba(232,199,127,.5)" }}>TRAP?</span>
      </div>
    </div>
  </AbsoluteFill>
);
