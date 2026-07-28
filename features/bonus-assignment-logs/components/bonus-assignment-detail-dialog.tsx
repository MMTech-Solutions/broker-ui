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
import { getBonusAssignment } from "@/features/bonus-assignment-logs/api";
import {
  bonusAssignmentOfferLabel,
  bonusAssignmentStatusLabel,
  bonusAssignmentStatusVariant,
  formatActivityProgress,
  formatDateTimeValue,
  formatExcludedInstrumentsSummary,
  formatMoneyValue,
  formatProgressPercent,
  truncateId,
} from "@/features/bonus-assignment-logs/format";
import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type BonusAssignmentDetailDialogProps = {
  assignmentId: string | null;
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
    <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function BonusAssignmentDetailDialog({
  assignmentId,
  open,
  onOpenChange,
}: BonusAssignmentDetailDialogProps) {
  const [assignment, setAssignment] = useState<BonusAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !assignmentId) {
      return;
    }

    let cancelled = false;

    async function loadAssignment() {
      setLoading(true);
      setError(null);

      try {
        const response = await getBonusAssignment(assignmentId);
        if (!cancelled) {
          setAssignment(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setAssignment(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, open]);

  const offerType =
    assignment?.offer_type ?? assignment?.bonus_offer?.type ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Assignment details</DialogTitle>
          <DialogDescription>
            Credited amount, conversion progress, and frozen offer snapshot.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
          {error ? (
            <ApiErrorAlert
              title="Could not load bonus assignment"
              message={error}
            />
          ) : null}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={`assignment-detail-skeleton-${index}`}
                  className="h-8 w-full"
                />
              ))}
            </div>
          ) : null}

          {!loading && assignment ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={bonusAssignmentStatusVariant(assignment.status)}
                >
                  {bonusAssignmentStatusLabel(assignment.status)}
                </Badge>
                {offerType ? (
                  <Badge variant="outline">{offerType}</Badge>
                ) : null}
                {assignment.pending_removal ? (
                  <Badge variant="outline">Pending removal</Badge>
                ) : null}
              </div>

              <dl className="space-y-3">
                <DetailRow
                  label="Offer"
                  value={bonusAssignmentOfferLabel(assignment)}
                />
                <DetailRow
                  label="Account"
                  value={
                    <span className="font-mono text-xs">
                      {assignment.account_id}
                    </span>
                  }
                />
                <DetailRow
                  label="User"
                  value={
                    <span className="font-mono text-xs">
                      {assignment.external_user_id}
                    </span>
                  }
                />
                <DetailRow
                  label="Credited amount"
                  value={
                    <span className="tabular-nums font-medium">
                      {formatMoneyValue(assignment.credited_amount)}
                      {assignment.currency
                        ? ` ${assignment.currency}`
                        : ""}
                    </span>
                  }
                />
                <DetailRow
                  label="Required activity"
                  value={
                    <span className="tabular-nums">
                      {formatMoneyValue(assignment.required_activity ?? null)}
                    </span>
                  }
                />
                <DetailRow
                  label="Progress"
                  value={
                    <span className="tabular-nums">
                      {formatProgressPercent(assignment.progress_ratio)}
                      {" · "}
                      {formatActivityProgress(
                        assignment.accumulated_activity,
                        assignment.required_activity,
                      )}
                    </span>
                  }
                />
                <DetailRow
                  label="Activated"
                  value={formatDateTimeValue(assignment.activated_at)}
                />
                <DetailRow
                  label="Conversion deadline"
                  value={formatDateTimeValue(assignment.conversion_deadline_at)}
                />
              </dl>

              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-medium">Rules snapshot</p>
                <dl className="space-y-3">
                  <DetailRow
                    label="Activity / credit unit"
                    value={
                      <span className="tabular-nums">
                        {formatMoneyValue(
                          assignment.activity_per_credit_unit ?? null,
                        )}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Conversion window"
                    value={
                      assignment.conversion_window_days != null
                        ? `${assignment.conversion_window_days} days`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Min position duration"
                    value={
                      assignment.min_position_duration_seconds != null
                        ? `${assignment.min_position_duration_seconds}s`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Burn on withdrawal"
                    value={
                      assignment.burn_on_withdrawal == null
                        ? "—"
                        : assignment.burn_on_withdrawal
                          ? "Yes"
                          : "No"
                    }
                  />
                  <DetailRow
                    label="Burn on negative balance"
                    value={
                      assignment.burn_on_negative_balance == null
                        ? "—"
                        : assignment.burn_on_negative_balance
                          ? "Yes"
                          : "No"
                    }
                  />
                  <DetailRow
                    label="Excluded instruments"
                    value={formatExcludedInstrumentsSummary(
                      assignment.excluded_instruments,
                    )}
                  />
                  <DetailRow
                    label="Assignment ID"
                    value={
                      <span className="font-mono text-xs">
                        {truncateId(assignment.id)}
                      </span>
                    }
                  />
                </dl>
              </div>
            </div>
          ) : null}
        </div>

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
