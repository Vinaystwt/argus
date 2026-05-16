import type { ActionType } from "./action.js";
import type { PolicyClause } from "./policy.js";

export type Mandate = {
  id: string;
  chainId?: number;
  dao: `0x${string}`;
  name: string;
  asset: `0x${string}`;
  maxAmount: string;
  allowedTargets: `0x${string}`[];
  blockedRecipients: `0x${string}`[];
  allowedActionTypes: ActionType[];
  forbiddenActionTypes: ActionType[];
  active: boolean;
  templateId?: string;
  policyHash?: `0x${string}`;
  clauses?: PolicyClause[];
  lifecycleStatus?: "draft" | "active" | "paused" | "superseded";
  linkedAgentIds?: string[];
  violationStats?: {
    total: number;
    slashed: number;
    challenged: number;
  };
  createdTxHash?: `0x${string}`;
};
