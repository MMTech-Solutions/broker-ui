import type {
  CreateIbProgramCpaRuleInput,
  CreateIbProgramPnlRuleInput,
  CreateIbProgramVolumeRuleInput,
  IbProgramCpaRule,
  IbProgramPaymentRuleListFilters,
  IbProgramPnlRule,
  IbProgramVolumeRule,
  UpdateIbProgramCpaRuleInput,
  UpdateIbProgramPnlRuleInput,
  UpdateIbProgramVolumeRuleInput,
} from "@/features/ib-program-payment-rule/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const ibProgramPath = (ibProgramId: string) =>
  `v1/admin/ib-programs/${ibProgramId}`;

export async function listIbProgramVolumeRules(
  ibProgramId: string,
  filters: IbProgramPaymentRuleListFilters = {},
): Promise<BrokerSuccessResponse<IbProgramVolumeRule[]>> {
  return browserBrokerRequest<IbProgramVolumeRule[]>(
    `${ibProgramPath(ibProgramId)}/volume-payment-rules`,
    { searchParams: filters },
  );
}

export async function createIbProgramVolumeRule(
  ibProgramId: string,
  input: CreateIbProgramVolumeRuleInput,
): Promise<BrokerSuccessResponse<IbProgramVolumeRule>> {
  return browserBrokerRequest<IbProgramVolumeRule>(
    `${ibProgramPath(ibProgramId)}/volume-payment-rules`,
    { method: "POST", body: input },
  );
}

export async function updateIbProgramVolumeRule(
  ibProgramId: string,
  ruleId: string,
  input: UpdateIbProgramVolumeRuleInput,
): Promise<BrokerSuccessResponse<IbProgramVolumeRule>> {
  return browserBrokerRequest<IbProgramVolumeRule>(
    `${ibProgramPath(ibProgramId)}/volume-payment-rules/${ruleId}`,
    { method: "PATCH", body: input },
  );
}

export async function listIbProgramPnlRules(
  ibProgramId: string,
  filters: IbProgramPaymentRuleListFilters = {},
): Promise<BrokerSuccessResponse<IbProgramPnlRule[]>> {
  return browserBrokerRequest<IbProgramPnlRule[]>(
    `${ibProgramPath(ibProgramId)}/pnl-payment-rules`,
    { searchParams: filters },
  );
}

export async function createIbProgramPnlRule(
  ibProgramId: string,
  input: CreateIbProgramPnlRuleInput,
): Promise<BrokerSuccessResponse<IbProgramPnlRule>> {
  return browserBrokerRequest<IbProgramPnlRule>(
    `${ibProgramPath(ibProgramId)}/pnl-payment-rules`,
    { method: "POST", body: input },
  );
}

export async function updateIbProgramPnlRule(
  ibProgramId: string,
  ruleId: string,
  input: UpdateIbProgramPnlRuleInput,
): Promise<BrokerSuccessResponse<IbProgramPnlRule>> {
  return browserBrokerRequest<IbProgramPnlRule>(
    `${ibProgramPath(ibProgramId)}/pnl-payment-rules/${ruleId}`,
    { method: "PATCH", body: input },
  );
}

export async function listIbProgramCpaRules(
  ibProgramId: string,
  filters: IbProgramPaymentRuleListFilters = {},
): Promise<BrokerSuccessResponse<IbProgramCpaRule[]>> {
  return browserBrokerRequest<IbProgramCpaRule[]>(
    `${ibProgramPath(ibProgramId)}/cpa-payment-rules`,
    { searchParams: filters },
  );
}

export async function createIbProgramCpaRule(
  ibProgramId: string,
  input: CreateIbProgramCpaRuleInput,
): Promise<BrokerSuccessResponse<IbProgramCpaRule>> {
  return browserBrokerRequest<IbProgramCpaRule>(
    `${ibProgramPath(ibProgramId)}/cpa-payment-rules`,
    { method: "POST", body: input },
  );
}

export async function updateIbProgramCpaRule(
  ibProgramId: string,
  ruleId: string,
  input: UpdateIbProgramCpaRuleInput,
): Promise<BrokerSuccessResponse<IbProgramCpaRule>> {
  return browserBrokerRequest<IbProgramCpaRule>(
    `${ibProgramPath(ibProgramId)}/cpa-payment-rules/${ruleId}`,
    { method: "PATCH", body: input },
  );
}
