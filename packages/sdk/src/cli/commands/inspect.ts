import { readFileSync } from "node:fs";
import type { ProofPackage } from "@argus/shared";

export function runInspect(args: string[]): void {
  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: argus inspect <file>");
    process.exit(1);
  }

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Error: cannot read file: ${filePath}`);
    process.exit(1);
  }

  let pkg: ProofPackage;
  try {
    pkg = JSON.parse(raw) as ProofPackage;
  } catch {
    console.error("Error: file is not valid JSON");
    process.exit(1);
  }

  console.log("=== Argus Proof Package ===");
  console.log(`Package ID:      ${pkg.packageId}`);
  console.log(`Trace ID:        ${pkg.traceId}`);
  console.log(`Agent ID:        ${pkg.agentId}`);
  console.log(`Mandate ID:      ${pkg.mandateId}`);
  console.log(`Trace Root:      ${pkg.traceRoot}`);
  console.log(`Generated:       ${pkg.generatedAt}`);
  console.log(`Violation ID:    ${pkg.violationId ?? "none"}`);
  console.log("");
  console.log("=== Verification ===");
  console.log(`Status:          ${pkg.verification.status}`);
  console.log(`Computed Root:   ${pkg.verification.computedRoot ?? "—"}`);
  console.log(`Committed Root:  ${pkg.verification.committedRoot ?? "—"}`);
  console.log(`Checked At:      ${pkg.verification.checkedAt}`);
  console.log("");
  console.log("=== Attestation ===");
  console.log(`Provider:        ${pkg.attestation.provider}`);
  console.log(`Mode:            ${pkg.attestation.mode}`);
  console.log(`Runner Version:  ${pkg.attestation.runnerVersion}`);
  console.log("");
  console.log("=== Segment Hashes ===");
  for (const seg of pkg.segmentHashes) {
    console.log(`  ${seg.label.padEnd(20)} ${seg.hash}`);
  }
  console.log("");
  console.log("=== On-Chain Proof ===");
  console.log(`Tx Hash:         ${pkg.proof.txHash}`);
  console.log(`Contract:        ${pkg.proof.contractAddress}`);
  console.log(`Event:           ${pkg.proof.eventName}`);
  console.log(`Storage URI:     ${pkg.proof.storageURI}`);
  if (pkg.proof.explorerUrl) {
    console.log(`Explorer:        ${pkg.proof.explorerUrl}`);
  }
}
