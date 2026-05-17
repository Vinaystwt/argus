import Link from "next/link";
import type { ReactNode } from "react";
import { getDemoData } from "@/lib/demo";
import { ConsoleNav } from "@/components/ConsoleNav";

export function ConsoleShell({
  children,
  title,
  eyebrow,
  actions,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const data = getDemoData();
  const rejected = data.traces.filter((t) => t.policyCheck.verdict === "REJECTED").length;
  const approved = data.traces.filter((t) => t.policyCheck.verdict === "APPROVED").length;

  return (
    <div className="console-layout">
      <aside className="console-sidebar">
        <Link href="/" className="sidebar-brand">
          <span className="brand-dot" />
          <span>
            <span className="brand-name">Argus</span>
            <span className="brand-sub">Mandate Court</span>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="Console navigation">
          <ConsoleNav />
        </nav>
        <div className="sidebar-footer">
          <div className="proof-mode-block">
            <span className="label">Proof mode</span>
            <span className="value">{data.providerStatus?.label ?? "Local"}</span>
            {data.mode === "0g" ? (
              <p className="note">
                Live on 0G Mainnet. Trace roots and storage URIs are committed on-chain.
              </p>
            ) : (
              <p className="note">
                Local mode. Roots and storage URIs available for local verification.
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <a href="https://github.com/Vinaystwt/argus" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--subtle)" }}>GitHub</a>
            <a href="https://x.com/VinaySTWT" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--subtle)" }}>X</a>
            <a href="/" style={{ fontSize: 11, color: "var(--subtle)" }}>useargus.xyz</a>
          </div>
        </div>
      </aside>
      <main className="console-main">
        <header className="console-header">
          <div className="console-title">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="text-h1">{title}</h1>
          </div>
          <div>
            {actions}
            <div className="health-strip">
              <div className="health-tile">
                <span className="ht-label">Traces</span>
                <span className="ht-value">{data.traces.length}</span>
              </div>
              <div className="health-tile">
                <span className="ht-label">Approved</span>
                <span className="ht-value" style={{ color: "var(--approved)" }}>{approved}</span>
              </div>
              <div className="health-tile">
                <span className="ht-label">Rejected</span>
                <span className="ht-value" style={{ color: "var(--rejected)" }}>{rejected}</span>
              </div>
              <div className="health-tile">
                <span className="ht-label">Mode</span>
                <span className="ht-value" style={{ fontSize: 12, paddingTop: 2 }}>
                  {data.mode === "0g" ? "0G" : "Local"}
                </span>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
