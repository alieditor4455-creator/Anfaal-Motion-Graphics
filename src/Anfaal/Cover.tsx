import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CandleRain, K, World } from "./design";

// Cover: same green premium world as part 2, big FOREX behind the head, the client's chosen
// frame (36.8 s, sunglasses) as a cut-out, headline "20K JOB SE / 3 LAKH DAILY" below the chin.
// Everything inside the 3:4 grid crop (y 240–1680); no text on the face.

const FACE = { x: 570, y: 1200 }; // face centre in cover_frame.png
const S = 1.0;
const FACE_TO = 1000;

export const AnfaalCover: React.FC = () => (
  <World focusY={36} fog={1.2}>
    <CandleRain speed={0} count={12} />
    <AbsoluteFill style={{ background: "radial-gradient(38% 24% at 50% 36%, rgba(47,210,126,.35) 0%, rgba(47,210,126,0) 100%)" }} />

    {/* FOREX behind the head */}
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 250,
          fontFamily: "Anton",
          fontSize: 360,
          lineHeight: 1.05,
          letterSpacing: 6,
          backgroundImage: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 55%, ${K.hueDeep} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 40px ${K.glow}) drop-shadow(0 14px 34px rgba(0,0,0,.35))`,
        }}
      >
        FOREX
      </div>
    </AbsoluteFill>

    {/* speaker cut-out */}
    <AbsoluteFill style={{ transformOrigin: `${FACE.x}px ${FACE.y}px`, transform: `translate(${540 - FACE.x}px, ${FACE_TO - FACE.y}px) scale(${S})` }}>
      <Img src={staticFile("an/cover_person.png")} style={{ width: 1080, height: 1920, filter: "saturate(1.04) contrast(1.05) drop-shadow(0 0 26px rgba(156,255,201,.30)) drop-shadow(0 30px 60px rgba(0,0,0,.55))" }} />
    </AbsoluteFill>

    {/* chest shade + headline (below the chin) */}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 64%, rgba(3,10,6,.78) 71%, ${K.void} 79%)` }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 1400, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: K.soft, letterSpacing: 14 }}>20K JOB SE</div>
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
  </World>
);
