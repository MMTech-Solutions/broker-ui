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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBonusOffer,
  syncBonusOfferServerGroups,
} from "@/features/bonus-offer/api";
import type { BonusOffer } from "@/features/bonus-offer/types";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { formatServerGroupOptionLabel, getServerGroupCurrency, hasResolvedServerGroupCurrency } from "@/features/trading-server/format";
import type { ServerGroup } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ServerGroupOption = {
  id: string;
  label: string;
  precision: number;
};

type BonusOfferServerGroupsDialogProps = {
  bonusOffer: BonusOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function toServerGroupOption(
  server: { connection_signature: string },
  group: ServerGroup,
): ServerGroupOption {
  const currency = getServerGroupCurrency(group.currency);
  const currencyResolved = hasResolvedServerGroupCurrency(group.currency);

  return {
    id: group.id,
    label: formatServerGroupOptionLabel(
      group.name,
      group.currency,
      server.connection_signature,
    ),
    precision: currencyResolved ? currency.precision : -1,
  };
}

export function BonusOfferServerGroupsDialog({
  bonusOffer,
  open,
  onOpenChange,
  onSuccess,
}: BonusOfferServerGroupsDialogProps) {
  const [serverGroupOptions, setServerGroupOptions] = useState<
    ServerGroupOption[]
  >([]);
  const [selectedServerGroupIds, setSelectedServerGroupIds] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(
    () => new Set(selectedServerGroupIds),
    [selectedServerGroupIds],
  );

  const lockedPrecision = useMemo(() => {
    const selected = serverGroupOptions.filter((option) =>
      selectedSet.has(option.id),
    );
    const precision = selected[0]?.precision;

    if (precision == null || precision < 0) {
      return null;
    }

    return precision;
  }, [selectedSet, serverGroupOptions]);

  useEffect(() => {
    if (!open || !bonusOffer) {
      return;
    }

    const offer = bonusOffer;
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [offerResponse, serversResponse] = await Promise.all([
          getBonusOffer(offer.id),
          listTradingServersForAdmin({
            per_page: 100,
            is_active: true,
            platform_id: offer.platform_id,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const groupsByServer = await Promise.all(
          serversResponse.data.map(async (server) => {
            const groupsResponse = await listServerGroupsForAdmin(server.id, {
              per_page: 100,
            });

            return groupsResponse.data.map((group) =>
              toServerGroupOption(server, group),
            );
          }),
        );

        if (cancelled) {
          return;
        }

        setServerGroupOptions(
          groupsByServer
            .flat()
            .sort((left, right) => left.label.localeCompare(right.label)),
        );
        setSelectedServerGroupIds(
          (offerResponse.data.server_groups ?? []).map(
            (entry) => entry.server_group_id,
          ),
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setServerGroupOptions([]);
          setSelectedServerGroupIds([]);
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
  }, [bonusOffer, open]);

  function toggleServerGroup(serverGroupId: string, checked: boolean) {
    setSelectedServerGroupIds((current) => {
      if (checked) {
        return current.includes(serverGroupId)
          ? current
          : [...current, serverGroupId];
      }

      return current.filter((id) => id !== serverGroupId);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bonusOffer) {
      return;
    }

    const selected = serverGroupOptions.filter((option) =>
      selectedSet.has(option.id),
    );
    const precisions = [
      ...new Set(
        selected
          .filter((option) => option.precision >= 0)
          .map((option) => option.precision),
      ),
    ];

    if (precisions.length > 1) {
      setError(
        "All selected server groups must share the same currency precision.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await syncBonusOfferServerGroups(bonusOffer.id, {
        server_group_ids: selectedServerGroupIds,
      });
      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const description =
    bonusOffer?.type === "deposit_triggered"
      ? "Deposit-triggered offers only match deposits on linked server groups. An empty list means this offer will not apply automatically."
      : "Manual claim eligibility is limited to accounts in the selected server groups. An empty list does not restrict by server group.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Server groups</DialogTitle>
          <DialogDescription>
            Choose which server groups apply to{" "}
            <span className="font-medium text-foreground">
              {bonusOffer?.name ?? "this offer"}
            </span>
            . Only groups from this offer&apos;s platform are listed. All
            selected groups must share the same currency precision.{" "}
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not sync server groups"
                message={error}
              />
            ) : null}

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`group-skeleton-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : null}

            {!loading && serverGroupOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No server groups found for this offer&apos;s platform.
              </p>
            ) : null}

            {!loading
              ? serverGroupOptions.map((option) => {
                  const checkboxId = `bonus-offer-group-${option.id}`;
                  const currencyUnavailable = option.precision < 0;
                  const disabledByPrecision =
                    lockedPrecision != null &&
                    option.precision !== lockedPrecision &&
                    !selectedSet.has(option.id);

                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={selectedSet.has(option.id)}
                        onCheckedChange={(checked) =>
                          toggleServerGroup(option.id, checked === true)
                        }
                        disabled={
                          submitting ||
                          currencyUnavailable ||
                          disabledByPrecision
                        }
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="flex-1 cursor-pointer"
                      >
                        {option.label}
                        {currencyUnavailable
                          ? " — currency unavailable"
                          : disabledByPrecision
                            ? " — different precision"
                            : ""}
                      </Label>
                    </div>
                  );
                })
              : null}
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
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Saving..." : "Save server groups"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
