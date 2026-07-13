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
import { createInternalTransfer } from "@/features/client-finance/api";
import { formatAccountMoney } from "@/features/client-trading-account/format";
import { parseMajorAmountToMinorUnits } from "@/features/initial-amount/format";
import type { TradingAccount } from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientInternalTransferPanelProps = {
  accounts: TradingAccount[];
  onTransferred: () => void;
};

export function ClientInternalTransferPanel({
  accounts,
  onTransferred,
}: ClientInternalTransferPanelProps) {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeAccounts = accounts.filter((account) => account.is_active);
  const fromAccount = activeAccounts.find((account) => account.id === fromAccountId);
  const toAccountOptions = activeAccounts.filter(
    (account) => account.id !== fromAccountId,
  );
  const toAccount = toAccountOptions.find((account) => account.id === toAccountId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);

    if (!fromAccountId || !toAccountId) {
      setError("Selecciona las cuentas de origen y destino.");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("La cuenta de origen y destino deben ser distintas.");
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
      await createInternalTransfer({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: minorAmount,
        comments: comments.trim() || null,
      });

      setAmount("");
      setComments("");
      setSuccess("Transferencia registrada correctamente.");
      onTransferred();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferir entre cuentas</CardTitle>
        <CardDescription>
          Mueve saldo entre tus cuentas de trading. El débito y crédito se
          procesan mediante los servicios de finanzas del broker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {error ? (
            <div className="md:col-span-2">
              <ApiErrorAlert
                title="No se pudo transferir"
                message={error}
              />
            </div>
          ) : null}

          {success ? (
            <p className="md:col-span-2 text-sm text-emerald-600">{success}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="transfer-from-account">Cuenta origen</Label>
            <Select
              value={fromAccountId}
              onValueChange={(value) => {
                if (value) {
                  setFromAccountId(value);
                  if (value === toAccountId) {
                    setToAccountId("");
                  }
                }
              }}
              disabled={submitting}
            >
              <SelectTrigger id="transfer-from-account">
                <SelectValue placeholder="Selecciona cuenta origen">
                  {fromAccount
                    ? `${fromAccount.external_trader_id} — ${formatAccountMoney(fromAccount.current_balance)}`
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
            <Label htmlFor="transfer-to-account">Cuenta destino</Label>
            <Select
              value={toAccountId}
              onValueChange={(value) => {
                if (value) {
                  setToAccountId(value);
                }
              }}
              disabled={submitting || !fromAccountId}
            >
              <SelectTrigger id="transfer-to-account">
                <SelectValue placeholder="Selecciona cuenta destino">
                  {toAccount
                    ? `${toAccount.external_trader_id} — ${formatAccountMoney(toAccount.current_balance)}`
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {toAccountOptions.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.external_trader_id} — saldo{" "}
                    {formatAccountMoney(account.current_balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Monto</Label>
            <Input
              id="transfer-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="50.00"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-comments">Comentarios (opcional)</Label>
            <Input
              id="transfer-comments"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting || activeAccounts.length < 2}>
              {submitting ? "Transfiriendo..." : "Transferir fondos"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
