import { readFileSync } from "node:fs";
import { traceRoot, tracePayloadForHash } from "@argus/shared";
import type { ArgusTrace } from "@argus/shared";

export function runHash(args: string[]): void {
  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: argus hash <file>");
    process.exit(1);
  }

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

  const payload = tracePayloadForHash(trace);
  const root = traceRoot(payload);
  console.log(root);
}
