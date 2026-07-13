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
  getInsurancePlan,
  syncInsurancePlanServerGroups,
} from "@/features/insurance/api";
import type { InsurancePlan } from "@/features/insurance/types";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { formatBrokerApiError } from "@/lib/api/errors";

type ServerGroupOption = {
  id: string;
  label: string;
};

type InsurancePlanServerGroupsDialogProps = {
  insurancePlan: InsurancePlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InsurancePlanServerGroupsDialog({
  insurancePlan,
  open,
  onOpenChange,
  onSuccess,
}: InsurancePlanServerGroupsDialogProps) {
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
    if (!open || !insurancePlan) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [planResponse, serversResponse] = await Promise.all([
          getInsurancePlan(insurancePlan.id),
          listTradingServersForAdmin({ per_page: 100, is_active: true }),
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
        setSelectedServerGroupIds(
          (planResponse.data.server_groups ?? []).map(
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
  }, [insurancePlan, open]);

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

    if (!insurancePlan) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await syncInsurancePlanServerGroups(
        insurancePlan.id,
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
            Choose which server groups can access{" "}
            <span className="font-medium text-foreground">
              {insurancePlan?.name ?? "this plan"}
            </span>
            . An empty list makes the plan available on all groups.
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
                  <Skeleton key={`group-skeleton-${index}`} className="h-10 w-full" />
                ))}
              </div>
            ) : null}

            {!loading && serverGroupOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No server groups found.
              </p>
            ) : null}

            {!loading
              ? serverGroupOptions.map((option) => {
                  const checkboxId = `insurance-plan-group-${option.id}`;

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
                      <Label htmlFor={checkboxId} className="flex-1 cursor-pointer">
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
