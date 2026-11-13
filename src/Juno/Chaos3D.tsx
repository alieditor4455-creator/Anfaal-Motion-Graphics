// Juno — "60-hour weeks, data entry, all hands-on deck chaos." — 3D glass world (CSS 3D, real perspective camera).
// Juno foundation: Juno Black, Juno Green, two centred lines, no red, Dave only on his (glass) slab.
//  60-hour weeks : Dave's glass slab inside a tilted 3D clock ring; glass spheres orbit in depth (behind/below him).
//  data entry    : camera swings to a stack of frosted-glass tax forms floating in space; spheres fly in and fill the fields.
//  chaos         : camera pulls back and orbits; spheres on tangled inclined orbits, forms tumbling behind him.
//  strike        : green strike; the camera squares up and everything lands flat in one calm layout. Still ending.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

export const C3D_FPS = 60;
export const C3D_FRAMES = Math.round(5.7 * C3D_FPS);
const SRC_FPS = 24, SRC_N = 107;

[["Outfit", 400, "Outfit-400"], ["Outfit", 700, "Outfit-700"], ["Caveat", 500, "Caveat-500"]].forEach(([family, weight, f]) =>
  loadFont({ family: family as string, weight: String(weight), url: staticFile(`juno/fonts/${f}.woff2`) }));

const GLIDE = Easing.bezier(0.22, 1, 0.36, 1);
const SWAP = Easing.bezier(0.65, 0, 0.35, 1);
const SIN = Easing.inOut(Easing.sin);
const pr = (t: number, a: number, b: number, e = GLIDE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const vis = (t: number, i0: number, i1: number, o0: number, o1: number, e = GLIDE) => pr(t, i0, i1, e) * (1 - pr(t, o0, o1, SWAP));
const rad = (d: number) => (d * Math.PI) / 180;

const T = { bg: "#1E1E1E", green: "#1CE49B", ink: "#F8F9FA", soft: "rgba(248,249,250,.78)", grid: "rgba(248,249,250,.03)" };
const ORIGIN = { x: 540, y: 1015 }, PERSP = 1500;
const SW = 420, SH = 510;                                   // Dave's slab
const CROP = { x: 90, y: 430, w: 900, h: 1093 };
type V = [number, number, number];
const mixV = (a: V, b: V, p: number): V => [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)];

// ---- spheres ----
const RR = 440, BASE = [-90, -30, 30, 90, 150, 210], DIR = [1, -1, 1, -1, 1, -1];
const INCL = [42, 58, 70, 48, 64, 52], ZROT = [0, 25, -20, -30, 15, -10], SGN = [1, -1, 1, -1, 1, -1];
const wind = (t: number) => 360 * 1.15 * pr(t, 0.25, 1.5, SIN);
const orbitPt = (aRad: number, incl: number, sgn: number, zrot: number, R = RR): V => {
  const x0 = R * Math.cos(aRad), y0 = R * Math.sin(aRad) * Math.sin(rad(incl)) * sgn, z0 = R * Math.sin(aRad) * Math.cos(rad(incl));
  const c = Math.cos(rad(zrot)), s = Math.sin(rad(zrot)); return [x0 * c - y0 * s, x0 * s + y0 * c, z0];
};
// ---- forms ----
const FY_ROT = -22;
const FORM_B: { p: V; r: V }[] = [{ p: [560, 0, -60], r: [0, FY_ROT, 0] }, { p: [612, -22, -150], r: [0, FY_ROT, 6] }, { p: [505, -34, -240], r: [0, FY_ROT, -8] }];
const FORM_C: V[] = [[570, 340, -200], [610, -330, -300], [-590, -60, -300]];
const FORM_D: V[] = [[0, 470, 0], [300, 470, 0], [-300, 470, 0]];
const DIP = (p: number) => Math.sin(Math.PI * p); // detour so nothing ever passes in front of Dave
const LABELS = ["W-2", "1099", "K-1"];
const FW = 300, FH = 400;
const fieldWorld = (r: number): V => { const lx = -108, ly = -66 + r * 40, th = rad(FY_ROT); const P = FORM_B[0].p;
  return [P[0] + lx * Math.cos(th) + 14 * Math.sin(th), P[1] + ly, P[2] - lx * Math.sin(th) + 14 * Math.cos(th)]; };
const FIN: V[] = [[-350, -175, 0], [-350, 0, 0], [-350, 175, 0], [350, -175, 0], [350, 0, 0], [350, 175, 0]];

const ROLL = 0.6;
const Roll: React.FC<{ t: number; items: [number, React.ReactNode][]; cls: React.CSSProperties; h: number }> = ({ t, items, cls, h }) => {
  let k = -1; items.forEach(([s], i) => { if (t >= s) k = i; });
  const p = k >= 0 ? pr(t, items[k][0], items[k][0] + ROLL, k === 0 ? GLIDE : SWAP) : 0;
  const prev = k > 0 ? items[k - 1][1] : null; const cur = k >= 0 ? items[k][1] : null;
  const row = (node: React.ReactNode, y: number, op: number, blur: number) => node == null ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", transform: `translateY(${y}%)`, opacity: op, filter: `blur(${blur}px)` }}>{node}</div>);
  return <div style={{ position: "relative", height: h, overflow: "hidden", ...cls }}>{row(prev, -90 * p, 1 - p, 4 * p)}{row(cur, 90 * (1 - p), p, 4 * (1 - p))}</div>;
};
const P3: React.CSSProperties = { position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d" };

export const JunoChaos3D: React.FC = () => {
  const f = useCurrentFrame(); const t = f / C3D_FPS;
  const p1 = pr(t, 1.45, 2.3, SIN), p2 = pr(t, 2.55, 3.4, SIN), p3 = pr(t, 4.45, 5.15, SIN);
  const tau = t < 4.45 ? t : 4.45 + 0.35 * Easing.out(Easing.quad)(Math.min(1, (t - 4.45) / 0.7));

  // camera
  const cA = { rx: -6, ry: mix(-16, 8, pr(t, 0, 1.6, SIN)), tx: 0, tz: 0, pull: mix(560, 150, pr(t, 0, 1.1, GLIDE)) };
  const cB = { rx: -8, ry: mix(26, 20, pr(t, 1.5, 2.6, SIN)), tx: 290, tz: -40, pull: 60 };
  const cC = { rx: -10, ry: mix(-16, 16, pr(t, 2.55, 5.15, SIN)), tx: 0, tz: 0, pull: 320 };
  const cD = { rx: 0, ry: 0, tx: 0, tz: 0, pull: 0 };
  const camK = (k: keyof typeof cA) => mix(mix(mix(cA[k], cB[k], p1), cC[k], p2), cD[k], p3);
  const cam = { rx: camK("rx"), ry: camK("ry"), tx: camK("tx"), tz: camK("tz"), pull: camK("pull") };
  const world = `translate3d(0,0,${-cam.pull}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) translate3d(${-cam.tx}px,0,${-cam.tz}px)`;
  const bill = `rotateY(${-cam.ry}deg) rotateX(${-cam.rx}deg)`;
  const viewZ = (p: V) => { const x = p[0] - cam.tx, z = p[2] - cam.tz; const cy = Math.cos(rad(cam.ry)), sy = Math.sin(rad(cam.ry));
    const z1 = -x * sy + z * cy; return p[1] * Math.sin(rad(cam.rx)) + z1 * Math.cos(rad(cam.rx)); };

  // footage
  const k = Math.max(SW / CROP.w, SH / CROP.h);
  const idx = Math.min(SRC_N, Math.floor(t * SRC_FPS) + 1);
  const imgL = -CROP.x * k + (SW - CROP.w * k) / 2, imgT = -CROP.y * k + (SH - CROP.h * k) / 2;
  const intro = pr(t, 0, 0.7);

  // spheres
  const spheres = [0, 1, 2, 3, 4, 5].map((i) => {
    const A = orbitPt(rad(BASE[i] + 0.22 * wind(t)), 42, 1, 0);
    const B = fieldWorld(i);
    const C = orbitPt(rad(BASE[i]) + DIR[i] * 1.0 * (tau - 2.55), INCL[i], SGN[i], ZROT[i]);
    const q1 = pr(t, 1.5 + i * 0.03, 2.35 + i * 0.03, SIN);
    const pos0 = mixV(mixV(mixV(A, B, q1), C, p2), FIN[i], p3);
    const pos: V = [pos0[0], pos0[1], pos0[2] - 700 * DIP(q1) - 450 * DIP(p2) - 520 * DIP(p3)];
    const d = mix(mix(mix(92 * pr(t, 0.1 + i * 0.05, 0.7 + i * 0.05), 30, q1), 80, p2), 100, p3);
    const vz = viewZ(pos);
    return { i, pos, d, blur: Math.max(0, Math.min(1, (Math.abs(vz) - 300) / 260)) * 2.5 * (1 - p3), dimm: Math.max(0.55, Math.min(1, 1 + vz / 900)) };
  });

  // forms
  const formsIn = pr(t, 1.55, 2.15, SIN);
  const forms = [0, 1, 2].map((j) => {
    const B = FORM_B[j];
    const bob: V = [0, 26 * Math.sin(1.3 * tau + j * 2), 0];
    const C: V = [FORM_C[j][0], FORM_C[j][1] + bob[1], FORM_C[j][2]];
    const rC: V = [28 * Math.sin(1.1 * tau + j) + (j - 1) * 20, 60 * (tau - 2.55) * (j % 2 ? -1 : 1) + j * 40, 18 * Math.sin(0.9 * tau + j * 1.7)];
    const pos0 = mixV(mixV(B.p, C, p2), FORM_D[j], p3);
    const pos: V = [pos0[0], pos0[1] + (j === 2 ? 640 * DIP(p2) : 0), pos0[2]];
    const rot = mixV(mixV(B.r, rC, p2), [0, 0, 0], p3);
    const sc = mix(mix(1, 0.78, p2), 0.5, p3);
    const rise = (1 - formsIn) * 90;
    return { j, pos: [pos[0], pos[1] + rise, pos[2]] as V, rot, sc, op: j === 0 ? formsIn : pr(t, 1.65 + j * 0.08, 2.25 + j * 0.08, SIN) };
  });

  const ring = vis(t, 0.1, 0.8, 1.5, 2.1, SIN);
  const w = wind(t), head = -90 + w, comet = Math.min(140, 30 + w * 0.12);
  const floor = pr(t, 0.2, 1.2) * (1 - p3);
  const note = vis(t, 0.55, 0.95, 1.35, 1.6);
  const sheen = 50 + cam.ry * 2.2;

  const lead: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 400, fontSize: 64, letterSpacing: "-0.02em", lineHeight: "84px", color: T.soft };
  const main: React.CSSProperties = { fontFamily: "Outfit", fontWeight: 700, fontSize: 124, letterSpacing: "-0.045em", lineHeight: "140px", color: T.ink };
  const G = (s: string) => <>{s}<span style={{ color: T.green }}>.</span></>;
  const strike = pr(t, 4.45, 4.8), dim = pr(t, 4.5, 4.95);
  const chaosWord = (
    <span style={{ position: "relative", display: "inline-block", color: `color-mix(in srgb, ${T.ink} ${100 - dim * 62}%, transparent)` }}>
      chaos
      <span style={{ position: "absolute", left: "-4%", top: "54%", height: 14, marginTop: -7, width: `${108 * strike}%`, background: T.green, borderRadius: 99, boxShadow: "0 0 24px rgba(28,228,155,.5)" }} />
    </span>);
  const arcPath = (R: number, a0: number, a1: number) => { const c = R + 20; const p0 = [c + R * Math.cos(rad(a0)), c + R * Math.sin(rad(a0))], p1b = [c + R * Math.cos(rad(a1)), c + R * Math.sin(rad(a1))];
    return `M${p0[0]} ${p0[1]} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1b[0]} ${p1b[1]}`; };

  return (
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <Audio src={staticFile("juno/raw2/audio.m4a")} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${T.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${T.grid} 1.5px,transparent 1.5px)`, backgroundSize: "54px 54px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 54%, rgba(28,228,155,${0.07 * (1 - p3)}), transparent 70%)` }} />

      <div style={{ position: "absolute", left: ORIGIN.x, top: ORIGIN.y, width: 0, height: 0, perspective: PERSP, perspectiveOrigin: "0px 0px" }}>
        <div style={{ ...P3, transform: world }}>
          {/* perspective floor grid */}
          <div style={{ position: "absolute", left: -1800, top: -1800, width: 3600, height: 3600, transform: "translate3d(0,640px,0) rotateX(90deg)", opacity: floor,
            backgroundImage: "linear-gradient(rgba(180,247,202,.16) 2px,transparent 2px),linear-gradient(90deg,rgba(180,247,202,.16) 2px,transparent 2px)", backgroundSize: "150px 150px",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 55%)", maskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 55%)" }} />

          {/* tilted clock ring */}
          {ring > 0 && <svg width={2 * RR + 40} height={2 * RR + 40} style={{ position: "absolute", left: -RR - 20, top: -RR - 20, overflow: "visible", transform: "rotateX(48deg)", opacity: ring }}>
            <circle cx={RR + 20} cy={RR + 20} r={RR} fill="none" stroke="rgba(180,247,202,.3)" strokeWidth={3} />
            {[...Array(12)].map((_, n) => { const a = rad(-90 + n * 30); let dd = ((head - (-90 + n * 30)) % 360 + 360) % 360; const l = w > 2 && dd < comet ? 1 - dd / comet : 0; const s = 12 + 8 * l;
              return <rect key={n} x={RR + 20 + RR * Math.cos(a) - s / 2} y={RR + 20 + RR * Math.sin(a) - s / 2} width={s} height={s} fill={`color-mix(in srgb, ${T.green} ${Math.round(l * 100)}%, rgba(248,249,250,.35))`} />; })}
            {w > 1 && <path d={arcPath(RR, head - comet, head)} fill="none" stroke={T.green} strokeWidth={8} strokeLinecap="round" />}
          </svg>}

          {/* frosted-glass tax forms */}
          {forms.map(({ j, pos, rot, sc, op }) => op <= 0 ? null : (
            <div key={j} style={{ ...P3, transform: `translate3d(${pos[0]}px,${pos[1]}px,${pos[2]}px) rotateX(${rot[0]}deg) rotateY(${rot[1]}deg) rotateZ(${rot[2]}deg) scale(${sc})` }}>
              {[2, 1].map((n) => <div key={n} style={{ position: "absolute", left: -FW / 2, top: -FH / 2, width: FW, height: FH, borderRadius: 18, transform: `translateZ(${-n * 7}px)`, border: "2px solid rgba(28,228,155,.28)", opacity: op }} />)}
              <div style={{ position: "absolute", left: -FW / 2, top: -FH / 2, width: FW, height: FH, borderRadius: 18, opacity: op, boxSizing: "border-box", padding: "30px 30px",
                background: "linear-gradient(135deg, rgba(248,249,250,.16) 0%, rgba(28,228,155,.07) 45%, rgba(30,30,30,.55) 100%)",
                border: `2.5px solid ${j === 0 ? "rgba(28,228,155,.95)" : "rgba(180,247,202,.45)"}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), inset 0 0 40px rgba(28,228,155,.08), 0 30px 60px rgba(0,0,0,.35)" }}>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 34, letterSpacing: 3, color: j === 0 ? T.ink : "rgba(248,249,250,.6)" }}>{LABELS[j]}</div>
                <div style={{ height: 2, background: "rgba(180,247,202,.3)", margin: "14px 0 22px" }} />
                {[0, 1, 2, 3, 4, 5].map((r) => { const fill = j === 0 ? pr(t, 2.25 + r * 0.03, 2.6 + r * 0.03, GLIDE) : 0; const wdt = 0.55 + 0.45 * ((r * 37) % 10) / 10;
                  return <div key={r} style={{ height: 20, borderRadius: 6, marginBottom: 20, boxShadow: "inset 0 0 0 2px rgba(248,249,250,.16)", position: "relative" }}>
                    {fill > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * fill * wdt}%`, borderRadius: 6, background: T.green, opacity: 0.9, boxShadow: "0 0 14px rgba(28,228,155,.5)" }} />}</div>; })}
              </div>
            </div>))}

          {/* Dave's glass slab */}
          <div style={{ ...P3 }}>
            {[4, 3, 2, 1].map((n) => <div key={n} style={{ position: "absolute", left: -SW / 2 - 8, top: -SH / 2 - 8, width: SW + 16, height: SH + 16, borderRadius: 16, transform: `translateZ(${-n * 6}px)`,
              border: "3px solid rgba(28,228,155,.35)", opacity: intro }} />)}
            <div style={{ position: "absolute", left: -SW / 2, top: -SH / 2, width: SW, height: SH, overflow: "hidden", borderRadius: 10, opacity: intro,
              boxShadow: `0 0 0 8px ${T.green}, 0 0 60px rgba(28,228,155,.25), 0 40px 90px rgba(0,0,0,.5)` }}>
              <Img src={staticFile(`juno/raw2/f${String(idx).padStart(4, "0")}.jpg`)} style={{ position: "absolute", left: imgL, top: imgT, width: 1080 * k, height: 1920 * k }} />
            </div>
            {/* glass edge light only (never over the face) */}
            <div style={{ position: "absolute", left: -SW / 2 - 8, top: -SH / 2 - 8, width: SW + 16, height: SH + 16, borderRadius: 16, transform: "translateZ(1px)", opacity: intro * (1 - 0.6 * p3), boxSizing: "border-box",
              border: "8px solid transparent", background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 22}%, rgba(255,255,255,.85) ${sheen}%, rgba(255,255,255,0) ${sheen + 22}%) border-box`,
              WebkitMask: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
          </div>

          {/* glass spheres (billboards) */}
          {spheres.map(({ i, pos, d, blur, dimm }) => d <= 0.5 ? null : (
            <div key={i} style={{ ...P3, transform: `translate3d(${pos[0]}px,${pos[1]}px,${pos[2]}px) ${bill}` }}>
              <div style={{ position: "absolute", left: -d / 2, top: -d / 2, width: d, height: d, borderRadius: "50%", filter: blur > 0.05 ? `blur(${blur}px)` : undefined, opacity: dimm,
                background: "radial-gradient(circle at 33% 27%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 15%), radial-gradient(circle at 68% 76%, rgba(230,255,242,.6) 0%, rgba(125,247,198,0) 42%), radial-gradient(circle at 36% 30%, #D9FFEA 0%, #5BF0B8 30%, #1CE49B 70%, #06694A 100%)",
                boxShadow: `0 0 ${d * 0.45}px rgba(28,228,155,.35), inset 0 0 0 ${Math.max(1, d * 0.03)}px rgba(255,255,255,.22), 0 ${d * 0.25}px ${d * 0.4}px rgba(0,0,0,.35)` }} />
            </div>))}
        </div>
      </div>

      {note > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", opacity: note, transform: `rotate(-3deg) translateY(${(1 - note) * 14}px)`, fontFamily: "Caveat", fontWeight: 500, fontSize: 56, color: T.ink }}>every. single. year.</div>}

      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <div style={{ opacity: 1 - 0.5 * dim }}>
          <Roll t={t} h={84} cls={lead} items={[[0.1, "60-hour"], [1.5, "data"], [2.6, "all hands on deck"]]} />
        </div>
        <Roll t={t} h={146} cls={main} items={[[0.65, G("weeks")], [1.5, null], [1.9, G("entry")], [2.6, null], [3.7, chaosWord]]} />
      </div>
    </AbsoluteFill>
  );
};
