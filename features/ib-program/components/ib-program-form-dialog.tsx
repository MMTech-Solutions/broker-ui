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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIbProgram, updateIbProgram } from "@/features/ib-program/api";
import {
  IB_PROGRAM_SETTLEMENT_PERIODS,
  type IbProgram,
  type IbProgramSettlementPeriod,
  type UpdateIbProgramInput,
} from "@/features/ib-program/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type IbProgramFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ibProgram?: IbProgram | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  settlement_period: IbProgramSettlementPeriod;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  settlement_period: "daily",
  is_active: true,
};

export function IbProgramFormDialog({
  open,
  onOpenChange,
  mode,
  ibProgram,
  onSuccess,
}: IbProgramFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && ibProgram) {
      setForm({
        name: ibProgram.name,
        description: ibProgram.description,
        settlement_period: ibProgram.settlement_period,
        is_active: ibProgram.is_active,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, ibProgram]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        if (!form.name.trim() || !form.description.trim()) {
          setError("Name and description are required.");
          return;
        }

        await createIbProgram({
          name: form.name.trim(),
          description: form.description.trim(),
          settlement_period: form.settlement_period,
          is_active: form.is_active,
        });
      } else if (ibProgram) {
        const payload: UpdateIbProgramInput = {
          name: form.name.trim(),
          description: form.description.trim(),
          settlement_period: form.settlement_period,
          is_active: form.is_active,
        };

        await updateIbProgram(ibProgram.id, payload);
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
            {mode === "create" ? "Create IB program" : "Edit IB program"}
          </DialogTitle>
          <DialogDescription>
            IB programs define settlement rules and reward configuration.
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
                    ? "Could not create IB program"
                    : "Could not update IB program"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="ib-program-name">Name</Label>
              <Input
                id="ib-program-name"
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
              <Label htmlFor="ib-program-description">Description</Label>
              <textarea
                id="ib-program-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                disabled={submitting}
                required
                rows={4}
                className={cn(
                  "flex min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-program-settlement-period">
                Settlement period
              </Label>
              <Select
                value={form.settlement_period}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    settlement_period: (value ??
                      "daily") as IbProgramSettlementPeriod,
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger
                  id="ib-program-settlement-period"
                  className="w-full"
                >
                  <SelectValue placeholder="Select settlement period" />
                </SelectTrigger>
                <SelectContent>
                  {IB_PROGRAM_SETTLEMENT_PERIODS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="ib-program-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_active: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="ib-program-is-active">Active</Label>
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
