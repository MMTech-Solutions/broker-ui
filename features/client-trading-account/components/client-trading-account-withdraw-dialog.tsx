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
import { createExternalWithdrawal } from "@/features/client-trading-account/api";
import {
  formatAccountMoney,
  parseMajorAmountToMinorUnits,
} from "@/features/client-trading-account/format";
import type { EnrichedClientTradingAccount } from "@/features/client-trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientTradingAccountWithdrawDialogProps = {
  account: EnrichedClientTradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClientTradingAccountWithdrawDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: ClientTradingAccountWithdrawDialogProps) {
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");
    setCode("");
    setComments("");
    setError(null);
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      return;
    }

    const minorAmount = parseMajorAmountToMinorUnits(amount);

    if (minorAmount === undefined || minorAmount <= 0) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setError("El código de verificación debe tener 6 dígitos.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createExternalWithdrawal({
        account_id: account.id,
        amount: minorAmount,
        code: code.trim(),
        comments: comments.trim() || null,
      });
      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retirar fondos</DialogTitle>
          <DialogDescription>
            Retira saldo de la cuenta{" "}
            <span className="font-medium text-foreground">
              {account?.external_trader_id ?? "—"}
            </span>
            . Requiere código 2FA y servicios de finanzas habilitados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <ApiErrorAlert title="No se pudo retirar" message={error} />
          ) : null}

          <div className="rounded-lg border p-3 text-sm">
            <p>
              Saldo actual:{" "}
              <span className="font-medium tabular-nums">
                {account ? formatAccountMoney(account.current_balance) : "—"}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Monto</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="100.00"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-code">Código 2FA (6 dígitos)</Label>
            <Input
              id="withdraw-code"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-comments">Comentarios (opcional)</Label>
            <Input
              id="withdraw-comments"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Procesando..." : "Retirar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
