/**
 * Deploy Argus contracts to a configured 0G EVM network and write deployments/0g.json.
 * This script is live-only and will send transactions when executed.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, ContractFactory, ethers } from "ethers";
import {
  explorerAddress,
  explorerTx,
  loadEnvFiles,
  networkName,
  publicRpcLabel,
  requiredEnv
} from "./env.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
const force = args.includes("--force");

type DeploymentEntry = {
  name: string;
  address: string;
  txHash: string;
  blockNumber: number | null;
  explorerAddressUrl: string;
  explorerTxUrl: string;
};

type Artifact = {
  abi: unknown[];
  bytecode: { object: string } | string;
};

function artifact(name: string): Artifact {
  const file = join(REPO_ROOT, "contracts", "out", `${name}.sol`, `${name}.json`);
  return JSON.parse(readFileSync(file, "utf8")) as Artifact;
}

function bytecodeOf(artifactJson: Artifact) {
  const raw = typeof artifactJson.bytecode === "string" ? artifactJson.bytecode : artifactJson.bytecode.object;
  return raw.startsWith("0x") ? raw : `0x${raw}`;
}

async function deploy(
  name: string,
  signer: ethers.Wallet,
  explorerBaseUrl: string,
  args: unknown[] = [],
  artifactName = name
): Promise<{ contract: Contract; entry: DeploymentEntry }> {
  const compiled = artifact(artifactName);
  const factory = new ContractFactory(compiled.abi as ethers.InterfaceAbi, bytecodeOf(compiled), signer);
  const contract = (await factory.deploy(...args)) as Contract & {
    deploymentTransaction(): ethers.ContractTransactionResponse;
  };
  await contract.waitForDeployment();
  const tx = contract.deploymentTransaction();
  if (!tx) throw new Error(`${name} deployment transaction missing`);
  const receipt = await tx.wait();
  const address = await contract.getAddress();
  if (!ethers.isAddress(address) || address === ethers.ZeroAddress) {
    throw new Error(`${name} deployed to invalid address: ${address}`);
  }
  console.log(`  ${name}: ${address}`);
  return {
    contract: contract as Contract,
    entry: {
      name,
      address,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      explorerAddressUrl: explorerAddress(explorerBaseUrl, address),
      explorerTxUrl: explorerTx(explorerBaseUrl, tx.hash)
    }
  };
}

async function sendSetupTx(name: string, txPromise: Promise<ethers.ContractTransactionResponse>) {
  const tx = await txPromise;
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) throw new Error(`${name} failed: ${tx.hash}`);
  console.log(`  ${name}: ${tx.hash}`);
  return { txHash: tx.hash, blockNumber: receipt.blockNumber };
}

async function main() {
  console.log("\nArgus 0G Contract Deployment");
  console.log("============================");
  loadEnvFiles(REPO_ROOT);

  const rpcUrl = requiredEnv("OG_RPC_URL");
  const expectedChainId = requiredEnv("OG_CHAIN_ID");
  const explorerBaseUrl = requiredEnv("OG_EXPLORER_BASE_URL");
  const privateKey = requiredEnv("PRIVATE_KEY");
  const output = join(REPO_ROOT, "deployments", "0g.json");
  if (existsSync(output) && !force) {
    throw new Error("deployments/0g.json already exists. Pass --force only when intentionally replacing it.");
  }

  console.log("Compiling contracts...");
  execFileSync("forge", ["build"], { cwd: REPO_ROOT, stdio: "inherit" });

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  const actualChainId = network.chainId.toString();
  if (actualChainId !== expectedChainId) {
    throw new Error(`RPC chainId mismatch: got ${actualChainId}, expected ${expectedChainId}`);
  }
  const signer = new ethers.Wallet(privateKey, provider);
  console.log(`Network: ${networkName(actualChainId)} (${actualChainId}) via ${publicRpcLabel(rpcUrl)}`);
  console.log(`Deployer: ${signer.address}`);

  const deployments: DeploymentEntry[] = [];
  const contracts: Record<string, string> = {};
  async function add(name: string, deployArgs: unknown[] = [], artifactName = name) {
    const result = await deploy(name, signer, explorerBaseUrl, deployArgs, artifactName);
    deployments.push(result.entry);
    contracts[name] = result.entry.address;
    return result.contract;
  }

  console.log("\nDeploying stack...");
  const mockUsdc = await add("MockERC20", ["Mock USDC", "mUSDC", 6]);
  const mockUniswap = await add("MockUniswap", [], "MockAllowedTarget");
  const mockMorpho = await add("MockMorpho", [], "MockAllowedTarget");
  const mockTreasury = await add("MockTreasury", [signer.address]);
  const mandateRegistry = await add("MandateRegistry");
  const agentRegistry = await add("AgentRegistry");
  const bonding = await add("AgentBonding", [contracts["AgentRegistry"]]);
  const traceCommitment = await add("TraceCommitment");
  const actionGate = await add("ActionGate", [
    contracts["MandateRegistry"],
    contracts["AgentRegistry"],
    contracts["AgentBonding"],
    contracts["TraceCommitment"]
  ]);

  void mockUsdc;
  void mockUniswap;
  void mockMorpho;

  console.log("\nWiring permissions...");
  const setupTransactions = {
    AgentBonding_setActionGate: await sendSetupTx(
      "AgentBonding.setActionGate",
      bonding.getFunction("setActionGate")(contracts["ActionGate"])
    ),
    TraceCommitment_setActionGate: await sendSetupTx(
      "TraceCommitment.setActionGate",
      traceCommitment.getFunction("setActionGate")(contracts["ActionGate"])
    ),
    MockTreasury_setActionGate: await sendSetupTx(
      "MockTreasury.setActionGate",
      mockTreasury.getFunction("setActionGate")(contracts["ActionGate"])
    )
  };

  const bondingGate = await bonding.getFunction("actionGate")();
  const traceGate = await traceCommitment.getFunction("actionGate")();
  const treasuryGate = await mockTreasury.getFunction("actionGate")();
  if (bondingGate !== contracts["ActionGate"]) throw new Error("AgentBonding actionGate wiring mismatch");
  if (traceGate !== contracts["ActionGate"]) throw new Error("TraceCommitment actionGate wiring mismatch");
  if (treasuryGate !== contracts["ActionGate"]) throw new Error("MockTreasury actionGate wiring mismatch");

  mkdirSync(join(REPO_ROOT, "deployments"), { recursive: true });
  const artifactBody = {
    schemaVersion: "argus.deployment.v1",
    networkName: networkName(actualChainId),
    chainId: Number(actualChainId),
    rpcLabel: publicRpcLabel(rpcUrl),
    explorerBaseUrl,
    deployer: signer.address,
    deployedAt: new Date().toISOString(),
    contracts,
    deployments,
    setupTransactions: Object.fromEntries(
      Object.entries(setupTransactions).map(([key, value]) => [
        key,
        {
          ...value,
          explorerTxUrl: explorerTx(explorerBaseUrl, value.txHash)
        }
      ])
    )
  };
  writeFileSync(output, `${JSON.stringify(artifactBody, null, 2)}\n`, "utf8");
  console.log(`\nWrote deployments/0g.json`);
}

main().catch((error) => {
  console.error("Deployment failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
