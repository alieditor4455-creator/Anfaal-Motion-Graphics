import React from "react";
import { C, FONT, Icon } from "./theme";

// Space Black MacBook built in CSS 3D. Screen is 16:10.
export const SCR_W = 1600;
export const SCR_H = 1000;
const BZ = 22; // side/bottom bezel
const BZT = 26; // top bezel
export const LID_W = SCR_W + 2 * BZ;
export const LID_H = SCR_H + BZT + BZ;
const BASE_W = 1900;
const BASE_D = 1080;
const BASE_T = 26;

export const MENU_H = 30;
export const BAR_H = 46;
export const SCREEN_CONTENT_H = SCR_H - MENU_H - BAR_H; // 924

// macOS-like menu bar + browser chrome, then page content
export const BrowserScreen: React.FC<{ children: React.ReactNode; url?: string }> = ({ children, url = "abetglobal.com" }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
    <div style={{ height: MENU_H, background: "#E6E7EB", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18, padding: "0 26px", fontSize: 13, fontWeight: 500, color: "#2b2d33" }}>
      <span style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid #2b2d33" }} />
      <span>Fri 10:24</span>
    </div>
    <div style={{ height: BAR_H, background: "#F3F4F6", borderBottom: "1px solid #E3E5EA", display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: 460, height: 30, borderRadius: 9, background: "#fff", border: "1px solid #E3E5EA", justifyContent: "center", fontSize: 14, color: C.sub }}>
          <Icon name="lock" size={13} color={C.sub} />{url}
        </div>
      </div>
      <div style={{ width: 60 }} />
    </div>
    <div style={{ position: "relative", height: SCREEN_CONTENT_H, overflow: "hidden" }}>{children}</div>
  </div>
);

const KEYS: React.CSSProperties = {
  backgroundColor: "#202125",
  backgroundImage: "linear-gradient(90deg, #08090a 0 7px, transparent 7px), linear-gradient(180deg, #08090a 0 7px, transparent 7px)",
};

export type MacProps = {
  x: number; // hinge centre in parent px
  y: number;
  scale?: number;
  rx?: number; // camera tilt (negative = looking from above)
  ry?: number; // turntable
  lid?: number; // lid lean back in deg
  glare?: number;
  children: React.ReactNode;
};

export const MacBook: React.FC<MacProps> = ({ x, y, scale = 1, rx = -16, ry = -20, lid = 12, glare = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, perspective: 6500, perspectiveOrigin: `0px ${-LID_H * 0.4}px` }}>
    <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d", transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {/* Base / keyboard deck (laid flat toward the viewer) */}
      <div style={{ position: "absolute", left: -BASE_W / 2, top: 0, width: BASE_W, height: BASE_D, transformOrigin: "50% 0", transform: "rotateX(90deg)", transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: -60, borderRadius: 120, background: "rgba(0,0,0,0.55)", filter: "blur(50px)", transform: `translateZ(-${BASE_T + 4}px)` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "10px 10px 46px 46px", background: "linear-gradient(180deg, #2b2c31 0%, #1f2024 60%, #1a1b1e 100%)", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.06)" }}>
          <div style={{ position: "absolute", left: (BASE_W - 1500) / 2, top: 70, width: 1500, height: 560, borderRadius: 18, padding: 10, background: "#0b0c0e" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 10, ...KEYS, backgroundSize: "92px 90px, 92px 90px" }} />
          </div>
          <div style={{ position: "absolute", left: (BASE_W - 820) / 2, top: 668, width: 800, height: 380, borderRadius: 26, background: "linear-gradient(180deg, #26272b, #222327)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.07)" }} />
        </div>
        {/* front lip */}
        <div style={{ position: "absolute", left: 30, top: BASE_D, width: BASE_W - 60, height: BASE_T, transformOrigin: "50% 0", transform: "rotateX(-90deg)", borderRadius: "0 0 18px 18px", background: "linear-gradient(180deg, #4a4b51 0%, #26272b 45%, #121315 100%)" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, width: 220, height: 9, marginLeft: -110, borderRadius: "0 0 10px 10px", background: "#111214" }} />
        </div>
      </div>
      {/* Lid */}
      <div style={{ position: "absolute", left: -LID_W / 2, top: -LID_H, width: LID_W, height: LID_H, transformOrigin: "50% 100%", transform: `rotateX(${lid}deg)`, borderRadius: "34px 34px 16px 16px", background: "#060607", boxShadow: "0 0 0 3px #2c2d32, 0 0 0 4px #52535a" }}>
        <div style={{ position: "absolute", left: BZ, top: BZT, width: SCR_W, height: SCR_H, borderRadius: 12, overflow: "hidden", background: "#000" }}>
          {children}
          {/* notch */}
          <div style={{ position: "absolute", left: "50%", top: 0, width: 200, height: MENU_H, marginLeft: -100, background: "#060607", borderRadius: "0 0 12px 12px" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: glare, background: "linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 46%)" }} />
        </div>
        <div style={{ position: "absolute", left: 0, bottom: -10, width: LID_W, height: 12, borderRadius: "0 0 12px 12px", background: "linear-gradient(180deg, #2c2d32, #0e0f11)" }} />
      </div>
    </div>
  </div>
);
