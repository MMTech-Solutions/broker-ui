import type {
  CreateIbPlanInput,
  IbPlan,
  IbPlanListFilters,
  IbPlanProgram,
  IbPlanProgramsResponse,
  SyncIbPlanProgramsInput,
  UpdateIbPlanInput,
} from "@/features/ib-plan/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PLANS_PATH = "v1/admin/ib-plans";

export async function listIbPlans(
  filters: IbPlanListFilters = {},
): Promise<BrokerSuccessResponse<IbPlan[]>> {
  return browserBrokerRequest<IbPlan[]>(IB_PLANS_PATH, {
    searchParams: filters,
  });
}

export async function createIbPlan(
  input: CreateIbPlanInput,
): Promise<BrokerSuccessResponse<IbPlan>> {
  return browserBrokerRequest<IbPlan>(IB_PLANS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateIbPlan(
  ibPlanId: string,
  input: UpdateIbPlanInput,
): Promise<BrokerSuccessResponse<IbPlan>> {
  return browserBrokerRequest<IbPlan>(`${IB_PLANS_PATH}/${ibPlanId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteIbPlan(
  ibPlanId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${IB_PLANS_PATH}/${ibPlanId}`, {
    method: "DELETE",
  });
}

export async function listIbPlanPrograms(
  ibPlanId: string,
): Promise<BrokerSuccessResponse<IbPlanProgramsResponse>> {
  return browserBrokerRequest<IbPlanProgramsResponse>(
    `${IB_PLANS_PATH}/${ibPlanId}/programs`,
  );
}

export async function syncIbPlanPrograms(
  ibPlanId: string,
  input: SyncIbPlanProgramsInput,
): Promise<BrokerSuccessResponse<IbPlanProgram[]>> {
  return browserBrokerRequest<IbPlanProgram[]>(
    `${IB_PLANS_PATH}/${ibPlanId}/programs`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
