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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--muted)" }}>Argus</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--subtle)" }}>
              Local fallback active. Adapter-ready for 0G Chain and 0G Storage.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
