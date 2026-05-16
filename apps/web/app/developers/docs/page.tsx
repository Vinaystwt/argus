import { ConsoleShell } from "@/components/ConsoleShell";

const step1 = `// Monorepo workspace package — not yet on npm
import { canonicalize, traceRoot, tracePayloadForHash } from "@argus/shared";
// Monorepo workspace package — not yet on npm
import { LocalStorageFallbackAdapter } from "@argus/storage-0g";

// Build a structured trace for the agent's proposed action
const trace: ArgusTrace = {
  schemaVersion: "argus.trace.v1",
  traceId: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  chainId: 16661,
  mandateId: "mandate-treasury-ops-1",
  agentId: "agent-executor-7",
  observation: { source: "market-feed", content: "ETH/USDC -4.2% in 1h" },
  memory: { promptInjectionDetected: false, relevantMemory: ["rebalance on >3% swing"] },
  inference: { summary: "Rebalance threshold exceeded", riskSignals: [] },
  proposedAction: {
    actionType: "SWAP", target: "0x...", recipient: "0x...",
    asset: "0x...", amount: "500000000", // 500 USDC
    actionId: "0x..."
  },
  policyCheck: { verdict: "approved", violationCodes: [], checks: [] },
  execution: { status: "approved" },
  penalty: { slashed: false, complianceScoreBefore: 800, complianceScoreAfter: 805 },
  proof: { canonicalHash: "0x...", storageURI: "", committedTraceRoot: "0x..." }
};`;

const step2 = `// Canonicalise and hash the trace
const payload = tracePayloadForHash(trace);
const root = traceRoot(payload); // keccak256 of canonical JSON

// Store in 0G Storage (or local fallback)
const storage = new LocalStorageFallbackAdapter("./traces");
const receipt = await storage.putJSON(trace.traceId, trace);

// receipt.uri  → "local://traces/agent-executor-7-a1b2c3d4.json"
// receipt.root → "0xabcd..." (matches root computed above)`;

const step3 = `import { ActionGate__factory } from "./typechain";

const actionGate = ActionGate__factory.connect(ACTION_GATE_ADDRESS, signer);

const proposal = {
  mandateId: BigInt(1),
  agentId: BigInt(7),
  actionId: trace.proposedAction.actionId,
  actionType: ethers.encodeBytes32String("SWAP"),
  target: trace.proposedAction.target,
  recipient: trace.proposedAction.recipient,
  asset: trace.proposedAction.asset,
  amount: BigInt(trace.proposedAction.amount),
  traceRoot: root,       // keccak256 of canonical trace
  storageURI: receipt.uri
};

const tx = await actionGate.submitAction(proposal);
const receipt = await tx.wait();

// Emits ActionApproved or ActionRejected
// ActionRejected includes: reasonBitmap, slashed (wei)`;

const step4 = `// Monorepo workspace package — not yet on npm
import { verifyTrace, buildProofPackage } from "@argus/shared";

// Fetch the stored trace from the storage URI
const storedTrace = await storage.getJSON(receipt.uri);

// Verify: recompute root, diff against committedTraceRoot
const result = verifyTrace(storedTrace, trace.proof.committedTraceRoot);

if (result.status === "valid") {
  console.log("Trace root matches committed value — evidence intact");
} else if (result.status === "mismatch") {
  // result.diff contains field-level diffs: path, expected, actual
  console.error("Tampering detected:", result.diff);
}

// Build exportable proof package for shareable /proof/:root page
const pkg = buildProofPackage({ trace, proof: proofPanelData });`;

const verifyBrowser = `// Monorepo workspace package — not yet on npm
// Browser-safe — no Node.js crypto required
import { verifyTraceInBrowser } from "@argus/shared";

const result = await verifyTraceInBrowser(traceJson, committedRoot);`;

const localFallback = `// Monorepo workspace package — not yet on npm
// Swap local fallback for 0G Storage adapter when ready
// No other code changes required

// Current: local filesystem
import { LocalStorageFallbackAdapter } from "@argus/storage-0g";
const storage = new LocalStorageFallbackAdapter("./traces");

// Planned: ZeroGStorageAdapter (adapter interface defined, 0G integration roadmap)
import { ZeroGStorageAdapter } from "@argus/storage-0g";
const storage = new ZeroGStorageAdapter({ rpc: "https://rpc.0g.ai", key: process.env.KEY });`;

export default function DeveloperDocsPage() {
  return (
    <ConsoleShell eyebrow="Developers" title="Integrate an agent in 5 minutes">
      {/* Overview */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, maxWidth: 680 }}>
          Argus wraps your agent in an accountability layer: structured traces, on-chain mandate enforcement,
          cryptographic evidence sealing, and replayable proof packages. This guide shows the full
          integration path from trace construction to tamper verification.
        </p>
      </div>

      {/* Step 1 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", fontWeight: 650, letterSpacing: "0.1em" }}>STEP 01</span>
          <h2 className="text-h2" style={{ margin: 0 }}>Build a structured trace</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          Every agent action must be captured as an <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>ArgusTrace</code> before execution.
          The trace records the full decision path: what the agent observed, what it remembered, what it inferred,
          and what it proposed. All fields are deterministic — same inputs produce same hash.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{step1}</pre>
      </div>

      {/* Step 2 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", fontWeight: 650, letterSpacing: "0.1em" }}>STEP 02</span>
          <h2 className="text-h2" style={{ margin: 0 }}>Canonicalise, hash, store</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          Canonical JSON serialisation ensures identical bytes for identical data.
          The trace root is <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>keccak256(canonicalize(tracePayloadForHash(trace)))</code>.
          The storage URI returned by the adapter is included in the on-chain proposal.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{step2}</pre>
      </div>

      {/* Step 3 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", fontWeight: 650, letterSpacing: "0.1em" }}>STEP 03</span>
          <h2 className="text-h2" style={{ margin: 0 }}>Route through ActionGate</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>submitAction()</code> evaluates the proposal against all 6 mandate clauses on-chain.
          If any clause fails, the action is rejected before execution, the bond is slashed, and
          <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>ActionRejected</code> is emitted with a violation bitmap.
          Use <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>preview()</code> to simulate without writing state.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{step3}</pre>

        {/* Violation bitmap */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 10 }}>Violation bitmap flags</div>
          <div className="kv-list">
            {[
              { flag: "VIOLATION_AMOUNT", bit: "1 << 0", desc: "proposal.amount > mandate.maxAmount" },
              { flag: "VIOLATION_TARGET", bit: "1 << 1", desc: "target not in mandate.allowedTargets" },
              { flag: "VIOLATION_RECIPIENT", bit: "1 << 2", desc: "recipient in mandate.blockedRecipients" },
              { flag: "VIOLATION_ACTION_NOT_ALLOWED", bit: "1 << 3", desc: "actionType not in mandate.allowedActionTypes" },
              { flag: "VIOLATION_ACTION_FORBIDDEN", bit: "1 << 4", desc: "actionType in mandate.forbiddenActionTypes" },
              { flag: "VIOLATION_ASSET", bit: "1 << 5", desc: "proposal.asset != mandate.asset" },
            ].map(({ flag, bit, desc }) => (
              <div key={flag} className="kv-row">
                <span className="kv-key" style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11 }}>{flag}</span>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)" }}>{bit}</span>
                  <span className="kv-val" style={{ fontSize: 12 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--amber)", fontWeight: 650, letterSpacing: "0.1em" }}>STEP 04</span>
          <h2 className="text-h2" style={{ margin: 0 }}>Verify the proof package</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          After the action is committed on-chain, any party can independently verify the evidence.
          Fetch the stored trace from the storage URI, recompute the root, and diff against the
          <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "var(--text)" }}>committedTraceRoot</code> on-chain.
          A root mismatch proves the stored evidence was tampered with after commitment.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{step4}</pre>
      </div>

      {/* Browser verification */}
      <div style={{ marginBottom: 40 }}>
        <h3 className="text-h3" style={{ marginBottom: 12 }}>Browser verification (no backend required)</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          The shared package exports browser-safe helpers that use the Web Crypto API.
          No server, no proxy, no trust requirement. Paste a trace, get a verdict.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{verifyBrowser}</pre>
      </div>

      {/* Local fallback */}
      <div style={{ marginBottom: 40 }}>
        <h3 className="text-h3" style={{ marginBottom: 12 }}>Local fallback vs. 0G Storage</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
          The storage adapter interface is stable. Swapping from local fallback to 0G Storage
          requires only a constructor change. All upstream code — hashing, commitment, verification — is unchanged.
        </p>
        <pre className="code-block" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{localFallback}</pre>
      </div>

      {/* What Argus does not do */}
      <div>
        <h3 className="text-h3" style={{ marginBottom: 12 }}>What Argus does not do</h3>
        <div className="panel" style={{ padding: "16px 20px" }}>
          {[
            "Execute transactions — ActionGate blocks or approves, your agent executes.",
            "Generate agent strategy — Argus enforces mandates, not business logic.",
            "Store secrets — trace JSON is plaintext evidence, not encrypted vault.",
            "Guarantee TEE execution — attestation is currently simulated; 0G Compute is roadmap.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <span style={{ color: "var(--rejected)", fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✕</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
