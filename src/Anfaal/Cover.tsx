import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CandleRain, Coin, K, World } from "./design";

// Cover for the GoldMoves reel: same world as the video (one-hue green, fog, DOF candles,
// glossy 3D gold), big GOLD behind the head, type style C (tracked caps + Anton), centred.
// Text inside the 3:4 grid crop (y 240–1680) and off the face.

const FACE = { x: 492, y: 1030 }; // face option 5 (56.0 s), chosen by the client
const S = 0.95;
const FACE_TO = 840;

export const AnfaalCover: React.FC = () => (
  <World focusY={40} fog={1.2}>
    <CandleRain speed={0} count={12} />
    {/* warm light behind the head */}
    <AbsoluteFill style={{ background: "radial-gradient(34% 22% at 50% 40%, rgba(232,199,127,.42) 0%, rgba(232,199,127,0) 100%)" }} />

    {/* GOLD behind the head */}
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 215,
          fontFamily: "Anton",
          fontSize: 430,
          lineHeight: 1.05,
          letterSpacing: 4,
          backgroundImage: `linear-gradient(180deg, ${K.goldLight} 0%, ${K.gold} 45%, ${K.goldDeep} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 14px 34px rgba(0,0,0,.35))",
        }}
      >
        GOLD
      </div>
    </AbsoluteFill>

    {/* coins behind (depth) */}
    <div style={{ position: "absolute", left: 40, top: 640 }}>
      <Coin size={170} rx={24} ry={-38} rz={-10} blur={2} />
    </div>
    <div style={{ position: "absolute", left: 850, top: 560 }}>
      <Coin size={140} rx={18} ry={44} rz={12} blur={3} />
    </div>

    {/* speaker cut-out */}
    <AbsoluteFill style={{ transformOrigin: `${FACE.x}px ${FACE.y}px`, transform: `translate(${540 - FACE.x}px, ${FACE_TO - FACE.y}px) scale(${S})` }}>
      <Img src={staticFile("an/cover_person.png")} style={{ width: 1080, height: 1920, filter: "drop-shadow(0 0 26px rgba(232,199,127,.28)) drop-shadow(0 30px 60px rgba(0,0,0,.55))" }} />
    </AbsoluteFill>

    {/* foreground coin (out of focus, depth) */}
    <div style={{ position: "absolute", left: 760, top: 1030 }}>
      <Coin size={240} rx={30} ry={-26} rz={14} blur={6} />
    </div>

    {/* chest shade + headline */}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,0) 54%, rgba(3,10,6,.7) 62%, ${K.void} 72%)` }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 1205, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: K.soft, letterSpacing: 12 }}>GOLD MEIN ABHI</div>
      <div
        style={{
          fontFamily: "Anton",
          fontSize: 138,
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
        AUR MOVES BAAKI
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 26 }}>
        {[
          { t: "ELECTIONS", c: K.white },
          { t: "ISM PMI", c: K.white },
          { t: "NFP", c: K.red },
        ].map((x) => (
          <div
            key={x.t}
            style={{
              padding: "14px 26px",
              borderRadius: 999,
              background: "linear-gradient(160deg, rgba(60,140,100,.32), rgba(10,30,20,.6))",
              border: "1.5px solid rgba(156,255,201,.22)",
              fontFamily: "Anton",
              fontSize: 36,
              letterSpacing: 2,
              color: x.c,
            }}
          >
            {x.t}
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1712, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 22, letterSpacing: 6, color: K.soft }}>
      @IMANFAALPERVAIZ
    </div>
  </World>
);
