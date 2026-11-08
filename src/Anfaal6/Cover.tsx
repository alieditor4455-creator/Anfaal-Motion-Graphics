import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// Reel 6 cover — reference UI style on the real hook frame (holding cash): boxed tag, huge green number,
// white lead, green focus brackets, edge money, bottom glow, grain. 3:4 safe (y 240–1680), nothing on the face.
const G = "#22E37A";
const sq = (x: number, y: number) => <div style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, background: G, boxShadow: `0 0 18px ${G}` }} />;
export const AnfaalReel6Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
    <Img src={staticFile("an6/cover_frame.jpg")} style={{ width: 1080, height: 1920, filter: "contrast(1.08) saturate(.92) brightness(.95)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.45) 26%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 70%, rgba(0,0,0,.5) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(34,227,122,.32) 0%, rgba(34,227,122,.06) 16%, rgba(34,227,122,0) 28%)" }} />
    {/* edge money */}
    {[
      { x: 860, y: 640, w: 300, r: 24 },
      { x: -140, y: 640, w: 300, r: -20 },
    ].map((b, i) => (
      <Img key={i} src={staticFile("an6/usd_notes.png")} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, transform: `rotate(${b.r}deg)`, borderRadius: 6, boxShadow: "0 20px 40px rgba(0,0,0,.5)", filter: "saturate(.65) brightness(.95)" }} />
    ))}
    {/* focus brackets around the face */}
    {sq(230, 880)}{sq(800, 880)}{sq(230, 1640)}{sq(800, 1640)}
    {/* headline block */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 255, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ padding: "8px 22px", border: "3px solid rgba(255,255,255,.9)", fontFamily: "Inter", fontWeight: 800, fontSize: 34, letterSpacing: 4, color: "#fff", background: "rgba(0,0,0,.35)" }}>JUST 1 TRADE</div>
      <div style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 0.95, color: G, textShadow: `0 0 50px rgba(34,227,122,.6), 0 10px 30px rgba(0,0,0,.6)` }}>$5,000</div>
      <div style={{ padding: "12px 28px", borderRadius: 4, background: `linear-gradient(90deg, ${G}, #18B85F)`, fontFamily: "Inter", fontWeight: 800, fontSize: 44, color: "#03170A", boxShadow: "0 0 40px rgba(34,227,122,.5)" }}>NFP pe profit</div>
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 48%, transparent 58%, rgba(0,0,0,.55) 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an6/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.14 }} />
  </AbsoluteFill>
);
