// Anfaal reel 4 (65 s): educational — "Gold +$240 in 2 days, what next at NFP?"
// Same documentary structure as reel 3 (keyed speaker composited into a world, full-screen inserts,
// camera-shutter transitions with the client's SFX pack) but neutral/educational, in the Forex Premium
// Motion look: one-hue green glass world, a giant depth-blurred XAUUSD chart wall behind the speaker,
// two-tier type, glass cards, real screenshots (TradingView gold futures, NFP calendar).
// Heavy effects are pre-baked (wall blur, matte) so the browser only composites light layers.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CandleRain, K, TwoTier, clamp, easeIn, easeInOut, easeOut, mix, p, rnd } from "../Anfaal/design";

const FPS = 30;
/** fumble removed: source 50.06 -> 54.14 is cut out (jump cut with a zoom punch) */
export const CUT = { a: 50.06, b: 54.14 };
export const R4_DURATION = 65.0 - (CUT.b - CUT.a);
export const R4_FRAMES = Math.round(R4_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
type Tone = "hue" | "gold" | "red" | "white";

/* ---------------------------------------------------------------- transcript (Roman Urdu) */
const SPEECH: [number, number, string][] = [
  [0.44, 3.2, "gold bhai nikal chuka hai do din ke andar"],
  [3.2, 5.77, "240 dollar ka move"],
  [6.01, 8.69, "do din ke andar itni tezi se recovery"],
  [8.69, 11.38, "aur ab baat karte hain ke kya moves aa sakte hain"],
  [11.38, 13.32, "inhein kal ke NFP ke andar"],
  [13.46, 16.24, "ab main agar apna bataun toh mujhe koi itna khaas"],
  [16.24, 18.84, "feel nahi ho raha is baar ki NFP pe, kyunke"],
  [18.84, 21.81, "jo pehle hi impact aa chuka hai, aur"],
  [21.81, 23.55, "gold aap ke saamne kaise fly kar raha hai"],
  [24.06, 24.75, "lekin"],
  [24.95, 27.14, "ab main agar aap ko bataun toh is baar ki"],
  [27.14, 30.38, "NFP mere analysis ke mutabiq positive aayegi"],
  [30.52, 31.34, "lekin"],
  [31.77, 33.78, "ek twist hai is ke andar, woh"],
  [33.78, 36.63, "ek ghanta pehle aayega NFP"],
  [36.63, 38.95, "aur agar aap chahte ho is ke andar main aap ko"],
  [38.95, 41.79, "right direction bataun toh bio ke andar"],
  [42.04, 45.27, "wahan se mujh se contact kar lena, mere saath trade karna"],
  [45.27, 47.79, "mujhe message karna, community mein bhi add kar dunga"],
  [47.96, 50.06, "so yeh saari ki saari updates hain"],
  [54.14, 56.55, "agar aap ko koi bhi problem aa rahi ho ya aap"],
  [56.55, 58.31, "apna account flip karna ho"],
  [58.49, 61.29, "toh upar community ka link bhi hai, join karna"],
  [61.29, 63.91, "page ko follow karna mat bhooliyega"],
];
const HOT = new Set(["gold", "240", "dollar", "move", "recovery", "moves", "nfp", "impact", "fly", "analysis", "positive", "twist", "ghanta", "right", "direction", "bio", "contact", "trade", "message", "community", "add", "updates", "details", "account", "flip", "link", "join", "follow"]);
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

/* ---------------------------------------------------------------- windows + shutter transition */
export const FS = {
  chart: { from: 5.95, to: 11.38 },
  nfp: { from: 11.38, to: 18.84 },
  view: { from: 24.9, to: 31.6 },
  time: { from: 33.75, to: 36.63 },
};
const within = (t: number, w: { from: number; to: number }) => t >= w.from && t < w.to;
const inFS = (t: number) => Object.values(FS).some((w) => within(t, w));
export const BOUNDS = Object.values(FS).flatMap((w) => [w.from, w.to]).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b);
const SH = 7;
const cutAt = (f: number) => Math.max(0, ...BOUNDS.map((x) => interpolate(f, [s(x) - SH, s(x), s(x) + SH], [0, 1, 0], { ...clamp, easing: easeInOut })));
const shutAt = (f: number) => Math.max(0, ...BOUNDS.map((x) => (f < s(x) ? interpolate(f, [s(x) - SH, s(x)], [0, 1], { ...clamp, easing: easeIn }) : interpolate(f, [s(x), s(x) + SH], [1, 0], { ...clamp, easing: easeOut }))));
const Shutter: React.FC = () => {
  const f = useCurrentFrame();
  const k = shutAt(f);
  if (k <= 0.001) return null;
  const h = 980 * k;
  const blade = (top: boolean): React.CSSProperties => ({ position: "absolute", left: -20, right: -20, height: h + 40, [top ? "top" : "bottom"]: -40, background: K.void, boxShadow: `0 ${top ? 10 : -10}px 30px rgba(0,0,0,.6)` });
  return (
    <>
      <div style={blade(true)} />
      <div style={blade(false)} />
      {k > 0.6 ? <div style={{ position: "absolute", left: 0, right: 0, top: 958, height: 4, background: `linear-gradient(90deg, rgba(47,210,126,0), rgba(156,255,201,${(k - 0.6) * 1.6}), rgba(47,210,126,0))` }} /> : null}
    </>
  );
};

/* ---------------------------------------------------------------- world behind the speaker */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an4/grain.png")})`, backgroundSize: "512px 512px", backgroundPosition: `${Math.floor(rnd(f) * 512)}px ${Math.floor(rnd(f + 77) * 512)}px`, mixBlendMode: "overlay", opacity: 0.06 }} />;
};
const ChartWall: React.FC = () => {
  const f = useCurrentFrame();
  // the wall glides slowly; drifts upward overall (bullish) with a gentle sway
  const x = -260 + Math.sin(f / 240) * 60;
  const y = -340 - p(f, 0, R4_FRAMES, easeInOut) * 260;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 40%, ${K.mid} 0%, ${K.deep} 45%, ${K.void} 100%)`, overflow: "hidden" }}>
      <Img src={staticFile("an4/wall.jpg")} style={{ position: "absolute", left: x, top: y, width: 1600, height: 2600, opacity: 0.9 }} />
      {/* light beams */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + i * 300 + Math.sin(f / (120 + i * 30)) * 40, top: -200, width: 160, height: 1500, transform: `rotate(${18 - i * 6}deg)`, background: "linear-gradient(180deg, rgba(156,255,201,.10), rgba(156,255,201,0))" }} />
      ))}
      <CandleRain speed={0.18} count={6} />
      {/* soft halo behind the subject */}
      <div style={{ position: "absolute", left: 90, top: 480, width: 900, height: 1100, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 45%, rgba(47,210,126,.22), rgba(47,210,126,0) 70%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,10,6,.65) 0%, rgba(3,10,6,.2) 25%, rgba(3,10,6,0) 45%, rgba(3,10,6,.65) 100%)" }} />
    </AbsoluteFill>
  );
};
const PERSON_SCALE = 0.84;
const Speaker: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const breathe = 1 + 0.005 * Math.sin(t / 3) + 0.02 * p(f, 0, R4_FRAMES, easeInOut);
  const open = mix(p(f, 0, 40, easeOut), 1.22, 1);
  return (
    <AbsoluteFill style={{ transform: `scale(${open * (1 + 0.05 * cutAt(f))})`, transformOrigin: "540px 820px" }}>
      <ChartWall />
      <AbsoluteFill style={{ transform: `scale(${PERSON_SCALE * breathe})`, transformOrigin: "540px 1920px" }}>
        <Img src={staticFile(`an4/pf/${String(Math.min(1561, Math.floor((f / FPS) * 24) + 1)).padStart(5, "0")}.png`)} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 82%, rgba(3,10,6,.6) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- type */
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
      <div style={{ padding: "14px 28px", borderRadius: 22, background: "rgba(6,18,12,.72)", border: "1px solid rgba(156,255,201,.14)", boxShadow: "0 12px 30px rgba(0,0,0,.35)", transform: `translateY(${(1 - inT) * 10}px)`, display: "flex", gap: 12, maxWidth: 940 }}>
        {line.words.map((w, k) => {
          const on = t >= w.t0;
          const hot = HOT.has(w.w.replace(/[.,?]/g, "").toLowerCase());
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 44, letterSpacing: -0.5, whiteSpace: "nowrap", color: on ? (hot ? K.hue : K.white) : "rgba(243,247,244,.42)" }}>
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
  { t: 18.84, to: 21.81, lead: "impact pehle hi", key: "aa chuka hai", tone: "white" },
  { t: 21.81, to: 24.9, lead: "dekho gold kaise", key: "fly kar raha hai", tone: "gold" },
  { t: 31.6, to: 33.75, lead: "lekin is mein", key: "ek twist hai", tone: "white" },
  { t: 36.63, to: 41.85, lead: "aap ko chahiye", key: "right direction?" },
  { t: 47.96, to: 50.06, lead: "yeh thi saari", key: "updates", tone: "white" },
  { t: 54.14, to: 56.55, lead: "koi bhi", key: "problem?", tone: "white" },
  { t: 56.55, to: 58.45, lead: "apna account", key: "flip karna hai?" },
];
const KeywordCaptions: React.FC = () => (
  <>
    {CAPS.map((c) => (
      <Sequence key={c.t} from={s(c.t)} durationInFrames={s(c.to) - s(c.t)} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
          <TwoTier lead={c.lead} keyword={c.key} at={0} out={s(c.to) - s(c.t)} variant="C" tone={c.tone ?? "hue"} scale={0.7} />
        </div>
      </Sequence>
    ))}
  </>
);
const Beat: React.FC<{ from: number; to: number; base: number; lead: string; keyword: string; y: number; tone?: Tone; sc?: number }> = ({ from, to, base, lead, keyword, y, tone = "hue", sc = 0.78 }) => (
  <Sequence from={s(from - base)} durationInFrames={s(to - from)} layout="none">
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <TwoTier lead={lead} keyword={keyword} at={0} out={s(to - from)} variant="C" tone={tone} scale={sc} />
    </div>
  </Sequence>
);
const Glide: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number }> = ({ at, dur = 99999, children, style, rise = 40 }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 18, easeOut);
  const b = p(f, at + dur - 14, 14, easeIn);
  return <div style={{ ...style, opacity: a * (1 - b), transform: `translateY(${(1 - a) * rise - b * 30 + Math.sin((f - at) / 45) * 4}px) scale(${mix(a, 0.96, 1)})`, filter: a < 1 || b > 0 ? `blur(${(1 - a) * 8 + b * 8}px)` : undefined }}>{children}</div>;
};
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 40, background: "linear-gradient(160deg, rgba(60,140,100,.30), rgba(10,30,20,.70))", border: "1.5px solid rgba(156,255,201,.22)", boxShadow: "0 30px 70px rgba(0,0,0,.5), 0 0 50px rgba(47,210,126,.1)", ...style }}>{children}</div>
);
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = K.soft }) => <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 7, color, textTransform: "uppercase" }}>{children}</div>;
const World: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 40%, ${K.mid} 0%, ${K.deep} 45%, ${K.void} 100%)`, overflow: "hidden" }}>
    <Img src={staticFile("an4/wall.jpg")} style={{ position: "absolute", left: -260, top: -300, width: 1600, height: 2600, opacity: 0.35 }} />
    <CandleRain speed={0.25} count={7} />
    {children}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- hook card (on camera): +$240 in 2 days */
const HookCard: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(mix(p(f, 8, 50, easeInOut), 0, 240));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Label>XAUUSD · SIRF 2 DIN MEIN</Label>
      <div style={{ fontFamily: "Anton", fontSize: 176, lineHeight: 1, color: K.hue, textShadow: `0 0 34px ${K.glow}`, fontVariantNumeric: "tabular-nums" }}>+${v}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 4, opacity: p(f, 56, 14) }}>
        {["GOLD", "RECOVERY", "MOVE"].map((x) => (
          <div key={x} style={{ padding: "8px 20px", borderRadius: 999, background: "rgba(6,18,12,.72)", border: "1.5px solid rgba(156,255,201,.25)", fontFamily: "Inter", fontWeight: 700, fontSize: 22, letterSpacing: 5, color: K.white }}>{x}</div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- FS 1: the real chart */
const ChartScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.chart.from;
  const W = 960;
  const H = (1239 * W) / 2000;
  const sc = W / 2000;
  const arrow = p(f, 14, 40, easeInOut);
  const push = mix(p(f, 0, s(11.38 - B), easeInOut), 1, 1.06);
  const lo = { x: 560 * sc, y: 1165 * sc };
  const hi = { x: 1530 * sc, y: 125 * sc };
  return (
    <World>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        <Glide at={2} style={{ position: "absolute", left: 60, top: 330 }}>
          <div style={{ position: "relative", padding: 12, borderRadius: 30, background: "linear-gradient(160deg, rgba(60,140,100,.35), rgba(10,30,20,.6))", border: "1.5px solid rgba(156,255,201,.25)", boxShadow: "0 40px 90px rgba(0,0,0,.6)" }}>
            <div style={{ position: "relative", width: W, height: H, borderRadius: 20, overflow: "hidden" }}>
              <Img src={staticFile("an4/gold_chart.png")} style={{ width: W, height: H }} />
              <AbsoluteFill style={{ background: "rgba(4,14,9,.12)" }} />
              <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
                <path d={`M ${lo.x} ${lo.y} Q ${lo.x + 260} ${lo.y - 60}, ${hi.x - 30} ${hi.y + 40}`} fill="none" stroke={K.hue} strokeWidth={7} strokeLinecap="round" strokeDasharray="1300" strokeDashoffset={1300 * (1 - arrow)} style={{ filter: `drop-shadow(0 0 8px ${K.glow})` }} />
                <circle cx={lo.x} cy={lo.y} r={14} fill={K.hue} opacity={p(f, 10, 8)} />
                <circle cx={hi.x} cy={hi.y} r={16} fill="none" stroke={K.hue} strokeWidth={5} opacity={p(f, 50, 10)} />
              </svg>
            </div>
            <div style={{ position: "absolute", left: hi.x - 300, top: hi.y + 70, opacity: p(f, 52, 14), padding: "10px 22px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, fontFamily: "Anton", fontSize: 40, color: "#03140B", letterSpacing: 2 }}>+$240 · 2 DIN</div>
          </div>
        </Glide>
        <Glide at={8} style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center" }}>
          <Label>GOLD FUTURES · 5 MIN · REAL CHART</Label>
        </Glide>
      </AbsoluteFill>
      <Beat from={6.01} to={8.69} base={B} lead="do din mein" keyword="tez recovery" y={1110} />
      <Beat from={8.69} to={11.38} base={B} lead="ab kya" keyword="move aayega?" y={1110} tone="white" />
    </World>
  );
};

/* ---------------------------------------------------------------- FS 2: NFP calendar */
const Countdown: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const secs = Math.max(0, 1 * 86400 + 1 * 3600 + 48 * 60 - Math.floor((f - at) / 30));
  const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60), sx = secs % 60;
  const box = (v: number, l: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 70, color: K.white, padding: "6px 18px", borderRadius: 16, background: "rgba(3,10,6,.6)", border: "1px solid rgba(156,255,201,.18)", fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: 4, color: K.soft }}>{l}</div>
    </div>
  );
  return <div style={{ display: "flex", gap: 14 }}>{box(d, "DAYS")}{box(h, "HRS")}{box(m, "MIN")}{box(sx, "SEC")}</div>;
};
const NfpScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.nfp.from;
  const k2 = s(13.46 - B);
  return (
    <World>
      <Glide at={2} style={{ position: "absolute", left: 90, top: 290 }}>
        <GlassCard style={{ width: 900, padding: "34px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width={70} height={70} viewBox="0 0 48 48" fill="none" stroke={K.hue} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <rect x={6} y={16} width={36} height={24} rx={4} />
              <path d="M18 16 V11 H30 V16" />
              <line x1={6} y1={27} x2={42} y2={27} />
            </svg>
            <div>
              <Label color={K.hue}>KAL · 6 NOV · 13:30 UTC</Label>
              <div style={{ fontFamily: "Anton", fontSize: 72, color: K.white, lineHeight: 1.05 }}>NONFARM PAYROLLS</div>
            </div>
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <Countdown at={2} />
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 26 }}>
            {[
              { l: "CONSENSUS", v: "65K", c: K.hue, at: 20 },
              { l: "PREVIOUS", v: "29K", c: K.gold, at: 28 },
              { l: "EXPECTED (SEP)", v: "90K", c: K.red, at: 36 },
            ].map((x) => (
              <div key={x.l} style={{ flex: 1, padding: "16px 18px", borderRadius: 24, background: "rgba(3,10,6,.5)", border: "1px solid rgba(156,255,201,.15)", opacity: p(f, x.at, 12), transform: `translateY(${(1 - p(f, x.at, 16)) * 20}px)` }}>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, letterSpacing: 4, color: K.soft }}>{x.l}</div>
                <div style={{ fontFamily: "Anton", fontSize: 68, color: x.c, lineHeight: 1.05 }}>{x.v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </Glide>
      <Glide at={46} style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
        <Label>SOURCE · US BLS / NFP CALENDAR</Label>
      </Glide>
      <Beat from={11.4} to={13.46} base={B} lead="kal ke" keyword="NFP mein" y={1080} />
      <Beat from={13.46} to={18.84} base={B} lead="is baar mujhe" keyword="kuch khaas nahi" y={1080} tone="white" />
      <Sequence from={k2} layout="none">
        <div />
      </Sequence>
    </World>
  );
};

/* ---------------------------------------------------------------- FS 3: analysis gauge */
const ViewScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.view.from;
  const posAt = s(29.0 - B);
  const needle = interpolate(f, [10, s(27.2 - B), posAt], [-80, -10, 52], { ...clamp, easing: easeInOut });
  const R = 300;
  const arc = (a0: number, a1: number) => {
    const P = (a: number) => [450 + R * Math.cos(((a - 90) * Math.PI) / 180), 420 + R * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = P(a0);
    const [x1, y1] = P(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  const lit = p(f, posAt, 14);
  return (
    <World>
      <Glide at={2} style={{ position: "absolute", left: 90, top: 300 }}>
        <GlassCard style={{ width: 900, height: 620, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 34, display: "flex", justifyContent: "center" }}>
            <Label>MERA NFP ANALYSIS</Label>
          </div>
          <svg width={900} height={620} style={{ position: "absolute", inset: 0 }}>
            <path d={arc(-90, -32)} stroke={K.red} strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.85} />
            <path d={arc(-26, 26)} stroke="rgba(243,247,244,.35)" strokeWidth={34} fill="none" strokeLinecap="round" />
            <path d={arc(32, 90)} stroke={K.hue} strokeWidth={34} fill="none" strokeLinecap="round" style={{ filter: lit ? `drop-shadow(0 0 ${14 * lit}px ${K.glow})` : undefined }} />
            <g transform={`rotate(${needle} 450 420)`}>
              <line x1={450} y1={420} x2={450} y2={150} stroke={K.white} strokeWidth={8} strokeLinecap="round" />
            </g>
            <circle cx={450} cy={420} r={22} fill={K.white} />
            <text x={150} y={500} fontFamily="Inter" fontWeight={700} fontSize={26} fill={K.red} letterSpacing={4}>NEGATIVE</text>
            <text x={400} y={500} fontFamily="Inter" fontWeight={700} fontSize={26} fill={K.soft} letterSpacing={4}>NEUTRAL</text>
            <text x={630} y={500} fontFamily="Inter" fontWeight={700} fontSize={26} fill={K.hue} letterSpacing={4}>POSITIVE</text>
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center", opacity: lit }}>
            <div style={{ padding: "10px 26px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, fontFamily: "Anton", fontSize: 40, color: "#03140B", letterSpacing: 2 }}>NFP · POSITIVE EXPECTED</div>
          </div>
        </GlassCard>
      </Glide>
      <Beat from={24.95} to={27.14} base={B} lead="ab main" keyword="batata hoon" y={1080} tone="white" />
      <Beat from={27.14} to={31.6} base={B} lead="mere analysis se" keyword="NFP positive" y={1080} />
    </World>
  );
};

/* ---------------------------------------------------------------- FS 4: the twist — timing */
const TimeScene: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.time.from;
  const back = interpolate(f, [12, 48], [0, -30], { ...clamp, easing: easeInOut }); // minute hand sweeps back 60 min
  const hourA = interpolate(f, [12, 48], [0, -30], { ...clamp, easing: easeInOut });
  return (
    <World>
      <Glide at={2} style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
        <GlassCard style={{ width: 640, height: 640, borderRadius: 320, position: "relative" }}>
          <svg width={640} height={640} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={320 + 250 * Math.sin(a)} y1={320 - 250 * Math.cos(a)} x2={320 + 280 * Math.sin(a)} y2={320 - 280 * Math.cos(a)} stroke={i % 3 === 0 ? K.hue : "rgba(243,247,244,.4)"} strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" />;
            })}
            <g transform={`rotate(${back * 12} 320 320)`}>
              <line x1={320} y1={320} x2={320} y2={90} stroke={K.white} strokeWidth={8} strokeLinecap="round" />
            </g>
            <g transform={`rotate(${180 + hourA} 320 320)`}>
              <line x1={320} y1={320} x2={320} y2={170} stroke={K.hue} strokeWidth={14} strokeLinecap="round" />
            </g>
            <circle cx={320} cy={320} r={18} fill={K.white} />
          </svg>
        </GlassCard>
      </Glide>
      <Glide at={20} style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
        <Label color={K.gold}>NFP · 6 NOV · 13:30 UTC</Label>
      </Glide>
      <Beat from={33.8} to={36.63} base={B} lead="NFP aayega" keyword="1 ghanta pehle" y={1060} tone="gold" />
    </World>
  );
};

/* ---------------------------------------------------------------- CTA cards on camera */
const ChatIcon: React.FC<{ c: string; size?: number }> = ({ c, size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L12 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" />
    <line x1={14} y1={20} x2={34} y2={20} />
    <line x1={14} y1={26} x2={28} y2={26} />
  </svg>
);
const ContactCard: React.FC = () => {
  const f = useCurrentFrame();
  const add = p(f, s(45.3 - 41.85), 16);
  return (
    <GlassCard style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 32px" }}>
      <div style={{ width: 110, height: 110, borderRadius: 30, border: `2px solid ${K.hue}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${K.glow}` }}>
        <ChatIcon c={K.hue} />
      </div>
      <div>
        <Label color={K.hue}>BIO MEIN NUMBER</Label>
        <div style={{ fontFamily: "Anton", fontSize: 60, color: K.white, lineHeight: 1.05 }}>CONTACT KARO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: add, transform: `translateY(${(1 - add) * 10}px)` }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: K.hue, boxShadow: `0 0 12px ${K.hue}` }} />
          <Label>COMMUNITY MEIN ADD</Label>
        </div>
      </div>
    </GlassCard>
  );
};
const Button: React.FC<{ text: string; clickAt?: number }> = ({ text, clickAt = 34 }) => {
  const f = useCurrentFrame();
  const click = p(f, clickAt, 6) * (1 - p(f, clickAt + 6, 8));
  return (
    <div style={{ position: "relative", transform: `scale(${1 - click * 0.04})` }}>
      <div style={{ padding: "22px 58px", borderRadius: 999, background: `linear-gradient(180deg, #6BF0AC, ${K.hueDeep})`, color: "#03140B", fontFamily: "Anton", fontSize: 54, letterSpacing: 3, boxShadow: `0 20px 50px ${K.glow}, inset 0 2px 0 rgba(255,255,255,.5)` }}>{text}</div>
      <svg width={44} height={54} viewBox="0 0 22 27" style={{ position: "absolute", left: mix(p(f, clickAt - 20, 20, easeInOut), 520, 380), top: mix(p(f, clickAt - 20, 20, easeInOut), 140, 56), opacity: p(f, clickAt - 20, 6), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
        <path d="M1 1 L1 21 L6 16.5 L9.5 25 L13 23.5 L9.5 15.5 L16 15.5 Z" fill="#fff" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
const OnScreen: React.FC<{ from: number; to: number; top?: number; children: React.ReactNode }> = ({ from, to, top = 270, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">
    <Glide at={0} dur={s(to) - s(from)} style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {children}
    </Glide>
  </Sequence>
);

const Full: React.FC<{ w: { from: number; to: number }; children: React.ReactNode }> = ({ w, children }) => (
  <Sequence from={s(w.from)} durationInFrames={s(w.to) - s(w.from)}>
    <Punch>{children}</Punch>
  </Sequence>
);
const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * (1 - p(f, 0, 12, easeOut))})` }}>{children}</AbsoluteFill>;
};

const Body: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void }}>
    <Speaker />
    <OnScreen from={0.3} to={5.95} top={250}>
      <HookCard />
    </OnScreen>
    <KeywordCaptions />
    <OnScreen from={41.85} to={47.95} top={260}>
      <ContactCard />
    </OnScreen>
    <OnScreen from={58.45} to={61.29} top={280}>
      <Label>LINK UPAR HAI</Label>
      <Button text="JOIN COMMUNITY ↑" />
    </OnScreen>
    <OnScreen from={61.29} to={65.0} top={290}>
      <Button text="FOLLOW KARO" clickAt={40} />
    </OnScreen>
    <Full w={FS.chart}>
      <ChartScene />
    </Full>
    <Full w={FS.nfp}>
      <NfpScene />
    </Full>
    <Full w={FS.view}>
      <ViewScene />
    </Full>
    <Full w={FS.time}>
      <TimeScene />
    </Full>
    <NormalCaptions />
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.5) 100%)" }} />
    <Grain />
    <Shutter />
  </AbsoluteFill>
);

/** the edit: everything up to CUT.a, then a jump cut (zoom punch) straight to CUT.b */
const JumpPunch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${mix(p(f, 0, 10, easeOut), 1.07, 1)})`, transformOrigin: "540px 900px" }}>{children}</AbsoluteFill>;
};
export const AnfaalReel4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: K.void }}>
    <Sequence durationInFrames={s(CUT.a)}>
      <Body />
    </Sequence>
    <Sequence from={s(CUT.a)}>
      <JumpPunch>
        <Sequence from={-s(CUT.b)}>
          <Body />
        </Sequence>
      </JumpPunch>
    </Sequence>
  </AbsoluteFill>
);
