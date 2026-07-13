"use client";

import { useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExternalDeposit } from "@/features/client-finance/api";
import { formatAccountMoney } from "@/features/client-trading-account/format";
import { parseMajorAmountToMinorUnits } from "@/features/initial-amount/format";
import type { TradingAccount } from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientSimulatedDepositPanelProps = {
  accounts: TradingAccount[];
  onDeposited: () => void;
};

export function ClientSimulatedDepositPanel({
  accounts,
  onDeposited,
}: ClientSimulatedDepositPanelProps) {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeAccounts = accounts.filter((account) => account.is_active);
  const selectedAccount = activeAccounts.find((account) => account.id === accountId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);

    if (!accountId) {
      setError("Selecciona la cuenta donde se acreditará el depósito.");
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
        account_id: accountId,
        amount: minorAmount,
        comments: comments.trim() || null,
      });

      setAmount("");
      setComments("");
      setSuccess("Depósito simulado registrado correctamente.");
      onDeposited();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simular depósito externo</CardTitle>
        <CardDescription>
          Registra un depósito consumiendo el endpoint real de finanzas. Útil
          en entornos de desarrollo con la billetera stub del broker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {error ? (
            <div className="md:col-span-2">
              <ApiErrorAlert title="No se pudo depositar" message={error} />
            </div>
          ) : null}

          {success ? (
            <p className="md:col-span-2 text-sm text-emerald-600">{success}</p>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="deposit-account">Cuenta de trading</Label>
            <Select
              value={accountId}
              onValueChange={(value) => {
                if (value) {
                  setAccountId(value);
                }
              }}
              disabled={submitting}
            >
              <SelectTrigger id="deposit-account">
                <SelectValue placeholder="Selecciona una cuenta">
                  {selectedAccount
                    ? `${selectedAccount.external_trader_id} — ${formatAccountMoney(selectedAccount.current_balance)}`
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.external_trader_id} — saldo{" "}
                    {formatAccountMoney(account.current_balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="simulated-deposit-amount">Monto</Label>
            <Input
              id="simulated-deposit-amount"
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
            <Label htmlFor="simulated-deposit-comments">
              Comentarios (opcional)
            </Label>
            <Input
              id="simulated-deposit-comments"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={submitting || activeAccounts.length === 0}
            >
              {submitting ? "Procesando..." : "Registrar depósito"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
