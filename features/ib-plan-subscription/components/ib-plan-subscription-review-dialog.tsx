"use client";

import { useEffect, useState } from "react";

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
import { listIbPlanPrograms } from "@/features/ib-plan/api";
import type { IbPlanProgram } from "@/features/ib-plan/types";
import {
  updateIbPlanSubscription,
  type IbPlanSubscription,
} from "@/features/ib-plan-subscription";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPlanSubscriptionReviewDialogProps = {
  ibPlanId: string;
  subscription: IbPlanSubscription | null;
  mode: "approve" | "reject";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function IbPlanSubscriptionReviewDialog({
  ibPlanId,
  subscription,
  mode,
  open,
  onOpenChange,
  onSuccess,
}: IbPlanSubscriptionReviewDialogProps) {
  const [programs, setPrograms] = useState<IbPlanProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("none");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || mode !== "approve" || !subscription) {
      return;
    }

    let cancelled = false;

    async function loadPrograms() {
      setLoadingPrograms(true);
      setError(null);

      try {
        const response = await listIbPlanPrograms(ibPlanId);
        if (!cancelled) {
          setPrograms(response.data.programs);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setPrograms([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPrograms(false);
        }
      }
    }

    void loadPrograms();

    return () => {
      cancelled = true;
    };
  }, [open, mode, ibPlanId, subscription]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setSelectedProgramId("none");
  }, [open, mode, subscription]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subscription) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "approve") {
        await updateIbPlanSubscription(ibPlanId, subscription.id, {
          status: "active",
          ib_program_id:
            selectedProgramId !== "none" ? selectedProgramId : undefined,
        });
      } else {
        await updateIbPlanSubscription(ibPlanId, subscription.id, {
          status: "denied",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const isApprove = mode === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isApprove ? "Approve subscription" : "Reject subscription"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Activate the subscription and optionally assign an initial program."
              : "Deny this pending subscription request."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title={
                  isApprove
                    ? "Could not approve subscription"
                    : "Could not reject subscription"
                }
                message={error}
              />
            ) : null}

            {subscription ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="font-mono text-xs">
                    {subscription.external_user_id}
                  </span>
                </p>
                {subscription.comments ? (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Comments:</span>{" "}
                    {subscription.comments}
                  </p>
                ) : null}
              </div>
            ) : null}

            {isApprove ? (
              <div className="space-y-2">
                <Label htmlFor="review-program">Initial program</Label>
                <Select
                  value={selectedProgramId}
                  onValueChange={(value) =>
                    setSelectedProgramId(value ?? "none")
                  }
                  disabled={submitting || loadingPrograms}
                >
                  <SelectTrigger id="review-program" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingPrograms
                          ? "Loading programs..."
                          : "Use plan default"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use plan default</SelectItem>
                    {programs.map((planProgram) => (
                      <SelectItem
                        key={planProgram.id}
                        value={planProgram.program.id}
                      >
                        {planProgram.program.name}
                        {planProgram.sort_order === 0 ? " (base)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave as default to place the IB on the base program
                  (sort order 0).
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The user will not be assigned to
                any program.
              </p>
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
              variant={isApprove ? "default" : "destructive"}
              disabled={submitting || loadingPrograms}
            >
              {submitting
                ? isApprove
                  ? "Approving..."
                  : "Rejecting..."
                : isApprove
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
