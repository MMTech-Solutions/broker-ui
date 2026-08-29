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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listEligibleAccountsForContest,
  getContestRegistrationOptions,
  subscribeToContest,
} from "@/features/client-contest/api";
import type {
  ClientEligibleAccount,
  Contest,
  ContestSubscription,
  ContestRegistrationOptions,
} from "@/features/client-contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientContestSubscribeDialogProps = {
  contest: Contest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: (subscription: ContestSubscription) => void;
};

function hasValidRegistrationOptions(
  options: ContestRegistrationOptions,
): boolean {
  return (
    options.initial_amounts.length > 0 &&
    options.initial_amounts.every(
      (option) =>
        typeof option.amount === "number" && Number.isFinite(option.amount),
    ) &&
    options.leverages.length > 0 &&
    options.leverages.every(
      (option) =>
        typeof option.name === "string" && typeof option.value === "number",
    )
  );
}

export function ClientContestSubscribeDialog({
  contest,
  open,
  onOpenChange,
  onSubscribed,
}: ClientContestSubscribeDialogProps) {
  const [accounts, setAccounts] = useState<ClientEligibleAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [options, setOptions] = useState<ContestRegistrationOptions | null>(null);
  const [selectedInitialAmountId, setSelectedInitialAmountId] = useState("");
  const [selectedLeverageId, setSelectedLeverageId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadAccounts() {
      setLoadingAccounts(true);
      setError(null);
      setSelectedAccountId("");

      try {
        const response = contest.force_trading_account_creation
          ? await getContestRegistrationOptions(contest.id)
          : await listEligibleAccountsForContest(contest.id);
        if (!cancelled) {
          if (contest.force_trading_account_creation) {
            const registrationOptions = response as Awaited<ReturnType<typeof getContestRegistrationOptions>>;

            if (!hasValidRegistrationOptions(registrationOptions.data)) {
              throw new Error(
                "No se pudieron cargar correctamente los montos y leverages del contest.",
              );
            }

            setOptions(registrationOptions.data);
            setSelectedInitialAmountId(registrationOptions.data.initial_amounts[0]?.id ?? "");
            setSelectedLeverageId(registrationOptions.data.leverages[0]?.id ?? "");
          } else {
            const eligibleAccounts = response as Awaited<ReturnType<typeof listEligibleAccountsForContest>>;
            setAccounts(eligibleAccounts.data);
            setSelectedAccountId(eligibleAccounts.data[0]?.id ?? "");
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setAccounts([]); setOptions(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingAccounts(false);
        }
      }
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [contest.id, contest.force_trading_account_creation, open]);

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  async function handleSubmit() {
    if (!contest.force_trading_account_creation && !selectedAccountId) {
      setError("Selecciona una cuenta de trading elegible.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await subscribeToContest(contest.id, {
        ...(contest.force_trading_account_creation
          ? { initial_amount_id: selectedInitialAmountId, leverage_id: selectedLeverageId }
          : { account_id: selectedAccountId }),
        access_code: contest.is_protected ? accessCode.trim() || null : null,
      });
      onSubscribed(response.data);
      onOpenChange(false);
      setAccessCode("");
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscribirse en {contest.name}</DialogTitle>
          <DialogDescription>
            Elige la cuenta de trading con la que participarás en este concurso.
          </DialogDescription>
        </DialogHeader>

        {error ? <ApiErrorAlert message={error} /> : null}

        <div className="space-y-4">
          {loadingAccounts ? (
            <Skeleton className="h-10 w-full" />
          ) : contest.force_trading_account_creation ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Monto inicial</Label>
                <Select
                  value={selectedInitialAmountId}
                  onValueChange={(value) =>
                    setSelectedInitialAmountId(value ?? "")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un monto" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.initial_amounts.map((amount) => (
                      <SelectItem key={amount.id} value={amount.id}>
                        {amount.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Leverage</Label>
                <Select
                  value={selectedLeverageId}
                  onValueChange={(value) => setSelectedLeverageId(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un leverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.leverages.map((leverage) => (
                      <SelectItem key={leverage.id} value={leverage.id}>
                        {leverage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes cuentas elegibles para este concurso. Verifica el grupo
              de servidor, el balance mínimo/máximo y que la cuenta esté activa.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="eligible-account">Cuenta de trading</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(value) => setSelectedAccountId(value ?? "")}
              >
                <SelectTrigger id="eligible-account">
                  <SelectValue placeholder="Selecciona una cuenta">
                    {selectedAccount
                      ? `${selectedAccount.external_trader_id} — balance ${selectedAccount.current_balance}`
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.external_trader_id} — balance{" "}
                      {account.current_balance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {contest.is_protected ? (
            <div className="space-y-2">
              <Label htmlFor="access-code">Código de acceso</Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Código del concurso privado"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={submitting || loadingAccounts || (contest.force_trading_account_creation ? !selectedInitialAmountId || !selectedLeverageId : accounts.length === 0)}
            onClick={() => void handleSubmit()}
          >
            {submitting ? "Inscribiendo…" : "Confirmar inscripción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
