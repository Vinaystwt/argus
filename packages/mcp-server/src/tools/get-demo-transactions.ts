const DEMO_TRANSACTIONS = {
  networkName: "0G Mainnet",
  chainId: 16661,
  generatedAt: "2026-05-16T03:48:22.652Z",
  transactions: {
    createMandate: {
      txHash: "0x0f926575b63b1f5900ba5145a895cef2ea964f65ff9982d5504c0d7cedfc304a",
      blockNumber: 33384626,
      eventNames: ["MandateCreated"],
      explorerUrl: "https://chainscan.0g.ai/tx/0x0f926575b63b1f5900ba5145a895cef2ea964f65ff9982d5504c0d7cedfc304a",
    },
    registerAgent: {
      txHash: "0x05ee08d463fd756d87809ec1b22aa1d7cbd41fc90ad45c279d9c63a3abcf5a96",
      blockNumber: 33384638,
      eventNames: ["AgentRegistered"],
      explorerUrl: "https://chainscan.0g.ai/tx/0x05ee08d463fd756d87809ec1b22aa1d7cbd41fc90ad45c279d9c63a3abcf5a96",
    },
    postBond: {
      txHash: "0x6d4e90030a7802674b431d4626eb36c28f2390a12eb7f8991001c29edc4a58d3",
      blockNumber: 33384650,
      eventNames: ["BondPosted"],
      explorerUrl: "https://chainscan.0g.ai/tx/0x6d4e90030a7802674b431d4626eb36c28f2390a12eb7f8991001c29edc4a58d3",
    },
    compliantAction: {
      txHash: "0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58",
      blockNumber: 33384683,
      eventNames: ["ActionApproved", "TraceCommitted", "ComplianceScoreUpdated"],
      explorerUrl: "https://chainscan.0g.ai/tx/0xaa205f208bcf63040571ec474acfb40d05536d340031ebf0d2cfb9e609041a58",
    },
    maliciousAction: {
      txHash: "0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a",
      blockNumber: 33384716,
      eventNames: ["ActionRejected", "AgentSlashed", "TraceCommitted", "ComplianceScoreUpdated"],
      explorerUrl: "https://chainscan.0g.ai/tx/0x2030587c4280385e3d366eac77a292620b5eac2ac56116325f37436ce972408a",
    },
  },
};

export const getDemoTransactionsTool = {
  name: "get_demo_transactions",
  description: "Get the live Argus demo transaction hashes and explorer links on 0G Mainnet.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export function handleGetDemoTransactions(_args: Record<string, unknown>): string {
  return JSON.stringify(DEMO_TRANSACTIONS);
}
