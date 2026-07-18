export const env = {
  brokerServiceUrl: () =>
    process.env.BROKER_SERVICE_URL ?? "http://localhost:8000",
  brokerApiPrefix: () => process.env.BROKER_API_PREFIX ?? "/api/broker",
  iamApiBase: () =>
    process.env.IAM_API_BASE?.trim() ||
    process.env.AUTH_SERVICE_URL?.trim() ||
    undefined,
  rbacGatewayInternalHeader: () =>
    process.env.RBAC_GATEWAY_INTERNAL_HEADER ?? "X-Internal-Gateway",
  rbacGatewayInternalSecret: () =>
    process.env.RBAC_GATEWAY_INTERNAL_SECRET ?? "apisix",
  rbacGatewayUserinfoHeader: () =>
    process.env.RBAC_GATEWAY_USERINFO_HEADER ?? "X-Userinfo",
  sessionSecret: () =>
    process.env.SESSION_SECRET ?? "broker-ui-dev-secret-change-me",
} as const;
