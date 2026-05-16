import { createHash } from "node:crypto";
import { canonicalize } from "./canonicalize.js";

export function traceRoot(input: unknown): `0x${string}` {
  const canonical = canonicalize(input);
  return `0x${createHash("sha256").update(canonical).digest("hex")}`;
}

export function tracePayloadForHash<T extends { proof?: unknown }>(trace: T): Omit<T, "proof"> {
  const { proof: _proof, ...rest } = trace;
  return rest;
}
