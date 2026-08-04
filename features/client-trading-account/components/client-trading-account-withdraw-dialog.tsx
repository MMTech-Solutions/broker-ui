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
import { createDebit } from "@/features/client-trading-account/api";
import {
  formatAccountMoney,
  parseMajorAmountToMinorUnits,
} from "@/features/client-trading-account/format";
import type { EnrichedClientTradingAccount } from "@/features/client-trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientTradingAccountDebitDialogProps = {
  account: EnrichedClientTradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClientTradingAccountDebitDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: ClientTradingAccountDebitDialogProps) {
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");
    setComments("");
    setError(null);
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      return;
    }

    if (
      account.currencyPrecision == null ||
      !Number.isFinite(account.currencyPrecision)
    ) {
      setError(
        "La precisión de moneda del grupo de servidor no está configurada. No se puede debitar hasta que un administrador la configure.",
      );
      return;
    }

    const minorAmount = parseMajorAmountToMinorUnits(
      amount,
      account.currencyPrecision,
    );

    if (minorAmount === undefined || minorAmount <= 0) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createDebit({
        account_id: account.id,
        amount: minorAmount,
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
          <DialogTitle>Debitar cuenta</DialogTitle>
          <DialogDescription>
            Debita saldo de la cuenta{" "}
            <span className="font-medium text-foreground">
              {account?.external_trader_id ?? "—"}
            </span>{" "}
            y acredita la main wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <ApiErrorAlert title="No se pudo debitar" message={error} />
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
            <Label htmlFor="debit-amount">Monto</Label>
            <Input
              id="debit-amount"
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
            <Label htmlFor="debit-comments">Comentarios (opcional)</Label>
            <Input
              id="debit-comments"
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
              {submitting ? "Procesando..." : "Debitar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Prefer ClientTradingAccountDebitDialog */
export const ClientTradingAccountWithdrawDialog =
  ClientTradingAccountDebitDialog;
