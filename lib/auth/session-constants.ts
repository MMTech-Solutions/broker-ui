import type { AuthArea } from "@/lib/auth/types";

export const ADMIN_SESSION_COOKIE = "broker_admin_session";
export const CLIENT_SESSION_COOKIE = "broker_client_session";
export const ADMIN_2FA_COOKIE = "broker_admin_2fa";
export const CLIENT_2FA_COOKIE = "broker_client_2fa";

export function sessionCookieName(area: AuthArea): string {
  return area === "admin" ? ADMIN_SESSION_COOKIE : CLIENT_SESSION_COOKIE;
}

export function twoFaCookieName(area: AuthArea): string {
  return area === "admin" ? ADMIN_2FA_COOKIE : CLIENT_2FA_COOKIE;
}
