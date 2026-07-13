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
  createIbProgramCpaRule,
  createIbProgramPnlRule,
  createIbProgramVolumeRule,
  updateIbProgramCpaRule,
  updateIbProgramPnlRule,
  updateIbProgramVolumeRule,
} from "@/features/ib-program-payment-rule/api";
import type {
  IbProgramCpaRule,
  IbProgramPaymentRuleType,
  IbProgramPnlRule,
  IbProgramVolumeRule,
} from "@/features/ib-program-payment-rule/types";
import type { IbPaymentTemplate } from "@/features/ib-payment-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type IbProgramPaymentRuleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ruleType: IbProgramPaymentRuleType;
  ibProgramId: string;
  rule?: IbProgramVolumeRule | IbProgramPnlRule | IbProgramCpaRule | null;
  paymentTemplates: IbPaymentTemplate[];
  onSuccess: () => void;
};

type FormState = {
  description: string;
  is_active: boolean;
  ib_payment_template_id: string;
  cpa_progression_volume_threshold: string;
  cpa_min_external_deposit_amount: string;
  cpa_reward_amount: string;
};

const emptyForm: FormState = {
  description: "",
  is_active: true,
  ib_payment_template_id: "",
  cpa_progression_volume_threshold: "",
  cpa_min_external_deposit_amount: "",
  cpa_reward_amount: "",
};

function ruleTypeLabel(ruleType: IbProgramPaymentRuleType): string {
  switch (ruleType) {
    case "volume":
      return "Volume";
    case "pnl":
      return "PnL";
    case "cpa":
      return "CPA";
  }
}

export function IbProgramPaymentRuleFormDialog({
  open,
  onOpenChange,
  mode,
  ruleType,
  ibProgramId,
  rule,
  paymentTemplates,
  onSuccess,
}: IbProgramPaymentRuleFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && rule) {
      const base = {
        description: rule.description ?? "",
        is_active: rule.is_active,
        ib_payment_template_id: "",
        cpa_progression_volume_threshold: "",
        cpa_min_external_deposit_amount: "",
        cpa_reward_amount: "",
      };

      if (ruleType === "pnl" && "ib_payment_template_id" in rule) {
        base.ib_payment_template_id = rule.ib_payment_template_id;
      }

      if (ruleType === "cpa" && "cpa_reward_amount" in rule) {
        base.cpa_progression_volume_threshold =
          rule.cpa_progression_volume_threshold;
        base.cpa_min_external_deposit_amount =
          rule.cpa_min_external_deposit_amount;
        base.cpa_reward_amount = rule.cpa_reward_amount;
      }

      setForm(base);
      return;
    }

    setForm(emptyForm);
  }, [open, mode, rule, ruleType]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const description = form.description.trim() || null;

      if (mode === "create") {
        if (ruleType === "volume") {
          await createIbProgramVolumeRule(ibProgramId, {
            description,
            is_active: form.is_active,
          });
        } else if (ruleType === "pnl") {
          if (!form.ib_payment_template_id) {
            setError("Payment template is required.");
            return;
          }

          await createIbProgramPnlRule(ibProgramId, {
            ib_payment_template_id: form.ib_payment_template_id,
            description,
            is_active: form.is_active,
          });
        } else {
          const threshold = Number(form.cpa_progression_volume_threshold);
          const minDeposit = Number(form.cpa_min_external_deposit_amount);
          const rewardAmount = Number(form.cpa_reward_amount);

          if (
            !form.cpa_progression_volume_threshold ||
            !form.cpa_min_external_deposit_amount ||
            !form.cpa_reward_amount ||
            Number.isNaN(threshold) ||
            Number.isNaN(minDeposit) ||
            Number.isNaN(rewardAmount)
          ) {
            setError("All CPA amounts are required.");
            return;
          }

          await createIbProgramCpaRule(ibProgramId, {
            description,
            is_active: form.is_active,
            cpa_progression_volume_threshold: threshold,
            cpa_min_external_deposit_amount: minDeposit,
            cpa_reward_amount: rewardAmount,
          });
        }
      } else if (rule) {
        if (ruleType === "volume") {
          await updateIbProgramVolumeRule(ibProgramId, rule.id, {
            description,
            is_active: form.is_active,
          });
        } else if (ruleType === "pnl") {
          await updateIbProgramPnlRule(ibProgramId, rule.id, {
            description,
            is_active: form.is_active,
            ...(form.ib_payment_template_id
              ? { ib_payment_template_id: form.ib_payment_template_id }
              : {}),
          });
        } else {
          const payload: {
            description: string | null;
            is_active: boolean;
            cpa_progression_volume_threshold?: number;
            cpa_min_external_deposit_amount?: number;
            cpa_reward_amount?: number;
          } = {
            description,
            is_active: form.is_active,
          };

          const threshold = Number(form.cpa_progression_volume_threshold);
          const minDeposit = Number(form.cpa_min_external_deposit_amount);
          const rewardAmount = Number(form.cpa_reward_amount);

          if (!Number.isNaN(threshold)) {
            payload.cpa_progression_volume_threshold = threshold;
          }
          if (!Number.isNaN(minDeposit)) {
            payload.cpa_min_external_deposit_amount = minDeposit;
          }
          if (!Number.isNaN(rewardAmount)) {
            payload.cpa_reward_amount = rewardAmount;
          }

          await updateIbProgramCpaRule(ibProgramId, rule.id, payload);
        }
      }

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const typeLabel = ruleTypeLabel(ruleType);
  const selectedPaymentTemplate = paymentTemplates.find(
    (template) => template.id === form.ib_payment_template_id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New" : "Edit"} {typeLabel} rule
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Create a new ${typeLabel} payment rule version for this program.`
              : `Update the selected ${typeLabel} payment rule.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <ApiErrorAlert message={error} /> : null}

          {ruleType === "pnl" ? (
            <div className="space-y-2">
              <Label htmlFor="payment-template">Payment template</Label>
              <Select
                value={form.ib_payment_template_id}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    ib_payment_template_id: value ?? "",
                  }))
                }
                disabled={submitting || (mode === "edit" && rule?.is_active)}
              >
                <SelectTrigger id="payment-template" className="w-full">
                  <SelectValue placeholder="Select a payment template">
                    {selectedPaymentTemplate?.name ?? null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {ruleType === "cpa" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cpa-threshold">Volume threshold</Label>
                <Input
                  id="cpa-threshold"
                  type="number"
                  min="0"
                  step="any"
                  value={form.cpa_progression_volume_threshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cpa_progression_volume_threshold: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required={mode === "create"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpa-min-deposit">Min. deposit</Label>
                <Input
                  id="cpa-min-deposit"
                  type="number"
                  min="0"
                  step="any"
                  value={form.cpa_min_external_deposit_amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cpa_min_external_deposit_amount: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required={mode === "create"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpa-reward">Reward amount</Label>
                <Input
                  id="cpa-reward"
                  type="number"
                  min="0"
                  step="any"
                  value={form.cpa_reward_amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cpa_reward_amount: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required={mode === "create"}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="rule-description">Description</Label>
            <textarea
              id="rule-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              disabled={submitting}
              rows={3}
              placeholder="Optional notes for this rule version"
              className={cn(
                "flex min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="rule-is-active"
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_active: checked === true,
                }))
              }
              disabled={submitting || (mode === "edit" && rule?.is_active)}
            />
            <Label htmlFor="rule-is-active">Set as active rule</Label>
          </div>

          {mode === "edit" && rule?.is_active ? (
            <p className="text-sm text-muted-foreground">
              The active rule cannot be deactivated from here. Create a new
              version and activate it to replace this one.
            </p>
          ) : null}

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
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create rule"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
