import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData } from "@/lib/demo";

export const metadata = { title: "Roadmap" };

const statusStyles: Record<string, { cls: string; dot: string }> = {
  live: { cls: "badge-approved", dot: "approved" },
  "in-progress": { cls: "badge-amber", dot: "amber" },
  planned: { cls: "", dot: "" },
  roadmap: { cls: "", dot: "" },
};

export default function RoadmapPage() {
  const data = getDemoData();

  const roadmapItems = (data as { mainnetReadiness?: Array<{ id: string; label: string; detail: string; status: string }> }).mainnetReadiness ?? [
    { id: "r1", label: "Solidity contracts", detail: "ActionGate, MandateRegistry, AgentRegistry, AgentBonding, TraceCommitment — deployed locally, Foundry tests passing.", status: "live" },
    { id: "r2", label: "Trace schema + hashing", detail: "ArgusTrace v1 schema, canonical hashing, browser-safe verification helpers, and tamper diff logic are stable.", status: "live" },
    { id: "r3", label: "Agent runner + demo data", detail: "Deterministic local demo generates 3 agents, 2 mandates, 4 traces, 1 violation, 4 proof packages, and a full event stream.", status: "live" },
    { id: "r4", label: "Proof package format", detail: "ProofPackage with segment hashes, attestation metadata, verification results, and chain-of-custody data is finalized.", status: "live" },
    { id: "r5", label: "0G Storage adapter", detail: "Trace uploads are live on 0G Storage. Compliant and violation traces are verifiable at storagescan.0g.ai.", status: "live" },
    { id: "r6", label: "0G Chain deployment", detail: "Contracts are deployed on 0G Mainnet (chain ID 16661). All core contracts live at chainscan.0g.ai.", status: "live" },
    { id: "r7", label: "Public proof explorer", detail: "Proof receipt pages exist for all committed traces. Roots verifiable on 0G ChainScan.", status: "live" },
    { id: "r8", label: "Real 0G Storage uploads", detail: "Full trace payloads are uploaded to 0G Storage. Two traces live with storagescan.0g.ai receipts.", status: "live" },
    { id: "r9", label: "0G Compute / TEE policy", detail: "Sealed mandate checks via TEE. Attestation schema includes provider field for 0G Compute. Implementation is roadmap.", status: "planned" },
    { id: "r10", label: "Agent ID / iNFT integration", detail: "Portable agent identity with compliance history across mandates. Requires 0G Agent ID protocol integration.", status: "planned" },
    { id: "r11", label: "External agent SDK", detail: "Packaged SDK for external agent developers to wrap their own agents with Argus mandate enforcement.", status: "planned" },
    { id: "r12", label: "Production dispute model", detail: "Challenge windows, dispute resolution, and escalation paths for contested slashing events.", status: "planned" },
  ];

  const grouped = {
    live: roadmapItems.filter((i) => i.status === "live"),
    "in-progress": roadmapItems.filter((i) => i.status === "in-progress"),
    planned: roadmapItems.filter((i) => i.status === "planned" || i.status === "roadmap"),
  };

  return (
    <ConsoleShell title="Mainnet readiness roadmap" eyebrow="What is real, ready, and next">
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 640, lineHeight: 1.65 }}>
          Argus is deployed on 0G Mainnet. Contracts are live, trace roots are committed on-chain, and traces are stored on 0G Storage.
        </p>
      </div>

      {/* Status key */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
        <span className="badge badge-approved">Live</span>
        <span className="badge badge-amber">In progress</span>
        <span className="badge">Planned</span>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        {(Object.entries(grouped) as [string, typeof roadmapItems][]).map(([status, items]) => {
          if (items.length === 0) return null;
          const label =
            status === "live" ? "Live" :
            status === "in-progress" ? "In progress" :
            "Planned";
          const sty = statusStyles[status] ?? { cls: "", dot: "" };
          return (
            <div key={status}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span className={`badge ${sty.cls}`}>{label}</span>
                <span style={{ fontSize: 12, color: "var(--subtle)" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "minmax(220px, 0.35fr) minmax(0,1fr)", gap: 16, padding: "16px 20px", background: "var(--surface-1)", alignItems: "baseline" }}>
                    <div>
                      <span className={`timeline-dot ${sty.dot}`} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 8 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ConsoleShell>
  );
}
