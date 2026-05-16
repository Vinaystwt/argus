import { readFileSync } from "node:fs";
import type { ProofPackage } from "@argus/shared";

const VIOLATION_AMOUNT = 1 << 0;
const VIOLATION_TARGET = 1 << 1;
const VIOLATION_RECIPIENT = 1 << 2;
const VIOLATION_ACTION_NOT_ALLOWED = 1 << 3;
const VIOLATION_ACTION_FORBIDDEN = 1 << 4;
const VIOLATION_ASSET = 1 << 5;

const VIOLATION_DESCRIPTIONS: Array<[number, string]> = [
  [VIOLATION_AMOUNT, "Amount exceeded mandate maximum"],
  [VIOLATION_TARGET, "Target not in allowed list"],
  [VIOLATION_RECIPIENT, "Recipient is blocked"],
  [VIOLATION_ACTION_NOT_ALLOWED, "Action type not in allowed list"],
  [VIOLATION_ACTION_FORBIDDEN, "Action type is explicitly forbidden"],
  [VIOLATION_ASSET, "Asset does not match mandate"],
];

function explainBitmap(bitmap: number): string[] {
  const explanations: string[] = [];
  for (const [bit, description] of VIOLATION_DESCRIPTIONS) {
    if (bitmap & bit) {
      explanations.push(description);
    }
  }
  return explanations;
}

export function runExplain(args: string[]): void {
  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: argus explain <file>");
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

  console.log(`=== Violation Explanation for ${pkg.packageId} ===`);
  console.log(`Agent:    ${pkg.agentId}`);
  console.log(`Mandate:  ${pkg.mandateId}`);
  console.log(`Trace:    ${pkg.traceId}`);
  console.log("");

  // Try violationId field
  if (!pkg.violationId) {
    console.log("No violation recorded in this proof package.");
    return;
  }

  console.log(`Violation ID: ${pkg.violationId}`);
  console.log(`Verification: ${pkg.verification.status}`);
  console.log("");

  // The ProofPackage doesn't carry a raw bitmap — look in the proof panel data
  // for storage URI which points to the full trace. We display what we can from
  // the package itself.
  console.log("This proof package records that the agent violated its mandate.");
  console.log("To view exact violation codes, run: argus inspect <file>");
  console.log("");
  console.log("Possible violation types:");
  for (const [, description] of VIOLATION_DESCRIPTIONS) {
    console.log(`  • ${description}`);
  }
  console.log("");
  console.log(`Full evidence stored at: ${pkg.proof.storageURI}`);
  if (pkg.proof.explorerUrl) {
    console.log(`On-chain record:         ${pkg.proof.explorerUrl}`);
  }
}
