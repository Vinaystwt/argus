import { verifyTrace } from "@argus/shared";
import type { ArgusTrace } from "@argus/shared";

export const verifyTraceTool = {
  name: "verify_trace",
  description: "Verify an Argus trace JSON against a committed root. Returns status (valid/mismatch), computed root, and diff.",
  inputSchema: {
    type: "object" as const,
    properties: {
      trace_json: {
        type: "string",
        description: "JSON string of the ArgusTrace object",
      },
      committed_root: {
        type: "string",
        description: "The committed 0x-prefixed hex trace root to verify against. If omitted, uses the root embedded in the trace.",
      },
    },
    required: ["trace_json"],
  },
};

export function handleVerifyTrace(args: Record<string, unknown>): string {
  const traceJson = args["trace_json"];
  if (typeof traceJson !== "string") {
    throw new Error("trace_json must be a string");
  }

  const committedRoot = args["committed_root"] as `0x${string}` | undefined;

  let trace: ArgusTrace;
  try {
    trace = JSON.parse(traceJson) as ArgusTrace;
  } catch {
    throw new Error("trace_json is not valid JSON");
  }

  const result = verifyTrace(trace, committedRoot);
  return JSON.stringify({
    valid: result.status === "valid",
    status: result.status,
    computedRoot: result.computedRoot,
    committedRoot: result.committedRoot,
    diff: result.diff,
    checkedAt: result.checkedAt,
  });
}
