"use client";

import { useEffect, useMemo, useState } from "react";

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
  claimBonusOffer,
  listEligibleAccountsForBonusOffer,
} from "@/features/client-bonus/api";
import {
  formatAccountBalance,
  formatOfferRewardSummary,
  getOfferTermsSummary,
  getUnmetRequirementSummaries,
} from "@/features/client-bonus/format";
import type {
  BonusAssignment,
  ClientBonusEligibleAccount,
} from "@/features/client-bonus/types";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientBonusClaimDialogProps = {
  offer: BonusOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimed: (assignment: BonusAssignment) => void;
};

export function ClientBonusClaimDialog({
  offer,
  open,
  onOpenChange,
  onClaimed,
}: ClientBonusClaimDialogProps) {
  const [accounts, setAccounts] = useState<ClientBonusEligibleAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  const eligibleAccounts = useMemo(
    () => accounts.filter((account) => account.is_eligible),
    [accounts],
  );

  const canClaim =
    selectedAccount != null && selectedAccount.is_eligible && !loadingAccounts;

  useEffect(() => {
    if (!open || !offer) {
      return;
    }

    let cancelled = false;

    async function loadAccounts() {
      setLoadingAccounts(true);
      setError(null);
      setSelectedAccountId("");

      try {
        const response = await listEligibleAccountsForBonusOffer(offer.id);
        if (!cancelled) {
          setAccounts(response.data);
          const firstEligible = response.data.find(
            (account) => account.is_eligible,
          );
          setSelectedAccountId(firstEligible?.id ?? "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setAccounts([]);
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
  }, [offer, open]);

  async function handleSubmit() {
    if (!offer) {
      return;
    }

    if (!selectedAccountId || !selectedAccount?.is_eligible) {
      setError("Selecciona una cuenta que cumpla los requisitos del bono.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await claimBonusOffer(offer.id, {
        account_id: selectedAccountId,
      });
      onClaimed(response.data);
      onOpenChange(false);
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const terms = offer ? getOfferTermsSummary(offer) : [];
  const selectedUnmet = selectedAccount
    ? getUnmetRequirementSummaries(selectedAccount.requirements)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Reclamar bono</DialogTitle>
          <DialogDescription>
            {offer
              ? `Acredita el bono "${offer.name}" en una cuenta live elegible.`
              : "Selecciona la cuenta donde se aplicará el bono."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
          {error ? (
            <ApiErrorAlert title="No se pudo reclamar el bono" message={error} />
          ) : null}

          {offer ? (
            <div className="space-y-2 rounded-lg border p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Recompensa:</span>{" "}
                <span className="font-medium">
                  {formatOfferRewardSummary(offer)}
                </span>
              </p>
              {terms.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  {terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {loadingAccounts ? (
            <Skeleton className="h-10 w-full" />
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes cuentas candidatas para este bono. Verifica que tengas
              una cuenta live activa con saldo positivo en un grupo de servidor
              habilitado para la oferta.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bonus-eligible-account">Cuenta de trading</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={submitting}
              >
                <SelectTrigger id="bonus-eligible-account">
                  <SelectValue placeholder="Selecciona una cuenta">
                    {selectedAccount
                      ? `${selectedAccount.external_trader_id} — saldo ${formatAccountBalance(selectedAccount.current_balance)}${selectedAccount.is_eligible ? "" : " (no elegible)"}`
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => {
                    const unmet = getUnmetRequirementSummaries(
                      account.requirements,
                    );

                    return (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                        disabled={!account.is_eligible}
                      >
                        <span className="flex flex-col items-start gap-0.5">
                          <span>
                            {account.external_trader_id} — saldo{" "}
                            {formatAccountBalance(account.current_balance)}
                          </span>
                          {!account.is_eligible && unmet.length > 0 ? (
                            <span className="text-xs text-muted-foreground whitespace-normal">
                              {unmet.join(" ")}
                            </span>
                          ) : null}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {eligibleAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tienes cuentas en grupos habilitados, pero ninguna cumple aún
                  el balance o depósito mínimo de esta oferta.
                </p>
              ) : null}

              {selectedAccount && !selectedAccount.is_eligible ? (
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {selectedUnmet.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            El crédito de bono no es retirable hasta cumplir las condiciones de
            conversión. Si ya tienes un bono activo en la cuenta, este reclamo
            quedará en cola.
          </p>
        </div>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !canClaim || !offer}
          >
            {submitting ? "Reclamando..." : "Reclamar bono"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
