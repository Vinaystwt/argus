import { ARGUS_CONTRACTS } from "../../contracts.js";

export function runContracts(flags: Record<string, string>): void {
  const network = flags["network"] ?? "0g-mainnet";

  if (network !== "0g-mainnet") {
    console.error(`Error: unknown network "${network}". Available: 0g-mainnet`);
    process.exit(1);
  }

  const data = ARGUS_CONTRACTS["0g-mainnet"];
  console.log(`=== Argus Contracts on ${data.chainName} (chainId: ${data.chainId}) ===`);
  console.log(`Explorer: ${data.explorerBaseUrl}`);
  console.log("");

  const entries = Object.entries(data.contracts) as [string, string][];
  for (const [name, address] of entries) {
    console.log(`${name.padEnd(20)} ${address}`);
    console.log(`${"".padEnd(20)} ${data.explorerBaseUrl}/address/${address}`);
    console.log("");
  }
}
