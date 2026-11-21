import React from "react";
import { C, FONT, Icon } from "./theme";

// Glass surface with real depth: gradient body, inner top highlight, layered shadows, moving specular sheen,
// and a perspective tilt. `sheen` 0..1 moves the specular band across the card.
export const Glass: React.FC<{
  dark?: boolean;
  rx?: number;
  ry?: number;
  sheen?: number;
  radius?: number;
  style?: React.CSSProperties; // positioning / opacity / filter of the outer wrapper
  inner?: React.CSSProperties; // padding / size of the surface
  children: React.ReactNode;
}> = ({ dark, rx = 0, ry = 0, sheen = 0.35, radius = 26, style, inner, children }) => (
  <div style={{ position: "absolute", perspective: 1400, ...style }}>
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        fontFamily: FONT,
        overflow: "hidden",
        ...(dark
          ? {
              background: "linear-gradient(150deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.025) 100%)",
              backdropFilter: "blur(26px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(255,255,255,0.05), 0 40px 80px -28px rgba(0,0,0,0.75), 0 0 60px -20px rgba(226,70,76,0.25)",
              color: "#fff",
            }
          : {
              background: "linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 100%)",
              backdropFilter: "blur(24px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "inset 0 1px 0 #fff, 0 0 0 1px rgba(17,24,39,0.06), 0 2px 6px rgba(17,24,39,0.05), 0 26px 50px -18px rgba(17,24,39,0.20), 0 70px 120px -40px rgba(179,36,42,0.28)",
              color: C.ink,
            }),
        ...inner,
      }}
    >
      {children}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen * 100 - 30}%, rgba(255,255,255,${dark ? 0.12 : 0.5}) ${sheen * 100 - 8}%, rgba(255,255,255,0) ${sheen * 100 + 12}%)` }} />
    </div>
  </div>
);

// ---------- dark-glass feature cards for the navy scene ----------
export const WalletG: React.FC = () => (
  <div style={{ width: 360, padding: 26 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(140deg, #E2464C, #8E1218)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 18px -6px rgba(226,70,76,0.7)", display: "grid", placeItems: "center" }}><Icon name="wallet" size={21} color="#fff" /></div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.62)", letterSpacing: "0.1em" }}>WALLET BALANCE</div>
    </div>
    <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 16 }}>$4,250<span style={{ color: "rgba(255,255,255,0.4)" }}>.00</span></div>
    <svg width="308" height="64" viewBox="0 0 308 64" style={{ marginTop: 8, overflow: "visible" }}>
      <defs>
        <linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E2464C" stopOpacity="0.45" /><stop offset="1" stopColor="#E2464C" stopOpacity="0" /></linearGradient>
      </defs>
      <path d="M0 54 C36 48 56 56 82 42 S136 36 164 28 S218 32 246 16 S292 8 308 5 V64 H0Z" fill="url(#wg)" />
      <path d="M0 54 C36 48 56 56 82 42 S136 36 164 28 S218 32 246 16 S292 8 308 5" stroke="#FF6A62" strokeWidth="3" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(255,106,98,0.8))" }} />
    </svg>
  </div>
);

export const AccountsG: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px 16px 16px", fontSize: 19, fontWeight: 500 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)", display: "grid", placeItems: "center" }}><Icon name="shieldCheck" size={18} color="#4ADE80" /></div>
    Real accounts <span style={{ padding: "3px 11px", borderRadius: 99, background: "rgba(226,70,76,0.22)", color: "#FF8A84", fontSize: 15 }}>2</span>
  </div>
);

export const SocialG: React.FC = () => (
  <div style={{ width: 320, padding: "22px 24px" }}>
    <div style={{ display: "flex" }}>
      {["#E2464C", "#6366F1", "#F59E0B", "#22C55E"].map((c, i) => (
        <div key={c} style={{ width: 46, height: 46, borderRadius: 99, marginLeft: i ? -12 : 0, border: "2.5px solid rgba(20,26,40,0.9)", background: `linear-gradient(140deg, ${c}, ${c}AA)`, display: "grid", placeItems: "center" }}><Icon name="user" size={20} color="#fff" /></div>
      ))}
    </div>
    <div style={{ fontSize: 19, fontWeight: 600, marginTop: 14 }}>Social Trading</div>
    <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Following 6 traders</div>
  </div>
);

export const CalendarG: React.FC = () => (
  <div style={{ width: 400, padding: "22px 26px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, fontWeight: 600 }}><Icon name="calendar" size={20} color="#FF6A62" />Economic Calendar</div>
    {[["USD", "Non-Farm Payrolls", 3], ["EUR", "CPI (YoY)", 2], ["GBP", "Rate Decision", 3]].map(([c, e, n]) => (
      <div key={e as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width: 46, textAlign: "center", padding: "3px 0", borderRadius: 7, background: "rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 600 }}>{c}</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{e}</div>
        <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 14, borderRadius: 3, background: d < (n as number) ? "#FF6A62" : "rgba(255,255,255,0.15)" }} />)}</div>
      </div>
    ))}
  </div>
);
