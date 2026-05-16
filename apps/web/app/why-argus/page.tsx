import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";

export const metadata = {
  title: "Why Argus | Mandate enforcement for AI agents with financial authority",
};

export default function WhyArgusPage() {
  return (
    <PublicShell>
      {/* Opening */}
      <section style={{ padding: "96px 0 80px", borderBottom: "1px solid var(--border)" }}>
        <div className="shell-narrow">
          <span className="eyebrow" style={{ marginBottom: 20 }}>Why Argus</span>
          <h1 className="text-h1" style={{ marginBottom: 24, maxWidth: 720 }}>
            Autonomous agents need accountability infrastructure, not softer prompts.
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.75, maxWidth: 640, marginBottom: 20 }}>
            AI agents are gaining authority over money, protocols, and DeFi positions. Once an agent can propose financial actions, its reasoning path becomes part of the risk surface. Prompt guardrails don&apos;t hold when the agent has real authority.
          </p>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 640 }}>
            Argus turns delegated AI actions into enforceable mandates, bonded accountability, replayable evidence, and verifiable proof — before any execution occurs.
          </p>
        </div>
      </section>

      {/* Failure modes */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <div style={{ maxWidth: 540, marginBottom: 48 }}>
            <span className="eyebrow">The failure modes</span>
            <h2 className="text-h1">Three ways existing solutions break at the worst moment.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {[
              {
                label: "Soft guardrails",
                problem: "Prompt rules live inside the same context that attackers can influence. A malicious memory, injected instruction, or compromised tool result can override the agent's operating constraints.",
                consequence: "The guardrail is inside the attack surface.",
              },
              {
                label: "Wallet permissions",
                problem: "A spending limit can reject a transaction amount. It cannot explain why the agent attempted the action, which policy clause was violated, what the decision path was, or whether the log was rewritten afterward.",
                consequence: "Permission is not accountability.",
              },
              {
                label: "Centralized logs",
                problem: "A backend server can rewrite history. Dashboard compliance scores can be adjusted. Evidence bundles can be omitted. The operator sees what the infrastructure decides to show.",
                consequence: "Observation is not verification.",
              },
            ].map(({ label, problem, consequence }) => (
              <div key={label} style={{ padding: "28px 24px", background: "var(--surface-1)" }}>
                <h3 className="text-h3" style={{ marginBottom: 14 }}>{label}</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>{problem}</p>
                <p style={{ fontSize: 13, color: "var(--rejected)", fontWeight: 600 }}>{consequence}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The mandate */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="shell-narrow">
          <span className="eyebrow">The mandate</span>
          <h2 className="text-h1" style={{ marginBottom: 24 }}>A mandate is not a suggestion. It is the agent&apos;s operating constitution.</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 20 }}>
            A mandate defines the exact boundaries of the agent&apos;s delegated authority: the maximum transaction size, the allowed DeFi targets, the blocked recipients, the permitted action types, and the forbidden calls. These are not prompt instructions the agent can be talked out of. They are the enforcement conditions for ActionGate.
          </p>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75 }}>
            Every mandate is machine-readable and deterministic. When ActionGate evaluates a proposal, it checks each clause independently and produces a violation bitmap. There is no ambiguity, no interpretation, and no soft override. The mandate either permits the action or it does not.
          </p>
          <div style={{ margin: "40px 0", padding: "28px 32px", background: "var(--amber-dim)", border: "1px solid rgba(212,168,71,0.22)", borderLeft: "3px solid var(--amber)", borderRadius: "var(--r-md)" }}>
            <p style={{ fontSize: 18, fontStyle: "italic", color: "var(--text)", lineHeight: 1.7 }}>
              &ldquo;The agent does not get to choose which rules to follow. The mandate is enforced before execution, not reviewed after.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Bond + Gate */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 48, alignItems: "start" }}>
            <div>
              <span className="eyebrow">The bond</span>
              <h2 className="text-h2" style={{ marginBottom: 16 }}>Economic stake is the first honest signal.</h2>
              <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75, marginBottom: 16 }}>
                Before an agent can propose any action, it posts a bond. This is not a metaphor for accountability — it is a literal economic stake that is slashed when the agent violates its mandate.
              </p>
              <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75 }}>
                The bond creates alignment that prompt instructions cannot. An agent operating with bond at risk has something to lose. When ActionGate rejects a violation, the agent pays the cost immediately and on-chain.
              </p>
            </div>
            <div>
              <span className="eyebrow">The gate</span>
              <h2 className="text-h2" style={{ marginBottom: 16 }}>ActionGate enforces before execution, not after.</h2>
              <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75, marginBottom: 16 }}>
                Every proposed action travels through ActionGate before it can become execution. ActionGate checks six mandate conditions independently: transaction size, allowed targets, blocked recipients, permitted action types, forbidden action types, and asset match.
              </p>
              <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75 }}>
                A violation on any condition produces a reason bitmap, triggers a rejection event, commits the trace root, and initiates the slash. The agent cannot route around ActionGate by proposing the action differently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The trace */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="shell-narrow">
          <span className="eyebrow">The trace</span>
          <h2 className="text-h1" style={{ marginBottom: 24 }}>Forensic replay, not vague audit logs.</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 24 }}>
            Argus treats every agent action like a black-box flight recorder: the complete decision path is preserved, hashed, and committed. Observation, memory state (including prompt injection flags), inference summary, proposed action, policy check results with individual clause verdicts, execution or rejection outcome, and any penalty applied.
          </p>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75 }}>
            The trace is divided into six named segments — each with its own hash. A canonical hash over the full trace payload is committed as the trace root. The root is the fingerprint: if any field in the trace changes after commitment, the hashes diverge. The discrepancy is proof of tampering.
          </p>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {["Observation", "Memory + injection flags", "Inference summary", "Proposed action", "Policy verdict", "Penalty state"].map((seg, i) => (
              <div key={seg} style={{ padding: "16px 20px", background: "var(--surface-1)" }}>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "var(--subtle)", marginBottom: 4, letterSpacing: "0.06em" }}>
                  SEG {String(i + 1).padStart(2, "0")}
                </div>
                <span style={{ fontSize: 14, fontWeight: 550 }}>{seg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The slash */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
        <div className="shell-narrow">
          <span className="eyebrow">The slash</span>
          <h2 className="text-h1" style={{ marginBottom: 24 }}>Rejection is not failure. It is the product working.</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 24 }}>
            When ActionGate blocks a malicious action, it does not produce an error state. It produces evidence. The violation is sealed with a slash receipt — the bond amount removed, the compliance score adjusted, and the violation lifecycle moved to evidence_sealed.
          </p>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75 }}>
            The violation is not hidden. It is a durable, replayable record that links the rejected action to its mandate, its agent&apos;s identity, the decision path, the enforcement event, and the on-chain consequence. Anyone with the trace root can verify the full chain of custody.
          </p>
        </div>
      </section>

      {/* Why 0G — substantial section */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)", background: "var(--bg-raised)" }}>
        <div className="shell">
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <span className="eyebrow">Why 0G</span>
            <h2 className="text-h1" style={{ marginBottom: 20 }}>If Argus ran on a normal backend, the most important proof surfaces could be rewritten.</h2>
            <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75 }}>
              Agent accountability is only as strong as the infrastructure that enforces it. A centralized backend with soft proofs is a system that can lie. Argus is designed around 0G infrastructure because each accountability primitive needs a layer that is not controlled by the operator.
            </p>
          </div>

          {/* What breaks comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 24, marginBottom: 48 }}>
            <div className="panel" style={{ padding: 24 }}>
              <h3 className="text-h3" style={{ marginBottom: 20, color: "var(--rejected)" }}>Without 0G: what breaks</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  "Logs can be rewritten after the fact.",
                  "Dashboards can display fabricated compliance scores.",
                  "Agent reputation has no portable, verifiable form.",
                  "Mandate enforcement has no public settlement layer.",
                  "Trace roots have no independent anchor.",
                  "Storage-backed evidence lacks cryptographic continuity.",
                  "Sealed policy execution cannot be independently verified.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--rejected)", flexShrink: 0, fontSize: 14, marginTop: 1 }}>✕</span>
                    <span style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" style={{ padding: 24 }}>
              <h3 className="text-h3" style={{ marginBottom: 20, color: "var(--approved)" }}>With 0G: what holds</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["0G Chain", "Mandates, verdicts, slash events, and trace roots are publicly settled."],
                  ["0G Storage", "Full traces and evidence bundles are replayable without trusting the operator."],
                  ["Agent iNFT", "Bond status, compliance history, and reputation are portable across applications."],
                  ["0G Compute / TEE", "Future sealed policy checks can be verified without exposing strategy."],
                ].map(([tag, body]) => (
                  <div key={tag as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span className="badge badge-chain" style={{ flexShrink: 0, marginTop: 1 }}>{tag as string}</span>
                    <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>{body as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 0G roles detailed */}
          <div style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
            {[
              {
                role: "0G Chain",
                subtitle: "The mandate court",
                status: "Live",
                statusClass: "badge-approved",
                body: "ActionGate verdicts, bond slash events, compliance score changes, and trace-root commitments are settled on 0G Mainnet (chain ID 16661). The mandate court is externally verifiable at chainscan.0g.ai.",
              },
              {
                role: "0G Storage",
                subtitle: "The black-box recorder",
                status: "Live",
                statusClass: "badge-approved",
                body: "Full agent traces are stored on 0G Storage. The storage root committed on-chain verifies the full trace payload stored off-chain. Trace upload receipts are verifiable at storagescan.0g.ai.",
              },
              {
                role: "0G Compute / TEE",
                subtitle: "Sealed policy execution",
                status: "Roadmap",
                statusClass: "",
                body: "Some mandates will contain sensitive treasury strategy that should not be publicly readable. 0G Compute with TEE support enables sealed policy checks — the mandate is enforced without being exposed. The verdict is verifiable; the strategy remains private. This is a planned capability, not yet implemented. Argus's attestation schema already includes a provider field for 0G Compute / TEE.",
              },
              {
                role: "Agent ID / iNFT",
                subtitle: "Portable agent passport",
                status: "Roadmap",
                statusClass: "",
                body: "An agent that builds compliance history under one mandate should be able to carry that reputation to another. Agent ID-style identity makes the bond status, compliance score, and trace history portable — the passport travels with the agent across mandates and applications. This enables a marketplace of accountable agents rather than isolated deployments.",
              },
            ].map(({ role, subtitle, status, statusClass, body }) => (
              <div key={role} style={{ padding: "24px 28px", background: "var(--surface-1)", display: "grid", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: 16, fontWeight: 650 }}>{role}</span>
                  <span style={{ fontSize: 13, color: "var(--subtle)" }}>{subtitle}</span>
                  <span className={`badge ${statusClass}`} style={{ marginLeft: "auto" }}>{status}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's next */}
      <section style={{ padding: "80px 0" }}>
        <div className="shell-narrow">
          <span className="eyebrow">What&apos;s next</span>
          <h2 className="text-h1" style={{ marginBottom: 24 }}>The same model extends to production accountability infrastructure.</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, marginBottom: 24 }}>
            Argus is deployed on 0G Mainnet. Contracts are live, trace roots are committed on-chain, and traces are stored on 0G Storage. Next milestones: sealed policy execution via 0G Compute for strategy privacy, and portable Agent ID / iNFT for cross-mandate compliance history.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <Link href="/roadmap" className="btn btn-amber">View the roadmap</Link>
            <Link href="/demo" className="btn">Run the demo</Link>
            <Link href="/developers" className="btn btn-ghost">Developer docs</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
