import type { AuthArea } from "@/lib/auth/types";
import type { RbacSurface } from "@/lib/api/rbac-surface";
import { env } from "@/lib/env";

export const brokerConfig = {
  baseUrl: env.brokerServiceUrl(),
  apiPrefix: env.brokerApiPrefix(),
  internalHeader: env.rbacGatewayInternalHeader(),
  internalSecret: env.rbacGatewayInternalSecret(),
  userinfoHeader: env.rbacGatewayUserinfoHeader(),
} as const;

export function buildBrokerApiUrl(path: string, search = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const prefix = brokerConfig.apiPrefix.replace(/\/+$/, "");

  return `${brokerConfig.baseUrl}${prefix}/${normalizedPath}${search}`;
}

export function rbacSurfaceToAuthArea(surface: RbacSurface): AuthArea {
  return surface === "admin_panel" ? "admin" : "client";
}

type BuildBrokerGatewayHeadersOptions = {
  accessToken?: string | null;
  userinfo?: string | null;
};

export function buildBrokerGatewayHeaders(
  extraHeaders: Record<string, string> = {},
  options: BuildBrokerGatewayHeadersOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    [brokerConfig.internalHeader]: brokerConfig.internalSecret,
    ...extraHeaders,
  };

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  if (options.userinfo) {
    headers[brokerConfig.userinfoHeader] = options.userinfo;
  }

  return headers;
}
