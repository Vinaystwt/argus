import Link from "next/link";
import { ConsoleShell } from "@/components/ConsoleShell";

const integrationSteps = [
  { n: "01", label: "Create mandate", detail: "DAO deploys mandate contract defining asset, max amount, allowed targets, and forbidden action types." },
  { n: "02", label: "Register agent", detail: "Agent owner registers via AgentRegistry. Assigned agentId is the NFT token ID — agent passport on-chain." },
  { n: "03", label: "Post bond", detail: "Owner posts ETH bond via AgentBonding. Compliance score initialises at 800. Bond is the collateral for slashing." },
  { n: "04", label: "Build structured trace", detail: "Agent runtime produces an ArgusTrace: observation → memory → inference → proposedAction. All fields deterministic." },
  { n: "05", label: "Store trace, commit root", detail: "Canonicalise trace, compute root with keccak256, upload to 0G Storage, then call submitAction() with the storage URI and trace root." },
  { n: "06", label: "ActionGate evaluates", detail: "On-chain: 6 mandate clauses checked against proposal. Bitmap encodes which clauses fail. Zero bitmap = APPROVED." },
  { n: "07", label: "Approved or rejected", detail: "Approved: score +5, trace committed. Rejected: bond slashed, score −200, evidence sealed, violation record created." },
  { n: "08", label: "Verify proof package", detail: "Off-chain or in browser: verifyTrace() recomputes root from stored trace, diffs against committedTraceRoot. Mismatch = tampered." },
];

const primitives = [
  { role: "0G Chain", status: "live", detail: "Mandate court deployed on 0G Mainnet (chain ID 16661). ActionGate verdicts, slash events, and trace roots are publicly settled on-chain. Explorer: chainscan.0g.ai" },
  { role: "0G Storage", status: "live", detail: "Black-box recorder. Compliant and violation traces uploaded to 0G Storage. Upload receipts verifiable at storagescan.0g.ai." },
  { role: "0G Compute / TEE", status: "roadmap", detail: "Sealed policy engine. Verifiable execution environment. Attestation currently simulated by agent runner." },
  { role: "Agent iNFT", status: "roadmap", detail: "Agent passport on 0G chain. Portable compliance record. Currently ERC-721 AgentRegistry on local chain." },
];

export default function DeveloperPortalPage() {
  return (
    <ConsoleShell eyebrow="Developers" title="Developer portal">
      {/* Headline */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, maxWidth: 640 }}>
          Argus is accountability infrastructure. You bring the agent. Argus wraps it with a mandate,
          routes its proposals through ActionGate, seals the evidence, and makes every decision
          replayable and tamper-evident.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid-3" style={{ marginBottom: 48 }}>
        {[
          { href: "/developers/docs", label: "Quickstart", sub: "Integrate in 5 minutes", badge: "docs" },
          { href: "/developers/trace-schema", label: "Trace schema", sub: "ArgusTrace + ProofPackage fields", badge: "schema" },
          { href: "/developers/contracts", label: "Contract ABIs", sub: "Methods, events, addresses", badge: "contracts" },
        ].map(({ href, label, sub, badge }) => (
          <Link
            key={href}
            href={href}
            className="panel"
            style={{ display: "block", padding: "20px 20px", textDecoration: "none", transition: "border-color 0.15s" }}
          >
            <span className="badge badge-local" style={{ marginBottom: 12, display: "inline-block" }}>{badge}</span>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{sub}</div>
          </Link>
        ))}
      </div>

      {/* Integration lifecycle */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">Integration lifecycle</span>
        <h2 className="text-h2" style={{ marginBottom: 24 }}>8-step action path</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {integrationSteps.map(({ n, label, detail }) => (
            <div key={n} style={{ padding: "20px 20px", background: "var(--surface-1)" }}>
              <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", fontWeight: 650, letterSpacing: "0.1em", marginBottom: 8 }}>{n}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 0G primitives */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">0G integration model</span>
        <h2 className="text-h2" style={{ marginBottom: 8 }}>Each accountability primitive maps to a 0G role</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
          0G Chain and 0G Storage are live on mainnet. 0G Compute and Agent iNFT are roadmap.
        </p>
        <div className="kv-list">
          {primitives.map(({ role, status, detail }) => (
            <div key={role} className="kv-row" style={{ padding: "14px 16px", gap: 0, flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{role}</span>
                <span className={`badge ${status === "live" ? "badge-approved" : "badge-amber"}`}>
                  {status === "live" ? "live" : "roadmap"}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div>
        <span className="eyebrow">Packages</span>
        <h2 className="text-h2" style={{ marginBottom: 8 }}>SDK, MCP, and shared libraries</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
          <code>@useargus/sdk</code> and <code>@useargus/mcp</code> are built and ready. npm publication is in progress.
          Clone the repo and build from source to use them today.
        </p>
        <div className="grid-2">
          <div className="panel" style={{ padding: 20 }}>
            <div className="code-block" style={{ fontSize: 12, marginBottom: 12 }}>
              <span className="str">@argus/shared</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Local TypeScript helper: schemas, canonical hashing, trace root computation, proof package builder,
              browser-safe verification, tamper diff. Zero runtime dependencies.
            </p>
          </div>
          <div className="panel" style={{ padding: 20 }}>
            <div className="code-block" style={{ fontSize: 12, marginBottom: 12 }}>
              <span className="str">@argus/storage-0g</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Local TypeScript helper: storage adapter with LocalStorageFallbackAdapter and adapter interface for 0G Storage.
              Returns <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11 }}>StorageReceipt</span> with URI, root, size, provider label.
            </p>
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
