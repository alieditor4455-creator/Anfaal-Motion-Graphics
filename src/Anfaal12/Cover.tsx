import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Coin } from "../Anfaal/design";

// Reel 12 cover (v2): dark premium + chart — "GOLD CRASH", face 10 (clean frame), sell box + crash arrow, gold coins falling.
const GOLD = "#E8C77F", RED = "#FF3B3B", PERSON = "an12/cover_person_hq.png";
const r = (i: number, n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
// candle path: drift sideways, small bounce, then a hard crash
const CANDLES = (() => {
  const out: { x: number; o: number; c: number; h: number; l: number }[] = [];
  let p = 520;
  for (let i = 0; i < 34; i++) {
    const crash = i >= 22;
    const d = crash ? 22 + r(i, 1) * 34 : (r(i, 2) - 0.5) * 46 + (i < 10 ? -3 : 2);
    const o = p, c = p + d;
    out.push({ x: 40 + i * 30, o, c, h: Math.min(o, c) - 6 - r(i, 3) * 18, l: Math.max(o, c) + 6 + r(i, 4) * 18 });
    p = c;
  }
  return out;
})();
export const AnfaalReel12Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#050606", overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 55% 40%, rgba(255,59,59,.22) 0%, rgba(80,10,10,.15) 40%, rgba(5,6,6,0) 75%)" }} />
    {/* grid */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
      {Array.from({ length: 24 }, (_, i) => <line key={"h" + i} x1={0} x2={1080} y1={i * 84} y2={i * 84} stroke="#fff" strokeWidth={1} />)}
      {Array.from({ length: 14 }, (_, i) => <line key={"v" + i} x1={i * 84} x2={i * 84} y1={0} y2={1920} stroke="#fff" strokeWidth={1} />)}
    </svg>
    {/* chart */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset=".2" stopColor="#000" stopOpacity="1" /></linearGradient>
      </defs>
      {/* sell box (his trade): red SL above, green TP below, from the crash start */}
      <rect x={700} y={555} width={340} height={70} fill="rgba(255,59,59,.22)" stroke="rgba(255,59,59,.6)" />
      <rect x={700} y={625} width={340} height={470} fill="rgba(38,166,154,.16)" stroke="rgba(38,166,154,.5)" />
      <text x={712} y={598} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#FF8A8A">SL</text>
      <text x={712} y={1080} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#5FE0C8">TP HIT ✓</text>
      {CANDLES.map((k, i) => {
        const up = k.c < k.o; const col = up ? "#26A69A" : "#EF5350";
        return <g key={i} opacity={0.35 + (i / CANDLES.length) * 0.65}><line x1={k.x} x2={k.x} y1={k.h} y2={k.l} stroke={col} strokeWidth={3} /><rect x={k.x - 9} y={Math.min(k.o, k.c)} width={18} height={Math.max(4, Math.abs(k.c - k.o))} fill={col} rx={2} /></g>;
      })}
      {/* crash arrow */}
      <path d="M 640 560 C 760 640, 860 860, 960 1120" fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 18px rgba(255,59,59,.9))" }} />
      <path d="M 920 1100 L 975 1160 L 990 1080 Z" fill={RED} style={{ filter: "drop-shadow(0 0 14px rgba(255,59,59,.9))" }} />
    </svg>
    {/* falling coins */}
    <div style={{ position: "absolute", left: 60, top: 640 }}><Coin size={120} rx={20} ry={-30} rz={-25} blur={1} /></div>
    <div style={{ position: "absolute", left: 120, top: 900 }}><Coin size={80} rx={-10} ry={40} rz={30} blur={3} /></div>
    <div style={{ position: "absolute", left: 930, top: 1240 }}><Coin size={90} rx={30} ry={20} rz={-40} blur={2} /></div>
    {/* headline */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ padding: "8px 26px", borderRadius: 999, border: "2px solid rgba(255,59,59,.7)", background: "rgba(255,59,59,.12)", fontFamily: "Inter", fontWeight: 800, fontSize: 30, letterSpacing: 5, color: "#FF9A9A" }}>● 1 SAAL KA LOW TOOTA</div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 24 }}>
        <div style={{ fontFamily: "Anton", fontSize: 196, lineHeight: 0.95, letterSpacing: 3, backgroundImage: `linear-gradient(180deg, #FFF6DD 0%, ${GOLD} 55%, #9C7232 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 0 #4A3410) drop-shadow(0 24px 40px rgba(0,0,0,.7))" }}>GOLD</div>
        <div style={{ fontFamily: "Anton", fontSize: 196, lineHeight: 0.95, letterSpacing: 3, paddingRight: 14, color: RED, fontStyle: "italic", filter: "drop-shadow(0 6px 0 #5A0A0A) drop-shadow(0 0 30px rgba(255,59,59,.5))" }}>CRASH</div>
      </div>
      <div style={{ marginTop: 6, fontFamily: "Inter", fontWeight: 800, fontSize: 52, letterSpacing: -1, color: "#fff" }}>nazar lag gayi? 👀</div>
    </div>
    {/* subject */}
    <AbsoluteFill style={{ transform: "translateY(40px) scale(0.84)", transformOrigin: "540px 1920px" }}>
      <Img src={staticFile(PERSON)} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(22px) brightness(1.4) sepia(1) hue-rotate(-30deg) saturate(3) opacity(.22)" }} />
      <Img src={staticFile(PERSON)} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.16) saturate(1.08) brightness(1.03) drop-shadow(0 -1px 2px rgba(255,170,170,.35)) drop-shadow(0 0 24px rgba(255,59,59,.22))" }} />
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 70% 30%, rgba(255,80,80,.35), rgba(0,0,0,.35) 100%)", mixBlendMode: "soft-light", WebkitMaskImage: `url(${staticFile(PERSON)})`, maskImage: `url(${staticFile(PERSON)})`, WebkitMaskSize: "1080px 1920px", maskSize: "1080px 1920px" }} />
    </AbsoluteFill>
    {/* bottom */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,6,0) 74%, rgba(5,6,6,.92) 88%, #050606 97%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1700, display: "flex", justifyContent: "center", gap: 16 }}>
      <div style={{ padding: "14px 30px", borderRadius: 18, background: `linear-gradient(100deg, #F6E2A8, ${GOLD} 50%, #B8893E)`, fontFamily: "Inter", fontWeight: 900, fontSize: 44, color: "#1A1205", boxShadow: "0 14px 40px rgba(232,199,127,.35)" }}>RECOVERY PLAN</div>
      <div style={{ padding: "14px 26px", borderRadius: 18, border: "2px solid rgba(255,255,255,.35)", fontFamily: "Inter", fontWeight: 800, fontSize: 44, color: "#fff" }}>FREE</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1825, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,.7)" }}>@imanfaalpervaiz</div>
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 45%, transparent 60%, rgba(0,0,0,.6) 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an12/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.1 }} />
  </AbsoluteFill>
);
