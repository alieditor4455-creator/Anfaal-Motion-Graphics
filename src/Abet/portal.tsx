import React from "react";
import { AbetLogo, C, FONT, Icon, mix } from "./theme";

// Portal window native size. Everything inside is laid out in these px.
export const PW = 1560;
export const PH = 860;

const card: React.CSSProperties = { background: "#fff", borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 8px 24px -12px rgba(17,24,39,0.08)" };
const T = (size: number, weight = 400, color: string = C.text, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.01em", ...extra });

// ---------------- Header + sidebar ----------------
const Header: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 66, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 22, background: "#fff" }}>
    <Icon name="menu" size={24} color={C.text} />
    <AbetLogo width={96} ink={C.ink} />
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 99, border: `1px solid ${C.line}`, ...T(14, 500) }}>
      <Icon name="clock" size={16} color={C.red} /> 10:24:16 AM GMT+2
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: C.greenSoft, ...T(14, 500, C.green) }}>
      <Icon name="shieldCheck" size={16} color={C.green} /> Verified
    </div>
    <Icon name="bell" size={22} color={C.text} />
    <Icon name="moon" size={22} color={C.text} />
    <div style={{ width: 40, height: 40, borderRadius: 99, border: `2px solid ${C.red}`, display: "grid", placeItems: "center" }}>
      <Icon name="user" size={20} color={C.red} />
    </div>
  </div>
);

const NAV: [string, string][] = [["grid", "Discover"], ["calendar", "Economic Calendar"], ["bars", "Market"], ["globe", "Assets"], ["wallet", "Funds"], ["users", "Social Trading"], ["userPlus", "Refer a Friend"], ["star", "Loyalty"], ["gift", "Promotions"], ["trophy", "Tournament"], ["ticket", "Tickets"]];

const Sidebar: React.FC<{ active: string; sub?: string }> = ({ active, sub }) => (
  <div style={{ position: "absolute", left: 0, top: 66, width: 250, height: PH - 66, borderRight: `1px solid ${C.line}`, padding: "18px 14px", background: "#fff" }}>
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.redDeep, color: "#fff", padding: "10px 14px", borderRadius: 10, ...T(14, 500, "#fff") }}><Icon name="trend" size={16} color="#fff" />Overview</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", ...T(14, 500, C.sub) }}><Icon name="swap" size={16} color={C.sub} />TRNX</div>
    </div>
    {NAV.map(([ic, label]) => {
      const on = label === active;
      return (
        <React.Fragment key={label}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, marginBottom: 2, background: on ? C.redDeep : "transparent", ...T(15, on ? 500 : 400, on ? "#fff" : C.text) }}>
            <Icon name={ic} size={18} color={on ? "#fff" : C.sub} />
            <span style={{ flex: 1 }}>{label}</span>
            {["Assets", "Funds", "Social Trading", "Loyalty", "Promotions"].includes(label) && <Icon name="chevron" size={14} color={on ? "#fff" : C.faint} />}
          </div>
          {on && sub && (
            <div style={{ margin: "4px 0 8px 30px", borderLeft: `1px solid ${C.line}`, paddingLeft: 14 }}>
              {["Deposit", "Withdrawal", "Internal Transfer", "Wallet Details"].map((x) => (
                <div key={x} style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 2, background: x === sub ? C.redSoft : "transparent", ...T(14, x === sub ? 500 : 400, x === sub ? C.red : C.sub) }}>{x}</div>
              ))}
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ---------------- Dashboard ----------------
export type DashState = { depositPress?: number; depositGlow?: number; highlight?: string | null; dim?: number };

const Candles: React.FC = () => {
  const data = [38, 52, 44, 60, 55, 70, 64, 80, 72, 90, 84, 104, 96, 118, 110, 132];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 190 }}>
      {data.map((v, i) => {
        const up = i % 3 !== 1;
        return (
          <div key={i} style={{ width: 14, height: v * 1.35, borderRadius: 4, background: up ? "linear-gradient(180deg, rgba(22,163,74,0.75), rgba(22,163,74,0.15))" : "linear-gradient(180deg, rgba(179,36,42,0.7), rgba(179,36,42,0.12))" }} />
        );
      })}
    </div>
  );
};

const Btn: React.FC<{ icon: string; label: string; primary?: boolean; press?: number; glow?: number }> = ({ icon, label, primary, press = 0, glow = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 10, transform: `scale(${1 - press * 0.06})`, background: primary ? C.red : "#fff", border: primary ? "none" : `1px solid ${C.red}`, boxShadow: primary ? `0 8px 22px -8px rgba(179,36,42,0.55), 0 0 0 ${glow * 8}px rgba(179,36,42,${0.18 * glow})` : "none", ...T(15, 500, primary ? "#fff" : C.red) }}>
    <Icon name={icon} size={16} color={primary ? "#fff" : C.red} />{label}
  </div>
);

const hl = (on: boolean, dim: number): React.CSSProperties => ({ opacity: on || !dim ? 1 : 1 - dim * 0.55, boxShadow: on ? `0 0 0 3px ${C.red}, 0 18px 40px -16px rgba(179,36,42,0.45)` : (card.boxShadow as string), transition: "none" });

export const Dashboard: React.FC<DashState> = ({ depositPress = 0, depositGlow = 0, highlight = null, dim = 0 }) => (
  <div style={{ position: "absolute", left: 250, top: 66, width: PW - 250, height: PH - 66, background: "#FAFBFC", padding: 26, display: "flex", gap: 22 }}>
    <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Portfolio */}
      <div style={{ ...card, padding: 24, height: 300, position: "relative", overflow: "hidden", ...hl(highlight === "wallet", dim) }}>
        <div style={{ ...T(13, 500, C.red, { letterSpacing: "0.12em" }), display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: 9, background: C.red }} />PORTFOLIO OVERVIEW</div>
        <div style={{ ...T(46, 600, C.ink, { letterSpacing: "-0.03em" }), marginTop: 10 }}>$12,480.<span style={{ color: C.faint }}>50</span></div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{ padding: "6px 12px", borderRadius: 99, border: `1px solid ${C.line}`, ...T(13, 400, C.sub), ...(highlight === "accounts" ? { border: `2px solid ${C.red}`, color: C.red } : {}) }}>Real Accounts: 2</div>
          <div style={{ padding: "6px 12px", borderRadius: 99, background: C.redSoft, ...T(13, 500, C.red) }}>Portfolio Overview ›</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
          {[["wallet", "WALLET BALANCE", "$4,250.00", C.red, C.redSoft], ["trend", "FREE MARGIN", "$8,230.50", C.green, C.greenSoft]].map(([ic, l, v, col, bg]) => (
            <div key={l} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", borderRadius: 14, border: `1px solid ${C.line}`, minWidth: 210 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "grid", placeItems: "center" }}><Icon name={ic} size={18} color={col} /></div>
              <div><div style={T(11, 500, C.sub, { letterSpacing: "0.08em" })}>{l}</div><div style={T(17, 600, C.ink)}>{v}</div></div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Btn icon="plus" label="Deposit" primary press={depositPress} glow={depositGlow} />
          <Btn icon="upload" label="Withdrawal" />
          <Btn icon="swap" label="Transfer" />
        </div>
        <div style={{ position: "absolute", right: 24, bottom: 20 }}><Candles /></div>
      </div>
      {/* Tiles */}
      <div style={{ ...card, padding: "18px 24px", display: "flex", gap: 34, opacity: dim ? 1 - dim * 0.55 : 1 }}>
        {[["bars", "Markets", "#EEF2FF", "#4F46E5"], ["star", "Loyalty Points", C.amberSoft, C.amber], ["gift", "Promotions", C.redSoft, C.red], ["trophy", "Tournaments", "#FFF1E6", "#EA580C"]].map(([ic, l, bg, col]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 130 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "grid", placeItems: "center" }}><Icon name={ic} size={24} color={col} /></div>
            <div style={T(14, 500)}>{l}</div>
          </div>
        ))}
      </div>
      {/* Social + trend */}
      <div style={{ display: "flex", gap: 20, flex: 1 }}>
        <div style={{ ...card, flex: 1, padding: 22, ...hl(highlight === "social", dim) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(18, 600, C.ink) }}><Icon name="users" size={20} color={C.red} />Social Trading Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            {[["Traders followed", "6"], ["Copy balance", "$1,200"], ["Social accounts", "5"], ["Win rate", "64%"]].map(([l, v]) => (
              <div key={l} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}><div style={T(12, 400, C.sub)}>{l}</div><div style={T(20, 600, C.ink)}>{v}</div></div>
            ))}
          </div>
        </div>
        <div style={{ ...card, flex: 1, padding: 22, opacity: dim ? 1 - dim * 0.55 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(18, 600, C.ink) }}><Icon name="trend" size={20} color={C.red} />Balance Trend</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 150, marginTop: 18, paddingLeft: 6 }}>
            {[14, 14, 18, 18, 40, 58, 72, 120].map((v, i) => (
              <div key={i} style={{ width: 26, height: v, borderRadius: 6, background: i === 2 || i === 3 ? C.amber : C.green, opacity: 0.85 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Right column */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...card, padding: 22, ...hl(highlight === "calendar", dim) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(18, 600, C.ink) }}><Icon name="calendar" size={20} color={C.red} />Economic Calendar</div>
        {[["USD", "Non-Farm Payrolls", "13:30", 3], ["EUR", "CPI (YoY)", "10:00", 2], ["GBP", "BoE Rate Decision", "12:00", 3]].map(([cur, ev, tm, imp]) => (
          <div key={ev as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 48, padding: "4px 0", textAlign: "center", borderRadius: 8, background: "#F3F4F6", ...T(12, 600, C.text) }}>{cur}</div>
            <div style={{ flex: 1, ...T(14, 500) }}>{ev}</div>
            <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 14, borderRadius: 3, background: d < (imp as number) ? C.red : C.line }} />)}</div>
            <div style={T(13, 400, C.sub)}>{tm}</div>
          </div>
        ))}
      </div>
      <div style={{ ...card, padding: 22, flex: 1, opacity: dim ? 1 - dim * 0.55 : 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(18, 600, C.ink) }}>Latest Transactions</div>
        {[["Crypto Wallet · Nov 18", "$750.00"], ["E-Wallet · Nov 12", "$300.00"], ["Crypto Wallet · Nov 02", "$1,000.00"]].map(([m, v]) => (
          <TxRow key={m} method={m} amount={v} status="Approved" />
        ))}
      </div>
    </div>
  </div>
);

export const TxRow: React.FC<{ method: string; amount: string; status: "Approved" | "Pending"; flash?: number }> = ({ method, amount, status, flash = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", margin: "0 -10px", borderRadius: 12, borderBottom: `1px solid ${C.line}`, background: `rgba(179,36,42,${0.07 * flash})` }}>
    <div style={{ width: 36, height: 36, borderRadius: 99, background: status === "Approved" ? C.greenSoft : C.amberSoft, display: "grid", placeItems: "center" }}><Icon name="download" size={16} color={status === "Approved" ? C.green : C.amber} /></div>
    <div style={{ flex: 1 }}><div style={T(15, 600, C.ink)}>Deposit</div><div style={T(12, 400, C.sub)}>{method}</div></div>
    <div style={{ textAlign: "right" }}>
      <div style={T(15, 600, C.ink)}>{amount}</div>
      <div style={{ display: "inline-block", marginTop: 3, padding: "2px 10px", borderRadius: 99, background: status === "Approved" ? C.greenSoft : C.amberSoft, ...T(11, 600, status === "Approved" ? C.green : C.amber) }}>{status}</div>
    </div>
  </div>
);

// ---------------- Deposit flow ----------------
export const STEPS = ["Select Method", "Deposit Details", "Review", "Confirmation"];

// step: continuous 0..3 (0 = method, 1 = details, 2 = review, 3 = confirm); fractional values animate the progress line.
export const Stepper: React.FC<{ step: number }> = ({ step }) => (
  <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "0 40px" }}>
    <div style={{ position: "absolute", left: 100, right: 100, top: 22, height: 3, borderRadius: 3, background: C.line }} />
    <div style={{ position: "absolute", left: 100, top: 22, height: 3, borderRadius: 3, background: C.green, width: `calc(${Math.min(step, 3) / 3} * (100% - 200px))` }} />
    {STEPS.map((l, i) => {
      const done = Math.max(0, Math.min(1, step - i)); // 0..1 -> morph number to check
      const active = step >= i - 0.001;
      return (
        <div key={l} style={{ position: "relative", width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: 99, display: "grid", placeItems: "center", background: done > 0.5 ? C.green : active ? C.redDeep : "#fff", border: active || done ? "none" : `2px solid ${C.line}`, boxShadow: active && done < 0.5 ? `0 0 0 6px ${C.redSoft}` : "none", ...T(17, 600, active ? "#fff" : C.faint) }}>
            {done > 0.5 ? <Icon name="check" size={22} color="#fff" sw={3} draw={Math.min(1, (done - 0.5) * 2)} /> : i + 1}
          </div>
          <div style={{ ...T(14, active ? 600 : 400, active ? C.ink : C.sub), whiteSpace: "nowrap" }}>{l}</div>
        </div>
      );
    })}
  </div>
);

const MethodCard: React.FC<{ icon: string; title: string; sub: string; sel?: number; ring?: number; appear?: number }> = ({ icon, title, sub, sel = 0, ring = 0, appear = 1 }) => (
  <div style={{ position: "relative", flex: 1, padding: 22, borderRadius: 16, border: `${1 + sel}px solid ${sel > 0.5 ? C.red : C.line}`, background: sel > 0.5 ? "#FDF5F6" : "#fff", opacity: appear, transform: `translateY(${(1 - appear) * 24}px) scale(${mix(0.96, 1, appear)})`, boxShadow: ring ? `0 0 0 ${4 * ring}px rgba(179,36,42,${0.22 * ring}), 0 20px 40px -20px rgba(179,36,42,${0.4 * ring})` : "none" }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: C.redSoft, display: "grid", placeItems: "center" }}><Icon name={icon} size={26} color={C.red} /></div>
    <div style={{ ...T(19, 600, C.ink), marginTop: 16 }}>{title}</div>
    <div style={{ ...T(14, 400, C.sub), marginTop: 4 }}>{sub}</div>
    {sel > 0 && (
      <div style={{ position: "absolute", right: 16, top: 16, width: 30, height: 30, borderRadius: 99, background: C.red, display: "grid", placeItems: "center", transform: `scale(${sel})` }}>
        <Icon name="check" size={17} color="#fff" sw={3} draw={sel} />
      </div>
    )}
  </div>
);

export type DepositState = {
  step: number; // 0..3 continuous
  view: 0 | 1 | 2 | 3; // which panel content is shown
  viewT?: number; // 0..1 panel entrance
  cardsIn?: number[]; // method card appear 0..1
  rings?: number[]; // method card highlight
  sel?: number; // crypto selected 0..1
  amount?: string; // typed amount
  caret?: boolean;
  chip?: number; // quick chip selected 0..1
  checks?: number[]; // review row checks 0..1
  confirmPress?: number;
  morph?: number; // confirm button -> spinner -> success 0..1..2
  success?: number; // success content 0..1
  summaryAmount?: string;
  continuePress?: number;
};

const Continue: React.FC<{ label: string; press?: number; morph?: number }> = ({ label, press = 0, morph = 0 }) => {
  // morph 0: pill button, 0..1 shrink into circle spinner
  const m = Math.min(1, morph);
  const w = mix(780, 64, m);
  return (
    <div style={{ height: 64, display: "flex", justifyContent: "center" }}>
      <div style={{ width: w, height: 64, borderRadius: mix(14, 32, m), background: C.redDeep, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${1 - press * 0.04})`, boxShadow: "0 14px 30px -14px rgba(122,10,10,0.7)", overflow: "hidden" }}>
        {m < 0.4 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 1 - m / 0.4, ...T(18, 500, "#fff") }}>{label}<Icon name="arrowRight" size={18} color="#fff" /></div>
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: 99, border: "3px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", transform: `rotate(${morph * 540}deg)`, opacity: (m - 0.4) / 0.6 }} />
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ l: string; v: React.ReactNode; check?: number; strong?: boolean }> = ({ l, v, check = 0, strong }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: `1px solid ${C.line}` }}>
    <div style={{ width: 30, height: 30, borderRadius: 99, marginRight: 14, background: check ? C.greenSoft : "#F3F4F6", display: "grid", placeItems: "center", transform: `scale(${0.85 + 0.15 * check})` }}>
      {check > 0 ? <Icon name="check" size={16} color={C.green} sw={3} draw={check} /> : null}
    </div>
    <div style={{ flex: 1, ...T(16, 400, C.sub) }}>{l}</div>
    <div style={T(strong ? 20 : 16, strong ? 700 : 600, C.ink)}>{v}</div>
  </div>
);

export const DepositPage: React.FC<DepositState> = (st) => {
  const vt = st.viewT ?? 1;
  const enter: React.CSSProperties = { position: "absolute", left: 30, right: 30, top: 150, bottom: 28, opacity: vt, transform: `translateX(${(1 - vt) * 40}px)` };
  return (
    <div style={{ position: "absolute", left: 250, top: 66, width: PW - 250, height: PH - 66, background: "#FAFBFC", padding: "26px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(34, 600, C.ink, { letterSpacing: "-0.03em" }) }}>Deposit <Icon name="info" size={20} color={C.amber} /></div>
      <div style={{ ...T(16, 400, C.sub), marginTop: 4 }}>Fund your trading account.</div>
      <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
        <div style={{ ...card, width: 880, height: 640, padding: "26px 30px", position: "relative", overflow: "hidden" }}>
          <Stepper step={st.step} />
          <div style={{ height: 1, background: C.line, margin: "24px 0" }} />
          {st.view === 0 && (
            <div style={enter}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, ...T(21, 600, C.ink) }}><Num n={1} />Select Deposit Method</div>
              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                <MethodCard icon="bitcoin" title="Crypto Wallet" sub="USDT, BTC & more" sel={st.sel} ring={st.rings?.[0]} appear={st.cardsIn?.[0]} />
                <MethodCard icon="card" title="E-Wallet" sub="Pay from your e-wallet" ring={st.rings?.[1]} appear={st.cardsIn?.[1]} />
                <MethodCard icon="bank" title="Local Bank" sub="Transfer from your bank" ring={st.rings?.[2]} appear={st.cardsIn?.[2]} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Continue label="Continue" press={st.continuePress} /></div>
            </div>
          )}
          {st.view === 1 && (
            <div style={enter}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, ...T(21, 600, C.ink) }}><Num n={2} />Deposit Details</div>
              <div style={{ ...T(14, 500, C.sub), marginTop: 20 }}>Amount</div>
              <div style={{ marginTop: 8, height: 74, borderRadius: 14, border: `2px solid ${C.red}`, boxShadow: `0 0 0 5px ${C.redSoft}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "#F3F4F6", ...T(15, 600) }}>USD</div>
                <div style={T(32, 600, C.ink, { letterSpacing: "-0.02em" })}>{st.amount || ""}{st.caret && <span style={{ display: "inline-block", width: 3, height: 34, background: C.red, marginLeft: 3, verticalAlign: "middle" }} />}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {["$100", "$250", "$500", "$1,000"].map((x) => {
                  const on = x === "$500" ? st.chip ?? 0 : 0;
                  return <div key={x} style={{ padding: "9px 18px", borderRadius: 99, border: `1px solid ${on > 0.5 ? C.red : C.line}`, background: on > 0.5 ? C.redSoft : "#fff", ...T(15, 500, on > 0.5 ? C.red : C.text) }}>{x}</div>;
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
                <Field label="Network" value="USDT · TRC20" icon="bitcoin" />
                <Field label="Deposit to" value="Wallet · USD" icon="wallet" />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Continue label="Continue" press={st.continuePress} /></div>
            </div>
          )}
          {st.view === 2 && (
            <div style={enter}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, ...T(21, 600, C.ink) }}><Num n={3} />Review Your Deposit</div>
              <div style={{ marginTop: 10 }}>
                <Row l="Method" v="Crypto Wallet" check={st.checks?.[0]} />
                <Row l="Network" v="USDT · TRC20" check={st.checks?.[1]} />
                <Row l="Deposit to" v="Wallet · USD" check={st.checks?.[2]} />
                <Row l="Amount" v="$500.00" check={st.checks?.[3]} strong />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Continue label="Continue" press={st.continuePress} /></div>
            </div>
          )}
          {st.view === 3 && (
            <div style={enter}>
              {(st.success ?? 0) <= 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, ...T(21, 600, C.ink) }}><Num n={4} />Confirmation</div>
                  <div style={{ ...T(16, 400, C.sub), marginTop: 14, maxWidth: 560 }}>You're depositing <b style={{ color: C.ink }}>$500.00</b> via Crypto Wallet into your ABET wallet.</div>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}><Continue label="Confirm Deposit" press={st.confirmPress} morph={st.morph} /></div>
                </>
              ) : (
                <Success t={st.success ?? 0} />
              )}
            </div>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...card, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, ...T(18, 600, C.ink) }}><Icon name="card" size={20} color={C.red} />Deposit Summary</div>
            {[["Method", st.step >= 0.5 || (st.sel ?? 0) > 0.5 ? "Crypto Wallet" : "—"], ["Deposit to", "Wallet · USD"], ["Amount", st.summaryAmount || "—"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${C.line}` }}><span style={T(14, 400, C.sub)}>{l}</span><span style={T(14, 600, C.ink)}>{v}</span></div>
            ))}
          </div>
          <div style={{ ...card, padding: 22, display: "flex", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redSoft, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="shield" size={20} color={C.red} /></div>
            <div><div style={T(16, 600, C.ink)}>Important Information</div><div style={{ ...T(14, 400, C.sub), marginTop: 6, lineHeight: 1.5 }}>Double-check the network and amount before you confirm. Our support team is available 24/7.</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Num: React.FC<{ n: number }> = ({ n }) => <div style={{ width: 30, height: 30, borderRadius: 99, background: C.redSoft, display: "grid", placeItems: "center", ...T(14, 600, C.red) }}>{n}</div>;
const Field: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div style={{ flex: 1 }}>
    <div style={T(14, 500, C.sub)}>{label}</div>
    <div style={{ marginTop: 8, height: 56, borderRadius: 12, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", ...T(16, 500, C.ink) }}><Icon name={icon} size={18} color={C.red} />{value}<div style={{ flex: 1 }} /><Icon name="chevron" size={16} color={C.faint} /></div>
  </div>
);

export const Success: React.FC<{ t: number }> = ({ t }) => {
  const c = Math.min(1, t * 1.6);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <div style={{ position: "absolute", inset: -24, borderRadius: 999, background: C.greenSoft, transform: `scale(${c})`, opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: C.green, transform: `scale(${c})`, display: "grid", placeItems: "center", boxShadow: "0 20px 40px -14px rgba(22,163,74,0.6)" }}>
          <Icon name="check" size={64} color="#fff" sw={3} draw={Math.max(0, Math.min(1, (t - 0.35) * 2.2))} />
        </div>
      </div>
      <div style={{ ...T(30, 600, C.ink, { letterSpacing: "-0.02em" }), marginTop: 36, opacity: Math.min(1, Math.max(0, (t - 0.4) * 3)) }}>Deposit submitted</div>
      <div style={{ ...T(17, 400, C.sub), marginTop: 8, opacity: Math.min(1, Math.max(0, (t - 0.5) * 3)) }}>$500.00 · Crypto Wallet · USDT (TRC20)</div>
    </div>
  );
};

// ---------------- The window chrome ----------------
export const PortalWindow: React.FC<{ children: React.ReactNode; active?: string; sub?: string; style?: React.CSSProperties }> = ({ children, active = "Discover", sub, style }) => (
  <div style={{ position: "absolute", width: PW, height: PH, borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px -30px rgba(15,23,42,0.35), 0 0 0 1px rgba(15,23,42,0.06)", ...style }}>
    <Header />
    <Sidebar active={active} sub={sub} />
    {children}
  </div>
);
