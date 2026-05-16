import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadEnvFiles(repoRoot: string): string[] {
  const loaded: string[] = [];
  for (const name of [".env", ".env.local"]) {
    const path = join(repoRoot, name);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const key = match[1]!;
      let value = match[2]!;
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    loaded.push(name);
  }
  return loaded;
}

export function publicRpcLabel(rpcUrl: string): string {
  try {
    const parsed = new URL(rpcUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "configured-rpc";
  }
}

export function explorerTx(baseUrl: string, txHash: string) {
  return `${baseUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

export function explorerAddress(baseUrl: string, address: string) {
  return `${baseUrl.replace(/\/$/, "")}/address/${address}`;
}

export function networkName(chainId: string | number | bigint) {
  const value = BigInt(chainId).toString();
  if (value === "16661") return "0G Mainnet";
  if (value === "16602") return "0G Galileo";
  return `0G-compatible chain ${value}`;
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
