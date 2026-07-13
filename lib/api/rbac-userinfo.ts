import type { RbacSurface } from "@/lib/api/rbac-surface";

const DEV_ADMIN_USERINFO_JSON =
  '{"sub":"b8f4e2a1-3c6d-4e9f-8b2a-7d1e9f4c6a50","email":"dev.admin@broker-service.local","given_name":"Dev Admin","family_name":"User"}';

const DEV_CUSTOMER_USERINFO_JSON =
  '{"sub":"b8f4e2a1-3c6d-4e9f-8b2a-7d1e9f4c6a51","email":"dev.customer@broker-service.local","given_name":"Dev Customer","family_name":"User"}';

/** @deprecated Use surface-specific env vars; kept for backward compatibility. */
const DEV_USERINFO_JSON = DEV_ADMIN_USERINFO_JSON;

export function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function resolveRbacUserinfoJson(surface?: RbacSurface): string | undefined {
  if (surface === "admin_panel") {
    return (
      process.env.RBAC_ADMIN_USERINFO_JSON?.trim() ??
      process.env.RBAC_USERINFO_JSON?.trim() ??
      (process.env.NODE_ENV === "development" ? DEV_ADMIN_USERINFO_JSON : undefined)
    );
  }

  if (surface === "customer_app") {
    return (
      process.env.RBAC_CUSTOMER_USERINFO_JSON?.trim() ??
      (process.env.NODE_ENV === "development" ? DEV_CUSTOMER_USERINFO_JSON : undefined)
    );
  }

  return (
    process.env.RBAC_USERINFO_JSON?.trim() ??
    (process.env.NODE_ENV === "development" ? DEV_USERINFO_JSON : undefined)
  );
}

export function resolveRbacUserinfoHeaderValue(
  surface?: RbacSurface,
): string | undefined {
  const encoded = process.env.RBAC_USERINFO_BASE64?.trim();
  if (encoded && !surface) {
    return encoded;
  }

  const json = resolveRbacUserinfoJson(surface);

  if (!json) {
    return undefined;
  }

  return encodeBase64Url(json);
}
