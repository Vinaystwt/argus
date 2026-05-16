import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getAgents, formatEth } from "@/lib/demo";

export const metadata = { title: "Agents" };

export default function AgentsPage() {
  const agents = getAgents();
  return (
    <ConsoleShell title="Agent registry" eyebrow="Bonded identities">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Bonded agents are accountable identities, not anonymous scripts. Each passport carries bond status, compliance score, mandate assignments, and any slash history.
        </p>
      </div>
      <div className="data-table">
        <div className="table-head" style={{ gridTemplateColumns: "160px 80px 1fr 120px 100px 100px" }}>
          <span>Agent</span><span>ID</span><span>Role</span><span>Bond</span><span>Score</span><span>Status</span>
        </div>
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`} className="table-row" style={{ gridTemplateColumns: "160px 80px 1fr 120px 100px 100px" }}>
            <span style={{ fontWeight: 600 }}>{agent.label}</span>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--subtle)" }}>#{agent.id}</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{agent.role ?? "agent"}</span>
            <span style={{ fontSize: 13 }}>{formatEth(agent.bondBalance)}</span>
            <span style={{ fontSize: 13, color: agent.complianceScore >= 800 ? "var(--approved)" : agent.complianceScore >= 600 ? "var(--amber)" : "var(--rejected)" }}>
              {agent.complianceScore}
            </span>
            <span className={`badge ${agent.heartbeatStatus === "online" ? "badge-approved" : ""}`}>
              {agent.heartbeatStatus ?? "unknown"}
            </span>
          </Link>
        ))}
      </div>
    </ConsoleShell>
  );
}
