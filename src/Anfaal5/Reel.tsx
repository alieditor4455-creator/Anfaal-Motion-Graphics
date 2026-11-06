// Anfaal reel 5 (62 s): "PKR ke peeche ya Dollar ke peeche?" — Forex Premium Motion overlays ON the
// client's real footage (no background added, no full screens). Graphics live in the clean wall area
// above the head (y 230–780); captions on the sweater (y ~1530). Footage is a JPEG sequence (fast, stable).
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, TwoTier, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";

const FPS = 30;
export const R5_DURATION = 62.25;
export const R5_FRAMES = Math.round(R5_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
type Tone = "hue" | "gold" | "red" | "white";

export const SPEECH: [number, number, string][] = [
  [0.18, 3.39, "aaj main aap se ek sawal karta hoon ke aap"],
  [3.39, 5.22, "is ke peeche bhaagte ho"],
  [5.22, 8.22, "ya is ke peeche bhaagte ho? theek hai"],
  [8.31, 11.07, "do saal pehle main is ke peeche bhaagta tha"],
  [11.07, 14.38, "aur do saal baad ab main is ke peeche bhaagta hoon"],
  [14.38, 16.35, "farq itna sa hai ke"],
  [16.35, 18.38, "apni psyche ko change kar lo"],
  [18.38, 20.97, "ek motive bana lo ke mujhe karna kya hai"],
  [20.97, 24.29, "agar is ke peeche bhaagoge toh zindagi bhar"],
  [24.29, 26.24, "lekin agar is ke peeche bhaagoge"],
  [26.24, 28.03, "toh itna kamyab ho sakte ho"],
  [28.12, 30.56, "theek hai, aur agar Pakistan mein baith ke"],
  [30.56, 33.18, "yeh honge na aap ke paas, toh aap ke paas"],
  [33.18, 36.09, "aap ki jeet hai, aap ke paas har ek cheez hai"],
  [36.09, 39.38, "aur agar yeh chahiye toh banane ka tareeqa main bata sakta"],
  [39.38, 41.97, "hoon aap ko, ke aap kis tareeqe se bana sakte ho"],
  [41.97, 44.33, "upar WhatsApp par number hai"],
  [44.33, 47.14, "sirf contact kar dena aur likh dena dollar"],
  [47.14, 49.8, "theek hai, main aap ko poora ka poora plan bata dunga"],
  [49.8, 52.34, "aap ko kaise generate karne, aap ko kaise"],
  [52.34, 55.4, "print karne hain. theek hai, apna khayal rakhiye"],
  [57.54, 60.63, "comment section mein lazmi bataiye ke aap ko PKR"],
  [60.63, 62.24, "ya aap ko dollar chahiye"],
];
export const HOT = new Set(["sawal", "pehle", "baad", "psyche", "change", "motive", "kamyab", "pakistan", "jeet", "tareeqa", "whatsapp", "number", "contact", "dollar", "plan", "generate", "comment", "pkr"]);
const RED = new Set(["pkr", "zindagi", "bhar"]);
type Word = { w: string; t0: number };
type Line = { words: Word[]; t0: number; t1: number };
const LINES: Line[] = SPEECH.flatMap(([a, b, text]) => {
  const ws = text.split(" ");
  const total = ws.reduce((n, w) => n + w.length + 1, 0);
  let acc = a;
  const timed: Word[] = ws.map((w) => {
    const o = { w, t0: acc };
    acc += ((w.length + 1) / total) * (b - a);
    return o;
  });
  const out: Line[] = [];
  const nLines = Math.max(1, Math.ceil(timed.length / 4));
  const per = Math.ceil(timed.length / nLines);
  for (let i = 0; i < timed.length; i += per) {
    const chunk = timed.slice(i, i + per);
    out.push({ words: chunk, t0: chunk[0].t0, t1: i + per < timed.length ? timed[i + per].t0 : b + 0.35 });
  }
  return out;
});

/* ---------------------------------------------------------------- footage (no background added) */
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(1494, Math.floor((f / FPS) * 24) + 1);
  const open = mix(p(f, 0, 30, easeOut), 1.12, 1);
  const breathe = 1 + 0.012 * p(f, 0, R5_FRAMES, easeInOut);
  return (
    <AbsoluteFill style={{ transform: `scale(${open * breathe})`, transformOrigin: "540px 1050px" }}>
      <Img src={staticFile(`an5/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920 }} />
      {/* readability: soft dark band only where the graphics sit (top) and under the captions (bottom) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,10,6,.55) 0%, rgba(3,10,6,.30) 22%, rgba(3,10,6,0) 40%, rgba(3,10,6,0) 70%, rgba(3,10,6,.35) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- shared */
const Glide: React.FC<{ at: number; dur: number; children: React.ReactNode; top: number }> = ({ at, dur, children, top }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 18, easeOut);
  const b = p(f, at + dur - 14, 14, easeIn);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: a * (1 - b), transform: `translateY(${(1 - a) * 40 - b * 30 + Math.sin((f - at) / 45) * 4}px) scale(${mix(a, 0.96, 1)})`, filter: a < 1 || b > 0 ? `blur(${(1 - a) * 8 + b * 8}px)` : undefined }}>
      {children}
    </div>
  );
};
const OnScreen: React.FC<{ from: number; to: number; top?: number; children: React.ReactNode }> = ({ from, to, top = 260, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">
    <Glide at={0} dur={s(to) - s(from)} top={top}>
      {children}
    </Glide>
  </Sequence>
);
const glass: React.CSSProperties = { borderRadius: 36, background: "linear-gradient(160deg, rgba(20,60,40,.88), rgba(3,10,6,.92))", border: "1.5px solid rgba(156,255,201,.26)", boxShadow: "0 24px 60px rgba(0,0,0,.45)" };
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = K.soft }) => <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 7, color, textTransform: "uppercase" }}>{children}</div>;

type Cap = { t: number; to: number; lead: string; key: string; tone?: Tone };
export const CAPS: Cap[] = [
  { t: 0.18, to: 3.39, lead: "aaj ek sawal", key: "kis ke peeche?", tone: "white" },
  { t: 14.38, to: 16.35, lead: "farq sirf", key: "itna sa hai", tone: "white" },
  { t: 16.35, to: 18.38, lead: "apni psyche", key: "change karo" },
  { t: 18.38, to: 20.97, lead: "ek", key: "motive banao", tone: "gold" },
  { t: 20.97, to: 24.29, lead: "PKR ke peeche", key: "zindagi bhar", tone: "red" },
  { t: 24.29, to: 28.03, lead: "dollar ke peeche", key: "kamyabi" },
  { t: 33.18, to: 36.09, lead: "aap ki", key: "jeet hai", tone: "gold" },
  { t: 36.09, to: 41.97, lead: "banane ka", key: "tareeqa", tone: "white" },
  { t: 47.14, to: 49.8, lead: "poora ka poora", key: "plan" },
  { t: 49.8, to: 52.34, lead: "generate", key: "kaise karein", tone: "white" },
  { t: 52.34, to: 55.4, lead: "apna", key: "khayal rakhiye", tone: "gold" },
];
/** dark glass plate behind each keyword so it reads on the bright wall */
const KeyPlate: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const a = p(f, 0, 10, easeOut) * (1 - p(f, dur - 8, 8, easeIn));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", padding: "18px 44px 22px", borderRadius: 34 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(3,10,6,.78)", border: "1.5px solid rgba(156,255,201,.22)", boxShadow: "0 20px 50px rgba(0,0,0,.45)", opacity: a, transform: `scale(${mix(a, 0.94, 1)})` }} />
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};
const KeywordCaptions: React.FC = () => (
  <>
    {CAPS.map((c) => (
      <Sequence key={c.t} from={s(c.t)} durationInFrames={s(c.to) - s(c.t)} layout="none">
        <KeyPlate dur={s(c.to) - s(c.t)}>
          <TwoTier lead={c.lead} keyword={c.key} at={0} out={s(c.to) - s(c.t)} variant="C" tone={c.tone ?? "hue"} scale={0.74} />
        </KeyPlate>
      </Sequence>
    ))}
  </>
);
const NormalCaptions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.05 && t < (LINES[k + 1]?.t0 ?? l.t1) && t < l.t1);
  if (i < 0) return null;
  const line = LINES[i];
  const inT = p(f, s(line.t0) - 2, 6);
  const end = Math.min(LINES[i + 1]?.t0 ?? line.t1, line.t1);
  const outT = p(f, s(end) - 4, 4, easeIn);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", opacity: inT * (1 - outT) }}>
      <div style={{ padding: "14px 28px", borderRadius: 22, background: "rgba(3,10,6,.86)", border: "1.5px solid rgba(156,255,201,.22)", boxShadow: "0 12px 30px rgba(0,0,0,.35)", transform: `translateY(${(1 - inT) * 10}px)`, display: "flex", gap: 12, maxWidth: 940 }}>
        {line.words.map((w, k) => {
          const on = t >= w.t0;
          const key = w.w.replace(/[.,?]/g, "").toLowerCase();
          const col = RED.has(key) ? K.red : HOT.has(key) ? K.hue : K.white;
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 46, letterSpacing: -0.5, whiteSpace: "nowrap", color: on ? col : "rgba(243,247,244,.55)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- cards */
/** PKR vs USD chips; the one being talked about lights up */
const VsCard: React.FC<{ pkrAt: number; usdAt: number }> = ({ pkrAt, usdAt }) => {
  const f = useCurrentFrame();
  const pk = p(f, pkrAt, 12) * (1 - p(f, usdAt, 12) * 0.6);
  const us = p(f, usdAt, 12);
  const chip = (txt: string, sub: string, col: string, lit: number) => (
    <div style={{ ...glass, padding: "18px 34px", minWidth: 280, textAlign: "center", transform: `scale(${mix(lit, 0.94, 1.04)})`, opacity: mix(lit, 0.55, 1), border: `2px solid ${col}`, boxShadow: `0 24px 60px rgba(0,0,0,.45), 0 0 ${40 * lit}px ${col}55` }}>
      <div style={{ fontFamily: "Anton", fontSize: 92, color: col, lineHeight: 1 }}>{txt}</div>
      <Label>{sub}</Label>
    </div>
  );
  return (
    <>
      <Label>AAP KIS KE PEECHE BHAAGTE HO?</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {chip("₨ PKR", "Pakistani rupee", K.red, pk)}
        <div style={{ fontFamily: "Anton", fontSize: 54, color: K.white, opacity: 0.85 }}>VS</div>
        {chip("$ USD", "US dollar", K.hue, us)}
      </div>
    </>
  );
};
/** then vs now timeline */
const ThenNow: React.FC = () => {
  const f = useCurrentFrame();
  const r2 = p(f, s(11.07 - 8.31), 16);
  const row = (when: string, what: string, col: string, a: number) => (
    <div style={{ ...glass, display: "flex", alignItems: "center", gap: 20, padding: "12px 28px", width: 860, opacity: a, transform: `translateX(${(1 - a) * 120}px)` }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 5, color: K.soft, width: 210, whiteSpace: "nowrap" }}>{when}</div>
      <div style={{ fontFamily: "Anton", fontSize: 56, color: col, lineHeight: 1, whiteSpace: "nowrap" }}>{what}</div>
    </div>
  );
  return (
    <>
      {row("2 SAAL PEHLE", "₨ PKR KE PEECHE", K.red, p(f, 4, 16))}
      <div style={{ fontFamily: "Anton", fontSize: 30, lineHeight: 1, color: K.hue, opacity: r2 }}>↓</div>
      {row("AB", "$ DOLLAR KE PEECHE", K.hue, r2)}
    </>
  );
};
/** "Pakistan mein baith ke" — dollars on a PK pin */
const PkDollar: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(mix(p(f, 10, 60, easeInOut), 0, 1000));
  return (
    <div style={{ ...glass, padding: "22px 40px", display: "flex", alignItems: "center", gap: 26 }}>
      <svg width={70} height={70} viewBox="0 0 48 48" fill="none" stroke={K.hue} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 44 C24 44 10 30 10 19 A14 14 0 0 1 38 19 C38 30 24 44 24 44 Z" />
        <circle cx={24} cy={19} r={5} />
      </svg>
      <div>
        <Label color={K.hue}>PAKISTAN MEIN BAITH KE</Label>
        <div style={{ fontFamily: "Anton", fontSize: 84, color: K.white, lineHeight: 1.02, fontVariantNumeric: "tabular-nums" }}>
          ${n.toLocaleString("en-US")}<span style={{ color: K.hue }}>+</span>
        </div>
      </div>
    </div>
  );
};
/** WhatsApp-style chat (generic icon): number above, type "dollar" */
const ChatCard: React.FC = () => {
  const f = useCurrentFrame();
  const typeAt = s(46.0 - 41.97);
  const word = "dollar";
  const n = Math.floor(interpolate(f, [typeAt, typeAt + 18], [0, word.length], clamp));
  const sent = p(f, typeAt + 24, 10);
  return (
    <div style={{ ...glass, width: 760, padding: "22px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 66, height: 66, borderRadius: 33, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={36} height={36} viewBox="0 0 48 48" fill="none" stroke="#03140B" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L12 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "Anton", fontSize: 44, color: K.white, lineHeight: 1 }}>NUMBER UPAR HAI</div>
          <Label>CONTACT KARO · MESSAGE LIKHO</Label>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, opacity: p(f, typeAt - 4, 6) }}>
        <div style={{ padding: "14px 26px", borderRadius: "26px 26px 6px 26px", background: sent ? `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})` : "rgba(243,247,244,.12)", fontFamily: "Inter", fontWeight: 700, fontSize: 40, color: sent ? "#03140B" : K.white, minWidth: 80, minHeight: 50 }}>
          {word.slice(0, n)}
          {n < word.length && Math.floor(f / 8) % 2 === 0 ? "|" : ""}
          {sent > 0.5 ? " ✓✓" : ""}
        </div>
      </div>
    </div>
  );
};
/** comment poll: PKR or Dollar */
const PollCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = p(f, 20, 40, easeInOut);
  const bar = (txt: string, pct: number, col: string) => (
    <div style={{ position: "relative", width: 700, height: 82, borderRadius: 22, background: "rgba(3,10,6,.55)", border: "1px solid rgba(156,255,201,.18)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct * a}%`, background: `linear-gradient(90deg, ${col}cc, ${col}55)` }} />
      <div style={{ position: "absolute", left: 26, top: 14, fontFamily: "Anton", fontSize: 48, color: K.white }}>{txt}</div>
      <div style={{ position: "absolute", right: 26, top: 22, fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: K.white, opacity: a }}>?</div>
    </div>
  );
  return (
    <div style={{ ...glass, padding: "24px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Label color={K.hue}>COMMENT MEIN BATAO</Label>
      {bar("₨ PKR", 38, K.red)}
      {bar("$ DOLLAR", 84, K.hue)}
    </div>
  );
};

export const AnfaalReel5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void }}>
    <Footage />
    <KeywordCaptions />
    <OnScreen from={3.39} to={8.25} top={250}>
      <VsCard pkrAt={4} usdAt={s(5.22 - 3.39) + 4} />
    </OnScreen>
    <OnScreen from={8.31} to={14.38} top={225}>
      <ThenNow />
    </OnScreen>
    <OnScreen from={28.12} to={33.18} top={290}>
      <PkDollar />
    </OnScreen>
    <OnScreen from={41.97} to={47.14} top={225}>
      <ChatCard />
    </OnScreen>
    <OnScreen from={57.54} to={62.25} top={215}>
      <PollCard />
    </OnScreen>
    <NormalCaptions />
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 60%, rgba(0,0,0,.35) 100%)" }} />
  </AbsoluteFill>
);
