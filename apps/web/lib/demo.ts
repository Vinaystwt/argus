import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Agent, ArgusTrace, DemoReceipt, Mandate, ProofPackage, Violation } from "@argus/shared";
export { compactHash, formatUsdc, formatEth, normalizeStorageURI } from "./format";

let cached: DemoReceipt | null = null;

export function getDemoData(): DemoReceipt {
  if (cached) return cached;
  const path = join(process.cwd(), "public", "demo-data.json");
  cached = JSON.parse(readFileSync(path, "utf8")) as DemoReceipt;
  return cached;
}

export function getAgents(): Agent[] {
  return getDemoData().agents ?? [getDemoData().agent];
}

export function getMandates(): Mandate[] {
  return getDemoData().mandates ?? [getDemoData().mandate];
}

export function getTraceByRoot(root: string): ArgusTrace | undefined {
  return getDemoData().traces.find((trace) => trace.proof.committedTraceRoot === root || trace.traceId === root);
}

export function getAgent(id: string): Agent | undefined {
  return getAgents().find((agent) => agent.id === id || agent.passportId === id);
}

export function getMandate(id: string): Mandate | undefined {
  return getMandates().find((mandate) => mandate.id === id || mandate.policyHash === id);
}

export function getViolation(id: string): Violation | undefined {
  return getDemoData().violations?.find((violation) => violation.violationId === id || violation.traceRoot === id);
}

export function getProofPackage(root: string): ProofPackage | undefined {
  return getDemoData().proofPackages?.find((pkg) => pkg.traceRoot === root || pkg.packageId === root);
}

export function traceRiskLabel(trace: ArgusTrace) {
  return trace.policyCheck.verdict === "APPROVED" ? "Mandate satisfied" : "Violation sealed";
}
