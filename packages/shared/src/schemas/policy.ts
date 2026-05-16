import type { ActionType } from "./action.js";

export type PolicyClause = {
  clauseId: string;
  title: string;
  description: string;
  checkKey:
    | "maxAmount"
    | "targetAllowed"
    | "recipientBlocked"
    | "actionTypeAllowed"
    | "actionTypeForbidden"
    | "assetMatches";
  severity: "low" | "medium" | "high" | "critical";
};

export type MandateTemplate = {
  templateId: string;
  name: string;
  category: "dao_treasury" | "trading" | "dao_ops";
  summary: string;
  recommendedMaxAmount: string;
  allowedActionTypes: ActionType[];
  forbiddenActionTypes: ActionType[];
  policyClauses: PolicyClause[];
};
