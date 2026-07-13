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
import {
  createInsurancePlanOption,
  updateInsurancePlanOption,
} from "@/features/insurance/api";
import type {
  CreateInsurancePlanOptionInput,
  InsurancePlan,
  InsurancePlanOption,
  PremiumMode,
} from "@/features/insurance/types";
import { PREMIUM_MODES } from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type InsurancePlanOptionFormDialogProps = {
  insurancePlan: InsurancePlan | null;
  option: InsurancePlanOption | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  coverage_percentage: string;
  premium: string;
  premium_mode: PremiumMode;
  duration_days: string;
  minimum_balance: string;
  maximum_balance: string;
  is_free_first: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  coverage_percentage: "",
  premium: "",
  premium_mode: "fixed",
  duration_days: "30",
  minimum_balance: "0",
  maximum_balance: "0",
  is_free_first: false,
  is_active: true,
};

function optionToForm(option: InsurancePlanOption): FormState {
  return {
    coverage_percentage: String(option.coverage_percentage),
    premium: String(option.premium),
    premium_mode: option.premium_mode,
    duration_days: String(option.duration_days),
    minimum_balance: String(option.minimum_balance),
    maximum_balance: String(option.maximum_balance),
    is_free_first: option.is_free_first,
    is_active: option.is_active,
  };
}

export function InsurancePlanOptionFormDialog({
  insurancePlan,
  option,
  open,
  onOpenChange,
  onSuccess,
}: InsurancePlanOptionFormDialogProps) {
  const isCreateMode = option === null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm(option ? optionToForm(option) : emptyForm);
  }, [open, option]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!insurancePlan) {
      return;
    }

    const payload: CreateInsurancePlanOptionInput = {
      coverage_percentage: Number(form.coverage_percentage),
      premium: Number(form.premium),
      premium_mode: form.premium_mode,
      duration_days: Number(form.duration_days),
      minimum_balance: Number(form.minimum_balance),
      maximum_balance: Number(form.maximum_balance),
      is_free_first: form.is_free_first,
      is_active: form.is_active,
    };

    setSubmitting(true);
    setError(null);

    try {
      if (isCreateMode) {
        await createInsurancePlanOption(insurancePlan.id, payload);
      } else {
        await updateInsurancePlanOption(insurancePlan.id, option.id, payload);
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isCreateMode ? "Create plan option" : "Edit plan option"}
          </DialogTitle>
          <DialogDescription>
            Configure coverage, premium, and eligibility bounds for{" "}
            <span className="font-medium text-foreground">
              {insurancePlan?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not save plan option"
                message={error}
              />
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="option-coverage">Coverage (%)</Label>
                <Input
                  id="option-coverage"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.coverage_percentage}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      coverage_percentage: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="option-premium">Premium</Label>
                <Input
                  id="option-premium"
                  type="number"
                  min={0}
                  value={form.premium}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      premium: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="option-premium-mode">Premium mode</Label>
                <Select
                  value={form.premium_mode}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      premium_mode: (value ?? "fixed") as PremiumMode,
                    }))
                  }
                  disabled={submitting}
                >
                  <SelectTrigger id="option-premium-mode" className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREMIUM_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="option-duration">Duration (days)</Label>
                <Input
                  id="option-duration"
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      duration_days: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="option-min-balance">Minimum balance</Label>
                <Input
                  id="option-min-balance"
                  type="number"
                  min={0}
                  value={form.minimum_balance}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      minimum_balance: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="option-max-balance">Maximum balance</Label>
                <Input
                  id="option-max-balance"
                  type="number"
                  min={0}
                  value={form.maximum_balance}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      maximum_balance: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="option-free-first"
                  checked={form.is_free_first}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      is_free_first: checked === true,
                    }))
                  }
                  disabled={submitting}
                />
                <Label htmlFor="option-free-first">Free first contract</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="option-is-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      is_active: checked === true,
                    }))
                  }
                  disabled={submitting}
                />
                <Label htmlFor="option-is-active">Active</Label>
              </div>
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
              {submitting ? "Saving..." : isCreateMode ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
