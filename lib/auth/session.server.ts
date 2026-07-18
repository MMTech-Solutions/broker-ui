import "server-only";

import { cookies } from "next/headers";

import { iamRefresh } from "@/lib/auth/iam.server";
import {
  decodeJwtPayload,
  displayNameFromClaims,
  jwtPayloadSegment,
} from "@/lib/auth/jwt";
import {
  sessionCookieName,
  twoFaCookieName,
} from "@/lib/auth/session-constants";
import {
  decryptSession,
  encryptSession,
  sessionCookieMaxMs,
} from "@/lib/auth/session-crypto";
import type { AuthArea, SessionPayload } from "@/lib/auth/types";

const ACCESS_REFRESH_BUFFER_MS = 60_000;

const cookieOptions = (expiresAt: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  expires: new Date(expiresAt),
});

export async function readSession(
  area: AuthArea,
): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(sessionCookieName(area))?.value);
}

export async function writeSession(
  area: AuthArea,
  payload: SessionPayload,
): Promise<void> {
  const store = await cookies();
  store.set(
    sessionCookieName(area),
    encryptSession(payload),
    cookieOptions(payload.expires_at),
  );
}

export async function clearSession(area: AuthArea): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookieName(area));
  store.delete(twoFaCookieName(area));
}

export async function createSessionFromTokens(
  area: AuthArea,
  params: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    fallback_user_id?: string;
  },
): Promise<SessionPayload> {
  const claims = decodeJwtPayload(params.access_token);
  const sub =
    typeof claims?.sub === "string" && claims.sub.trim()
      ? claims.sub.trim()
      : params.fallback_user_id?.trim();

  if (!sub) {
    throw new Error("Access token is missing a valid sub claim.");
  }

  const now = Date.now();
  const payload: SessionPayload = {
    user_id: sub,
    email: typeof claims?.email === "string" ? claims.email : undefined,
    name: claims ? displayNameFromClaims(claims) : undefined,
    access_token: params.access_token,
    refresh_token: params.refresh_token,
    expires_at: now + sessionCookieMaxMs(),
    access_expires_at: now + (params.expires_in ?? 300) * 1000,
  };

  await writeSession(area, payload);
  return payload;
}

function accessTokenStale(session: SessionPayload): boolean {
  return Date.now() >= session.access_expires_at - ACCESS_REFRESH_BUFFER_MS;
}

export function sessionIsAuthenticated(
  session: SessionPayload | null,
): boolean {
  return Boolean(session?.user_id && session?.access_token);
}

export type BrokerAuthCredentials = {
  accessToken: string;
  /** JWT payload segment for X-Userinfo (direct Laravel / gateway-compat). */
  userinfo: string;
};

/**
 * Access token + X-Userinfo for upstream broker calls.
 * Via APISIX (k8local) the Bearer is required; X-Userinfo is also sent for
 * direct-to-Laravel setups that skip the gateway JWT plugin.
 */
export async function resolveBrokerAuthCredentials(
  area: AuthArea,
): Promise<BrokerAuthCredentials | null> {
  const session = await getFreshSession(area);
  if (!session?.access_token) {
    return null;
  }

  const userinfo = jwtPayloadSegment(session.access_token);
  if (!userinfo) {
    return null;
  }

  return {
    accessToken: session.access_token,
    userinfo,
  };
}

/** @deprecated Prefer resolveBrokerAuthCredentials */
export async function resolveUserinfoHeaderValue(
  area: AuthArea,
): Promise<string | null> {
  const auth = await resolveBrokerAuthCredentials(area);
  return auth?.userinfo ?? null;
}

export async function getFreshSession(
  area: AuthArea,
): Promise<SessionPayload | null> {
  const session = await readSession(area);
  if (!session?.access_token) {
    return null;
  }

  if (!accessTokenStale(session)) {
    return session;
  }

  if (!session.refresh_token) {
    return session;
  }

  const refreshed = await iamRefresh(session.refresh_token);
  if (!refreshed?.access_token) {
    return session;
  }

  return createSessionFromTokens(area, {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? session.refresh_token,
    expires_in: refreshed.expires_in,
    fallback_user_id: session.user_id,
  });
}

export async function set2faPending(
  area: AuthArea,
  username: string,
  tempToken: string,
): Promise<void> {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const store = await cookies();
  store.set(
    twoFaCookieName(area),
    encryptSession({
      user_id: username,
      access_token: tempToken,
      expires_at: expiresAt,
      access_expires_at: expiresAt,
    }),
    cookieOptions(expiresAt),
  );
}

export async function read2faPending(
  area: AuthArea,
): Promise<{ username: string; temp_token: string } | null> {
  const store = await cookies();
  const payload = decryptSession(store.get(twoFaCookieName(area))?.value);
  if (!payload?.user_id || !payload.access_token) {
    return null;
  }

  return { username: payload.user_id, temp_token: payload.access_token };
}

export async function clear2faPending(area: AuthArea): Promise<void> {
  const store = await cookies();
  store.delete(twoFaCookieName(area));
}
