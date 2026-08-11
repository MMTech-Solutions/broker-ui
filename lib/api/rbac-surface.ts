export type RbacSurface = "admin_panel" | "customer_app";

/**
 * Derives RBAC surface from the broker API path.
 * Admin routes live under `v1/admin/*` and resolve to `admin_panel`.
 * Truly anonymous routes live under `v1/public/*` and resolve to `null`
 * so the BFF does not attach customer/admin credentials.
 *
 * Paths that merely end with a resource name like `.../global-settings/public`
 * are still authenticated client routes (`customer_app`).
 */
export function resolveRbacSurfaceFromApiPath(
  apiPath: string,
): RbacSurface | null {
  const normalized = apiPath.replace(/^\/+/, "");

  if (
    normalized === "v1/public" ||
    normalized.startsWith("v1/public/")
  ) {
    return null;
  }

  if (normalized === "v1/admin" || normalized.startsWith("v1/admin/")) {
    return "admin_panel";
  }

  return "customer_app";
}

export function isRbacSurface(value: string | null | undefined): value is RbacSurface {
  return value === "admin_panel" || value === "customer_app";
}
