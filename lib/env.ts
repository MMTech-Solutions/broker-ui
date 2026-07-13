export const env = {
  brokerServiceUrl: () =>
    process.env.BROKER_SERVICE_URL ?? "http://localhost:8000",
  brokerApiPrefix: () => process.env.BROKER_API_PREFIX ?? "/api/broker",
  rbacGatewayInternalHeader: () =>
    process.env.RBAC_GATEWAY_INTERNAL_HEADER ?? "X-Internal-Gateway",
  rbacGatewayInternalSecret: () =>
    process.env.RBAC_GATEWAY_INTERNAL_SECRET ?? "apisix",
  rbacGatewayUserinfoHeader: () =>
    process.env.RBAC_GATEWAY_USERINFO_HEADER ?? "X-Userinfo",
  rbacAdminUserinfoJson: () => process.env.RBAC_ADMIN_USERINFO_JSON,
  rbacCustomerUserinfoJson: () => process.env.RBAC_CUSTOMER_USERINFO_JSON,
  rbacUserinfoJson: () => process.env.RBAC_USERINFO_JSON,
  rbacUserinfoBase64: () => process.env.RBAC_USERINFO_BASE64,
} as const;
