export type CheckStatus = "pass" | "fail";

export type PolicyVerdict = {
  verdict: "APPROVED" | "REJECTED";
  checks: {
    maxAmount: CheckStatus;
    targetAllowed: CheckStatus;
    recipientBlocked: CheckStatus;
    actionTypeAllowed: CheckStatus;
    actionTypeForbidden: CheckStatus;
    assetMatches: CheckStatus;
  };
  violationCodes: string[];
};
