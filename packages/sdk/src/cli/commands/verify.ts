import { readFileSync } from "node:fs";
import { verifyTrace } from "@argus/shared";
import type { ArgusTrace } from "@argus/shared";

export function runVerify(args: string[], flags: Record<string, string>): void {
  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: argus verify <file> --root <hex>");
    process.exit(1);
  }

  const committedRoot = flags["root"] as `0x${string}` | undefined;

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Error: cannot read file: ${filePath}`);
    process.exit(1);
  }

  let trace: ArgusTrace;
  try {
    trace = JSON.parse(raw) as ArgusTrace;
  } catch {
    console.error("Error: file is not valid JSON");
    process.exit(1);
  }

  const result = verifyTrace(trace, committedRoot);

  if (result.status === "valid") {
    console.log(`✓ VALID — trace root matches committed root`);
    console.log(`  root: ${result.computedRoot}`);
  } else {
    console.log(`✗ MISMATCH — trace has been tampered`);
    console.log(`  computed:  ${result.computedRoot}`);
    console.log(`  committed: ${result.committedRoot}`);
  }
  console.log(`  checked:   ${result.checkedAt}`);
}
