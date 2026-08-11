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

function appendPlatformFormData(
  formData: FormData,
  input: CreatePlatformInput | UpdatePlatformInput,
): void {
  if (input.name !== undefined) {
    formData.append("name", input.name);
  }

  if (input.custom_name !== undefined) {
    formData.append("custom_name", input.custom_name ?? "");
  }

  if (input.description !== undefined) {
    formData.append("description", input.description ?? "");
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
  const formData = new FormData();
  appendPlatformFormData(formData, input);

  return browserBrokerRequest<Platform>(PLATFORMS_PATH, {
    method: "POST",
    body: formData,
  });
}

export async function updatePlatform(
  platformId: string,
  input: UpdatePlatformInput,
): Promise<BrokerSuccessResponse<Platform>> {
  const formData = new FormData();
  appendPlatformFormData(formData, input);

  return browserBrokerRequest<Platform>(`${PLATFORMS_PATH}/${platformId}`, {
    method: "PATCH",
    body: formData,
  });
}

export async function deletePlatform(
  platformId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${PLATFORMS_PATH}/${platformId}`, {
    method: "DELETE",
  });
}
