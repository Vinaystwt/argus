import type { ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="shell" style={{ paddingTop: 0 }}>
        <SiteNav />
      </div>
      {children}
      <footer className="site-footer">
        <div className="shell">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--muted)" }}>Argus</span>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="https://github.com/Vinaystwt/argus" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--subtle)" }}>GitHub</a>
              <a href="https://x.com/VinaySTWT" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--subtle)" }}>X / Twitter</a>
              <a href="https://chainscan.0g.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--subtle)" }}>0G Explorer</a>
              <span style={{ fontSize: 12, color: "var(--subtle)" }}>0G Mainnet · Chain ID 16661</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
