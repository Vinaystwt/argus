import { DEMO_ADDRESSES, type ActionProposal } from "@argus/shared";

export function compliantSwap(): ActionProposal {
  return {
    actionId: "action-compliant-swap-100-usdc",
    mandateId: "1",
    agentId: "1",
    actionType: "swap",
    target: DEMO_ADDRESSES.mockUniswap,
    recipient: DEMO_ADDRESSES.dao,
    asset: DEMO_ADDRESSES.mockUsdc,
    amount: "100000000",
    calldataPreview: "swap(address asset,uint256 amount,address recipient)",
    reason: "Rebalance 100 USDC through an explicitly allowed mock Uniswap target."
  };
}
