/**
 * Argus 0G Preflight Check
 * Safe by default: loads local env files, never prints secrets, and exits 0
 * when env is missing unless live mode or --strict is requested.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";
import { loadEnvFiles, networkName, publicRpcLabel } from "./env.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
const force = args.includes("--force");
let strict = args.includes("--strict");
let minBalance = ethers.parseEther("1.5");
let failures = 0;
let warnings = 0;

function ok(msg: string): void {
  console.log(`  OK   ${msg}`);
}

function fail(msg: string): void {
  console.log(`  FAIL ${msg}`);
  failures++;
}

function warn(msg: string): void {
  console.log(`  WARN ${msg}`);
  warnings++;
}

function info(msg: string): void {
  console.log(`  INFO ${msg}`);
}

function checkEnv(name: string, required: boolean): string | undefined {
  const value = process.env[name];
  if (value) {
    ok(`${name}: set`);
    return value;
  }
  const message = `${name}: missing${required ? " (required for live deployment)" : " (optional)"}`;
  if (required && strict) fail(message);
  else warn(message);
  return undefined;
}

async function checkRpc(rpcUrl?: string, expectedChainId?: string) {
  if (!rpcUrl) {
    warn("RPC check skipped: OG_RPC_URL missing");
    return;
  }
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const actual = network.chainId.toString();
    if (expectedChainId && actual !== expectedChainId) {
      fail(`RPC chainId mismatch: got ${actual}, expected ${expectedChainId}`);
    } else {
      ok(`RPC reachable: ${publicRpcLabel(rpcUrl)} chainId ${actual} (${networkName(actual)})`);
    }
    return provider;
  } catch (error) {
    fail(`RPC unreachable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkWallet(privateKey: string | undefined, provider?: ethers.JsonRpcProvider) {
  if (!privateKey) {
    if (strict) fail("PRIVATE_KEY: missing (required for live deployment)");
    else warn("PRIVATE_KEY: missing (safe no-secret mode)");
    return;
  }
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    ok(`PRIVATE_KEY: valid signer, deployer ${wallet.address}`);
    if (provider) {
      const balance = await provider.getBalance(wallet.address);
      const formatted = ethers.formatEther(balance);
      if (balance < minBalance) {
        fail(
          `Deployer balance too low: ${formatted} 0G, recommended minimum ${ethers.formatEther(minBalance)} 0G`
        );
      } else {
        ok(`Deployer balance: ${formatted} 0G`);
      }
    }
  } catch (error) {
    fail(`PRIVATE_KEY: invalid signer (${error instanceof Error ? error.message : String(error)})`);
  }
}

function checkDeploymentPath() {
  const deploymentsDir = join(REPO_ROOT, "deployments");
  const output = join(deploymentsDir, "0g.json");
  mkdirSync(deploymentsDir, { recursive: true });
  const probe = join(deploymentsDir, ".argus-write-test");
  try {
    writeFileSync(probe, "ok", "utf8");
    unlinkSync(probe);
    ok("Deployment output path is writable");
  } catch (error) {
    fail(`Deployment output path is not writable: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (existsSync(output) && !force) {
    warn("deployments/0g.json already exists; deploy script will refuse overwrite unless --force is passed");
  } else if (existsSync(output)) {
    warn("deployments/0g.json exists and --force was provided");
  } else {
    ok("deployments/0g.json does not exist yet");
  }
}

function checkFoundryBuild() {
  try {
    execFileSync("forge", ["build"], { cwd: REPO_ROOT, stdio: "pipe" });
    ok("Foundry compile: forge build succeeded");
  } catch (error) {
    fail(`Foundry compile failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkDeploymentJsonShape(fileRequired: boolean) {
  const file = join(REPO_ROOT, "deployments", "0g.json");
  if (!existsSync(file)) {
    if (fileRequired) fail("Agent runner deployment JSON: deployments/0g.json missing");
    else warn("Agent runner deployment JSON: deployments/0g.json not present yet");
    return;
  }
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { contracts?: Record<string, string> };
    const contracts = parsed.contracts ?? {};
    const required = [
      "MockERC20",
      "MockUniswap",
      "MockMorpho",
      "MandateRegistry",
      "AgentRegistry",
      "AgentBonding",
      "TraceCommitment",
      "ActionGate"
    ];
    const missing = required.filter((name) => !ethers.isAddress(contracts[name] ?? ""));
    if (missing.length > 0) fail(`Deployment JSON missing valid addresses: ${missing.join(", ")}`);
    else ok("Deployment JSON shape contains all expected contract addresses");
  } catch (error) {
    fail(`Deployment JSON parse failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkFrontendDemoDataShape() {
  const file = join(REPO_ROOT, "apps", "web", "public", "demo-data.json");
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    const okShape = Boolean(data["deployment"] && data["traces"] && data["proofPackages"] && data["providerStatus"]);
    if (okShape) ok("Frontend demo-data shape is readable");
    else fail("Frontend demo-data shape is missing deployment/traces/proofPackages/providerStatus");
  } catch (error) {
    fail(`Frontend demo-data parse failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkStorageMode() {
  const mode = process.env["ARGUS_STORAGE_MODE"] ?? "local-fallback";
  if (mode !== "local-fallback" && mode !== "0g") {
    fail(`ARGUS_STORAGE_MODE must be "local-fallback" or "0g", got "${mode}"`);
    return;
  }
  ok(`Storage mode: ${mode}`);
  if (mode === "0g") {
    const enabled = process.env["OG_STORAGE_ENABLED"];
    const indexer = process.env["OG_STORAGE_INDEXER"];
    const privateKey = process.env["OG_STORAGE_PRIVATE_KEY"] || process.env["PRIVATE_KEY"];
    if (enabled !== "1") fail("OG_STORAGE_ENABLED=1 is required when ARGUS_STORAGE_MODE=0g");
    else ok("OG_STORAGE_ENABLED=1");
    if (!indexer) fail("OG_STORAGE_INDEXER is required when ARGUS_STORAGE_MODE=0g");
    else ok("OG_STORAGE_INDEXER: set");
    if (!privateKey) fail("Storage signer missing: set OG_STORAGE_PRIVATE_KEY or PRIVATE_KEY");
    else ok(`Storage signer: ${process.env["OG_STORAGE_PRIVATE_KEY"] ? "OG_STORAGE_PRIVATE_KEY" : "PRIVATE_KEY"} present`);
  } else {
    ok("Local storage fallback remains explicitly labeled as fallback");
  }
}

async function main() {
  console.log("\nArgus 0G Preflight");
  console.log("==================");
  const loaded = loadEnvFiles(REPO_ROOT);
  strict = strict || process.env["DEPLOYMENT_MODE"] === "0g";
  minBalance = ethers.parseEther(process.env["ARGUS_MIN_DEPLOYER_BALANCE"] ?? "1.5");
  info(`Loaded env files: ${loaded.length ? loaded.join(", ") : "none"}`);
  info(`Mode: ${strict ? "strict/live-intent" : "safe no-secret readiness"}`);

  console.log("\nEnvironment");
  const rpcUrl = checkEnv("OG_RPC_URL", true);
  const chainId = checkEnv("OG_CHAIN_ID", true);
  checkEnv("OG_EXPLORER_BASE_URL", true);
  const deploymentMode = checkEnv("DEPLOYMENT_MODE", true);
  checkEnv("ARGUS_CHAIN_MODE", false);
  if (deploymentMode && deploymentMode !== "0g") warn(`DEPLOYMENT_MODE is "${deploymentMode}", expected "0g" for live deploy`);

  console.log("\nNetwork");
  const provider = await checkRpc(rpcUrl, chainId);

  console.log("\nWallet");
  await checkWallet(process.env["PRIVATE_KEY"], provider);

  console.log("\nArtifacts");
  checkDeploymentPath();
  checkDeploymentJsonShape(false);
  checkFrontendDemoDataShape();

  console.log("\nBuild");
  checkFoundryBuild();

  console.log("\nStorage");
  checkStorageMode();

  console.log("\nSummary");
  if (failures > 0) {
    console.log(`Status: NOT READY (${failures} failure${failures === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"})`);
    if (strict) process.exit(1);
  } else {
    console.log(`Status: READY (${warnings} warning${warnings === 1 ? "" : "s"})`);
  }
}

main().catch((error) => {
  console.error("Preflight script error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
