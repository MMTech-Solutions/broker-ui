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
import { listIbPlanPrograms } from "@/features/ib-plan/api";
import type { IbPlanProgram } from "@/features/ib-plan/types";
import { createIbPlanSubscription } from "@/features/ib-plan-subscription";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type IbPlanSubscriptionFormDialogProps = {
  ibPlanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  external_user_id: string;
  personal_rate: string;
  is_master: boolean;
  master_rate: string;
  master_level: string;
  comments: string;
  ib_program_id: string;
};

const emptyForm: FormState = {
  external_user_id: "",
  personal_rate: "0",
  is_master: false,
  master_rate: "0",
  master_level: "0",
  comments: "",
  ib_program_id: "none",
};

export function IbPlanSubscriptionFormDialog({
  ibPlanId,
  open,
  onOpenChange,
  onSuccess,
}: IbPlanSubscriptionFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [programs, setPrograms] = useState<IbPlanProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(emptyForm);
    setError(null);

    let cancelled = false;

    async function loadPrograms() {
      setLoadingPrograms(true);

      try {
        const response = await listIbPlanPrograms(ibPlanId);
        if (!cancelled) {
          setPrograms(response.data.programs);
        }
      } catch {
        if (!cancelled) {
          setPrograms([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPrograms(false);
        }
      }
    }

    void loadPrograms();

    return () => {
      cancelled = true;
    };
  }, [open, ibPlanId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.external_user_id.trim()) {
        setError("External user ID is required.");
        return;
      }

      await createIbPlanSubscription(ibPlanId, {
        external_user_id: form.external_user_id.trim(),
        personal_rate: Number(form.personal_rate) || 0,
        is_master: form.is_master,
        master_rate: Number(form.master_rate) || 0,
        master_level: Number.parseInt(form.master_level, 10) || 0,
        comments: form.comments.trim() || null,
        ib_program_id:
          form.ib_program_id !== "none" ? form.ib_program_id : undefined,
      });

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
          <DialogTitle>Create subscription</DialogTitle>
          <DialogDescription>
            Subscribe a user to this IB plan. Rates and master flags can be
            adjusted later from the subscriptions list.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not create subscription"
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="subscription-external-user-id">
                External user ID
              </Label>
              <Input
                id="subscription-external-user-id"
                value={form.external_user_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    external_user_id: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subscription-personal-rate">Personal rate</Label>
                <Input
                  id="subscription-personal-rate"
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
                <Label htmlFor="subscription-master-rate">Master rate</Label>
                <Input
                  id="subscription-master-rate"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subscription-master-level">Master level</Label>
                <Input
                  id="subscription-master-level"
                  type="number"
                  min="0"
                  step="1"
                  value={form.master_level}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      master_level: event.target.value,
                    }))
                  }
                  disabled={submitting}
                />
              </div>

              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="subscription-is-master"
                    checked={form.is_master}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        is_master: checked === true,
                      }))
                    }
                    disabled={submitting}
                  />
                  <Label htmlFor="subscription-is-master">Master IB</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription-comments">Comments</Label>
              <textarea
                id="subscription-comments"
                value={form.comments}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comments: event.target.value,
                  }))
                }
                disabled={submitting}
                maxLength={255}
                rows={3}
                className={cn(
                  "flex min-h-16 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription-program">Initial program</Label>
              <Select
                value={form.ib_program_id}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    ib_program_id: value ?? "none",
                  }))
                }
                disabled={submitting || loadingPrograms}
              >
                <SelectTrigger id="subscription-program" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPrograms
                        ? "Loading programs..."
                        : "Use plan default"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Use plan default</SelectItem>
                  {programs.map((planProgram) => (
                    <SelectItem
                      key={planProgram.id}
                      value={planProgram.program.id}
                    >
                      {planProgram.program.name}
                      {planProgram.sort_order === 0 ? " (base)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only applies when the plan activates the subscription
                immediately (automatic or restricted).
              </p>
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
            <Button type="submit" disabled={submitting || loadingPrograms}>
              {submitting ? "Creating..." : "Create subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
