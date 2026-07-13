"use client";

import { useEffect, useState } from "react";

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
  updateIbPlanSubscriptionPlacement,
  type IbPlanSubscription,
} from "@/features/ib-plan-subscription";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPlanSubscriptionPlacementDialogProps = {
  ibPlanId: string;
  subscription: IbPlanSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function IbPlanSubscriptionPlacementDialog({
  ibPlanId,
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: IbPlanSubscriptionPlacementDialogProps) {
  const [programs, setPrograms] = useState<IbPlanProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription) {
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
  }, [open, ibPlanId, subscription]);

  useEffect(() => {
    if (!open || !subscription) {
      return;
    }

    setError(null);
    setSelectedProgramId(
      subscription.placement?.ib_program_id ?? "",
    );
    setIsPinned(subscription.placement?.is_pinned ?? false);
  }, [open, subscription]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subscription) {
      return;
    }

    const currentProgramId = subscription.placement?.ib_program_id ?? "";
    const programChanged =
      selectedProgramId !== "" && selectedProgramId !== currentProgramId;
    const pinChanged = isPinned !== (subscription.placement?.is_pinned ?? false);

    if (!programChanged && !pinChanged) {
      setError("Change the program or pin status before saving.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: {
        ib_program_id?: string;
        is_pinned?: boolean;
      } = {};

      if (programChanged) {
        payload.ib_program_id = selectedProgramId;
      }

      if (pinChanged) {
        payload.is_pinned = isPinned;
      }

      await updateIbPlanSubscriptionPlacement(
        ibPlanId,
        subscription.id,
        payload,
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Move IB program</DialogTitle>
          <DialogDescription>
            Manually assign the IB to a program in this plan or pin the current
            placement to block automatic progression.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not update placement"
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
                {subscription.placement?.program?.name ? (
                  <p className="mt-2">
                    <span className="text-muted-foreground">
                      Current program:
                    </span>{" "}
                    {subscription.placement.program.name}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="placement-program">Program</Label>
              <Select
                value={selectedProgramId}
                onValueChange={(value) => setSelectedProgramId(value ?? "")}
                disabled={submitting || loadingPrograms}
              >
                <SelectTrigger id="placement-program" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPrograms ? "Loading programs..." : "Select program"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="placement-is-pinned"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked === true)}
                disabled={submitting}
              />
              <Label htmlFor="placement-is-pinned">
                Pin program (disable automatic progression)
              </Label>
            </div>
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
            <Button type="submit" disabled={submitting || loadingPrograms}>
              {submitting ? "Saving..." : "Save placement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
