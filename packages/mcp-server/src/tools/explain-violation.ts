import type { ProofPackage } from "@argus/shared";

const VIOLATION_AMOUNT = 1 << 0;
const VIOLATION_TARGET = 1 << 1;
const VIOLATION_RECIPIENT = 1 << 2;
const VIOLATION_ACTION_NOT_ALLOWED = 1 << 3;
const VIOLATION_ACTION_FORBIDDEN = 1 << 4;
const VIOLATION_ASSET = 1 << 5;

const VIOLATION_DESCRIPTIONS: Array<[number, string, string]> = [
  [VIOLATION_AMOUNT, "VIOLATION_AMOUNT", "Amount exceeded mandate maximum"],
  [VIOLATION_TARGET, "VIOLATION_TARGET", "Target not in allowed list"],
  [VIOLATION_RECIPIENT, "VIOLATION_RECIPIENT", "Recipient is blocked"],
  [VIOLATION_ACTION_NOT_ALLOWED, "VIOLATION_ACTION_NOT_ALLOWED", "Action type not in allowed list"],
  [VIOLATION_ACTION_FORBIDDEN, "VIOLATION_ACTION_FORBIDDEN", "Action type is explicitly forbidden"],
  [VIOLATION_ASSET, "VIOLATION_ASSET", "Asset does not match mandate"],
];

export const explainViolationTool = {
  name: "explain_violation",
  description: "Decode the violation information from a ProofPackage and return human-readable explanations.",
  inputSchema: {
    type: "object" as const,
    properties: {
      proof_json: {
        type: "string",
        description: "JSON string of the ProofPackage object",
      },
      violation_bitmap: {
        type: "number",
        description: "Optional raw violation bitmap integer to decode directly (overrides proof_json bitmap)",
      },
    },
    required: ["proof_json"],
  },
};

export function handleExplainViolation(args: Record<string, unknown>): string {
  const proofJson = args["proof_json"];
  if (typeof proofJson !== "string") {
    throw new Error("proof_json must be a string");
  }

  let pkg: ProofPackage;
  try {
    pkg = JSON.parse(proofJson) as ProofPackage;
  } catch {
    throw new Error("proof_json is not valid JSON");
  }

  const rawBitmap = args["violation_bitmap"];
  const bitmap = typeof rawBitmap === "number" ? rawBitmap : null;

  const activeViolations: Array<{ code: string; description: string }> = [];
  const allViolations = VIOLATION_DESCRIPTIONS.map(([bit, code, description]) => ({
    bit,
    code,
    description,
    active: bitmap !== null ? Boolean(bitmap & bit) : false,
  }));

  if (bitmap !== null) {
    for (const v of allViolations) {
      if (v.active) {
        activeViolations.push({ code: v.code, description: v.description });
      }
    }
  }

  return JSON.stringify({
    packageId: pkg.packageId,
    agentId: pkg.agentId,
    mandateId: pkg.mandateId,
    violationId: pkg.violationId ?? null,
    hasViolation: Boolean(pkg.violationId),
    bitmapDecoded: bitmap !== null,
    activeViolations: bitmap !== null ? activeViolations : null,
    violationReference: allViolations.map(({ bit, code, description }) => ({ bit, code, description })),
    evidenceStorageURI: pkg.proof.storageURI,
    onChainExplorerUrl: pkg.proof.explorerUrl ?? null,
    verificationStatus: pkg.verification.status,
  });
}
