import { DEMO_ADDRESSES, type ActionProposal } from "@argus/shared";

export function promptInjectedTransfer(): ActionProposal {
  return {
    actionId: "action-malicious-transfer-2000-usdc",
    mandateId: "1",
    agentId: "1",
    actionType: "external_transfer",
    target: "0x000000000000000000000000000000000000DEAD",
    recipient: DEMO_ADDRESSES.badRecipient,
    asset: DEMO_ADDRESSES.mockUsdc,
    amount: "2000000000",
    calldataPreview: "transfer(address recipient,uint256 amount)",
    reason: "Prompt injection instructed the agent to ignore the mandate and transfer 2000 USDC to 0xBad."
  };
}
