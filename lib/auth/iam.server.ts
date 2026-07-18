import "server-only";

import type {
  IamEnvelope,
  IamLoginData,
  IamTokenBundle,
} from "@/lib/auth/types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;

function iamApiBase(): string {
  const raw =
    process.env.IAM_API_BASE?.trim() ||
    process.env.AUTH_SERVICE_URL?.trim() ||
    "";

  if (!raw) {
    throw new Error(
      "IAM_API_BASE (or AUTH_SERVICE_URL) is not configured. Example: http://localhost:8000/api/iam/v1",
    );
  }

  return raw.replace(/\/+$/, "");
}

function iamUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${iamApiBase()}${suffix}`;
}

export async function iamLogin(
  username: string,
  password: string,
  headers: Record<string, string> = {},
): Promise<IamEnvelope<IamLoginData>> {
  const res = await fetch(iamUrl("/auth/login"), {
    method: "POST",
    cache: "no-store",
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify({ username, password }),
  });

  return (await res.json()) as IamEnvelope<IamLoginData>;
}

export async function iamVerify2fa(
  tempToken: string,
  code: string,
  headers: Record<string, string> = {},
): Promise<IamEnvelope<IamTokenBundle>> {
  const res = await fetch(iamUrl("/auth/user/2fa/verify"), {
    method: "POST",
    cache: "no-store",
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify({ context: "login", temp_token: tempToken, code }),
  });

  return (await res.json()) as IamEnvelope<IamTokenBundle>;
}

export async function iamResend2fa(
  tempToken: string,
  headers: Record<string, string> = {},
): Promise<IamEnvelope<{ temp_token?: string; method?: string }>> {
  const res = await fetch(iamUrl("/auth/user/2fa/resend-code"), {
    method: "POST",
    cache: "no-store",
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify({ context: "login", temp_token: tempToken }),
  });

  return (await res.json()) as IamEnvelope<{ temp_token?: string; method?: string }>;
}

export async function iamRefresh(
  refreshToken: string,
): Promise<IamTokenBundle | null> {
  try {
    const res = await fetch(iamUrl("/auth/refresh"), {
      method: "POST",
      cache: "no-store",
      headers: JSON_HEADERS,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const json = (await res.json()) as IamEnvelope<IamTokenBundle>;
    if (!res.ok || !json.success || !json.data?.access_token) {
      return null;
    }

    return json.data;
  } catch {
    return null;
  }
}

export async function iamLogout(refreshToken: string): Promise<void> {
  try {
    await fetch(iamUrl("/auth/logout"), {
      method: "POST",
      cache: "no-store",
      headers: JSON_HEADERS,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // best effort
  }
}
