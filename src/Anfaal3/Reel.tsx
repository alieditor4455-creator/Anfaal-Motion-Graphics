// Anfaal reel 3 (70.8 s): documentary, dark tone.
// Green screen keyed (person + legs + chair kept) and composited over dark cinematic plates.
// Documentary inserts: real BBC / WSJ clippings, the Tucker Carlson post tagged CLAIM, civil-defence
// b-roll, market-crash screens, the client's own "Gold crash or trap?" post, and a cinematic gold
// chart (illustrative) telling the 3800 trap -> 3880-3890 reversal -> 4000 story.
// Forex Premium Motion grammar (two-tier type, glide, no hard cuts) in a darker palette:
// ink black, ember red for war / risk, amber for news stamps, gold for XAUUSD, green only for the reversal.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, TwoTier, clamp, easeIn, easeInOut, easeOut, mix, p, rnd } from "../Anfaal/design";

const FPS = 30;
export const R3_DURATION = 70.75;
export const R3_FRAMES = Math.round(R3_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
type Tone = "hue" | "gold" | "red" | "white";
const D = {
  ink: "#050607",
  ink2: "#0B0D0F",
  ember: "#E5484D",
  amber: "#E8A35A",
  paper: "#EDEBE6",
  soft: "rgba(237,235,230,.72)",
};

/* ---------------------------------------------------------------- transcript (Roman Urdu) */
const SPEECH: [number, number, string][] = [
  [0.22, 2.57, "duniya mein kya ho raha hai, main aap ko batata hoon"],
  [2.74, 6.1, "log mujh se pooch rahe hain, gold abhi buy kiya jaye?"],
  [6.1, 8.92, "abhi jo awaaz aa rahi hai poori duniya ki taraf se"],
  [8.92, 12.28, "nuclear ki baat hone ja rahi hai aur bunkers banane ki baatein ho rahi hain"],
  [12.44, 15.68, "Japan aur UK ke logon ko bol diya ke aap log"],
  [15.68, 17.29, "apne bunkers ready kar lein"],
  [17.5, 20.25, "ab main aap ko batata hoon ke aap ko kaam kaise karna hai"],
  [20.25, 22.85, "is market mein abhi chal kya raha hai, kahan se aap ko"],
  [22.85, 25.53, "entry karni hai, kaise trade karna hai, main bata deta hoon"],
  [25.94, 29.32, "dekhein market gir rahi thi buri tareeqe se, lekin"],
  [29.32, 33.98, "ek zone bataya tha is video ke andar, yeh video jaa ke dekhein"],
  [34.07, 36.36, "kya bola tha maine? 3800 ka level bataya"],
  [36.36, 39.44, "aur maine yeh bhi bola tha ke market abhi logon ko trap"],
  [39.44, 42.56, "kar rahi hai, logon ko dikha rahi hai ke main neeche ja rahi hoon"],
  [42.65, 44.82, "lekin 3880"],
  [44.82, 47.82, "3890 ke points se market palti hai"],
  [47.82, 50.1, "aur abhi aap dekhein"],
  [50.1, 53.0, "abhi 4000 ke level pe trade kar rahi hai"],
  [53.0, 55.23, "aisi knowledge, aisi cheezein"],
  [55.23, 57.9, "hawa mein nahi aati hain, experience le kar aati hain"],
  [57.9, 60.52, "agar aap trade karna chahte hain toh safely karein"],
  [60.52, 62.52, "din ke ek se do setup chahiye"],
  [62.52, 64.72, "toh upar community ka link hai, join karein"],
  [64.72, 67.46, "agar link open na ho toh WhatsApp, bio mein number"],
  [67.46, 70.75, "mujhe text kar dena, main aap ko free join karwa dunga"],
];
const HOT = new Set(["gold", "nuclear", "bunkers", "japan", "uk", "market", "entry", "trade", "zone", "video", "3800", "trap", "3880", "3890", "palti", "4000", "knowledge", "experience", "safely", "setup", "community", "join", "link", "whatsapp", "bio", "number", "free"]);
const RED = new Set(["nuclear", "bunkers", "gir", "trap", "neeche"]);
type Word = { w: string; t0: number; t1: number };
type Line = { words: Word[]; t0: number; t1: number };
const LINES: Line[] = SPEECH.flatMap(([a, b, text]) => {
  const ws = text.split(" ");
  const total = ws.reduce((n, w) => n + w.length + 1, 0);
  let acc = a;
  const timed: Word[] = ws.map((w) => {
    const d = ((w.length + 1) / total) * (b - a);
    const o = { w, t0: acc, t1: acc + d };
    acc += d;
    return o;
  });
  const out: Line[] = [];
  const nLines = Math.max(1, Math.ceil(timed.length / 4));
  const per = Math.ceil(timed.length / nLines);
  for (let i = 0; i < timed.length; i += per) {
    const chunk = timed.slice(i, i + per);
    out.push({ words: chunk, t0: chunk[0].t0, t1: chunk[chunk.length - 1].t1 });
  }
  return out;
});

/* ---------------------------------------------------------------- windows */
export const FS = {
  ask: { from: 2.7, to: 6.1 },
  news: { from: 6.1, to: 12.4 },
  prep: { from: 12.4, to: 17.45 },
  crash: { from: 25.9, to: 29.3 },
  post: { from: 29.3, to: 34.05 },
  chart: { from: 34.05, to: 53.0 },
};
const within = (t: number, w: { from: number; to: number }) => t >= w.from && t < w.to;
const inFS = (t: number) => Object.values(FS).some((w) => within(t, w));
const BOUNDS = Object.values(FS).flatMap((w) => [w.from, w.to]);
/** 0..1..0 around every scene change */
const cutAt = (f: number) => Math.max(0, ...BOUNDS.map((x) => interpolate(f, [s(x) - 9, s(x), s(x) + 9], [0, 1, 0], { ...clamp, easing: easeInOut })));

/* ---------------------------------------------------------------- film layers */
const Grain: React.FC<{ o?: number }> = ({ o = 0.1 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an3/grain.png")})`, backgroundSize: "512px 512px", backgroundPosition: `${Math.floor(rnd(f) * 512)}px ${Math.floor(rnd(f + 77) * 512)}px`, mixBlendMode: "overlay", opacity: o }} />;
};
const Vignette: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(115% 80% at 50% 45%, transparent 48%, rgba(0,0,0,.78) 100%)" }} />;
const Embers: React.FC<{ count?: number; color?: string }> = ({ count = 26, color = D.amber }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const x = rnd(i) * 1080 + Math.sin(f / 50 + i) * 20;
        const y = 1920 - ((rnd(i + 3) * 1920 + f * (0.6 + rnd(i + 5) * 1.4)) % 2100);
        const sz = 2 + rnd(i + 8) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: sz, background: color, opacity: 0.18 + rnd(i + 2) * 0.35, filter: `blur(${rnd(i + 4) * 2}px)`, boxShadow: `0 0 8px ${color}` }} />;
      })}
    </AbsoluteFill>
  );
};
/** warm light leak that blooms on every scene change (documentary burn dissolve) */
const LightLeak: React.FC = () => {
  const f = useCurrentFrame();
  const t = cutAt(f);
  if (t <= 0.01) return null;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(70% 45% at ${30 + 40 * rnd(Math.floor(f / 20))}% 35%, rgba(255,190,120,${0.42 * t}) 0%, rgba(229,72,77,${0.22 * t}) 40%, rgba(0,0,0,0) 75%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${0.35 * t})` }} />
    </>
  );
};
const Bars: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "#000" }} />
  </>
);

/* ---------------------------------------------------------------- dark plates behind the speaker */
const Plate: React.FC<{ src: string; at: number; from: number; to: number; tint: string; blur?: number; bright?: number }> = ({ src, at, from, to, tint, blur = 5, bright = 0.42 }) => {
  const dur = s(to) - s(from);
  return (
    <Sequence from={s(from)} durationInFrames={dur} layout="none">
      <PlateInner src={src} at={at} dur={dur} tint={tint} blur={blur} bright={bright} />
    </Sequence>
  );
};
const PlateInner: React.FC<{ src: string; at: number; dur: number; tint: string; blur: number; bright: number }> = ({ src, at, dur, tint, blur, bright }) => {
  const f = useCurrentFrame();
  const sc = mix(p(f, 0, dur, easeInOut), 1.08, 1.16);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${sc})` }}>
        <OffthreadVideo src={staticFile(src.replace("broll_war", "plate_war"))} startFrom={s(at)} muted style={{ width: 1080, height: 1920, filter: `brightness(${Math.min(1, bright * 1.7)})` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};
/** studio plate: dark room, two coloured practical lights, drifting haze */
const Studio: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 40%, #16110E 0%, ${D.ink2} 55%, ${D.ink} 100%)` }}>
      <div style={{ position: "absolute", left: -260 + Math.sin(f / 90) * 40, top: 260, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(229,72,77,.28), rgba(229,72,77,0) 70%)" }} />
      <div style={{ position: "absolute", left: 620 + Math.cos(f / 110) * 40, top: 120, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(232,163,90,.22), rgba(232,163,90,0) 70%)" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", width: 1500, height: 520, left: -210 + Math.sin(f / (120 + i * 40) + i) * 140, top: 700 + i * 300, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(255,230,210,.06), rgba(255,230,210,0) 100%)" }} />
      ))}
      {/* faint window-blind light streaks */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: -200, top: 300 + i * 90, width: 1600, height: 26, background: "linear-gradient(90deg, rgba(255,210,170,0), rgba(255,210,170,.05), rgba(255,210,170,0))", transform: "rotate(-14deg)" }} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the speaker (keyed) */
const PERSON_SCALE = 0.9;
const Speaker: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const breathe = 1 + 0.006 * Math.sin(t / 3) + 0.02 * p(f, 0, R3_FRAMES, easeInOut);
  return (
    <AbsoluteFill style={{ filter: `blur(${cutAt(f) * 16}px)` }}>
      {/* backgrounds by section */}
      <Studio />
      <Plate src="an3/broll_war.mp4" at={22} from={0} to={2.75} tint="rgba(229,72,77,.35)" blur={3} bright={0.5} />
      <Plate src="an3/broll_war.mp4" at={36} from={17.3} to={26.0} tint="rgba(232,163,90,.3)" blur={7} bright={0.3} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,.75) 100%)" }} />
      {/* rim light behind the subject */}
      <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 1000, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 40%, rgba(255,214,170,.14), rgba(255,214,170,0) 70%)" }} />
      <AbsoluteFill style={{ transform: `scale(${PERSON_SCALE * breathe})`, transformOrigin: "540px 1920px" }}>
        <OffthreadVideo src={staticFile("an3/person.mov")} transparent muted style={{ width: 1080, height: 1920, filter: "contrast(1.06) saturate(.92) brightness(.96)" }} />
      </AbsoluteFill>
      {/* floor shadow + grade */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 80%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,40,60,.18), rgba(60,30,20,.18))", mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- type + captions */
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
    <div style={{ position: "absolute", left: 0, right: 0, top: inFS(t) ? 1480 : 1500, display: "flex", justifyContent: "center", opacity: inT * (1 - outT) }}>
      <div style={{ padding: "14px 28px", borderRadius: 18, background: "rgba(5,6,7,.74)", border: "1px solid rgba(237,235,230,.12)", boxShadow: "0 12px 30px rgba(0,0,0,.4)", transform: `translateY(${(1 - inT) * 10}px)`, display: "flex", gap: 12, maxWidth: 940 }}>
        {line.words.map((w, k) => {
          const on = t >= w.t0;
          const key = w.w.replace(/[.,?]/g, "").toLowerCase();
          const col = RED.has(key) ? D.ember : HOT.has(key) ? D.amber : D.paper;
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 44, letterSpacing: -0.5, whiteSpace: "nowrap", color: on ? col : "rgba(237,235,230,.38)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
type Cap = { t: number; to: number; lead: string; key: string; tone?: Tone };
const CAPS: Cap[] = [
  { t: 0.2, to: 2.7, lead: "duniya mein", key: "kya ho raha hai?", tone: "white" },
  { t: 17.45, to: 20.25, lead: "ab suno", key: "kaam ki baat", tone: "white" },
  { t: 20.25, to: 22.85, lead: "market mein", key: "chal kya raha hai?", tone: "gold" },
  { t: 22.85, to: 25.9, lead: "entry kahan se,", key: "trade kaise?", tone: "white" },
  { t: 53.0, to: 55.23, lead: "aisi", key: "knowledge", tone: "gold" },
  { t: 55.23, to: 57.9, lead: "hawa mein nahi,", key: "experience se", tone: "white" },
  { t: 57.9, to: 60.52, lead: "trade karo magar", key: "safely", tone: "hue" },
  { t: 60.52, to: 62.52, lead: "din ke", key: "1–2 setups", tone: "gold" },
];
const KeywordCaptions: React.FC = () => (
  <>
    {CAPS.map((c) => (
      <Sequence key={c.t} from={s(c.t)} durationInFrames={s(c.to) - s(c.t)} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
          <TwoTier lead={c.lead} keyword={c.key} at={0} out={s(c.to) - s(c.t)} variant="C" tone={c.tone ?? "white"} scale={0.7} />
        </div>
      </Sequence>
    ))}
  </>
);
const Beat: React.FC<{ from: number; to: number; base: number; lead: string; keyword: string; y: number; tone?: Tone; sc?: number }> = ({ from, to, base, lead, keyword, y, tone = "white", sc = 0.78 }) => (
  <Sequence from={s(from - base)} durationInFrames={s(to - from)} layout="none">
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <TwoTier lead={lead} keyword={keyword} at={0} out={s(to - from)} variant="C" tone={tone} scale={sc} />
    </div>
  </Sequence>
);
/** typewriter location / date stamp (documentary) */
const Stamp: React.FC<{ text: string; at: number; top: number; color?: string }> = ({ text, at, top, color = D.amber }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [at, at + text.length * 1.2], [0, text.length], clamp));
  const o = p(f, at - 2, 6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 8, background: "rgba(5,6,7,.7)", border: `1px solid ${color}55` }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 10px ${color}`, opacity: 0.5 + 0.5 * Math.sin(f / 4) }} />
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 22, letterSpacing: 4, color }}>{text.slice(0, n)}</span>
      </div>
    </div>
  );
};
const Glide: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number; rot?: number }> = ({ at, dur = 99999, children, style, rise = 40, rot = 0 }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 18, easeOut);
  const b = p(f, at + dur - 14, 14, easeIn);
  return <div style={{ ...style, opacity: a * (1 - b), transform: `translateY(${(1 - a) * rise - b * 30 + Math.sin((f - at) / 45) * 4}px) rotate(${rot * a}deg) scale(${mix(a, 0.95, 1)})`, filter: `blur(${(1 - a) * 8 + b * 8}px)` }}>{children}</div>;
};
/** a real screenshot printed as a paper clipping / glass card */
const Clip: React.FC<{ src: string; w: number; crop: number; imgW: number; scroll?: number; paper?: boolean; shadow?: string }> = ({ src, w, crop, imgW, scroll = 0, paper = true, shadow = "0 40px 80px rgba(0,0,0,.7)" }) => {
  const sc = w / imgW;
  return (
    <div style={{ width: w, height: crop * sc, overflow: "hidden", borderRadius: paper ? 6 : 26, boxShadow: shadow, border: paper ? "1px solid rgba(0,0,0,.4)" : "1.5px solid rgba(237,235,230,.18)", position: "relative" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -scroll * sc, width: w, filter: paper ? "sepia(.18) contrast(1.05) brightness(.92)" : undefined }} />
      {paper ? <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(255,240,220,.08), rgba(0,0,0,.25))" }} /> : null}
    </div>
  );
};
const DarkRoom: React.FC<{ children: React.ReactNode; glow?: string }> = ({ children, glow = "rgba(229,72,77,.16)" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(80% 55% at 50% 38%, #141110 0%, ${D.ink2} 55%, ${D.ink} 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(55% 35% at 50% 35%, ${glow}, rgba(0,0,0,0) 70%)` }} />
    <Embers count={18} />
    {children}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- FS: "gold abhi buy?" */
const AskScene: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(p(f, 0, s(3.4), easeInOut), 1, 1.05);
  return (
    <DarkRoom glow="rgba(232,163,90,.16)">
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Glide at={2} rot={-3} style={{ position: "absolute", left: 270, top: 250 }}>
          <Clip src="an3/ig_post.jpg" w={540} crop={1180} imgW={736} paper={false} />
        </Glide>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(5,6,7,.92) 72%)" }} />
      <Beat from={2.75} to={6.1} base={FS.ask.from} lead="log pooch rahe hain" keyword="gold abhi buy?" y={1230} tone="gold" />
    </DarkRoom>
  );
};

/* ---------------------------------------------------------------- FS: world news + claim */
const NewsScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.news.from;
  const claimAt = s(8.92 - B);
  const camY = interpolate(f, [0, claimAt - 10, claimAt + 10, s(12.4 - B)], [0, -40, -60, -90], { ...clamp, easing: easeInOut });
  const newsOut = p(f, claimAt - 6, 14, easeIn);
  const stamp = p(f, claimAt + 14, 10, easeOut);
  return (
    <DarkRoom>
      <Plate src="an3/broll_war.mp4" at={0} from={0} to={7} tint="rgba(229,72,77,.3)" blur={8} bright={0.22} />
      <AbsoluteFill style={{ transform: `translateY(${camY}px)` }}>
        <div style={{ opacity: 1 - newsOut, filter: `blur(${newsOut * 10}px)` }}>
          <Glide at={2} rot={-4} style={{ position: "absolute", left: 60, top: 280 }}>
            <Clip src="an3/bbc.png" w={640} crop={500} imgW={826} />
          </Glide>
          <Glide at={30} rot={3} style={{ position: "absolute", left: 360, top: 640 }}>
            <Clip src="an3/wsj.png" w={660} crop={760} imgW={826} />
          </Glide>
          <Stamp text="QESHM ISLAND · STRAIT OF HORMUZ · 2 NOV 2026" at={44} top={1290} />
        </div>
        <Sequence from={claimAt - 4} layout="none">
          <Glide at={0} rot={-2} style={{ position: "absolute", left: 160, top: 300 }}>
            <div style={{ position: "relative" }}>
              <Clip src="an3/tucker.png" w={760} crop={560} imgW={426} scroll={95} paper={false} />
              <div style={{ position: "absolute", right: -16, top: -26, transform: `rotate(8deg) scale(${mix(stamp, 1.4, 1)})`, opacity: stamp, padding: "10px 22px", border: `4px solid ${D.ember}`, borderRadius: 10, background: "rgba(5,6,7,.82)", fontFamily: "Anton", fontSize: 44, letterSpacing: 4, color: D.ember }}>
                CLAIM · UNVERIFIED
              </div>
            </div>
          </Glide>
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(5,6,7,.92) 74%)" }} />
      <Beat from={6.12} to={8.92} base={B} lead="poori duniya se" keyword="ek hi awaaz" y={1200} tone="white" />
      <Beat from={8.92} to={12.4} base={B} lead="ab baat ho rahi hai" keyword="nuclear ki" y={1200} tone="red" />
    </DarkRoom>
  );
};

/* ---------------------------------------------------------------- FS: civil-defence b-roll */
const BRollFull: React.FC<{ src: string; at: number; dur: number; children?: React.ReactNode }> = ({ src, at, dur, children }) => {
  const f = useCurrentFrame();
  const sc = mix(p(f, 0, dur, easeInOut), 1.04, 1.12);
  return (
    <AbsoluteFill style={{ backgroundColor: D.ink }}>
      <AbsoluteFill style={{ transform: `scale(${sc})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={s(at)} muted style={{ width: 1080, height: 1920, filter: "saturate(.5) contrast(1.15) brightness(.82) sepia(.12)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,7,.7) 0%, rgba(5,6,7,.1) 28%, rgba(5,6,7,.1) 55%, rgba(5,6,7,.9) 80%)" }} />
      <AbsoluteFill style={{ background: "rgba(40,60,80,.2)", mixBlendMode: "soft-light" }} />
      {children}
    </AbsoluteFill>
  );
};
const PrepScene: React.FC = () => {
  const B = FS.prep.from;
  const half = s(15.0 - B);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={half + 8} layout="none">
        <BRollFull src="an3/broll_prep.mp4" at={12} dur={half + 8} />
      </Sequence>
      <Sequence from={half} layout="none">
        <XFade>
          <BRollFull src="an3/broll_prep.mp4" at={24} dur={s(17.45 - 15.0)} />
        </XFade>
      </Sequence>
      <Stamp text="CIVIL DEFENCE · BE READY" at={6} top={260} color={D.ember} />
      <Beat from={12.45} to={15.68} base={B} lead="Japan aur UK ko" keyword="warning" y={1210} tone="white" />
      <Beat from={15.68} to={17.45} base={B} lead="apne" keyword="bunkers ready" y={1210} tone="red" />
    </AbsoluteFill>
  );
};
const XFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const o = p(f, 0, 10, easeInOut);
  return <AbsoluteFill style={{ opacity: o, filter: `blur(${(1 - o) * 10}px)` }}>{children}</AbsoluteFill>;
};

/* ---------------------------------------------------------------- FS: markets crash */
const CrashScene: React.FC = () => {
  const f = useCurrentFrame();
  const shake = p(f, 20, 4) * (1 - p(f, 30, 20)) * Math.sin(f * 1.7) * 3;
  return (
    <DarkRoom glow="rgba(229,72,77,.22)">
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <Glide at={2} rot={-2} style={{ position: "absolute", left: 70, top: 270 }}>
          <Clip src="an3/stocks.png" w={700} crop={432} imgW={578} paper={false} shadow="0 40px 80px rgba(0,0,0,.7), 0 0 60px rgba(229,72,77,.25)" />
        </Glide>
        <Glide at={18} rot={3} style={{ position: "absolute", left: 380, top: 620 }}>
          <Clip src="an3/gold_silver.png" w={600} crop={532} imgW={585} paper={false} shadow="0 40px 80px rgba(0,0,0,.7), 0 0 60px rgba(229,72,77,.3)" />
        </Glide>
        <Stamp text="STOCKS · GOLD · SILVER — SELL-OFF" at={10} top={1230} color={D.ember} />
      </AbsoluteFill>
      <Beat from={25.95} to={29.3} base={FS.crash.from} lead="market gir rahi thi" keyword="buri tarah" y={1300} tone="red" sc={0.72} />
    </DarkRoom>
  );
};

/* ---------------------------------------------------------------- FS: "maine zone bataya tha" */
const PostScene: React.FC = () => {
  const f = useCurrentFrame();
  const ring = p(f, 30, 20, easeOut);
  return (
    <DarkRoom glow="rgba(232,199,127,.18)">
      <Glide at={2} style={{ position: "absolute", left: 250, top: 250 }}>
        <div style={{ position: "relative" }}>
          <Clip src="an3/ig_post.jpg" w={580} crop={1180} imgW={736} paper={false} shadow={`0 40px 80px rgba(0,0,0,.7), 0 0 70px rgba(232,199,127,.22)`} />
          {/* highlight the zone on his own post */}
          <div style={{ position: "absolute", left: -14, width: 600, top: (905 * 580) / 736, height: 70, borderRadius: 12, border: `4px solid ${K.gold}`, boxShadow: `0 0 30px rgba(232,199,127,.6)`, opacity: ring, transform: `scaleX(${mix(ring, 0.6, 1)})` }} />
          <div style={{ position: "absolute", left: 160, top: (905 * 580) / 736 + 86, opacity: ring, padding: "8px 18px", borderRadius: 999, background: K.gold, fontFamily: "Anton", fontSize: 34, color: "#1A1206", letterSpacing: 2 }}>MERA ZONE</div>
        </div>
      </Glide>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(5,6,7,.92) 76%)" }} />
      <Beat from={29.35} to={32.0} base={FS.post.from} lead="maine pehle hi" keyword="zone bataya tha" y={1280} tone="gold" sc={0.72} />
      <Beat from={32.0} to={34.05} base={FS.post.from} lead="yeh video" keyword="jaa ke dekho" y={1280} tone="white" sc={0.72} />
    </DarkRoom>
  );
};

/* ---------------------------------------------------------------- FS: the cinematic gold chart */
// illustrative path: fall into the 3800–3890 zone, fake breakdown wick (trap), reversal from 3885, rally to 4000
const PATH: number[] = (() => {
  const pts: number[] = [];
  const keys = [4085, 4060, 4030, 3990, 3955, 3930, 3905, 3890, 3872, 3848, 3884, 3893, 3915, 3940, 3962, 3978, 3992, 4002];
  keys.forEach((k, i) => {
    const nx = keys[i + 1] ?? k;
    for (let j = 0; j < 3; j++) pts.push(k + ((nx - k) * j) / 3 + (rnd(i * 7 + j) - 0.5) * 10);
  });
  return pts;
})();
const ChartScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.chart.from;
  const T = (t: number) => s(t - B);
  const W = 960;
  const H = 900;
  const lo = 3800;
  const hi = 4110;
  const y = (v: number) => 60 + ((hi - v) / (hi - lo)) * (H - 120);
  const n = PATH.length;
  const step = (W - 150) / n;
  // reveal: down to the zone by 36.4, the trap wick by 42.6, the reversal by 47.8, 4000 by 50.5
  const shown = Math.floor(
    interpolate(f, [8, T(36.4), T(39.4), T(42.6), T(47.8), T(50.6)], [3, 20, 26, 31, 42, n], { ...clamp, easing: easeInOut }),
  );
  const zoneOn = p(f, T(34.3), 18);
  const trapOn = p(f, T(36.6), 16);
  const revOn = p(f, T(42.8), 16);
  const k4 = p(f, T(50.2), 16);
  const camS = interpolate(f, [0, T(42.6), T(47.8), T(53)], [1.0, 1.05, 1.03, 1.0], { ...clamp, easing: easeInOut });
  const camX = interpolate(f, [0, T(42.6), T(53)], [0, -20, 0], { ...clamp, easing: easeInOut });
  const last = PATH[Math.max(0, shown - 1)];
  const candles = PATH.slice(0, shown).map((c, i) => {
    const o = i ? PATH[i - 1] : c + 8;
    const wick = i === 29 ? 46 : 6 + rnd(i + 3) * 10; // the trap wick
    return { o, c, h: Math.max(o, c) + 4 + rnd(i) * 6, l: Math.min(o, c) - wick };
  });
  return (
    <DarkRoom glow="rgba(232,199,127,.12)">
      <AbsoluteFill style={{ transform: `translateX(${camX}px) scale(${camS})`, transformOrigin: "50% 40%" }}>
        <Glide at={2} style={{ position: "absolute", left: 60, top: 250 }}>
          <div style={{ position: "relative", width: W, height: H, borderRadius: 26, background: "linear-gradient(180deg, #0D0F10, #08090A)", border: "1px solid rgba(237,235,230,.1)", boxShadow: "0 50px 100px rgba(0,0,0,.75)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 24, top: 16, fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#DCDAD4" }}>
              XAUUSD <span style={{ color: "#7D7A74", fontWeight: 500 }}>· GOLD SPOT · ILLUSTRATIVE</span>
            </div>
            <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
              {[3800, 3850, 3900, 3950, 4000, 4050, 4100].map((v) => (
                <g key={v}>
                  <line x1={0} x2={W - 130} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,.05)" />
                  <text x={W - 118} y={y(v) + 7} fontFamily="JetBrains Mono" fontSize={20} fill="#6F6C66">
                    {v}
                  </text>
                </g>
              ))}
              {/* 3800–3890 zone */}
              <g opacity={zoneOn}>
                <rect x={0} y={y(3890)} width={(W - 130) * mix(zoneOn, 0.3, 1)} height={y(3800) - y(3890)} fill={K.gold} opacity={0.12} />
                <line x1={0} x2={W - 130} y1={y(3890)} y2={y(3890)} stroke={K.gold} strokeDasharray="8 6" strokeWidth={2} />
                <text x={W - 130 - 18} y={y(3890) + 34} textAnchor="end" fontFamily="Inter" fontWeight={800} fontSize={24} fill={K.gold} letterSpacing={3}>
                  MERA ZONE · 3800–3890
                </text>
              </g>
              {candles.map((d, i) => {
                const up = d.c >= d.o;
                const col = up ? "#26A69A" : "#EF5350";
                const x = 20 + step * (i + 0.5);
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={2.5} />
                    <rect x={x - step * 0.32} y={y(Math.max(d.o, d.c))} width={step * 0.64} height={Math.max(3, Math.abs(y(d.o) - y(d.c)))} fill={col} rx={2} />
                  </g>
                );
              })}
              {/* trap marker */}
              <g opacity={trapOn * (1 - revOn * 0.4)}>
                <circle cx={20 + step * 29.5} cy={y(3826)} r={34} fill="none" stroke={D.ember} strokeWidth={4} />
                <text x={20 + step * 29.5 - 60} y={y(3826) + 70} fontFamily="Anton" fontSize={40} fill={D.ember} letterSpacing={2}>
                  TRAP
                </text>
              </g>
              {/* reversal arrow */}
              <g opacity={revOn}>
                <path d={`M ${20 + step * 30.5} ${y(3870)} C ${20 + step * 36} ${y(3880)}, ${20 + step * 40} ${y(3930)}, ${20 + step * 46} ${y(3985)}`} fill="none" stroke={K.hue} strokeWidth={5} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - revOn)} style={{ filter: `drop-shadow(0 0 10px ${K.glow})` }} />
              </g>
              {/* live price tag */}
              <g>
                <line x1={0} x2={W - 130} y1={y(last)} y2={y(last)} stroke={k4 > 0.5 ? K.gold : "#EF5350"} strokeDasharray="2 4" strokeWidth={1.5} />
                <rect x={W - 130} y={y(last) - 16} width={130} height={32} fill={k4 > 0.5 ? K.gold : "#EF5350"} />
                <text x={W - 120} y={y(last) + 8} fontFamily="JetBrains Mono" fontWeight={700} fontSize={20} fill="#0B0B0B">
                  {last.toFixed(2)}
                </text>
              </g>
            </svg>
          </div>
        </Glide>
        <Glide at={T(50.2)} style={{ position: "absolute", left: 0, right: 0, top: 1170, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "12px 30px", borderRadius: 999, background: "rgba(5,6,7,.8)", border: `2px solid ${K.gold}`, boxShadow: "0 0 40px rgba(232,199,127,.3)", fontFamily: "Anton", fontSize: 48, color: K.gold, letterSpacing: 3 }}>AB 4000 PE TRADE</div>
        </Glide>
      </AbsoluteFill>
      <Beat from={34.1} to={36.4} base={B} lead="maine bola tha" keyword="3800 ka level" y={1270} tone="gold" sc={0.72} />
      <Beat from={36.4} to={42.6} base={B} lead="market logon ko" keyword="trap kar rahi thi" y={1270} tone="red" sc={0.72} />
      <Beat from={42.6} to={47.8} base={B} lead="lekin 3880–3890 se" keyword="market palti" y={1270} tone="hue" sc={0.72} />
      <Beat from={47.8} to={50.2} base={B} lead="aur ab" keyword="dekh lo" y={1270} tone="white" sc={0.72} />
    </DarkRoom>
  );
};

/* ---------------------------------------------------------------- CTA cards (above the head) */
const JoinCard: React.FC = () => {
  const f = useCurrentFrame();
  const click = p(f, 40, 6) * (1 - p(f, 46, 8));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: D.soft }}>LINK UPAR HAI</div>
      <div style={{ position: "relative", transform: `scale(${1 - click * 0.04})` }}>
        <div style={{ padding: "22px 56px", borderRadius: 999, background: `linear-gradient(180deg, #F2C489, #B9783A)`, color: "#170D04", fontFamily: "Anton", fontSize: 52, letterSpacing: 3, boxShadow: "0 20px 50px rgba(232,163,90,.35), inset 0 2px 0 rgba(255,255,255,.5)" }}>JOIN COMMUNITY ↑</div>
        <svg width={44} height={54} viewBox="0 0 22 27" style={{ position: "absolute", left: mix(p(f, 18, 20, easeInOut), 520, 380), top: mix(p(f, 18, 20, easeInOut), 140, 56), opacity: p(f, 18, 6), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
          <path d="M1 1 L1 21 L6 16.5 L9.5 25 L13 23.5 L9.5 15.5 L16 15.5 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
const ChatIcon: React.FC<{ c: string; size?: number }> = ({ c, size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L12 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" />
    <line x1={14} y1={20} x2={34} y2={20} />
    <line x1={14} y1={26} x2={28} y2={26} />
  </svg>
);
const TextCard: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 32px", borderRadius: 999, background: "rgba(5,6,7,.82)", border: `2px solid ${D.amber}`, boxShadow: "0 0 40px rgba(232,163,90,.25)" }}>
      <ChatIcon c={D.amber} />
      <div style={{ fontFamily: "Anton", fontSize: 46, letterSpacing: 2, color: D.paper }}>
        BIO MEIN NUMBER · <span style={{ color: D.amber }}>TEXT KARO</span>
      </div>
    </div>
    <div style={{ fontFamily: "Anton", fontSize: 64, letterSpacing: 3, color: K.hue, textShadow: `0 0 30px ${K.glow}` }}>FREE JOIN</div>
  </div>
);
const OnScreen: React.FC<{ from: number; to: number; top?: number; children: React.ReactNode }> = ({ from, to, top = 270, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">
    <Glide at={0} dur={s(to) - s(from)} style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
      {children}
    </Glide>
  </Sequence>
);

/* ---------------------------------------------------------------- assembly */
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
  return <AbsoluteFill style={{ opacity: o, filter: `blur(${fog * 16}px)`, transform: `scale(${1 + fog * 0.04})` }}>{children}</AbsoluteFill>;
};

/** hook title card at frame 0: the date line types in under the first keyword */
const HookStamp: React.FC = () => (
  <Sequence durationInFrames={s(2.7)} layout="none">
    <Stamp text="2 NOV 2026 · US–IRAN · STRAIT OF HORMUZ" at={10} top={560} color={D.ember} />
  </Sequence>
);

export const AnfaalReel3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: D.ink }}>
    <Speaker />
    <KeywordCaptions />
    <HookStamp />
    <OnScreen from={62.52} to={67.4} top={270}>
      <JoinCard />
    </OnScreen>
    <OnScreen from={67.4} to={70.75} top={280}>
      <TextCard />
    </OnScreen>
    <Full w={FS.ask}>
      <AskScene />
    </Full>
    <Full w={FS.news}>
      <NewsScene />
    </Full>
    <Full w={FS.prep}>
      <PrepScene />
    </Full>
    <Full w={FS.crash}>
      <CrashScene />
    </Full>
    <Full w={FS.post}>
      <PostScene />
    </Full>
    <Full w={FS.chart}>
      <ChartScene />
    </Full>
    <NormalCaptions />
    <LightLeak />
    <Vignette />
    <Grain o={0.1} />
    <Bars />
  </AbsoluteFill>
);
