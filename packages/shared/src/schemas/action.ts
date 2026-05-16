export const ACTION_TYPES = [
  "rebalance",
  "repay",
  "swap",
  "external_transfer",
  "unknown_call",
  "governance_vote"
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export type ActionProposal = {
  actionId: string;
  mandateId: string;
  agentId: string;
  actionType: ActionType;
  target: `0x${string}`;
  recipient: `0x${string}`;
  asset: `0x${string}`;
  amount: string;
  calldataPreview: string;
  reason: string;
};
