import { canonicalize } from "./canonicalize.js";
import { tracePayloadForHash, traceRoot } from "./traceRoot.js";
import type { ArgusTrace } from "../schemas/trace.js";
import type { ProofPackage, ProofPanelData, TamperDiff, TraceSegment, VerificationResult } from "../schemas/proof.js";
import type { Violation } from "../schemas/violation.js";

export function createTrace(trace: ArgusTrace): ArgusTrace {
  const root = hashTrace(trace);
  return {
    ...trace,
    proof: {
      ...trace.proof,
      canonicalHash: root,
      committedTraceRoot: trace.proof.committedTraceRoot === "0x0" ? root : trace.proof.committedTraceRoot
    }
  };
}

export function hashTrace(trace: ArgusTrace): `0x${string}` {
  return traceRoot(tracePayloadForHash(trace));
}

export function hashTraceSegments(trace: ArgusTrace): TraceSegment[] {
  const segments = [
    { id: "observation", label: "Observation", summary: trace.observation.content, value: trace.observation },
    { id: "inference", label: "Inference", summary: trace.inference.summary, value: trace.inference },
    { id: "proposal", label: "Proposed Action", summary: trace.proposedAction.reason, value: trace.proposedAction },
    { id: "policy", label: "Policy Verdict", summary: trace.policyCheck.verdict, value: trace.policyCheck },
    { id: "penalty", label: "Penalty", summary: trace.penalty.slashed ? "Slash executed" : "No penalty", value: trace.penalty }
  ];
  return segments.map((segment) => ({
    id: segment.id,
    label: segment.label,
    summary: segment.summary,
    hash: traceRoot(segment.value)
  }));
}

export function verifyTrace(trace: ArgusTrace, committedRoot = trace.proof.committedTraceRoot): VerificationResult {
  const computedRoot = hashTrace(trace);
  return {
    status: computedRoot === committedRoot ? "valid" : "mismatch",
    computedRoot,
    committedRoot,
    diff: [],
    checkedAt: new Date().toISOString()
  };
}

export function diffTrace(expected: unknown, actual: unknown, prefix = "$"): TamperDiff[] {
  if (Object.is(expected, actual)) return [];
  if (!isRecord(expected) || !isRecord(actual)) {
    return [{ path: prefix, expected, actual }];
  }
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  const diffs: TamperDiff[] = [];
  for (const key of [...keys].sort()) {
    diffs.push(...diffTrace(expected[key], actual[key], `${prefix}.${key}`));
  }
  return diffs;
}

export function verifyProofPackage(pkg: ProofPackage): VerificationResult {
  const status = pkg.verification.computedRoot === pkg.traceRoot ? "valid" : "mismatch";
  return {
    status,
    computedRoot: pkg.verification.computedRoot,
    committedRoot: pkg.traceRoot,
    diff: pkg.verification.diff,
    checkedAt: new Date().toISOString()
  };
}

export function buildProofPackage(input: {
  trace: ArgusTrace;
  proof: ProofPanelData;
  violation?: Violation;
}): ProofPackage {
  const segmentHashes = input.trace.traceSegments ?? hashTraceSegments(input.trace);
  const computedRoot = hashTrace(input.trace);
  return {
    packageId: `pkg-${input.trace.traceId}-${input.trace.proof.committedTraceRoot.slice(2, 10)}`,
    traceRoot: input.trace.proof.committedTraceRoot,
    generatedAt: new Date().toISOString(),
    traceId: input.trace.traceId,
    agentId: input.trace.agentId,
    mandateId: input.trace.mandateId,
    violationId: input.violation?.violationId,
    proof: input.proof,
    attestation: input.trace.attestation ?? {
      provider: "local-dev",
      mode: "simulated",
      runnerVersion: "argus-runner/unknown",
      executionEnvironmentHash: traceRoot("local-dev"),
      policyEngineHash: traceRoot("policy-engine"),
      note: "Local development attestation. Real 0G Compute or TEE attestation is a roadmap integration."
    },
    segmentHashes,
    verification: {
      status: computedRoot === input.trace.proof.committedTraceRoot ? "valid" : "mismatch",
      computedRoot,
      committedRoot: input.trace.proof.committedTraceRoot,
      diff: [],
      checkedAt: new Date().toISOString()
    }
  };
}

export function parseViolation(trace: ArgusTrace): Pick<Violation, "traceRoot" | "actionId" | "agentId" | "mandateId" | "violatedClauses"> {
  return {
    traceRoot: trace.proof.committedTraceRoot,
    actionId: trace.proposedAction.actionId,
    agentId: trace.agentId,
    mandateId: trace.mandateId,
    violatedClauses: trace.policyCheck.violationCodes
  };
}

export function formatProofPanelData(input: {
  contractAddress: `0x${string}`;
  txHash: `0x${string}`;
  eventName: string;
  trace: ArgusTrace;
  provider: ProofPanelData["provider"];
  blockNumber?: number;
}): ProofPanelData {
  return {
    contractAddress: input.contractAddress,
    txHash: input.txHash,
    eventName: input.eventName,
    blockNumber: input.blockNumber,
    traceRoot: input.trace.proof.committedTraceRoot,
    storageURI: input.trace.proof.storageURI,
    provider: input.provider,
    explorerUrl: input.provider.explorerBaseUrl ? `${input.provider.explorerBaseUrl}/tx/${input.txHash}` : undefined,
    verificationStatus: input.provider.isLocalFallback ? "local-fallback" : "verified"
  };
}

export function submitActionShapeExample() {
  return {
    mandateId: "1",
    agentId: "1",
    actionType: "swap",
    target: "0xAllowedTarget",
    recipient: "0xTreasury",
    asset: "0xUSDC",
    amount: "100000000",
    traceRoot: "0x...",
    storageURI: "0g://..."
  };
}

export function exportProofPackage(pkg: ProofPackage): string {
  return canonicalize(pkg);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
