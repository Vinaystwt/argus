import type { ActionProposal, Mandate, PolicyVerdict } from "@argus/shared";

export function evaluateProposal(proposal: ActionProposal, mandate: Mandate): PolicyVerdict {
  const violations: string[] = [];
  const checks = {
    maxAmount: Number(proposal.amount) <= Number(mandate.maxAmount) ? "pass" : "fail",
    targetAllowed: mandate.allowedTargets.includes(proposal.target) ? "pass" : "fail",
    recipientBlocked: mandate.blockedRecipients.includes(proposal.recipient) ? "fail" : "pass",
    actionTypeAllowed: mandate.allowedActionTypes.includes(proposal.actionType) ? "pass" : "fail",
    actionTypeForbidden: mandate.forbiddenActionTypes.includes(proposal.actionType) ? "fail" : "pass",
    assetMatches: proposal.asset === mandate.asset ? "pass" : "fail"
  } as const;

  if (checks.maxAmount === "fail") violations.push("AMOUNT_EXCEEDS_MANDATE");
  if (checks.targetAllowed === "fail") violations.push("TARGET_NOT_ALLOWED");
  if (checks.recipientBlocked === "fail") violations.push("RECIPIENT_BLOCKED");
  if (checks.actionTypeAllowed === "fail") violations.push("ACTION_TYPE_NOT_ALLOWED");
  if (checks.actionTypeForbidden === "fail") violations.push("ACTION_TYPE_FORBIDDEN");
  if (checks.assetMatches === "fail") violations.push("ASSET_MISMATCH");

  return {
    verdict: violations.length === 0 ? "APPROVED" : "REJECTED",
    checks,
    violationCodes: violations
  };
}
