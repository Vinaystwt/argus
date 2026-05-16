import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData, getTraceByRoot, getProofPackage, getViolation, compactHash, formatEth, formatUsdc, normalizeStorageURI } from "@/lib/demo";

export const metadata = { title: "Trace Detail" };

export function generateStaticParams() {
  const data = getDemoData();
  return data.traces.map((t) => ({ traceId: encodeURIComponent(t.proof.committedTraceRoot) }));
}

export default async function TraceDetailPage({ params }: { params: Promise<{ traceId: string }> }) {
  const { traceId } = await params;
  const trace = getTraceByRoot(decodeURIComponent(traceId));
  if (!trace) notFound();

  const pkg = getProofPackage(trace.proof.committedTraceRoot);
  const violation = trace.linkedViolationId ? getViolation(trace.linkedViolationId) : undefined;

  return (
    <ConsoleShell title="Black-box replay" eyebrow="Trace detail">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span className={`badge ${trace.policyCheck.verdict === "APPROVED" ? "badge-approved" : "badge-rejected"}`} style={{ fontSize: 13, height: 30 }}>
          {trace.policyCheck.verdict}
        </span>
        <span style={{ fontSize: 14, fontWeight: 550 }}>{trace.proposedAction.actionType} · {formatUsdc(trace.proposedAction.amount)}</span>
        <Link href={`/agents/${trace.agentId}`} style={{ fontSize: 13, color: "var(--chain)" }}>Agent {trace.agentId}</Link>
        <span style={{ fontSize: 13, color: "var(--subtle)" }}>·</span>
        <Link href={`/mandates/${trace.mandateId}`} style={{ fontSize: 13, color: "var(--chain)" }}>Mandate {trace.mandateId}</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Replay timeline */}
          <div className="panel" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <span className="eyebrow">Decision path replay</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="timeline">
                {[
                  { label: "Observation", body: trace.observation.content, meta: `Source: ${trace.observation.source}` },
                  { label: "Memory", body: trace.memory.relevantMemory.join(" · "), meta: trace.memory.promptInjectionDetected ? "⚠ Prompt injection detected" : "No injection signals" },
                  { label: "Inference", body: trace.inference.summary, meta: trace.inference.riskSignals.length > 0 ? `Risk signals: ${trace.inference.riskSignals.join(", ")}` : "No risk signals" },
                  { label: "Proposed action", body: `${trace.proposedAction.actionType} — ${formatUsdc(trace.proposedAction.amount)}`, meta: `Target: ${trace.proposedAction.target} · Recipient: ${trace.proposedAction.recipient}` },
                  { label: "Policy verdict", body: trace.policyCheck.verdict, meta: trace.policyCheck.violationCodes.length > 0 ? `Violations: ${trace.policyCheck.violationCodes.join(", ")}` : "All clauses passed" },
                  { label: "Execution", body: trace.execution.status, meta: trace.execution.reason ?? (trace.execution.txHash ? `Tx: ${compactHash(trace.execution.txHash)}` : "") },
                  { label: "Penalty", body: trace.penalty.slashed ? `Slashed ${formatEth(trace.penalty.amount ?? "0")}` : "No penalty", meta: `Score: ${trace.penalty.complianceScoreBefore} → ${trace.penalty.complianceScoreAfter}` },
                ].map(({ label, body, meta }, i) => (
                  <div key={label} className="timeline-item">
                    <div className={`timeline-dot ${i === 4 && trace.policyCheck.verdict === "REJECTED" ? "rejected" : i === 4 ? "approved" : i === 6 && trace.penalty.slashed ? "rejected" : ""}`} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 550, color: label === "Policy verdict" ? (trace.policyCheck.verdict === "APPROVED" ? "var(--approved)" : "var(--rejected)") : "var(--text)" }}>{body}</div>
                      {meta && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{meta}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Segment hashes */}
          {trace.traceSegments && (
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Segment hashes</div>
              <div className="kv-list">
                {trace.traceSegments.map((seg) => (
                  <div key={seg.id} className="kv-row">
                    <span className="kv-key">{seg.label}</span>
                    <code className="kv-val mono">{compactHash(seg.hash, 14)}</code>
                  </div>
                ))}
                {trace.merkleRoot && (
                  <div className="kv-row">
                    <span className="kv-key">Merkle root</span>
                    <code className="kv-val mono amber">{compactHash(trace.merkleRoot, 14)}</code>
                  </div>
                )}
                <div className="kv-row">
                  <span className="kv-key">Canonical root</span>
                  <code className="kv-val mono amber">{compactHash(trace.proof.committedTraceRoot, 14)}</code>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="panel" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--subtle)" }}>Canonical trace JSON</span>
            </div>
            <pre className="code-block" style={{ border: "none", borderRadius: 0, maxHeight: 400 }}>
              {JSON.stringify(trace, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          {/* Proof panel */}
          {pkg && (
            <div className="proof-panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>Proof package</div>
              <div className="kv-list">
                <div className="kv-row"><span className="kv-key">Trace root</span><code className="kv-val mono">{compactHash(pkg.traceRoot, 12)}</code></div>
                <div className="kv-row"><span className="kv-key">Tx hash</span><code className="kv-val mono">{compactHash(pkg.proof.txHash, 12)}</code></div>
                <div className="kv-row"><span className="kv-key">Event</span><span className="kv-val">{pkg.proof.eventName}</span></div>
                <div className="kv-row"><span className="kv-key">Block</span><span className="kv-val">{pkg.proof.blockNumber ?? "—"}</span></div>
                <div className="kv-row"><span className="kv-key">Storage</span><code className="kv-val mono">{normalizeStorageURI(pkg.proof.storageURI)}</code></div>
                <div className="kv-row"><span className="kv-key">Verified</span><span className={`kv-val ${pkg.verification.status === "valid" ? "approved" : pkg.verification.status === "mismatch" ? "rejected" : ""}`}>{pkg.verification.status}</span></div>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Link href={`/proof/${encodeURIComponent(pkg.traceRoot)}`} className="btn btn-amber" style={{ fontSize: 12, height: 32, flex: 1 }}>View public receipt</Link>
                <Link href="/verify" className="btn" style={{ fontSize: 12, height: 32 }}>Verify →</Link>
              </div>
            </div>
          )}

          {/* Attestation */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Attestation</div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-key">Provider</span><span className="kv-val">{trace.attestation?.provider ?? "—"}</span></div>
              <div className="kv-row"><span className="kv-key">Mode</span><span className="kv-val">{trace.attestation?.mode ?? "—"}</span></div>
              <div className="kv-row"><span className="kv-key">Runner</span><span className="kv-val">{trace.attestation?.runnerVersion ?? "—"}</span></div>
              <div className="kv-row"><span className="kv-key">Policy hash</span><code className="kv-val mono">{compactHash(trace.attestation?.policyEngineHash, 10)}</code></div>
            </div>
          </div>

          {/* Linked records */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Linked records</div>
            <div style={{ display: "grid", gap: 8 }}>
              <Link href={`/mandates/${trace.mandateId}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", height: 32, fontSize: 12 }}>Mandate {trace.mandateId} →</Link>
              <Link href={`/agents/${trace.agentId}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", height: 32, fontSize: 12 }}>Agent {trace.agentId} →</Link>
              {violation && <Link href="/violations" className="btn btn-danger" style={{ justifyContent: "flex-start", height: 32, fontSize: 12 }}>Violation: {violation.violationId} →</Link>}
            </div>
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
