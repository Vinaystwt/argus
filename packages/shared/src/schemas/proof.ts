export type ProviderStatus = {
  storageProvider: "local-fallback" | "0g-storage";
  chainProvider: "local-simulated" | "0g-chain";
  isLocalFallback: boolean;
  label: string;
  explorerBaseUrl?: string;
  storageGatewayUrl?: string;
};

export type Attestation = {
  provider: "local-dev" | "0g-compute-tee-ready";
  mode: "simulated" | "adapter-ready" | "verified";
  runnerVersion: string;
  executionEnvironmentHash: `0x${string}`;
  policyEngineHash: `0x${string}`;
  note: string;
};

export type ProofPanelData = {
  contractAddress: `0x${string}`;
  txHash: `0x${string}`;
  eventName: string;
  blockNumber?: number;
  traceRoot: `0x${string}`;
  storageURI: string;
  provider: ProviderStatus;
  explorerUrl?: string;
  verificationStatus: "verified" | "local-fallback" | "mismatch" | "pending";
};

export type TraceSegment = {
  id: string;
  label: string;
  summary: string;
  hash: `0x${string}`;
};

export type VerificationResult = {
  status: "valid" | "mismatch" | "invalid-json";
  computedRoot?: `0x${string}`;
  committedRoot?: `0x${string}`;
  diff: TamperDiff[];
  checkedAt: string;
};

export type TamperDiff = {
  path: string;
  expected: unknown;
  actual: unknown;
};

export type ProofPackage = {
  packageId: string;
  traceRoot: `0x${string}`;
  generatedAt: string;
  traceId: string;
  agentId: string;
  mandateId: string;
  violationId?: string;
  proof: ProofPanelData;
  attestation: Attestation;
  segmentHashes: TraceSegment[];
  verification: VerificationResult;
};
