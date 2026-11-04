// Anfaal reel 2 (68 s): "Woh trader hi kya jo loss na kare"
// Forex Premium Motion: green glass world, two-tier keywords above the head, Roman Urdu captions
// (above the head, never on the face), the client's real loss / profit screenshots as glass phone
// cards with row highlights and counting totals, and a green-gold diagonal gradient wipe between
// the speaker and every full screen. Music: God's Plan instrumental from its drop.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CandleRain, K, TwoTier, World, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";

const FPS = 30;
export const R2_DURATION = 68.1;
export const R2_FRAMES = Math.round(R2_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
type Tone = "hue" | "gold" | "red" | "white";

/* ---------------------------------------------------------------- transcript */
const SPEECH: [number, number, string][] = [
  [0.09, 1.92, "woh trader hi kya jo loss na kare"],
  [1.92, 3.88, "kal raat mera loss hua almost almost"],
  [3.88, 5.82, "5 thousand ka, yeh aap logon ke saamne"],
  [5.82, 8.12, "lekin kamaaye"],
  [8.22, 10.55, "aaj ke din 10 hazaar dollar, woh bhi"],
  [10.55, 13.41, "forex market ke andar Pakistan mein baith ke"],
  [13.41, 16.33, "agar aap ko skill aati hai, agar aap jaante ho"],
  [16.33, 19.2, "profit kaise banate hain toh loss se nahi ghabraate"],
  [19.29, 21.76, "maine aap ko loss dikhaya aur yeh meri results"],
  [21.76, 23.66, "ka screenshot hai aaj ke din"],
  [23.66, 26.27, "amount bhi recover kiya aur us ke baad 5000 plus"],
  [26.27, 28.98, "profit mein chal raha hoon. aur aisi trades"],
  [28.98, 31.49, "lagani hain toh simply kuch bhi nahi karna"],
  [31.49, 34.09, "meri bio mein number hai, wahan pe message karo"],
  [34.09, 37.04, "free signal community mein add kar dunga"],
  [37.04, 40.07, "apne account flip karne hain toh us ke liye bhi"],
  [40.07, 42.43, "ek proper plan tayyar ho gaya hai"],
  [42.52, 45.16, "agar aap flip karna chahte hain, number hai"],
  [45.16, 47.42, "message karein, main aap ko saari cheezein"],
  [47.42, 49.65, "bata dunga ke easily kaise"],
  [49.65, 51.54, "paisa banate hain is market ke andar"],
  [51.54, 53.79, "bhai simple hai, bohot aasaan hai"],
  [53.88, 56.14, "sirf kehne ki baatein hain ke"],
  [56.14, 59.52, "trading se paisa nahi banta. theek hai, maine apni life change ki"],
  [59.52, 61.77, "aur ab main chahunga ke aap sab log bhi"],
  [61.77, 63.87, "life change karein. agar aap waqai paisa"],
  [63.87, 65.73, "chahte hain toh mujhe follow karna mat bhooliyega"],
  [65.73, 67.8, "aur bio mein number hai, WhatsApp pe message karein"],
];
const HOT = new Set(["loss", "5", "thousand", "10", "hazaar", "dollar", "forex", "pakistan", "skill", "profit", "results", "screenshot", "recover", "5000", "plus", "bio", "number", "free", "signal", "community", "account", "flip", "proper", "plan", "easily", "paisa", "simple", "aasaan", "life", "change", "follow", "whatsapp", "message"]);
const RED = new Set(["loss", "nahi"]);
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
  loss: { from: 1.95, to: 7.9 },
  profit: { from: 19.25, to: 28.95 },
  flip: { from: 37.0, to: 45.1 },
  myth: { from: 56.1, to: 61.75 },
};
const within = (t: number, w: { from: number; to: number }) => t >= w.from && t < w.to;
const inFS = (t: number) => Object.values(FS).some((w) => within(t, w));

/* ---------------------------------------------------------------- gradient wipe */
// A diagonal edge sweeps left -> right across the frame. Edge position e (px along x at mid-height);
// slant: the edge leans so the top runs ahead of the bottom.
const SLANT = 420;
const WIPE = 20; // frames
const edgeAt = (f: number, at: number) => interpolate(f, [at, at + WIPE], [-SLANT - 260, 1080 + SLANT + 260], { ...clamp, easing: easeInOut });
/** polygon of everything left of the diagonal edge */
const leftOf = (e: number) => `polygon(-10px -10px, ${e + SLANT / 2}px -10px, ${e - SLANT / 2}px 1930px, -10px 1930px)`;
const rightOf = (e: number) => `polygon(${e + SLANT / 2}px -10px, 1090px -10px, 1090px 1930px, ${e - SLANT / 2}px 1930px)`;
/** the glowing green-gold band riding on the edge */
const WipeBand: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > at + WIPE + 1) return null;
  const e = edgeAt(f, at);
  const ang = (Math.atan2(1920, -SLANT) * 180) / Math.PI - 90;
  return (
    <div
      style={{
        position: "absolute",
        left: e - 260,
        top: -300,
        width: 520,
        height: 2520,
        transform: `rotate(${ang}deg)`,
        transformOrigin: "50% 50%",
        background: `linear-gradient(90deg, rgba(47,210,126,0) 0%, rgba(18,128,72,.55) 22%, rgba(47,210,126,.85) 38%, rgba(255,241,201,.95) 50%, rgba(232,199,127,.75) 60%, rgba(47,210,126,.5) 76%, rgba(47,210,126,0) 100%)`,
        filter: "blur(14px)",
        mixBlendMode: "screen",
      }}
    />
  );
};
/** full screen that enters with a wipe and leaves with a wipe */
const Full: React.FC<{ w: { from: number; to: number }; children: React.ReactNode }> = ({ w, children }) => {
  const f = useCurrentFrame();
  const a = s(w.from) - WIPE / 2;
  const b = s(w.to) - WIPE / 2;
  if (f < a || f > b + WIPE) return null;
  const clip = f < a + WIPE ? leftOf(edgeAt(f, a)) : f >= b ? rightOf(edgeAt(f, b)) : undefined;
  const sc = f < a + WIPE ? mix(p(f, a, WIPE, easeOut), 1.05, 1) : 1;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={{ transform: `scale(${sc})` }}>
        <Sequence from={s(w.from) - WIPE / 2} layout="none">
          {children}
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- speaker */
const Speaker: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const push = 1 + 0.012 * Math.sin(t / 6) + 0.02 * p(f, 0, R2_FRAMES, easeInOut);
  return (
    <AbsoluteFill style={{ backgroundColor: K.void }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "540px 1150px" }}>
        <OffthreadVideo src={staticFile("an2/cut.mp4")} muted style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      {/* dark band above the head for type + cards */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,10,6,.78) 0%, rgba(3,10,6,.55) 22%, rgba(3,10,6,.18) 34%, rgba(3,10,6,0) 40%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 55%, transparent 55%, rgba(6,23,15,.45) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- captions */
const NormalCaptions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.05 && t < (LINES[k + 1]?.t0 ?? l.t1 + 0.6) && t < l.t1 + 0.6);
  if (i < 0) return null;
  const line = LINES[i];
  const inT = p(f, s(line.t0) - 2, 6);
  const end = Math.min(LINES[i + 1]?.t0 ?? line.t1 + 0.6, line.t1 + 0.6);
  const outT = p(f, s(end) - 4, 4, easeIn);
  const top = inFS(t) ? 1470 : 610;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: inT * (1 - outT) }}>
      <div style={{ padding: "14px 28px", borderRadius: 22, background: "rgba(6,18,12,.7)", border: "1px solid rgba(156,255,201,.14)", boxShadow: "0 12px 30px rgba(0,0,0,.3)", transform: `translateY(${(1 - inT) * 10}px)`, display: "flex", gap: 12, maxWidth: 940 }}>
        {line.words.map((w, k) => {
          const on = t >= w.t0;
          const key = w.w.replace(/[.,?]/g, "").toLowerCase();
          const col = RED.has(key) ? K.red : HOT.has(key) ? K.hue : K.white;
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 44, letterSpacing: -0.5, whiteSpace: "nowrap", color: on ? col : "rgba(243,247,244,.42)" }}>
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
  { t: 0.05, to: 1.95, lead: "woh trader hi kya", key: "jo loss na kare", tone: "white" },
  { t: 13.41, to: 16.33, lead: "agar aap ko", key: "skill aati hai", tone: "hue" },
  { t: 16.33, to: 19.25, lead: "toh loss se", key: "nahi ghabraate", tone: "white" },
  { t: 28.95, to: 31.49, lead: "simply", key: "kuch nahi karna", tone: "white" },
  { t: 45.1, to: 47.42, lead: "saari ki saari", key: "cheezein", tone: "white" },
  { t: 47.42, to: 51.54, lead: "easily kaise", key: "paisa banate hain" },
  { t: 51.54, to: 53.85, lead: "bhai", key: "simple hai", tone: "gold" },
  { t: 53.88, to: 56.1, lead: "sirf", key: "kehne ki baatein", tone: "white" },
  { t: 61.75, to: 63.87, lead: "aap bhi", key: "life change karo" },
];
const KeywordCaptions: React.FC = () => (
  <>
    {CAPS.map((c) => (
      <Sequence key={c.t} from={s(c.t)} durationInFrames={s(c.to) - s(c.t)} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", justifyContent: "center" }}>
          <TwoTier lead={c.lead} keyword={c.key} at={0} out={s(c.to) - s(c.t)} variant="C" tone={c.tone ?? "hue"} scale={0.66} />
        </div>
      </Sequence>
    ))}
  </>
);
const Beat: React.FC<{ from: number; to: number; base: number; lead: string; keyword: string; y: number; tone?: Tone; sc?: number }> = ({ from, to, base, lead, keyword, y, tone = "hue", sc = 0.8 }) => (
  <Sequence from={s(from - base) + WIPE / 2} durationInFrames={s(to - from)} layout="none">
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <TwoTier lead={lead} keyword={keyword} at={0} out={s(to - from)} variant="C" tone={tone} scale={sc} />
    </div>
  </Sequence>
);

/* ---------------------------------------------------------------- shared bits */
const Glide: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number }> = ({ at, dur = 99999, children, style, rise = 40 }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 18, easeOut);
  const b = p(f, at + dur - 14, 14, easeIn);
  return <div style={{ ...style, opacity: a * (1 - b), transform: `translateY(${(1 - a) * rise - b * 30 + Math.sin((f - at) / 40) * 4}px) scale(${mix(a, 0.96, 1)})`, filter: `blur(${(1 - a) * 8 + b * 8}px)` }}>{children}</div>;
};
const money = (v: number) => `${v < 0 ? "−" : "+"}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;
const Counter: React.FC<{ from: number; to: number; at: number; dur: number; color: string; size: number; glow: string }> = ({ from, to, at, dur, color, size, glow }) => {
  const f = useCurrentFrame();
  const v = mix(p(f, at, dur, easeInOut), from, to);
  return <div style={{ fontFamily: "Anton", fontSize: size, color, letterSpacing: 1, lineHeight: 1, textShadow: `0 0 30px ${glow}`, fontVariantNumeric: "tabular-nums" }}>{money(v)}</div>;
};
/** glass "phone" frame around a real screenshot, with a row highlight that walks down */
const Shot: React.FC<{ src: string; w: number; imgW: number; imgH: number; rows: number; rowAt: (i: number) => number; hl: string; scroll?: number }> = ({ src, w, imgW, imgH, rows, rowAt, hl, scroll = 0 }) => {
  const f = useCurrentFrame();
  const scale = w / imgW;
  const h = imgH * scale;
  const rowH = h / rows;
  let cur = -1;
  for (let i = 0; i < rows; i++) if (f >= rowAt(i)) cur = i;
  return (
    <div style={{ position: "relative", width: w + 28, padding: 14, borderRadius: 46, background: "linear-gradient(160deg, rgba(60,140,100,.35), rgba(10,30,20,.6))", border: "1.5px solid rgba(156,255,201,.25)", boxShadow: "0 40px 90px rgba(0,0,0,.6), 0 0 60px rgba(47,210,126,.12)" }}>
      <div style={{ position: "relative", width: w, height: h - scroll, borderRadius: 34, overflow: "hidden" }}>
        <Img src={staticFile(src)} style={{ position: "absolute", top: 0, width: w, height: h }} />
        {Array.from({ length: rows }, (_, i) => {
          const on = p(f, rowAt(i), 8);
          const active = i === cur ? 1 : 0.35;
          return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * rowH, height: rowH, background: hl, opacity: on * active * 0.18, borderLeft: `6px solid ${hl}` }} />;
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- full screen 1: LOSS */
const LossScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.loss.from;
  const o = WIPE / 2;
  const push = mix(p(f, 0, s(6), easeInOut), 1, 1.05);
  return (
    <World focusY={42}>
      <CandleRain speed={0.25} count={7} tint={K.red} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 35% at 50% 38%, rgba(255,95,102,.16), rgba(255,95,102,0) 70%)" }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        <Glide at={o + 2} style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: K.soft }}>KAL RAAT · REAL ACCOUNT</div>
        </Glide>
        <Glide at={o + 6} style={{ position: "absolute", left: 0, right: 0, top: 370, display: "flex", justifyContent: "center" }}>
          <Shot src="an2/loss.jpg" w={900} imgW={1320} imgH={542} rows={3} rowAt={(i) => o + 16 + i * 14} hl={K.red} />
        </Glide>
        <Glide at={o + 30} style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 8, color: K.soft }}>TOTAL LOSS</div>
          <Counter from={0} to={-4311} at={o + 30} dur={40} color={K.red} size={150} glow="rgba(255,95,102,.45)" />
        </Glide>
      </AbsoluteFill>
      <Beat from={1.95} to={3.88} base={B} lead="kal raat" keyword="loss hua" y={1130} tone="red" />
      <Beat from={3.88} to={5.82} base={B} lead="almost" keyword="5 thousand" y={1130} tone="red" />
      <Beat from={5.82} to={7.9} base={B} lead="aap ke" keyword="saamne" y={1130} tone="white" />
    </World>
  );
};

/* ---------------------------------------------------------------- speaker card: +$10,000 today */
const TodayCard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: K.soft }}>AAJ KE DIN · FOREX SE</div>
      <Counter from={0} to={10000} at={4} dur={44} color={K.hue} size={168} glow={K.glow} />
      <div style={{ display: "flex", gap: 12, marginTop: 6, opacity: p(f, 50, 14) }}>
        <div style={{ padding: "10px 22px", borderRadius: 999, background: "rgba(6,18,12,.7)", border: "1.5px solid rgba(156,255,201,.25)", fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 6, color: K.white }}>PAKISTAN MEIN BAITH KE</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- full screen 2: PROFIT */
const ProfitScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.profit.from;
  const o = WIPE / 2;
  const dur = s(FS.profit.to - B);
  const scroll = interpolate(f, [o + 20, dur - 10], [0, 1], { ...clamp, easing: easeInOut });
  const W = 560;
  const H = (1600 * W) / 1222;
  const view = 700;
  return (
    <World focusY={40}>
      <CandleRain speed={0.3} count={8} />
      <Glide at={o + 2} style={{ position: "absolute", left: 0, right: 0, top: 255, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: K.soft }}>AAJ KE RESULTS · REAL SCREENSHOT</div>
      </Glide>
      <Glide at={o + 6} style={{ position: "absolute", left: 70, top: 320 }}>
        <div style={{ width: W + 28, padding: 14, borderRadius: 46, background: "linear-gradient(160deg, rgba(60,140,100,.35), rgba(10,30,20,.6))", border: "1.5px solid rgba(156,255,201,.25)", boxShadow: "0 40px 90px rgba(0,0,0,.6), 0 0 60px rgba(47,210,126,.14)" }}>
          <div style={{ position: "relative", width: W, height: view, borderRadius: 34, overflow: "hidden" }}>
            <Img src={staticFile("an2/profit.jpg")} style={{ position: "absolute", left: 0, top: -scroll * (H - view), width: W, height: H }} />
            {Array.from({ length: 10 }, (_, i) => {
              const rowH = H / 10;
              const y = i * rowH - scroll * (H - view);
              const at = o + 22 + i * 18;
              const lit = p(f, at, 8) * (1 - p(f, at + 18, 10) * 0.7);
              return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: rowH, background: K.hue, opacity: lit * 0.16, borderLeft: `6px solid ${K.hue}` }} />;
            })}
          </div>
        </div>
      </Glide>
      {/* right column: totals */}
      <Glide at={o + 26} style={{ position: "absolute", left: 690, top: 360, width: 320, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
        <MiniStat label="LOSS" value="−$4,311" color={K.red} />
        <MiniStat label="PROFIT" value="+$12,499" color={K.hue} />
        <MiniStat label="TRADES" value="10 WINS" color={K.gold} />
      </Glide>
      <Glide at={s(23.66 - B) + o} style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 8, color: K.soft }}>NET · LOSS RECOVER KE BAAD</div>
        <Counter from={-4311} to={8188} at={s(23.66 - B) + o + 4} dur={60} color={K.hue} size={140} glow={K.glow} />
      </Glide>
      <Beat from={19.3} to={23.66} base={B} lead="yeh rahe" keyword="results" y={1300} sc={0.7} />
      <Beat from={23.66} to={26.27} base={B} lead="amount bhi" keyword="recover" y={1300} sc={0.7} tone="gold" />
      <Beat from={26.27} to={28.95} base={B} lead="ab chal raha hoon" keyword="5000+ profit" y={1300} sc={0.7} />
    </World>
  );
};
const MiniStat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ width: 320, padding: "18px 24px", borderRadius: 30, background: "linear-gradient(160deg, rgba(60,140,100,.3), rgba(10,30,20,.65))", border: "1.5px solid rgba(156,255,201,.2)", boxShadow: "0 24px 50px rgba(0,0,0,.45)" }}>
    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, letterSpacing: 6, color: K.soft }}>{label}</div>
    <div style={{ fontFamily: "Anton", fontSize: 64, color, lineHeight: 1.05 }}>{value}</div>
  </div>
);

/* ---------------------------------------------------------------- speaker card: free signal community */
const ChatIcon: React.FC<{ c: string; size?: number }> = ({ c, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L12 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" />
    <line x1={14} y1={20} x2={34} y2={20} />
    <line x1={14} y1={26} x2={28} y2={26} />
  </svg>
);
const SignalCard: React.FC = () => {
  const f = useCurrentFrame();
  const add = p(f, s(34.1 - 31.49), 16);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 34px", borderRadius: 40, background: "linear-gradient(160deg, rgba(60,140,100,.32), rgba(10,30,20,.7))", border: "1.5px solid rgba(156,255,201,.24)", boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
      <div style={{ width: 120, height: 120, borderRadius: 32, border: `2px solid ${K.hue}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${K.glow}`, background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.12), rgba(255,255,255,.03))" }}>
        <ChatIcon c={K.hue} />
      </div>
      <div>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 6, color: K.hue }}>NUMBER BIO MEIN</div>
        <div style={{ fontFamily: "Anton", fontSize: 66, color: K.white, lineHeight: 1.05 }}>FREE SIGNALS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: add, transform: `translateY(${(1 - add) * 10}px)` }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: K.hue, boxShadow: `0 0 12px ${K.hue}` }} />
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 5, color: K.soft }}>COMMUNITY MEIN ADD</div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- full screen 3: ACCOUNT FLIP */
const FlipScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.flip.from;
  const o = WIPE / 2;
  const flipAt = s(40.07 - B) + o;
  const r = interpolate(f, [flipAt, flipAt + 26], [0, 180], { ...clamp, easing: easeInOut });
  const lift = Math.sin((r / 180) * Math.PI) * 40;
  const face = (back: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: 44,
    backfaceVisibility: "hidden",
    transform: back ? "rotateY(180deg)" : undefined,
    padding: "44px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  });
  const bars = (vals: number[], col: string) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160 }}>
      {vals.map((v, i) => (
        <div key={i} style={{ width: 46, height: `${v * 100}%`, borderRadius: 10, background: `linear-gradient(180deg, ${col}, rgba(255,255,255,.06))`, opacity: 0.9 }} />
      ))}
    </div>
  );
  return (
    <World focusY={40}>
      <CandleRain speed={0.3} count={8} />
      <Glide at={o + 4} style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 820, height: 520, perspective: 2200, transform: `translateY(${-lift}px)` }}>
          <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateY(${r}deg)` }}>
            <div style={{ ...face(false), background: "linear-gradient(160deg, rgba(90,100,95,.45), rgba(20,26,24,.85))", border: "1.5px solid rgba(255,255,255,.18)", boxShadow: "0 40px 90px rgba(0,0,0,.55)" }}>
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 7, color: K.soft }}>YOUR ACCOUNT · ABHI</div>
              {bars([0.3, 0.42, 0.28, 0.35, 0.25, 0.3, 0.22], "rgba(220,230,225,.6)")}
              <div style={{ fontFamily: "Anton", fontSize: 70, color: "rgba(243,247,244,.8)" }}>SMALL BALANCE</div>
            </div>
            <div style={{ ...face(true), background: "linear-gradient(160deg, rgba(60,160,105,.55), rgba(8,30,20,.9))", border: `2px solid ${K.hueLight}`, boxShadow: `0 40px 90px rgba(0,0,0,.55), 0 0 80px ${K.glow}` }}>
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, letterSpacing: 7, color: K.hueLight }}>PROPER PLAN KE SAATH</div>
              {bars([0.25, 0.35, 0.45, 0.55, 0.7, 0.85, 1], K.hue)}
              <div style={{ fontFamily: "Anton", fontSize: 70, color: K.white }}>ACCOUNT FLIPPED</div>
            </div>
          </div>
        </div>
      </Glide>
      <Glide at={s(42.52 - B) + o} style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 34px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, boxShadow: `0 20px 50px ${K.glow}, inset 0 2px 0 rgba(255,255,255,.5)` }}>
          <ChatIcon c="#03140B" size={46} />
          <div style={{ fontFamily: "Anton", fontSize: 46, color: "#03140B", letterSpacing: 2 }}>BIO MEIN NUMBER · MESSAGE KARO</div>
        </div>
      </Glide>
      <Beat from={37.05} to={40.07} base={B} lead="apna account" keyword="flip karna hai?" y={1120} tone="white" />
      <Beat from={40.07} to={42.52} base={B} lead="ek proper" keyword="plan tayyar" y={1120} />
      <Beat from={42.52} to={45.1} base={B} lead="number" keyword="bio mein" y={1120} tone="gold" />
    </World>
  );
};

/* ---------------------------------------------------------------- full screen 4: MYTH */
const MythScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.myth.from;
  const o = WIPE / 2;
  const strikeAt = o + 40;
  const strike = p(f, strikeAt, 16, easeInOut);
  const lifeAt = s(58.3 - B) + o;
  return (
    <World focusY={44}>
      <CandleRain speed={0.35} count={9} />
      <Glide at={o + 2} style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, letterSpacing: 8, color: K.soft }}>LOG KEHTE HAIN</div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontFamily: "Anton", fontSize: 104, lineHeight: 1.04, color: mix(strike, 0, 1) > 0.5 ? "rgba(243,247,244,.55)" : K.white, letterSpacing: 1 }}>
            "TRADING SE PAISA
            <br />
            NAHI BANTA"
          </div>
          <div style={{ position: "absolute", left: -20, top: 92, height: 12, width: `${strike * 110}%`, borderRadius: 6, background: K.red, boxShadow: "0 0 20px rgba(255,95,102,.6)", transform: "rotate(-3deg)", transformOrigin: "left center" }} />
          <div style={{ position: "absolute", left: -20, top: 200, height: 12, width: `${p(f, strikeAt + 8, 16, easeInOut) * 110}%`, borderRadius: 6, background: K.red, boxShadow: "0 0 20px rgba(255,95,102,.6)", transform: "rotate(-3deg)", transformOrigin: "left center" }} />
        </div>
      </Glide>
      <Glide at={lifeAt} style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "18px 40px", borderRadius: 999, background: "rgba(6,18,12,.7)", border: `2px solid ${K.hue}`, boxShadow: `0 0 40px ${K.glow}`, fontFamily: "Anton", fontSize: 58, letterSpacing: 2, color: K.hue }}>MAINE APNI LIFE CHANGE KI</div>
      </Glide>
      <Beat from={59.52} to={61.75} base={B} lead="ab main chahunga" keyword="aap sab bhi" y={1000} tone="white" sc={0.8} />
    </World>
  );
};

/* ---------------------------------------------------------------- CTA cards on the speaker */
const FollowCard: React.FC = () => {
  const f = useCurrentFrame();
  const click = p(f, 34, 6) * (1 - p(f, 40, 8));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ position: "relative", transform: `scale(${1 - click * 0.04})` }}>
        <div style={{ padding: "22px 60px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, color: "#03140B", fontFamily: "Anton", fontSize: 54, letterSpacing: 3, boxShadow: `0 20px 50px ${K.glow}, inset 0 2px 0 rgba(255,255,255,.5)` }}>FOLLOW KARO</div>
        <svg width={44} height={54} viewBox="0 0 22 27" style={{ position: "absolute", left: mix(p(f, 14, 20, easeInOut), 470, 330), top: mix(p(f, 14, 20, easeInOut), 140, 56), opacity: p(f, 14, 6), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
          <path d="M1 1 L1 21 L6 16.5 L9.5 25 L13 23.5 L9.5 15.5 L16 15.5 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
const MessageCard: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 34px", borderRadius: 999, background: "rgba(6,18,12,.75)", border: `2px solid ${K.hue}`, boxShadow: `0 0 40px ${K.glow}` }}>
    <ChatIcon c={K.hue} size={50} />
    <div style={{ fontFamily: "Anton", fontSize: 50, letterSpacing: 2, color: K.white }}>
      BIO MEIN NUMBER · <span style={{ color: K.hue }}>MESSAGE KARO</span>
    </div>
  </div>
);

const OnScreen: React.FC<{ from: number; to: number; top?: number; children: React.ReactNode }> = ({ from, to, top = 270, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">
    <Glide at={0} dur={s(to) - s(from)} style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
      {children}
    </Glide>
  </Sequence>
);

const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 1 }) => (
  <Sequence from={Math.max(0, s(at))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`an2/sfx/${src}.wav`)} volume={vol} />
  </Sequence>
);

export const AnfaalReel2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void }}>
    <Audio src={staticFile("an2/cut.mp4")} />
    <Audio src={staticFile("an2/music.wav")} volume={(fr) => Math.min(1, fr / 4) * Math.min(1, (R2_FRAMES - fr) / 30)} />
    <Speaker />
    <KeywordCaptions />
    <OnScreen from={7.95} to={13.41}>
      <TodayCard />
    </OnScreen>
    <OnScreen from={31.49} to={37.0} top={250}>
      <SignalCard />
    </OnScreen>
    <OnScreen from={63.87} to={65.73} top={290}>
      <FollowCard />
    </OnScreen>
    <OnScreen from={65.73} to={68.1} top={300}>
      <MessageCard />
    </OnScreen>
    <Full w={FS.loss}>
      <LossScene />
    </Full>
    <Full w={FS.profit}>
      <ProfitScene />
    </Full>
    <Full w={FS.flip}>
      <FlipScene />
    </Full>
    <Full w={FS.myth}>
      <MythScene />
    </Full>
    {Object.values(FS).map((w) => (
      <React.Fragment key={w.from}>
        <WipeBand at={s(w.from) - WIPE / 2} />
        <WipeBand at={s(w.to) - WIPE / 2} />
      </React.Fragment>
    ))}
    <NormalCaptions />
    {Object.values(FS).flatMap((w) => [w.from, w.to]).map((x) => (
      <Sfx key={x} at={x - 0.35} src="whoosh" vol={0.14} />
    ))}
    <Sfx at={FS.loss.from + 1.3} src="thud" vol={0.22} />
    <Sfx at={8.1} src="pop" vol={0.24} />
    <Sfx at={20.4} src="pop" vol={0.2} />
    <Sfx at={23.9} src="pop" vol={0.22} />
    <Sfx at={31.6} src="pop" vol={0.22} />
    <Sfx at={40.2} src="whoosh" vol={0.12} />
    <Sfx at={42.7} src="pop" vol={0.22} />
    <Sfx at={57.6} src="thud" vol={0.2} />
    <Sfx at={64.3} src="pop" vol={0.26} />
  </AbsoluteFill>
);
