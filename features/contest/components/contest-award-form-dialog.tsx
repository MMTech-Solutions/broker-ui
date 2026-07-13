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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContestAward, updateContestAward } from "@/features/contest/api";
import {
  CONTEST_AWARD_TYPES,
  type ContestAward,
  type ContestAwardType,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ContestAwardFormDialogProps = {
  award?: ContestAward | null;
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  award_type: ContestAwardType;
};

const emptyForm: FormState = {
  name: "",
  award_type: "money",
};

export function ContestAwardFormDialog({
  award,
  mode,
  open,
  onOpenChange,
  onSuccess,
}: ContestAwardFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && award) {
      setForm({
        name: award.name,
        award_type: award.award_type,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, award]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name.trim()) {
        setError("Award name is required.");
        return;
      }

      if (mode === "create") {
        await createContestAward({
          name: form.name.trim(),
          award_type: form.award_type,
        });
      } else if (award) {
        await updateContestAward(award.id, {
          name: form.name.trim(),
          award_type: form.award_type,
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create"
              ? "Create award template"
              : "Edit award template"}
          </DialogTitle>
          <DialogDescription>
            Reusable prize definitions that can be assigned to contests with a
            position.
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
                    ? "Could not create award"
                    : "Could not update award"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="contest-award-name">Name</Label>
              <Input
                id="contest-award-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-award-type">Type</Label>
              <Select
                value={form.award_type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    award_type: (value ?? "money") as ContestAwardType,
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger id="contest-award-type" className="w-full">
                  <SelectValue placeholder="Select award type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTEST_AWARD_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
