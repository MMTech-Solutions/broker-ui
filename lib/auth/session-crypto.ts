import type { SessionPayload } from "@/lib/auth/types";

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "broker-ui-dev-secret-change-me";

export function sessionCookieMaxMs(): number {
  const sec = Number(process.env.SESSION_MAX_AGE_SECONDS);
  if (Number.isFinite(sec) && sec > 0) {
    return sec * 1000;
  }

  return 30 * 24 * 60 * 60 * 1000;
}

export function encryptSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${encoded}.${Buffer.from(SESSION_SECRET).toString("base64url")}`;
}

/** Sync parse — safe for middleware / edge. */
export function parseSessionPayload(
  token: string | undefined,
): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encoded] = token.split(".");
  if (!encoded) {
    return null;
  }

  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export function decryptSession(
  token: string | undefined,
): SessionPayload | null {
  const payload = parseSessionPayload(token);
  if (!payload) {
    return null;
  }

  if (payload.expires_at < Date.now()) {
    return null;
  }

  if (!payload.access_token || !payload.user_id) {
    return null;
  }

  return payload;
}
