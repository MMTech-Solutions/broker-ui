import type {
  AccountInsurance,
  AccountInsuranceAdminListFilters,
  CreateInsurancePlanInput,
  CreateInsurancePlanOptionInput,
  InsurancePlan,
  InsurancePlanListFilters,
  InsurancePlanOption,
  InsurancePlanServerGroup,
  RejectAccountInsuranceClaimInput,
  UpdateInsurancePlanInput,
  UpdateInsurancePlanOptionInput,
} from "@/features/insurance/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const INSURANCE_ADMIN_PATH = "v1/admin/insurance";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listInsurancePlans(
  filters: InsurancePlanListFilters = {},
): Promise<BrokerSuccessResponse<InsurancePlan[]>> {
  return browserBrokerRequest<InsurancePlan[]>(`${INSURANCE_ADMIN_PATH}/plans`, {
    searchParams: compactFilters(filters),
  });
}

export async function getInsurancePlan(
  insurancePlanId: string,
): Promise<BrokerSuccessResponse<InsurancePlan>> {
  return browserBrokerRequest<InsurancePlan>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}`,
  );
}

export async function createInsurancePlan(
  input: CreateInsurancePlanInput,
): Promise<BrokerSuccessResponse<InsurancePlan>> {
  return browserBrokerRequest<InsurancePlan>(`${INSURANCE_ADMIN_PATH}/plans`, {
    method: "POST",
    body: input,
  });
}

export async function updateInsurancePlan(
  insurancePlanId: string,
  input: UpdateInsurancePlanInput,
): Promise<BrokerSuccessResponse<InsurancePlan>> {
  return browserBrokerRequest<InsurancePlan>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteInsurancePlan(
  insurancePlanId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}`,
    {
      method: "DELETE",
    },
  );
}

export async function syncInsurancePlanServerGroups(
  insurancePlanId: string,
  serverGroupIds: string[],
): Promise<BrokerSuccessResponse<InsurancePlanServerGroup[]>> {
  return browserBrokerRequest<InsurancePlanServerGroup[]>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}/server-groups`,
    {
      method: "PATCH",
      body: { server_group_ids: serverGroupIds },
    },
  );
}

export async function listInsurancePlanOptions(
  insurancePlanId: string,
  filters: { is_active?: boolean; per_page?: number } = {},
): Promise<BrokerSuccessResponse<InsurancePlanOption[]>> {
  return browserBrokerRequest<InsurancePlanOption[]>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}/options`,
    {
      searchParams: compactFilters({
        ...filters,
        per_page: filters.per_page ?? 100,
      }),
    },
  );
}

export async function createInsurancePlanOption(
  insurancePlanId: string,
  input: CreateInsurancePlanOptionInput,
): Promise<BrokerSuccessResponse<InsurancePlanOption>> {
  return browserBrokerRequest<InsurancePlanOption>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}/options`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function updateInsurancePlanOption(
  insurancePlanId: string,
  insurancePlanOptionId: string,
  input: UpdateInsurancePlanOptionInput,
): Promise<BrokerSuccessResponse<InsurancePlanOption>> {
  return browserBrokerRequest<InsurancePlanOption>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}/options/${insurancePlanOptionId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteInsurancePlanOption(
  insurancePlanId: string,
  insurancePlanOptionId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${INSURANCE_ADMIN_PATH}/plans/${insurancePlanId}/options/${insurancePlanOptionId}`,
    {
      method: "DELETE",
    },
  );
}

export async function listAccountInsurancesAdmin(
  filters: AccountInsuranceAdminListFilters = {},
): Promise<BrokerSuccessResponse<AccountInsurance[]>> {
  return browserBrokerRequest<AccountInsurance[]>(
    `${INSURANCE_ADMIN_PATH}/account-insurances`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function approveAccountInsuranceClaim(
  accountInsuranceId: string,
): Promise<BrokerSuccessResponse<AccountInsurance>> {
  return browserBrokerRequest<AccountInsurance>(
    `${INSURANCE_ADMIN_PATH}/account-insurances/${accountInsuranceId}/approve`,
    {
      method: "POST",
      body: {},
    },
  );
}

export async function rejectAccountInsuranceClaim(
  accountInsuranceId: string,
  input: RejectAccountInsuranceClaimInput = {},
): Promise<BrokerSuccessResponse<AccountInsurance>> {
  return browserBrokerRequest<AccountInsurance>(
    `${INSURANCE_ADMIN_PATH}/account-insurances/${accountInsuranceId}/reject`,
    {
      method: "POST",
      body: input,
    },
  );
}
