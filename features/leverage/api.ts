import type {
  CreateLeverageInput,
  Leverage,
  LeverageListFilters,
  UpdateLeverageInput,
} from "@/features/leverage/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const LEVERAGES_PATH = "v1/admin/leverages";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listLeverages(
  filters: LeverageListFilters = {},
): Promise<BrokerSuccessResponse<Leverage[]>> {
  return browserBrokerRequest<Leverage[]>(LEVERAGES_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function getLeverage(
  leverageId: string,
): Promise<BrokerSuccessResponse<Leverage>> {
  return browserBrokerRequest<Leverage>(`${LEVERAGES_PATH}/${leverageId}`);
}

export async function createLeverage(
  input: CreateLeverageInput,
): Promise<BrokerSuccessResponse<Leverage>> {
  return browserBrokerRequest<Leverage>(LEVERAGES_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateLeverage(
  leverageId: string,
  input: UpdateLeverageInput,
): Promise<BrokerSuccessResponse<Leverage>> {
  return browserBrokerRequest<Leverage>(`${LEVERAGES_PATH}/${leverageId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteLeverage(
  leverageId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${LEVERAGES_PATH}/${leverageId}`, {
    method: "DELETE",
  });
}
