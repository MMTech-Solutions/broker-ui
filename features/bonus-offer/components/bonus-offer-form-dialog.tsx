"use client";

import { useEffect, useMemo, useState } from "react";

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
  listEligibleIntroducingBrokers,
  loadBonusOfferFormCatalog,
  syncBonusOfferIntroducingBrokers,
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
import {
  formatDepositPercentValue,
  minorUnitsToMajorInput,
} from "@/features/bonus-offer/format";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import {
  formatServerGroupOptionLabel,
  getServerGroupCurrency,
  hasResolvedServerGroupCurrency,
} from "@/features/trading-server/format";
import type { ServerGroup } from "@/features/trading-server/types";
import { parseMajorAmountToMinorUnits } from "@/features/initial-amount/format";

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
  /** Used when saving with is_active=false (API-required). */
  invalidate_assignments: boolean;
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
  server_group_ids: string[];
  introducing_broker_external_user_ids: string[];
};

function sortedIdsSignature(ids: string[]): string {
  return [...ids].sort().join("|");
}

type ServerGroupOption = {
  id: string;
  label: string;
  currencyCode: string;
  precision: number;
};

const emptyForm: FormState = {
  type: "deposit_triggered",
  name: "",
  bonus_offer_template_id: "",
  platform_id: "",
  is_active: true,
  invalidate_assignments: true,
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
  server_group_ids: [],
  introducing_broker_external_user_ids: [],
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

function toMinorUnits(
  value: string,
  precision: number,
): number | undefined {
  return parseMajorAmountToMinorUnits(value, precision);
}

function offerToForm(offer: BonusOffer, precision: number | null): FormState {
  const toMajorInput = (value: string | number | null | undefined) => {
    if (value == null || value === "") {
      return "";
    }

    // API already returns monetary fields in major units.
    return String(value);
  };

  return {
    type: offer.type,
    name: offer.name,
    bonus_offer_template_id: offer.bonus_offer_template_id ?? "",
    platform_id: offer.platform_id,
    is_active: offer.is_active ?? true,
    invalidate_assignments: true,
    credit_amount: toMajorInput(offer.credit_amount),
    deposit_percent: formatDepositPercentValue(offer.deposit_percent),
    max_credit_amount: toMajorInput(offer.max_credit_amount),
    deposit_application_mode:
      offer.deposit_application_mode ?? "once_per_account",
    claim_expires_at: toDateTimeLocalValue(offer.claim_expires_at),
    min_real_balance: toMajorInput(offer.min_real_balance),
    min_deposit_amount:
      offer.min_deposit_amount != null
        ? toMajorInput(offer.min_deposit_amount)
        : precision == null
          ? "0"
          : minorUnitsToMajorInput(0, precision),
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
    server_group_ids: (offer.server_groups ?? []).map(
      (entry) => entry.server_group_id,
    ),
    introducing_broker_external_user_ids: (
      offer.introducing_brokers ?? []
    ).map((broker) => broker.external_user_id),
  };
}

function buildCreatePayload(
  form: FormState,
  precision: number,
): CreateBonusOfferInput {
  const payload: CreateBonusOfferInput = {
    type: form.type,
    name: form.name.trim(),
    is_active: form.is_active,
    burn_on_withdrawal: form.burn_on_withdrawal,
    burn_on_negative_balance: form.burn_on_negative_balance,
    server_group_ids: form.server_group_ids,
  };

  if (form.bonus_offer_template_id) {
    payload.bonus_offer_template_id = form.bonus_offer_template_id;
  } else {
    payload.platform_id = form.platform_id;
    payload.conversion_window_days = Number(form.conversion_window_days);
    payload.activity_per_credit_unit = form.activity_per_credit_unit.trim();
  }

  if (form.type === "manual_claim") {
    payload.credit_amount = toMinorUnits(form.credit_amount, precision);
  } else {
    payload.deposit_percent = Number(form.deposit_percent);
    payload.max_credit_amount = toMinorUnits(
      form.max_credit_amount,
      precision,
    );
    payload.deposit_application_mode = form.deposit_application_mode;
    payload.introducing_broker_external_user_ids =
      form.introducing_broker_external_user_ids;
  }

  if (form.claim_expires_at) {
    payload.claim_expires_at = new Date(form.claim_expires_at).toISOString();
  }

  const minRealBalance = toMinorUnits(form.min_real_balance, precision);

  if (minRealBalance !== undefined) {
    payload.min_real_balance = minRealBalance;
  }

  payload.min_deposit_amount =
    toMinorUnits(form.min_deposit_amount, precision) ?? 0;
  payload.min_position_duration_seconds =
    toOptionalNumber(form.min_position_duration_seconds) ?? 0;

  return payload;
}

function buildUpdatePayload(
  form: FormState,
  precision: number | null,
): UpdateBonusOfferInput {
  const toStoredAmount = (value: string): number | null | undefined => {
    if (!value.trim()) {
      return null;
    }

    if (precision == null) {
      return toOptionalNumber(value);
    }

    return toMinorUnits(value, precision);
  };

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

  if (!form.is_active) {
    payload.invalidate_assignments = form.invalidate_assignments;
  }

  if (form.type === "manual_claim") {
    payload.credit_amount = toStoredAmount(form.credit_amount) ?? null;
    payload.deposit_percent = null;
    payload.max_credit_amount = null;
    payload.deposit_application_mode = null;
  } else {
    payload.deposit_percent = toOptionalNumber(form.deposit_percent) ?? null;
    payload.max_credit_amount =
      toStoredAmount(form.max_credit_amount) ?? null;
    payload.deposit_application_mode = form.deposit_application_mode;
    payload.credit_amount = null;
  }

  payload.claim_expires_at = form.claim_expires_at
    ? new Date(form.claim_expires_at).toISOString()
    : null;

  payload.min_real_balance = toStoredAmount(form.min_real_balance) ?? null;
  payload.min_deposit_amount =
    (precision == null
      ? toOptionalNumber(form.min_deposit_amount)
      : toMinorUnits(form.min_deposit_amount, precision)) ?? 0;
  payload.min_position_duration_seconds =
    toOptionalNumber(form.min_position_duration_seconds) ?? 0;

  return payload;
}

function validateForm(
  form: FormState,
  mode: "create" | "edit",
  precision: number | null,
): string | null {
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

  if (mode === "create" && form.server_group_ids.length === 0) {
    return "Select at least one server group.";
  }

  if (mode === "create" && precision == null) {
    return "Select server groups with a shared currency precision before entering amounts.";
  }

  if (form.type === "manual_claim" && !form.credit_amount.trim()) {
    return "Credit amount is required for manual claim offers.";
  }

  if (form.type === "deposit_triggered") {
    if (!form.deposit_percent.trim() || !form.max_credit_amount.trim()) {
      return "Deposit percent and max credit amount are required for deposit triggered offers.";
    }
  }

  if (precision != null) {
    if (
      form.type === "manual_claim" &&
      toMinorUnits(form.credit_amount, precision) == null
    ) {
      return "Credit amount must be a valid major-unit amount.";
    }

    if (
      form.type === "deposit_triggered" &&
      toMinorUnits(form.max_credit_amount, precision) == null
    ) {
      return "Max credit amount must be a valid major-unit amount.";
    }

    if (
      form.min_real_balance.trim() &&
      toMinorUnits(form.min_real_balance, precision) == null
    ) {
      return "Min real balance must be a valid major-unit amount.";
    }

    if (toMinorUnits(form.min_deposit_amount || "0", precision) == null) {
      return "Min deposit amount must be a valid major-unit amount.";
    }
  }

  return null;
}

function toServerGroupOption(
  server: { connection_signature: string },
  group: ServerGroup,
): ServerGroupOption {
  const currency = getServerGroupCurrency(group.currency);
  const currencyResolved = hasResolvedServerGroupCurrency(group.currency);

  return {
    id: group.id,
    label: formatServerGroupOptionLabel(
      group.name,
      group.currency,
      server.connection_signature,
    ),
    currencyCode: currencyResolved ? currency.code : "—",
    precision: currencyResolved ? currency.precision : -1,
  };
}

async function loadServerGroupOptionsForPlatform(
  platformId: string,
): Promise<ServerGroupOption[]> {
  const serversResponse = await listTradingServersForAdmin({
    per_page: 100,
    is_active: true,
    platform_id: platformId,
  });

  const groupsByServer = await Promise.all(
    serversResponse.data.map(async (server) => {
      const groupsResponse = await listServerGroupsForAdmin(server.id, {
        per_page: 100,
      });

      return groupsResponse.data.map((group) =>
        toServerGroupOption(server, group),
      );
    }),
  );

  return groupsByServer
    .flat()
    .sort((left, right) => left.label.localeCompare(right.label));
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
  const [serverGroupOptions, setServerGroupOptions] = useState<
    ServerGroupOption[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingServerGroups, setLoadingServerGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editPrecision, setEditPrecision] = useState<number | null>(null);
  const [initialIsActive, setInitialIsActive] = useState(true);
  const [eligibleIbIds, setEligibleIbIds] = useState<string[]>([]);
  const [loadingIbs, setLoadingIbs] = useState(false);
  const [ibSearch, setIbSearch] = useState("");
  const [initialIbSignature, setInitialIbSignature] = useState("");

  const usesTemplate = mode === "create" && form.bonus_offer_template_id !== "";
  const bonusOfferId = bonusOffer?.id;
  const showInvalidateAssignments =
    mode === "edit" && !form.is_active && initialIsActive;
  const showIntroducingBrokers = form.type === "deposit_triggered";

  const effectivePlatformId = useMemo(() => {
    if (mode === "edit") {
      return form.platform_id;
    }

    if (form.bonus_offer_template_id) {
      return (
        templates.find(
          (template) => template.id === form.bonus_offer_template_id,
        )?.platform_id ?? ""
      );
    }

    return form.platform_id;
  }, [
    form.bonus_offer_template_id,
    form.platform_id,
    mode,
    templates,
  ]);

  const selectedServerGroups = useMemo(
    () =>
      serverGroupOptions.filter((option) =>
        form.server_group_ids.includes(option.id),
      ),
    [form.server_group_ids, serverGroupOptions],
  );

  const lockedPrecision = useMemo(() => {
    if (mode === "edit") {
      return editPrecision;
    }

    if (selectedServerGroups.length === 0) {
      return null;
    }

    const precision = selectedServerGroups[0]?.precision;

    if (precision == null || precision < 0) {
      return null;
    }

    return precision;
  }, [editPrecision, mode, selectedServerGroups]);

  const amountUnitHint = useMemo(() => {
    if (lockedPrecision == null) {
      return "Select server groups first to enter amounts in major currency units.";
    }

    const currencies = [
      ...new Set(selectedServerGroups.map((group) => group.currencyCode)),
    ];

    const currencyLabel =
      currencies.length > 0 ? currencies.join(", ") : "selected currencies";

    return `Amounts in major units for ${currencyLabel} (precision ${lockedPrecision}).`;
  }, [lockedPrecision, selectedServerGroups]);

  const selectedSet = useMemo(
    () => new Set(form.server_group_ids),
    [form.server_group_ids],
  );

  const selectedIbSet = useMemo(
    () => new Set(form.introducing_broker_external_user_ids),
    [form.introducing_broker_external_user_ids],
  );

  const filteredEligibleIbIds = useMemo(() => {
    const query = ibSearch.trim().toLowerCase();
    const ids = [
      ...new Set([
        ...eligibleIbIds,
        ...form.introducing_broker_external_user_ids,
      ]),
    ].sort((left, right) => left.localeCompare(right));

    if (!query) {
      return ids;
    }

    return ids.filter((id) => id.toLowerCase().includes(query));
  }, [eligibleIbIds, form.introducing_broker_external_user_ids, ibSearch]);

  const ibsDirty =
    sortedIdsSignature(form.introducing_broker_external_user_ids) !==
    initialIbSignature;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setEditPrecision(null);
      setInitialIsActive(true);
      setServerGroupOptions([]);
      setEligibleIbIds([]);
      setIbSearch("");
      setInitialIbSignature("");

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

          const offer = offerResponse.data;
          const options = await loadServerGroupOptionsForPlatform(
            offer.platform_id,
          );

          if (cancelled) {
            return;
          }

          setServerGroupOptions(options);

          const linkedIds = new Set(
            (offer.server_groups ?? []).map((entry) => entry.server_group_id),
          );
          const linkedOptions = options.filter((option) =>
            linkedIds.has(option.id),
          );
          const precisions = [
            ...new Set(linkedOptions.map((option) => option.precision)),
          ];
          const precision =
            precisions.length === 1 ? (precisions[0] ?? null) : null;

          const linkedIbIds = (offer.introducing_brokers ?? []).map(
            (broker) => broker.external_user_id,
          );

          setEditPrecision(precision);
          setInitialIsActive(offer.is_active ?? true);
          setInitialIbSignature(sortedIdsSignature(linkedIbIds));
          setForm(offerToForm(offer, precision));
          return;
        }

        setForm(emptyForm);
        setInitialIbSignature("");
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

  useEffect(() => {
    if (!open || mode !== "create" || !effectivePlatformId) {
      if (mode === "create") {
        setServerGroupOptions([]);
      }

      return;
    }

    let cancelled = false;

    async function loadGroups() {
      setLoadingServerGroups(true);

      try {
        const options =
          await loadServerGroupOptionsForPlatform(effectivePlatformId);

        if (cancelled) {
          return;
        }

        setServerGroupOptions(options);
        setForm((current) => ({
          ...current,
          server_group_ids: current.server_group_ids.filter((id) =>
            options.some((option) => option.id === id),
          ),
        }));
      } catch (error) {
        if (!cancelled) {
          setServerGroupOptions([]);
          setSubmitError(formatBrokerApiError(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingServerGroups(false);
        }
      }
    }

    void loadGroups();

    return () => {
      cancelled = true;
    };
  }, [effectivePlatformId, mode, open]);

  useEffect(() => {
    if (mode !== "create" || lockedPrecision == null) {
      return;
    }

    const selectedTemplate = templates.find(
      (template) => template.id === form.bonus_offer_template_id,
    );

    if (!selectedTemplate) {
      return;
    }

    setForm((current) => ({
      ...current,
      min_deposit_amount: minorUnitsToMajorInput(
        selectedTemplate.min_deposit_amount ?? 0,
        lockedPrecision,
      ),
    }));
  }, [form.bonus_offer_template_id, lockedPrecision, mode, templates]);

  useEffect(() => {
    if (!open || !showIntroducingBrokers || loading) {
      return;
    }

    let cancelled = false;

    async function loadEligibleIbs() {
      setLoadingIbs(true);

      try {
        const response = await listEligibleIntroducingBrokers(
          mode === "edit" && bonusOfferId
            ? { exclude_bonus_offer_id: bonusOfferId }
            : {},
        );

        if (cancelled) {
          return;
        }

        setEligibleIbIds(
          response.data.map((broker) => broker.external_user_id),
        );
      } catch (error) {
        if (!cancelled) {
          setEligibleIbIds([]);
          setSubmitError(formatBrokerApiError(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingIbs(false);
        }
      }
    }

    void loadEligibleIbs();

    return () => {
      cancelled = true;
    };
  }, [bonusOfferId, loading, mode, open, showIntroducingBrokers]);

  function toggleServerGroup(serverGroupId: string, checked: boolean) {
    setForm((current) => {
      if (!checked) {
        return {
          ...current,
          server_group_ids: current.server_group_ids.filter(
            (id) => id !== serverGroupId,
          ),
        };
      }

      if (current.server_group_ids.includes(serverGroupId)) {
        return current;
      }

      return {
        ...current,
        server_group_ids: [...current.server_group_ids, serverGroupId],
      };
    });
  }

  function toggleIntroducingBroker(externalUserId: string, checked: boolean) {
    setForm((current) => {
      if (checked) {
        return current.introducing_broker_external_user_ids.includes(
          externalUserId,
        )
          ? current
          : {
              ...current,
              introducing_broker_external_user_ids: [
                ...current.introducing_broker_external_user_ids,
                externalUserId,
              ],
            };
      }

      return {
        ...current,
        introducing_broker_external_user_ids:
          current.introducing_broker_external_user_ids.filter(
            (id) => id !== externalUserId,
          ),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form, mode, lockedPrecision);

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "create") {
        if (lockedPrecision == null) {
          setSubmitError("Select at least one server group.");
          return;
        }

        await createBonusOffer(buildCreatePayload(form, lockedPrecision));
      } else if (bonusOfferId) {
        await updateBonusOffer(
          bonusOfferId,
          buildUpdatePayload(form, lockedPrecision),
        );

        if (showIntroducingBrokers && ibsDirty) {
          await syncBonusOfferIntroducingBrokers(bonusOfferId, {
            external_user_ids: form.introducing_broker_external_user_ids,
          });
        }
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      setSubmitError(formatBrokerApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  const amountInputsDisabled =
    submitting || (mode === "create" && lockedPrecision == null);

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
                        setForm((current) => {
                          const nextType = (value ??
                            "deposit_triggered") as BonusOfferType;

                          return {
                            ...current,
                            type: nextType,
                            introducing_broker_external_user_ids:
                              nextType === "deposit_triggered"
                                ? current.introducing_broker_external_user_ids
                                : [],
                          };
                        })
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
                        const templateId =
                          value === "none" ? "" : (value ?? "");

                        setForm((current) => ({
                          ...current,
                          bonus_offer_template_id: templateId,
                          server_group_ids: [],
                          min_deposit_amount: "0",
                          min_position_duration_seconds:
                            templates.find(
                              (template) => template.id === templateId,
                            ) != null
                              ? String(
                                  templates.find(
                                    (template) => template.id === templateId,
                                  )?.min_position_duration_seconds ?? 0,
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
                          server_group_ids: [],
                        }))
                      }
                      disabled={submitting || mode === "edit"}
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

                {mode === "create" ? (
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-server-groups"
                      help={BONUS_OFFER_FIELD_HELP.server_groups}
                    >
                      Server groups
                    </BonusOfferFieldLabel>
                    <p className="text-xs text-muted-foreground">
                      {amountUnitHint}
                    </p>
                    {!effectivePlatformId ? (
                      <p className="text-sm text-muted-foreground">
                        Select a platform or template first.
                      </p>
                    ) : null}
                    {effectivePlatformId && loadingServerGroups ? (
                      <Skeleton className="h-24 w-full" />
                    ) : null}
                    {effectivePlatformId &&
                    !loadingServerGroups &&
                    serverGroupOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No server groups found for this platform.
                      </p>
                    ) : null}
                    {effectivePlatformId && !loadingServerGroups
                      ? serverGroupOptions.map((option) => {
                          const checkboxId = `bonus-offer-form-group-${option.id}`;
                          const currencyUnavailable = option.precision < 0;
                          const disabledByPrecision =
                            lockedPrecision != null &&
                            option.precision !== lockedPrecision &&
                            !selectedSet.has(option.id);

                          return (
                            <div
                              key={option.id}
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <Checkbox
                                id={checkboxId}
                                checked={selectedSet.has(option.id)}
                                onCheckedChange={(checked) =>
                                  toggleServerGroup(
                                    option.id,
                                    checked === true,
                                  )
                                }
                                disabled={
                                  submitting ||
                                  currencyUnavailable ||
                                  disabledByPrecision
                                }
                              />
                              <label
                                htmlFor={checkboxId}
                                className="flex-1 cursor-pointer text-sm leading-snug"
                              >
                                {option.label}
                                {currencyUnavailable
                                  ? " — currency unavailable"
                                  : disabledByPrecision
                                    ? " — different precision"
                                    : ""}
                              </label>
                            </div>
                          );
                        })
                      : null}
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
                      min={0}
                      step={
                        lockedPrecision == null
                          ? "1"
                          : (10 ** -lockedPrecision).toFixed(lockedPrecision)
                      }
                      value={form.credit_amount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          credit_amount: event.target.value,
                        }))
                      }
                      disabled={amountInputsDisabled}
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
                        min={0}
                        step={
                          lockedPrecision == null
                            ? "1"
                            : (10 ** -lockedPrecision).toFixed(lockedPrecision)
                        }
                        value={form.max_credit_amount}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            max_credit_amount: event.target.value,
                          }))
                        }
                        disabled={amountInputsDisabled}
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

                {showIntroducingBrokers ? (
                  <div className="space-y-2">
                    <BonusOfferFieldLabel
                      htmlFor="bonus-offer-ib-search"
                      help={BONUS_OFFER_FIELD_HELP.introducing_brokers}
                    >
                      Introducing brokers
                    </BonusOfferFieldLabel>
                    <p className="text-xs text-muted-foreground">
                      {form.introducing_broker_external_user_ids.length === 0
                        ? "No IBs selected — this offer acts as the system default deposit bonus when no IB-linked offer matches."
                        : `${form.introducing_broker_external_user_ids.length} IB${form.introducing_broker_external_user_ids.length === 1 ? "" : "s"} selected.`}
                    </p>
                    {loadingIbs ? (
                      <Skeleton className="h-24 w-full" />
                    ) : (
                      <>
                        <Input
                          id="bonus-offer-ib-search"
                          value={ibSearch}
                          onChange={(event) => setIbSearch(event.target.value)}
                          placeholder="Filter by external user ID"
                          disabled={
                            submitting ||
                            (eligibleIbIds.length === 0 &&
                              form.introducing_broker_external_user_ids
                                .length === 0)
                          }
                        />

                        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
                          {eligibleIbIds.length === 0 &&
                          form.introducing_broker_external_user_ids.length ===
                            0 ? (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No eligible introducing brokers. Active IB
                              partners already linked to another deposit offer
                              are excluded.
                            </p>
                          ) : null}

                          {(eligibleIbIds.length > 0 ||
                            form.introducing_broker_external_user_ids.length >
                              0) &&
                          filteredEligibleIbIds.length === 0 ? (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No introducing brokers match this search.
                            </p>
                          ) : null}

                          {filteredEligibleIbIds.map((externalUserId) => {
                            const checkboxId = `bonus-offer-form-ib-${externalUserId}`;

                            return (
                              <label
                                key={externalUserId}
                                htmlFor={checkboxId}
                                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                              >
                                <Checkbox
                                  id={checkboxId}
                                  checked={selectedIbSet.has(externalUserId)}
                                  onCheckedChange={(value) =>
                                    toggleIntroducingBroker(
                                      externalUserId,
                                      value === true,
                                    )
                                  }
                                  disabled={submitting}
                                />
                                <span className="font-mono text-sm break-all">
                                  {externalUserId}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}

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
                      step={
                        lockedPrecision == null
                          ? "1"
                          : (10 ** -lockedPrecision).toFixed(lockedPrecision)
                      }
                      value={form.min_real_balance}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          min_real_balance: event.target.value,
                        }))
                      }
                      disabled={amountInputsDisabled}
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
                      step={
                        lockedPrecision == null
                          ? "1"
                          : (10 ** -lockedPrecision).toFixed(lockedPrecision)
                      }
                      value={form.min_deposit_amount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          min_deposit_amount: event.target.value,
                        }))
                      }
                      disabled={amountInputsDisabled}
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
                          invalidate_assignments:
                            checked === true
                              ? current.invalidate_assignments
                              : true,
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

                {showInvalidateAssignments ? (
                  <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5">
                    <Checkbox
                      id="bonus-offer-invalidate-assignments"
                      checked={form.invalidate_assignments}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          invalidate_assignments: checked === true,
                        }))
                      }
                      disabled={submitting}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <BonusOfferFieldLabel
                        htmlFor="bonus-offer-invalidate-assignments"
                        help={BONUS_OFFER_FIELD_HELP.invalidate_assignments}
                      >
                        Cancel open assignments
                      </BonusOfferFieldLabel>
                      <p className="text-xs text-muted-foreground leading-snug">
                        Required when deactivating. Leave checked to abort open
                        assignments; uncheck to keep them running on their
                        frozen rules snapshot.
                      </p>
                    </div>
                  </div>
                ) : null}
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
