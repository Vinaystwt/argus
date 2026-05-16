export type ArgusEvent = {
  id: string;
  timestamp: string;
  kind:
    | "MandateCreated"
    | "AgentRegistered"
    | "BondPosted"
    | "ActionApproved"
    | "ActionRejected"
    | "TraceCommitted"
    | "EvidenceSubmitted"
    | "AgentSlashed"
    | "ChallengeWindowClosed"
    | "ProofPackageExported";
  title: string;
  summary: string;
  txHash: `0x${string}`;
  blockNumber?: number;
  traceRoot?: `0x${string}`;
  agentId?: string;
  mandateId?: string;
  violationId?: string;
  severity: "info" | "success" | "warning" | "critical";
};

export type MainnetReadinessItem = {
  id: string;
  label: string;
  status: "ready" | "adapter-ready" | "blocked" | "planned";
  detail: string;
};
