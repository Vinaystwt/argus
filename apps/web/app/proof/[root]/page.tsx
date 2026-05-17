import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoData, getProofPackage, compactHash, normalizeStorageURI } from "@/lib/demo";

export const metadata = { title: "Proof Receipt" };

export function generateStaticParams() {
  const data = getDemoData();
  const roots = new Set<string>();
  (data.proofPackages ?? []).forEach((pkg) => roots.add(encodeURIComponent(pkg.traceRoot)));
  data.traces.forEach((t) => roots.add(encodeURIComponent(t.proof.committedTraceRoot)));
  return Array.from(roots).map((root) => ({ root }));
}

export default async function ProofPage({ params }: { params: Promise<{ root: string }> }) {
  const { root } = await params;
  const pkg = getProofPackage(decodeURIComponent(root));
  if (!pkg) notFound();

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", padding: "32px 24px" }}>
      {/* Minimal header */}
      <div style={{ maxWidth: 900, margin: "0 auto 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 750, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text)" }}>Argus</span>
          </Link>
          <span style={{ color: "var(--border-high)" }}>·</span>
          <span style={{ fontSize: 12, color: "var(--subtle)" }}>Public proof receipt</span>
        </div>

        <span className="badge badge-amber" style={{ marginBottom: 16 }}>Proof Package</span>
        <h1 className="text-h1" style={{ marginBottom: 12 }}>
          Anyone with this root can verify the verdict, evidence, and integrity of this agent action.
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640 }}>
          This page is designed for operators, auditors, and developers who need to verify a specific agent action without trusting a private dashboard.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 16, alignItems: "start" }}>
        {/* Main proof data */}
        <div style={{ display: "grid", gap: 12 }}>
          <div className="proof-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 14 }}>Chain of custody</div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-key">Package ID</span><code className="kv-val mono" style={{ fontSize: 11 }}>{pkg.packageId}</code></div>
              <div className="kv-row"><span className="kv-key">Trace root</span><code className="kv-val mono amber" style={{ fontSize: 11 }}>{pkg.traceRoot}</code></div>
              <div className="kv-row"><span className="kv-key">Tx hash</span>
                {pkg.proof.explorerUrl ? (
                  <a href={pkg.proof.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", textDecoration: "none" }}>{pkg.proof.txHash}</a>
                ) : (
                  <code className="kv-val mono" style={{ fontSize: 11 }}>{pkg.proof.txHash}</code>
                )}
              </div>
              <div className="kv-row"><span className="kv-key">Event</span><span className="kv-val">{pkg.proof.eventName}</span></div>
              <div className="kv-row"><span className="kv-key">Block</span><span className="kv-val">{pkg.proof.blockNumber ?? "—"}</span></div>
              <div className="kv-row"><span className="kv-key">Contract</span><code className="kv-val mono" style={{ fontSize: 11 }}>{pkg.proof.contractAddress}</code></div>
              <div className="kv-row"><span className="kv-key">Storage</span><code className="kv-val mono" style={{ fontSize: 11 }}>{normalizeStorageURI(pkg.proof.storageURI)}</code></div>
              <div className="kv-row"><span className="kv-key">Verified</span><span className={`kv-val ${pkg.verification.status === "valid" ? "approved" : pkg.verification.status === "mismatch" ? "rejected" : ""}`}>{pkg.verification.status}</span></div>
              <div className="kv-row"><span className="kv-key">Generated</span><span className="kv-val">{new Date(pkg.generatedAt).toISOString()}</span></div>
            </div>
          </div>

          {/* Segment hashes */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Segment hashes</div>
            <div className="kv-list">
              {pkg.segmentHashes.map((seg) => (
                <div key={seg.id} className="kv-row">
                  <span className="kv-key">{seg.label}</span>
                  <code className="kv-val mono" style={{ fontSize: 11 }}>{compactHash(seg.hash, 14)}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "grid", gap: 12 }}>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Provider status</div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-key">Chain</span><span className="kv-val">{pkg.proof.provider.chainProvider}</span></div>
              <div className="kv-row"><span className="kv-key">Storage</span><span className="kv-val">{pkg.proof.provider.storageProvider}</span></div>
              <div className="kv-row"><span className="kv-key">Mode</span><span className="kv-val amber">{pkg.proof.provider.label}</span></div>
            </div>
          </div>

          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 10 }}>Attestation</div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-key">Provider</span><span className="kv-val">{pkg.attestation.provider}</span></div>
              <div className="kv-row"><span className="kv-key">Mode</span><span className="kv-val">{pkg.attestation.mode}</span></div>
              <div className="kv-row"><span className="kv-key">Runner</span><span className="kv-val">{pkg.attestation.runnerVersion}</span></div>
            </div>
            <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 10, lineHeight: 1.5 }}>{pkg.attestation.note}</p>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <Link href={`/traces/${encodeURIComponent(pkg.traceRoot)}`} className="btn btn-amber" style={{ width: "100%" }}>Replay full trace →</Link>
            <Link href="/verify" className="btn" style={{ width: "100%" }}>Verify root hash →</Link>
            <Link href="/dashboard" className="btn btn-ghost" style={{ width: "100%" }}>Open console →</Link>
          </div>
        </div>
      </div>

      {/* JSON export */}
      <div style={{ maxWidth: 900, margin: "24px auto 0" }}>
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--subtle)" }}>Proof package JSON</span>
          </div>
          <pre className="code-block" style={{ border: "none", borderRadius: 0, maxHeight: 400 }}>
            {JSON.stringify(pkg, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
