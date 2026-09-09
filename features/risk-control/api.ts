import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { CreateRiskControlRuleInput, RiskControlActionCatalogItem, RiskControlExecution, RiskControlKpi, RiskControlRule, RiskControlSurface, UpdateRiskControlIdentityInput } from "@/features/risk-control/types";

function prefix(surface: RiskControlSurface): string {
  return surface === "admin" ? "v1/admin" : "v1";
}

export async function loadRiskControlCatalog(surface: RiskControlSurface) {
  const base = `${prefix(surface)}/risk-control`;
  const [kpis, actions] = await Promise.all([
    browserBrokerRequest<RiskControlKpi[]>(`${base}/kpis`),
    browserBrokerRequest<RiskControlActionCatalogItem[]>(`${base}/actions`),
  ]);
  return { kpis: kpis.data, actions: actions.data };
}

export function listRiskControlRules(surface: RiskControlSurface, accountId: string, params: Record<string, string | number | boolean>): Promise<BrokerSuccessResponse<RiskControlRule[]>> {
  return browserBrokerRequest<RiskControlRule[]>(`${prefix(surface)}/accounts/${accountId}/risk-control/rules`, { searchParams: params });
}

export function listRiskControlExecutions(surface: RiskControlSurface, accountId: string, ruleId: string, page = 1): Promise<BrokerSuccessResponse<RiskControlExecution[]>> {
  return browserBrokerRequest<RiskControlExecution[]>(`${prefix(surface)}/accounts/${accountId}/risk-control/rules/${ruleId}/executions`, { searchParams: { page, per_page: 20 } });
}

export function createRiskControlRule(accountId: string, input: CreateRiskControlRuleInput): Promise<BrokerSuccessResponse<RiskControlRule>> {
  return browserBrokerRequest<RiskControlRule>(`v1/accounts/${accountId}/risk-control/rules`, { method: "POST", body: input });
}

export function updateRiskControlIdentity(accountId: string, ruleId: string, input: UpdateRiskControlIdentityInput): Promise<BrokerSuccessResponse<RiskControlRule>> {
  return browserBrokerRequest<RiskControlRule>(`v1/accounts/${accountId}/risk-control/rules/${ruleId}`, { method: "PATCH", body: input });
}

export function archiveRiskControlRule(accountId: string, ruleId: string): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`v1/accounts/${accountId}/risk-control/rules/${ruleId}`, { method: "DELETE" });
}
