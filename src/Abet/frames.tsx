import React from "react";
import { AbetLogo, BgDark, BgLight, C, Caption, Cursor, Eyebrow, FONT, Icon, StepBadge, mix } from "./theme";
import { Dashboard, DepositPage, DepositState, PH, PW, PortalWindow, TxRow } from "./portal";
import { BrowserScreen, MacBook, MacProps } from "./macbook";

// MacBook with the ABET portal on screen
export const MacPortal: React.FC<Omit<MacProps, "children"> & { active?: string; sub?: string; children: React.ReactNode }> = ({ active, sub, children, ...mac }) => (
  <MacBook {...mac}>
    <BrowserScreen>
      <PortalWindow bare active={active} sub={sub} style={{ left: 0, top: 0 }}>{children}</PortalWindow>
    </BrowserScreen>
  </MacBook>
);

export const W = 1920;
export const H = 1080;
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ position: "relative", width: W, height: H, overflow: "hidden", fontFamily: FONT }}>{children}</div>;

const head = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05, color, ...extra });
export const redGrad: React.CSSProperties = { background: "linear-gradient(90deg, #E2464C 0%, #B3242A 55%, #FF8A80 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

// ---------- Scene pieces reused by the video ----------
export const LogoLockup: React.FC<{ logo?: object; line?: number; tag?: number; width?: number }> = ({ logo, line = 1, tag = 1, width = 860 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <AbetLogo width={width} state={logo} />
    <div style={{ marginTop: 34, width: 1300, height: 3, display: "flex", justifyContent: "center" }}>
      <div style={{ width: `${line * 100}%`, height: 3, borderRadius: 3, background: "linear-gradient(90deg, rgba(226,70,76,0) 0%, #E2464C 30%, #FF6A5F 50%, #E2464C 70%, rgba(226,70,76,0) 100%)", boxShadow: "0 0 24px 2px rgba(226,70,76,0.6)" }} />
    </div>
    <div style={{ marginTop: 34, fontFamily: FONT, fontSize: 20, fontWeight: 400, letterSpacing: `${mix(0.9, 0.5, tag)}em`, color: "rgba(255,255,255,0.7)", opacity: tag, paddingLeft: "0.5em" }}>GLOBAL MARKETS · ONE PORTAL</div>
  </div>
);

export const Callout: React.FC<{ icon: string; label: string; style?: React.CSSProperties }> = ({ icon, label, style }) => (
  <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, padding: "14px 22px 14px 14px", borderRadius: 18, background: "rgba(17,24,39,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.6)", fontFamily: FONT, fontSize: 22, fontWeight: 500, color: "#fff", ...style }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.red, display: "grid", placeItems: "center" }}><Icon name={icon} size={22} color="#fff" /></div>
    {label}
  </div>
);

export const STEP_CARDS = [
  { icon: "userPlus", title: "Create your account", sub: "Sign up in a few minutes with your email." },
  { icon: "shieldCheck", title: "Verify your profile", sub: "Confirm your identity to unlock your account." },
  { icon: "wallet", title: "Fund your wallet", sub: "Deposit via crypto, e-wallet or local bank." },
  { icon: "candles", title: "Start trading", sub: "Trade the global markets from one portal." },
];
export const CW = 360;
export const CH = 340;
export const CGAP = 36;
export const ROW_X = (W - (4 * CW + 3 * CGAP)) / 2;

// a: appear 0..1, on: active 0..1 (lift, crimson border, icon draw), done: 0..1 (badge -> check)
export const StepCard: React.FC<{ i: number; a?: number; on?: number; done?: number; dim?: number; style?: React.CSSProperties }> = ({ i, a = 1, on = 0, done = 0, dim = 0, style }) => {
  const c = STEP_CARDS[i];
  return (
    <div style={{ position: "absolute", width: CW, height: CH, borderRadius: 28, padding: 30, background: "rgba(255,255,255,0.9)", border: `${on > 0.5 ? 2 : 1}px solid ${on > 0.5 ? "rgba(179,36,42,0.55)" : C.line}`, boxShadow: `0 ${mix(10, 40, on)}px ${mix(30, 70, on)}px -24px rgba(${on > 0.5 ? "179,36,42" : "17,24,39"},${mix(0.18, 0.45, on)})`, opacity: a * (1 - dim * 0.55), transform: `translateY(${(1 - a) * 60 - on * 14}px) scale(${mix(0.94, 1, a)})`, fontFamily: FONT, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: 22, background: on > 0.5 ? C.red : C.redSoft, display: "grid", placeItems: "center", boxShadow: on > 0.5 ? "0 16px 30px -12px rgba(179,36,42,0.7)" : "none" }}>
          <Icon name={c.icon} size={40} color={on > 0.5 ? "#fff" : C.red} sw={1.8} draw={on > 0 && on < 1 ? on : 1} />
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 99, display: "grid", placeItems: "center", background: done > 0.5 ? C.green : "transparent", border: done > 0.5 ? "none" : `1.5px solid ${C.line}`, fontSize: 16, fontWeight: 600, color: C.faint }}>
          {done > 0.5 ? <Icon name="check" size={22} color="#fff" sw={3} draw={Math.min(1, (done - 0.5) * 2)} /> : `0${i + 1}`}
        </div>
      </div>
      <div style={{ marginTop: 70, fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink }}>{c.title}</div>
      <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.45, color: C.sub }}>{c.sub}</div>
    </div>
  );
};

// Camera: zoom around a focus point (in stage px)
export const Camera: React.FC<{ z?: number; fx?: number; fy?: number; x?: number; y?: number; children: React.ReactNode }> = ({ z = 1, fx = W / 2, fy = H / 2, x = 0, y = 0, children }) => (
  <div style={{ position: "absolute", inset: 0, transform: `translate(${x}px, ${y}px) scale(${z})`, transformOrigin: `${fx}px ${fy}px` }}>{children}</div>
);

export const WIN_X = (W - PW) / 2;
export const WIN_Y = 64;

// ---------- Style frames (static key states for approval) ----------
export const SF1: React.FC = () => (
  <Stage>
    <BgDark t={40} />
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><LogoLockup /></div>
  </Stage>
);

export const SF2: React.FC = () => (
  <Stage>
    <BgDark t={200} />
    <div style={{ position: "absolute", top: 70, width: W, textAlign: "center" }}>
      <div style={head(66, "#fff")}>One clean portal</div>
      <div style={{ ...head(66, "rgba(255,255,255,0.55)"), marginTop: 6 }}>for the <span style={redGrad}>global markets.</span></div>
    </div>
    <MacPortal x={W / 2 + 20} y={800} scale={0.52} rx={-10} ry={-24} lid={24}>
      <Dashboard highlight="wallet" dim={0.7} />
    </MacPortal>
    <Callout icon="wallet" label="Wallet & balance" style={{ left: 170, top: 470 }} />
    <Callout icon="calendar" label="Economic calendar" style={{ right: 130, top: 420, opacity: 0.55 }} />
    <Caption dark text="Your wallet, your accounts, social trading and the economic calendar." k={2.5} />
  </Stage>
);

export const SF3: React.FC = () => (
  <Stage>
    <BgLight t={300} />
    <div style={{ position: "absolute", top: 120, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Eyebrow>HOW IT WORKS</Eyebrow>
      <div style={{ ...head(92, C.ink), marginTop: 30 }}><span style={{ color: C.red }}>Four</span> simple steps.</div>
    </div>
    <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 560 + 52, width: 3 * (CW + CGAP), height: 3, background: C.line }} />
    <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 560 + 52, width: 2 * (CW + CGAP), height: 3, background: `linear-gradient(90deg, ${C.green}, ${C.red})` }} />
    {[0, 1, 2, 3].map((i) => (
      <StepCard key={i} i={i} on={i === 2 ? 1 : 0} done={i < 2 ? 1 : 0} dim={i === 3 ? 0.5 : 0} style={{ left: ROW_X + i * (CW + CGAP), top: 520 }} />
    ))}
  </Stage>
);

type MacView = { x: number; y: number; scale: number; rx: number; ry: number; lid: number };
export const MAC_WIDE_R: MacView = { x: W / 2 - 20, y: 800, scale: 0.52, rx: -10, ry: 22, lid: 24 };
export const MAC_CLOSE: MacView = { x: W / 2, y: 1010, scale: 0.9, rx: -4, ry: -5, lid: 14 };

const DepositFrame: React.FC<{ st: DepositState; mac: MacView; badge: [string, string]; cursor?: [number, number]; extra?: React.ReactNode; cap?: [string, number] }> = ({ st, mac, badge, cursor, extra, cap }) => (
  <Stage>
    <BgLight t={500} />
    <MacPortal {...mac} active="Funds" sub="Deposit">
      <DepositPage {...st} />
      {cursor && <Cursor x={cursor[0]} y={cursor[1]} />}
    </MacPortal>
    {extra}
    <StepBadge n={badge[0]} label={badge[1]} style={{ position: "absolute", left: 72, bottom: 56 }} />
    {cap && <Caption text={cap[0]} k={cap[1]} />}
  </Stage>
);

export const SF4: React.FC = () => (
  <DepositFrame st={{ step: 0, view: 0, sel: 1, rings: [1, 0, 0], summaryAmount: "—" }} mac={MAC_WIDE_R} badge={["STEP 01/04", "Choose a method"]} cursor={[470, 420]} />
);
export const SF5: React.FC = () => (
  <DepositFrame st={{ step: 1, view: 1, amount: "$500.00", caret: true, chip: 1, summaryAmount: "$500.00" }} mac={MAC_CLOSE} badge={["STEP 02/04", "Enter details"]} cap={["Step two. Enter the amount, and your payment details.", 5.4]} />
);
export const SF6: React.FC = () => (
  <DepositFrame st={{ step: 2, view: 2, checks: [1, 1, 1, 0.6], summaryAmount: "$500.00" }} mac={{ ...MAC_CLOSE, ry: 5 }} badge={["STEP 03/04", "Review"]} />
);
export const SF7: React.FC = () => (
  <DepositFrame
    st={{ step: 4, view: 3, success: 1, summaryAmount: "$500.00" }}
    mac={{ x: 800, y: 800, scale: 0.52, rx: -10, ry: -22, lid: 24 }}
    badge={["STEP 04/04", "Confirm & track"]}
    extra={
      <div style={{ position: "absolute", right: 90, top: 430, width: 540, padding: "22px 28px", borderRadius: 24, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(18px)", border: `1px solid ${C.line}`, boxShadow: "0 50px 90px -30px rgba(17,24,39,0.45)", fontFamily: FONT }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Latest Transactions</div>
        <TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Pending" flash={1} />
        <TxRow method="Crypto Wallet · Nov 18" amount="$750.00" status="Approved" />
      </div>
    }
  />
);

export const SF8: React.FC = () => (
  <Stage>
    <BgDark t={800} glow={1.2} />
    <div style={{ position: "absolute", top: 250, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AbetLogo width={700} />
      <div style={{ ...head(58, "#fff", { fontWeight: 400 }), marginTop: 56 }}>Your markets, <span style={redGrad}>simplified.</span></div>
      <div style={{ display: "flex", gap: 18, marginTop: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 30px", borderRadius: 99, background: C.red, color: "#fff", fontSize: 22, fontWeight: 500, boxShadow: "0 20px 40px -16px rgba(226,70,76,0.8)" }}>Open your account <Icon name="arrowRight" size={20} color="#fff" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 30px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontSize: 22, fontWeight: 400 }}><Icon name="globe" size={20} color="rgba(255,255,255,0.8)" />abetglobal.com</div>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 46, width: W, textAlign: "center", fontFamily: FONT, fontSize: 16, color: "rgba(255,255,255,0.42)", letterSpacing: "0.01em" }}>Trading involves risk. Only trade with capital you can afford to lose.</div>
  </Stage>
);

export const FRAMES = [SF1, SF2, SF3, SF4, SF5, SF6, SF7, SF8];
export { PH, PW };
