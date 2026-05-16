export type ViolationLifecycleStatus =
  | "new"
  | "evidence_sealed"
  | "challenge_window"
  | "slash_executed"
  | "resolved";

export type SlashReceipt = {
  receiptId: string;
  agentId: string;
  amount: string;
  token: "ETH" | "0G";
  txHash: `0x${string}`;
  eventName: "AgentSlashed";
  complianceBefore: number;
  complianceAfter: number;
  executedAt: string;
};

export type EvidenceBundle = {
  bundleId: string;
  submittedByAgentId?: string;
  submittedByLabel: string;
  sealedAt: string;
  traceRoot: `0x${string}`;
  storageURI: string;
  violatedClauses: string[];
  summary: string;
};

export type Violation = {
  violationId: string;
  traceRoot: `0x${string}`;
  actionId: string;
  agentId: string;
  mandateId: string;
  title: string;
  violatedClauses: string[];
  lifecycleStatus: ViolationLifecycleStatus;
  challengeWindow: {
    opensAt: string;
    closesAt: string;
    status: "open" | "closed";
  };
  evidenceBundle: EvidenceBundle;
  slashReceipt: SlashReceipt;
};
