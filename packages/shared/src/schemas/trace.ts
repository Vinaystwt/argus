import type { ActionProposal } from "./action.js";
import type { PolicyVerdict } from "./verdict.js";
import type { Attestation, ProofPackage, TraceSegment } from "./proof.js";
import type { Agent } from "./agent.js";
import type { Mandate } from "./mandate.js";
import type { ArgusEvent, MainnetReadinessItem } from "./events.js";
import type { MandateTemplate } from "./policy.js";
import type { Violation } from "./violation.js";

export type ArgusTrace = {
  schemaVersion: "argus.trace.v1";
  traceId: string;
  createdAt: string;
  chainId: number;
  mandateId: string;
  agentId: string;
  observation: {
    source: string;
    content: string;
  };
  memory: {
    promptInjectionDetected: boolean;
    relevantMemory: string[];
  };
  inference: {
    summary: string;
    riskSignals: string[];
  };
  proposedAction: ActionProposal;
  policyCheck: PolicyVerdict;
  execution: {
    status: "approved" | "rejected";
    txHash?: `0x${string}`;
    reason?: string;
  };
  penalty: {
    slashed: boolean;
    amount?: string;
    complianceScoreBefore: number;
    complianceScoreAfter: number;
  };
  attestation?: Attestation;
  traceSegments?: TraceSegment[];
  merkleRoot?: `0x${string}`;
  linkedViolationId?: string;
  proof: {
    canonicalHash: `0x${string}`;
    storageURI: string;
    committedTraceRoot: `0x${string}`;
  };
};

export type DemoReceipt = {
  mode: "local-fallback" | "0g";
  generatedAt: string;
  providerStatus?: import("./proof.js").ProviderStatus;
  deployment: {
    chainId: number;
    chainName: string;
    contracts: Record<string, `0x${string}`>;
  };
  mandate: Mandate;
  agent: Agent;
  mandates?: Mandate[];
  agents?: Agent[];
  traces: ArgusTrace[];
  violations?: Violation[];
  proofPackages?: ProofPackage[];
  mandateTemplates?: MandateTemplate[];
  events: ArgusEvent[];
  mainnetReadiness?: MainnetReadinessItem[];
};
