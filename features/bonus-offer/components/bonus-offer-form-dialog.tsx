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
  createBonusOffer,
  getBonusOffer,
  loadBonusOfferFormCatalog,
  updateBonusOffer,
} from "@/features/bonus-offer/api";
import {
  BONUS_OFFER_TYPES,
  DEPOSIT_APPLICATION_MODES,
  type BonusOffer,
  type BonusOfferType,
  type CreateBonusOfferInput,
  type DepositApplicationMode,
  type UpdateBonusOfferInput,
} from "@/features/bonus-offer/types";
import type { BonusOfferTemplate } from "@/features/bonus-offer-template/types";
import type { Platform } from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import {
  BONUS_OFFER_FIELD_HELP,
  BonusOfferFieldLabel,
} from "@/features/bonus-offer/components/bonus-offer-field-label";
import { formatDepositPercentValue } from "@/features/bonus-offer/format";

type BonusOfferFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  bonusOffer?: BonusOffer | null;
  onSuccess: () => void;
};

type FormState = {
  type: BonusOfferType;
  name: string;
  bonus_offer_template_id: string;
  platform_id: string;
  is_active: boolean;
  credit_amount: string;
  deposit_percent: string;
  max_credit_amount: string;
  deposit_application_mode: DepositApplicationMode;
  claim_expires_at: string;
  min_real_balance: string;
  min_deposit_amount: string;
  min_position_duration_seconds: string;
  conversion_window_days: string;
  activity_per_credit_unit: string;
  burn_on_withdrawal: boolean;
  burn_on_negative_balance: boolean;
};

const emptyForm: FormState = {
  type: "deposit_triggered",
  name: "",
  bonus_offer_template_id: "",
  platform_id: "",
  is_active: true,
  credit_amount: "",
  deposit_percent: "",
  max_credit_amount: "",
  deposit_application_mode: "once_per_account",
  claim_expires_at: "",
  min_real_balance: "",
  min_deposit_amount: "0",
  min_position_duration_seconds: "0",
  conversion_window_days: "30",
  activity_per_credit_unit: "0.1",
  burn_on_withdrawal: true,
  burn_on_negative_balance: true,
};

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

function toOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function offerToForm(offer: BonusOffer): FormState {
  return {
    type: offer.type,
    name: offer.name,
    bonus_offer_template_id: offer.bonus_offer_template_id ?? "",
    platform_id: offer.platform_id,
    is_active: offer.is_active,
    credit_amount:
      offer.credit_amount != null ? String(offer.credit_amount) : "",
    deposit_percent: formatDepositPercentValue(offer.deposit_percent),
    max_credit_amount:
      offer.max_credit_amount != null ? String(offer.max_credit_amount) : "",
    deposit_application_mode:
      offer.deposit_application_mode ?? "once_per_account",
    claim_expires_at: toDateTimeLocalValue(offer.claim_expires_at),
    min_real_balance:
      offer.min_real_balance != null ? String(offer.min_real_balance) : "",
    min_deposit_amount:
      offer.min_deposit_amount != null ? String(offer.min_deposit_amount) : "0",
    min_position_duration_seconds:
      offer.min_position_duration_seconds != null
        ? String(offer.min_position_duration_seconds)
        : "0",
    conversion_window_days:
      offer.conversion_window_days != null
        ? String(offer.conversion_window_days)
        : "",
    activity_per_credit_unit:
      offer.activity_per_credit_unit != null
        ? String(offer.activity_per_credit_unit)
        : "",
    burn_on_withdrawal: offer.burn_on_withdrawal ?? true,
    burn_on_negative_balance: offer.burn_on_negative_balance ?? true,
  };
}

function buildCreatePayload(form: FormState): CreateBonusOfferInput {
  const payload: CreateBonusOfferInput = {
    type: form.type,
    name: form.name.trim(),
    is_active: form.is_active,
    burn_on_withdrawal: form.burn_on_withdrawal,
    burn_on_negative_balance: form.burn_on_negative_balance,
  };

  if (form.bonus_offer_template_id) {
    payload.bonus_offer_template_id = form.bonus_offer_template_id;
  } else {
    payload.platform_id = form.platform_id;
    payload.conversion_window_days = Number(form.conversion_window_days);
    payload.activity_per_credit_unit = form.activity_per_credit_unit.trim();
  }

  if (form.type === "manual_claim") {
    payload.credit_amount = Number(form.credit_amount);
  } else {
    payload.deposit_percent = Number(form.deposit_percent);
    payload.max_credit_amount = Number(form.max_credit_amount);
    payload.deposit_application_mode = form.deposit_application_mode;
  }

  if (form.claim_expires_at) {
    payload.claim_expires_at = new Date(form.claim_expires_at).toISOString();
  }

  const minRealBalance = toOptionalNumber(form.min_real_balance);

  if (minRealBalance !== undefined) {
    payload.min_real_balance = minRealBalance;
  }

  payload.min_deposit_amount = toOptionalNumber(form.min_deposit_amount) ?? 0;
  payload.min_position_duration_seconds =
    toOptionalNumber(form.min_position_duration_seconds) ?? 0;

  return payload;
}

function buildUpdatePayload(form: FormState): UpdateBonusOfferInput {
  const payload: UpdateBonusOfferInput = {
    type: form.type,
    name: form.name.trim(),
    platform_id: form.platform_id,
    is_active: form.is_active,
    conversion_window_days: Number(form.conversion_window_days),
    activity_per_credit_unit: form.activity_per_credit_unit.trim(),
    burn_on_withdrawal: form.burn_on_withdrawal,
    burn_on_negative_balance: form.burn_on_negative_balance,
  };

  if (form.type === "manual_claim") {
    payload.credit_amount = toOptionalNumber(form.credit_amount) ?? null;
    payload.deposit_percent = null;
    payload.max_credit_amount = null;
    payload.deposit_application_mode = null;
  } else {
    payload.deposit_percent = toOptionalNumber(form.deposit_percent) ?? null;
    payload.max_credit_amount =
      toOptionalNumber(form.max_credit_amount) ?? null;
    payload.deposit_application_mode = form.deposit_application_mode;
    payload.credit_amount = null;
  }

  payload.claim_expires_at = form.claim_expires_at
    ? new Date(form.claim_expires_at).toISOString()
    : null;

  payload.min_real_balance = toOptionalNumber(form.min_real_balance) ?? null;
  payload.min_deposit_amount = toOptionalNumber(form.min_deposit_amount) ?? 0;
  payload.min_position_duration_seconds =
    toOptionalNumber(form.min_position_duration_seconds) ?? 0;

  return payload;
}

function validateForm(form: FormState, mode: "create" | "edit"): string | null {
  if (!form.name.trim()) {
    return "Name is required.";
  }

  if (mode === "create" && !form.bonus_offer_template_id) {
    if (!form.platform_id) {
      return "Platform is required when no template is selected.";
    }

    if (!form.conversion_window_days.trim()) {
      return "Conversion window days is required when no template is selected.";
    }

    if (!form.activity_per_credit_unit.trim()) {
      return "Activity per credit unit is required when no template is selected.";
    }
  }

  if (form.type === "manual_claim" && !form.credit_amount.trim()) {
    return "Credit amount is required for manual claim offers.";
  }

  if (form.type === "deposit_triggered") {
    if (!form.deposit_percent.trim() || !form.max_credit_amount.trim()) {
      return "Deposit percent and max credit amount are required for deposit triggered offers.";
    }
  }

  return null;
}

export function BonusOfferFormDialog({
  open,
  onOpenChange,
  mode,
  bonusOffer,
  onSuccess,
}: BonusOfferFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [templates, setTemplates] = useState<BonusOfferTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const usesTemplate = mode === "create" && form.bonus_offer_template_id !== "";
  const bonusOfferId = bonusOffer?.id;

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
        const catalog = await loadBonusOfferFormCatalog();

        if (cancelled) {
          return;
        }

        setPlatforms(catalog.platforms);
        setTemplates(mode === "create" ? catalog.templates : []);

        if (mode === "edit" && bonusOfferId) {
          const offerResponse = await getBonusOffer(bonusOfferId);

          if (cancelled) {
            return;
          }

          setForm(offerToForm(offerResponse.data));
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
  }, [bonusOfferId, mode, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form, mode);

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "create") {
        await createBonusOffer(buildCreatePayload(form));
      } else if (bonusOfferId) {
        await updateBonusOffer(bonusOfferId, buildUpdatePayload(form));
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
            {mode === "create" ? "Create bonus offer" : "Edit bonus offer"}
          </DialogTitle>
          <DialogDescription>
            Configure bonus offer rules, rewards, and conversion settings.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {loadError ? (
              <ApiErrorAlert
                title="Could not load bonus offer form"
                message={loadError}
              />
            ) : null}

            {submitError ? (
              <ApiErrorAlert
                title={
                  mode === "create"
                    ? "Could not create bonus offer"
                    : "Could not update bonus offer"
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
                      htmlFor="bonus-offer-type"
                      help={BONUS_OFFER_FIELD_HELP.type}
                    >
                      Type
                    </BonusOfferFieldLabel>
                    <Select
                      value={form.type}
                      onValueChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          type: (value ??
                            "deposit_triggered") as BonusOfferType,
                        }))
                      }
                      disabled={submitting || mode === "edit"}
                    >
                      <SelectTrigger id="bonus-offer-type" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BONUS_OFFER_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-name"
                      help={BONUS_OFFER_FIELD_HELP.name}
                    >
                      Name
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-name"
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
                </div>

                {mode === "create" ? (
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-template"
                      help={BONUS_OFFER_FIELD_HELP.template}
                    >
                      Template (optional)
                    </BonusOfferFieldLabel>
                    <Select
                      value={form.bonus_offer_template_id || "none"}
                      onValueChange={(value) => {
                        const templateId = value === "none" ? "" : (value ?? "");
                        const selectedTemplate = templates.find(
                          (template) => template.id === templateId,
                        );

                        setForm((current) => ({
                          ...current,
                          bonus_offer_template_id: templateId,
                          min_deposit_amount:
                            selectedTemplate != null
                              ? String(selectedTemplate.min_deposit_amount ?? 0)
                              : current.min_deposit_amount,
                          min_position_duration_seconds:
                            selectedTemplate != null
                              ? String(
                                  selectedTemplate.min_position_duration_seconds ??
                                    0,
                                )
                              : current.min_position_duration_seconds,
                        }));
                      }}
                      disabled={submitting}
                    >
                      <SelectTrigger
                        id="bonus-offer-template"
                        className="w-full"
                      >
                        <SelectValue placeholder="No template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {!usesTemplate ? (
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-platform"
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
                      <SelectTrigger id="bonus-offer-platform" className="w-full">
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
                ) : null}

                {form.type === "manual_claim" ? (
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-credit-amount"
                      help={BONUS_OFFER_FIELD_HELP.credit_amount}
                    >
                      Credit amount
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-credit-amount"
                      type="number"
                      min={1}
                      value={form.credit_amount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          credit_amount: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <BonusOfferFieldLabel
                        htmlFor="bonus-offer-deposit-percent"
                        help={BONUS_OFFER_FIELD_HELP.deposit_percent}
                      >
                        Deposit percent
                      </BonusOfferFieldLabel>
                      <Input
                        id="bonus-offer-deposit-percent"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.deposit_percent}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            deposit_percent: event.target.value,
                          }))
                        }
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <BonusOfferFieldLabel
                        htmlFor="bonus-offer-max-credit"
                        help={BONUS_OFFER_FIELD_HELP.max_credit_amount}
                      >
                        Max credit amount
                      </BonusOfferFieldLabel>
                      <Input
                        id="bonus-offer-max-credit"
                        type="number"
                        min={1}
                        value={form.max_credit_amount}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            max_credit_amount: event.target.value,
                          }))
                        }
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <BonusOfferFieldLabel
                        htmlFor="bonus-offer-deposit-mode"
                        help={BONUS_OFFER_FIELD_HELP.deposit_application_mode}
                      >
                        Deposit application
                      </BonusOfferFieldLabel>
                      <Select
                        value={form.deposit_application_mode}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            deposit_application_mode: (value ??
                              "once_per_account") as DepositApplicationMode,
                          }))
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger
                          id="bonus-offer-deposit-mode"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPOSIT_APPLICATION_MODES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-claim-expires"
                      help={BONUS_OFFER_FIELD_HELP.claim_expires_at}
                    >
                      Claim expires at
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-claim-expires"
                      type="datetime-local"
                      value={form.claim_expires_at}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          claim_expires_at: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-min-balance"
                      help={BONUS_OFFER_FIELD_HELP.min_real_balance}
                    >
                      Min real balance
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-min-balance"
                      type="number"
                      min={0}
                      value={form.min_real_balance}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          min_real_balance: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-min-deposit"
                      help={BONUS_OFFER_FIELD_HELP.min_deposit_amount}
                    >
                      Min deposit amount
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-min-deposit"
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
                      htmlFor="bonus-offer-min-position-duration"
                      help={BONUS_OFFER_FIELD_HELP.min_position_duration_seconds}
                    >
                      Min position duration (seconds)
                    </BonusOfferFieldLabel>
                    <Input
                      id="bonus-offer-min-position-duration"
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

                {!usesTemplate ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <BonusOfferFieldLabel
                        htmlFor="bonus-offer-conversion-window"
                        help={BONUS_OFFER_FIELD_HELP.conversion_window_days}
                      >
                        Conversion window (days)
                      </BonusOfferFieldLabel>
                      <Input
                        id="bonus-offer-conversion-window"
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
                        htmlFor="bonus-offer-activity"
                        help={BONUS_OFFER_FIELD_HELP.activity_per_credit_unit}
                      >
                        Activity per credit unit
                      </BonusOfferFieldLabel>
                      <Input
                        id="bonus-offer-activity"
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
                ) : null}

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-is-active"
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
                      htmlFor="bonus-offer-is-active"
                      help={BONUS_OFFER_FIELD_HELP.is_active}
                    >
                      Active
                    </BonusOfferFieldLabel>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-burn-withdrawal"
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
                      htmlFor="bonus-offer-burn-withdrawal"
                      help={BONUS_OFFER_FIELD_HELP.burn_on_withdrawal}
                    >
                      Burn on withdrawal
                    </BonusOfferFieldLabel>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bonus-offer-burn-negative"
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
                      htmlFor="bonus-offer-burn-negative"
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
