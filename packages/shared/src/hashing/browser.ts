import { canonicalize } from "./canonicalize.js";
import { tracePayloadForHash } from "./traceRoot.js";
import type { ArgusTrace } from "../schemas/trace.js";
import type { VerificationResult } from "../schemas/proof.js";
import { diffTrace } from "./proof.js";

export async function sha256HexBrowser(value: unknown): Promise<`0x${string}`> {
  const encoded = new TextEncoder().encode(canonicalize(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return `0x${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function hashTraceBrowser(trace: ArgusTrace): Promise<`0x${string}`> {
  return sha256HexBrowser(tracePayloadForHash(trace));
}

export async function verifyTraceBrowser(trace: ArgusTrace, committedRoot = trace.proof.committedTraceRoot): Promise<VerificationResult> {
  const computedRoot = await hashTraceBrowser(trace);
  return {
    status: computedRoot === committedRoot ? "valid" : "mismatch",
    computedRoot,
    committedRoot,
    diff: [],
    checkedAt: new Date().toISOString()
  };
}

export function diffTracePayload(expected: ArgusTrace, actual: ArgusTrace) {
  return diffTrace(tracePayloadForHash(expected), tracePayloadForHash(actual));
}
