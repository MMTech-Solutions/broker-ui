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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createBonusOfferTemplate,
  getBonusOfferTemplate,
  updateBonusOfferTemplate,
} from "@/features/bonus-offer-template/api";
import type {
  BonusOfferTemplate,
  CreateBonusOfferTemplateInput,
  UpdateBonusOfferTemplateInput,
} from "@/features/bonus-offer-template/types";
import {
  BONUS_OFFER_FIELD_HELP,
  BonusOfferFieldLabel,
} from "@/features/bonus-offer/components/bonus-offer-field-label";
import { listPlatforms } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type BonusOfferTemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  bonusOfferTemplate?: BonusOfferTemplate | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  platform_id: string;
  conversion_window_days: string;
  activity_per_credit_unit: string;
  min_deposit_amount: string;
  min_position_duration_seconds: string;
  burn_on_withdrawal: boolean;
  burn_on_negative_balance: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  platform_id: "",
  conversion_window_days: "30",
  activity_per_credit_unit: "0.1",
  min_deposit_amount: "0",
  min_position_duration_seconds: "0",
  burn_on_withdrawal: true,
  burn_on_negative_balance: true,
  is_active: true,
};

function templateToForm(template: BonusOfferTemplate): FormState {
  return {
    name: template.name,
    platform_id: template.platform_id,
    conversion_window_days: String(template.conversion_window_days),
    activity_per_credit_unit: String(template.activity_per_credit_unit),
    min_deposit_amount: String(template.min_deposit_amount ?? 0),
    min_position_duration_seconds: String(
      template.min_position_duration_seconds ?? 0,
    ),
    burn_on_withdrawal: template.burn_on_withdrawal,
    burn_on_negative_balance: template.burn_on_negative_balance,
    is_active: template.is_active,
  };
}

function buildCreatePayload(form: FormState): CreateBonusOfferTemplateInput {
  return {
    name: form.name.trim(),
    platform_id: form.platform_id,
    conversion_window_days: Number(form.conversion_window_days),
    activity_per_credit_unit: form.activity_per_credit_unit.trim(),
    min_deposit_amount: Number(form.min_deposit_amount) || 0,
    min_position_duration_seconds:
      Number(form.min_position_duration_seconds) || 0,
    burn_on_withdrawal: form.burn_on_withdrawal,
    burn_on_negative_balance: form.burn_on_negative_balance,
    is_active: form.is_active,
  };
}

function buildUpdatePayload(form: FormState): UpdateBonusOfferTemplateInput {
  return {
    name: form.name.trim(),
    platform_id: form.platform_id,
    conversion_window_days: Number(form.conversion_window_days),
    activity_per_credit_unit: form.activity_per_credit_unit.trim(),
    min_deposit_amount: Number(form.min_deposit_amount) || 0,
    min_position_duration_seconds:
      Number(form.min_position_duration_seconds) || 0,
    burn_on_withdrawal: form.burn_on_withdrawal,
    burn_on_negative_balance: form.burn_on_negative_balance,
    is_active: form.is_active,
  };
}

function validateForm(form: FormState): string | null {
  if (!form.name.trim()) {
    return "Name is required.";
  }

  if (!form.platform_id) {
    return "Platform is required.";
  }

  if (!form.conversion_window_days.trim() || Number(form.conversion_window_days) < 1) {
    return "Conversion window must be at least 1 day.";
  }

  if (!form.activity_per_credit_unit.trim() || Number(form.activity_per_credit_unit) <= 0) {
    return "Activity per credit unit must be greater than 0.";
  }

  return null;
}

export function BonusOfferTemplateFormDialog({
  open,
  onOpenChange,
  mode,
  bonusOfferTemplate,
  onSuccess,
}: BonusOfferTemplateFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bonusOfferTemplateId = bonusOfferTemplate?.id;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);

      try {
        const platformsResponse = await listPlatforms({ per_page: 100 });

        if (cancelled) {
          return;
        }

        setPlatforms(platformsResponse.data);

        if (mode === "edit" && bonusOfferTemplateId) {
          const templateResponse = await getBonusOfferTemplate(
            bonusOfferTemplateId,
          );

          if (cancelled) {
            return;
          }

          setForm(templateToForm(templateResponse.data));
          return;
        }

        setForm(emptyForm);
      } catch (error) {
        if (!cancelled) {
          setLoadError(formatBrokerApiError(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFormData();

    return () => {
      cancelled = true;
    };
  }, [bonusOfferTemplateId, mode, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form);

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "create") {
        await createBonusOfferTemplate(buildCreatePayload(form));
      } else if (bonusOfferTemplateId) {
        await updateBonusOfferTemplate(
          bonusOfferTemplateId,
          buildUpdatePayload(form),
        );
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      setSubmitError(formatBrokerApiError(error));
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
              ? "Create bonus offer template"
              : "Edit bonus offer template"}
          </DialogTitle>
          <DialogDescription>
            Templates define reusable conversion rules and excluded instruments
            for new bonus offers.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {loadError ? (
              <ApiErrorAlert
                title="Could not load bonus offer template form"
                message={loadError}
              />
            ) : null}

            {submitError ? (
              <ApiErrorAlert
                title={
                  mode === "create"
                    ? "Could not create bonus offer template"
                    : "Could not update bonus offer template"
                }
                message={submitError}
              />
            ) : null}

            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-name"
                      help={BONUS_OFFER_FIELD_HELP.name}
                    >
                      Name
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-template-name"
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
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-platform"
                      help={BONUS_OFFER_FIELD_HELP.platform}
                    >
                      Platform
                    </BonusOfferFieldLabel>
                    <Select
                      value={form.platform_id || "none"}
                      onValueChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          platform_id: value === "none" ? "" : (value ?? ""),
                        }))
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger
                        id="bonus-offer-template-platform"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select platform</SelectItem>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.custom_name ?? platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-conversion-window"
                      help={BONUS_OFFER_FIELD_HELP.conversion_window_days}
                    >
                      Conversion window (days)
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-template-conversion-window"
                      type="number"
                      min={1}
                      value={form.conversion_window_days}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          conversion_window_days: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-activity"
                      help={BONUS_OFFER_FIELD_HELP.activity_per_credit_unit}
                    >
                      Activity per credit unit
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-template-activity"
                      value={form.activity_per_credit_unit}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          activity_per_credit_unit: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-min-deposit"
                      help={BONUS_OFFER_FIELD_HELP.min_deposit_amount}
                    >
                      Min deposit amount
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-template-min-deposit"
                      type="number"
                      min={0}
                      value={form.min_deposit_amount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          min_deposit_amount: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-min-position-duration"
                      help={BONUS_OFFER_FIELD_HELP.min_position_duration_seconds}
                    >
                      Min position duration (seconds)
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-template-min-position-duration"
                      type="number"
                      min={0}
                      value={form.min_position_duration_seconds}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          min_position_duration_seconds: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-template-is-active"
                      checked={form.is_active}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          is_active: checked === true,
                        }))
                      }
                      disabled={submitting}
                    />
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-is-active"
                      help={BONUS_OFFER_FIELD_HELP.is_active}
                    >
                      Active
                    </BonusOfferFieldLabel>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-template-burn-withdrawal"
                      checked={form.burn_on_withdrawal}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          burn_on_withdrawal: checked === true,
                        }))
                      }
                      disabled={submitting}
                    />
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-burn-withdrawal"
                      help={BONUS_OFFER_FIELD_HELP.burn_on_withdrawal}
                    >
                      Burn on withdrawal
                    </BonusOfferFieldLabel>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-template-burn-negative"
                      checked={form.burn_on_negative_balance}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          burn_on_negative_balance: checked === true,
                        }))
                      }
                      disabled={submitting}
                    />
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template-burn-negative"
                      help={BONUS_OFFER_FIELD_HELP.burn_on_negative_balance}
                    >
                      Burn on negative balance
                    </BonusOfferFieldLabel>
                  </div>
                </div>
              </>
            )}
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
            <Button type="submit" disabled={submitting || loading}>
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
