import { platformImageUrl } from "@/features/platform/image";
import type {
  CreatePlatformInput,
  Platform,
  PlatformListFilters,
  UpdatePlatformInput,
} from "@/features/platform/types";
import type { AvailablePlatform } from "@/features/platform/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const PLATFORMS_ADMIN_PATH = "v1/admin/platforms";
const PLATFORMS_CLIENT_PATH = "v1/platforms";
const PLATFORMS_AVAILABLE_PATH = "v1/platforms/availables";

function withProxyImagePath(platform: Platform): Platform {
  return {
    ...platform,
    image_path: platformImageUrl(platform.id, platform.image_path),
  };
}

function mapPlatformsResponse(
  response: BrokerSuccessResponse<Platform[]>,
): BrokerSuccessResponse<Platform[]> {
  return {
    ...response,
    data: response.data.map(withProxyImagePath),
  };
}

function mapPlatformResponse(
  response: BrokerSuccessResponse<Platform>,
): BrokerSuccessResponse<Platform> {
  return {
    ...response,
    data: withProxyImagePath(response.data),
  };
}

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
  const response = await browserBrokerRequest<Platform[]>(PLATFORMS_ADMIN_PATH, {
    searchParams: filters,
  });

  return mapPlatformsResponse(response);
}

/** Client catalog: active configured platforms (no filters). */
export async function listConfiguredPlatforms(): Promise<
  BrokerSuccessResponse<Platform[]>
> {
  const response = await browserBrokerRequest<Platform[]>(PLATFORMS_CLIENT_PATH);

  return mapPlatformsResponse(response);
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
  const response = await browserBrokerRequest<Platform>(
    `${PLATFORMS_ADMIN_PATH}/${platformId}`,
  );

  return mapPlatformResponse(response);
}

export async function createPlatform(
  input: CreatePlatformInput,
): Promise<BrokerSuccessResponse<Platform>> {
  const formData = new FormData();
  appendPlatformFormData(formData, input);

  const response = await browserBrokerRequest<Platform>(PLATFORMS_ADMIN_PATH, {
    method: "POST",
    body: formData,
  });

  return mapPlatformResponse(response);
}

export async function updatePlatform(
  platformId: string,
  input: UpdatePlatformInput,
): Promise<BrokerSuccessResponse<Platform>> {
  const formData = new FormData();
  appendPlatformFormData(formData, input);

  const response = await browserBrokerRequest<Platform>(
    `${PLATFORMS_ADMIN_PATH}/${platformId}`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  return mapPlatformResponse(response);
}

export async function deletePlatform(
  platformId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${PLATFORMS_ADMIN_PATH}/${platformId}`, {
    method: "DELETE",
  });
}
