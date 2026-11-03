// GoldMoves design system: the client's brand (ink-green / money-green / gold) rebuilt in the
// reference's language: one-hue world, glossy 3D objects, depth of field, fog, centred
// two-tier type, physics motion and fog/blur transitions.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame } from "remotion";

loadFont({ family: "Inter", url: staticFile("fonts/Inter.woff2"), weight: "100 900" });
loadFont({ family: "Inter", url: staticFile("fonts/Inter-LightItalic.woff2"), weight: "300", style: "italic" });
loadFont({ family: "Inter", url: staticFile("fonts/Inter-Italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito-Black.woff2"), weight: "900" });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito-ExtraBold.woff2"), weight: "800" });
loadFont({ family: "Plus Jakarta Sans", url: staticFile("fonts/PlusJakarta-ExtraBold.woff2"), weight: "800" });
loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: "Anton", url: staticFile("fonts/Anton.woff2"), weight: "400" });
loadFont({ family: "JetBrains Mono", url: staticFile("fonts/JetBrainsMono-Bold.woff2"), weight: "700" });

export const K = {
  void: "#030A06",
  deep: "#06170F",
  mid: "#0C2A1C",
  hue: "#2FD27E",
  hueLight: "#9CFFC9",
  hueDeep: "#128048",
  glow: "rgba(47,210,126,0.45)",
  white: "#F3F7F4",
  soft: "rgba(243,247,244,0.72)",
  gold: "#E8C77F",
  goldLight: "#FFF1C9",
  goldDeep: "#9C7330",
  red: "#FF5F66",
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const p = (f: number, a: number, d: number, e = easeOut) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: e });
export const mix = (t: number, a: number, b: number) => a + (b - a) * t;
export const rnd = (i: number) => Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
/** soft physical spring (small overshoot, settles) */
export const spr = (f: number, at: number, stiffness = 120, damping = 14, mass = 0.9) =>
  spring({ frame: f - at, fps: 30, config: { stiffness, damping, mass } });

/* ---------------------------------------------------------------- world */

/** One-hue ground: deep green radial, drifting fog banks, dust, vignette. */
export const World: React.FC<{ children?: React.ReactNode; focusY?: number; fog?: number }> = ({ children, focusY = 46, fog = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% ${focusY}%, ${K.mid} 0%, ${K.deep} 45%, ${K.void} 100%)`, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 1400,
            height: 520,
            left: -160 + Math.sin(f / (90 + i * 30) + i) * 120,
            top: 1150 + i * 220 + Math.cos(f / (110 + i * 20)) * 30,
            borderRadius: "50%",
            background: `radial-gradient(50% 50% at 50% 50%, rgba(80,220,150,${0.1 * fog}) 0%, rgba(80,220,150,0) 100%)`,
            filter: "blur(30px)",
          }}
        />
      ))}
      <Dust />
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 40 }, (_, i) => {
        const x = rnd(i) * 1080;
        const y = (rnd(i + 7) * 1920 - f * (0.4 + rnd(i + 3) * 0.8)) % 1920;
        const s = 2 + rnd(i + 11) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(f / 40 + i) * 10,
              top: y < 0 ? y + 1920 : y,
              width: s,
              height: s,
              borderRadius: s,
              background: K.hueLight,
              opacity: 0.12 + rnd(i + 5) * 0.25,
              filter: `blur(${rnd(i + 9) * 3}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Vertical glass candles streaming past at different depths (reference's DOF bars). */
export const CandleRain: React.FC<{ speed?: number; tint?: string; count?: number }> = ({ speed = 1, tint = K.hue, count = 14 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const depth = rnd(i + 2); // 0 far .. 1 near
        const x = rnd(i) * 1080;
        const h = 120 + rnd(i + 4) * 260;
        const v = (1.5 + depth * 5) * speed;
        const y = ((rnd(i + 6) * 2400 + f * v) % 2400) - 300;
        const w = 14 + depth * 26;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.25 + depth * 0.5, filter: `blur(${(1 - depth) * 6 + (depth > 0.85 ? 4 : 0)}px)` }}>
            <div style={{ position: "absolute", left: w / 2 - 1, top: -60, width: 2, height: h + 120, background: tint, opacity: 0.6 }} />
            <div style={{ width: w, height: h, borderRadius: 6, background: `linear-gradient(90deg, ${tint}, ${K.hueLight} 45%, ${tint})`, boxShadow: `0 0 24px ${K.glow}` }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3D objects */

/** True CSS-3D gold coin: stacked edge layers + embossed faces. rx/ry in degrees. */
export const Coin: React.FC<{ size: number; rx?: number; ry?: number; rz?: number; label?: string; blur?: number }> = ({
  size,
  rx = 0,
  ry = 0,
  rz = 0,
  label = "Au",
  blur = 0,
}) => {
  const thick = size * 0.09;
  const layers = 10;
  const face = (back: boolean) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        transform: `translateZ(${back ? -thick / 2 : thick / 2}px) ${back ? "rotateY(180deg)" : ""}`,
        background: `radial-gradient(circle at 34% 28%, ${K.goldLight} 0%, ${K.gold} 34%, #C79B4E 62%, ${K.goldDeep} 100%)`,
        boxShadow: `inset 0 0 0 ${size * 0.035}px rgba(255,241,201,.55), inset 0 0 ${size * 0.08}px rgba(120,80,20,.6)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backfaceVisibility: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: size * 0.11, borderRadius: "50%", border: `${size * 0.018}px solid rgba(156,115,48,.55)` }} />
      <span
        style={{
          fontFamily: "Nunito",
          fontWeight: 900,
          fontSize: size * 0.36,
          color: "#B98A3E",
          textShadow: `0 ${size * 0.01}px 0 ${K.goldLight}, 0 -${size * 0.008}px 0 rgba(90,60,15,.6)`,
          letterSpacing: -size * 0.01,
        }}
      >
        {label}
      </span>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,.55) 45%, rgba(255,255,255,0) 56%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
  return (
    <div style={{ width: size, height: size, perspective: size * 6, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div style={{ position: "relative", width: size, height: size, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
        {Array.from({ length: layers }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              transform: `translateZ(${-thick / 2 + (thick * i) / (layers - 1)}px)`,
              background: i % 2 ? "#9C7330" : "#B48640",
            }}
          />
        ))}
        {face(false)}
        {face(true)}
      </div>
    </div>
  );
};

/** CSS-3D gold bar (box). */
export const GoldBar: React.FC<{ w: number; rx?: number; ry?: number; blur?: number }> = ({ w, rx = -24, ry = 30, blur = 0 }) => {
  const d = w * 0.48;
  const h = w * 0.26;
  const faceStyle = (bg: string): React.CSSProperties => ({ position: "absolute", background: bg, boxShadow: "inset 0 0 0 2px rgba(255,241,201,.35)" });
  return (
    <div style={{ width: w, height: d, perspective: w * 5, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div style={{ position: "relative", width: w, height: d, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {/* top */}
        <div style={{ ...faceStyle(`linear-gradient(135deg, ${K.goldLight}, ${K.gold} 45%, #B88A42)`), width: w, height: d, transform: `rotateX(90deg) translateZ(${h / 2}px)`, top: d / 2 - d / 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: w * 0.1, color: "#A57A35", letterSpacing: w * 0.01 }}>999.9 GOLD</span>
        </div>
        {/* front */}
        <div style={{ ...faceStyle(`linear-gradient(180deg, #F0D08E, #B48640)`), width: w, height: h, transform: `translateZ(${d / 2}px)`, top: d / 2 - h / 2 }} />
        {/* back */}
        <div style={{ ...faceStyle("#8E672B"), width: w, height: h, transform: `rotateY(180deg) translateZ(${d / 2}px)`, top: d / 2 - h / 2 }} />
        {/* sides */}
        <div style={{ ...faceStyle(`linear-gradient(180deg, #D9B26A, #9C7330)`), width: d, height: h, left: w / 2 - d / 2, top: d / 2 - h / 2, transform: `rotateY(90deg) translateZ(${w / 2}px)` }} />
        <div style={{ ...faceStyle(`linear-gradient(180deg, #C9A05A, #8E672B)`), width: d, height: h, left: w / 2 - d / 2, top: d / 2 - h / 2, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }} />
      </div>
    </div>
  );
};

/** Frosted glass card with soft depth (reference's rounded frames). */
export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      borderRadius: 44,
      background: "linear-gradient(160deg, rgba(60,140,100,.30) 0%, rgba(20,60,40,.35) 60%, rgba(10,30,20,.45) 100%)",
      border: "1.5px solid rgba(156,255,201,.22)",
      boxShadow: "0 40px 90px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12), 0 0 60px rgba(47,210,126,.12)",
      backdropFilter: "blur(10px)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------------------------------------------------------- typography */

export type TypeVariant = "A" | "B" | "C";

/**
 * Centred two-tier type: a small lead-in line over one bold keyword line.
 * Lead supports _italic_ segments. Words reveal from blur to sharp with a slight rise,
 * staggered; the keyword lands last with a soft glow. Exit = blur + lift.
 */
export const TwoTier: React.FC<{
  lead: string;
  keyword: string;
  at?: number;
  out?: number;
  variant?: TypeVariant;
  tone?: "hue" | "gold" | "red" | "white";
  scale?: number;
}> = ({ lead, keyword, at = 0, out = 9999, variant = "A", tone = "hue", scale = 1 }) => {
  const f = useCurrentFrame();
  const exitT = p(f, out - 8, 8, easeIn);
  const grad = {
    hue: `linear-gradient(180deg, ${K.hueLight} 0%, ${K.hue} 70%, ${K.hueDeep} 100%)`,
    gold: `linear-gradient(180deg, ${K.goldLight} 0%, ${K.gold} 60%, ${K.goldDeep} 100%)`,
    red: `linear-gradient(180deg, #FFD0D2 0%, ${K.red} 70%, #B9353B 100%)`,
    white: `linear-gradient(180deg, #FFFFFF 0%, #D9E4DD 100%)`,
  }[tone];
  const glowC = { hue: K.glow, gold: "rgba(232,199,127,.45)", red: "rgba(255,95,102,.45)", white: "rgba(255,255,255,.3)" }[tone];

  const leadStyle: React.CSSProperties =
    variant === "A"
      ? { fontFamily: "Inter", fontWeight: 300, fontStyle: "italic", fontSize: 46 * scale, color: K.soft, letterSpacing: -0.5 }
      : variant === "B"
        ? { fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 62 * scale, color: K.soft }
        : { fontFamily: "Inter", fontWeight: 600, fontSize: 30 * scale, color: K.soft, letterSpacing: 8, textTransform: "uppercase" };
  const keyStyle: React.CSSProperties =
    variant === "A"
      ? { fontFamily: "Nunito", fontWeight: 900, fontSize: 112 * scale, letterSpacing: -2, lineHeight: 1.02 }
      : variant === "B"
        ? { fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 104 * scale, letterSpacing: -3, lineHeight: 1.02 }
        : { fontFamily: "Anton", fontWeight: 400, fontSize: 150 * scale, letterSpacing: 1, lineHeight: 1, textTransform: "uppercase" };

  const leadWords = lead.split(" ");
  const keyWords = keyword.split(" ");
  const word = (w: string, i: number, base: number, isKey: boolean) => {
    const ital = w.startsWith("_") && w.endsWith("_");
    const txt = ital ? w.slice(1, -1) : w;
    const t = p(f, base + i * 3, 12);
    const s = isKey ? spr(f, base + i * 3, 150, 15) : t;
    return (
      <span
        key={i}
        style={{
          display: "inline-block",
          marginRight: isKey ? 0.22 * (keyStyle.fontSize as number) : 0.26 * (leadStyle.fontSize as number),
          opacity: t * (1 - exitT),
          transform: `translateY(${(1 - s) * (isKey ? 34 : 18) - exitT * 20}px) scale(${isKey ? mix(Math.min(s, 1.04), 0.9, 1) : 1})`,
          filter: isKey ? `blur(${(1 - t) * 10 + exitT * 10}px) drop-shadow(0 0 22px ${glowC})` : `blur(${(1 - t) * 10 + exitT * 10}px)`,
          ...(isKey
            ? { backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
            : ital
              ? { fontWeight: 500, fontStyle: "normal", color: K.white }
              : {}),
        }}
      >
        {txt}
      </span>
    );
  };
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: variant === "C" ? 10 : 2 }}>
      <div style={{ ...leadStyle, whiteSpace: "nowrap" }}>{leadWords.map((w, i) => word(w, i, at, false))}</div>
      <div style={{ ...keyStyle, whiteSpace: "nowrap" }}>{keyWords.map((w, i) => word(w, i, at + leadWords.length * 3 + 2, true))}</div>
    </div>
  );
};

/* ---------------------------------------------------------------- transitions */

/** Fog/light dissolve: a soft green-white bloom swells, blurs the outgoing scene, reveals the next. */
export const FogWipe: React.FC<{ at: number; dur?: number }> = ({ at, dur = 18 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + dur / 2, at + dur], [0, 1, 0], { ...clamp, easing: easeInOut });
  if (t <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(85% 65% at 50% 48%, rgba(225,255,238,${0.78 * t}) 0%, rgba(130,225,175,${0.55 * t}) 45%, rgba(20,70,45,${0.5 * t}) 100%)` }} />;
};
