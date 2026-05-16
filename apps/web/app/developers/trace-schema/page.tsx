import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData } from "@/lib/demo";

const traceFields = [
  { field: "schemaVersion", type: '"argus.trace.v1"', desc: "Literal version tag. Used for schema migration detection." },
  { field: "traceId", type: "string (UUID)", desc: "Globally unique trace identifier. Used as storage path hint." },
  { field: "createdAt", type: "string (ISO 8601)", desc: "Timestamp of trace creation in agent runner." },
  { field: "chainId", type: "number", desc: "EVM chain ID for the mandate court contract. 16661 = 0G Mainnet. 31337 = local Anvil for development." },
  { field: "mandateId", type: "string", desc: "Mandate identifier governing this action proposal." },
  { field: "agentId", type: "string", desc: "Agent identifier matching AgentRegistry token ID." },
  { field: "observation", type: "{ source, content }", desc: "What triggered this action. Source = feed/sensor/schedule/manual." },
  { field: "memory.promptInjectionDetected", type: "boolean", desc: "True if agent detected adversarial content in context. High-risk signal." },
  { field: "memory.relevantMemory", type: "string[]", desc: "Relevant memory fragments that influenced the inference." },
  { field: "inference.summary", type: "string", desc: "Human-readable rationale for the proposed action." },
  { field: "inference.riskSignals", type: "string[]", desc: "Detected risk factors prior to proposal. Empty = clean inference." },
  { field: "proposedAction", type: "ActionProposal", desc: "Full action proposal: actionType, target, recipient, asset, amount, actionId." },
  { field: "policyCheck.verdict", type: '"approved" | "rejected"', desc: "Policy engine verdict before on-chain gate." },
  { field: "policyCheck.violationCodes", type: "string[]", desc: "Violation codes from policy check (VIOLATION_AMOUNT etc)." },
  { field: "policyCheck.checks", type: "PolicyCheck[]", desc: "Per-clause check results with clause name and pass/fail status." },
  { field: "execution.status", type: '"approved" | "rejected"', desc: "Final execution outcome. Matches on-chain verdict." },
  { field: "execution.txHash", type: "0x${string}?", desc: "Transaction hash of ActionGate.submitAction() call." },
  { field: "execution.reason", type: "string?", desc: "Human-readable rejection reason when status = rejected." },
  { field: "penalty.slashed", type: "boolean", desc: "True if bond was slashed for this trace." },
  { field: "penalty.amount", type: "string?", desc: "Slash amount in wei (as string to preserve precision)." },
  { field: "penalty.complianceScoreBefore", type: "number", desc: "Compliance score before this action. Approved: +5. Rejected: −200." },
  { field: "penalty.complianceScoreAfter", type: "number", desc: "Compliance score after this action." },
  { field: "attestation", type: "Attestation?", desc: "Runtime attestation metadata. Currently simulated by agent runner." },
  { field: "traceSegments", type: "TraceSegment[]?", desc: "6 named hash segments (see below). Null until trace is sealed." },
  { field: "merkleRoot", type: "0x${string}?", desc: "Merkle root of segment hashes. Not yet implemented." },
  { field: "proof.canonicalHash", type: "0x${string}", desc: "keccak256(canonicalize(tracePayloadForHash(trace))). The committed root." },
  { field: "proof.storageURI", type: "string", desc: "Storage URI where full trace JSON was uploaded. local://traces/<name>.json or 0g://<cid>." },
  { field: "proof.committedTraceRoot", type: "0x${string}", desc: "Root value committed on-chain via TraceCommitment.commitTrace(). Must match canonicalHash." },
];

const segmentFields = [
  { segment: "observation", n: "1", desc: "Encodes observation.source + observation.content" },
  { segment: "memory", n: "2", desc: "Encodes memory.promptInjectionDetected + memory.relevantMemory" },
  { segment: "inference", n: "3", desc: "Encodes inference.summary + inference.riskSignals" },
  { segment: "proposal", n: "4", desc: "Encodes proposedAction (all fields)" },
  { segment: "policy", n: "5", desc: "Encodes policyCheck.verdict + policyCheck.violationCodes" },
  { segment: "execution", n: "6", desc: "Encodes execution.status + penalty.slashed + penalty.amount" },
];

const proofPackageFields = [
  { field: "packageId", type: "string", desc: "Unique proof package ID." },
  { field: "traceRoot", type: "0x${string}", desc: "Canonical trace root — primary identifier for this evidence record." },
  { field: "traceId", type: "string", desc: "Back-reference to the source ArgusTrace." },
  { field: "agentId / mandateId", type: "string", desc: "Denormalized for direct lookup." },
  { field: "violationId", type: "string?", desc: "Linked violation record ID if this is a rejected trace." },
  { field: "proof", type: "ProofPanelData", desc: "On-chain anchoring data: contractAddress, txHash, blockNumber, traceRoot, storageURI, provider status." },
  { field: "attestation", type: "Attestation", desc: "Runtime attestation: provider, mode, runnerVersion, executionEnvironmentHash, policyEngineHash." },
  { field: "segmentHashes", type: "TraceSegment[]", desc: "6 named segments, each with id, label, summary, hash." },
  { field: "verification", type: "VerificationResult", desc: "Result of verifyTrace(): status (valid | mismatch | invalid-json), computedRoot, committedRoot, diff, checkedAt." },
];

const hashBoundary = `// tracePayloadForHash strips proof metadata before hashing.
// This means storageURI, explorerUrl, and provider labels can
// change without invalidating the committed evidence record.

export function tracePayloadForHash(trace: ArgusTrace) {
  const { proof: _proof, attestation: _att, ...core } = trace;
  return core; // everything that matters to the decision
}

// The root is deterministic:
// keccak256(canonicalize(tracePayloadForHash(trace)))
// Same agent + same inputs = same root. Forever.`;

export default function TraceSchemaPage() {
  const data = getDemoData();
  const sampleTrace = data.traces[0];

  return (
    <ConsoleShell eyebrow="Developers" title="Trace schema reference">
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, maxWidth: 680 }}>
          Every Argus trace is a structured, deterministic record of one agent decision.
          The canonical hash covers all decision fields — what the agent saw, remembered, inferred, proposed, and was told.
          Proof metadata (storage URIs, explorer links) is excluded from the hash boundary so it can change
          without invalidating the committed evidence.
        </p>
      </div>

      {/* ArgusTrace fields */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">ArgusTrace</span>
        <h2 className="text-h2" style={{ marginBottom: 4 }}>Top-level fields</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Schema version: <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12 }}>argus.trace.v1</code></p>
        <div className="kv-list">
          {traceFields.map(({ field, type, desc }) => (
            <div key={field} className="kv-row" style={{ padding: "12px 16px", alignItems: "flex-start" }}>
              <div style={{ minWidth: 260, flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{field}</div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", marginTop: 2 }}>{type}</div>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trace segments */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">TraceSegment</span>
        <h2 className="text-h2" style={{ marginBottom: 4 }}>6 named hash segments</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
          Each segment is independently hashable. Segment hashes allow targeted verification:
          auditors can verify the inference segment without accessing observation memory.
        </p>
        <div className="kv-list">
          {segmentFields.map(({ segment, n, desc }) => (
            <div key={segment} className="kv-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200, flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "var(--amber)", fontWeight: 700 }}>{n.padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{segment}</span>
              </div>
              <span className="kv-val" style={{ fontSize: 12 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hash boundary */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">Hashing</span>
        <h2 className="text-h2" style={{ marginBottom: 8 }}>Hash boundary</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>tracePayloadForHash()</code> strips mutable proof metadata before
          computing the canonical root. This is the deliberate hash boundary: the root
          commits to the decision record, not the storage infrastructure.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{hashBoundary}</pre>
      </div>

      {/* ProofPackage */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">ProofPackage</span>
        <h2 className="text-h2" style={{ marginBottom: 4 }}>Exportable proof bundle</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
          A <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>ProofPackage</code> bundles all verification inputs for a
          single committed trace. This is what the <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>/proof/:root</code> page renders
          and what <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>buildProofPackage()</code> produces.
        </p>
        <div className="kv-list">
          {proofPackageFields.map(({ field, type, desc }) => (
            <div key={field} className="kv-row" style={{ padding: "12px 16px", alignItems: "flex-start" }}>
              <div style={{ minWidth: 220, flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{field}</div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", marginTop: 2 }}>{type}</div>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live trace sample */}
      {sampleTrace && (
        <div>
          <span className="eyebrow">Live sample</span>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>Demo trace JSON</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            Real trace from the local demo — generated by the agent runner, canonicalised, and stored.
          </p>
          <pre className="code-block" style={{ fontSize: 11, maxHeight: 480, overflow: "auto", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(sampleTrace, null, 2)}
          </pre>
        </div>
      )}
    </ConsoleShell>
  );
}
