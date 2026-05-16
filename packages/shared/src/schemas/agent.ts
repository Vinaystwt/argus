export type Agent = {
  id: string;
  owner: `0x${string}`;
  label: string;
  metadataURI: string;
  bondBalance: string;
  complianceScore: number;
  active: boolean;
  passportId?: string;
  role?: "treasury" | "watcher" | "ops" | "trading";
  availableForDelegation?: boolean;
  servedMandateTypes?: string[];
  reputationBadges?: string[];
  heartbeatStatus?: "online" | "watching" | "paused" | "offline";
  approvedCount?: number;
  rejectedCount?: number;
  slashCount?: number;
  scoreHistory?: Array<{ timestamp: string; score: number; label: string }>;
};
