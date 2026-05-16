import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData, compactHash, formatEth } from "@/lib/demo";

export const metadata = { title: "Violation Inbox" };

export default function ViolationsPage() {
  const data = getDemoData();
  const violations = data.violations ?? [];

  return (
    <ConsoleShell title="Violation inbox" eyebrow="Evidence-sealed rejections">
      <div className="panel" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Every rejected action produces a sealed evidence record — not just a log entry. Each violation links the blocked action to the agent&apos;s bond, the mandate clauses violated, and the on-chain slash event.
        </p>
      </div>

      {violations.length === 0 ? (
        <div className="panel" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No violations yet. The mandate court is holding.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {violations.map((v) => (
            <div key={v.violationId} style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--rejected-border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
              {/* Violation header */}
              <div style={{ padding: "20px 24px", background: "var(--rejected-tint)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="badge badge-rejected">{v.lifecycleStatus.replace(/_/g, " ")}</span>
                    <code style={{ fontSize: 11, color: "var(--subtle)", fontFamily: "var(--font-mono), monospace" }}>{v.violationId}</code>
                  </div>
                  <h3 className="text-h3" style={{ marginBottom: 6 }}>{v.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{v.evidenceBundle.summary}</p>
                </div>
                <Link href={`/traces/${encodeURIComponent(v.traceRoot)}`} className="btn btn-danger" style={{ flexShrink: 0, height: 36, fontSize: 12 }}>
                  Replay trace →
                </Link>
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 1, background: "var(--border)" }}>
                {/* Slash receipt */}
                <div style={{ padding: "16px 20px", background: "var(--surface-1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Slash receipt</div>
                  <div className="kv-list">
                    <div className="kv-row"><span className="kv-key">Amount</span><span className="kv-val rejected">{formatEth(v.slashReceipt.amount)}</span></div>
                    <div className="kv-row"><span className="kv-key">Score</span><span className="kv-val">{v.slashReceipt.complianceBefore} → {v.slashReceipt.complianceAfter}</span></div>
                    <div className="kv-row"><span className="kv-key">Event</span><span className="kv-val">{v.slashReceipt.eventName}</span></div>
                    <div className="kv-row"><span className="kv-key">Tx hash</span><code className="kv-val mono">{compactHash(v.slashReceipt.txHash, 12)}</code></div>
                  </div>
                </div>

                {/* Evidence */}
                <div style={{ padding: "16px 20px", background: "var(--surface-1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Evidence record</div>
                  <div className="kv-list">
                    <div className="kv-row"><span className="kv-key">Clauses violated</span><span className="kv-val rejected">{v.violatedClauses.length}</span></div>
                    <div className="kv-row"><span className="kv-key">Challenge window</span><span className="kv-val">{v.challengeWindow.status}</span></div>
                    <div className="kv-row"><span className="kv-key">Trace root</span><code className="kv-val mono">{compactHash(v.traceRoot, 12)}</code></div>
                    <div className="kv-row"><span className="kv-key">Sealed by</span><span className="kv-val">{v.evidenceBundle.submittedByLabel ?? "watcher"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ConsoleShell>
  );
}
