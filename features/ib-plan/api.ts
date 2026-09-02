import type {
  CreateIbPlanInput,
  IbDemoCatalog,
  IbPlan,
  IbPlanListFilters,
  IbPlanProgram,
  IbPlanProgramsResponse,
  SyncIbPlanProgramsInput,
  UpdateIbPlanInput,
} from "@/features/ib-plan/types";
import { ibPlanImageUrl } from "@/features/ib-plan/image";
import { ibProgramImageUrl } from "@/features/ib-program/image";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PLANS_PATH = "v1/admin/ib-plans";

function withProxyProgramImage<T extends { id: string; image_path?: string | null }>(
  program: T,
): T {
  return {
    ...program,
    image_path: ibProgramImageUrl(program.id, program.image_path),
  };
}

function withProxyPlanImage(plan: IbPlan): IbPlan {
  return {
    ...plan,
    image_path: ibPlanImageUrl(plan.id, plan.image_path),
  };
}

function withProxyPlanProgramAssignment(assignment: IbPlanProgram): IbPlanProgram {
  return {
    ...assignment,
    program: withProxyProgramImage(assignment.program),
  };
}

function mapIbPlanResponse(
  response: BrokerSuccessResponse<IbPlan>,
): BrokerSuccessResponse<IbPlan> {
  return {
    ...response,
    data: withProxyPlanImage(response.data),
  };
}

function mapIbPlansResponse(
  response: BrokerSuccessResponse<IbPlan[]>,
): BrokerSuccessResponse<IbPlan[]> {
  return {
    ...response,
    data: response.data.map(withProxyPlanImage),
  };
}

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

  if (input.form_template_id !== undefined) {
    formData.append("form_template_id", input.form_template_id ?? "");
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
  const response = await browserBrokerRequest<IbPlan[]>(IB_PLANS_PATH, {
    searchParams: filters,
  });

  return mapIbPlansResponse(response);
}

export async function createIbPlan(
  input: CreateIbPlanInput,
): Promise<BrokerSuccessResponse<IbPlan>> {
  const formData = new FormData();
  appendIbPlanFormData(formData, input);

  const response = await browserBrokerRequest<IbPlan>(IB_PLANS_PATH, {
    method: "POST",
    body: formData,
  });

  return mapIbPlanResponse(response);
}

export async function updateIbPlan(
  ibPlanId: string,
  input: UpdateIbPlanInput,
): Promise<BrokerSuccessResponse<IbPlan>> {
  const formData = new FormData();
  appendIbPlanFormData(formData, input);

  const response = await browserBrokerRequest<IbPlan>(`${IB_PLANS_PATH}/${ibPlanId}`, {
    method: "PATCH",
    body: formData,
  });

  return mapIbPlanResponse(response);
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
  const response = await browserBrokerRequest<IbPlanProgramsResponse>(
    `${IB_PLANS_PATH}/${ibPlanId}/programs`,
  );

  return {
    ...response,
    data: {
      ...response.data,
      programs: response.data.programs.map(withProxyPlanProgramAssignment),
    },
  };
}

export async function syncIbPlanPrograms(
  ibPlanId: string,
  input: SyncIbPlanProgramsInput,
): Promise<BrokerSuccessResponse<IbPlanProgram[]>> {
  const response = await browserBrokerRequest<IbPlanProgram[]>(
    `${IB_PLANS_PATH}/${ibPlanId}/programs`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return {
    ...response,
    data: response.data.map(withProxyPlanProgramAssignment),
  };
}

export async function seedIbDemoCatalog(): Promise<
  BrokerSuccessResponse<IbDemoCatalog>
> {
  return browserBrokerRequest<IbDemoCatalog>("v1/admin/ib-demo-catalog", {
    method: "POST",
  });
}
