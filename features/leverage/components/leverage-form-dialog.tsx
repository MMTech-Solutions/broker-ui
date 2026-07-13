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
import { createLeverage, updateLeverage } from "@/features/leverage/api";
import type { Leverage } from "@/features/leverage/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type LeverageFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  leverage?: Leverage | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  value: string;
};

const emptyForm: FormState = {
  name: "",
  value: "100",
};

export function LeverageFormDialog({
  open,
  onOpenChange,
  mode,
  leverage,
  onSuccess,
}: LeverageFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && leverage) {
      setForm({
        name: leverage.name,
        value: String(leverage.value),
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, leverage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const value = Number.parseInt(form.value, 10);

    if (!form.name.trim()) {
      setError("name: is required.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(value) || value < 1) {
      setError("value: must be an integer greater than or equal to 1.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        await createLeverage({
          name: form.name.trim(),
          value,
        });
      } else if (leverage) {
        await updateLeverage(leverage.id, {
          name: form.name.trim(),
          value,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create leverage" : "Edit leverage"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Register a leverage profile for trading accounts and server groups."
              : `Update settings for ${leverage?.name ?? "leverage"}.`}
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
                    ? "Could not create leverage"
                    : "Could not update leverage"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="leverage-name">Name</Label>
              <Input
                id="leverage-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="1:100"
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leverage-value">Value</Label>
              <Input
                id="leverage-value"
                type="number"
                min={1}
                step={1}
                value={form.value}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
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
