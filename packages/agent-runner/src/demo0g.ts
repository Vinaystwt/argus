/**
 * Argus 0G deployed demo runner.
 * --dry-run performs readiness checks only. Live mode sends transactions.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, ethers } from "ethers";
import { LocalStorageFallbackAdapter, createStorageAdapter } from "@argus/storage-0g";
import {
  buildProofPackage,
  formatProofPanelData,
  traceRoot,
  type Agent,
  type ArgusEvent,
  type ArgusTrace,
  type DemoReceipt,
  type Mandate,
  type ProviderStatus,
  type Violation
} from "@argus/shared";
import { compliantSwap } from "./scenarios/compliantSwap.js";
import { promptInjectedTransfer } from "./scenarios/promptInjection.js";
import { evaluateProposal } from "./policies/localPreview.js";
import { buildTrace } from "./trace/buildTrace.js";
import {
  explorerTx,
  loadEnvFiles,
  networkName,
  publicRpcLabel,
  requiredEnv
} from "./env.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const storageRoot = join(REPO_ROOT, "traces");
const dryRun = process.argv.includes("--dry-run");

type DeploymentArtifact = {
  chainId: number;
  networkName: string;
  explorerBaseUrl: string;
  contracts: Record<string, `0x${string}`>;
};

function readDeployment(required: boolean): DeploymentArtifact | undefined {
  const file = join(REPO_ROOT, "deployments", "0g.json");
  if (!existsSync(file)) {
    if (required) throw new Error("deployments/0g.json is required for live deployed demo");
    return undefined;
  }
  const parsed = JSON.parse(readFileSync(file, "utf8")) as DeploymentArtifact;
  const requiredContracts = [
    "MockERC20",
    "MockUniswap",
    "MockMorpho",
    "MandateRegistry",
    "AgentRegistry",
    "AgentBonding",
    "TraceCommitment",
    "ActionGate"
  ];
  const missing = requiredContracts.filter((name) => !ethers.isAddress(parsed.contracts?.[name] ?? ""));
  if (missing.length > 0) throw new Error(`deployments/0g.json missing valid addresses: ${missing.join(", ")}`);
  return parsed;
}

function artifact(name: string) {
  return JSON.parse(readFileSync(join(REPO_ROOT, "contracts", "out", `${name}.sol`, `${name}.json`), "utf8")) as {
    abi: unknown[];
  };
}

function contract(name: string, address: string, signer: ethers.Wallet, artifactName = name) {
  return new Contract(address, artifact(artifactName).abi as ethers.InterfaceAbi, signer);
}

function deployedAddress(deployment: DeploymentArtifact, name: string): `0x${string}` {
  const address = deployment.contracts[name];
  if (!ethers.isAddress(address ?? "")) throw new Error(`Missing deployed address for ${name}`);
  return address as `0x${string}`;
}

function requiredReceipt(receipt: ethers.TransactionReceipt | null, label: string): ethers.TransactionReceipt {
  if (!receipt) throw new Error(`${label} transaction was not mined`);
  if (receipt.status !== 1) throw new Error(`${label} transaction reverted`);
  return receipt;
}

function eventArg(receipt: ethers.TransactionReceipt, iface: ethers.Interface, eventName: string, arg: string) {
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === eventName) return parsed.args.getValue(arg);
    } catch {
      // Ignore logs from other contracts.
    }
  }
  return undefined;
}

function providerStatus(deployment: DeploymentArtifact, storageProvider: "0g-storage" | "local-fallback"): ProviderStatus {
  const storageFallback = storageProvider !== "0g-storage";
  return {
    storageProvider,
    chainProvider: "0g-chain",
    isLocalFallback: storageFallback,
    label: storageFallback ? `${deployment.networkName} live, storage fallback` : `${deployment.networkName} live`,
    explorerBaseUrl: deployment.explorerBaseUrl,
    storageGatewayUrl: process.env["OG_STORAGE_GATEWAY_URL"] || undefined
  };
}

async function storeTrace(trace: ArgusTrace) {
  const adapter = createStorageAdapter(storageRoot);
  try {
    return await adapter.putJSON(trace.traceId, trace);
  } catch (error) {
    if (process.env["ARGUS_ALLOW_STORAGE_FALLBACK"] !== "1") throw error;
    const fallback = new LocalStorageFallbackAdapter(storageRoot);
    return fallback.putJSON(trace.traceId, trace);
  }
}

function makeMandate(deployment: DeploymentArtifact, mandateId = "1"): Mandate {
  return {
    id: mandateId,
    chainId: deployment.chainId,
    dao: "0x0000000000000000000000000000000000000000",
    name: "Treasury Agent Constitution",
    asset: deployedAddress(deployment, "MockERC20"),
    maxAmount: "500000000",
    allowedTargets: [deployedAddress(deployment, "MockUniswap"), deployedAddress(deployment, "MockMorpho")],
    blockedRecipients: ["0x0000000000000000000000000000000000000BAD"],
    allowedActionTypes: ["rebalance", "repay", "swap"],
    forbiddenActionTypes: ["external_transfer", "unknown_call", "governance_vote"],
    active: true,
    policyHash: traceRoot("Treasury Agent Constitution:v1"),
    lifecycleStatus: "active",
    linkedAgentIds: ["1"],
    violationStats: { total: 1, slashed: 1, challenged: 0 }
  };
}

async function buildAndStoreTrace(input: {
  kind: "compliant" | "malicious";
  mandate: Mandate;
  agentId: string;
  runId?: string;
  complianceBefore: number;
  complianceAfter: number;
  linkedViolationId?: string;
}) {
  const proposal = input.kind === "compliant" ? compliantSwap() : promptInjectedTransfer();
  if (input.runId) proposal.actionId = `${proposal.actionId}-${input.runId}`;
  proposal.mandateId = input.mandate.id;
  proposal.agentId = input.agentId;
  proposal.asset = input.mandate.asset;
  if (input.kind === "compliant") {
    proposal.target = input.mandate.allowedTargets[0]!;
    proposal.recipient = input.mandate.dao;
  }
  const verdict = evaluateProposal(proposal, input.mandate);
  const trace = buildTrace({
    proposal,
    verdict,
    chainId: Number(input.mandate.chainId ?? 16661),
    promptInjected: input.kind === "malicious",
    storageURI: "pending://0g-storage",
    complianceBefore: input.complianceBefore,
    complianceAfter: input.complianceAfter,
    linkedViolationId: input.linkedViolationId,
    slashedAmount: verdict.verdict === "REJECTED" ? "250000000000000000" : undefined,
    attestation: {
      provider: "local-dev",
      mode: "simulated",
      runnerVersion: "argus-runner/0.3.0",
      executionEnvironmentHash: traceRoot("argus-live-runner-node"),
      policyEngineHash: traceRoot("argus-policy-engine:v1"),
      note: "Local runner attestation. 0G Compute / TEE remains a roadmap provider."
    }
  });
  const receipt = await storeTrace(trace);
  trace.proof.storageURI = receipt.uri;
  return { trace, proposal, storageReceipt: receipt };
}

function proposalToContract(trace: ArgusTrace) {
  const proposal = trace.proposedAction;
  return {
    mandateId: BigInt(proposal.mandateId),
    agentId: BigInt(proposal.agentId),
    actionId: ethers.id(proposal.actionId),
    actionType: ethers.id(proposal.actionType),
    target: proposal.target,
    recipient: proposal.recipient,
    asset: proposal.asset,
    amount: BigInt(proposal.amount),
    traceRoot: trace.proof.committedTraceRoot,
    storageURI: trace.proof.storageURI
  };
}

function proofFor(input: {
  deployment: DeploymentArtifact;
  provider: ProviderStatus;
  trace: ArgusTrace;
  txHash: `0x${string}`;
  blockNumber: number;
  eventName: string;
}) {
  return formatProofPanelData({
    contractAddress: deployedAddress(input.deployment, "ActionGate"),
    txHash: input.txHash,
    eventName: input.eventName,
    trace: input.trace,
    provider: input.provider,
    blockNumber: input.blockNumber
  });
}

async function dryRunChecks() {
  console.log("\nArgus 0G Demo Dry Run");
  console.log("=====================");
  const originalStorageMode = process.env["ARGUS_STORAGE_MODE"];
  process.env["ARGUS_STORAGE_MODE"] = "local-fallback";
  const deployment = readDeployment(false);
  console.log(`Deployment JSON: ${deployment ? "present" : "missing, expected before live mode"}`);
  for (const name of ["ActionGate", "MandateRegistry", "AgentRegistry", "AgentBonding", "TraceCommitment"]) {
    const abi = artifact(name).abi;
    console.log(`ABI ${name}: ${abi.length} entries`);
  }
  const fakeDeployment: DeploymentArtifact =
    deployment ??
    ({
      chainId: 16661,
      networkName: "0G Mainnet",
      explorerBaseUrl: process.env["OG_EXPLORER_BASE_URL"] ?? "https://chainscan.0g.ai",
      contracts: {
        MockERC20: "0x0000000000000000000000000000000000000C0F",
        MockUniswap: "0x0000000000000000000000000000000000000A11",
        MockMorpho: "0x0000000000000000000000000000000000000A12",
        MandateRegistry: "0x000000000000000000000000000000000000A901",
        AgentRegistry: "0x000000000000000000000000000000000000A902",
        AgentBonding: "0x000000000000000000000000000000000000A903",
        TraceCommitment: "0x000000000000000000000000000000000000A904",
        ActionGate: "0x000000000000000000000000000000000000A900"
      }
    } as DeploymentArtifact);
  const mandate = makeMandate(fakeDeployment);
  const compliant = await buildAndStoreTrace({
    kind: "compliant",
    mandate,
    agentId: "1",
    complianceBefore: 800,
    complianceAfter: 805
  });
  const malicious = await buildAndStoreTrace({
    kind: "malicious",
    mandate,
    agentId: "1",
    complianceBefore: 805,
    complianceAfter: 605,
    linkedViolationId: "violation-prompt-injection-001"
  });
  const provider = providerStatus(fakeDeployment, "local-fallback");
  const proof = proofFor({
    deployment: fakeDeployment,
    provider,
    trace: compliant.trace,
    txHash: ethers.ZeroHash as `0x${string}`,
    blockNumber: 0,
    eventName: "ActionApproved"
  });
  const pkg = buildProofPackage({ trace: compliant.trace, proof });
  console.log(`Compliant trace root: ${compliant.trace.proof.committedTraceRoot}`);
  console.log(`Malicious trace root: ${malicious.trace.proof.committedTraceRoot}`);
  console.log(`Proof package: ${pkg.packageId}`);
  console.log(`Explorer sample: ${explorerTx(fakeDeployment.explorerBaseUrl, ethers.ZeroHash)}`);
  console.log(`Storage mode selected: local-fallback (dry-run forced; configured=${originalStorageMode ?? "unset"})`);
  if (originalStorageMode === undefined) delete process.env["ARGUS_STORAGE_MODE"];
  else process.env["ARGUS_STORAGE_MODE"] = originalStorageMode;
  console.log("Dry run complete. No transactions sent.");
}

async function liveRun() {
  if (process.env["DEPLOYMENT_MODE"] !== "0g") {
    throw new Error("Live demo requires DEPLOYMENT_MODE=0g");
  }
  const rpcUrl = requiredEnv("OG_RPC_URL");
  const expectedChainId = requiredEnv("OG_CHAIN_ID");
  const privateKey = requiredEnv("PRIVATE_KEY");
  const deployment = readDeployment(true)!;
  const chainProvider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await chainProvider.getNetwork();
  if (network.chainId.toString() !== expectedChainId || Number(expectedChainId) !== deployment.chainId) {
    throw new Error(`Chain ID mismatch: rpc=${network.chainId.toString()} env=${expectedChainId} deployment=${deployment.chainId}`);
  }
  const signer = new ethers.Wallet(privateKey, chainProvider);
  console.log(`Running live demo on ${networkName(network.chainId)} as ${signer.address}`);

  const mandateRegistry = contract("MandateRegistry", deployedAddress(deployment, "MandateRegistry"), signer);
  const agentRegistry = contract("AgentRegistry", deployedAddress(deployment, "AgentRegistry"), signer);
  const bonding = contract("AgentBonding", deployedAddress(deployment, "AgentBonding"), signer);
  const actionGate = contract("ActionGate", deployedAddress(deployment, "ActionGate"), signer);

  const allowedActions = ["rebalance", "repay", "swap"].map((item) => ethers.id(item));
  const forbiddenActions = ["external_transfer", "unknown_call", "governance_vote"].map((item) => ethers.id(item));
  const blocked = ["0x0000000000000000000000000000000000000BAD"];

  const mandateTx = await mandateRegistry.getFunction("createMandate")(
    "Treasury Agent Constitution",
    deployedAddress(deployment, "MockERC20"),
    500000000n,
    [deployedAddress(deployment, "MockUniswap"), deployedAddress(deployment, "MockMorpho")],
    blocked,
    allowedActions,
    forbiddenActions
  );
  const mandateReceipt = requiredReceipt(await mandateTx.wait(), "createMandate");
  const mandateId = eventArg(mandateReceipt, mandateRegistry.interface, "MandateCreated", "mandateId")?.toString() ?? "1";

  const agentTx = await agentRegistry.getFunction("registerAgent")("Argus Treasury Agent", "agent://argus/treasury-agent");
  const agentReceipt = requiredReceipt(await agentTx.wait(), "registerAgent");
  const agentId = eventArg(agentReceipt, agentRegistry.interface, "AgentRegistered", "agentId")?.toString() ?? "1";

  const bondAmount = ethers.parseEther(process.env["ARGUS_DEMO_BOND"] ?? "1.0");
  const bondTx = await bonding.getFunction("postBond")(BigInt(agentId), { value: bondAmount });
  const bondReceipt = requiredReceipt(await bondTx.wait(), "postBond");

  const mandate = makeMandate(deployment, mandateId);
  mandate.dao = signer.address as `0x${string}`;
  mandate.createdTxHash = mandateTx.hash as `0x${string}`;
  mandate.linkedAgentIds = [agentId];

  const compliant = await buildAndStoreTrace({
    kind: "compliant",
    mandate,
    agentId,
    runId: `0g-${Date.now()}`,
    complianceBefore: 800,
    complianceAfter: 805
  });
  const compliantTx = await actionGate.getFunction("submitAction")(proposalToContract(compliant.trace));
  const compliantReceipt = requiredReceipt(await compliantTx.wait(), "compliant action");

  const malicious = await buildAndStoreTrace({
    kind: "malicious",
    mandate,
    agentId,
    runId: `0g-${Date.now()}`,
    complianceBefore: 805,
    complianceAfter: 605,
    linkedViolationId: "violation-prompt-injection-001"
  });
  const maliciousTx = await actionGate.getFunction("submitAction")(proposalToContract(malicious.trace));
  const maliciousReceipt = requiredReceipt(await maliciousTx.wait(), "malicious action");

  const storageProvider =
    compliant.storageReceipt.provider === "0g" && malicious.storageReceipt.provider === "0g"
      ? "0g-storage"
      : "local-fallback";
  const proofProvider = providerStatus(deployment, storageProvider);
  const agent: Agent = {
    id: agentId,
    owner: signer.address as `0x${string}`,
    label: "Argus Treasury Agent",
    metadataURI: "agent://argus/treasury-agent",
    bondBalance: (bondAmount - ethers.parseEther("0.25")).toString(),
    complianceScore: 605,
    active: true,
    passportId: "passport-argus-treasury",
    role: "treasury",
    availableForDelegation: true,
    servedMandateTypes: ["DAO treasury"],
    reputationBadges: ["Bonded", "Slashed once", "Trace complete"],
    heartbeatStatus: "online",
    approvedCount: 1,
    rejectedCount: 1,
    slashCount: 1,
    scoreHistory: [
      { timestamp: new Date(Number(bondReceipt!.blockNumber) * 1000).toISOString(), score: 800, label: "Bond posted" },
      { timestamp: new Date(Number(compliantReceipt!.blockNumber) * 1000).toISOString(), score: 805, label: "Compliant action approved" },
      { timestamp: new Date(Number(maliciousReceipt!.blockNumber) * 1000).toISOString(), score: 605, label: "Prompt injection rejected and slashed" }
    ]
  };

  const violation: Violation = {
    violationId: "violation-prompt-injection-001",
    traceRoot: malicious.trace.proof.committedTraceRoot,
    actionId: malicious.trace.proposedAction.actionId,
    agentId,
    mandateId,
    title: "Prompt-injected external transfer blocked",
    violatedClauses: malicious.trace.policyCheck.violationCodes,
    lifecycleStatus: "slash_executed",
    challengeWindow: { opensAt: new Date().toISOString(), closesAt: new Date().toISOString(), status: "closed" },
    evidenceBundle: {
      bundleId: "evidence-prompt-injection-001",
      submittedByAgentId: agentId,
      submittedByLabel: "Argus Treasury Agent",
      sealedAt: new Date().toISOString(),
      traceRoot: malicious.trace.proof.committedTraceRoot,
      storageURI: malicious.trace.proof.storageURI,
      violatedClauses: malicious.trace.policyCheck.violationCodes,
      summary: "ActionGate rejected a prompt-injected external transfer and sealed the violation trace."
    },
    slashReceipt: {
      receiptId: "slash-agent-live-001",
      agentId,
      amount: "250000000000000000",
      token: "0G",
      txHash: maliciousTx.hash as `0x${string}`,
      eventName: "AgentSlashed",
      complianceBefore: 805,
      complianceAfter: 605,
      executedAt: new Date().toISOString()
    }
  };

  const proofPackages = [
    buildProofPackage({
      trace: compliant.trace,
      proof: proofFor({
        deployment,
        provider: proofProvider,
        trace: compliant.trace,
        txHash: compliantTx.hash as `0x${string}`,
        blockNumber: compliantReceipt!.blockNumber,
        eventName: "ActionApproved"
      })
    }),
    buildProofPackage({
      trace: malicious.trace,
      proof: proofFor({
        deployment,
        provider: proofProvider,
        trace: malicious.trace,
        txHash: maliciousTx.hash as `0x${string}`,
        blockNumber: maliciousReceipt!.blockNumber,
        eventName: "ActionRejected"
      }),
      violation
    })
  ];

  const events: ArgusEvent[] = [
    { id: "evt-mandate-created", timestamp: new Date().toISOString(), kind: "MandateCreated", title: "DAO created treasury mandate", summary: "Live on-chain mandate created.", txHash: mandateTx.hash as `0x${string}`, blockNumber: mandateReceipt!.blockNumber, mandateId, severity: "info" },
    { id: "evt-agent-registered", timestamp: new Date().toISOString(), kind: "AgentRegistered", title: "Treasury agent registered", summary: "Live agent identity registered.", txHash: agentTx.hash as `0x${string}`, blockNumber: agentReceipt!.blockNumber, agentId, severity: "info" },
    { id: "evt-bond-posted", timestamp: new Date().toISOString(), kind: "BondPosted", title: "Agent bond posted", summary: "Native 0G bond posted before action proposals.", txHash: bondTx.hash as `0x${string}`, blockNumber: bondReceipt!.blockNumber, agentId, severity: "success" },
    { id: "evt-compliant-approved", timestamp: new Date().toISOString(), kind: "ActionApproved", title: "Compliant action approved", summary: "ActionGate approved the mandate-compliant action.", txHash: compliantTx.hash as `0x${string}`, blockNumber: compliantReceipt!.blockNumber, traceRoot: compliant.trace.proof.committedTraceRoot, agentId, mandateId, severity: "success" },
    { id: "evt-compliant-trace-committed", timestamp: new Date().toISOString(), kind: "TraceCommitted", title: "Compliant trace root committed", summary: "TraceCommitment emitted the compliant trace root.", txHash: compliantTx.hash as `0x${string}`, blockNumber: compliantReceipt!.blockNumber, traceRoot: compliant.trace.proof.committedTraceRoot, agentId, mandateId, severity: "success" },
    { id: "evt-malicious-rejected", timestamp: new Date().toISOString(), kind: "ActionRejected", title: "Prompt-injected transfer rejected", summary: "ActionGate rejected and slashed the violating action.", txHash: maliciousTx.hash as `0x${string}`, blockNumber: maliciousReceipt!.blockNumber, traceRoot: malicious.trace.proof.committedTraceRoot, agentId, mandateId, violationId: violation.violationId, severity: "critical" },
    { id: "evt-agent-slashed", timestamp: new Date().toISOString(), kind: "AgentSlashed", title: "Bond slashed", summary: "Agent bond and compliance score changed on-chain.", txHash: maliciousTx.hash as `0x${string}`, blockNumber: maliciousReceipt!.blockNumber, traceRoot: malicious.trace.proof.committedTraceRoot, agentId, mandateId, violationId: violation.violationId, severity: "critical" }
  ];

  const receipt: DemoReceipt = {
    mode: "0g",
    generatedAt: new Date().toISOString(),
    providerStatus: proofProvider,
    deployment: {
      chainId: deployment.chainId,
      chainName: deployment.networkName,
      contracts: deployment.contracts
    },
    mandate,
    agent,
    mandates: [mandate],
    agents: [agent],
    traces: [compliant.trace, malicious.trace],
    violations: [violation],
    proofPackages,
    events
  };

  mkdirSync(join(REPO_ROOT, "apps/web/public"), { recursive: true });
  rmSync(join(REPO_ROOT, "docs/proof-packages"), { recursive: true, force: true });
  mkdirSync(join(REPO_ROOT, "docs/proof-packages"), { recursive: true });
  writeFileSync(join(REPO_ROOT, "apps/web/public/demo-data.json"), `${JSON.stringify(receipt, null, 2)}\n`);
  for (const pkg of proofPackages) {
    writeFileSync(join(REPO_ROOT, "docs/proof-packages", `${pkg.packageId}.json`), `${JSON.stringify(pkg, null, 2)}\n`);
  }
  const txSummary = {
    networkName: deployment.networkName,
    chainId: deployment.chainId,
    generatedAt: new Date().toISOString(),
    transactions: {
      createMandate: {
        txHash: mandateTx.hash,
        blockNumber: mandateReceipt.blockNumber,
        eventNames: ["MandateCreated"],
        explorerUrl: explorerTx(deployment.explorerBaseUrl, mandateTx.hash)
      },
      registerAgent: {
        txHash: agentTx.hash,
        blockNumber: agentReceipt.blockNumber,
        eventNames: ["AgentRegistered"],
        explorerUrl: explorerTx(deployment.explorerBaseUrl, agentTx.hash)
      },
      postBond: {
        txHash: bondTx.hash,
        blockNumber: bondReceipt.blockNumber,
        eventNames: ["BondPosted"],
        explorerUrl: explorerTx(deployment.explorerBaseUrl, bondTx.hash)
      },
      compliantAction: {
        txHash: compliantTx.hash,
        blockNumber: compliantReceipt.blockNumber,
        eventNames: ["ActionApproved", "TraceCommitted", "ComplianceScoreUpdated"],
        explorerUrl: explorerTx(deployment.explorerBaseUrl, compliantTx.hash)
      },
      maliciousAction: {
        txHash: maliciousTx.hash,
        blockNumber: maliciousReceipt.blockNumber,
        eventNames: ["ActionRejected", "AgentSlashed", "TraceCommitted", "ComplianceScoreUpdated"],
        explorerUrl: explorerTx(deployment.explorerBaseUrl, maliciousTx.hash)
      }
    }
  };
  const storageSummary = {
    networkName: deployment.networkName,
    chainId: deployment.chainId,
    generatedAt: new Date().toISOString(),
    storageMode: storageProvider,
    receipts: [
      { label: "compliant-trace", traceRoot: compliant.trace.proof.committedTraceRoot, ...compliant.storageReceipt },
      { label: "violation-trace", traceRoot: malicious.trace.proof.committedTraceRoot, ...malicious.storageReceipt }
    ]
  };
  writeFileSync(
    join(REPO_ROOT, "deployments", "0g-demo-transactions.json"),
    `${JSON.stringify(txSummary, null, 2)}\n`
  );
  writeFileSync(
    join(REPO_ROOT, "deployments", "0g-storage-receipts.json"),
    `${JSON.stringify(storageSummary, null, 2)}\n`
  );
  console.log("Live deployed demo complete. Wrote demo data and proof packages.");
}

async function main() {
  loadEnvFiles(REPO_ROOT);
  if (dryRun) await dryRunChecks();
  else await liveRun();
}

main().catch((error) => {
  console.error("demo:0g failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
