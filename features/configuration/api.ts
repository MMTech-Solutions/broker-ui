import type {
  BrokerConfig,
  ListConfigsFilters,
  UpdateConfigsBatchInput,
} from "@/features/configuration/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const CONFIGS_PATH = "v1/admin/configs";

export async function listConfigs(
  filters: ListConfigsFilters = {},
): Promise<BrokerSuccessResponse<BrokerConfig[]>> {
  const searchParams: Record<string, string | number> = {};

  if (filters.category) {
    searchParams.category = filters.category;
  }
  if (filters.page !== undefined) {
    searchParams.page = filters.page;
  }
  if (filters.per_page !== undefined) {
    searchParams.per_page = filters.per_page;
  }

  return browserBrokerRequest<BrokerConfig[]>(CONFIGS_PATH, {
    searchParams:
      Object.keys(searchParams).length > 0 ? searchParams : undefined,
  });
}

export async function updateConfigsBatch(
  input: UpdateConfigsBatchInput,
): Promise<BrokerSuccessResponse<BrokerConfig[]>> {
  return browserBrokerRequest<BrokerConfig[]>(CONFIGS_PATH, {
    method: "PATCH",
    body: input,
  });
}
