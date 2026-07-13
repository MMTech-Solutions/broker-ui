"use client";

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
import {
  formatDateTime,
  PLACEMENT_ASSIGNED_BY_LABELS,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
  type IbPlanSubscription,
} from "@/features/ib-plan-subscription";

type IbPlanSubscriptionDetailDialogProps = {
  subscription: IbPlanSubscription | null;
  planName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function IbPlanSubscriptionDetailDialog({
  subscription,
  planName,
  open,
  onOpenChange,
}: IbPlanSubscriptionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Subscription details</DialogTitle>
          <DialogDescription>
            Review subscription parameters and current program placement.
          </DialogDescription>
        </DialogHeader>

        {subscription ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            <dl className="space-y-3">
              <DetailRow
                label="User ID"
                value={
                  <span className="font-mono text-xs">
                    {subscription.external_user_id}
                  </span>
                }
              />
              <DetailRow
                label="Plan"
                value={planName ?? subscription.plan?.name ?? subscription.ib_plan_id}
              />
              <DetailRow
                label="Status"
                value={
                  <Badge variant={subscriptionStatusVariant(subscription.status)}>
                    {subscriptionStatusLabel(subscription.status)}
                  </Badge>
                }
              />
              <DetailRow
                label="Personal rate"
                value={subscription.personal_rate}
              />
              <DetailRow
                label="Master IB"
                value={subscription.is_master ? "Yes" : "No"}
              />
              <DetailRow label="Master rate" value={subscription.master_rate} />
              <DetailRow
                label="Master level"
                value={String(subscription.master_level)}
              />
              <DetailRow
                label="Comments"
                value={subscription.comments?.trim() || "—"}
              />
              <DetailRow
                label="Created"
                value={formatDateTime(subscription.created_at)}
              />
              <DetailRow
                label="Updated"
                value={formatDateTime(subscription.updated_at)}
              />
            </dl>

            {subscription.status === "active" && subscription.placement ? (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Program placement</p>
                <dl className="space-y-3">
                  <DetailRow
                    label="Program"
                    value={
                      subscription.placement.program?.name ??
                      subscription.placement.ib_program_id
                    }
                  />
                  <DetailRow
                    label="Pinned"
                    value={subscription.placement.is_pinned ? "Yes" : "No"}
                  />
                  <DetailRow
                    label="Assigned by"
                    value={
                      PLACEMENT_ASSIGNED_BY_LABELS[
                        subscription.placement.assigned_by
                      ] ?? subscription.placement.assigned_by
                    }
                  />
                  <DetailRow
                    label="Assigned at"
                    value={formatDateTime(subscription.placement.assigned_at)}
                  />
                  <DetailRow
                    label="Progression metric"
                    value={
                      subscription.placement.progression_metric_value ?? "—"
                    }
                  />
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
