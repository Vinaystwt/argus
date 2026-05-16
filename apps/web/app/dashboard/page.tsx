import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData, formatEth, formatUsdc, compactHash } from "@/lib/demo";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const data = getDemoData();
  const agents = data.agents ?? [data.agent];
  const mandates = data.mandates ?? [data.mandate];
  const violations = data.violations ?? [];
  const totalBond = agents.reduce((sum, a) => sum + Number(a.bondBalance), 0).toString();

  return (
    <ConsoleShell title="Risk command center" eyebrow="Mandate court overview">
      {/* Metrics strip */}
      <div className="metric-strip" style={{ marginBottom: 24 }}>
        <div className="metric-tile">
          <div className="metric-label">Active mandates</div>
          <div className="metric-value">{mandates.length}</div>
          <div className="metric-desc">Binding policy surfaces</div>
        </div>
        <div className="metric-tile">
          <div className="metric-label">Bond at risk</div>
          <div className="metric-value">{formatEth(totalBond)}</div>
          <div className="metric-desc">Capital posted by agents</div>
        </div>
        <div className="metric-tile">
          <div className="metric-label">Violations stopped</div>
          <div className="metric-value" style={{ color: "var(--rejected)" }}>{violations.length}</div>
          <div className="metric-desc">Evidence-sealed rejections</div>
        </div>
        <div className="metric-tile">
          <div className="metric-label">Trace roots</div>
          <div className="metric-value">{data.traces.length}</div>
          <div className="metric-desc">Replayable records</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16 }}>
        {/* Court docket */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <span className="eyebrow">Live court docket</span>
            <h2 className="text-h3">Mandates, verdicts, evidence, and slashes.</h2>
          </div>
          <div className="timeline">
            {data.events.slice(0, 8).map((event) => (
              <div key={event.id} className="timeline-item">
                <div className={`timeline-dot ${event.severity === "critical" ? "rejected" : event.severity === "warning" ? "amber" : "approved"}`} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span className={`badge ${event.severity === "critical" ? "badge-rejected" : event.severity === "warning" ? "badge-amber" : "badge-approved"}`}>
                      {event.kind.replace(/_/g, " ")}
                    </span>
                    {event.txHash && (
                      <code style={{ fontSize: 10, color: "var(--subtle)", fontFamily: "var(--font-mono), monospace" }}>
                        {compactHash(event.txHash, 8)}
                      </code>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 550 }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{event.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {/* Violation alert */}
          {violations[0] && (
            <div className="panel-danger" style={{ padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--rejected)", marginBottom: 8 }}>
                Latest violation
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{violations[0].title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
                {violations[0].evidenceBundle.summary}
              </div>
              <Link href="/violations" className="btn btn-danger" style={{ fontSize: 12, height: 32, width: "100%" }}>
                View violation inbox →
              </Link>
            </div>
          )}

          {/* Provider status */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--subtle)", marginBottom: 10 }}>
              Proof infrastructure
            </div>
            <div className="kv-list">
              <div className="kv-row">
                <span className="kv-key">Chain</span>
                <span className="kv-val">{data.providerStatus?.chainProvider ?? "local-simulated"}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Storage</span>
                <span className="kv-val">{data.providerStatus?.storageProvider ?? "local-fallback"}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Mode</span>
                <span className="kv-val amber">{data.providerStatus?.label ?? data.mode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent traces */}
      <div className="panel" style={{ marginTop: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span className="eyebrow">Recent black-box records</span>
            <h2 className="text-h3">Every action routes through ActionGate before execution.</h2>
          </div>
          <Link href="/traces" className="btn btn-ghost" style={{ fontSize: 12, height: 32 }}>View all →</Link>
        </div>
        <div className="data-table" style={{ border: "none" }}>
          <div className="table-head" style={{ gridTemplateColumns: "90px minmax(0,1fr) 100px minmax(0,140px) 80px" }}>
            <span>Verdict</span><span>Action</span><span>Agent</span><span>Trace root</span><span>Mode</span>
          </div>
          {data.traces.map((trace) => (
            <Link key={trace.traceId} href={`/traces/${encodeURIComponent(trace.proof.committedTraceRoot)}`} className="table-row" style={{ gridTemplateColumns: "90px minmax(0,1fr) 100px minmax(0,140px) 80px" }}>
              <span className={`badge ${trace.policyCheck.verdict === "APPROVED" ? "badge-approved" : "badge-rejected"}`}>
                {trace.policyCheck.verdict}
              </span>
              <span style={{ fontSize: 13 }}>{trace.proposedAction.actionType} · {formatUsdc(trace.proposedAction.amount)}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Agent {trace.agentId}</span>
              <code style={{ fontSize: 11, color: "var(--chain)", fontFamily: "var(--font-mono), monospace" }}>{compactHash(trace.proof.committedTraceRoot, 10)}</code>
              <span className="badge badge-local">Local</span>
            </Link>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
