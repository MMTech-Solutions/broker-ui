"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBonusOffer,
  listEligibleIntroducingBrokers,
  syncBonusOfferIntroducingBrokers,
} from "@/features/bonus-offer/api";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type BonusOfferIntroducingBrokersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bonusOffer: BonusOffer | null;
  onSuccess: () => void;
};

function sortedIdsSignature(ids: string[]): string {
  return [...ids].sort().join("|");
}

export function BonusOfferIntroducingBrokersDialog({
  open,
  onOpenChange,
  bonusOffer,
  onSuccess,
}: BonusOfferIntroducingBrokersDialogProps) {
  const [eligibleIds, setEligibleIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialSignature, setInitialSignature] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bonusOfferId = bonusOffer?.id;

  useEffect(() => {
    if (!open || !bonusOfferId) {
      return;
    }

    const offerId = bonusOfferId;
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setSearch("");

      try {
        const [offerResponse, eligibleResponse] = await Promise.all([
          getBonusOffer(offerId),
          listEligibleIntroducingBrokers({
            exclude_bonus_offer_id: offerId,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const linkedIds = (offerResponse.data.introducing_brokers ?? []).map(
          (broker) => broker.external_user_id,
        );
        const eligible = eligibleResponse.data.map(
          (broker) => broker.external_user_id,
        );

        setEligibleIds(eligible);
        setSelectedIds(linkedIds);
        setInitialSignature(sortedIdsSignature(linkedIds));
      } catch (error) {
        if (!cancelled) {
          setLoadError(formatBrokerApiError(error));
          setEligibleIds([]);
          setSelectedIds([]);
          setInitialSignature("");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [bonusOfferId, open]);

  const filteredEligibleIds = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return eligibleIds;
    }

    return eligibleIds.filter((id) => id.toLowerCase().includes(query));
  }, [eligibleIds, search]);

  const isDirty = sortedIdsSignature(selectedIds) !== initialSignature;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggleId(externalUserId: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(externalUserId)
          ? current
          : [...current, externalUserId];
      }

      return current.filter((id) => id !== externalUserId);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bonusOfferId) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await syncBonusOfferIntroducingBrokers(bonusOfferId, {
        external_user_ids: selectedIds,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      setSubmitError(formatBrokerApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Linked introducing brokers</DialogTitle>
          <DialogDescription>
            {bonusOffer
              ? `Select active IBs for “${bonusOffer.name}”. Leave empty to keep this as the default deposit offer (no IB link).`
              : "Select active IBs for this deposit-triggered offer."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {loadError ? (
              <ApiErrorAlert
                title="Could not load introducing brokers"
                message={loadError}
              />
            ) : null}

            {submitError ? (
              <ApiErrorAlert
                title="Could not update introducing brokers"
                message={submitError}
              />
            ) : null}

            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length === 0
                    ? "No IBs selected — this offer acts as the system default deposit bonus when no IB-linked offer matches."
                    : `${selectedIds.length} IB${selectedIds.length === 1 ? "" : "s"} selected.`}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="bonus-offer-ib-search">Search</Label>
                  <Input
                    id="bonus-offer-ib-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filter by external user ID"
                    disabled={submitting || eligibleIds.length === 0}
                  />
                </div>

                <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {eligibleIds.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No eligible introducing brokers. Active IB partners already
                      linked to another deposit offer are excluded.
                    </p>
                  ) : null}

                  {eligibleIds.length > 0 && filteredEligibleIds.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No introducing brokers match this search.
                    </p>
                  ) : null}

                  {filteredEligibleIds.map((externalUserId) => {
                    const checkboxId = `bonus-offer-ib-${externalUserId}`;
                    const checked = selectedSet.has(externalUserId);

                    return (
                      <label
                        key={externalUserId}
                        htmlFor={checkboxId}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleId(externalUserId, value === true)
                          }
                          disabled={submitting}
                        />
                        <span className="font-mono text-sm break-all">
                          {externalUserId}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading || !!loadError || !isDirty}
            >
              {submitting ? "Saving..." : "Save links"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
