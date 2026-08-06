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

function appendIbPlanFormData(
  formData: FormData,
  input: CreateIbPlanInput | UpdateIbPlanInput,
): void {
  if (input.name !== undefined) {
    formData.append("name", input.name);
  }

  if (input.description !== undefined) {
    formData.append("description", input.description);
  }

  if (input.subscription_type !== undefined) {
    formData.append("subscription_type", input.subscription_type);
  }

  if (input.is_active !== undefined) {
    formData.append("is_active", input.is_active ? "1" : "0");
  }

  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  if ("remove_image" in input && input.remove_image) {
    formData.append("remove_image", "1");
  }
}

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
  const formData = new FormData();
  appendIbPlanFormData(formData, input);

  return browserBrokerRequest<IbPlan>(IB_PLANS_PATH, {
    method: "POST",
    body: formData,
  });
}

export async function updateIbPlan(
  ibPlanId: string,
  input: UpdateIbPlanInput,
): Promise<BrokerSuccessResponse<IbPlan>> {
  const formData = new FormData();
  appendIbPlanFormData(formData, input);

  return browserBrokerRequest<IbPlan>(`${IB_PLANS_PATH}/${ibPlanId}`, {
    method: "PATCH",
    body: formData,
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
