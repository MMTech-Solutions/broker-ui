export type RbacSurface = "admin_panel" | "customer_app";

/**
 * Derives RBAC surface from the broker API path.
 * Admin routes live under `v1/admin/*` and resolve to `admin_panel`.
 */
export function resolveRbacSurfaceFromApiPath(apiPath: string): RbacSurface {
  const normalized = apiPath.replace(/^\/+/, "");

  if (normalized === "v1/admin" || normalized.startsWith("v1/admin/")) {
    return "admin_panel";
  }

  return "customer_app";
}

export function isRbacSurface(value: string | null | undefined): value is RbacSurface {
  return value === "admin_panel" || value === "customer_app";
}
