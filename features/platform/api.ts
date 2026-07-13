import type {
  CreatePlatformInput,
  Platform,
  PlatformListFilters,
  UpdatePlatformInput,
} from "@/features/platform/types";
import type { AvailablePlatform } from "@/features/platform/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const PLATFORMS_PATH = "v1/admin/platforms";
const PLATFORMS_AVAILABLE_PATH = "v1/platforms/availables";

export async function listPlatforms(
  filters: PlatformListFilters = {},
): Promise<BrokerSuccessResponse<Platform[]>> {
  return browserBrokerRequest<Platform[]>(PLATFORMS_PATH, {
    searchParams: filters,
  });
}

export async function listAvailablePlatforms(): Promise<
  BrokerSuccessResponse<AvailablePlatform[]>
> {
  return browserBrokerRequest<AvailablePlatform[]>(
    PLATFORMS_AVAILABLE_PATH,
  );
}

export async function getPlatform(
  platformId: string,
): Promise<BrokerSuccessResponse<Platform>> {
  return browserBrokerRequest<Platform>(`${PLATFORMS_PATH}/${platformId}`);
}

export async function createPlatform(
  input: CreatePlatformInput,
): Promise<BrokerSuccessResponse<Platform>> {
  return browserBrokerRequest<Platform>(PLATFORMS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updatePlatform(
  platformId: string,
  input: UpdatePlatformInput,
): Promise<BrokerSuccessResponse<Platform>> {
  return browserBrokerRequest<Platform>(`${PLATFORMS_PATH}/${platformId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deletePlatform(
  platformId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${PLATFORMS_PATH}/${platformId}`, {
    method: "DELETE",
  });
}
