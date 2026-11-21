import React from "react";
import { C, FONT, Icon } from "./theme";

// Space Black 16" laptop, CSS 3D. Lid and base share the same footprint (real proportions).
export const SCR_W = 1600;
export const SCR_H = 1000;
const BZ = 24; // side bezel
const BZT = 26; // top bezel
const BZB = 30; // bottom bezel (chin)
export const LID_W = SCR_W + 2 * BZ; // 1648
export const LID_H = SCR_H + BZT + BZB; // 1056
const BASE_W = LID_W;
const BASE_D = 1110;
const BASE_T = 24;

export const MENU_H = 30;
export const BAR_H = 46;
export const SCREEN_CONTENT_H = SCR_H - MENU_H - BAR_H; // 924

export const BrowserScreen: React.FC<{ children: React.ReactNode; url?: string }> = ({ children, url = "abetglobal.com" }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
    <div style={{ height: MENU_H, background: "#EDEEF1", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, padding: "0 26px", fontSize: 13, fontWeight: 500, color: "#2b2d33" }}>
      <span style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid #2b2d33" }} />
      <span>Fri 10:24</span>
    </div>
    <div style={{ height: BAR_H, background: "#F5F6F8", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: 460, height: 30, borderRadius: 9, background: "#fff", border: "1px solid #E5E7EB", justifyContent: "center", fontSize: 14, color: C.sub }}>
          <Icon name="lock" size={13} color={C.sub} />{url}
        </div>
      </div>
      <div style={{ width: 60 }} />
    </div>
    <div style={{ position: "relative", height: SCREEN_CONTENT_H, overflow: "hidden" }}>{children}</div>
  </div>
);

// ---------- keyboard ----------
const ROWS: number[][] = [
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // function row (half height)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
];
const KB_W = 1180;
const U = KB_W / 14.5;
const GAP = 7;
const KEY_H = U - GAP;
const keyStyle: React.CSSProperties = {
  borderRadius: 9,
  background: "linear-gradient(180deg, #17181b 0%, #0d0e10 100%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 0 rgba(0,0,0,0.6)",
};
const Keyboard: React.FC = () => (
  <div style={{ width: KB_W, display: "flex", flexDirection: "column", gap: GAP }}>
    {ROWS.map((r, ri) => (
      <div key={ri} style={{ display: "flex", gap: GAP }}>
        {r.map((w, i) => <div key={i} style={{ ...keyStyle, width: w * U - GAP, height: ri === 0 ? KEY_H * 0.55 : KEY_H }} />)}
      </div>
    ))}
    {/* bottom row: fn ctrl opt cmd [space] cmd opt + inverted-T arrows */}
    <div style={{ display: "flex", gap: GAP, height: KEY_H }}>
      {[1, 1, 1, 1.25].map((w, i) => <div key={i} style={{ ...keyStyle, width: w * U - GAP }} />)}
      <div style={{ ...keyStyle, width: 5 * U - GAP }} />
      {[1.25, 1].map((w, i) => <div key={i} style={{ ...keyStyle, width: w * U - GAP }} />)}
      <div style={{ ...keyStyle, width: U - GAP, height: KEY_H * 0.48, marginTop: KEY_H * 0.52 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: U - GAP }}>
        <div style={{ ...keyStyle, height: (KEY_H - 4) / 2 }} />
        <div style={{ ...keyStyle, height: (KEY_H - 4) / 2 }} />
      </div>
      <div style={{ ...keyStyle, width: U - GAP, height: KEY_H * 0.48, marginTop: KEY_H * 0.52 }} />
    </div>
  </div>
);

const Grille: React.FC<{ h: number }> = ({ h }) => (
  <div style={{ width: 150, height: h, borderRadius: 6, backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.75) 1.6px, transparent 2px)", backgroundSize: "9px 9px", opacity: 0.9 }} />
);

export type MacProps = {
  x: number; // hinge centre in parent px
  y: number;
  scale?: number;
  rx?: number; // camera tilt (negative = looking down on the deck)
  ry?: number; // turntable
  lid?: number; // lid lean back (deg)
  glare?: number;
  rim?: number; // rim-light strength (dark scenes)
  children: React.ReactNode;
};

export const MacBook: React.FC<MacProps> = ({ x, y, scale = 1, rx = -14, ry = -16, lid = 18, glare = 1, rim = 0, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, perspective: 7000, perspectiveOrigin: `0px ${-LID_H * 0.35}px` }}>
    <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {/* ---------- base ---------- */}
      <div style={{ position: "absolute", left: -BASE_W / 2, top: 0, width: BASE_W, height: BASE_D, transformOrigin: "50% 0", transform: "rotateX(90deg)", transformStyle: "preserve-3d" }}>
        {/* contact shadow on the floor */}
        <div style={{ position: "absolute", left: -40, top: 20, right: -40, bottom: -70, borderRadius: 140, background: "rgba(0,0,0,0.55)", filter: "blur(60px)", transform: `translateZ(-${BASE_T + 2}px)` }} />
        <div style={{ position: "absolute", left: 40, top: 60, right: 40, bottom: -10, borderRadius: 60, background: "rgba(0,0,0,0.6)", filter: "blur(16px)", transform: `translateZ(-${BASE_T + 1}px)` }} />
        {/* side + front thickness */}
        <div style={{ position: "absolute", left: 0, top: 0, width: BASE_T, height: BASE_D - 30, transformOrigin: "0 0", transform: "rotateY(90deg)", background: "linear-gradient(90deg, #3b3c41, #18191c)" }} />
        <div style={{ position: "absolute", left: BASE_W, top: 0, width: BASE_T, height: BASE_D - 30, transformOrigin: "0 0", transform: "rotateY(90deg)", background: "linear-gradient(90deg, #3b3c41, #18191c)" }} />
        <div style={{ position: "absolute", left: 30, top: BASE_D, width: BASE_W - 60, height: BASE_T, transformOrigin: "50% 0", transform: "rotateX(-90deg)", borderRadius: "0 0 16px 16px", background: "linear-gradient(180deg, #55565c 0%, #2a2b2f 30%, #141517 100%)" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, width: 200, height: 8, marginLeft: -100, borderRadius: "0 0 10px 10px", background: "#0e0f11" }} />
        </div>
        {/* deck */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "14px 14px 32px 32px", overflow: "hidden", background: "linear-gradient(180deg, #2a2b30 0%, #222327 55%, #1c1d21 100%)", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 -3px 0 rgba(255,255,255,0.08)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 34, background: "linear-gradient(180deg, #0b0b0d, rgba(11,11,13,0))" }} />
          <div style={{ position: "absolute", left: (BASE_W - KB_W) / 2 - 14, top: 58, padding: 14, borderRadius: 18, background: "#0a0a0c", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)" }}>
            <Keyboard />
          </div>
          <div style={{ position: "absolute", left: 28, top: 72 }}><Grille h={440} /></div>
          <div style={{ position: "absolute", right: 28, top: 72 }}><Grille h={440} /></div>
          <div style={{ position: "absolute", left: (BASE_W - 800) / 2, top: 590, width: 800, height: 470, borderRadius: 26, background: "linear-gradient(180deg, #27282d, #232428)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.06), inset 0 2px 8px rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0) 62%)" }} />
        </div>
      </div>
      {/* ---------- lid ---------- */}
      <div style={{ position: "absolute", left: -LID_W / 2, top: -LID_H, width: LID_W, height: LID_H, transformOrigin: "50% 100%", transform: `rotateX(${lid}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "30px 30px 14px 14px", background: "#050506", boxShadow: `0 0 0 2px #3a3b40, 0 0 0 3px #6a6b72${rim ? `, 0 0 ${60 * rim}px ${10 * rim}px rgba(226,70,76,${0.18 * rim})` : ""}` }}>
          <div style={{ position: "absolute", left: BZ, top: BZT, width: SCR_W, height: SCR_H, borderRadius: 10, overflow: "hidden", background: "#000" }}>
            {children}
            <div style={{ position: "absolute", left: "50%", top: 0, width: 190, height: MENU_H, marginLeft: -95, background: "#050506", borderRadius: "0 0 12px 12px" }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: glare, background: "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0) 44%)" }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);
