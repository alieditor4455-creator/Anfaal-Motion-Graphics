import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 7 cover — poster style (client references): deep green glow world, giant "CPI" behind the head,
// brand mark top, side badges, pill + two-line headline with an italic gold accent, handle row at the bottom.
const G = K.hue, GOLD = K.gold;
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
    {/* giant word behind the head */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Anton", fontSize: 560, lineHeight: 0.9, letterSpacing: 10, backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, #DFF7E8 45%, ${GOLD} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>CPI</div>
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
      <Img src={staticFile("an7/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: `blur(18px) brightness(1.2) drop-shadow(0 0 0 ${G}) opacity(.35)` }} />
      <Img src={staticFile("an7/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.08) saturate(1.05) drop-shadow(0 0 22px rgba(47,210,126,.45))" }} />
    </AbsoluteFill>
    {/* badges */}
    <Badge x={40} y={760} l1="10" l2="OCT" rot={-8} />
    <Badge x={850} y={700} l1="LIVE" l2="DATA" rot={8} />
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
