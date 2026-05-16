import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createStorageAdapter } from "@argus/storage-0g";
import {
  DEMO_ADDRESSES,
  buildProofPackage,
  formatProofPanelData,
  traceRoot,
  type Agent,
  type ArgusEvent,
  type ArgusTrace,
  type Attestation,
  type DemoReceipt,
  type MainnetReadinessItem,
  type Mandate,
  type MandateTemplate,
  type PolicyClause,
  type ProviderStatus,
  type Violation
} from "@argus/shared";
import { evaluateProposal } from "./policies/localPreview.js";
import { compliantSwap } from "./scenarios/compliantSwap.js";
import { promptInjectedTransfer } from "./scenarios/promptInjection.js";
import { buildTrace } from "./trace/buildTrace.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const storageRoot = join(repoRoot, "traces");
const generatedAt = new Date("2026-05-15T09:00:00.000Z").toISOString();

const providerStatus: ProviderStatus = {
  storageProvider: process.env.ARGUS_STORAGE_MODE === "0g" ? "0g-storage" : "local-fallback",
  chainProvider: process.env.ARGUS_CHAIN_MODE === "0g" ? "0g-chain" : "local-simulated",
  isLocalFallback: process.env.ARGUS_STORAGE_MODE !== "0g" || process.env.ARGUS_CHAIN_MODE !== "0g",
  label:
    process.env.ARGUS_STORAGE_MODE === "0g" && process.env.ARGUS_CHAIN_MODE === "0g"
      ? "0G configured"
      : "Local fallback, 0G-ready",
  explorerBaseUrl: process.env.OG_EXPLORER_URL ?? "https://chainscan-galileo.0g.ai",
  storageGatewayUrl: process.env.OG_STORAGE_GATEWAY_URL ?? "0g://storage-gateway"
};

const clauses: PolicyClause[] = [
  {
    clauseId: "clause-size-cap",
    title: "Maximum transaction size",
    description: "The agent may not propose treasury actions above 500 USDC.",
    checkKey: "maxAmount",
    severity: "critical"
  },
  {
    clauseId: "clause-target-allowlist",
    title: "Allowed protocol target",
    description: "Actions must route through approved mock Uniswap or mock Morpho targets.",
    checkKey: "targetAllowed",
    severity: "high"
  },
  {
    clauseId: "clause-blocked-recipient",
    title: "Blocked recipient protection",
    description: "Transfers to 0xBad are prohibited even if requested by agent memory.",
    checkKey: "recipientBlocked",
    severity: "critical"
  },
  {
    clauseId: "clause-action-allowlist",
    title: "Allowed action type",
    description: "Only swap, rebalance, and repay actions are permitted.",
    checkKey: "actionTypeAllowed",
    severity: "high"
  },
  {
    clauseId: "clause-forbidden-actions",
    title: "Forbidden action type",
    description: "External transfers, unknown contract calls, and governance votes are forbidden.",
    checkKey: "actionTypeForbidden",
    severity: "critical"
  }
];

const templates: MandateTemplate[] = [
  {
    templateId: "template-dao-treasury",
    name: "DAO treasury agent",
    category: "dao_treasury",
    summary: "Limits treasury operations to bounded swaps, repayments, and rebalances.",
    recommendedMaxAmount: "500000000",
    allowedActionTypes: ["swap", "rebalance", "repay"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    policyClauses: clauses
  },
  {
    templateId: "template-trading",
    name: "Trading agent",
    category: "trading",
    summary: "Allows bounded swaps through allowlisted venues while blocking transfers and governance actions.",
    recommendedMaxAmount: "250000000",
    allowedActionTypes: ["swap", "rebalance"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    policyClauses: clauses.slice(0, 4)
  },
  {
    templateId: "template-dao-ops",
    name: "DAO ops agent",
    category: "dao_ops",
    summary: "Allows repayment and operational rebalancing while preventing external treasury drain.",
    recommendedMaxAmount: "150000000",
    allowedActionTypes: ["repay", "rebalance"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    policyClauses: clauses
  }
];

const mandates: Mandate[] = [
  {
    id: "1",
    dao: DEMO_ADDRESSES.dao,
    name: "Treasury Agent Constitution",
    asset: DEMO_ADDRESSES.mockUsdc,
    maxAmount: "500000000",
    allowedTargets: [DEMO_ADDRESSES.mockUniswap, DEMO_ADDRESSES.mockMorpho],
    blockedRecipients: [DEMO_ADDRESSES.badRecipient],
    allowedActionTypes: ["rebalance", "repay", "swap"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    active: true,
    templateId: "template-dao-treasury",
    policyHash: traceRoot("Treasury Agent Constitution:v1"),
    clauses,
    lifecycleStatus: "active",
    linkedAgentIds: ["1", "2"],
    violationStats: { total: 1, slashed: 1, challenged: 0 },
    createdTxHash: fakeTx("MandateCreated:1")
  },
  {
    id: "2",
    dao: DEMO_ADDRESSES.dao,
    name: "Market Maker Trading Mandate",
    asset: DEMO_ADDRESSES.mockUsdc,
    maxAmount: "250000000",
    allowedTargets: [DEMO_ADDRESSES.mockUniswap],
    blockedRecipients: [DEMO_ADDRESSES.badRecipient],
    allowedActionTypes: ["swap", "rebalance"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    active: true,
    templateId: "template-trading",
    policyHash: traceRoot("Market Maker Trading Mandate:v1"),
    clauses: templates[1]!.policyClauses,
    lifecycleStatus: "active",
    linkedAgentIds: ["3"],
    violationStats: { total: 0, slashed: 0, challenged: 0 },
    createdTxHash: fakeTx("MandateCreated:2")
  }
];

const agents: Agent[] = [
  {
    id: "1",
    owner: DEMO_ADDRESSES.agentOwner,
    label: "Argus Treasury Agent",
    metadataURI: "agent://argus/treasury-agent",
    bondBalance: "750000000000000000",
    complianceScore: 610,
    active: true,
    passportId: "passport-argus-treasury",
    role: "treasury",
    availableForDelegation: true,
    servedMandateTypes: ["DAO treasury", "Treasury rebalance"],
    reputationBadges: ["Bonded", "Slashed once", "Trace complete"],
    heartbeatStatus: "online",
    approvedCount: 2,
    rejectedCount: 1,
    slashCount: 1,
    scoreHistory: [
      { timestamp: "2026-05-15T08:51:00.000Z", score: 800, label: "Bond posted" },
      { timestamp: "2026-05-15T08:53:00.000Z", score: 805, label: "Compliant swap approved" },
      { timestamp: "2026-05-15T08:56:00.000Z", score: 605, label: "Prompt injection rejected and slashed" },
      { timestamp: "2026-05-15T08:59:00.000Z", score: 610, label: "Mandate-compliant repay approved" }
    ]
  },
  {
    id: "2",
    owner: "0x0000000000000000000000000000000000C0FFEE",
    label: "Argus Watcher Agent",
    metadataURI: "agent://argus/watcher",
    bondBalance: "300000000000000000",
    complianceScore: 910,
    active: true,
    passportId: "passport-argus-watcher",
    role: "watcher",
    availableForDelegation: true,
    servedMandateTypes: ["Evidence review", "Violation challenge"],
    reputationBadges: ["Watcher", "Evidence submitter", "No slashes"],
    heartbeatStatus: "watching",
    approvedCount: 0,
    rejectedCount: 0,
    slashCount: 0,
    scoreHistory: [
      { timestamp: "2026-05-15T08:51:00.000Z", score: 900, label: "Watcher registered" },
      { timestamp: "2026-05-15T08:57:00.000Z", score: 910, label: "Evidence sealed" }
    ]
  },
  {
    id: "3",
    owner: "0x0000000000000000000000000000000000B0B0B0",
    label: "Delta Trading Agent",
    metadataURI: "agent://argus/delta-trader",
    bondBalance: "600000000000000000",
    complianceScore: 842,
    active: true,
    passportId: "passport-delta-trading",
    role: "trading",
    availableForDelegation: false,
    servedMandateTypes: ["Trading", "Market maker"],
    reputationBadges: ["Bonded", "Clean history"],
    heartbeatStatus: "paused",
    approvedCount: 1,
    rejectedCount: 0,
    slashCount: 0,
    scoreHistory: [
      { timestamp: "2026-05-15T08:52:00.000Z", score: 837, label: "Bond posted" },
      { timestamp: "2026-05-15T08:55:00.000Z", score: 842, label: "Rebalance approved" }
    ]
  }
];

const baseAttestation: Attestation = {
  provider: "local-dev",
  mode: "simulated",
  runnerVersion: "argus-runner/0.2.5",
  executionEnvironmentHash: traceRoot("node-24.14.0:argus-local-runner"),
  policyEngineHash: traceRoot("argus-policy-engine:v1"),
  note: "Local development attestation. The trace schema is ready for a real 0G Compute or TEE attestation provider."
};

function fakeTx(seed: string): `0x${string}` {
  return `0x${createHash("sha256").update(seed).digest("hex")}`;
}

async function makeTrace(input: {
  kind: "compliant" | "malicious" | "repay";
  mandate: Mandate;
  agentId: string;
  complianceBefore: number;
  complianceAfter: number;
  linkedViolationId?: string;
}) {
  const proposal =
    input.kind === "compliant"
      ? compliantSwap()
      : input.kind === "malicious"
        ? promptInjectedTransfer()
        : {
            actionId: "action-compliant-repay-80-usdc",
            mandateId: input.mandate.id,
            agentId: input.agentId,
            actionType: "repay" as const,
            target: DEMO_ADDRESSES.mockMorpho,
            recipient: DEMO_ADDRESSES.dao,
            asset: DEMO_ADDRESSES.mockUsdc,
            amount: "80000000",
            calldataPreview: "repay(address asset,uint256 amount,address recipient)",
            reason: "Repay 80 USDC through the approved mock Morpho target."
          };
  proposal.mandateId = input.mandate.id;
  proposal.agentId = input.agentId;

  const verdict = evaluateProposal(proposal, input.mandate);
  const txHash = fakeTx(`${proposal.actionId}:submitAction`);
  const trace = buildTrace({
    proposal,
    verdict,
    promptInjected: input.kind === "malicious",
    txHash,
    storageURI: "pending://storage",
    complianceBefore: input.complianceBefore,
    complianceAfter: input.complianceAfter,
    linkedViolationId: input.linkedViolationId,
    attestation: baseAttestation,
    slashedAmount: verdict.verdict === "REJECTED" ? "250000000000000000" : undefined
  });

  const safeName = `${trace.traceId.replace(/[^a-zA-Z0-9-_]/g, "-")}-${trace.proof.committedTraceRoot.slice(2, 10)}.json`;
  trace.proof.storageURI = `local://${join(storageRoot, safeName)}`;

  const storage = createStorageAdapter(storageRoot);
  const receipt = await storage.putJSON(trace.traceId, trace);
  trace.proof.storageURI = receipt.uri;

  return trace;
}

function proofFor(trace: ArgusTrace, eventName: string, seed: string) {
  return formatProofPanelData({
    contractAddress: DEMO_ADDRESSES.actionGate,
    txHash: fakeTx(seed),
    eventName,
    trace,
    provider: providerStatus,
    blockNumber: 931204 + Number(trace.agentId)
  });
}

async function main() {
  const mode = process.argv[2] ?? "demo";
  const treasuryMandate = mandates[0]!;
  const tradingMandate = mandates[1]!;

  const compliant = await makeTrace({
    kind: "compliant",
    mandate: treasuryMandate,
    agentId: "1",
    complianceBefore: 800,
    complianceAfter: 805
  });
  const malicious = await makeTrace({
    kind: "malicious",
    mandate: treasuryMandate,
    agentId: "1",
    complianceBefore: 805,
    complianceAfter: 605,
    linkedViolationId: "violation-prompt-injection-001"
  });
  const repay = await makeTrace({
    kind: "repay",
    mandate: treasuryMandate,
    agentId: "1",
    complianceBefore: 605,
    complianceAfter: 610
  });
  const trading = await makeTrace({
    kind: "compliant",
    mandate: tradingMandate,
    agentId: "3",
    complianceBefore: 837,
    complianceAfter: 842
  });

  const traces = mode === "compliant" ? [compliant] : mode === "malicious" ? [malicious] : [compliant, malicious, repay, trading];

  const violation: Violation = {
    violationId: "violation-prompt-injection-001",
    traceRoot: malicious.proof.committedTraceRoot,
    actionId: malicious.proposedAction.actionId,
    agentId: "1",
    mandateId: "1",
    title: "Prompt-injected external transfer blocked",
    violatedClauses: [
      "clause-size-cap",
      "clause-target-allowlist",
      "clause-blocked-recipient",
      "clause-action-allowlist",
      "clause-forbidden-actions"
    ],
    lifecycleStatus: "slash_executed",
    challengeWindow: {
      opensAt: "2026-05-15T08:56:30.000Z",
      closesAt: "2026-05-15T09:01:30.000Z",
      status: "closed"
    },
    evidenceBundle: {
      bundleId: "evidence-prompt-injection-001",
      submittedByAgentId: "2",
      submittedByLabel: "Argus Watcher Agent",
      sealedAt: "2026-05-15T08:57:00.000Z",
      traceRoot: malicious.proof.committedTraceRoot,
      storageURI: malicious.proof.storageURI,
      violatedClauses: [
        "Maximum transaction size",
        "Allowed protocol target",
        "Blocked recipient protection",
        "Allowed action type",
        "Forbidden action type"
      ],
      summary:
        "Watcher detected that a malicious memory instruction attempted to override the DAO mandate and transfer 2000 USDC to the blocked recipient."
    },
    slashReceipt: {
      receiptId: "slash-agent-1-001",
      agentId: "1",
      amount: "250000000000000000",
      token: "ETH",
      txHash: fakeTx("AgentSlashed:violation-prompt-injection-001"),
      eventName: "AgentSlashed",
      complianceBefore: 805,
      complianceAfter: 605,
      executedAt: "2026-05-15T08:57:12.000Z"
    }
  };

  const proofPackages = traces.map((trace) =>
    buildProofPackage({
      trace,
      proof: proofFor(
        trace,
        trace.policyCheck.verdict === "APPROVED" ? "ActionApproved" : "ActionRejected",
        `${trace.proposedAction.actionId}:proof`
      ),
      violation: trace.linkedViolationId ? violation : undefined
    })
  );

  const events: ArgusEvent[] = [
    {
      id: "evt-mandate-created",
      timestamp: "2026-05-15T08:50:00.000Z",
      kind: "MandateCreated",
      title: "DAO created treasury mandate",
      summary: "Max transaction size set to 500 USDC with mock Uniswap and mock Morpho allowlisted.",
      txHash: fakeTx("MandateCreated:1"),
      blockNumber: 931200,
      mandateId: "1",
      severity: "info"
    },
    {
      id: "evt-agent-registered",
      timestamp: "2026-05-15T08:51:00.000Z",
      kind: "AgentRegistered",
      title: "Treasury agent registered",
      summary: "Agent accepted delegated authority through a persistent on-chain identity.",
      txHash: fakeTx("AgentRegistered:1"),
      blockNumber: 931201,
      agentId: "1",
      severity: "info"
    },
    {
      id: "evt-bond-posted",
      timestamp: "2026-05-15T08:51:30.000Z",
      kind: "BondPosted",
      title: "Agent bond posted",
      summary: "1 ETH bond placed at risk before the agent could propose treasury actions.",
      txHash: fakeTx("BondPosted:1"),
      blockNumber: 931202,
      agentId: "1",
      severity: "success"
    },
    {
      id: "evt-compliant-approved",
      timestamp: "2026-05-15T08:53:00.000Z",
      kind: "ActionApproved",
      title: "Compliant swap approved",
      summary: "100 USDC swap passed the mandate and committed a replayable trace root.",
      txHash: fakeTx("action-compliant-swap-100-usdc:proof"),
      blockNumber: 931203,
      traceRoot: compliant.proof.committedTraceRoot,
      agentId: "1",
      mandateId: "1",
      severity: "success"
    },
    {
      id: "evt-compliant-trace-committed",
      timestamp: "2026-05-15T08:53:10.000Z",
      kind: "TraceCommitted",
      title: "Compliant trace root committed",
      summary: "The approved swap produced a replayable trace whose canonical root was committed for later verification.",
      txHash: fakeTx("TraceCommitted:action-compliant-swap-100-usdc"),
      blockNumber: 931204,
      traceRoot: compliant.proof.committedTraceRoot,
      agentId: "1",
      mandateId: "1",
      severity: "success"
    },
    {
      id: "evt-malicious-rejected",
      timestamp: "2026-05-15T08:56:00.000Z",
      kind: "ActionRejected",
      title: "Prompt-injected transfer rejected",
      summary: "ActionGate rejected a forbidden 2000 USDC transfer to 0xBad.",
      txHash: fakeTx("action-malicious-transfer-2000-usdc:proof"),
      blockNumber: 931206,
      traceRoot: malicious.proof.committedTraceRoot,
      agentId: "1",
      mandateId: "1",
      violationId: violation.violationId,
      severity: "critical"
    },
    {
      id: "evt-malicious-trace-committed",
      timestamp: "2026-05-15T08:56:10.000Z",
      kind: "TraceCommitted",
      title: "Violation trace root committed",
      summary: "The rejected transfer still produced a black-box trace so the violation can be replayed and challenged.",
      txHash: fakeTx("TraceCommitted:action-malicious-transfer-2000-usdc"),
      blockNumber: 931206,
      traceRoot: malicious.proof.committedTraceRoot,
      agentId: "1",
      mandateId: "1",
      violationId: violation.violationId,
      severity: "warning"
    },
    {
      id: "evt-evidence-submitted",
      timestamp: "2026-05-15T08:57:00.000Z",
      kind: "EvidenceSubmitted",
      title: "Watcher submitted evidence bundle",
      summary: "Argus Watcher Agent sealed the violation evidence bundle for replay and review.",
      txHash: fakeTx("EvidenceSubmitted:violation-prompt-injection-001"),
      blockNumber: 931207,
      traceRoot: malicious.proof.committedTraceRoot,
      agentId: "2",
      violationId: violation.violationId,
      severity: "warning"
    },
    {
      id: "evt-agent-slashed",
      timestamp: "2026-05-15T08:57:12.000Z",
      kind: "AgentSlashed",
      title: "Bond slashed",
      summary: "0.25 ETH was slashed and compliance score dropped from 805 to 605.",
      txHash: violation.slashReceipt.txHash,
      blockNumber: 931208,
      traceRoot: malicious.proof.committedTraceRoot,
      agentId: "1",
      mandateId: "1",
      violationId: violation.violationId,
      severity: "critical"
    }
  ];

  const mainnetReadiness: MainnetReadinessItem[] = [
    { id: "contracts", label: "0G Chain contracts", status: "ready", detail: "Foundry contracts and tests preserve the mandate to slash path." },
    { id: "storage", label: "0G Storage adapter", status: "adapter-ready", detail: "Local fallback is active; official SDK wiring is isolated behind the adapter." },
    { id: "attestation", label: "0G Compute / TEE attestation", status: "planned", detail: "Trace schema carries attestation fields; real provider is roadmap." },
    { id: "wallets", label: "Delegated wallet integration", status: "planned", detail: "Simulator shows session policy and blocked call preview before production wallet work." },
    { id: "proof-explorer", label: "Public proof explorer", status: "adapter-ready", detail: "Proof pages work from generated proof packages and can point to 0G explorer URLs." }
  ];

  const receipt: DemoReceipt = {
    mode: providerStatus.storageProvider === "0g-storage" ? "0g" : "local-fallback",
    generatedAt,
    providerStatus,
    deployment: {
      chainId: 16601,
      chainName: "0G Galileo compatible local demo",
      contracts: {
        ActionGate: DEMO_ADDRESSES.actionGate,
        MandateRegistry: DEMO_ADDRESSES.mandateRegistry,
        AgentRegistry: DEMO_ADDRESSES.agentRegistry,
        AgentBonding: DEMO_ADDRESSES.bonding,
        TraceCommitment: DEMO_ADDRESSES.traceCommitment
      }
    },
    mandate: treasuryMandate,
    agent: agents[0]!,
    mandates,
    agents,
    traces,
    violations: [violation],
    proofPackages,
    mandateTemplates: templates,
    events,
    mainnetReadiness
  };

  await mkdir(join(repoRoot, "apps/web/public"), { recursive: true });
  await mkdir(join(repoRoot, "deployments"), { recursive: true });
  await rm(join(repoRoot, "docs/proof-packages"), { recursive: true, force: true });
  await mkdir(join(repoRoot, "docs/proof-packages"), { recursive: true });
  await writeFile(join(repoRoot, "apps/web/public/demo-data.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  await writeFile(join(repoRoot, "deployments/local.json"), `${JSON.stringify(receipt.deployment, null, 2)}\n`, "utf8");
  for (const pkg of proofPackages) {
    await writeFile(join(repoRoot, "docs/proof-packages", `${pkg.packageId}.json`), `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  }
  console.log(
    JSON.stringify(
      {
        agents: receipt.agents?.length,
        mandates: receipt.mandates?.length,
        traces: receipt.traces.length,
        violations: receipt.violations?.length,
        proofPackages: receipt.proofPackages?.length,
        events: receipt.events.length,
        mode: receipt.mode
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
