import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// Reel 11 cover: "PAISA HI / MARD HAI", pose 5 — bold street/editorial: paper + halftone, sticker cutout, black/yellow boxes, tape.
const YEL = "#FFE419", BLK = "#0A0A0A", PAPER = "#EDE8DC";
const PERSON = "an11/cover_person_soft.png";
const Tape: React.FC<{ x: number; y: number; rot: number; w?: number }> = ({ x, y, rot, w = 120 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 42, background: "rgba(232,224,198,.85)", transform: `rotate(${rot}deg)`, boxShadow: "0 3px 6px rgba(0,0,0,.2)" }} />
);
const Note: React.FC<{ x: number; y: number; rot: number; c: string }> = ({ x, y, rot, c }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 260, height: 120, padding: 8, background: "#fff", transform: `rotate(${rot}deg)`, boxShadow: "6px 8px 0 rgba(0,0,0,.35)" }}>
    <div style={{ width: "100%", height: "100%", background: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 66, color: BLK, backgroundImage: "radial-gradient(rgba(0,0,0,.25) 1.4px, transparent 1.6px)", backgroundSize: "8px 8px" }}>$</div>
  </div>
);
const tear = "polygon(0% 6%, 7% 1%, 15% 5%, 24% 0%, 33% 4%, 42% 1%, 51% 6%, 60% 2%, 69% 5%, 78% 0%, 87% 4%, 94% 1%, 100% 5%, 100% 95%, 92% 99%, 83% 94%, 74% 100%, 65% 95%, 56% 99%, 47% 94%, 38% 100%, 29% 96%, 20% 100%, 11% 95%, 0% 99%)";
export const AnfaalReel11Cover: React.FC = () => (
  <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
    {/* paper grain + halftone */}
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.16) 1.6px, transparent 1.9px)", backgroundSize: "11px 11px", WebkitMaskImage: "linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)", maskImage: "linear-gradient(160deg, #000 0%, transparent 55%, #000 100%)" }} />
    {/* black torn band behind */}
    <div style={{ position: "absolute", left: -40, right: -40, top: 640, height: 560, background: BLK, transform: "rotate(-6deg)", clipPath: tear }} />
    {/* giant headline BEHIND the subject */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: "Anton", fontSize: 300, lineHeight: 0.92, color: BLK, letterSpacing: 2 }}>PAISA HI</div>
    <div style={{ position: "absolute", left: 70, top: 92, padding: "6px 18px 2px", background: BLK, color: "#fff", fontFamily: "Anton", fontSize: 40, letterSpacing: 3, transform: "rotate(-4deg)" }}>AAJ KE ZAMANE MEIN</div>
    <Note x={-40} y={1020} rot={-18} c="#6FA77D" />
    <Note x={850} y={860} rot={16} c={YEL} />
    <Note x={830} y={1250} rot={-10} c="#6FA77D" />
    {/* subject: sticker cutout (white outline + hard shadow) */}
    <AbsoluteFill style={{ transform: "scale(1.16)", transformOrigin: "540px 1920px" }}>
      <Img src={staticFile(PERSON)} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.12) saturate(.8) drop-shadow(0 0 0 #fff) drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(16px 18px 0 rgba(0,0,0,.35))" }} />
    </AbsoluteFill>
    {/* front headline on the lower body */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1360, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: "rotate(-3deg)" }}>
        <div style={{ padding: "4px 40px 0", background: YEL, fontFamily: "Anton", fontSize: 230, lineHeight: 1.05, color: BLK, letterSpacing: 2, boxShadow: `12px 12px 0 ${BLK}` }}>MARD HAI</div>
        <Tape x={-40} y={-16} rot={-30} />
        <Tape x={700} y={-14} rot={26} />
      </div>
    </div>
    {/* torn paper strip */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1690, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "22px 44px 16px", background: "#fff", clipPath: tear, transform: "rotate(2deg)", fontFamily: "Anton", fontSize: 58, letterSpacing: 2, color: BLK, boxShadow: "0 10px 20px rgba(0,0,0,.25)" }}>20 SAAL KA · <span style={{ background: YEL, padding: "0 10px" }}>DAILY PAISA</span></div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1835, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "4px 16px 0", background: BLK, fontFamily: "Anton", fontSize: 32, letterSpacing: 3, color: "#fff" }}>@IMANFAALPERVAIZ</div>
    </div>
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an11/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "multiply", opacity: 0.18 }} />
  </AbsoluteFill>
);
