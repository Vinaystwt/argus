import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getMandate, getDemoData, formatUsdc, compactHash } from "@/lib/demo";

export const metadata = { title: "Mandate" };

export function generateStaticParams() {
  const data = getDemoData();
  const mandates = data.mandates ?? (data.mandate ? [data.mandate] : []);
  return mandates.map((m) => ({ id: m.id }));
}

export default async function MandatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mandate = getMandate(id);
  if (!mandate) notFound();

  const data = getDemoData();
  const traces = data.traces.filter((t) => t.mandateId === mandate.id);

  return (
    <ConsoleShell title={mandate.name} eyebrow="Mandate constitution">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 16, marginBottom: 16 }}>
        {/* Clauses */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <span className="eyebrow">Policy clauses</span>
          </div>
          <div style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {[
              { label: "Maximum transaction size", detail: `≤ ${formatUsdc(mandate.maxAmount)}`, severity: "critical", pass: true },
              { label: "Allowed action types", detail: mandate.allowedActionTypes.join(", "), severity: "high", pass: true },
              { label: "Forbidden action types", detail: mandate.forbiddenActionTypes.join(", "), severity: "critical", pass: false },
              { label: "Allowed targets", detail: "mock Uniswap, mock Morpho (allowlist)", severity: "high", pass: true },
              { label: "Blocked recipients", detail: "0x...0BAD (denylist)", severity: "critical", pass: false },
              { label: "Asset constraint", detail: `Asset must match mandate.asset`, severity: "medium", pass: true },
            ].map(({ label, detail, severity, pass }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 80px 80px", gap: 12, padding: "14px 20px", background: "var(--surface-1)", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 550, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{detail}</div>
                </div>
                <span className={`badge ${severity === "critical" ? "badge-rejected" : severity === "high" ? "badge-amber" : ""}`} style={{ justifySelf: "start" }}>{severity}</span>
                <span className={`badge ${pass ? "badge-approved" : "badge-rejected"}`} style={{ justifySelf: "start" }}>{pass ? "allow" : "deny"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Mandate details</div>
          <div className="kv-list">
            <div className="kv-row"><span className="kv-key">ID</span><span className="kv-val">#{mandate.id}</span></div>
            <div className="kv-row"><span className="kv-key">Status</span><span className={`kv-val ${mandate.lifecycleStatus === "active" ? "approved" : ""}`}>{mandate.lifecycleStatus ?? "active"}</span></div>
            <div className="kv-row"><span className="kv-key">Max amount</span><span className="kv-val">{formatUsdc(mandate.maxAmount)}</span></div>
            <div className="kv-row"><span className="kv-key">Policy hash</span><code className="kv-val mono">{compactHash(mandate.policyHash, 12)}</code></div>
            <div className="kv-row"><span className="kv-key">Traces</span><span className="kv-val">{traces.length}</span></div>
          </div>
        </div>
      </div>

      {/* Trace history */}
      {traces.length > 0 && (
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <span className="eyebrow">Traces under this mandate</span>
          </div>
          <div className="data-table" style={{ border: "none" }}>
            <div className="table-head" style={{ gridTemplateColumns: "90px minmax(0,1fr) 100px minmax(0,140px)" }}>
              <span>Verdict</span><span>Action</span><span>Agent</span><span>Trace root</span>
            </div>
            {traces.map((t) => (
              <Link key={t.traceId} href={`/traces/${encodeURIComponent(t.proof.committedTraceRoot)}`} className="table-row" style={{ gridTemplateColumns: "90px minmax(0,1fr) 100px minmax(0,140px)" }}>
                <span className={`badge ${t.policyCheck.verdict === "APPROVED" ? "badge-approved" : "badge-rejected"}`}>{t.policyCheck.verdict}</span>
                <span style={{ fontSize: 13 }}>{t.proposedAction.actionType} · {formatUsdc(t.proposedAction.amount)}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Agent {t.agentId}</span>
                <code style={{ fontSize: 11, color: "var(--chain)", fontFamily: "var(--font-mono), monospace" }}>{compactHash(t.proof.committedTraceRoot, 10)}</code>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ConsoleShell>
  );
}
