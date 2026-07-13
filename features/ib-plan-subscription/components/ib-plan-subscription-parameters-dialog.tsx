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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateIbPlanSubscriptionParameters,
  type IbPlanSubscription,
} from "@/features/ib-plan-subscription";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPlanSubscriptionParametersDialogProps = {
  ibPlanId: string;
  subscription: IbPlanSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  personal_rate: string;
  is_master: boolean;
  master_rate: string;
};

export function IbPlanSubscriptionParametersDialog({
  ibPlanId,
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: IbPlanSubscriptionParametersDialogProps) {
  const [form, setForm] = useState<FormState>({
    personal_rate: "0",
    is_master: false,
    master_rate: "0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription) {
      return;
    }

    setError(null);
    setForm({
      personal_rate: subscription.personal_rate,
      is_master: subscription.is_master,
      master_rate: subscription.master_rate,
    });
  }, [open, subscription]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subscription) {
      return;
    }

    const personalRate = Number(form.personal_rate);
    const masterRate = Number(form.master_rate);

    if (Number.isNaN(personalRate) || personalRate < 0) {
      setError("Personal rate must be a non-negative number.");
      return;
    }

    if (Number.isNaN(masterRate) || masterRate < 0) {
      setError("Master rate must be a non-negative number.");
      return;
    }

    const payload: {
      personal_rate?: number;
      is_master?: boolean;
      master_rate?: number;
    } = {};

    if (personalRate !== Number(subscription.personal_rate)) {
      payload.personal_rate = personalRate;
    }

    if (form.is_master !== subscription.is_master) {
      payload.is_master = form.is_master;
    }

    if (masterRate !== Number(subscription.master_rate)) {
      payload.master_rate = masterRate;
    }

    if (Object.keys(payload).length === 0) {
      setError("Change at least one parameter before saving.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateIbPlanSubscriptionParameters(
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
          <DialogTitle>Edit subscription parameters</DialogTitle>
          <DialogDescription>
            Update personal rate, master IB flag and master rate for this
            subscription.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not update parameters"
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
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-subscription-personal-rate">
                  Personal rate
                </Label>
                <Input
                  id="edit-subscription-personal-rate"
                  type="number"
                  min="0"
                  step="any"
                  value={form.personal_rate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      personal_rate: event.target.value,
                    }))
                  }
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subscription-master-rate">
                  Master rate
                </Label>
                <Input
                  id="edit-subscription-master-rate"
                  type="number"
                  min="0"
                  step="any"
                  value={form.master_rate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      master_rate: event.target.value,
                    }))
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-subscription-is-master"
                checked={form.is_master}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_master: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="edit-subscription-is-master">Master IB</Label>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save parameters"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
