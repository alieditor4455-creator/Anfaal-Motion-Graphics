// Anfaal reel 10 (58.3 s) — "No market update, flu… trade lete lete, 200 pips" — reference style:
// clean white iOS UI cards, sliders/toggles/timelines, full-screen white + brand-gradient scenes with tilted cards,
// phone mock popping up, split frame with grid lines. Client branding: green/gold accent instead of the reference red.
// Light wall behind the head → captions on a white frosted plate ABOVE the head (head top ≈ 720 px), cards on the chest.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { K, clamp, easeIn, easeInOut, easeOut, mix, p } from "../Anfaal/design";
import { LINES } from "./words";

const FPS = 30;
export const R10_DURATION = 58.3;
export const R10_FRAMES = Math.round(R10_DURATION * FPS);
const s = (t: number) => Math.round(t * FPS);
const G = "#E5172F", G2 = "#B30F22", WIN = "#12B76A", GOLD = K.gold, INK = "#0F1A14", MUTED = "rgba(15,26,20,.5)";
const GRAD = `linear-gradient(100deg, #FF5A6A 0%, ${G} 55%, ${G2} 100%)`;
const soft = (f: number, at: number, st = 150, d = 15) => spring({ frame: f - at, fps: FPS, config: { stiffness: st, damping: d, mass: 0.8 } });
const At: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={s(from)} durationInFrames={s(to) - s(from)} layout="none">{children}</Sequence>
);

/* ------------------------------------------------ split + full-screen windows (source = final timeline) */
const SPLIT = { from: 8.13, to: 16.94 };

/* ------------------------------------------------ footage + camera */
const ZOOM: [number, number][] = [[0, 1.12], [0.8, 1.0], [2.76, 1.05], [5.09, 1.0], [25.29, 1.06], [30.84, 1.0], [39.98, 1.06], [45.73, 1.0], [47.94, 1.05], [53.11, 1.0], [58.3, 1.05]];
const zoomAt = (t: number) => interpolate(t, ZOOM.map((z) => z[0]), ZOOM.map((z) => z[1]), { ...clamp, easing: easeInOut });
const Frame: React.FC<{ t: number }> = ({ t }) => (
  <Img src={staticFile(`an10/vf/${String(Math.min(1400, Math.floor(t * 24) + 1)).padStart(5, "0")}.jpg`)} style={{ width: 1080, height: 1920, display: "block" }} />
);
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // split: footage shrinks into a rounded frame at the top while a grid world appears
  const k = interpolate(t, [SPLIT.from, SPLIT.from + 0.5, SPLIT.to - 0.45, SPLIT.to], [0, 1, 1, 0], { ...clamp, easing: easeInOut });
  const W = mix(k, 1080, 600), H = mix(k, 1920, 600), X = (1080 - W) / 2, Y = mix(k, 0, 440);
  return (
    <AbsoluteFill style={{ background: "#E9ECEA" }}>
      {k > 0 ? <GridWorld k={k} /> : null}
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, overflow: "hidden", borderRadius: mix(k, 0, 44), boxShadow: k ? `0 30px 80px rgba(0,0,0,${0.3 * k})` : undefined, border: k ? `${3 * k}px solid rgba(255,255,255,.9)` : undefined }}>
        <div style={{ position: "absolute", left: (W - 1080) / 2, top: mix(k, 0, -700), transform: `scale(${zoomAt(t) * mix(k, 1, 0.62)})`, transformOrigin: "540px 1000px" }}>
          <Frame t={t} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.18) 28%, rgba(0,0,0,0) 40%)" }} />
      </div>
    </AbsoluteFill>
  );
};
const GridWorld: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <AbsoluteFill style={{ filter: "blur(22px) grayscale(1) brightness(.75)", transform: "scale(1.15)" }}><Frame t={f / FPS} /></AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[240, 840].map((x, i) => <line key={"v" + i} x1={x} x2={x} y1={0} y2={1920 * k} stroke="rgba(255,255,255,.75)" strokeWidth={2} />)}
        {[440, 1040, 1120, 1840].map((y, i) => <line key={"h" + i} x1={0} x2={1080 * k} y1={y} y2={y} stroke="rgba(255,255,255,.75)" strokeWidth={2} />)}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ captions above the head: no box, bold white + shadow, keyword in a red pill */
const SH = "0 3px 0 rgba(0,0,0,.25), 0 6px 22px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)";
const SyncedCaptions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = LINES.findIndex((l, k) => t >= l.t0 - 0.08 && t < Math.min(LINES[k + 1]?.t0 ?? 1e9, l.t1 + 0.6));
  if (i < 0) return null;
  const line = LINES[i];
  const end = Math.min(LINES[i + 1]?.t0 ?? 1e9, line.t1 + 0.6);
  const out = p(f, s(end) - 5, 5, easeIn);
  const appear = (wt: number) => p(f, s(wt) - 1, 6, easeOut);
  const light = [[17.2, 19.94], [37.0, 39.85]].some(([a, b]) => t >= a && t < b); // white full-screen scenes → dark ink
  // group consecutive hero words into one pill
  const items: { hero: boolean; words: { w: string; t: number }[] }[] = [];
  for (const w of line.words) {
    const last = items[items.length - 1];
    if (last && last.hero === w.hero && w.hero) last.words.push(w); else items.push({ hero: w.hero, words: [w] });
  }
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 190, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: 14, rowGap: 8, opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined }}>
      {items.map((it, k) => {
        if (!it.hero) {
          const w = it.words[0]; const a = appear(w.t); const b = soft(f, s(w.t) - 1, 220, 14);
          return <span key={k} style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 64, letterSpacing: -2, lineHeight: 1.1, color: light ? INK : "#fff", textShadow: light ? "none" : SH, opacity: a, display: "inline-block", transform: `translateY(${(1 - Math.min(b, 1)) * 26}px) scale(${mix(Math.min(b, 1.08), 0.85, 1)})`, filter: `blur(${(1 - a) * 6}px)` }}>{w.w.replace(/[,.]$/, "")}</span>;
        }
        const t0 = it.words[0].t; const a = appear(t0); const b = soft(f, s(t0) - 1, 200, 12);
        return (
          <span key={k} style={{ display: "inline-flex", gap: 14, padding: "4px 24px 10px", borderRadius: 20, background: GRAD, boxShadow: `0 14px 34px ${G}77, inset 0 2px 0 rgba(255,255,255,.3)`, opacity: a, transform: `rotate(-2deg) translateY(${(1 - Math.min(b, 1)) * 34}px) scale(${mix(Math.min(b, 1.12), 0.6, 1)})` }}>
            {it.words.map((w, j) => <span key={j} style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 70, letterSpacing: -2.4, lineHeight: 1.1, color: "#fff", opacity: appear(w.t) }}>{w.w.toLowerCase().replace(/[,.]/g, "")}</span>)}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------ iOS-style UI kit */
const cardS: React.CSSProperties = { background: "#fff", borderRadius: 40, boxShadow: "0 30px 70px rgba(0,0,0,.22), 0 2px 0 rgba(255,255,255,.9) inset", border: "1px solid rgba(0,0,0,.06)" };
const Head: React.FC<{ icon: string; title: string; tint?: string }> = ({ icon, title, tint = G }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 900, fontSize: 28, color: "#fff" }}>{icon}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: INK, letterSpacing: -0.6 }}>{title}</div>
    </div>
    <div style={{ padding: "4px 14px", borderRadius: 20, background: "rgba(15,26,20,.06)", fontFamily: "Inter", fontWeight: 900, fontSize: 26, color: MUTED, letterSpacing: 2 }}>•••</div>
  </div>
);
/** card that pops onto the chest (enter: scale-up + blur, exit: drop + blur) */
const Pop: React.FC<{ dur: number; children: React.ReactNode; top?: number; w?: number }> = ({ dur, children, top = 400, w = 820 }) => {
  const f = useCurrentFrame();
  const a = soft(f, 0, 170, 14), o = p(f, dur - 8, 8, easeIn);
  return (
    <div style={{ position: "absolute", left: (1080 - w) / 2, top, width: w, opacity: Math.min(1, a * 1.4) * (1 - o), transform: `translateY(${(1 - Math.min(a, 1)) * -60 + o * -40}px) scale(${mix(Math.min(a, 1.06), 0.7, 1) * mix(o, 1, 0.92)})`, filter: (a < 0.6 || o > 0) ? `blur(${Math.max(0, 0.6 - a) * 18 + o * 12}px)` : undefined, transformOrigin: "50% 0%" }}>
      {children}
    </div>
  );
};
/** slider with labelled stops; knob travels to `to` (0..1) between frames a..b */
const Slider: React.FC<{ stops: string[]; a: number; b: number; to: number; tint?: string; from?: number }> = ({ stops, a, b, to, tint = G, from = 0 }) => {
  const f = useCurrentFrame();
  const v = mix(p(f, a, b - a, easeInOut), from, to);
  return (
    <div style={{ marginTop: 34 }}>
      <div style={{ position: "relative", height: 14, borderRadius: 7, background: "rgba(15,26,20,.1)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 7, background: tint }} />
        <div style={{ position: "absolute", left: `calc(${v * 100}% - 26px)`, top: -19, width: 52, height: 52, borderRadius: 26, background: "#fff", border: `6px solid ${tint}`, boxShadow: `0 6px 18px ${tint}66` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
        {stops.map((x, i) => <span key={i} style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: Math.abs(v - i / (stops.length - 1)) < 0.2 ? INK : MUTED }}>{x}</span>)}
      </div>
    </div>
  );
};
const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 120, height: 66, borderRadius: 33, background: on > 0.5 ? G : "rgba(15,26,20,.16)", position: "relative", transition: "none" }}>
    <div style={{ position: "absolute", top: 6, left: mix(on, 6, 60), width: 54, height: 54, borderRadius: 27, background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,.25)" }} />
  </div>
);

/* ------------------------------------------------ chest cards */
const UpdateCard: React.FC = () => {
  const f = useCurrentFrame();
  const off = p(f, s(1.3), 10, easeInOut);
  return (
    <div style={{ ...cardS, padding: "28px 34px" }}>
      <Head icon="↗" title="Market update" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
        <div>
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 46, color: INK, letterSpacing: -1.5 }}>Today</div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: off > 0.5 ? "#E5484D" : G }}>{off > 0.5 ? "not posted" : "scheduled"}</div>
        </div>
        <Toggle on={1 - off} />
      </div>
    </div>
  );
};
const HealthCard: React.FC = () => (
  <div style={{ ...cardS, padding: "28px 34px" }}>
    <Head icon="+" title="Health status" tint="#E5484D" />
    <Slider stops={["Fit", "Tired", "Flu"]} a={8} b={44} to={1} tint="#E5484D" />
  </div>
);
const LessonCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = soft(f, 10);
  return (
    <div style={{ ...cardS, padding: "26px 34px", display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 86, height: 86, borderRadius: 24, background: `linear-gradient(135deg, ${GOLD}, #C9963E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, transform: `scale(${mix(Math.min(a, 1.1), 0.5, 1)})` }}>💡</div>
      <div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: MUTED, letterSpacing: 3 }}>LESSON</div>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 44, color: INK, letterSpacing: -1.4 }}>Hamesha seekha hai</div>
      </div>
    </div>
  );
};
/** split: vertical timeline (reference "Reels montaj → Motion" card) */
const TimelineCard: React.FC = () => {
  const f = useCurrentFrame();
  const steps: [number, string, string][] = [[0.3, "Trading field", "aisi field mein ho"], [11.05 - SPLIT.from, "Kahin bhi ho", "ghar, safar, kahin pe bhi"], [13.96 - SPLIT.from, "Sirf mobile + internet", "bas yehi chahiye"]];
  const prog = interpolate(f, steps.map((x) => s(x[0])), [0, 0.5, 1], clamp);
  const a = soft(f, s(0.35));
  const o = p(f, s(SPLIT.to - SPLIT.from) - 12, 12, easeIn);
  return (
    <div style={{ position: "absolute", left: 160, top: 1150, width: 760, opacity: Math.min(1, a) * (1 - o), transform: `translateY(${(1 - Math.min(a, 1)) * 140 + o * 80}px)` }}>
      <div style={{ ...cardS, padding: "40px 44px", position: "relative" }}>
        <div style={{ position: "absolute", left: 76, top: 70, width: 6, height: 440, borderRadius: 3, background: "rgba(15,26,20,.1)" }} />
        <div style={{ position: "absolute", left: 76, top: 70, width: 6, height: 440 * prog, borderRadius: 3, background: G }} />
        {steps.map(([t, h, sub], i) => {
          const on = p(f, s(t), 8);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 34, height: 220, marginTop: i ? 0 : -40, position: "relative" }}>
              <div style={{ width: 70, height: 70, flex: "none", borderRadius: 35, background: "#fff", border: `6px solid ${on > 0.5 ? G : "rgba(15,26,20,.18)"}`, boxShadow: on > 0.5 ? `0 0 0 ${10 * on}px ${G}22` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 26 * on, height: 26 * on, borderRadius: 13, background: G }} />
              </div>
              <div style={{ opacity: mix(on, 0.35, 1), transform: `translateX(${(1 - on) * 20}px)` }}>
                <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 46, color: INK, letterSpacing: -1.5 }}>{h}</div>
                <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 28, color: MUTED }}>{sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------ full-screen scenes */
const Scene: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const f = useCurrentFrame();
  // clean entry: the scene grows out of a rounded card from the centre; exit: zoom-through + blur
  const i = p(f, 0, 14, easeOut), o = p(f, dur - 10, 10, easeIn);
  const r = mix(i, 0.2, 1);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${(1 - r) * 50}% ${(1 - r) * 50}% round ${mix(i, 120, 0)}px)`, opacity: 1 - o, transform: `scale(${mix(o, 1, 1.12)})`, filter: o ? `blur(${o * 16}px)` : undefined }}>
      <AbsoluteFill style={{ background: bg }} />
      {children}
    </AbsoluteFill>
  );
};
const Title: React.FC<{ text: string; at: number; top: number; color?: string; size?: number }> = ({ text, at, top, color = INK, size = 76 }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 18 }}>
      {words.map((w, k) => {
        const a = p(f, at + k * 3, 10);
        return <span key={k} style={{ fontFamily: "Inter", fontWeight: 700, fontSize: size, letterSpacing: -2.6, color, opacity: a, filter: `blur(${(1 - a) * 10}px)`, transform: `translateY(${(1 - a) * 24}px)`, display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
};
/** 16.94–19.94 (+ hold into news): forex needs only two things — app tiles + slider */
const TilesScene: React.FC = () => {
  const f = useCurrentFrame();
  const L = s(19.94 - 16.94);
  const tiles: [string, string, string, number][] = [["Mobile", "📱", "linear-gradient(160deg, #5BC2FF, #1E7FE0)", 8], ["Internet", "📶", "linear-gradient(160deg, #FF7A86, #E5172F)", 16], ["Office", "🏢", "linear-gradient(160deg, #D9DEDB, #AEB7B2)", 24]];
  return (
    <Scene dur={L} bg="radial-gradient(90% 60% at 50% 45%, #FFFFFF 0%, #EEF2EF 100%)">
      <Title text="Forex mein sirf" at={4} top={640} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 34 }}>
        {tiles.map(([name, ic, bg, at], i) => {
          const a = soft(f, at, 170, 13);
          const off = i === 2 ? p(f, 50, 10) : 0;
          return (
            <div key={name} style={{ width: 260, height: 260, borderRadius: 54, background: bg, boxShadow: "0 26px 50px rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.5)", position: "relative", opacity: Math.min(1, a) * mix(off, 1, 0.35), transform: `translateY(${(1 - Math.min(a, 1)) * 90}px) scale(${mix(Math.min(a, 1.08), 0.6, 1) * mix(off, 1, 0.9)})`, filter: off ? `grayscale(${off})` : undefined }}>
              <div style={{ position: "absolute", right: 22, top: 12, fontFamily: "Inter", fontWeight: 900, fontSize: 24, color: "rgba(255,255,255,.85)", letterSpacing: 2 }}>•••</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 58, textAlign: "center", fontSize: 92 }}>{ic}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: "Inter", fontWeight: 700, fontSize: 36, color: "#fff", letterSpacing: -0.8 }}>{name}</div>
              {i === 2 && off > 0 ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 900, fontSize: 180, color: "#E5484D", opacity: off }}>✕</div> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, top: 1130 }}><Slider stops={["", "2 cheezein", ""]} a={20} b={56} to={0.5} /></div>
    </Scene>
  );
};
/** 19.94–25.29: news day — brand gradient, tilted cards fanned behind a news card */
const NewsScene: React.FC = () => {
  const f = useCurrentFrame();
  const L = s(25.29 - 19.94);
  const fan = soft(f, 6, 120, 16);
  const rot = interpolate(f, [0, L], [-2, 2]);
  const hit = p(f, s(22.75 - 19.94), 8);
  return (
    <Scene dur={L} bg={`radial-gradient(100% 70% at 50% 40%, #FF6B78 0%, ${G} 50%, #8E0A1A 100%)`}>
      {[[-22, -330, "First impact"], [20, 330, "USD"], [-10, -250, "Volatility"], [12, 260, "Gold"]].map(([r, x, l], i) => (
        <div key={i} style={{ position: "absolute", left: 540 - 230 + (x as number) * fan, top: 820 + (i > 1 ? 330 : 0), width: 460, height: 300, borderRadius: 34, background: "rgba(255,255,255,.88)", transform: `rotate(${(r as number) * fan + rot}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,.25)", opacity: 0.75 * fan, filter: "blur(2px)", padding: 30, fontFamily: "Inter", fontWeight: 700, fontSize: 34, color: G2 }}>● {l}</div>
      ))}
      <div style={{ position: "absolute", left: 170, top: 700, width: 740, transform: `rotate(${rot * 0.5}deg) scale(${mix(Math.min(soft(f, 2), 1), 0.7, 1)})` }}>
        <div style={{ ...cardS, padding: "34px 38px" }}>
          <Head icon="$" title="Economic calendar" />
          <div style={{ marginTop: 28, padding: "24px 26px", borderRadius: 26, background: "#F3F6F4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: MUTED }}>USD · Today</span>
              <span style={{ padding: "6px 16px", borderRadius: 12, background: "#E5484D", fontFamily: "Inter", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: 1 }}>HIGH IMPACT</span>
            </div>
            <div style={{ marginTop: 10, fontFamily: "Inter", fontWeight: 800, fontSize: 52, letterSpacing: -2, color: INK, opacity: mix(hit, 0.35, 1) }}>Core Retail Sales</div>
          </div>
        </div>
        <div style={{ marginTop: -26, marginLeft: 40, marginRight: 40, padding: "26px 0 22px", borderRadius: "0 0 34px 34px", background: GRAD, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: -1.5, boxShadow: "0 20px 50px rgba(0,0,0,.3)", transform: `translateY(${(1 - hit) * -40}px)`, opacity: hit }}>News day</div>
      </div>
    </Scene>
  );
};
/** 36.8–39.98: chart full screen — sell 3857, TP hit, +200 pips */
const ChartScene: React.FC = () => {
  const f = useCurrentFrame();
  const L = s(39.98 - 36.8);
  const W = 820, k = W / 792, y0 = 120, y1 = 1420;
  const tp = p(f, 34, 10);
  const pips = Math.round(interpolate(f, [30, 70], [0, 200], { ...clamp, easing: easeOut }));
  const line = (y: number, c: string, text: string, at: number, hit?: boolean) => {
    const a = p(f, at, 10);
    return (
      <div style={{ position: "absolute", left: 0, top: (y - y0) * k - 2, width: 640 * k * a, borderTop: `4px dashed ${c}` }}>
        <div style={{ position: "absolute", left: 14, top: -46, padding: "5px 14px", borderRadius: 10, background: hit && tp > 0.5 ? WIN : c, fontFamily: "Inter", fontWeight: 800, fontSize: 24, color: "#fff", opacity: a, whiteSpace: "nowrap" }}>{hit && tp > 0.5 ? text + "  HIT ✓" : text}</div>
      </div>
    );
  };
  const st = soft(f, 70, 170, 12);
  return (
    <Scene dur={L} bg="radial-gradient(90% 60% at 50% 45%, #FFFFFF 0%, #EEF2EF 100%)">
      <div style={{ position: "absolute", left: (1080 - W) / 2, top: 470, width: W, height: (y1 - y0) * k, borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.2)", border: "1px solid rgba(0,0,0,.08)", transform: `scale(${interpolate(f, [0, L], [1, 1.04])})` }}>
        <div style={{ position: "absolute", left: 0, top: -y0 * k, width: W, height: 1600 * k }}>
          <Img src={staticFile("an10/chart.jpg")} style={{ width: W, height: 1600 * k }} />
        </div>
        {line(614, GOLD, "SELL 3857", 4)}
        {line(254, "#E5484D", "SL 3868", 10)}
        {line(1010, "#3FA877", "TP1 3845", 16, true)}
        {line(1338, "#3FA877", "TP2 3835", 20, true)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, display: "flex", justifyContent: "center", gap: 20, alignItems: "center" }}>
        <div style={{ padding: "16px 34px", borderRadius: 24, background: GRAD, fontFamily: "Inter", fontWeight: 900, fontSize: 72, letterSpacing: -2, color: "#fff", boxShadow: `0 20px 50px ${G}66`, opacity: p(f, 28, 6), transform: `scale(${mix(Math.min(st, 1.15), 1, 1.08)})` }}>+{pips} pips</div>
        <div style={{ padding: "14px 24px", borderRadius: 20, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,.15)", fontFamily: "Inter", fontWeight: 800, fontSize: 34, color: INK, opacity: p(f, 20, 8) }}>⏱ 1 min</div>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------ phone mock popping out of the chest (signals) */
const PhonePop: React.FC = () => {
  const f = useCurrentFrame();
  const L = s(36.8 - 30.84);
  const a = soft(f, 0, 110, 15), o = p(f, L - 12, 12, easeIn);
  const y = mix(Math.min(a, 1), 1500, 470) + o * 900;
  const sc = mix(Math.min(a, 1), 0.35, 1) * mix(o, 1, 0.4);
  const ry = mix(Math.min(a, 1), -35, -6) + o * -30, rz = mix(Math.min(a, 1), 14, -3);
  const scroll = 0;
  const PW = 560, PH = 1180, k = (PW - 28) / 736;
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div style={{ position: "absolute", left: (1080 - PW) / 2, top: y, width: PW, height: PH, borderRadius: 78, background: "#0B0B0B", padding: 14, transform: `rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`, transformOrigin: "50% 0%", boxShadow: "0 50px 100px rgba(0,0,0,.45), inset 0 0 0 3px #333", opacity: 1 - o * 0.6 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 64, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: -scroll * k, width: PW - 28 }}>
            <Img src={staticFile("an10/signals.jpg")} style={{ width: PW - 28, display: "block" }} />
            {[[240, 84, "SELL"], [546, 84, "SL"], [690, 132, "TPs"]].map(([yy, hh, l], i) => {
              const h = p(f, s(1.6) + i * 9, 8);
              return <div key={i} style={{ position: "absolute", left: 22 * k, top: (yy as number) * k, width: 690 * k, height: (hh as number) * k, borderRadius: 26, border: `4px solid ${G}`, boxShadow: `0 0 24px ${G}`, opacity: h }} />;
            })}
          </div>
          <div style={{ position: "absolute", left: "50%", top: 12, width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: "#000" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1680, display: "flex", justifyContent: "center", opacity: p(f, s(1.6), 8) * (1 - o) }}>
        <div style={{ padding: "14px 30px", borderRadius: 22, background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,.25)", fontFamily: "Inter", fontWeight: 800, fontSize: 40, color: INK }}>GOLD <span style={{ color: "#E5484D" }}>SELL</span> · 3857</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ more chest cards */
const NoTradeCard: React.FC = () => {
  const f = useCurrentFrame();
  const off = p(f, 26, 10, easeInOut);
  return (
    <div style={{ ...cardS, padding: "28px 34px" }}>
      <Head icon="!" title="Small news" tint="#E8A23B" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 44, color: INK, letterSpacing: -1.4 }}>Trade karwana</div>
        <Toggle on={1 - off} />
      </div>
    </div>
  );
};
const MoneyCard: React.FC = () => {
  const f = useCurrentFrame();
  const pk = soft(f, s(45.73 - 39.98));
  return (
    <div style={{ ...cardS, padding: "28px 34px" }}>
      <Head icon="$" title="Paisa banana" tint={GOLD} />
      <Slider stops={["Seekhna", "Trade", "Profit"]} a={s(42.6 - 39.98)} b={s(44.6 - 39.98)} to={1} tint={G} />
      <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, pk), transform: `scale(${mix(Math.min(pk, 1.1), 0.8, 1)})`, transformOrigin: "left" }}>
        <span style={{ padding: "8px 18px", borderRadius: 14, background: "#01411C", fontFamily: "Inter", fontWeight: 800, fontSize: 28, color: "#fff" }}>☾ PK</span>
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32, color: INK }}>Pakistan mein baithe baithe</span>
      </div>
    </div>
  );
};
/** 47.94–53.11: bio card with channel link tap */
const BioCard: React.FC = () => {
  const f = useCurrentFrame();
  const tap = s(50.3 - 47.94), joined = p(f, s(52.2 - 47.94), 8);
  const ring = p(f, tap, 16);
  return (
    <div style={{ ...cardS, padding: "30px 34px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 104, height: 104, borderRadius: 52, padding: 4, background: GRAD }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 44, color: G2 }}>AP</div>
        </div>
        <div>
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 38, color: INK, letterSpacing: -1 }}>imanfaalpervaiz</div>
          <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 26, color: MUTED }}>Forex · Gold · Daily setups</div>
        </div>
      </div>
      <div style={{ position: "relative", marginTop: 24, padding: "18px 22px", borderRadius: 22, background: p(f, tap, 6) > 0.5 ? `${G}1A` : "#F3F6F4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32, color: G2 }}>🔗 Channel link</span>
        <span style={{ padding: "10px 24px", borderRadius: 16, background: joined > 0.5 ? G : INK, fontFamily: "Inter", fontWeight: 800, fontSize: 28, color: "#fff", transform: `scale(${mix(joined, 1, 1.08)})` }}>{joined > 0.5 ? "Joined ✓" : "Join"}</span>
        {f >= tap ? <div style={{ position: "absolute", left: 160 - 60 * ring, top: 40 - 60 * ring, width: 120 * ring, height: 120 * ring, borderRadius: 999, border: `4px solid ${G}`, opacity: 1 - ring }} /> : null}
        {f >= tap - 14 ? <div style={{ position: "absolute", left: 150, top: 30 + (1 - p(f, tap - 14, 14)) * 120, fontSize: 64, opacity: 1 - p(f, tap + 20, 10) }}>👆</div> : null}
      </div>
    </div>
  );
};
/** 53.11–58.3: contact chat */
const ChatCard: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = soft(f, s(55.0 - 53.11)), b2 = soft(f, s(57.0 - 53.11));
  return (
    <div style={{ ...cardS, padding: "28px 30px" }}>
      <Head icon="✆" title="Number in bio" />
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ alignSelf: "flex-end", maxWidth: 560, padding: "16px 24px", borderRadius: "28px 28px 8px 28px", background: G, fontFamily: "Inter", fontWeight: 600, fontSize: 32, color: "#fff", opacity: Math.min(1, b1), transform: `scale(${mix(Math.min(b1, 1.05), 0.6, 1)})`, transformOrigin: "right bottom" }}>Assalam o alaikum, details?</div>
        <div style={{ alignSelf: "flex-start", maxWidth: 560, padding: "16px 24px", borderRadius: "28px 28px 28px 8px", background: "#EEF1EF", fontFamily: "Inter", fontWeight: 600, fontSize: 32, color: INK, opacity: Math.min(1, b2), transform: `scale(${mix(Math.min(b2, 1.05), 0.6, 1)})`, transformOrigin: "left bottom" }}>Har detail bata dunga ✓</div>
      </div>
    </div>
  );
};

const Card: React.FC<{ from: number; to: number; children: React.ReactNode; top?: number }> = ({ from, to, children, top }) => (
  <At from={from} to={to}><Pop dur={s(to) - s(from)} top={top}>{children}</Pop></At>
);

export const AnfaalReel10: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Footage />
      <Card from={0.4} to={2.7}><UpdateCard /></Card>
      <Card from={2.8} to={5.05}><HealthCard /></Card>
      <Card from={5.2} to={8.05}><LessonCard /></Card>
      <At from={SPLIT.from} to={SPLIT.to}><TimelineCard /></At>
      <At from={16.94} to={19.94 + 0.35}><TilesScene /></At>
      <At from={19.94} to={25.29}><NewsScene /></At>
      <Card from={25.35} to={30.75}><NoTradeCard /></Card>
      <At from={30.84} to={36.8}><PhonePop /></At>
      <At from={36.8} to={39.98}><ChartScene /></At>
      <Card from={40.05} to={47.85}><MoneyCard /></Card>
      <Card from={47.94} to={53.05}><BioCard /></Card>
      <Card from={53.11} to={58.3}><ChatCard /></Card>
      <SyncedCaptions />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("an10/grain.png")})`, backgroundSize: "380px 380px", mixBlendMode: "overlay", opacity: 0.05 }} />
      <OpenFlash />
    </AbsoluteFill>
  );
};
const OpenFlash: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - p(f, 0, 12, easeOut);
  return k > 0.01 ? <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${0.85 * k})` }} /> : null;
};
