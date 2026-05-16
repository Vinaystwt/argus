const ARGUS_CONTRACTS = {
  "0g-mainnet": {
    chainId: 16661,
    chainName: "0G Mainnet",
    explorerBaseUrl: "https://chainscan.0g.ai",
    contracts: {
      MandateRegistry: "0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9",
      AgentRegistry: "0x1699c6ae317F1f3DECaE37B806c174C4D3CAE26e",
      AgentBonding: "0x8aE5480D7fFAADb5f8Ef99246562a61Da30cf7E7",
      TraceCommitment: "0xdBB3d6e17b34C118BdFd9A73FaECA55C4E814B51",
      ActionGate: "0xE15DD1452a4d415d07447F0A912BF743F87320f8",
      MockERC20: "0x1850d2a31CB8669Ba757159B638DE19Af532ba5e",
      MockUniswap: "0x9db2e380f9100793ea71413224dD7C22F97aD91B",
      MockMorpho: "0x536b31435bFAE994169181AcA9BAadC784555b4B",
      MockTreasury: "0x6C6e9bC9cBd3f0A90D61E094b4997199B81A02d5",
    },
  },
} as const;

export const getContractsTool = {
  name: "get_argus_contracts",
  description: "Get deployed Argus contract addresses and explorer links for a given network.",
  inputSchema: {
    type: "object" as const,
    properties: {
      network: {
        type: "string",
        description: "Network name. Currently only '0g-mainnet' is supported.",
        default: "0g-mainnet",
      },
    },
    required: [],
  },
};

export function handleGetContracts(args: Record<string, unknown>): string {
  const network = (args["network"] as string | undefined) ?? "0g-mainnet";

  if (network !== "0g-mainnet") {
    throw new Error(`Unknown network "${network}". Available: 0g-mainnet`);
  }

  const data = ARGUS_CONTRACTS["0g-mainnet"];
  const enriched = Object.entries(data.contracts).map(([name, address]) => ({
    name,
    address,
    explorerUrl: `${data.explorerBaseUrl}/address/${address}`,
  }));

  return JSON.stringify({
    network,
    chainId: data.chainId,
    chainName: data.chainName,
    explorerBaseUrl: data.explorerBaseUrl,
    contracts: enriched,
  });
}
