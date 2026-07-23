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
  createInsurancePlan,
  updateInsurancePlan,
} from "@/features/insurance/api";
import type {
  CreateInsurancePlanInput,
  InsurancePlan,
  UpdateInsurancePlanInput,
} from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type InsurancePlanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  insurancePlan?: InsurancePlan | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  requires_approval: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  requires_approval: true,
  is_active: false,
};

function planToForm(plan: InsurancePlan): FormState {
  return {
    name: plan.name,
    description: plan.description ?? "",
    requires_approval: plan.requires_approval,
    is_active: plan.is_active,
  };
}

export function InsurancePlanFormDialog({
  open,
  onOpenChange,
  mode,
  insurancePlan,
  onSuccess,
}: InsurancePlanFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm(insurancePlan ? planToForm(insurancePlan) : emptyForm);
  }, [insurancePlan, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateInsurancePlanInput = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      requires_approval: form.requires_approval,
      is_active: form.is_active,
    };

    try {
      if (mode === "create") {
        await createInsurancePlan(payload);
      } else if (insurancePlan) {
        await updateInsurancePlan(
          insurancePlan.id,
          payload as UpdateInsurancePlanInput,
        );
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create insurance plan" : "Edit insurance plan"}
          </DialogTitle>
          <DialogDescription>
            Define plan metadata and whether claims require manual approval.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert
              title="Could not save insurance plan"
              message={error}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="insurance-plan-name">Name</Label>
            <Input
              id="insurance-plan-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance-plan-description">Description</Label>
            <textarea
              id="insurance-plan-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              disabled={submitting}
              rows={3}
              className={cn(
                "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
              )}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="insurance-plan-requires-approval"
                checked={form.requires_approval}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    requires_approval: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="insurance-plan-requires-approval">
                Requires approval
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="insurance-plan-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_active: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="insurance-plan-is-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
