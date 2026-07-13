import { env } from "@/lib/env";
import type { RbacSurface } from "@/lib/api/rbac-surface";
import { resolveRbacUserinfoHeaderValue } from "@/lib/api/rbac-userinfo";

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

type BuildBrokerGatewayHeadersOptions = {
  surface?: RbacSurface;
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

  const userinfo = resolveRbacUserinfoHeaderValue(options.surface);

  if (userinfo) {
    headers[brokerConfig.userinfoHeader] = userinfo;
  }

  return headers;
}
