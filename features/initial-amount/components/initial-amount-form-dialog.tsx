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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInitialAmount,
  updateInitialAmount,
} from "@/features/initial-amount/api";
import {
  minorUnitsToMajorValue,
  parseMajorAmountToMinorUnits,
} from "@/features/initial-amount/format";
import type { InitialAmount } from "@/features/initial-amount/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type InitialAmountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialAmount?: InitialAmount | null;
  onSuccess: () => void;
};

type FormState = {
  amount: string;
};

const emptyForm: FormState = {
  amount: "1000",
};

export function InitialAmountFormDialog({
  open,
  onOpenChange,
  mode,
  initialAmount,
  onSuccess,
}: InitialAmountFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && initialAmount) {
      setForm({
        amount: minorUnitsToMajorValue(initialAmount.amount),
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, initialAmount]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const amount = parseMajorAmountToMinorUnits(form.amount);

    if (amount === undefined) {
      setError("amount: must be a valid monetary value greater than or equal to 0.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        await createInitialAmount({ amount });
      } else if (initialAmount) {
        await updateInitialAmount(initialAmount.id, { amount });
      }

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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create"
              ? "Create default amount"
              : "Edit default amount"}
          </DialogTitle>
          <DialogDescription>
            Enter the default balance amount for demo accounts (e.g. 1000.00).
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title={
                  mode === "create"
                    ? "Could not create default amount"
                    : "Could not update default amount"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="initial-amount-value">Amount</Label>
              <Input
                id="initial-amount-value"
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="1000.00"
                disabled={submitting}
                required
              />
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
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
