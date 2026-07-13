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
import { listLeverages } from "@/features/leverage/api";
import type { Leverage } from "@/features/leverage/types";
import {
  listServerGroupLeverages,
  synchronizeServerGroupLeverages,
} from "@/features/trading-server/api";
import type { ServerGroup } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ServerGroupLeveragesSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradingServerId: string;
  serverGroup: ServerGroup | null;
  onSuccess: (message: string) => void;
};

export function ServerGroupLeveragesSyncDialog({
  open,
  onOpenChange,
  tradingServerId,
  serverGroup,
  onSuccess,
}: ServerGroupLeveragesSyncDialogProps) {
  const [catalogLeverages, setCatalogLeverages] = useState<Leverage[]>([]);
  const [selectedLeverageIds, setSelectedLeverageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(
    () => new Set(selectedLeverageIds),
    [selectedLeverageIds],
  );

  useEffect(() => {
    if (!open || !serverGroup) {
      return;
    }

    let cancelled = false;

    async function loadLeverages() {
      setLoading(true);
      setError(null);

      try {
        const [catalogResponse, assignedResponse] = await Promise.all([
          listLeverages({ per_page: 100 }),
          listServerGroupLeverages(tradingServerId, serverGroup.id, {
            per_page: 100,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setCatalogLeverages(catalogResponse.data);
        setSelectedLeverageIds(assignedResponse.data.map((leverage) => leverage.id));
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setCatalogLeverages([]);
          setSelectedLeverageIds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLeverages();

    return () => {
      cancelled = true;
    };
  }, [open, serverGroup, tradingServerId]);

  function toggleLeverage(leverageId: string, checked: boolean) {
    setSelectedLeverageIds((current) => {
      if (checked) {
        return current.includes(leverageId)
          ? current
          : [...current, leverageId];
      }

      return current.filter((id) => id !== leverageId);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!serverGroup) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await synchronizeServerGroupLeverages(
        tradingServerId,
        serverGroup.id,
        selectedLeverageIds,
      );

      onOpenChange(false);
      onSuccess(`Synchronized leverages for ${serverGroup.name}.`);
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Synchronize leverages</DialogTitle>
          <DialogDescription>
            Choose which leverage profiles are available for{" "}
            <span className="font-medium text-foreground">
              {serverGroup?.name ?? "this server group"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not synchronize leverages"
                message={error}
              />
            ) : null}

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`leverage-skeleton-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : null}

            {!loading && catalogLeverages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leverage profiles found. Create leverages under Trading
                first.
              </p>
            ) : null}

            {!loading
              ? catalogLeverages.map((leverage) => {
                  const checkboxId = `server-group-leverage-${leverage.id}`;

                  return (
                    <div
                      key={leverage.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={selectedSet.has(leverage.id)}
                        onCheckedChange={(checked) =>
                          toggleLeverage(leverage.id, checked === true)
                        }
                        disabled={submitting}
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="flex flex-1 cursor-pointer items-center justify-between gap-3"
                      >
                        <span className="font-medium">{leverage.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {leverage.value}
                        </span>
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
              {submitting ? "Saving..." : "Save leverages"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
