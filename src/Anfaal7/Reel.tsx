// Anfaal reel 7 (88 s) — "CPI day" in the client's reference language (kinetic premium talking-head):
// kinetic captions (thin tight white words blurring up one by one + huge lowercase gradient hero words,
// off-grid), dark list card with status pills, stacking chips, semicircle gauge with sweeping needle,
// B&W beat with a red word in a dashed selection box, white full-screen insert with a phone + organic
// shapes + typed headline, chat bubble, white flash opening and smooth zoom in/out throughout.
// Brand: green #2FD27E -> gold #E8C77F (red for sell). Captions sit on the dark wall above the head;
// cards sit on the chest (white shirt) — nothing on the face. No music (client).
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { K, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";
import { LINES } from "./words";

const FPS = 30;
/** kept source segments: dead pause 29.40–30.02 and the retake 80.45–82.55 are cut out (jump cuts + zoom punch) */
export const SEGS: [number, number][] = [[0, 29.4], [30.02, 80.45], [82.55, 87.95]];
export const R7_DURATION = SEGS.reduce((n, [a, b]) => n + (b - a), 0);
export const R7_FRAMES = Math.round(R7_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
const GRAD = `linear-gradient(100deg, ${K.hue} 0%, #9BE07A 45%, ${K.gold} 100%)`;
const RED_G = "linear-gradient(100deg, #FF6A5A 0%, #E5172F 100%)";
const soft = (f: number, at: number) => spring({ frame: f - at, fps: FPS, config: { stiffness: 140, damping: 16, mass: 0.8 } });

/* ---------------------------------------------------------------- kinetic captions */
// each phrase: small words + one hero (lowercase, big, gradient); `red` turns the hero red
type Phrase = { t: number; to: number; small: string; hero?: string; red?: boolean; heroAt?: number };
export const PHRASES: Phrase[] = [
  { t: 0.25, to: 3.33, small: "10 October · gold ke liye aaj ka", hero: "bada din", heroAt: 1.6 },
  { t: 3.33, to: 6.4, small: "aaj release hone wala hai", hero: "CPI data", heroAt: 4.2 },
  { t: 6.4, to: 8.75, small: "sab se pehle samjho", hero: "what is CPI?", heroAt: 7.3 },
  { t: 8.89, to: 12.95, small: "CPI ka matlab hota hai", hero: "consumer price index", heroAt: 10.0 },
  { t: 13.21, to: 17.9, small: "simple yeh hai ke dekhte hain", hero: "inflation", heroAt: 14.2 },
  { t: 18.26, to: 22.2, small: "poore mahine mein inflation", hero: "ghati ya badhi?", heroAt: 20.4 },
  { t: 22.39, to: 27.7, small: "kya move aa sakta hai", hero: "CPI mein?", heroAt: 23.6 },
  { t: 27.8, to: 33.75, small: "agar aap mujhe jaante ho toh meri", hero: "profile visit", heroAt: 31.0 },
  { t: 33.88, to: 36.4, small: "main news ke upar", hero: "extra trade nahi", heroAt: 34.9 },
  { t: 36.47, to: 45.1, small: "jaise NFP pe bola tha, is baar bhi koi", hero: "excitement", heroAt: 39.6 },
  { t: 45.46, to: 50.5, small: "main aap ko samjhata hoon", hero: "do scenarios", heroAt: 47.9 },
  { t: 50.54, to: 55.5, small: "forecast se upar numbers aaye toh gold", hero: "sell", red: true, heroAt: 53.7 },
  { t: 55.55, to: 57.75, small: "forecast se neeche aaye toh", hero: "buy", heroAt: 56.4 },
  { t: 57.79, to: 62.1, small: "samajh nahi aa raha? ek aur", hero: "tareeqa", heroAt: 60.6 },
  { t: 62.17, to: 66.0, small: "agar data positive aata hai toh gold", hero: "girega", red: true, heroAt: 64.6 },
  { t: 66.02, to: 71.1, small: "aur agar data negative aaya toh", hero: "buy", heroAt: 68.6 },
  { t: 71.15, to: 78.6, small: "phir bhi samajh nahi aa raha? simply", hero: "join karo", heroAt: 75.4 },
  { t: 78.78, to: 84.6, small: "roz ke setups, har setup mein", hero: "150 pips", heroAt: 82.6 },
  { t: 84.66, to: 87.95, small: "agar aap chahte ho", hero: "daily setups", heroAt: 85.2 },
];
const Kinetic: React.FC<{ ph: Phrase }> = ({ ph }) => {
  const f = useCurrentFrame(); // local to the phrase
  const dur = s(ph.to - ph.t);
  const out = p(f, dur - 8, 8, easeIn);
  const words = ph.small.split(" ");
  const span = Math.max(8, s((ph.heroAt ?? ph.to) - ph.t) - 4);
  const heroF = s((ph.heroAt ?? ph.t + 0.6) - ph.t);
  const hb = soft(f, heroF);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 330, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 12, maxWidth: 900 }}>
        {words.map((w, i) => {
          const at = Math.round((i / words.length) * span);
          const a = p(f, at, 9, easeOut);
          return (
            <span key={i} style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 50, letterSpacing: -1.5, color: "#fff", opacity: a, filter: `blur(${(1 - a) * 8}px)`, transform: `translateY(${(1 - a) * 18}px)`, display: "inline-block", textShadow: "0 4px 18px rgba(0,0,0,.5)" }}>{w}</span>
          );
        })}
      </div>
      {ph.hero ? (
        <div style={{ marginTop: -6, fontFamily: "Inter", fontWeight: 800, fontSize: ph.hero.length > 14 ? 104 : 150, letterSpacing: -5, lineHeight: 1.0, whiteSpace: "nowrap", backgroundImage: ph.red ? RED_G : GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: p(f, heroF, 6), transform: `translateY(${(1 - hb) * 40}px) scale(${mix(Math.min(hb, 1), 0.9, 1)})`, filter: `blur(${(1 - p(f, heroF, 8)) * 10}px) drop-shadow(0 8px 24px rgba(0,0,0,.5))` }}>
          {ph.hero}
        </div>
      ) : null}
    </div>
  );
};

/** voice-synced kinetic captions: every word blurs up exactly when it is spoken; hero words land big */
const RED_WORDS = new Set(["sell", "nahi"]);
const SyncedCaptions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.08 && t < Math.min(LINES[k + 1]?.t0 ?? 1e9, l.t1 + 0.6));
  if (i < 0) return null;
  const line = LINES[i];
  const end = Math.min(LINES[i + 1]?.t0 ?? 1e9, line.t1 + 0.6);
  const out = p(f, s(end) - 6, 6, easeIn);
  const small = line.words.filter((w) => !w.hero);
  const hero = line.words.filter((w) => w.hero);
  const appear = (wt: number) => p(f, s(wt) - 1, 7, easeOut);
  const red = hero.some((w) => RED_WORDS.has(w.w.toLowerCase().replace(/[.,?]/g, "")));
  const hb = hero.length ? soft(f, s(hero[0].t) - 1) : 0;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 330, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 12, maxWidth: 920 }}>
        {small.map((w, k) => {
          const a = appear(w.t);
          return <span key={k} style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 50, letterSpacing: -1.5, color: "#fff", opacity: a, filter: `blur(${(1 - a) * 8}px)`, transform: `translateY(${(1 - a) * 18}px)`, display: "inline-block", textShadow: "0 4px 18px rgba(0,0,0,.5)" }}>{w.w}</span>;
        })}
      </div>
      {hero.length ? (
        <div style={{ display: "flex", gap: 22, marginTop: -6 }}>
          {hero.map((w, k) => {
            const a = appear(w.t);
            const b = soft(f, s(w.t) - 1);
            return (
              <span key={k} style={{ fontFamily: "Inter", fontWeight: 800, fontSize: hero.map((h) => h.w).join(" ").length > 14 ? 104 : 150, letterSpacing: -5, lineHeight: 1.0, whiteSpace: "nowrap", backgroundImage: red ? RED_G : GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: a, display: "inline-block", transform: `translateY(${(1 - b) * 40}px) scale(${mix(Math.min(b, 1), 0.9, 1)})`, filter: `blur(${(1 - a) * 10}px) drop-shadow(0 8px 24px rgba(0,0,0,.5))` }}>{w.w.toLowerCase()}</span>
            );
          })}
        </div>
      ) : null}
      {hb < 0 ? null : null}
    </div>
  );
};

/* ---------------------------------------------------------------- footage + camera */
// smooth zoom in / out keyframes (time, scale)
const ZOOM: [number, number][] = [[0, 1.18], [0.9, 1.0], [3.3, 1.08], [6.4, 1.0], [8.9, 1.12], [13.2, 1.02], [18.3, 1.1], [22.3, 1.0], [27.8, 1.1], [33.9, 1.0], [36.5, 1.16], [45.4, 1.02], [50.5, 1.1], [55.5, 1.02], [57.8, 1.1], [62.2, 1.0], [66.0, 1.1], [71.2, 1.0], [78.8, 1.12], [84.7, 1.04], [87.95, 1.08]];
const zoomAt = (t: number) => interpolate(t, ZOOM.map((z) => z[0]), ZOOM.map((z) => z[1]), { ...clamp, easing: easeInOut });
const BW = { from: 36.47, to: 45.1 };
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = Math.min(2111, Math.floor(t * 24) + 1);
  const bw = interpolate(t, [BW.from, BW.from + 0.25, BW.to - 0.3, BW.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoomAt(t)})`, transformOrigin: "540px 980px" }}>
      <Img src={staticFile(`an7/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920, filter: bw ? `grayscale(${bw}) contrast(${1 + 0.15 * bw})` : undefined }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.1) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 80%, rgba(0,0,0,.35) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- UI (chest level) */
const Rise: React.FC<{ at: number; out: number; children: React.ReactNode; top?: number }> = ({ at, out, children, top = 1240 }) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const a = soft(f, at);
  const o = p(f, at, 6) * (1 - p(f, out - 8, 8, easeIn));
  return <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: o, transform: `translateY(${(1 - a) * 50}px)`, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined }}>{children}</div>;
};
/** dark list card with status pills (reference: "Tired of getting denied for ... Pending") */
const StatusList: React.FC<{ title: string; rows: [string, string, "hue" | "red" | "gold"][]; step: number }> = ({ title, rows, step }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: 640, padding: "22px 26px", borderRadius: 22, background: "rgba(14,16,15,.88)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 30, letterSpacing: -0.8, color: "#fff", marginBottom: 10 }}>{title}</div>
      {rows.map(([a, b, tone], i) => {
        const at = 6 + i * step;
        const k = soft(f, at);
        const col = tone === "red" ? "#E5172F" : tone === "gold" ? "#C99A3A" : "#1FA862";
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 4px", borderTop: i ? "1px solid rgba(255,255,255,.08)" : undefined, opacity: p(f, at, 5), transform: `translateX(${(1 - k) * 40}px)` }}>
            <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 32, color: "#fff", letterSpacing: -0.6 }}>{a}</span>
            <span style={{ padding: "6px 16px", borderRadius: 8, background: col, fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#fff", transform: `scale(${Math.max(0, soft(f, at + 6))})` }}>{b}</span>
          </div>
        );
      })}
    </div>
  );
};
/** stacking chips (reference: Late payments / Collections / Bankruptcy) — dark on the white shirt */
const Chips: React.FC<{ items: string[]; step: number; accent?: number }> = ({ items, step, accent = -1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map((x, i) => {
        const at = 4 + i * step;
        const k = soft(f, at);
        return (
          <div key={i} style={{ minWidth: 460, textAlign: "center", padding: "16px 40px", borderRadius: 16, background: i === accent ? GRAD : "rgba(14,16,15,.88)", border: "1.5px solid rgba(255,255,255,.18)", boxShadow: "0 18px 40px rgba(0,0,0,.35)", fontFamily: "Inter", fontWeight: 600, fontSize: 40, letterSpacing: -1, color: i === accent ? "#05130B" : "#fff", opacity: p(f, at, 5), transform: `translateY(${(1 - k) * 30}px) scale(${mix(Math.min(1, k), 0.9, 1)})` }}>{x}</div>
        );
      })}
    </>
  );
};
/** semicircle gauge red -> gold -> green with a sweeping needle */
const Gauge: React.FC<{ label: string; keys: [number, number][]; grey?: boolean }> = ({ label, keys, grey }) => {
  const f = useCurrentFrame();
  const ang = interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), { ...clamp, easing: easeInOut });
  const R = 230, cx = 300, cy = 290;
  const arc = (a0: number, a1: number) => {
    const P = (a: number) => [cx + R * Math.cos(((a - 180) * Math.PI) / 180), cy + R * Math.sin(((a - 180) * Math.PI) / 180)];
    const [x0, y0] = P(a0), [x1, y1] = P(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <svg width={600} height={340} style={{ overflow: "visible", filter: grey ? "grayscale(1)" : undefined }}>
      <defs>
        <linearGradient id="gg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#E5172F" />
          <stop offset="0.5" stopColor={K.gold} />
          <stop offset="1" stopColor={K.hue} />
        </linearGradient>
      </defs>
      <path d={arc(0, 180)} stroke="url(#gg)" strokeWidth={56} fill="none" style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))" }} />
      <g transform={`rotate(${ang - 90} ${cx} ${cy})`}>
        <path d={`M ${cx - 14} ${cy} L ${cx} ${cy - 190} L ${cx + 14} ${cy} Z`} fill="#fff" style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,.5))" }} />
      </g>
      <circle cx={cx} cy={cy} r={20} fill="#fff" />
      <rect x={cx - 110} y={cy + 30} width={220} height={52} rx={14} fill="rgba(14,16,15,.9)" />
      <text x={cx} y={cy + 66} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill="#fff" letterSpacing={-0.5}>{label}</text>
    </svg>
  );
};
/** red word in a dashed selection box with corner handles (reference B&W beat) */
const SelectBox: React.FC<{ word: string; at: number }> = ({ word, at }) => {
  const f = useCurrentFrame();
  const k = soft(f, at);
  const h = (x: string, y: string) => <div style={{ position: "absolute", [x]: -9, [y]: -9, width: 16, height: 16, background: "#fff", border: "2px solid #E5172F" } as React.CSSProperties} />;
  return (
    <div style={{ position: "relative", padding: "6px 22px", border: "3px dashed rgba(255,255,255,.85)", background: "rgba(229,23,47,.12)", transform: `scale(${mix(Math.min(1, k), 0.85, 1)})`, opacity: p(f, at, 5) }}>
      {h("left", "top")}{h("right", "top")}{h("left", "bottom")}{h("right", "bottom")}
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 120, letterSpacing: -4, lineHeight: 1, backgroundImage: RED_G, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{word}</div>
    </div>
  );
};
/** chat bubble (reference "hey! dude") */
const Bubble: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const k = spring({ frame: f - at, fps: FPS, config: { stiffness: 220, damping: 12 } });
  return <div style={{ padding: "16px 30px", borderRadius: "30px 30px 30px 8px", background: `linear-gradient(180deg, #3BE38F, ${K.hueDeep})`, fontFamily: "Inter", fontWeight: 700, fontSize: 38, color: "#03140B", boxShadow: `0 14px 40px rgba(47,210,126,.4)`, transform: `scale(${Math.max(0, k)})`, transformOrigin: "0% 100%" }}>{text}</div>;
};

/* ---------------------------------------------------------------- white full-screen insert: phone + organic shapes */
export const INSERT = { from: 22.39, to: 27.7 };
const Flower: React.FC<{ x: number; y: number; size: number; rot: number; color: string }> = ({ x, y, size, rot, color }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }}>
    {Array.from({ length: 8 }, (_, i) => (
      <ellipse key={i} cx={0} cy={-26} rx={11} ry={24} fill={color} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={14} fill={color} />
  </svg>
);
const PhoneInsert: React.FC = () => {
  const f = useCurrentFrame();
  const sw = soft(f, 2);
  const title = "Kya move aa sakta hai";
  const n = Math.floor(interpolate(f, [8, 8 + title.length * 1.3], [0, title.length], clamp));
  const draw = p(f, 20, 60, easeInOut);
  const pts = Array.from({ length: 22 }, (_, i) => [20 + i * 15, 150 - Math.sin(i / 3) * 30 - i * 3.2 + (i % 3) * 6]);
  const path = pts.slice(0, Math.max(2, Math.floor(pts.length * draw))).map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  return (
    <AbsoluteFill style={{ background: "#F6F5F1" }}>
      <Flower x={720} y={1180} size={300} rot={f * 0.6} color={K.hue} />
      <Flower x={40} y={760} size={170} rot={-f * 0.5} color={K.gold} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 300, fontFamily: "Inter", fontWeight: 500, fontSize: 52, letterSpacing: -1.6, color: "#1C1D1B" }}>
        {title.slice(0, n)}
        <span style={{ opacity: 0 }}>{title.slice(n)}</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 370, fontFamily: "Inter", fontWeight: 800, fontSize: 150, letterSpacing: -6, backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: p(f, s(23.6 - INSERT.from), 6), transform: `translateY(${(1 - soft(f, s(23.6 - INSERT.from))) * 30}px)` }}>CPI mein?</div>
      {/* phone swings in */}
      <div style={{ position: "absolute", left: 300, top: 620, width: 480, height: 960, borderRadius: 64, background: "#111", padding: 16, boxShadow: "0 50px 100px rgba(0,0,0,.35)", transform: `translateX(${(1 - sw) * 500}px) rotate(${(1 - sw) * 30 - 4}deg)`, transformOrigin: "50% 100%" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#fff", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 160, top: 14, width: 120, height: 30, borderRadius: 15, background: "#111" }} />
          <div style={{ padding: "70px 28px 0" }}>
            <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#888", letterSpacing: 2 }}>XAUUSD · CPI DAY</div>
            <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 64, color: "#111", letterSpacing: -2 }}>Gold</div>
            <svg width={400} height={200}>
              <path d={path} fill="none" stroke={K.hueDeep} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {[["Forecast", "—", "#F0F0EE"], ["Actual", "?", "#E9F8F0"], ["Gold", "Volatile", "#FFF4DE"]].map(([a, b, bg], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", marginTop: 12, borderRadius: 16, background: bg, fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: "#222", opacity: p(f, 30 + i * 8, 6) }}>
                <span>{a}</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- assembly */
const At: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);
const WhiteFlash: React.FC = () => {
  const f = useCurrentFrame();
  const open = 1 - p(f, 0, 14, easeOut);
  const ins = Math.max(...[INSERT.from, INSERT.to].map((x) => interpolate(f, [s(x) - 5, s(x), s(x) + 6], [0, 1, 0], { ...clamp, easing: easeInOut })));
  const k = Math.max(open, ins);
  return k > 0.01 ? <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${0.92 * k})` }} /> : null;
};
const InsertWrap: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: `scale(${mix(p(f, 0, 12, easeOut), 1.08, 1)})` }}>
      <PhoneInsert />
    </AbsoluteFill>
  );
};

const Body: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Footage />
      {/* chest-level UI */}
      <At from={3.6} to={8.6}><Rise at={0} out={s(5.0)}><StatusList title="Aaj release hone wala" step={10} rows={[["CPI data", "Today", "hue"], ["Gold", "Volatile", "gold"], ["USD", "Volatile", "gold"]]} /></Rise></At>
      <At from={9.2} to={13.1}><Rise at={0} out={s(3.9)}><Chips step={s(0.75)} items={["Consumer", "Price", "Index"]} /></Rise></At>
      <At from={13.5} to={22.3}><Rise at={0} out={s(8.8)} top={1200}><Gauge label="Inflation" keys={[[6, 40], [s(5.0), 150], [s(7.2), 30], [s(8.4), 90]]} /></Rise></At>
      <At from={28.2} to={33.8}>
        <Rise at={0} out={s(5.6)}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 28px", borderRadius: 24, background: "rgba(14,16,15,.9)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 40, color: "#05130B" }}>A</div>
            <div>
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 36, color: "#fff", letterSpacing: -0.6 }}>@imanfaalpervaiz</div>
              <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 26, color: "rgba(255,255,255,.65)" }}>Profile visit karo · news trades</div>
            </div>
            <div style={{ padding: "12px 22px", borderRadius: 12, background: GRAD, fontFamily: "Inter", fontWeight: 700, fontSize: 26, color: "#05130B" }}>Follow</div>
          </div>
        </Rise>
      </At>
      <At from={36.47} to={45.1}><Rise at={s(2.6)} out={s(8.6)} top={1250}><SelectBox word="nahi" at={s(2.6)} /></Rise></At>
      <At from={47.9} to={57.8}>
        <Rise at={0} out={s(9.9)}>
          <StatusList title="Do scenarios · CPI vs forecast" step={s(5.0)} rows={[["Forecast se upar", "Gold SELL", "red"], ["Forecast se neeche", "Gold BUY", "hue"]]} />
        </Rise>
      </At>
      <At from={62.2} to={71.1}>
        <Rise at={0} out={s(8.9)}>
          <Chips step={s(4.0)} accent={1} items={["Data positive → gold ↓", "Data negative → gold ↑"]} />
        </Rise>
      </At>
      <At from={73.0} to={78.6}>
        <Rise at={0} out={s(5.6)} top={1260}>
          <Bubble text="join kar liya ✓" at={s(2.4)} />
          <Chips step={0} items={["Upar channel ka link"]} />
        </Rise>
      </At>
      <At from={82.4} to={87.95}>
        <Rise at={0} out={s(5.55)}>
          <Chips step={s(1.4)} accent={0} items={["150 pips", "Daily setups"]} />
        </Rise>
      </At>
      {/* kinetic captions on the dark wall above the head */}
      <SyncedCaptions />
      <Sequence from={s(INSERT.from)} durationInFrames={s(INSERT.to - INSERT.from)}>
        <InsertWrap />
      </Sequence>
      {/* watermark */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 30, letterSpacing: -0.5, color: "rgba(255,255,255,.28)" }}>imanfaalpervaiz</div>
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an7/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.08 }} />
      <WhiteFlash />
    </AbsoluteFill>
  );
};

const JumpPunch: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: on ? `scale(${mix(p(f, 0, 10, easeOut), 1.05, 1)})` : undefined, transformOrigin: "540px 980px" }}>{children}</AbsoluteFill>;
};
export const AnfaalReel7: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SEGS.map(([a, b], i) => {
        const from = at;
        at += s(b) - s(a);
        return (
          <Sequence key={i} from={from} durationInFrames={s(b) - s(a)}>
            <JumpPunch on={i > 0}>
              <Sequence from={-s(a)}>
                <Body />
              </Sequence>
            </JumpPunch>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
