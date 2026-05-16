import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData, compactHash, formatUsdc, normalizeStorageURI } from "@/lib/demo";

export const metadata = { title: "Trace Archive" };

export default function TracesPage() {
  const data = getDemoData();
  return (
    <ConsoleShell title="Trace archive" eyebrow="Black-box records">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Every action that passed through ActionGate — approved or rejected — is a replayable record. Each trace links to its mandate, agent, proof package, and any violation it generated.
        </p>
      </div>
      <div className="data-table">
        <div className="table-head" style={{ gridTemplateColumns: "90px minmax(0,1fr) minmax(0,1fr) 100px minmax(0,160px) 70px" }}>
          <span>Verdict</span><span>Action</span><span>Inference</span><span>Agent</span><span>Trace root</span><span>Mode</span>
        </div>
        {data.traces.map((trace) => (
          <Link key={trace.traceId} href={`/traces/${encodeURIComponent(trace.proof.committedTraceRoot)}`} className="table-row" style={{ gridTemplateColumns: "90px minmax(0,1fr) minmax(0,1fr) 100px minmax(0,160px) 70px" }}>
            <span className={`badge ${trace.policyCheck.verdict === "APPROVED" ? "badge-approved" : "badge-rejected"}`}>
              {trace.policyCheck.verdict}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 550 }}>{trace.proposedAction.actionType}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{formatUsdc(trace.proposedAction.amount)}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {trace.inference.summary.slice(0, 60)}…
            </span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Agent {trace.agentId}</span>
            <code style={{ fontSize: 11, color: "var(--chain)", fontFamily: "var(--font-mono), monospace" }}>
              {compactHash(trace.proof.committedTraceRoot, 12)}
            </code>
            <span className="badge badge-local">Local</span>
          </Link>
        ))}
      </div>
    </ConsoleShell>
  );
}
