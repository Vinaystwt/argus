const STORAGE_RECEIPTS = {
  networkName: "0G Mainnet",
  chainId: 16661,
  generatedAt: "2026-05-16T03:48:22.652Z",
  storageMode: "0g-storage",
  receipts: [
    {
      label: "compliant-trace",
      traceRoot: "0xb81c626b73f1395c60f75e86c1df2021b64e3b0aba85ff9b8b84db438da42c3b",
      provider: "0g",
      uri: "0g://0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740",
      root: "0x0d33a82d37fce005c7380c8cfb067d7a9eac77b63b88ab38bb76dadcd48fb740",
      size: 2982,
      uploadedAt: "2026-05-16T03:47:43.401Z",
      transactionHash: "0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331",
      explorerUrl: "https://storagescan.0g.ai/tx/0x4d9cb8d1506dc1bde43c7876d8e8b9058f108f2b4e82ec8932970648ad6c9331",
    },
    {
      label: "violation-trace",
      traceRoot: "0x39d2ef7a4248a73be210514d8600a238c2aea8b5dda8ad29544a79d162593cf6",
      provider: "0g",
      uri: "0g://0xc3893ee2e0589ea4d73e3a704252cbc0c172e2ed3e28524e3131052a3e895095",
      root: "0xc3893ee2e0589ea4d73e3a704252cbc0c172e2ed3e28524e3131052a3e895095",
      size: 3451,
      uploadedAt: "2026-05-16T03:48:11.997Z",
      transactionHash: "0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341",
      explorerUrl: "https://storagescan.0g.ai/tx/0xec898043d3b8985a992e49d9ffff9fc0e3109cbb88243e41e654be941fc75341",
    },
  ],
};

export const getStorageReceiptsTool = {
  name: "get_storage_receipts",
  description: "Get the 0G Storage upload receipts for Argus demo traces.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export function handleGetStorageReceipts(_args: Record<string, unknown>): string {
  return JSON.stringify(STORAGE_RECEIPTS);
}
