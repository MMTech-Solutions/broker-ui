import type { AuthArea } from "@/lib/auth/types";

const DEFAULT_POST_LOGIN: Record<AuthArea, string> = {
  admin: "/",
  client: "/client",
};

/**
 * Restrict post-login redirect targets to same-area app paths (open-redirect safe).
 */
export function safeNextPath(
  area: AuthArea,
  raw: string | FormDataEntryValue | null | undefined,
): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login")
  ) {
    return DEFAULT_POST_LOGIN[area];
  }

  if (area === "client") {
    if (value === "/client" || value.startsWith("/client/")) {
      return value;
    }
    return DEFAULT_POST_LOGIN.client;
  }

  if (value === "/client" || value.startsWith("/client/")) {
    return DEFAULT_POST_LOGIN.admin;
  }

  return value;
}
