import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { fontsLoaded } from "./theme";
import { Dashboard, DepositPage, PortalWindow } from "./portal";
import { BrowserScreen } from "./macbook";

// Laptop screen states rendered once to PNG, then used as a flat texture inside the 3D lid (no text shimmer).
export const SCREENS = ["dash", "dep1", "success"] as const;
export const AbetScreen: React.FC<{ s: (typeof SCREENS)[number] }> = ({ s }) => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { let d = false; const fin = () => { if (!d) { d = true; continueRender(h); } }; Promise.race([fontsLoaded.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 6000))]).then(fin, fin); }, [h]);
  const deposit = s !== "dash";
  return (
    <div style={{ position: "relative", width: 1600, height: 1000 }}>
      <BrowserScreen>
        <PortalWindow bare active={deposit ? "Funds" : "Discover"} sub={deposit ? "Deposit" : undefined} style={{ left: 0, top: 0 }}>
          {s === "dash" && <Dashboard />}
          {s === "dep1" && <DepositPage step={0} view={0} />}
          {s === "success" && <DepositPage step={4} view={3} success={1} summaryAmount="$500.00" />}
        </PortalWindow>
      </BrowserScreen>
    </div>
  );
};
