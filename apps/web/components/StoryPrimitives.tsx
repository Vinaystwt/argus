import Link from "next/link";

export function ProofPipeline({ variant = "mixed" }: { variant?: "mixed" | "approved" | "rejected" }) {
  const rejected = variant !== "approved";
  const nodes = [
    ["Agent proposal", rejected ? "Transfer 2000 USDC to blocked recipient" : "Swap 100 USDC through approved target", "incoming"],
    ["ActionGate", "Checks mandate clauses before execution", "checking"],
    ["Verdict", rejected ? "Rejected on-chain" : "Approved on-chain", rejected ? "rejected" : "approved"],
    ["Trace root", "Replayable trace is stored and rooted", "sealed"],
    ["Verify", rejected ? "Tamper mismatch exposes rewritten evidence" : "Root match confirms integrity", "verified"]
  ];
  return (
    <section className="proof-pipeline" aria-label="Argus proof pipeline">
      <div className="pipeline-header">
        <div>
          <span className="eyebrow">Mandate to proof</span>
          <h2>Every agent action becomes a verdict and a replayable record.</h2>
        </div>
        <span className="status-chip" data-status={rejected ? "critical" : "success"}>
          {rejected ? "Violation blocked" : "Mandate satisfied"}
        </span>
      </div>
      <div className="pipeline-flow">
        {nodes.map(([label, body, state], index) => (
          <div className="pipeline-node" data-state={state} key={label}>
            <span>{String(index + 1).padStart(2, "0")} · {label}</span>
            <strong>{body}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StorySteps() {
  const steps = [
    ["Mandate", "The DAO defines allowed autonomy: caps, targets, recipients, action types."],
    ["Bond", "The agent accepts delegated authority by placing capital and reputation at risk."],
    ["Gate", "Every action proposal must pass ActionGate before execution."],
    ["Trace", "Observation, reasoning summary, proposal, verdict, and penalty become a replayable record."],
    ["Slash", "Violations are rejected and tied to on-chain bond and compliance changes."],
    ["Verify", "The trace root exposes tampering and anchors the black-box record."]
  ];
  return (
    <div className="proof-flow">
      {steps.map(([label, body]) => (
        <div className="proof-step" key={label}>
          <span>{label}</span>
          <strong>{body}</strong>
        </div>
      ))}
    </div>
  );
}

export function ZeroGPrimitiveMap() {
  const items = [
    ["Mandate Court", "0G Chain", "Mandates, verdicts, slashing, compliance changes, and trace-root commitments become externally verifiable."],
    ["Black-Box Trace", "0G Storage", "Full traces, evidence bundles, proof packages, and future memory snapshots live off-chain without bloating chain state."],
    ["Sealed Policy Check", "0G Compute / TEE", "Future private mandate checks can protect sensitive strategy while producing verifiable verdicts."],
    ["Agent Passport", "Agent ID / iNFT", "Persistent identity can carry bond status, compliance history, and reputation across applications."],
    ["Proof Surface", "Explorer + roots", "Operators and developers can inspect tx hashes, storage URIs, trace roots, and verification status."]
  ];
  return (
    <div className="primitive-map">
      {items.map(([title, primitive, body]) => (
        <div className="primitive-card" key={title}>
          <span>{title}</span>
          <strong>{primitive}</strong>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

export function HomepageNav() {
  return (
    <nav className="site-nav shell">
      <Link className="brand" href="/">Argus</Link>
      <div className="site-links">
        <Link href="/#product">Product</Link>
        <Link href="/why-argus">Why Argus</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/developers">Developers</Link>
      </div>
    </nav>
  );
}
