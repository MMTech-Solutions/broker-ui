"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthArea, LoginFormActionState } from "@/lib/auth/types";

async function formAction(
  _prev: LoginFormActionState,
  formData: FormData,
): Promise<LoginFormActionState> {
  return loginAction(formData);
}

function twoFaPrompt(method?: string): string {
  switch (method) {
    case "google_authenticator":
      return "Introduce el código de 6 dígitos de tu app de autenticación.";
    case "email":
      return "Introduce el código que enviamos a tu correo.";
    default:
      return "Introduce tu código de verificación para continuar.";
  }
}

type LoginFormProps = {
  area: AuthArea;
  title: string;
  description: string;
};

export function LoginForm({ area, title, description }: LoginFormProps) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, submit, isPending] = useActionState(formAction, null);
  const requires2fa = state !== null && "requires_2fa" in state;
  const twoFaMethod = requires2fa ? state.method : undefined;
  const error = state !== null && "error" in state ? state.error : null;

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/95 px-8 py-10 text-card-foreground shadow-xl backdrop-blur-sm">
      <div className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          MMT Broker
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {requires2fa ? "Verifica tu código" : title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {requires2fa ? twoFaPrompt(twoFaMethod) : description}
        </p>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        {error ? (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {requires2fa ? (
          <>
            <form action={submit} className="space-y-5">
              <input type="hidden" name="area" value={area} />
              {next ? <input type="hidden" name="next" value={next} /> : null}
              <div className="space-y-2">
                <Label htmlFor={`${area}-otp`}>Código de verificación</Label>
                <Input
                  id={`${area}-otp`}
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={6}
                  disabled={isPending}
                  className="h-11 text-center text-lg tracking-[0.35em]"
                  placeholder="000000"
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 w-full"
              >
                {isPending ? "Verificando…" : "Verificar"}
              </Button>
            </form>

            <form action={submit} className="mt-3 text-center">
              <input type="hidden" name="area" value={area} />
              <input type="hidden" name="resend" value="1" />
              <button
                type="submit"
                disabled={isPending}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
              >
                Reenviar código
              </button>
            </form>
          </>
        ) : (
          <form action={submit} className="space-y-5">
            <input type="hidden" name="area" value={area} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div className="space-y-2">
              <Label htmlFor={`${area}-username`}>Usuario</Label>
              <Input
                id={`${area}-username`}
                name="username"
                type="text"
                required
                autoComplete="username"
                disabled={isPending}
                className="h-10"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${area}-password`}>Contraseña</Label>
              <Input
                id={`${area}-password`}
                name="password"
                type="password"
                required
                autoComplete="current-password"
                disabled={isPending}
                className="h-10"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={isPending} className="h-10 w-full">
              {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
