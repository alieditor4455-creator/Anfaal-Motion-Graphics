import React from "react";
import { AbetLogo, BgDark, BgLight, C, Caption, Cursor, Eyebrow, FONT, Icon, StepBadge, mix } from "./theme";
import { Dashboard, DepositCard, DepositPage, DepositState, PH, PW, PortalWindow, TxRow } from "./portal";
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

const head = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, fontWeight: 400, letterSpacing: "-0.035em", lineHeight: 1.08, color, ...extra });
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

// ---------- Floating glass UI (isolated components, Island-style) ----------
export const glass: React.CSSProperties = { position: "absolute", borderRadius: 26, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(22px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 50px 90px -34px rgba(10,15,25,0.55), 0 0 0 1px rgba(17,24,39,0.05)", fontFamily: FONT };
const dof = (b: number): React.CSSProperties => (b ? { filter: `blur(${b}px)`, opacity: 1 - b * 0.06 } : {});

export const WalletFloat: React.FC<{ style?: React.CSSProperties; blur?: number }> = ({ style, blur = 0 }) => (
  <div style={{ ...glass, width: 390, padding: 26, ...dof(blur), ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redSoft, display: "grid", placeItems: "center" }}><Icon name="wallet" size={22} color={C.red} /></div>
      <div style={{ fontSize: 16, fontWeight: 500, color: C.sub, letterSpacing: "0.06em" }}>WALLET BALANCE</div>
    </div>
    <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink, marginTop: 16 }}>$4,250<span style={{ color: C.faint }}>.00</span></div>
    <svg width="338" height="70" viewBox="0 0 338 70" style={{ marginTop: 10 }}>
      <defs><linearGradient id="wf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#B3242A" stopOpacity="0.25" /><stop offset="1" stopColor="#B3242A" stopOpacity="0" /></linearGradient></defs>
      <path d="M0 58 C40 52 60 60 90 46 S150 40 180 30 S240 36 270 18 S320 10 338 6 V70 H0Z" fill="url(#wf)" />
      <path d="M0 58 C40 52 60 60 90 46 S150 40 180 30 S240 36 270 18 S320 10 338 6" stroke={C.red} strokeWidth="3" fill="none" />
    </svg>
  </div>
);

export const CalendarFloat: React.FC<{ style?: React.CSSProperties; blur?: number }> = ({ style, blur = 0 }) => (
  <div style={{ ...glass, width: 420, padding: "22px 26px", ...dof(blur), ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, fontWeight: 600, color: C.ink }}><Icon name="calendar" size={20} color={C.red} />Economic Calendar</div>
    {[["USD", "Non-Farm Payrolls", 3], ["EUR", "CPI (YoY)", 2], ["GBP", "Rate Decision", 3]].map(([c, e, n]) => (
      <div key={e as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ width: 46, textAlign: "center", padding: "3px 0", borderRadius: 7, background: "#F3F4F6", fontSize: 12, fontWeight: 600, color: C.text }}>{c}</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: C.text }}>{e}</div>
        <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 14, borderRadius: 3, background: d < (n as number) ? C.red : C.line }} />)}</div>
      </div>
    ))}
  </div>
);

export const SocialFloat: React.FC<{ style?: React.CSSProperties; blur?: number }> = ({ style, blur = 0 }) => (
  <div style={{ ...glass, width: 340, padding: "22px 24px", ...dof(blur), ...style }}>
    <div style={{ display: "flex" }}>
      {["#E2464C", "#4F46E5", "#F59E0B", "#16A34A"].map((c, i) => (
        <div key={c} style={{ width: 46, height: 46, borderRadius: 99, marginLeft: i ? -12 : 0, border: "3px solid #fff", background: `linear-gradient(140deg, ${c}, ${c}99)`, display: "grid", placeItems: "center" }}><Icon name="user" size={20} color="#fff" /></div>
      ))}
    </div>
    <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginTop: 14 }}>Social Trading</div>
    <div style={{ fontSize: 15, color: C.sub, marginTop: 4 }}>Following 6 traders</div>
  </div>
);

export const BigButton: React.FC<{ press?: number; glow?: number; style?: React.CSSProperties }> = ({ press = 0, glow = 1, style }) => (
  <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, width: 440, height: 118, borderRadius: 30, background: `linear-gradient(180deg, #C42B31, ${C.redDeep})`, color: "#fff", fontFamily: FONT, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em", transform: `scale(${1 - press * 0.05})`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 40px 70px -28px rgba(122,10,10,0.8), 0 0 0 ${14 * glow}px rgba(179,36,42,${0.1 * glow})`, ...style }}>
    <Icon name="plus" size={36} color="#fff" sw={2.4} />Deposit
  </div>
);

// ---------- Style frames (static key states for approval) ----------
export const SF1: React.FC = () => (
  <Stage>
    <BgDark t={40} />
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><LogoLockup width={760} /></div>
  </Stage>
);

export const MAC_HERO = { x: W / 2, y: 740, scale: 0.42, rx: -14, ry: -14, lid: 16 };

export const SF2: React.FC = () => (
  <Stage>
    <BgDark t={200} />
    <div style={{ position: "absolute", top: 74, width: W, textAlign: "center" }}>
      <div style={head(58, "#fff")}>One clean portal</div>
      <div style={{ ...head(58, "rgba(255,255,255,0.5)"), marginTop: 4 }}>for the <span style={redGrad}>global markets.</span></div>
    </div>
    <MacPortal {...MAC_HERO} rim={0.8}>
      <Dashboard />
    </MacPortal>
    <CalendarFloat blur={3} style={{ left: 1430, top: 300, transform: "scale(0.86)" }} />
    <WalletFloat style={{ left: 150, top: 420 }} />
    <SocialFloat style={{ left: 1440, top: 610 }} />
    <Caption dark text="Your wallet, your accounts, social trading and the economic calendar." k={2.5} />
  </Stage>
);

export const SF3: React.FC = () => (
  <Stage>
    <BgLight t={300} />
    <div style={{ position: "absolute", top: 130, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Eyebrow>HOW IT WORKS</Eyebrow>
      <div style={{ ...head(78, C.ink), marginTop: 30 }}><span style={{ color: C.red }}>Four</span> simple steps.</div>
    </div>
    <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 520 + 72, width: 3 * (CW + CGAP), height: 2, background: C.line }} />
    <div style={{ position: "absolute", left: ROW_X + CW / 2, top: 520 + 72, width: 2 * (CW + CGAP), height: 2, background: `linear-gradient(90deg, ${C.green}, ${C.red})` }} />
    {[0, 1, 2, 3].map((i) => (
      <StepCard key={i} i={i} on={i === 2 ? 1 : 0} done={i < 2 ? 1 : 0} dim={i === 3 ? 0.5 : 0} style={{ left: ROW_X + i * (CW + CGAP), top: 520 }} />
    ))}
    <Caption text="Fund your wallet." k={3} />
  </Stage>
);

// laptop softly out of focus behind an isolated hero component
const BlurredMac: React.FC<{ children: React.ReactNode; blur?: number; mac?: object }> = ({ children, blur = 10, mac }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, opacity: 0.9 }}>
    <MacPortal {...MAC_HERO} y={820} scale={0.5} {...mac} active="Funds" sub="Deposit">{children}</MacPortal>
  </div>
);

export const SF4: React.FC = () => (
  <Stage>
    <BgLight t={400} />
    <BlurredMac blur={9}><Dashboard depositGlow={1} /></BlurredMac>
    <div style={{ ...glass, left: 330, top: 480, width: 300, height: 96, display: "grid", placeItems: "center", filter: "blur(4px)", opacity: 0.7, fontSize: 30, color: C.red }}>Withdrawal</div>
    <div style={{ ...glass, left: 1290, top: 480, width: 300, height: 96, display: "grid", placeItems: "center", filter: "blur(4px)", opacity: 0.7, fontSize: 30, color: C.red }}>Transfer</div>
    <BigButton press={0.4} style={{ left: (W - 440) / 2, top: 460 }} />
    <Cursor x={1080} y={540} press={0.5} scale={1.6} />
    <StepBadge n="START" label="Tap Deposit" style={{ position: "absolute", left: 72, top: 56 }} />
    <Caption text="From your dashboard, tap Deposit." k={6} />
  </Stage>
);

const Isolated: React.FC<{ st: DepositState; badge: [string, string]; cap: [string, number]; children?: React.ReactNode }> = ({ st, badge, cap, children }) => (
  <Stage>
    <BgLight t={500} />
    <BlurredMac><DepositPage {...st} /></BlurredMac>
    <DepositCard {...st} h={590} style={{ position: "absolute", left: (W - 900) / 2, top: 200, borderRadius: 28, boxShadow: "0 60px 110px -40px rgba(10,15,25,0.55), 0 0 0 1px rgba(17,24,39,0.05)" }} />
    {children}
    <StepBadge n={badge[0]} label={badge[1]} style={{ position: "absolute", left: 72, top: 56 }} />
    <Caption text={cap[0]} k={cap[1]} />
  </Stage>
);

export const SF5: React.FC = () => (
  <Isolated st={{ step: 0, view: 0, sel: 1, rings: [1, 0, 0] }} badge={["STEP 01/04", "Choose a method"]} cap={["Choose your method: crypto wallet, e-wallet, or local bank.", 6]}>
    <Cursor x={720} y={520} />
  </Isolated>
);
export const SF6: React.FC = () => (
  <Isolated st={{ step: 1, view: 1, amount: "$500.00", caret: true, chip: 1 }} badge={["STEP 02/04", "Enter details"]} cap={["Step two. Enter the amount, and your payment details.", 5.4]} />
);

export const SF7: React.FC = () => (
  <Stage>
    <BgLight t={600} />
    <MacPortal x={820} y={760} scale={0.44} rx={-14} ry={-20} lid={16} active="Funds" sub="Deposit">
      <DepositPage step={4} view={3} success={1} summaryAmount="$500.00" />
    </MacPortal>
    <div style={{ ...glass, left: 1290, top: 380, width: 520, padding: "22px 28px" }}>
      <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Latest Transactions</div>
      <TxRow method="Crypto Wallet · Just now" amount="$500.00" status="Pending" flash={1} />
      <TxRow method="Crypto Wallet · Nov 18" amount="$750.00" status="Approved" />
    </div>
    <StepBadge n="STEP 04/04" label="Confirm & track" style={{ position: "absolute", left: 72, top: 56 }} />
    <Caption text="Your deposit is on its way, and you can track it in your latest transactions." k={8} />
  </Stage>
);

export const SF8: React.FC = () => (
  <Stage>
    <BgDark t={800} glow={1.1} />
    <div style={{ position: "absolute", top: 280, width: W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AbetLogo width={560} />
      <div style={{ ...head(50, "#fff"), marginTop: 54 }}>Your markets, <span style={redGrad}>simplified.</span></div>
      <div style={{ display: "flex", gap: 16, marginTop: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, background: C.red, color: "#fff", fontSize: 21, fontWeight: 500, boxShadow: "0 20px 40px -16px rgba(226,70,76,0.8)" }}>Open your account <Icon name="arrowRight" size={20} color="#fff" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 30px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 21, fontWeight: 400 }}><Icon name="globe" size={20} color="rgba(255,255,255,0.8)" />abetglobal.com</div>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 46, width: W, textAlign: "center", fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Trading involves risk. Only trade with capital you can afford to lose.</div>
  </Stage>
);

export const FRAMES = [SF1, SF2, SF3, SF4, SF5, SF6, SF7, SF8];
export { PH, PW };
