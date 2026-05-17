import Link from "next/link";
import type { DemoReceipt } from "@argus/shared";
import { compactHash, formatEth, normalizeStorageURI } from "@/lib/demo";

export function LiveProofSample({ data }: { data: DemoReceipt }) {
  const violation = data.traces.find((t) => t.policyCheck.verdict === "REJECTED") ?? data.traces[0]!;
  const pkg = data.proofPackages?.find((p) => p.traceRoot === violation.proof.committedTraceRoot);

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderTop: "2px solid var(--amber)",
      borderRadius: "var(--r-md)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "20px 24px", background: "var(--surface-1)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Live proof sample</div>
          <h3 className="text-h3" style={{ marginBottom: 4 }}>This rejection is the product working.</h3>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            A prompt-injected instruction tried to route 2000 USDC to a blocked recipient. ActionGate stopped it before execution.
          </p>
        </div>
        <Link href={`/traces/${violation.proof.committedTraceRoot}`} className="btn btn-danger" style={{ flexShrink: 0 }}>
          Replay violation trace →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, background: "var(--border)" }}>
        {[
          { k: "Verdict", v: violation.policyCheck.verdict, cls: "rejected" },
          { k: "Slashed", v: violation.penalty.slashed ? formatEth(violation.penalty.amount ?? "0") : "—", cls: "rejected" },
          { k: "Trace root", v: compactHash(violation.proof.committedTraceRoot, 12), cls: "mono" },
          { k: "Storage", v: normalizeStorageURI(violation.proof.storageURI).replace("local://", ""), cls: "mono" },
          { k: "Clauses violated", v: violation.policyCheck.violationCodes.length.toString(), cls: "" },
          { k: "Provider", v: data.providerStatus?.label ?? "0G Mainnet", cls: "" },
        ].map(({ k, v, cls }) => (
          <div key={k} style={{ padding: "12px 20px", background: "var(--surface-1)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 4 }}>{k}</div>
            <div className={`kv-val ${cls}`} style={{ fontSize: 13, fontWeight: cls === "rejected" ? 650 : 400 }}>{v}</div>
          </div>
        ))}
      </div>
      {pkg && (
        <div style={{ padding: "12px 24px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="badge badge-amber">Proof package</span>
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono), monospace" }}>{pkg.packageId}</span>
          <Link href={`/proof/${encodeURIComponent(pkg.traceRoot)}`} style={{ fontSize: 12, color: "var(--chain)", marginLeft: "auto" }}>
            View public receipt →
          </Link>
        </div>
      )}
    </div>
  );
}
