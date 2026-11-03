// Anfaal reel (75 s), two halves:
// Part 1 (0–35 s) "emotional": cinematic film look from the client's reference: muted grade, grain,
//   letterbox bars, slow push, one word at a time (small caps lead + big condensed keyword), Einaudi.
// Switch (35.0 s): sunglasses land -> light bloom, grade turns into the premium world, beat drops.
// Part 2 (35–75 s) "Forex Premium Motion": green glass world, two-tier keywords, glass cards,
//   normal captions in a pill, b-roll as graded full screens, God's Plan instrumental.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CandleRain, FogWipe, K, TwoTier, World, clamp, easeIn, easeInOut, easeOut, mix, p, rnd } from "./design";

const FPS = 30;
export const AN_DURATION = 75.0;
export const AN_FRAMES = Math.round(AN_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
export const SWITCH = 35.0;

/* ---------------------------------------------------------------- transcript (Roman Urdu) */
const SPEECH: [number, number, string][] = [
  [0.15, 2.25, "maine kabhi socha bhi nahi tha ke"],
  [2.42, 3.15, "mere saath"],
  [3.29, 4.49, "aisa ho jayega"],
  [5.02, 7.31, "how forex trading changed my life"],
  [7.61, 9.13, "yahin se do saal pehle"],
  [10.04, 10.89, "thoda peeche jaayein"],
  [11.35, 14.31, "toh main 20-30 hazaar ki job karta tha"],
  [15.1, 15.72, "aur"],
  [15.99, 18.38, "mahine ke end mein meri yeh khwahish hoti thi"],
  [18.38, 21.32, "ke kabhi main ek lakh rupay bana loon"],
  [22.17, 24.07, "aur har mard"],
  [24.28, 27.34, "har larke ki aur har bache ki yehi khwahish hoti hai ke"],
  [27.61, 28.62, "achi gaari le"],
  [29.05, 29.93, "acha ghar le"],
  [30.17, 31.75, "apni khwahishaat poori kare"],
  [32.06, 34.7, "aur ab aisa time aa gaya hai ke din ke"],
  [34.7, 37.53, "3 lakh rupay banana koi mushkil baat nahi, woh bhi"],
  [37.53, 40.02, "forex market se. toh yeh hoti hai"],
  [40.02, 43.58, "skill ki power. agar aap aisa banana chahte ho"],
  [44.15, 46.08, "upar community ka link hai, main challenge"],
  [46.08, 49.29, "start karne ja raha hoon jahan chhoti si equity ke saath"],
  [49.29, 52.12, "aap apne accounts ko double karoge, grow karoge"],
  [52.25, 53.96, "aur acha paisa banaoge"],
  [54.2, 56.49, "aur yeh koi manjan nahi hai, yeh cheezein maine"],
  [56.49, 58.7, "dairh saal mein seekhi hain"],
  [58.9, 60.43, "experience le ke seekhiye"],
  [60.6, 62.76, "apna waqt laga ke seekhiye, apne hard"],
  [62.76, 65.02, "times laga ke seekhiye. overnight success nahi hai"],
  [65.02, 67.4, "agar aap waqai paisa banana chahte ho"],
  [67.93, 71.34, "upar community ka link hai, join karna mat bhooliyega"],
  [71.51, 72.46, "idhar mention hoga"],
  [72.76, 74.12, "wahan pe contact kar sakte ho"],
];
type Word = { w: string; t0: number; t1: number };
const WORDS: Word[][] = SPEECH.map(([a, b, text]) => {
  const ws = text.split(" ");
  const total = ws.reduce((n, w) => n + w.length + 1, 0);
  let acc = a;
  return ws.map((w) => {
    const d = ((w.length + 1) / total) * (b - a);
    const o = { w, t0: acc, t1: acc + d };
    acc += d;
    return o;
  });
});

/* ---------------------------------------------------------------- windows */
// part-1 b-roll (shop: the struggle) – two slices with a soft dissolve between them
const SHOP = [
  { from: 9.9, to: 15.6, src: 0.4 },
  { from: 15.6, to: 21.5, src: 8.6 },
];
// part-2 full screens
const FS = {
  car: { from: 37.5, to: 42.0 },
  challenge: { from: 44.1, to: 52.2 },
  cash: { from: 52.2, to: 54.25 },
  lessons: { from: 58.85, to: 65.05 },
};
const inFS = (t: number) => Object.values(FS).some((w) => t >= w.from && t < w.to);

/* ---------------------------------------------------------------- part 1: film look */
const Grain: React.FC<{ o?: number }> = ({ o = 0.09 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("an/grain.png")})`,
        backgroundSize: "512px 512px",
        backgroundPosition: `${Math.floor(rnd(f) * 512)}px ${Math.floor(rnd(f + 99) * 512)}px`,
        mixBlendMode: "overlay",
        opacity: o,
      }}
    />
  );
};
/** muted, warm-teal film grade layered on top of the footage (no backdrop-filter) */
const FilmTone: React.FC<{ o: number }> = ({ o }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,60,70,.35) 0%, rgba(40,40,40,0) 45%, rgba(90,60,30,.30) 100%)", mixBlendMode: "soft-light", opacity: o }} />
    <AbsoluteFill style={{ background: "radial-gradient(110% 75% at 50% 45%, transparent 45%, rgba(0,0,0,.72) 100%)", opacity: o }} />
  </>
);
const Bars: React.FC<{ o: number }> = ({ o }) => {
  const f = useCurrentFrame();
  const h = 120 * p(f, 0, 30, easeInOut) * o;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "#000" }} />
    </>
  );
};

const BIG = new Set(["socha", "aisa", "forex", "life", "pehle", "job", "khwahish", "lakh", "mard", "gaari", "ghar", "khwahishaat", "time", "20-30"]);
/** reference-style captions: one word at a time; big words land in condensed caps with the small lead above */
const FilmWords: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t >= SWITCH - 0.25) return null;
  let cur: { w: Word; lead: string[]; ci: number } | null = null;
  WORDS.forEach((ws, ci) =>
    ws.forEach((w, i) => {
      if (t >= w.t0 - 0.04 && t < Math.max(w.t1, w.t0 + 0.28) + 0.12) {
        const lead: string[] = [];
        if (BIG.has(w.w)) for (let k = i - 1; k >= 0 && lead.length < 2 && !BIG.has(ws[k].w); k--) lead.unshift(ws[k].w);
        cur = { w, lead, ci };
      }
    }),
  );
  if (!cur) return null;
  const c = cur as { w: Word; lead: string[]; ci: number };
  const big = BIG.has(c.w.w);
  const a = p(f, s(c.w.t0) - 1, 5);
  const onShop = SHOP.some((x) => t >= x.from && t < x.to);
  const top = onShop ? 1260 : 330;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: a, filter: `blur(${(1 - a) * 6}px)`, transform: `translateY(${(1 - a) * 10}px)` }}>
      {big && c.lead.length ? (
        <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 30, letterSpacing: 6, color: "rgba(255,255,255,.82)", textTransform: "uppercase", marginBottom: 6 }}>{c.lead.join(" ")}</div>
      ) : null}
      <div
        style={
          big
            ? { fontFamily: "Anton", fontSize: 150, lineHeight: 1, color: "#F4F1EA", textTransform: "uppercase", letterSpacing: 1, textShadow: "0 6px 40px rgba(0,0,0,.55)" }
            : { fontFamily: "Inter", fontWeight: 600, fontSize: 52, color: "#F4F1EA", textTransform: "uppercase", letterSpacing: 4, textShadow: "0 4px 24px rgba(0,0,0,.6)" }
        }
      >
        {c.w.w}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- speaker */
const SWITCH_F = s(SWITCH);
const part1Mix = (f: number) => 1 - interpolate(f, [SWITCH_F - 6, SWITCH_F + 4], [0, 1], clamp);
const fogAt = (f: number) =>
  Math.max(
    0,
    ...[...Object.values(FS).flatMap((w) => [w.from, w.to]), ...SHOP.flatMap((w) => [w.from, w.to]), SWITCH].map((x) =>
      interpolate(f, [s(x) - 10, s(x), s(x) + 10], [0, 1, 0], { ...clamp, easing: easeInOut }),
    ),
  );
const Speaker: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const m = part1Mix(f);
  // part 1: slow push 1.00 -> 1.06 ; part 2: settle from 1.05 and creep slowly
  const push = t < SWITCH ? mix(p(f, 0, SWITCH_F, easeInOut), 1.0, 1.06) : interpolate(t - SWITCH, [0, 0.8, 40], [1.05, 1.0, 1.03], { ...clamp, easing: easeInOut });
  const grade = `saturate(${mix(m, 1.02, 0.5)}) contrast(${mix(m, 1.04, 1.14)}) brightness(${mix(m, 1, 0.9)}) sepia(${0.12 * m})`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", filter: `blur(${fogAt(f) * 22}px)` }}>
      <AbsoluteFill style={{ transform: `translateY(-230px) scale(${1.12 * push * (1 + fogAt(f) * 0.03)})`, transformOrigin: "540px 230px" }}>
        <OffthreadVideo src={staticFile("an/cut.mp4")} muted style={{ width: 1080, height: 1920, filter: grade }} />
      </AbsoluteFill>
      {/* part 2: dark band above the head for keywords/cards, faint green tone */}
      <AbsoluteFill style={{ opacity: 1 - m, background: "linear-gradient(180deg, rgba(3,10,6,.70) 0%, rgba(3,10,6,.38) 20%, rgba(3,10,6,0) 30%)" }} />
      <AbsoluteFill style={{ opacity: (1 - m) * 0.22, background: `radial-gradient(120% 80% at 50% 40%, transparent 50%, ${K.deep} 100%)` }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- b-roll */
const BRoll: React.FC<{ src: string; from: number; to: number; at?: number; mode: "film" | "premium"; push?: [number, number] }> = ({ src, from, to, at = 0, mode, push = [1.0, 1.07] }) => {
  const dur = s(to) - s(from);
  return (
    <Sequence from={s(from)} durationInFrames={dur}>
      <BRollInner src={src} dur={dur} at={at} mode={mode} push={push} />
    </Sequence>
  );
};
const BRollInner: React.FC<{ src: string; dur: number; at: number; mode: "film" | "premium"; push: [number, number] }> = ({ src, dur, at, mode, push }) => {
  const f = useCurrentFrame();
  const o = p(f, 0, 10, easeInOut) * (1 - p(f, dur - 10, 10, easeInOut));
  const fog = Math.max(interpolate(f, [0, 10], [1, 0], clamp), interpolate(f, [dur - 10, dur], [0, 1], clamp));
  const sc = mix(p(f, 0, dur, easeInOut), push[0], push[1]) * (1 + fog * 0.04);
  const grade = mode === "film" ? "saturate(.5) contrast(1.16) brightness(.86) sepia(.14)" : "saturate(.82) contrast(1.12) brightness(.9) hue-rotate(-6deg)";
  return (
    <AbsoluteFill style={{ opacity: o, filter: `blur(${fog * 18}px)`, backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${sc})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={s(at)} muted style={{ width: 1080, height: 1920, filter: grade }} />
      </AbsoluteFill>
      {mode === "premium" ? (
        <>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(3,10,6,.55) 0%, rgba(6,23,15,.0) 35%, rgba(6,23,15,.15) 55%, rgba(3,10,6,.85) 100%)` }} />
          <AbsoluteFill style={{ background: "rgba(18,128,72,.16)", mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 50%, rgba(0,0,0,.6) 100%)" }} />
        </>
      ) : (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)" }} />
      )}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- part 2: captions */
type Line = { words: Word[]; t0: number; t1: number };
const LINES: Line[] = WORDS.flatMap((timed) => {
  const out: Line[] = [];
  const nLines = Math.max(1, Math.ceil(timed.length / 4));
  const per = Math.ceil(timed.length / nLines);
  for (let i = 0; i < timed.length; i += per) {
    const chunk = timed.slice(i, i + per);
    out.push({ words: chunk, t0: chunk[0].t0, t1: chunk[chunk.length - 1].t1 });
  }
  return out;
}).filter((l) => l.t0 >= SWITCH - 0.05);
const HOT = new Set(["3", "lakh", "forex", "market", "skill", "power", "community", "challenge", "equity", "double", "grow", "paisa", "manjan", "dairh", "saal", "experience", "waqt", "hard", "times", "overnight", "success", "waqai", "join", "contact"]);
const NormalCaptions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.05 && t < (LINES[k + 1]?.t0 ?? l.t1 + 0.6) && t < l.t1 + 0.6);
  if (i < 0) return null;
  const line = LINES[i];
  const inT = p(f, s(line.t0) - 2, 6);
  const end = Math.min(LINES[i + 1]?.t0 ?? line.t1 + 0.6, line.t1 + 0.6);
  const outT = p(f, s(end) - 4, 4, easeIn);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: inFS(t) ? 1470 : 1452, display: "flex", justifyContent: "center", opacity: inT * (1 - outT) }}>
      <div style={{ padding: "16px 30px", borderRadius: 22, background: "rgba(6,18,12,.66)", border: "1px solid rgba(156,255,201,.12)", boxShadow: "0 12px 30px rgba(0,0,0,.25)", transform: `translateY(${(1 - inT) * 10}px)`, display: "flex", gap: 12, maxWidth: 940 }}>
        {line.words.map((w, k) => {
          const on = t >= w.t0;
          const hot = HOT.has(w.w.replace(/[.,?]/g, "").toLowerCase());
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 46, letterSpacing: -0.5, whiteSpace: "nowrap", color: on ? (hot ? K.hue : K.white) : "rgba(243,247,244,.45)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- part 2: keyword captions on the speaker */
type Cap = { t: number; to: number; lead: string; key: string; tone?: "hue" | "gold" | "red" | "white" };
const CAPS: Cap[] = [
  { t: 35.0, to: 37.45, lead: "ab din ke", key: "3 lakh rupay" },
  { t: 42.0, to: 44.1, lead: "aap bhi aisa", key: "banana chahte ho?", tone: "white" },
  { t: 54.25, to: 56.5, lead: "yeh koi", key: "manjan nahi", tone: "white" },
  { t: 56.5, to: 58.85, lead: "dairh saal ki", key: "mehnat" },
  { t: 65.05, to: 67.85, lead: "waqai paisa", key: "banana hai?" },
  { t: 71.4, to: 74.6, lead: "wahan pe", key: "contact karo" },
];
const KeywordCaptions: React.FC = () => (
  <>
    {CAPS.map((c) => (
      <Sequence key={c.t} from={s(c.t)} durationInFrames={s(c.to) - s(c.t)} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 285, display: "flex", justifyContent: "center" }}>
          <TwoTier lead={c.lead} keyword={c.key} at={0} out={s(c.to) - s(c.t)} variant="C" tone={c.tone ?? "hue"} scale={0.74} />
        </div>
      </Sequence>
    ))}
  </>
);

/* ---------------------------------------------------------------- part 2: full screens */
const Beat: React.FC<{ from: number; to: number; base: number; lead: string; keyword: string; y: number; tone?: "hue" | "gold" | "red" | "white"; sc?: number }> = ({ from, to, base, lead, keyword, y, tone = "hue", sc = 0.86 }) => (
  <Sequence from={s(from - base)} durationInFrames={s(to - from)} layout="none">
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <TwoTier lead={lead} keyword={keyword} at={0} out={s(to - from)} variant="C" tone={tone} scale={sc} />
    </div>
  </Sequence>
);

/** illustrative equity curve: small account doubling */
const EquityCard: React.FC<{ draw: number; on2x: number }> = ({ draw, on2x }) => {
  const W = 860;
  const H = 520;
  const n = 60;
  const pts = Array.from({ length: n }, (_, i) => {
    const x = i / (n - 1);
    const v = 1 + x * x * 1.05 + (rnd(i * 2 + 5) - 0.5) * 0.09 * (0.4 + x);
    return v;
  });
  const shown = Math.max(2, Math.floor(n * draw));
  const y = (v: number) => H - 60 - ((v - 0.9) / 1.3) * (H - 150);
  const xs = (i: number) => 40 + (i / (n - 1)) * (W - 200);
  const path = pts.slice(0, shown).map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = pts[shown - 1];
  return (
    <div style={{ position: "relative", width: W, height: H, borderRadius: 40, background: "linear-gradient(160deg, rgba(60,140,100,.26), rgba(10,30,20,.62))", border: "1.5px solid rgba(156,255,201,.22)", boxShadow: "0 40px 90px rgba(0,0,0,.55), 0 0 60px rgba(47,210,126,.12)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 36, top: 28, fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 6, color: K.soft }}>ACCOUNT GROWTH · CHALLENGE</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="eqf" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={K.hue} stopOpacity={0.35} />
            <stop offset="1" stopColor={K.hue} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[1, 1.5, 2].map((v) => (
          <g key={v}>
            <line x1={40} x2={W - 160} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,.08)" strokeDasharray={v === 2 ? "8 6" : undefined} />
            <text x={W - 140} y={y(v) + 8} fontFamily="JetBrains Mono" fontSize={24} fill={v === 2 ? K.hue : "#7D8A84"}>
              {v === 1 ? "1X" : v === 1.5 ? "1.5X" : "2X"}
            </text>
          </g>
        ))}
        <path d={`${path} L${xs(shown - 1)},${H - 60} L40,${H - 60} Z`} fill="url(#eqf)" />
        <path d={path} fill="none" stroke={K.hue} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${K.glow})` }} />
        <circle cx={xs(shown - 1)} cy={y(last)} r={11} fill={K.hueLight} />
      </svg>
      <div style={{ position: "absolute", right: 30, top: 96, opacity: on2x, transform: `translateY(${(1 - on2x) * 20}px)`, padding: "10px 22px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, fontFamily: "Anton", fontSize: 40, color: "#03140B", letterSpacing: 1 }}>
        DOUBLE
      </div>
    </div>
  );
};
const Challenge: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.challenge.from;
  const a = p(f, 4, 18);
  return (
    <World focusY={40}>
      <CandleRain speed={0.25} count={7} />
      <div style={{ position: "absolute", left: 110, top: 300, opacity: a, transform: `translateY(${(1 - a) * 40 + Math.sin(f / 40) * 4}px) scale(${mix(a, 0.96, 1) * mix(p(f, 0, s(8), easeInOut), 1, 1.04)})`, filter: `blur(${(1 - a) * 8}px)` }}>
        <EquityCard draw={p(f, s(46.1 - B), s(5.2), easeInOut)} on2x={p(f, s(49.6 - B), 16)} />
      </div>
      <Beat from={44.15} to={46.1} base={B} lead="upar community link" keyword="challenge" y={1030} />
      <Beat from={46.1} to={49.3} base={B} lead="chhoti si" keyword="equity se" y={1030} tone="white" />
      <Beat from={49.3} to={52.2} base={B} lead="accounts karo" keyword="double" y={1030} />
    </World>
  );
};

const LIcon: React.FC<{ kind: "eye" | "clock" | "storm"; color: string }> = ({ kind, color }) => (
  <svg width={84} height={84} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    {kind === "eye" ? (
      <>
        <path d="M4 24 C10 13 18 9 24 9 C30 9 38 13 44 24 C38 35 30 39 24 39 C18 39 10 35 4 24 Z" />
        <circle cx={24} cy={24} r={7} />
      </>
    ) : kind === "clock" ? (
      <>
        <circle cx={24} cy={24} r={17} />
        <path d="M24 14 V24 L31 29" />
      </>
    ) : (
      <>
        <path d="M14 30 H35 A8 8 0 0 0 34 14 A11 11 0 0 0 13 17 A7 7 0 0 0 14 30 Z" />
        <path d="M24 32 L20 40 H26 L22 46" />
      </>
    )}
  </svg>
);
const LessonCard: React.FC<{ icon: "eye" | "clock" | "storm"; n: string; title: string; at: number; y: number; dim?: number }> = ({ icon, n, title, at, y, dim = 0 }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 20, easeOut);
  return (
    <div style={{ position: "absolute", left: 120, top: y, width: 840, opacity: a * (1 - dim * 0.5), transform: `translateX(${(1 - a) * 160}px)`, filter: `blur(${(1 - a) * 8 + dim * 1.5}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30, padding: "24px 34px", borderRadius: 40, background: "linear-gradient(160deg, rgba(60,140,100,.28), rgba(10,30,20,.55))", border: "1.5px solid rgba(156,255,201,.2)", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
        <div style={{ width: 128, height: 128, borderRadius: 32, background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.12), rgba(255,255,255,.03))", border: `2px solid ${K.hue}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${K.glow}` }}>
          <LIcon kind={icon} color={K.hue} />
        </div>
        <div>
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 6, color: K.hue }}>{n} · SEEKHIYE</div>
          <div style={{ fontFamily: "Anton", fontSize: 76, color: K.white, letterSpacing: 1, lineHeight: 1.05, textTransform: "uppercase" }}>{title}</div>
        </div>
      </div>
    </div>
  );
};
const Lessons: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.lessons.from;
  const t2 = s(60.6 - B);
  const t3 = s(62.2 - B);
  const t4 = s(63.6 - B);
  const strike = p(f, t4 + 14, 16, easeInOut);
  const camY = interpolate(f, [0, t2, t3, t4], [150, 70, 0, -40], { ...clamp, easing: easeInOut });
  return (
    <World focusY={42}>
      <CandleRain speed={0.25} count={7} />
      <AbsoluteFill style={{ transform: `translateY(${camY}px)` }}>
        <LessonCard icon="eye" n="01" title="Experience" at={4} y={330} dim={p(f, t2, 24)} />
        <LessonCard icon="clock" n="02" title="Apna waqt" at={t2} y={560} dim={p(f, t3, 24)} />
        <LessonCard icon="storm" n="03" title="Hard times" at={t3} y={790} dim={p(f, t4, 24)} />
      </AbsoluteFill>
      <Sequence from={t4} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 1050, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <TwoTier lead="yeh" keyword="overnight success" at={0} variant="C" tone="white" scale={0.66} />
            <div style={{ position: "absolute", left: -10, right: -10, top: 118, height: 10, borderRadius: 5, background: K.red, transformOrigin: "left center", transform: `scaleX(${strike})`, boxShadow: "0 0 18px rgba(255,95,102,.5)" }} />
          </div>
        </div>
      </Sequence>
      <Beat from={58.9} to={60.6} base={B} lead="khud" keyword="seekhiye" y={1080} />
      <Beat from={60.6} to={63.6} base={B} lead="waqt aur" keyword="hard times" y={1080} tone="white" />
    </World>
  );
};

/** JOIN button card above the head (CTA) */
const JoinCard: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = p(f, 0, 18, easeOut);
  const b = p(f, dur - 14, 14, easeIn);
  const click = p(f, 54, 8) * (1 - p(f, 62, 10));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: a * (1 - b), transform: `translateY(${(1 - a) * 40 - b * 30 + Math.sin(f / 40) * 4}px)`, filter: `blur(${(1 - a) * 8 + b * 8}px)` }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: K.soft }}>LINK UPAR HAI</div>
      <div style={{ position: "relative", transform: `scale(${1 - click * 0.04})` }}>
        <div style={{ padding: "24px 58px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, color: "#03140B", fontFamily: "Anton", fontSize: 54, letterSpacing: 2, boxShadow: `0 20px 50px ${K.glow}, inset 0 2px 0 rgba(255,255,255,.5)` }}>JOIN COMMUNITY ↑</div>
        <svg width={44} height={54} viewBox="0 0 22 27" style={{ position: "absolute", left: mix(p(f, 30, 20, easeInOut), 520, 380), top: mix(p(f, 30, 20, easeInOut), 150, 60), opacity: p(f, 30, 6), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
          <path d="M1 1 L1 21 L6 16.5 L9.5 25 L13 23.5 L9.5 15.5 L16 15.5 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Full: React.FC<{ w: { from: number; to: number }; children: React.ReactNode }> = ({ w, children }) => {
  const dur = s(w.to) - s(w.from);
  return (
    <Sequence from={s(w.from)} durationInFrames={dur}>
      <FullFade dur={dur}>{children}</FullFade>
    </Sequence>
  );
};
const FullFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = p(f, 0, 9) * (1 - p(f, dur - 9, 9));
  const fog = Math.max(interpolate(f, [0, 10], [1, 0], clamp), interpolate(f, [dur - 10, dur], [0, 1], clamp));
  return <AbsoluteFill style={{ opacity: o, filter: `blur(${fog * 18}px)`, transform: `scale(${1 + fog * 0.04})` }}>{children}</AbsoluteFill>;
};

/** the switch: warm film bloom -> green-white light, opening into the premium world */
const SwitchFlash: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [SWITCH_F - 8, SWITCH_F, SWITCH_F + 16], [0, 1, 0], { ...clamp, easing: easeInOut });
  if (t <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(80% 60% at 50% 45%, rgba(255,255,250,${0.9 * t}) 0%, rgba(160,240,195,${0.6 * t}) 45%, rgba(10,40,25,${0.5 * t}) 100%)` }} />;
};

const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 1 }) => (
  <Sequence from={Math.max(0, s(at))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`an/sfx/${src}.wav`)} volume={vol} />
  </Sequence>
);

export const AnfaalReel: React.FC = () => {
  const f = useCurrentFrame();
  const m = part1Mix(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("an/cut.mp4")} />
      <Audio src={staticFile("an/music.wav")} volume={(fr) => Math.min(1, fr / 6) * Math.min(1, (AN_FRAMES - fr) / 30)} />
      <Speaker />
      {/* part 1 b-roll: the struggle */}
      {SHOP.map((x) => (
        <BRoll key={x.from} src="an/shop.mp4" from={x.from} to={x.to} at={x.src} mode="film" push={[1.02, 1.08]} />
      ))}
      {/* part 2 */}
      <KeywordCaptions />
      <Sequence from={s(67.9)} durationInFrames={s(71.4) - s(67.9)} layout="none">
        <JoinCard dur={s(71.4) - s(67.9)} />
      </Sequence>
      <BRoll src="an/car.mp4" from={FS.car.from} to={FS.car.to} at={2.6} mode="premium" push={[1.0, 1.06]} />
      <Sequence from={s(FS.car.from)} durationInFrames={s(FS.car.to) - s(FS.car.from)} layout="none">
        <Beat from={37.55} to={39.6} base={FS.car.from} lead="woh bhi" keyword="forex se" y={1080} />
        <Beat from={39.6} to={42.0} base={FS.car.from} lead="yeh hai" keyword="skill ki power" y={1080} tone="gold" />
      </Sequence>
      <Full w={FS.challenge}>
        <Challenge />
      </Full>
      <BRoll src="an/cash.mp4" from={FS.cash.from} to={FS.cash.to} at={0.3} mode="premium" push={[1.0, 1.05]} />
      <Sequence from={s(FS.cash.from)} durationInFrames={s(FS.cash.to) - s(FS.cash.from)} layout="none">
        <Beat from={52.25} to={54.25} base={FS.cash.from} lead="aur" keyword="acha paisa" y={1080} />
      </Sequence>
      <Full w={FS.lessons}>
        <Lessons />
      </Full>
      {Object.values(FS).map((w) => (
        <React.Fragment key={w.from}>
          <FogWipe at={s(w.from) - 9} dur={18} />
          <FogWipe at={s(w.to) - 9} dur={18} />
        </React.Fragment>
      ))}
      <NormalCaptions />
      {/* part 1 film layers (fade out at the switch) */}
      <FilmTone o={m} />
      <Grain o={0.1 * m} />
      <FilmWords />
      <Bars o={m} />
      <SwitchFlash />
      {/* sound design */}
      <Sfx at={SWITCH - 0.45} src="whoosh" vol={0.3} />
      <Sfx at={SWITCH} src="thud" vol={0.35} />
      {[...Object.values(FS).flatMap((w) => [w.from, w.to]), ...SHOP.map((x) => x.from)].map((x) => (
        <Sfx key={x} at={x - 0.3} src="whoosh" vol={0.12} />
      ))}
      <Sfx at={49.6} src="pop" vol={0.24} />
      <Sfx at={59.0} src="pop" vol={0.22} />
      <Sfx at={60.6} src="pop" vol={0.22} />
      <Sfx at={62.2} src="pop" vol={0.22} />
      <Sfx at={68.9} src="pop" vol={0.26} />
    </AbsoluteFill>
  );
};
