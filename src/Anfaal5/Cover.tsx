import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { K } from "../Anfaal/design";

// Reel 5 cover — split: PKR (red, rupee notes) vs DOLLAR (green, dollar notes), the client cut out in the
// middle with a glowing seam behind him, big "PKR · YA · $" type, question line below. 3:4 safe (y 240–1680).
const RED = "#FF4D57";
/** banknote-style guilloche: many phase-shifted sine lines */
const Guilloche: React.FC<{ color: string; opacity: number; seed: number }> = ({ color, opacity, seed }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    {Array.from({ length: 34 }, (_, i) => {
      const y0 = 120 + i * 52;
      const amp = 26 + (i % 5) * 6;
      let d = `M -20 ${y0}`;
      for (let x = -20; x <= 1100; x += 20) d += ` L ${x} ${(y0 + Math.sin(x / (70 + seed * 7) + i * 0.55 + seed) * amp + Math.sin(x / 23 + i) * 4).toFixed(1)}`;
      return <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.2} />;
    })}
    {Array.from({ length: 16 }, (_, i) => (
      <circle key={"c" + i} cx={seed > 1 ? 820 : 260} cy={1150} r={90 + i * 26} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 6" />
    ))}
  </svg>
);
/** three notes fanned like a hand of cash; pivot near the shoulder */
const Fan: React.FC<{ src: string; side: "left" | "right"; tint: string }> = ({ src, side, tint }) => {
  const L = side === "left";
  const angles = L ? [48, 34, 20] : [-48, -34, -20];
  return (
    <div style={{ position: "absolute", left: L ? 330 : 750, top: 1260 }}>
      {angles.map((a, i) => (
        <div key={i} style={{ position: "absolute", left: L ? -700 : 0, top: -140, width: 700, transformOrigin: L ? "100% 50%" : "0% 50%", transform: `rotate(${a}deg)` }}>
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.65)", border: "2px solid rgba(255,241,201,.35)" }}>
            <Img src={staticFile(src)} style={{ display: "block", width: 700, filter: `brightness(${0.75 + i * 0.12}) contrast(1.08)` }} />
            <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />
            <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.3) 42%, rgba(255,255,255,0) 55%)", mixBlendMode: "screen" }} />
          </div>
        </div>
      ))}
    </div>
  );
};
const Notes: React.FC<{ src: string; x: number; y: number; w: number; rot: number; tint: string }> = ({ src, x, y, w, rot, tint }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot}deg)`, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
    <Img src={staticFile(src)} style={{ display: "block", width: w, filter: "contrast(1.1) saturate(1.1)" }} />
    <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />
    <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.35) 42%, rgba(255,255,255,0) 55%)", mixBlendMode: "screen" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: 18, boxShadow: "inset 0 0 0 2px rgba(255,241,201,.35)" }} />
  </div>
);
export const AnfaalReel5Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
    {/* left: PKR world */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 1920, clipPath: "polygon(0 0, 600px 0, 480px 1920px, 0 1920px)", background: "radial-gradient(90% 60% at 30% 40%, #5A0D12 0%, #2A0507 55%, #0D0203 100%)" }}>
      <Guilloche color="#FF9AA0" opacity={0.16} seed={1} />
    </div>
    {/* right: DOLLAR world */}
    <div style={{ position: "absolute", left: 480, top: 0, width: 600, height: 1920, clipPath: "polygon(120px 0, 600px 0, 600px 1920px, 0 1920px)", background: `radial-gradient(90% 60% at 70% 40%, ${K.hueDeep} 0%, #06301A 55%, #020C06 100%)` }}>
      <div style={{ position: "absolute", left: -480, top: 0 }}>
        <Guilloche color="#9CFFC9" opacity={0.14} seed={2} />
      </div>
    </div>
    {/* glowing seam */}
    <div style={{ position: "absolute", left: 535, top: -100, width: 10, height: 2200, transform: "rotate(3.6deg)", background: "linear-gradient(180deg, rgba(255,255,255,0), #FFFFFF 30%, #FFF1C9 60%, rgba(255,255,255,0))", boxShadow: "0 0 40px rgba(255,241,201,.8), 0 0 120px rgba(255,241,201,.4)" }} />

    {/* big fanned cash stacks, sweeping out from behind the shoulders */}
    <Fan src="an5/pkr_notes.png" side="left" tint="rgba(255,60,70,.12)" />
    <Fan src="an5/usd_notes.png" side="right" tint="rgba(47,210,126,.10)" />
    {/* big type behind the head */}
    <div style={{ position: "absolute", left: 80, top: 395, fontFamily: "Anton", fontSize: 190, lineHeight: 1, color: RED, WebkitTextStroke: "2px rgba(255,241,201,.55)", textShadow: "0 0 50px rgba(255,77,87,.55), 0 10px 30px rgba(0,0,0,.6)" }}>PKR</div>
    <div style={{ position: "absolute", right: 110, top: 395, fontFamily: "Anton", fontSize: 190, lineHeight: 1, color: K.hue, WebkitTextStroke: "2px rgba(255,241,201,.55)", textShadow: `0 0 50px ${K.glow}, 0 10px 30px rgba(0,0,0,.6)` }}>$</div>

    {/* the speaker */}
    <AbsoluteFill style={{ transform: "scale(1)", transformOrigin: "540px 1920px" }}>
      <Img src={staticFile("an5/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "blur(20px) brightness(1.4) opacity(.4)" }} />
      <Img src={staticFile("an5/cover_person.png")} style={{ position: "absolute", width: 1080, height: 1920, filter: "contrast(1.06) drop-shadow(0 30px 60px rgba(0,0,0,.7))" }} />
    </AbsoluteFill>

    {/* "YA" badge on the seam */}
    <div style={{ position: "absolute", left: 540 - 75, top: 420, width: 150, height: 150, borderRadius: 85, background: "rgba(5,5,5,.88)", border: "3px solid #FFF1C9", boxShadow: "0 0 50px rgba(255,241,201,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 76, color: "#FFF1C9" }}>YA</div>

    {/* question line */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 85%, rgba(0,0,0,.6) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 38, letterSpacing: 10, color: K.white, textShadow: "0 4px 16px rgba(0,0,0,.6)" }}>AAP KIS KE PEECHE HO?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 55, margin: "0 auto", width: "fit-content", padding: "10px 28px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, fontFamily: "Anton", fontSize: 40, letterSpacing: 3, color: "#03140B" }}>COMMENT KARO ↓</div>
    </div>
    {/* premium finish: light streaks, vignette, film grain */}
    {[0, 1].map((i) => (
      <div key={i} style={{ position: "absolute", left: 120 + i * 560, top: -300, width: 180, height: 2600, transform: `rotate(${i ? -18 : 18}deg)`, background: "linear-gradient(180deg, rgba(255,241,201,.10), rgba(255,241,201,0) 70%)", mixBlendMode: "screen" }} />
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 42%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an5/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.16 }} />
  </AbsoluteFill>
);
