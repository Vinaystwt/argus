import Link from "next/link";
import type { ReactNode } from "react";
import { getDemoData } from "@/lib/demo";
import { ConsoleNav } from "./ConsoleNav";

export function ProductShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const data = getDemoData();
  return (
    <main className="console-layout">
      <aside className="console-sidebar">
        <Link href="/" className="console-brand">
          <span>ARGUS</span>
          <strong>Mandate Court</strong>
        </Link>
        <ConsoleNav />
        <div className="sidebar-proof">
          <span>Proof mode</span>
          <strong>{data.providerStatus?.label ?? data.mode}</strong>
          <p>{data.mode === "0g" ? "Live on 0G Mainnet. Roots, events, and storage URIs are publicly verifiable." : "Serving demo data. Roots and storage URIs match live 0G deployments."}</p>
        </div>
      </aside>
      <section className="console-main">
        <header className="console-header">
          <div>
            <span className="eyebrow">{eyebrow ?? "Autonomous agent accountability infrastructure"}</span>
            <h1>{title}</h1>
          </div>
          <ProofHealthStrip />
        </header>
        {children}
      </section>
    </main>
  );
}

export function ProofHealthStrip() {
  const data = getDemoData();
  const rejected = data.traces.filter((trace) => trace.policyCheck.verdict === "REJECTED").length;
  const approved = data.traces.filter((trace) => trace.policyCheck.verdict === "APPROVED").length;
  return (
    <div className="proof-health">
      <div>
        <span>Traces</span>
        <strong>{data.traces.length}</strong>
      </div>
      <div>
        <span>Approved</span>
        <strong>{approved}</strong>
      </div>
      <div>
        <span>Rejected</span>
        <strong>{rejected}</strong>
      </div>
      <div>
        <span>Provider</span>
        <strong>{data.mode === "0g" ? "0G" : "Local"}</strong>
      </div>
    </div>
  );
}
