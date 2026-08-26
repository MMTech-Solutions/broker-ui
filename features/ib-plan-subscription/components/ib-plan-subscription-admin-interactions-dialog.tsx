"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDateTime,
  listIbPlanSubscriptionAdminInteractions,
  type IbPlanSubscription,
  type IbPlanSubscriptionAdminInteraction,
} from "@/features/ib-plan-subscription";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPlanSubscriptionAdminInteractionsDialogProps = {
  ibPlanId: string;
  subscription: IbPlanSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ACTION_LABELS: Record<IbPlanSubscriptionAdminInteraction["action"], string> = {
  created_by_admin: "Created by admin",
  approved: "Approved",
  denied: "Denied",
  parameters_updated: "Parameters updated",
  placement_updated: "Placement updated",
};

function adminLabel(interaction: IbPlanSubscriptionAdminInteraction): string {
  return (
    interaction.admin.name?.trim() ||
    interaction.admin.email?.trim() ||
    interaction.admin.id
  );
}

export function IbPlanSubscriptionAdminInteractionsDialog({
  ibPlanId,
  subscription,
  open,
  onOpenChange,
}: IbPlanSubscriptionAdminInteractionsDialogProps) {
  const [interactions, setInteractions] = useState<
    IbPlanSubscriptionAdminInteraction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription) {
      return;
    }

    const subscriptionId = subscription.id;
    let cancelled = false;

    async function loadInteractions() {
      setLoading(true);
      setError(null);

      try {
        const response = await listIbPlanSubscriptionAdminInteractions(
          ibPlanId,
          subscriptionId,
        );

        if (!cancelled) {
          setInteractions(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setInteractions([]);
          setError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInteractions();

    return () => {
      cancelled = true;
    };
  }, [ibPlanId, open, subscription]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Interaction logs</DialogTitle>
          <DialogDescription>
            Administrative actions for this subscription. Expand an entry to
            inspect its recorded changes.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : null}

          {error ? <ApiErrorAlert title="Could not load interaction logs" message={error} /> : null}

          {!loading && !error && interactions.length === 0 ? (
            <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              No administrative interactions have been recorded.
            </p>
          ) : null}

          {!loading && !error && interactions.length > 0 ? (
            <div className="divide-y rounded-lg border">
              {interactions.map((interaction) => (
                <details key={interaction.id} className="group">
                  <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 p-3 hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {ACTION_LABELS[interaction.action]}
                        </Badge>
                        <span className="truncate text-sm font-medium">
                          {adminLabel(interaction)}
                        </span>
                      </div>
                      {interaction.admin.email?.trim() ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {interaction.admin.email}
                        </p>
                      ) : null}
                    </div>
                    <time className="text-right text-xs text-muted-foreground">
                      {formatDateTime(interaction.created_at)}
                    </time>
                  </summary>
                  <div className="border-t bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Metadata
                    </p>
                    <pre className="max-h-56 overflow-auto rounded-md bg-background p-3 text-xs whitespace-pre-wrap break-words">
                      {JSON.stringify(interaction.metadata ?? {}, null, 2)}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
