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
import { createIbPlan, updateIbPlan } from "@/features/ib-plan/api";
import {
  IB_PLAN_SUBSCRIPTION_TYPES,
  type IbPlan,
  type IbPlanSubscriptionType,
  type UpdateIbPlanInput,
} from "@/features/ib-plan/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type IbPlanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ibPlan?: IbPlan | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  image_path: string;
  subscription_type: IbPlanSubscriptionType;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  image_path: "",
  subscription_type: "automatic",
  is_active: true,
};

export function IbPlanFormDialog({
  open,
  onOpenChange,
  mode,
  ibPlan,
  onSuccess,
}: IbPlanFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && ibPlan) {
      setForm({
        name: ibPlan.name,
        description: ibPlan.description,
        image_path: ibPlan.image_path ?? "",
        subscription_type: ibPlan.subscription_type,
        is_active: ibPlan.is_active,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, ibPlan]);

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

        await createIbPlan({
          name: form.name.trim(),
          description: form.description.trim(),
          image_path: form.image_path.trim() || null,
          subscription_type: form.subscription_type,
          is_active: form.is_active,
        });
      } else if (ibPlan) {
        const payload: UpdateIbPlanInput = {
          name: form.name.trim(),
          description: form.description.trim(),
          image_path: form.image_path.trim() || null,
          subscription_type: form.subscription_type,
          is_active: form.is_active,
        };

        await updateIbPlan(ibPlan.id, payload);
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
            {mode === "create" ? "Create IB plan" : "Edit IB plan"}
          </DialogTitle>
          <DialogDescription>
            IB plans group programs and define how partners subscribe.
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
                    ? "Could not create IB plan"
                    : "Could not update IB plan"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="ib-plan-name">Name</Label>
              <Input
                id="ib-plan-name"
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
              <Label htmlFor="ib-plan-description">Description</Label>
              <textarea
                id="ib-plan-description"
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
              <Label htmlFor="ib-plan-image-path">Image path</Label>
              <Input
                id="ib-plan-image-path"
                value={form.image_path}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    image_path: event.target.value,
                  }))
                }
                placeholder="Optional"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-plan-subscription-type">Subscription type</Label>
              <Select
                value={form.subscription_type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    subscription_type: (value ??
                      "automatic") as IbPlanSubscriptionType,
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger id="ib-plan-subscription-type" className="w-full">
                  <SelectValue placeholder="Select subscription type" />
                </SelectTrigger>
                <SelectContent>
                  {IB_PLAN_SUBSCRIPTION_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="ib-plan-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_active: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="ib-plan-is-active">Active</Label>
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
