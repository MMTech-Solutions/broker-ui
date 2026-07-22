"use client";

import { useMemo, useState } from "react";

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
  adminAssignBonus,
  listEligibleAccountsForBonusOfferAdmin,
} from "@/features/bonus-offer/api";
import { formatDepositPercentValue } from "@/features/bonus-offer/format";
import type {
  AdminBonusAccountRequirement,
  AdminEligibleBonusAccount,
  BonusOffer,
} from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { formatInitialAmount } from "@/features/initial-amount/format";

type BonusOfferAdminAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bonusOffer: BonusOffer | null;
  onSuccess: () => void;
};

function formatMajorAmount(
  value: string | number | null | undefined,
  precision = 2,
): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(parsed);
}

function formatMinorAmount(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return formatInitialAmount(parsed);
}

function formatAccountBalance(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRewardSummary(offer: BonusOffer): string {
  const precision = offer.currency_precision ?? 2;

  if (offer.type === "deposit_triggered") {
    const percent =
      offer.deposit_percent != null
        ? formatDepositPercentValue(offer.deposit_percent)
        : "—";
    const max =
      offer.max_credit_amount != null
        ? formatMajorAmount(offer.max_credit_amount, precision)
        : null;

    return max != null
      ? `${percent}% of lifetime deposits (max ${max})`
      : `${percent}% of lifetime deposits`;
  }

  return offer.credit_amount != null
    ? formatMajorAmount(offer.credit_amount, precision)
    : "—";
}

function formatUnmetRequirement(
  requirement: AdminBonusAccountRequirement,
): string | null {
  if (requirement.met) {
    return null;
  }

  switch (requirement.code) {
    case "min_real_balance": {
      if (requirement.required <= 0) {
        return null;
      }

      const missing = Math.max(0, requirement.required - requirement.current);

      return `Missing ${formatMinorAmount(missing)} real balance (min ${formatMinorAmount(requirement.required)}).`;
    }
    case "min_deposit_amount": {
      if (requirement.required <= 0) {
        return null;
      }

      const missing = Math.max(0, requirement.required - requirement.current);

      return `Missing ${formatMinorAmount(missing)} lifetime deposits (min ${formatMinorAmount(requirement.required)}).`;
    }
    case "not_already_claimed":
      return "This user already claimed this manual offer.";
    case "no_active_bonus":
      return "Account already has an active bonus.";
    case "no_previous_deposit_bonus":
      return "Account already received a deposit-triggered bonus.";
    case "credit_amount_positive":
      return "Computed credit would be zero (lifetime deposits too low).";
    default:
      return `Requirement not met: ${requirement.code}.`;
  }
}

function getUnmetSummaries(
  requirements: AdminBonusAccountRequirement[],
): string[] {
  return requirements
    .map((requirement) => formatUnmetRequirement(requirement))
    .filter((value): value is string => value != null);
}

export function BonusOfferAdminAssignDialog({
  open,
  onOpenChange,
  bonusOffer,
  onSuccess,
}: BonusOfferAdminAssignDialogProps) {
  const [externalUserId, setExternalUserId] = useState("");
  const [loadedUserId, setLoadedUserId] = useState("");
  const [accounts, setAccounts] = useState<AdminEligibleBonusAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  const eligibleAccounts = useMemo(
    () => accounts.filter((account) => account.is_eligible),
    [accounts],
  );

  const selectedUnmet = selectedAccount
    ? getUnmetSummaries(selectedAccount.requirements)
    : [];

  const canAssign =
    !!bonusOffer &&
    !!loadedUserId &&
    !!selectedAccount?.is_eligible &&
    !loadingAccounts &&
    !submitting;

  function resetState() {
    setExternalUserId("");
    setLoadedUserId("");
    setAccounts([]);
    setSelectedAccountId("");
    setLoadError(null);
    setSubmitError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState();
    }

    onOpenChange(nextOpen);
  }

  async function handleLoadAccounts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bonusOffer) {
      return;
    }

    const trimmedUserId = externalUserId.trim();

    if (!trimmedUserId) {
      setLoadError("External user ID is required.");
      return;
    }

    setLoadingAccounts(true);
    setLoadError(null);
    setSubmitError(null);
    setSelectedAccountId("");
    setAccounts([]);
    setLoadedUserId("");

    try {
      const response = await listEligibleAccountsForBonusOfferAdmin(
        bonusOffer.id,
        trimmedUserId,
      );

      setAccounts(response.data);
      setLoadedUserId(trimmedUserId);

      const firstEligible = response.data.find((account) => account.is_eligible);
      setSelectedAccountId(firstEligible?.id ?? "");
    } catch (error) {
      setLoadError(formatBrokerApiError(error));
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleAssign() {
    if (!bonusOffer || !selectedAccount?.is_eligible || !loadedUserId) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await adminAssignBonus(bonusOffer.id, {
        account_id: selectedAccount.id,
        external_user_id: loadedUserId,
      });

      handleOpenChange(false);
      onSuccess();
    } catch (error) {
      setSubmitError(formatBrokerApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Assign bonus offer</DialogTitle>
          <DialogDescription>
            {bonusOffer
              ? `Force-assign “${bonusOffer.name}” to a user account. Eligibility rules still apply; deposit offers apply immediately (no watching intent).`
              : "Force-assign a bonus offer to a user account."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
          {loadError ? (
            <ApiErrorAlert
              title="Could not load eligible accounts"
              message={loadError}
            />
          ) : null}

          {submitError ? (
            <ApiErrorAlert
              title="Could not assign bonus"
              message={submitError}
            />
          ) : null}

          {bonusOffer ? (
            <div className="space-y-1 rounded-lg border p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="font-medium">
                  {bonusOffer.type === "deposit_triggered"
                    ? "Deposit triggered"
                    : "Manual claim"}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Credit:</span>{" "}
                <span className="font-medium">
                  {formatRewardSummary(bonusOffer)}
                </span>
              </p>
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={handleLoadAccounts}>
            <div className="space-y-2">
              <Label htmlFor="admin-assign-external-user-id">
                External user ID
              </Label>
              <div className="flex gap-2">
                <Input
                  id="admin-assign-external-user-id"
                  value={externalUserId}
                  onChange={(event) => setExternalUserId(event.target.value)}
                  placeholder="Opaque user identity"
                  disabled={loadingAccounts || submitting}
                  required
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loadingAccounts || submitting || !bonusOffer}
                >
                  {loadingAccounts ? "Loading..." : "Load accounts"}
                </Button>
              </div>
            </div>
          </form>

          {loadingAccounts ? <Skeleton className="h-10 w-full" /> : null}

          {!loadingAccounts && loadedUserId && accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidate accounts for this user. They need a live active
              account with positive balance in a server group linked to the
              offer.
            </p>
          ) : null}

          {!loadingAccounts && accounts.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="admin-assign-account">Trading account</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(value) => setSelectedAccountId(value ?? "")}
                disabled={submitting}
              >
                <SelectTrigger id="admin-assign-account" className="w-full">
                  <SelectValue placeholder="Select an account">
                    {selectedAccount
                      ? `${selectedAccount.external_trader_id} — balance ${formatAccountBalance(selectedAccount.current_balance)}${selectedAccount.is_eligible ? "" : " (not eligible)"}`
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => {
                    const unmet = getUnmetSummaries(account.requirements);

                    return (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                        disabled={!account.is_eligible}
                      >
                        <span className="flex flex-col items-start gap-0.5">
                          <span>
                            {account.external_trader_id} — balance{" "}
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
                  Accounts were found in linked server groups, but none meet
                  this offer&apos;s eligibility rules.
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
          ) : null}
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleAssign()}
            disabled={!canAssign}
          >
            {submitting ? "Assigning..." : "Assign bonus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
