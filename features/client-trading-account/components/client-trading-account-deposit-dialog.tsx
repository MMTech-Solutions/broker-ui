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
import { createExternalDeposit } from "@/features/client-trading-account/api";
import {
  formatAccountMoney,
  parseMajorAmountToMinorUnits,
} from "@/features/client-trading-account/format";
import type { EnrichedClientTradingAccount } from "@/features/client-trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientTradingAccountDepositDialogProps = {
  account: EnrichedClientTradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClientTradingAccountDepositDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: ClientTradingAccountDepositDialogProps) {
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

    const minorAmount = parseMajorAmountToMinorUnits(amount);

    if (minorAmount === undefined || minorAmount <= 0) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createExternalDeposit({
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
          <DialogTitle>Depositar fondos</DialogTitle>
          <DialogDescription>
            Acredita saldo en la cuenta{" "}
            <span className="font-medium text-foreground">
              {account?.external_trader_id ?? "—"}
            </span>
            . Requiere permisos y servicios de finanzas habilitados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <ApiErrorAlert title="No se pudo depositar" message={error} />
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
            <Label htmlFor="deposit-amount">Monto</Label>
            <Input
              id="deposit-amount"
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
            <Label htmlFor="deposit-comments">Comentarios (opcional)</Label>
            <Input
              id="deposit-comments"
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
              {submitting ? "Procesando..." : "Depositar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
