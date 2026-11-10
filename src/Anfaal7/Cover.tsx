import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 7 cover — poster style (client references): deep green glow world, giant "CPI" behind the head,
// brand mark top, side badges, pill + two-line headline with an italic gold accent, handle row at the bottom.
const G = K.hue, GOLD = K.gold;
const Ticker: React.FC<{ x: number; y: number; sym: string; val: string; col: string; rot: number }> = ({ x, y, sym, val, col, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "14px 22px", borderRadius: 22, background: "linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.04))", border: "1.5px solid rgba(255,255,255,.28)", boxShadow: `0 20px 40px rgba(0,0,0,.45), 0 0 30px ${col}33`, transform: `rotate(${rot}deg)` }}>
    <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 30, color: "#fff", letterSpacing: 1 }}>{sym}</div>
    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: col, letterSpacing: 2 }}>{val}</div>
  </div>
);
const Badge: React.FC<{ x: number; y: number; l1: string; l2: string; rot: number }> = ({ x, y, l1, l2, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 190, height: 190, borderRadius: 95, border: `3px solid ${G}`, boxShadow: `0 0 30px ${G}66, inset 0 0 30px ${G}33`, background: "rgba(3,14,8,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg)` }}>
    <div style={{ fontFamily: "Anton", fontSize: 54, lineHeight: 0.95, color: "#fff", fontStyle: "italic" }}>{l1}</div>
    <div style={{ fontFamily: "Anton", fontSize: 40, lineHeight: 0.95, color: GOLD, fontStyle: "italic" }}>{l2}</div>
  </div>
);
export const AnfaalReel7Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#020805", overflow: "hidden" }}>
    {/* glow world */}
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 38%, ${K.hueDeep} 0%, #06301A 40%, #020805 80%)` }} />
    {[[-160, 18], [880, -18]].map(([x, r], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: -200, width: 360, height: 2400, transform: `rotate(${r}deg)`, background: `linear-gradient(180deg, ${G}55, ${G}00 70%)`, filter: "blur(30px)" }} />
    ))}
    {/* faint grid */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
      {Array.from({ length: 24 }, (_, i) => <line key={"h" + i} x1={0} x2={1080} y1={i * 84} y2={i * 84} stroke={G} strokeWidth={1} />)}
      {Array.from({ length: 14 }, (_, i) => <line key={"v" + i} x1={i * 84} x2={i * 84} y1={0} y2={1920} stroke={G} strokeWidth={1} />)}
    </svg>
    {/* gold ray burst behind the head */}
    <div style={{ position: "absolute", left: -460, top: -260, width: 2000, height: 2000, background: `repeating-conic-gradient(from 0deg at 50% 50%, rgba(232,199,127,.10) 0deg 4deg, rgba(232,199,127,0) 4deg 14deg)`, WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)", maskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)" }} />
    {/* giant word behind the head */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Anton", fontSize: 560, lineHeight: 0.9, letterSpacing: 10, backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, #DFF7E8 45%, ${GOLD} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>CPI</div>
    {/* glowing XAUUSD line slicing through the letters */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="ln" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={G} stopOpacity={0} /><stop offset=".25" stopColor={G} /><stop offset=".8" stopColor={GOLD} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></linearGradient>
      </defs>
      <path d="M -20 760 L 90 700 L 160 735 L 250 610 L 330 655 L 420 520 L 500 560 L 600 430 L 690 470 L 780 360 L 860 400 L 960 300 L 1100 250" fill="none" stroke="url(#ln)" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px rgba(232,199,127,.9)) drop-shadow(0 0 30px rgba(47,210,126,.6))" }} />
      <circle cx={960} cy={300} r={14} fill={GOLD} style={{ filter: "drop-shadow(0 0 16px rgba(232,199,127,1))" }} />
    </svg>
    {/* brand mark */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
      <svg width={58} height={58} viewBox="0 0 40 40"><rect x={6} y={6} width={28} height={28} rx={4} transform="rotate(45 20 20)" fill="none" stroke="#fff" strokeWidth={3.5} /><rect x={13} y={13} width={14} height={14} rx={2} transform="rotate(45 20 20)" fill={G} /></svg>
      <div>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 32, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>ANFAAL PERVAIZ</div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, color: GOLD, letterSpacing: 6 }}>FOREX · GOLD</div>
      </div>
    </div>
    {/* subject */}
    <AbsoluteFill style={{ transform: "scale(1.2)", transformOrigin: "540px 1920px" }}>
      {/* light wrap: blurred green-tinted copy bleeding past the edges */}
      <Img src={staticFile("an7/cover_person_soft.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(26px) brightness(1.3) sepia(1) hue-rotate(80deg) saturate(3) opacity(.45)" }} />
      <Img src={staticFile("an7/cover_person_soft.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.06) saturate(1.02) drop-shadow(0 -2px 6px rgba(156,255,201,.55)) drop-shadow(0 0 26px rgba(47,210,126,.35))" }} />
      {/* scene colour falling onto the subject (soft-light grade, so edges match the world) */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 30%, rgba(47,210,126,.0), rgba(6,48,26,.35) 100%)`, mixBlendMode: "soft-light", WebkitMaskImage: `url(${staticFile("an7/cover_person_soft.png")})`, maskImage: `url(${staticFile("an7/cover_person_soft.png")})`, WebkitMaskSize: "1080px 1920px", maskSize: "1080px 1920px" }} />
    </AbsoluteFill>
    {/* badges */}
    <Ticker x={36} y={820} sym="XAUUSD" val="▲ VOLATILE" col={G} rot={-6} />
    <Ticker x={760} y={760} sym="USD" val="▼ CPI DATA" col="#FF5F66" rot={6} />
    {/* atmospheric haze + floating light particles (depth, blends the body into the scene) */}
    <AbsoluteFill style={{ background: "radial-gradient(70% 22% at 50% 78%, rgba(47,210,126,.22), rgba(47,210,126,0) 70%)", filter: "blur(10px)" }} />
    {Array.from({ length: 26 }, (_, i) => {
      const r = (n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
      const sz = 4 + r(1) * 14;
      return <div key={i} style={{ position: "absolute", left: r(2) * 1080, top: 300 + r(3) * 1250, width: sz, height: sz, borderRadius: sz, background: r(4) > 0.5 ? GOLD : "#BFFFD9", opacity: 0.25 + r(5) * 0.5, filter: `blur(${r(6) * 3}px)`, boxShadow: `0 0 ${sz * 2}px ${r(4) > 0.5 ? GOLD : G}` }} />;
    })}
    {/* bottom shade + headline */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,8,5,0) 55%, rgba(2,8,5,.85) 68%, #020805 82%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ padding: "10px 34px", borderRadius: 999, border: "2.5px solid rgba(255,255,255,.9)", fontFamily: "Inter", fontWeight: 600, fontSize: 36, color: "#fff", letterSpacing: -0.5 }}>CPI day · 10 October</div>
      <div style={{ marginTop: 18, fontFamily: "Inter", fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: -5, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.6)" }}>GOLD</div>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontStyle: "italic", fontSize: 110, lineHeight: 1, letterSpacing: -4, backgroundImage: `linear-gradient(100deg, ${G}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingRight: 12 }}>kidhar jayega?</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1640, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,.85)" }}>
      <span>@imanfaalpervaiz</span>
      <span style={{ width: 70, height: 2, background: "rgba(255,255,255,.7)" }} />
      <span style={{ letterSpacing: 6 }}>♥ 💬 🔖</span>
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.6) 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an7/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.12 }} />
  </AbsoluteFill>
);
