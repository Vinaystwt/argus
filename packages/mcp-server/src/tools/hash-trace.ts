import { traceRoot, tracePayloadForHash } from "@argus/shared";
import type { ArgusTrace } from "@argus/shared";

export const hashTraceTool = {
  name: "hash_trace",
  description: "Compute the SHA-256 trace root of an Argus trace JSON string. Returns the 0x-prefixed hex root.",
  inputSchema: {
    type: "object" as const,
    properties: {
      trace_json: {
        type: "string",
        description: "JSON string of the ArgusTrace object",
      },
    },
    required: ["trace_json"],
  },
};

export function handleHashTrace(args: Record<string, unknown>): string {
  const traceJson = args["trace_json"];
  if (typeof traceJson !== "string") {
    throw new Error("trace_json must be a string");
  }

  let trace: ArgusTrace;
  try {
    trace = JSON.parse(traceJson) as ArgusTrace;
  } catch {
    throw new Error("trace_json is not valid JSON");
  }

  const payload = tracePayloadForHash(trace);
  const root = traceRoot(payload);
  return JSON.stringify({ root });
}
