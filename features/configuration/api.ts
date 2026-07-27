import type {
  BrokerConfig,
  UpdateConfigsBatchInput,
} from "@/features/configuration/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const CONFIGS_PATH = "v1/admin/configs";

export async function listConfigs(
  category?: string,
): Promise<BrokerSuccessResponse<BrokerConfig[]>> {
  return browserBrokerRequest<BrokerConfig[]>(CONFIGS_PATH, {
    searchParams: category ? { category } : undefined,
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
