// Anfaal reel 6 (46.7 s) — rebuilt in the client's reference language ("render.rrush" style):
// dark cinematic grade on the real footage, white lead + big green keyword captions, typewriter green bar
// chips, square-checkbox checklists that flip state, white/green stacked chips, boxed tag + huge green
// number, green corner focus brackets, falling dollar bills, flash-zoom cuts into full-screen green-glow
// moments. Every element springs in with a bouncy overshoot. Footage = JPEG sequence (stable renders).
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { K, clamp, easeIn, easeInOut, easeOut, mix, p, rnd } from "../Anfaal/design";

const FPS = 30;
export const R6_DURATION = 46.7;
export const R6_FRAMES = Math.round(R6_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
const G = "#22E37A"; // reference green
const GD = "#0E7A3E";
const bounce = (f: number, at: number, k = 1) => spring({ frame: f - at, fps: FPS, config: { stiffness: 210 * k, damping: 11, mass: 0.7 } });

export const SPEECH: [number, number, string][] = [
  [0.18, 1.35, "NFP pe profit"],
  [1.72, 2.89, "paanch hazaar dollar"],
  [3.13, 5.83, "theek hai, just one trade aur aap"],
  [6.55, 9.42, "soch bhi nahi sakte ho ke is hisaab se ek account"],
  [10.23, 13.38, "aap agar paisa banana chahte ho toh sab se pehle"],
  [13.38, 15.05, "yeh dekho, paanch hazaar dollar"],
  [15.32, 16.46, "NFP par banaye"],
  [16.86, 18.82, "aur agar aap ko paisa banana hai toh simply"],
  [18.82, 20.78, "kuch bhi nahi karna, comment section mein"],
  [21.05, 22.22, "account flip likh do"],
  [22.46, 25.41, "aur agar meri trades ko follow karna chahte ho toh"],
  [25.41, 27.5, "upar community mein channel ka link hai"],
  [27.5, 29.03, "join kar lena jo ke free of cost hai"],
  [29.24, 30.19, "har education"],
  [30.42, 32.99, "har ek system ke baare mein cheezein batayi jaa rahi hain"],
  [32.99, 34.19, "aur yeh paisa"],
  [34.65, 37.29, "system se banta hai, paseene se nahi banta"],
  [37.29, 39.53, "agar aap waqai jud ke paisa banana chahte ho"],
  [39.8, 41.48, "toh simply follow karna mat bhoolna"],
  [41.88, 43.72, "aur agar account flip karna hai toh"],
  [43.93, 46.72, "make sure karo ke thousand dollar se upar ka account ho"],
];
export const HOT = new Set(["nfp", "profit", "paanch", "hazaar", "dollar", "trade", "account", "paisa", "comment", "flip", "follow", "community", "link", "free", "system", "education", "paseene", "thousand"]);
type Word = { w: string; t0: number };
const LINES = SPEECH.flatMap(([a, b, text]) => {
  const ws = text.split(" ");
  const total = ws.reduce((n, w) => n + w.length + 1, 0);
  let acc = a;
  const timed: Word[] = ws.map((w) => { const o = { w, t0: acc }; acc += ((w.length + 1) / total) * (b - a); return o; });
  const out: { words: Word[]; t0: number; t1: number }[] = [];
  const n = Math.max(1, Math.ceil(timed.length / 4));
  const per = Math.ceil(timed.length / n);
  for (let i = 0; i < timed.length; i += per) { const c = timed.slice(i, i + per); out.push({ words: c, t0: c[0].t0, t1: i + per < timed.length ? timed[i + per].t0 : b + 0.3 }); }
  return out;
});

/* full-screen moments */
export const FS = { money: { from: 6.4, to: 9.6 }, system: { from: 33.0, to: 37.3 } };
const inFS = (t: number) => Object.values(FS).some((w) => t >= w.from && t < w.to);
const flashAt = (f: number) => Math.max(0, ...Object.values(FS).flatMap((w) => [w.from, w.to]).map((x) => interpolate(f, [s(x) - 4, s(x), s(x) + 7], [0, 1, 0], { ...clamp, easing: easeInOut })));

/* ---------------------------------------------------------------- footage */
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(1121, Math.floor((f / FPS) * 24) + 1);
  const open = mix(p(f, 0, 24, easeOut), 1.14, 1);
  const punch = 1 + 0.06 * flashAt(f);
  return (
    <AbsoluteFill style={{ transform: `scale(${open * punch})`, transformOrigin: "540px 1150px" }}>
      <Img src={staticFile(`an6/vf/${String(idx).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.38) 26%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 72%, rgba(0,0,0,.45) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(110% 75% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};
/** green glow wash rising from the bottom on money beats */
const GreenWash: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const f = useCurrentFrame();
  const a = p(f, at, 12, easeOut) * (1 - p(f, at + dur - 12, 12, easeIn));
  return <AbsoluteFill style={{ background: `linear-gradient(0deg, rgba(34,227,122,${0.3 * a}) 0%, rgba(34,227,122,${0.06 * a}) 18%, rgba(34,227,122,0) 30%)` }} />;
};

/* ---------------------------------------------------------------- reference UI kit */
const Pop: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; from?: "up" | "left" | "right" | "scale" }> = ({ at, out = 99999, children, style, from = "scale" }) => {
  const f = useCurrentFrame();
  const b = bounce(f, at);
  const o = p(f, at, 4) * (1 - p(f, out - 6, 6, easeIn));
  const exitS = 1 - 0.12 * p(f, out - 6, 6, easeIn);
  const tr = from === "left" ? `translateX(${(1 - b) * -120}px)` : from === "right" ? `translateX(${(1 - b) * 120}px)` : from === "up" ? `translateY(${(1 - b) * 60}px)` : `scale(${Math.max(0, b) * exitS})`;
  if (f < at - 1 || f > out) return null;
  return <div style={{ ...style, opacity: o, transform: tr }}>{children}</div>;
};
/** green bar chip with typewriter text (sharp corners, like the reference) */
const TypeChip: React.FC<{ at: number; text: string; tone?: "green" | "white" | "red"; size?: number }> = ({ at, text, tone = "green", size = 40 }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [at + 3, at + 3 + text.length * 0.9], [0, text.length], clamp));
  const bg = tone === "green" ? `linear-gradient(90deg, ${G}, #18B85F)` : tone === "red" ? "linear-gradient(90deg, #FF2B3A, #C8101E)" : "#F4F4F2";
  const col = tone === "white" ? "#0A0A0A" : tone === "red" ? "#fff" : "#03170A";
  const w = bounce(f, at);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", padding: `${size * 0.32}px ${size * 0.6}px`, borderRadius: 4, background: bg, boxShadow: tone === "green" ? `0 0 40px rgba(34,227,122,.45)` : "0 12px 30px rgba(0,0,0,.45)", transform: `scaleX(${Math.min(1.08, Math.max(0, w))})`, transformOrigin: "0% 50%" }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: size, color: col, whiteSpace: "nowrap" }}>
        {text.slice(0, n)}
        <span style={{ opacity: 0 }}>{text.slice(n)}</span>
      </span>
    </div>
  );
};
/** checklist row: square checkbox + text in a gradient bar; can flip to red */
const CheckRow: React.FC<{ at: number; text: string; red?: number; tick?: number }> = ({ at, text, red, tick }) => {
  const f = useCurrentFrame();
  const r = red ? p(f, red, 6) : 0;
  const tk = tick ? p(f, tick, 6) : 0;
  const n = Math.floor(interpolate(f, [at + 4, at + 4 + text.length * 0.8], [0, text.length], clamp));
  const g = `linear-gradient(90deg, rgba(34,227,122,${0.95 - r}) 0%, rgba(34,227,122,${0.25 * (1 - r)}) 100%)`;
  const rd = `linear-gradient(90deg, rgba(255,43,58,${r}) 0%, rgba(200,16,30,${r}) 100%)`;
  return (
    <Pop at={at} from="left">
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, width: 760, padding: "16px 22px", borderRadius: 4, background: "rgba(10,14,12,.55)", overflow: "hidden" }}>
        <AbsoluteFill style={{ background: g }} />
        <AbsoluteFill style={{ background: rd }} />
        <div style={{ position: "relative", width: 34, height: 34, borderRadius: 3, background: r > 0.5 ? "#fff" : G, boxShadow: "0 0 14px rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 900, fontSize: 26, color: r > 0.5 ? "#C8101E" : "#03170A" }}>{r > 0.5 ? "✕" : tk > 0.5 ? "✓" : ""}</div>
        <span style={{ position: "relative", fontFamily: "Inter", fontWeight: 700, fontSize: 38, color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,.35)" }}>
          {text.slice(0, n)}
          <span style={{ opacity: 0 }}>{text.slice(n)}</span>
        </span>
      </div>
    </Pop>
  );
};
/** boxed tag + huge green number (counts up) */
const BigNumber: React.FC<{ at: number; tag: string; to: number; prefix?: string; suffix?: string; size?: number }> = ({ at, tag, to, prefix = "$", suffix = "", size = 190 }) => {
  const f = useCurrentFrame();
  const v = Math.round(mix(p(f, at + 2, 22, easeOut), 0, to));
  const b = bounce(f, at);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ padding: "6px 16px", border: "2px solid rgba(255,255,255,.85)", fontFamily: "Inter", fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,.35)", transform: `scale(${Math.max(0, b)})` }}>{tag}</div>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 0.95, color: G, textShadow: `0 0 40px rgba(34,227,122,.55), 0 8px 24px rgba(0,0,0,.5)`, transform: `scale(${Math.max(0, b)})`, fontVariantNumeric: "tabular-nums" }}>
        {prefix}{v.toLocaleString("en-US")}{suffix}
      </div>
    </div>
  );
};
/** green corner focus brackets (reference) */
const Brackets: React.FC<{ at: number; out: number; box: [number, number, number, number] }> = ({ at, out, box }) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const a = bounce(f, at);
  const o = 1 - p(f, out - 6, 6);
  const [x0, y0, x1, y1] = box;
  const sq = (x: number, y: number) => <div style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, background: G, boxShadow: `0 0 16px ${G}` }} />;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, k = Math.max(0, a);
  const X = (x: number) => cx + (x - cx) * (1.3 - 0.3 * k), Y = (y: number) => cy + (y - cy) * (1.3 - 0.3 * k);
  return <AbsoluteFill style={{ opacity: o }}>{sq(X(x0), Y(y0))}{sq(X(x1), Y(y0))}{sq(X(x0), Y(y1))}{sq(X(x1), Y(y1))}</AbsoluteFill>;
};
/** falling dollar bills */
const MoneyRain: React.FC<{ at: number; dur: number; count?: number; edges?: boolean }> = ({ at, dur, count = 9, edges = false }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const t = f - at;
  const fade = 1 - p(f, at + dur - 10, 10);
  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const x = edges ? (i % 2 ? 760 + rnd(i + 3) * 200 : -220 + rnd(i + 3) * 180) : rnd(i + 3) * 1000 - 60;
        const delay = rnd(i + 7) * 18;
        const v = 22 + rnd(i + 1) * 18;
        const y = -400 + Math.max(0, t - delay) * v;
        const rot = (rnd(i + 5) - 0.5) * 80 + Math.sin((t + i * 9) / 9) * 25;
        const w = edges ? 240 + rnd(i + 2) * 120 : 300 + rnd(i + 2) * 220;
        const blur = rnd(i + 4) > 0.6 ? 3 : 0;
        return <Img key={i} src={staticFile("an6/usd_notes.png")} style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot}deg) rotateX(${Math.sin((t + i * 5) / 6) * 50}deg)`, filter: `saturate(.6) hue-rotate(-10deg) brightness(.95) ${blur ? `blur(${blur}px)` : ""}`, boxShadow: "0 20px 40px rgba(0,0,0,.4)", borderRadius: 6 }} />;
      })}
    </AbsoluteFill>
  );
};
/** two-tier caption: white lead + big bouncy green keyword */
const KeyLine: React.FC<{ at: number; out: number; lead: string; keyw: string; y: number; tone?: string; size?: number }> = ({ at, out, lead, keyw, y, tone = G, size = 140 }) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out) return null;
  const o = 1 - p(f, out - 6, 6);
  const words = keyw.split(" ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 44, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,.6)", opacity: p(f, at, 5), transform: `translateY(${(1 - p(f, at, 8, easeOut)) * 14}px)` }}>{lead}</div>
      <div style={{ display: "flex", gap: 18, marginTop: -4 }}>
        {words.map((w, i) => {
          const b = bounce(f, at + 4 + i * 4);
          return (
            <span key={i} style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1, color: tone, textTransform: "uppercase", textShadow: `0 0 34px ${tone}88, 0 8px 20px rgba(0,0,0,.55)`, transform: `scale(${Math.max(0, b)}) translateY(${(1 - Math.min(1, b)) * 30}px)`, display: "inline-block" }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};
/** small words flanking the head (reference "THATS · MEANS") */
const Flank: React.FC<{ at: number; out: number; left: string; right: string; y: number }> = ({ at, out, left, right, y }) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const o = p(f, at, 6) * (1 - p(f, out - 6, 6));
  const st: React.CSSProperties = { position: "absolute", top: y, fontFamily: "Inter", fontWeight: 800, fontSize: 34, letterSpacing: 3, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.7)", opacity: o };
  return (
    <>
      <div style={{ ...st, left: 70, transform: `translateX(${(1 - bounce(f, at)) * -60}px)` }}>{left}</div>
      <div style={{ ...st, right: 70, transform: `translateX(${(1 - bounce(f, at + 3)) * 60}px)` }}>{right}</div>
    </>
  );
};

/* ---------------------------------------------------------------- normal captions (white, current word green) */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.05 && t < (LINES[k + 1]?.t0 ?? l.t1) && t < l.t1);
  if (i < 0) return null;
  const line = LINES[i];
  const inT = p(f, s(line.t0) - 2, 5);
  const fs = inFS(t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: fs ? 1420 : 640, display: "flex", justifyContent: "center", opacity: inT }}>
      <div style={{ display: "flex", gap: 12, transform: `scale(${mix(Math.min(1, bounce(f, s(line.t0) - 2, 1.2)), 0.9, 1)})` }}>
        {line.words.map((w, k) => {
          const now = t >= w.t0 && (k === line.words.length - 1 || t < line.words[k + 1].t0);
          const hot = HOT.has(w.w.replace(/[.,?]/g, "").toLowerCase());
          return (
            <span key={k} style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 46, whiteSpace: "nowrap", color: now || (hot && t >= w.t0) ? G : t >= w.t0 ? "#fff" : "rgba(255,255,255,.5)", textShadow: "0 3px 14px rgba(0,0,0,.75)", transform: now ? "translateY(-3px) scale(1.06)" : undefined, display: "inline-block" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- full-screen moments */
const Ring: React.FC<{ tone: string }> = ({ tone }) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.02 * Math.sin(f / 8);
  return (
    <div style={{ position: "absolute", left: 140, top: 420, width: 800, height: 800, borderRadius: 400, transform: `scale(${pulse})`, boxShadow: `0 0 80px 20px ${tone}, inset 0 0 80px 10px ${tone}`, border: `6px solid rgba(255,255,255,.9)`, background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,.9) 60%, rgba(0,0,0,0) 100%)" }} />
  );
};
const MoneyMoment: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 70% at 50% 75%, ${G} 0%, ${GD} 35%, #031A0C 70%, #000 100%)` }}>
      <MoneyRain at={0} dur={s(3.2)} count={11} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Inter", fontWeight: 700, fontSize: 48, color: "#fff", opacity: p(f, 3, 6) }}>Aap soch bhi nahi sakte</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
        <BigNumber at={6} tag="EK TRADE · NFP" to={5000} size={300} />
      </div>
    </AbsoluteFill>
  );
};
const SystemMoment: React.FC = () => {
  const f = useCurrentFrame();
  const B = FS.system.from;
  const strike = p(f, s(36.2 - B), 10, easeInOut);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #0B1A12 0%, #000 75%)" }}>
      <Ring tone="rgba(34,227,122,.55)" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 46, color: "#fff", opacity: p(f, 4, 6) }}>Paisa banta hai</div>
        <div style={{ fontFamily: "Anton", fontSize: 150, color: G, lineHeight: 1.05, textShadow: `0 0 40px ${G}88`, transform: `scale(${Math.max(0, bounce(f, s(34.65 - B)))})` }}>SYSTEM SE</div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 6, opacity: p(f, s(35.6 - B), 5) }}>
          <div style={{ fontFamily: "Anton", fontSize: 92, color: "rgba(255,255,255,.8)", transform: `scale(${Math.max(0, bounce(f, s(35.6 - B)))})` }}>PASEENE SE NAHI</div>
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 10, background: "#FF2B3A", transformOrigin: "left", transform: `scaleX(${strike}) rotate(-2deg)`, boxShadow: "0 0 18px rgba(255,43,58,.7)" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Full: React.FC<{ w: { from: number; to: number }; children: React.ReactNode }> = ({ w, children }) => (
  <Sequence from={s(w.from)} durationInFrames={s(w.to) - s(w.from)}>
    <FullIn>{children}</FullIn>
  </Sequence>
);
const FullIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${mix(p(f, 0, 10, easeOut), 1.12, 1)})` }}>{children}</AbsoluteFill>;
};
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const k = flashAt(f);
  return k > 0.01 ? <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 50%, rgba(255,255,255,${0.85 * k}), rgba(34,227,122,${0.5 * k}) 60%, rgba(0,0,0,${0.3 * k}) 100%)` }} /> : null;
};

const At: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);
const Center: React.FC<{ top: number; children: React.ReactNode; gap?: number }> = ({ top, children, gap = 12 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap }}>{children}</div>
);

export const AnfaalReel6: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    <GreenWash at={0} dur={s(2.9)} />
    <GreenWash at={s(13.38)} dur={s(3.1)} />
    <GreenWash at={s(41.88)} dur={s(4.8)} />
    <Brackets at={2} out={s(2.9)} box={[230, 820, 830, 1560]} />
    <Brackets at={s(10.23)} out={s(11.6)} box={[230, 820, 830, 1560]} />
    <MoneyRain at={2} dur={s(2.9)} count={8} edges />

    {/* hook: NFP profit $5,000 */}
    <At from={0.15} to={2.95}><Center top={260}><BigNumber at={2} tag="NFP PROFIT" to={5000} /></Center></At>
    {/* just one trade */}
    <At from={3.1} to={5.9}><KeyLine at={0} out={s(2.8)} lead="theek hai, just" keyw="one trade" y={300} /></At>
    {/* paisa banana hai? checklist */}
    <At from={10.23} to={13.38}>
      <Center top={250} gap={14}>
        <CheckRow at={2} text="Paisa banana hai?" tick={20} />
        <CheckRow at={s(1.6)} text="Sab se pehle yeh dekho" tick={s(2.4)} />
      </Center>
    </At>
    <At from={13.38} to={16.5}><Center top={270}><BigNumber at={2} tag="NFP PAR BANAYE" to={5000} /></Center></At>
    {/* comment CTA */}
    <At from={16.86} to={22.3}>
      <KeyLine at={0} out={s(1.96)} lead="paisa banana hai?" keyw="simple" y={300} />
      <Center top={260} gap={14}>
        <Pop at={s(1.96)}><TypeChip at={s(1.96)} text="Comment section mein" tone="white" /></Pop>
        <Pop at={s(4.2)}><TypeChip at={s(4.2)} text="likho: ACCOUNT FLIP" size={46} /></Pop>
      </Center>
    </At>
    {/* follow my trades: flank words + stacked chips */}
    <Flank at={s(22.46)} out={s(25.4)} left="MERI" right="TRADES" y={980} />
    <At from={22.46} to={25.41}><KeyLine at={0} out={s(2.95)} lead="follow karna hai?" keyw="meri trades" y={300} /></At>
    <At from={25.41} to={29.1}>
      <Center top={250} gap={10}>
        <Pop at={2} from="left"><TypeChip at={2} text="Upar community link" size={44} /></Pop>
        <Pop at={s(2.1)} from="right"><TypeChip at={s(2.1)} text="Bilkul free of cost" tone="white" size={44} /></Pop>
      </Center>
    </At>
    <At from={29.24} to={33.0}>
      <Center top={250} gap={14}>
        <CheckRow at={2} text="Har education" tick={14} />
        <CheckRow at={s(1.2)} text="Har ek system" tick={s(1.8)} />
      </Center>
    </At>
    {/* waqai paisa → follow */}
    <At from={37.29} to={39.8}><KeyLine at={0} out={s(2.5)} lead="waqai jud ke" keyw="paisa banana hai?" y={300} size={118} /></At>
    <At from={39.8} to={41.85}>
      <Center top={300}>
        <Pop at={0}>
          <div style={{ padding: "22px 64px", borderRadius: 4, background: `linear-gradient(90deg, ${G}, #18B85F)`, fontFamily: "Anton", fontSize: 70, letterSpacing: 3, color: "#03170A", boxShadow: `0 0 50px rgba(34,227,122,.6)` }}>FOLLOW KARO</div>
        </Pop>
      </Center>
    </At>
    {/* account flip: $1,000+ */}
    <At from={41.88} to={46.7}>
      <Center top={250} gap={16}>
        <Pop at={0}><TypeChip at={0} text="Account flip karna hai?" tone="white" size={42} /></Pop>
        <BigNumber at={s(2.05)} tag="MAKE SURE · KAM SE KAM" to={1000} suffix="+" size={170} />
      </Center>
    </At>

    <Full w={FS.money}><MoneyMoment /></Full>
    <Full w={FS.system}><SystemMoment /></Full>
    <Captions />
    <Flash />
  </AbsoluteFill>
);
