import type { ProofPackage } from "@argus/shared";

export const inspectProofTool = {
  name: "inspect_proof_package",
  description: "Parse an Argus ProofPackage JSON and return a structured summary of all fields.",
  inputSchema: {
    type: "object" as const,
    properties: {
      package_json: {
        type: "string",
        description: "JSON string of the ProofPackage object",
      },
    },
    required: ["package_json"],
  },
};

export function handleInspectProof(args: Record<string, unknown>): string {
  const packageJson = args["package_json"];
  if (typeof packageJson !== "string") {
    throw new Error("package_json must be a string");
  }

  let pkg: ProofPackage;
  try {
    pkg = JSON.parse(packageJson) as ProofPackage;
  } catch {
    throw new Error("package_json is not valid JSON");
  }

  return JSON.stringify({
    packageId: pkg.packageId,
    traceId: pkg.traceId,
    agentId: pkg.agentId,
    mandateId: pkg.mandateId,
    traceRoot: pkg.traceRoot,
    generatedAt: pkg.generatedAt,
    violationId: pkg.violationId ?? null,
    verification: {
      status: pkg.verification.status,
      computedRoot: pkg.verification.computedRoot,
      committedRoot: pkg.verification.committedRoot,
      checkedAt: pkg.verification.checkedAt,
    },
    attestation: {
      provider: pkg.attestation.provider,
      mode: pkg.attestation.mode,
      runnerVersion: pkg.attestation.runnerVersion,
    },
    segmentHashes: pkg.segmentHashes.map((s) => ({
      id: s.id,
      label: s.label,
      summary: s.summary,
      hash: s.hash,
    })),
    proof: {
      txHash: pkg.proof.txHash,
      contractAddress: pkg.proof.contractAddress,
      eventName: pkg.proof.eventName,
      blockNumber: pkg.proof.blockNumber,
      storageURI: pkg.proof.storageURI,
      explorerUrl: pkg.proof.explorerUrl,
      verificationStatus: pkg.proof.verificationStatus,
    },
  });
}
