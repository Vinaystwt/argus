import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getAgent, getDemoData, formatEth, formatUsdc, compactHash } from "@/lib/demo";

export const metadata = { title: "Agent Passport" };

export function generateStaticParams() {
  const data = getDemoData();
  const agents = data.agents ?? (data.agent ? [data.agent] : []);
  return agents.map((a) => ({ agentId: a.id }));
}

export default async function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) notFound();

  const data = getDemoData();
  const agentTraces = data.traces.filter((t) => t.agentId === agent.id);
  const agentViolations = data.violations?.filter((v) =>
    agentTraces.some((t) => t.proof.committedTraceRoot === v.traceRoot)
  ) ?? [];

  const approved = agentTraces.filter((t) => t.policyCheck.verdict === "APPROVED").length;
  const rejected = agentTraces.filter((t) => t.policyCheck.verdict === "REJECTED").length;
  const slashed = agentTraces.filter((t) => t.penalty.slashed).reduce((sum, t) => sum + Number(t.penalty.amount ?? 0), 0).toString();

  return (
    <ConsoleShell title={agent.label} eyebrow="Agent passport">
      {/* Identity header */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {[
            { k: "Bond balance", v: formatEth(agent.bondBalance), color: Number(agent.bondBalance) > 0 ? "var(--approved)" : "var(--rejected)" },
            { k: "Compliance score", v: String(agent.complianceScore), color: agent.complianceScore >= 800 ? "var(--approved)" : agent.complianceScore >= 600 ? "var(--amber)" : "var(--rejected)" },
            { k: "Approved actions", v: String(approved), color: "var(--approved)" },
            { k: "Violations", v: String(rejected), color: rejected > 0 ? "var(--rejected)" : "var(--muted)" },
          ].map(({ k, v, color }) => (
            <div key={k} style={{ padding: "16px 20px", background: "var(--surface-1)" }}>
              <div className="metric-label">{k}</div>
              <div className="metric-value" style={{ fontSize: 22, color }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Identity</div>
          <div className="kv-list">
            <div className="kv-row"><span className="kv-key">Passport ID</span><code className="kv-val mono">{compactHash(agent.passportId, 12)}</code></div>
            <div className="kv-row"><span className="kv-key">Role</span><span className="kv-val">{agent.role ?? "agent"}</span></div>
            <div className="kv-row"><span className="kv-key">Status</span><span className={`kv-val ${agent.heartbeatStatus === "online" ? "approved" : ""}`}>{agent.heartbeatStatus ?? "unknown"}</span></div>
            {slashed !== "0" && <div className="kv-row"><span className="kv-key">Total slashed</span><span className="kv-val rejected">{formatEth(slashed)}</span></div>}
          </div>
        </div>
      </div>

      {/* Violations */}
      {agentViolations.length > 0 && (
        <div className="panel-danger" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rejected)", marginBottom: 10 }}>Violations</div>
          {agentViolations.map((v) => (
            <div key={v.violationId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="badge badge-rejected">{v.lifecycleStatus.replace(/_/g, " ")}</span>
              <span style={{ fontSize: 13, fontWeight: 550 }}>{v.title}</span>
              <Link href="/violations" style={{ fontSize: 12, color: "var(--chain)", marginLeft: "auto" }}>View evidence →</Link>
            </div>
          ))}
        </div>
      )}

      {/* Trace history */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <span className="eyebrow">Trace history</span>
          <h3 className="text-h3">All actions proposed by this agent.</h3>
        </div>
        <div className="data-table" style={{ border: "none" }}>
          <div className="table-head" style={{ gridTemplateColumns: "90px minmax(0,1fr) 120px minmax(0,140px)" }}>
            <span>Verdict</span><span>Action</span><span>Amount</span><span>Trace root</span>
          </div>
          {agentTraces.map((trace) => (
            <Link key={trace.traceId} href={`/traces/${encodeURIComponent(trace.proof.committedTraceRoot)}`} className="table-row" style={{ gridTemplateColumns: "90px minmax(0,1fr) 120px minmax(0,140px)" }}>
              <span className={`badge ${trace.policyCheck.verdict === "APPROVED" ? "badge-approved" : "badge-rejected"}`}>{trace.policyCheck.verdict}</span>
              <span style={{ fontSize: 13 }}>{trace.proposedAction.actionType}</span>
              <span style={{ fontSize: 13 }}>{formatUsdc(trace.proposedAction.amount)}</span>
              <code style={{ fontSize: 11, color: "var(--chain)", fontFamily: "var(--font-mono), monospace" }}>{compactHash(trace.proof.committedTraceRoot, 10)}</code>
            </Link>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
