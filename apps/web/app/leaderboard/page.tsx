import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getAgents, formatEth, getDemoData } from "@/lib/demo";

export const metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  const agents = [...getAgents()].sort((a, b) => b.complianceScore - a.complianceScore);
  const data = getDemoData();

  return (
    <ConsoleShell title="Agent reputation leaderboard" eyebrow="Compliance registry">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Compliance score reflects the agent&apos;s track record across all mandates. Each approved action improves the score; each violation and slash reduces it.
          Reputation follows the agent passport.
        </p>
      </div>
      <div className="data-table">
        <div className="table-head" style={{ gridTemplateColumns: "40px 160px 80px 120px 120px 80px 80px" }}>
          <span>#</span><span>Agent</span><span>ID</span><span>Score</span><span>Bond</span><span>Approved</span><span>Violations</span>
        </div>
        {agents.map((agent, i) => {
          const agentTraces = data.traces.filter((t) => t.agentId === agent.id);
          const approved = agentTraces.filter((t) => t.policyCheck.verdict === "APPROVED").length;
          const violations = agentTraces.filter((t) => t.policyCheck.verdict === "REJECTED").length;
          const rank = i + 1;
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="table-row" style={{ gridTemplateColumns: "40px 160px 80px 120px 120px 80px 80px" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: rank === 1 ? "var(--amber)" : rank === 2 ? "var(--muted)" : "var(--subtle)" }}>
                {rank}
              </span>
              <span style={{ fontWeight: 600 }}>{agent.label}</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--subtle)" }}>#{agent.id}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 650, color: agent.complianceScore >= 800 ? "var(--approved)" : agent.complianceScore >= 600 ? "var(--amber)" : "var(--rejected)" }}>
                  {agent.complianceScore}
                </span>
                <div style={{ flex: 1, height: 4, background: "var(--surface-3)", borderRadius: "var(--r-pill)", overflow: "hidden", maxWidth: 60 }}>
                  <div style={{ height: "100%", width: `${(agent.complianceScore / 1000) * 100}%`, background: agent.complianceScore >= 800 ? "var(--approved)" : agent.complianceScore >= 600 ? "var(--amber)" : "var(--rejected)", borderRadius: "var(--r-pill)" }} />
                </div>
              </div>
              <span style={{ fontSize: 13 }}>{formatEth(agent.bondBalance)}</span>
              <span style={{ fontSize: 13, color: "var(--approved)" }}>{approved}</span>
              <span style={{ fontSize: 13, color: violations > 0 ? "var(--rejected)" : "var(--muted)" }}>{violations}</span>
            </Link>
          );
        })}
      </div>
    </ConsoleShell>
  );
}
