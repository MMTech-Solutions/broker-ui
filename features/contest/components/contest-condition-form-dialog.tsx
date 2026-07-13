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
  createContestCondition,
  updateContestCondition,
} from "@/features/contest/api";
import type { ContestCondition } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ContestConditionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  condition?: ContestCondition | null;
  onSuccess: () => void;
};

type FormState = {
  title: string;
  body: string;
};

const emptyForm: FormState = {
  title: "",
  body: "",
};

export function ContestConditionFormDialog({
  open,
  onOpenChange,
  mode,
  condition,
  onSuccess,
}: ContestConditionFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && condition) {
      setForm({
        title: condition.title,
        body: condition.body,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, condition]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.title.trim() || !form.body.trim()) {
        setError("Title and body are required.");
        return;
      }

      if (mode === "create") {
        await createContestCondition({
          title: form.title.trim(),
          body: form.body.trim(),
        });
      } else if (condition) {
        await updateContestCondition(condition.id, {
          title: form.title.trim(),
          body: form.body.trim(),
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create"
              ? "Create condition template"
              : "Edit condition template"}
          </DialogTitle>
          <DialogDescription>
            Reusable terms and rules that can be assigned to contests.
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
                    ? "Could not create condition"
                    : "Could not update condition"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="contest-condition-title">Title</Label>
              <Input
                id="contest-condition-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-condition-body">Body (HTML)</Label>
              <textarea
                id="contest-condition-body"
                value={form.body}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                disabled={submitting}
                required
                rows={10}
                className={cn(
                  "flex min-h-40 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
                )}
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
