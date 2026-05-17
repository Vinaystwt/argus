import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData, compactHash } from "@/lib/demo";

export const metadata = { title: "Monitor" };

export default function MonitorPage() {
  const data = getDemoData();
  return (
    <ConsoleShell title="Event stream" eyebrow="Live monitoring">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--approved)", display: "inline-block", animation: "dot-pulse 2s ease infinite" }} />
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Deterministic event stream · {data.events.length} events · {data.providerStatus?.label ?? "0G Mainnet live"}
          </p>
        </div>
      </div>
      <div className="panel" style={{ overflow: "hidden" }}>
        <div className="table-head" style={{ gridTemplateColumns: "120px minmax(0,1fr) minmax(0,1.5fr) minmax(0,160px) 80px", display: "grid", padding: "10px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
          <span>Kind</span><span>Title</span><span>Summary</span><span>Tx hash</span><span>Severity</span>
        </div>
        {data.events.map((event, i) => (
          <div key={event.id} style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr) minmax(0,1.5fr) minmax(0,160px) 80px", gap: 12, padding: "13px 16px", borderTop: i > 0 ? "1px solid var(--border)" : "none", background: "var(--surface-1)", alignItems: "center" }}>
            <span className={`badge ${event.kind.includes("Reject") || event.kind.includes("Slash") ? "badge-rejected" : event.kind.includes("Approv") || event.kind.includes("Approved") ? "badge-approved" : ""}`}>
              {event.kind.replace(/([A-Z])/g, " $1").trim().slice(0, 16)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 550 }}>{event.title}</span>
            <span style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.summary}</span>
            <code style={{ fontSize: 11, color: "var(--subtle)", fontFamily: "var(--font-mono), monospace" }}>{event.txHash ? compactHash(event.txHash, 10) : "—"}</code>
            <span className={`badge ${event.severity === "critical" ? "badge-rejected" : event.severity === "warning" ? "badge-amber" : ""}`}>{event.severity}</span>
          </div>
        ))}
      </div>
    </ConsoleShell>
  );
}
