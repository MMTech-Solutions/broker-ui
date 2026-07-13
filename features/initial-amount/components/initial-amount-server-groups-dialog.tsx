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
  getInitialAmount,
  syncInitialAmountServerGroups,
} from "@/features/initial-amount/api";
import { formatInitialAmount } from "@/features/initial-amount/format";
import type { InitialAmount } from "@/features/initial-amount/types";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ServerGroupOption = {
  id: string;
  label: string;
};

type InitialAmountServerGroupsDialogProps = {
  initialAmount: InitialAmount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InitialAmountServerGroupsDialog({
  initialAmount,
  open,
  onOpenChange,
  onSuccess,
}: InitialAmountServerGroupsDialogProps) {
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

  useEffect(() => {
    if (!open || !initialAmount) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [amountResponse, serversResponse] = await Promise.all([
          getInitialAmount(initialAmount.id),
          listTradingServersForAdmin({
            per_page: 100,
            is_active: true,
            environment: TRADING_SERVER_ENVIRONMENT.DEMO,
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

            return groupsResponse.data.map((group) => ({
              id: group.id,
              label: `${server.connection_signature} · ${group.name}`,
            }));
          }),
        );

        if (cancelled) {
          return;
        }

        setServerGroupOptions(
          groupsByServer.flat().sort((left, right) =>
            left.label.localeCompare(right.label),
          ),
        );

        const demoServerGroupIds = new Set(
          groupsByServer.flat().map((option) => option.id),
        );

        setSelectedServerGroupIds(
          (amountResponse.data.server_groups ?? [])
            .map((entry) => entry.id)
            .filter((id) => demoServerGroupIds.has(id)),
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
  }, [initialAmount, open]);

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

    if (!initialAmount) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await syncInitialAmountServerGroups(
        initialAmount.id,
        selectedServerGroupIds,
      );
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Server groups</DialogTitle>
          <DialogDescription>
            Choose which server groups can use the default amount of{" "}
            <span className="font-medium text-foreground">
              {initialAmount
                ? formatInitialAmount(initialAmount.amount)
                : "—"}
            </span>{" "}
            for demo accounts when the group has no default amount configured.
            Only server groups on demo trading servers are available.
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
                No demo server groups found.
              </p>
            ) : null}

            {!loading
              ? serverGroupOptions.map((option) => {
                  const checkboxId = `initial-amount-group-${option.id}`;

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
                        disabled={submitting}
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="flex-1 cursor-pointer"
                      >
                        {option.label}
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
