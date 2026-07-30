"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  startTradingCredentialsChallenge,
  updateClientTradingAccountCredentials,
} from "@/features/client-trading-account/api";
import type {
  EnrichedClientTradingAccount,
  TwoFactorChallenge,
} from "@/features/client-trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientTradingAccountCredentialsDialogProps = {
  account: EnrichedClientTradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClientTradingAccountCredentialsDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: ClientTradingAccountCredentialsDialogProps) {
  const [password, setPassword] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPassword("");
    setInvestorPassword("");
    setCode("");
    setChallenge(null);
    setError(null);
  }, [open]);

  async function handleStartChallenge() {
    setStartingChallenge(true);
    setError(null);

    try {
      const response = await startTradingCredentialsChallenge();
      setChallenge(response.data);
      setCode("");
    } catch (startError) {
      setError(formatBrokerApiError(startError));
    } finally {
      setStartingChallenge(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedInvestorPassword = investorPassword.trim();

    if (!trimmedPassword && !trimmedInvestorPassword) {
      setError("Indica al menos una credencial a actualizar.");
      return;
    }

    if (!challenge) {
      setError("Inicia el desafío 2FA antes de guardar.");
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setError("El código de verificación debe tener 6 dígitos.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateClientTradingAccountCredentials(account.id, {
        password: trimmedPassword || undefined,
        investor_password: trimmedInvestorPassword || undefined,
        challenge_id: challenge.challenge_id,
        code: code.trim(),
      });
      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const challengeHint =
    challenge?.method === "google_authenticator"
      ? "Abre tu app de autenticación e ingresa el código de 6 dígitos."
      : "Revisa tu correo e ingresa el código de 6 dígitos.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar credenciales</DialogTitle>
          <DialogDescription>
            Actualiza la contraseña master y/o investor de la cuenta{" "}
            <span className="font-medium text-foreground">
              {account?.external_trader_id ?? "—"}
            </span>
            . Requiere verificación 2FA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <ApiErrorAlert
              title="No se pudieron actualizar las credenciales"
              message={error}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="credentials-password">Contraseña master</Label>
            <Input
              id="credentials-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting || startingChallenge}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentials-investor-password">
              Contraseña investor
            </Label>
            <Input
              id="credentials-investor-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={investorPassword}
              onChange={(event) => setInvestorPassword(event.target.value)}
              disabled={submitting || startingChallenge}
            />
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {challenge ? challengeHint : "Inicia el desafío 2FA para obtener un código."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleStartChallenge()}
                disabled={submitting || startingChallenge}
              >
                {startingChallenge
                  ? "Enviando..."
                  : challenge
                    ? "Reenviar código"
                    : "Iniciar 2FA"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials-code">Código 2FA</Label>
              <Input
                id="credentials-code"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                disabled={submitting || !challenge}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting || startingChallenge}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || startingChallenge || !challenge}>
              {submitting ? "Guardando..." : "Guardar credenciales"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
