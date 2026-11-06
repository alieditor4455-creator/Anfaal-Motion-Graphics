import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 5 cover: the client's real frame (holding dollars, 12.7 s), no background added.
// Headline on a dark plate in the clean wall area above the head; inside the 3:4 crop (y 240–1680).
export const AnfaalReel5Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void }}>
    <Img src={staticFile("an5/cover_frame.jpg")} style={{ width: 1080, height: 1920, filter: "contrast(1.06) saturate(1.02)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,10,6,.55) 0%, rgba(3,10,6,.2) 30%, rgba(3,10,6,0) 42%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "26px 46px 30px", borderRadius: 40, background: "rgba(3,10,6,.82)", border: "1.5px solid rgba(156,255,201,.25)", boxShadow: "0 24px 60px rgba(0,0,0,.5)", textAlign: "center" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 34, letterSpacing: 8, color: K.white }}>AAP KIS KE PEECHE HO?</div>
        <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 1.02, letterSpacing: 2, marginTop: 8, whiteSpace: "nowrap" }}>
          <span style={{ color: K.red, textShadow: "0 0 26px rgba(255,95,102,.5)" }}>PKR</span>
          <span style={{ color: K.white }}> YA </span>
          <span style={{ color: K.hue, textShadow: `0 0 26px ${K.glow}` }}>DOLLAR?</span>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
