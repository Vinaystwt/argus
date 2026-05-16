import { ConsoleShell } from "@/components/ConsoleShell";
import { getDemoData } from "@/lib/demo";

const contracts = [
  {
    name: "MandateRegistry",
    purpose: "Stores mandate definitions. Each mandate defines the asset, max amount, allowed targets, blocked recipients, and action type rules. DAO-owned.",
    methods: [
      { sig: "createMandate(name, asset, maxAmount, targets[], blocked[], allowedActions[], forbiddenActions[])", returns: "uint256 mandateId", note: "Caller becomes the DAO owner of the mandate." },
      { sig: "setActive(mandateId, active)", returns: "—", note: "Only DAO owner. Pauses or restores a mandate." },
      { sig: "requireActive(mandateId)", returns: "Mandate memory", note: "Reverts MandateInactive if mandate is paused." },
      { sig: "allowedTargets(mandateId, target)", returns: "bool", note: "View: is this address an allowed target?" },
      { sig: "blockedRecipients(mandateId, recipient)", returns: "bool", note: "View: is this address a blocked recipient?" },
      { sig: "allowedActionTypes(mandateId, actionType)", returns: "bool", note: "View: is this bytes32 action type allowed?" },
      { sig: "forbiddenActionTypes(mandateId, actionType)", returns: "bool", note: "View: is this bytes32 action type forbidden?" },
    ],
    events: [
      { name: "MandateCreated", params: "mandateId (indexed), dao (indexed), name, asset, maxAmount" },
      { name: "TargetAllowed", params: "mandateId (indexed), target (indexed), allowed" },
      { name: "RecipientBlocked", params: "mandateId (indexed), recipient (indexed), blocked" },
      { name: "ActionTypeRule", params: "mandateId (indexed), actionType (indexed), allowed, forbidden" },
    ],
    errors: ["NotDao()", "MandateInactive()", "InvalidMandate()"],
    constants: null,
  },
  {
    name: "AgentRegistry",
    purpose: "Agent passport registry. Each registered agent gets a uint256 token ID (agentId). Caller becomes agent owner.",
    methods: [
      { sig: "registerAgent(label, metadataURI)", returns: "uint256 agentId", note: "Assigns sequential agentId. Caller is owner." },
      { sig: "setActive(agentId, active)", returns: "—", note: "Only agent owner. Deactivates an agent — blocks new proposals." },
      { sig: "ownerOf(agentId)", returns: "address", note: "Reverts InvalidAgent if not registered." },
      { sig: "isActive(agentId)", returns: "bool", note: "Reverts InvalidAgent if not registered." },
    ],
    events: [
      { name: "AgentRegistered", params: "agentId (indexed), owner (indexed), label, metadataURI" },
      { name: "AgentStatusChanged", params: "agentId (indexed), active" },
    ],
    errors: ["NotAgentOwner()", "InvalidAgent()"],
    constants: null,
  },
  {
    name: "AgentBonding",
    purpose: "Holds agent bond balances and compliance scores. Only ActionGate can slash or reward. Bond is ETH posted by the agent owner.",
    methods: [
      { sig: "postBond(agentId)", returns: "—", note: "payable. Caller must be agent owner. Initialises compliance score to 800 on first bond." },
      { sig: "slash(agentId, amount)", returns: "uint256 slashed", note: "Only ActionGate. Burns up to slashAmount from bond. Returns actual wei slashed." },
      { sig: "rewardApproval(agentId)", returns: "—", note: "Only ActionGate. Score +5 per approved action, capped at 1000." },
      { sig: "setActionGate(actionGate)", returns: "—", note: "One-time setter. Reverts if already set." },
      { sig: "bondBalance(agentId)", returns: "uint256", note: "View: current bond balance in wei." },
      { sig: "complianceScore(agentId)", returns: "uint256", note: "View: current compliance score (0–1000)." },
    ],
    events: [
      { name: "BondPosted", params: "agentId (indexed), funder (indexed), amount, newBalance" },
      { name: "AgentSlashed", params: "agentId (indexed), amount, newBalance" },
      { name: "ComplianceScoreUpdated", params: "agentId (indexed), oldScore, newScore" },
      { name: "ActionGateSet", params: "actionGate (indexed)" },
    ],
    errors: ["NotAgentOwner()", "NotActionGate()", "InvalidBond()"],
    constants: [
      { name: "STARTING_SCORE", value: "800" },
      { name: "APPROVAL_REWARD", value: "5" },
      { name: "SLASH_PENALTY", value: "200" },
    ],
  },
  {
    name: "ActionGate",
    purpose: "Central enforcement hub. Evaluates action proposals against mandate clauses, commits traces, rewards or slashes agents, emits verdict events.",
    methods: [
      { sig: "submitAction(proposal)", returns: "(Verdict verdict, uint256 reasonBitmap, uint256 slashed)", note: "Evaluates all 6 mandate clauses. Commits trace. Approved: score +5. Rejected: bond slashed, bitmap set." },
      { sig: "preview(proposal)", returns: "(Verdict verdict, uint256 reasonBitmap)", note: "View — simulate evaluation without state changes." },
      { sig: "evaluate(proposal, mandate)", returns: "uint256 reasonBitmap", note: "Public view — isolated clause evaluation. Returns 0 if all clauses pass." },
    ],
    events: [
      { name: "ActionApproved", params: "actionId (indexed), agentId (indexed), mandateId (indexed), traceRoot, storageURI" },
      { name: "ActionRejected", params: "actionId (indexed), agentId (indexed), mandateId (indexed), traceRoot, storageURI, reasonBitmap, slashed" },
    ],
    errors: ["AgentInactive()"],
    constants: [
      { name: "VIOLATION_AMOUNT", value: "1 << 0" },
      { name: "VIOLATION_TARGET", value: "1 << 1" },
      { name: "VIOLATION_RECIPIENT", value: "1 << 2" },
      { name: "VIOLATION_ACTION_NOT_ALLOWED", value: "1 << 3" },
      { name: "VIOLATION_ACTION_FORBIDDEN", value: "1 << 4" },
      { name: "VIOLATION_ASSET", value: "1 << 5" },
    ],
  },
  {
    name: "TraceCommitment",
    purpose: "Immutable on-chain trace registry. Stores traceRoot + storageURI + verdict for every committed action. Each actionId can only be committed once.",
    methods: [
      { sig: "commitTrace(actionId, agentId, mandateId, traceRoot, storageURI, verdict)", returns: "—", note: "Only ActionGate. Reverts TraceAlreadyCommitted if actionId already committed." },
      { sig: "getCommitment(actionId)", returns: "Commitment memory", note: "View — retrieve full commitment record by actionId." },
      { sig: "setActionGate(actionGate)", returns: "—", note: "One-time setter." },
    ],
    events: [
      { name: "TraceCommitted", params: "actionId (indexed), agentId (indexed), mandateId (indexed), traceRoot, storageURI, verdict" },
    ],
    errors: ["NotActionGate()", "TraceAlreadyCommitted()"],
    constants: null,
  },
];

export default function DeveloperContractsPage() {
  const data = getDemoData();
  const deployedContracts = Object.entries(data.deployment.contracts);

  return (
    <ConsoleShell eyebrow="Developers" title="Contract ABIs">
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, maxWidth: 680 }}>
          Five contracts form the mandate court. MandateRegistry and AgentRegistry hold the
          registry state. AgentBonding holds collateral. ActionGate is the enforcement hub.
          TraceCommitment is the immutable evidence log.
        </p>
      </div>

      {/* Deployment addresses */}
      <div style={{ marginBottom: 48 }}>
        <span className="eyebrow">Deployment</span>
        <h2 className="text-h2" style={{ marginBottom: 8 }}>Contract addresses</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge badge-approved">0G Mainnet</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Chain ID {data.deployment.chainId} · {data.deployment.chainName} · Deployed on 0G Mainnet
          </span>
        </div>
        <div className="kv-list">
          {deployedContracts.map(([name, address]) => (
            <div key={name} className="kv-row">
              <span className="kv-key" style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12 }}>{name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="kv-val mono">{address}</span>
                <a
                  href={`https://chainscan.0g.ai/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "var(--amber)", textDecoration: "none", flexShrink: 0 }}
                >
                  chainscan ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract docs */}
      {contracts.map((contract) => (
        <div key={contract.name} style={{ marginBottom: 48 }}>
          <span className="eyebrow">{contract.name}</span>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>{contract.name}</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 680, marginBottom: 20 }}>
            {contract.purpose}
          </p>

          {/* Methods */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--subtle)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Methods</div>
            <div className="kv-list">
              {contract.methods.map((m, i) => (
                <div key={i} className="kv-row" style={{ padding: "12px 16px", alignItems: "flex-start", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", marginBottom: 4 }}>
                    <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--text)", flex: 1, lineHeight: 1.5 }}>{m.sig}</code>
                    {m.returns !== "—" && (
                      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "var(--approved)", flexShrink: 0, paddingTop: 1 }}>→ {m.returns}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{m.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div style={{ marginBottom: contract.constants ? 0 : 0 }}>
            <div style={{ fontSize: 11, color: "var(--subtle)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Events</div>
            <div className="kv-list">
              {contract.events.map((e) => (
                <div key={e.name} className="kv-row">
                  <span className="kv-key" style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, minWidth: 240, flexShrink: 0 }}>{e.name}</span>
                  <span className="kv-val" style={{ fontSize: 12 }}>{e.params}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Constants */}
          {contract.constants && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "var(--subtle)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Constants</div>
              <div className="kv-list">
                {contract.constants.map((c) => (
                  <div key={c.name} className="kv-row">
                    <span className="kv-key" style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, minWidth: 240, flexShrink: 0 }}>{c.name}</span>
                    <span className="kv-val mono">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Deployment order */}
      <div>
        <span className="eyebrow">Deployment model</span>
        <h2 className="text-h2" style={{ marginBottom: 16 }}>Deployment order and wiring</h2>
        <div className="panel" style={{ padding: "20px 20px" }}>
          {[
            { n: "1", step: "Deploy MandateRegistry", note: "No dependencies." },
            { n: "2", step: "Deploy AgentRegistry", note: "No dependencies." },
            { n: "3", step: "Deploy AgentBonding(agentRegistry)", note: "Depends on AgentRegistry address." },
            { n: "4", step: "Deploy TraceCommitment", note: "No constructor dependencies." },
            { n: "5", step: "Deploy ActionGate(mandateRegistry, agentRegistry, bonding, traceCommitment)", note: "Central hub — depends on all four." },
            { n: "6", step: "AgentBonding.setActionGate(actionGate)", note: "One-time wiring. Reverts if called again." },
            { n: "7", step: "TraceCommitment.setActionGate(actionGate)", note: "One-time wiring. Reverts if called again." },
          ].map(({ n, step, note }, i, arr) => (
            <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "var(--amber)", fontWeight: 700, flexShrink: 0, paddingTop: 2 }}>0{n}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{step}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
