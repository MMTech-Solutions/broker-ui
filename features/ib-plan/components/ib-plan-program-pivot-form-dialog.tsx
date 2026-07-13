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
import type { PlanProgramAssignment } from "@/features/ib-plan/types";

type IbPlanProgramPivotFormDialogProps = {
  assignment: PlanProgramAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    sortOrder: number;
    progressionMinVolume: string;
    progressionMaxVolume: string;
  }) => void;
};

type FormState = {
  sortOrder: string;
  progressionMinVolume: string;
  progressionMaxVolume: string;
};

export function IbPlanProgramPivotFormDialog({
  assignment,
  open,
  onOpenChange,
  onSave,
}: IbPlanProgramPivotFormDialogProps) {
  const [form, setForm] = useState<FormState>({
    sortOrder: "0",
    progressionMinVolume: "0",
    progressionMaxVolume: "0",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !assignment) {
      return;
    }

    setError(null);
    setForm({
      sortOrder: String(assignment.sortOrder),
      progressionMinVolume: assignment.progressionMinVolume,
      progressionMaxVolume: assignment.progressionMaxVolume,
    });
  }, [open, assignment]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    const min = form.progressionMinVolume.trim();
    const max = form.progressionMaxVolume.trim();

    if (Number.isNaN(sortOrder) || sortOrder < 0) {
      setError("Sort order must be a non-negative integer.");
      return;
    }

    if (!min || !max) {
      setError("Progression thresholds are required.");
      return;
    }

    if (Number.parseFloat(max) <= Number.parseFloat(min)) {
      setError("Max volume must be greater than min volume.");
      return;
    }

    if (sortOrder === 0 && Number.parseFloat(min) !== 0) {
      setError("The base program (sort order 0) must have min volume of 0.");
      return;
    }

    onSave({
      sortOrder,
      progressionMinVolume: min,
      progressionMaxVolume: max,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit plan program</DialogTitle>
          <DialogDescription>
            Update pivot thresholds for{" "}
            <span className="font-medium text-foreground">
              {assignment?.name ?? "this program"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="Invalid pivot values" message={error} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="plan-program-sort-order">Sort order</Label>
            <Input
              id="plan-program-sort-order"
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-program-min-volume">
              Progression min volume
            </Label>
            <Input
              id="plan-program-min-volume"
              type="number"
              min={0}
              step="any"
              value={form.progressionMinVolume}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  progressionMinVolume: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-program-max-volume">
              Progression max volume
            </Label>
            <Input
              id="plan-program-max-volume"
              type="number"
              min={0}
              step="any"
              value={form.progressionMaxVolume}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  progressionMaxVolume: event.target.value,
                }))
              }
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
