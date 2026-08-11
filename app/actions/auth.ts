"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  iamLogin,
  iamLogout,
  iamResend2fa,
  iamVerify2fa,
} from "@/lib/auth/iam.server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  clear2faPending,
  clearSession,
  createSessionFromTokens,
  read2faPending,
  readSession,
  set2faPending,
} from "@/lib/auth/session.server";
import type { AuthArea, LoginFormState } from "@/lib/auth/types";

export type { LoginFormActionState, LoginFormState } from "@/lib/auth/types";

const LOGIN_PATH: Record<AuthArea, string> = {
  admin: "/login/admin",
  client: "/login",
};

async function iamForwardHeaders(): Promise<Record<string, string>> {
  const h = await headers();
  const forwardedFor =
    h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? h.get("cf-connecting-ip");
  const out: Record<string, string> = {};

  if (forwardedFor) {
    out["x-forwarded-for"] = forwardedFor;
    out["x-real-ip"] = forwardedFor.split(",")[0]?.trim() ?? forwardedFor;
  }

  const proto = h.get("x-forwarded-proto");
  if (proto) {
    out["x-forwarded-proto"] = proto;
  }

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    out["x-forwarded-host"] = host;
  }

  const ua = h.get("user-agent");
  if (ua) {
    out["user-agent"] = ua;
  }

  return out;
}

function parseArea(formData: FormData): AuthArea {
  const raw = formData.get("area")?.toString();
  return raw === "admin" ? "admin" : "client";
}

export async function loginAction(
  formData: FormData,
): Promise<LoginFormState> {
  const area = parseArea(formData);
  const nextPath = safeNextPath(area, formData.get("next"));
  const username = formData.get("username")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const code = formData.get("code")?.toString() ?? "";
  const resend = formData.get("resend")?.toString() === "1";
  const fwd = await iamForwardHeaders();

  if (resend) {
    const pending = await read2faPending(area);
    if (!pending) {
      return { error: "Sesión 2FA expirada. Inicia sesión de nuevo." };
    }

    let data;
    try {
      data = await iamResend2fa(pending.temp_token, fwd);
    } catch {
      return { error: "No se pudo reenviar el código." };
    }

    if (!data.success) {
      return { error: data.meta?.message ?? "No se pudo reenviar el código." };
    }

    if (data.data?.temp_token) {
      await set2faPending(area, pending.username, data.data.temp_token);
    }

    return { requires_2fa: true, method: data.data?.method };
  }

  if (code) {
    const pending = await read2faPending(area);
    if (!pending) {
      return { error: "Sesión 2FA expirada. Inicia sesión de nuevo." };
    }

    let data;
    try {
      data = await iamVerify2fa(pending.temp_token, code, fwd);
    } catch {
      return { error: "No se pudo verificar el código." };
    }

    if (!data.success || !data.data?.access_token) {
      return { error: data.meta?.message ?? "Código inválido." };
    }

    await clear2faPending(area);
    await createSessionFromTokens(area, {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires_in: data.data.expires_in,
      fallback_user_id: pending.username,
    });
    redirect(nextPath);
  }

  if (!username || !password) {
    return { error: "Usuario y contraseña son obligatorios." };
  }

  let data;
  try {
    data = await iamLogin(username, password, fwd);
  } catch (error) {
    const detail =
      error instanceof Error && error.message.includes("IAM_API_BASE")
        ? error.message
        : "No se pudo contactar el servicio IAM.";
    return { error: detail };
  }

  if (!data.success) {
    return { error: data.meta?.message ?? "Credenciales inválidas." };
  }

  if (data.data?.requires_2fa && data.data.temp_token) {
    await set2faPending(area, username, data.data.temp_token);
    return { requires_2fa: true, method: data.data.method };
  }

  if (!data.data?.access_token) {
    return { error: "Respuesta IAM inválida." };
  }

  await createSessionFromTokens(area, {
    access_token: data.data.access_token,
    refresh_token: data.data.refresh_token,
    expires_in: data.data.expires_in,
    fallback_user_id: username,
  });
  redirect(nextPath);
}

export async function logoutAction(formData: FormData): Promise<void> {
  const area = parseArea(formData);
  const session = await readSession(area);

  if (session?.refresh_token) {
    await iamLogout(session.refresh_token);
  }

  await clear2faPending(area);
  await clearSession(area);
  redirect(LOGIN_PATH[area]);
}
