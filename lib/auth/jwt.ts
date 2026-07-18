/**
 * Decode a JWT payload without verifying the signature.
 * Broker RBAC middleware expects X-Userinfo as base64url(JSON) with at least `sub`.
 * The JWT middle segment is already that encoding.
 */
export function jwtPayloadSegment(accessToken: string): string | null {
  const parts = accessToken.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  return parts[1];
}

export function decodeJwtPayload(
  accessToken: string,
): Record<string, unknown> | null {
  const segment = jwtPayloadSegment(accessToken);
  if (!segment) {
    return null;
  }

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as Record<string, unknown>;

    if (typeof payload.sub !== "string" || payload.sub.trim() === "") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function displayNameFromClaims(
  claims: Record<string, unknown>,
): string | undefined {
  const given =
    typeof claims.given_name === "string" ? claims.given_name.trim() : "";
  const family =
    typeof claims.family_name === "string" ? claims.family_name.trim() : "";
  const combined = `${given} ${family}`.trim();
  if (combined) {
    return combined;
  }

  if (typeof claims.name === "string" && claims.name.trim()) {
    return claims.name.trim();
  }

  if (
    typeof claims.preferred_username === "string" &&
    claims.preferred_username.trim()
  ) {
    return claims.preferred_username.trim();
  }

  return undefined;
}
