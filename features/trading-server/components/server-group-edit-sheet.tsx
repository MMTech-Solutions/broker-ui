"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateServerGroup, listTradingServerEnvironments } from "@/features/trading-server/api";
import {
  buildServerGroupEditFormState,
  buildUpdateServerGroupInput,
  formatConfigurationWarning,
  formatCurrencyLabel,
  parseOptionalMajorToMinorUnits,
  parseOptionalMinorUnits,
  parseNonNegativeDecimal,
  type ServerGroupEditFormState,
} from "@/features/trading-server/format";
import type {
  BookType,
  RestrictedCountry,
  ServerGroup,
  TradingServerEnvironment,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ServerGroupEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradingServerId: string;
  serverGroup: ServerGroup | null;
  onSuccess: (serverGroup: ServerGroup) => void;
};

const emptyCountryRow = (): RestrictedCountry => ({
  code: "",
  name: "",
});

export function ServerGroupEditSheet({
  open,
  onOpenChange,
  tradingServerId,
  serverGroup,
  onSuccess,
}: ServerGroupEditSheetProps) {
  const [form, setForm] = useState<ServerGroupEditFormState | null>(null);
  const [environments, setEnvironments] = useState<TradingServerEnvironment[]>(
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const displayCurrencyLabel = useMemo(() => {
    if (form?.currency_code.trim()) {
      return form.currency_code.trim().toUpperCase();
    }

    return formatCurrencyLabel(serverGroup?.currency);
  }, [form?.currency_code, serverGroup?.currency]);

  useEffect(() => {
    if (!open || !serverGroup) {
      return;
    }

    setForm(buildServerGroupEditFormState(serverGroup));
    setWarnings(serverGroup.configuration_warnings ?? []);
    setError(null);

    let cancelled = false;

    void listTradingServerEnvironments()
      .then((response) => {
        if (!cancelled) {
          setEnvironments(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnvironments([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, serverGroup]);

  async function handleSubmit() {
    if (!serverGroup || !form) {
      return;
    }

    const currencyCode = form.currency_code.trim().toUpperCase();
    const precision = parseOptionalMinorUnits(form.currency_precision);

    if (
      form.currency_code_editable &&
      currencyCode !== "" &&
      !/^[A-Z]{3}$/.test(currencyCode)
    ) {
      setError("Currency must be a 3-letter ISO code (e.g. USD).");
      return;
    }

    if (form.is_active && currencyCode === "") {
      setError("Currency code is required before activating this server group.");
      return;
    }

    if (form.is_active && precision === undefined) {
      setError(
        "Currency precision is required before activating this server group.",
      );
      return;
    }

    if (form.is_active && form.environment === null) {
      setError("Environment is required before activating this server group.");
      return;
    }

    const denominationFactor = parseOptionalMinorUnits(
      form.currency_denomination_factor,
    );

    if (denominationFactor === undefined || denominationFactor < 1) {
      setError("Currency denomination factor must be an integer of at least 1.");
      return;
    }

    if (precision !== undefined) {
      const moneyFields = [
        ["default_amount", "Default amount"],
        ["min_deposit", "Min deposit"],
        ["min_withdrawal", "Min withdrawal"],
      ] as const;

      for (const [field, label] of moneyFields) {
        const raw = form[field].trim();
        if (raw !== "" && parseOptionalMajorToMinorUnits(raw, precision) === undefined) {
          setError(
            `${label} must be a valid amount in major units (e.g. 1.00 ${currencyCode || "USD"}).`,
          );
          return;
        }
      }
    }

    const decimalTermFields = [
      ["pips", "Pips"],
      ["lot", "Lot"],
      ["min_trade", "Min trade"],
      ["commission", "Commission"],
    ] as const;

    for (const [field, label] of decimalTermFields) {
      if (parseNonNegativeDecimal(form[field]) === undefined) {
        setError(`${label} must be a number greater than or equal to 0.`);
        return;
      }
    }

    const integerTermFields = [
      ["margin_call", "Margin call"],
      ["stop_out", "Stop out"],
    ] as const;

    for (const [field, label] of integerTermFields) {
      const raw = form[field].trim();
      if (raw !== "" && parseOptionalMinorUnits(raw) === undefined) {
        setError(`${label} must be an integer greater than or equal to 0.`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await updateServerGroup(
        tradingServerId,
        serverGroup.id,
        buildUpdateServerGroupInput(form),
      );

      const nextWarnings = response.meta.configuration_warnings ?? [];
      setWarnings(nextWarnings);
      onSuccess(response.data);

      if (nextWarnings.length === 0) {
        onOpenChange(false);
      }
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  function updateCountry(
    index: number,
    field: keyof RestrictedCountry,
    value: string,
  ) {
    setForm((current) => {
      if (!current) {
        return current;
      }

      const nextCountries = [...current.restricted_countries];
      nextCountries[index] = {
        ...nextCountries[index],
        [field]: value,
      };

      return {
        ...current,
        restricted_countries: nextCountries,
      };
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{serverGroup?.name ?? "Server group"}</SheetTitle>
          <SheetDescription>
            Edit commercial settings for this server group. The platform name is
            synced and read-only; meta name is the label shown to clients. If
            currency was not synced, set the ISO code and precision before
            activating the group. Environment must also be set before
            activation.
          </SheetDescription>
        </SheetHeader>

        {form ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {warnings.length > 0 ? (
              <Alert variant="warning">
                <AlertTitle>Configuration warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc space-y-1 pl-4">
                    {warnings.map((warning) => (
                      <li key={warning}>
                        {formatConfigurationWarning(warning)}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            {error ? (
              <ApiErrorAlert title="Could not save server group" message={error} />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="server-group-platform-name">Platform name</Label>
              <Input
                id="server-group-platform-name"
                value={serverGroup?.name ?? ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Identity from the trading platform (not editable).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-meta-name">Meta name</Label>
              <Input
                id="server-group-meta-name"
                value={form.meta_name}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, meta_name: event.target.value }
                      : current,
                  )
                }
                disabled={submitting}
                placeholder="Label shown to clients"
              />
              <p className="text-xs text-muted-foreground">
                Display name for clients. Falls back to the platform name if empty.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="server-group-currency">Currency</Label>
                <Input
                  id="server-group-currency"
                  value={
                    form.currency_code_editable
                      ? form.currency_code
                      : displayCurrencyLabel
                  }
                  maxLength={3}
                  placeholder="USD"
                  onChange={(event) =>
                    setForm((current) =>
                      current?.currency_code_editable
                        ? {
                            ...current,
                            currency_code: event.target.value
                              .replace(/[^a-zA-Z]/g, "")
                              .toUpperCase()
                              .slice(0, 3),
                            ...(event.target.value.trim() === "" &&
                            current.is_active
                              ? { is_active: false }
                              : {}),
                          }
                        : current,
                    )
                  }
                  disabled={submitting || !form.currency_code_editable}
                />
                <p className="text-xs text-muted-foreground">
                  {form.currency_code_editable
                    ? "3-letter ISO 4217 code. Required to activate the group."
                    : "Synced from the trading platform."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-group-currency-precision">
                  Currency precision
                </Label>
                <Input
                  id="server-group-currency-precision"
                  inputMode="numeric"
                  min={0}
                  max={8}
                  placeholder="e.g. 2 for USD, 0 for JPY"
                  value={form.currency_precision}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            currency_precision: event.target.value,
                            ...(event.target.value.trim() === "" &&
                            current.is_active
                              ? { is_active: false }
                              : {}),
                          }
                        : current,
                    )
                  }
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Decimal places (0–8). Required to activate the group.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-currency-denomination-factor">
                Currency denomination factor
              </Label>
              <Input
                id="server-group-currency-denomination-factor"
                inputMode="numeric"
                min={1}
                placeholder="1"
                value={form.currency_denomination_factor}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          currency_denomination_factor: event.target.value,
                        }
                      : current,
                  )
                }
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Converts account units to the base currency. Use 1 for standard
                accounts, 100 for cent accounts (e.g. USC).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-environment">Environment</Label>
              <Select
                value={
                  form.environment !== null
                    ? String(form.environment)
                    : "__none__"
                }
                onValueChange={(value) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          environment:
                            value === "__none__" || value == null
                              ? null
                              : Number.parseInt(value, 10),
                          ...(value === "__none__" || value == null
                            ? { is_active: false }
                            : {}),
                        }
                      : current,
                  )
                }
                disabled={submitting}
              >
                <SelectTrigger id="server-group-environment">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not set</SelectItem>
                  {environments.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required to activate the group. Demo groups do not support
                deposits, withdrawals, or being the system default.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-book-type">Book type</Label>
              <Select
                value={form.book_type || "__none__"}
                onValueChange={(value) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          book_type:
                            value === "__none__" || value == null
                              ? ""
                              : (value as BookType),
                        }
                      : current,
                  )
                }
                disabled={submitting}
              >
                <SelectTrigger id="server-group-book-type">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not set</SelectItem>
                  <SelectItem value="a_book">A-book</SelectItem>
                  <SelectItem value="b_book">B-book</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Local broker setting (not synced from the trading platform).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-description">Description</Label>
              <Input
                id="server-group-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current,
                  )
                }
                disabled={submitting}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["is_default", "Default group"],
                  ["is_private", "Private group"],
                  ["is_active", "Active"],
                  ["use_countries_restrictions", "Country restrictions"],
                ] as const
              ).map(([field, label]) => {
                const currencyCodeMissing = form.currency_code.trim() === "";
                const precisionUnset =
                  parseOptionalMinorUnits(form.currency_precision) ===
                  undefined;
                const environmentUnset = form.environment === null;
                const disableActive =
                  field === "is_active" &&
                  (currencyCodeMissing || precisionUnset || environmentUnset);

                return (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={`server-group-${field}`}
                    checked={form[field]}
                    onCheckedChange={(checked) =>
                      setForm((current) =>
                        current
                          ? { ...current, [field]: checked === true }
                          : current,
                      )
                    }
                    disabled={submitting || disableActive}
                  />
                  <Label htmlFor={`server-group-${field}`}>{label}</Label>
                </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-group-account-limits">
                Account limits
              </Label>
              <Input
                id="server-group-account-limits"
                inputMode="numeric"
                value={form.account_limits}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, account_limits: event.target.value }
                      : current,
                  )
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Initial trading amount</p>
              <p className="text-xs text-muted-foreground">
                Credited on the trading account at creation as balance or
                credit. It does not go through Finance. Amounts are in major
                units (e.g. 1.00 {displayCurrencyLabel}).
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="server-group-default-amount">
                    Default amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="server-group-default-amount"
                      inputMode="decimal"
                      className="pr-14"
                      value={form.default_amount}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, default_amount: event.target.value }
                            : current,
                        )
                      }
                      disabled={submitting}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      {displayCurrencyLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server-group-default-amount-type">
                    Default amount type
                  </Label>
                  <Select
                    value={form.default_amount_type}
                    onValueChange={(value) =>
                      setForm((current) =>
                        current && (value === "BALANCE" || value === "CREDIT")
                          ? { ...current, default_amount_type: value }
                          : current,
                      )
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="server-group-default-amount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BALANCE">Balance</SelectItem>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Deposits and withdrawals</p>
              <p className="text-xs text-muted-foreground">
                Finance cashflow. Independent of the initial trading amount.
                Minimums are in major units (e.g. 1.00 {displayCurrencyLabel}).
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["is_deposit_enabled", "Deposits enabled"],
                    ["is_withdrawal_enabled", "Withdrawals enabled"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={`server-group-${field}`}
                      checked={form[field]}
                      onCheckedChange={(checked) =>
                        setForm((current) =>
                          current
                            ? { ...current, [field]: checked === true }
                            : current,
                        )
                      }
                      disabled={submitting}
                    />
                    <Label htmlFor={`server-group-${field}`}>{label}</Label>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="server-group-min-deposit">Min deposit</Label>
                  <div className="relative">
                    <Input
                      id="server-group-min-deposit"
                      inputMode="decimal"
                      className="pr-14"
                      value={form.min_deposit}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, min_deposit: event.target.value }
                            : current,
                        )
                      }
                      disabled={submitting}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      {displayCurrencyLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server-group-min-withdrawal">
                    Min withdrawal
                  </Label>
                  <div className="relative">
                    <Input
                      id="server-group-min-withdrawal"
                      inputMode="decimal"
                      className="pr-14"
                      value={form.min_withdrawal}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, min_withdrawal: event.target.value }
                            : current,
                        )
                      }
                      disabled={submitting}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      {displayCurrencyLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Trading terms</p>
              <p className="text-xs text-muted-foreground">
                Informational details shown to clients when they pick this
                server group. They do not affect trading or eligibility.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["pips", "Pips", "decimal"],
                    ["lot", "Lot", "decimal"],
                    ["min_trade", "Min trade", "decimal"],
                    ["commission", "Commission", "decimal"],
                    ["margin_call", "Margin call", "numeric"],
                    ["stop_out", "Stop out", "numeric"],
                  ] as const
                ).map(([field, label, inputMode]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={`server-group-${field}`}>{label}</Label>
                    <div className="relative">
                      <Input
                        id={`server-group-${field}`}
                        inputMode={inputMode}
                        className={
                          inputMode === "numeric" ? "pr-8" : undefined
                        }
                        value={form[field]}
                        onChange={(event) =>
                          setForm((current) =>
                            current
                              ? { ...current, [field]: event.target.value }
                              : current,
                          )
                        }
                        disabled={submitting}
                      />
                      {inputMode === "numeric" ? (
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                          %
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {form.use_countries_restrictions ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Country list</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              restricted_countries: [
                                ...current.restricted_countries,
                                emptyCountryRow(),
                              ],
                            }
                          : current,
                      )
                    }
                    disabled={submitting}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add country
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server-group-country-list-mode">
                    List mode
                  </Label>
                  <Select
                    value={
                      form.is_restricted_countries_allowlist
                        ? "allowlist"
                        : "denylist"
                    }
                    onValueChange={(value) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              is_restricted_countries_allowlist:
                                value === "allowlist",
                            }
                          : current,
                      )
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="server-group-country-list-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="denylist">
                        Block listed countries
                      </SelectItem>
                      <SelectItem value="allowlist">
                        Allow only listed countries
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {form.is_restricted_countries_allowlist
                      ? "Only users whose country is in this list can open accounts. An empty list blocks everyone."
                      : "Users whose country is in this list cannot open accounts. An empty list blocks nobody with a resolvable country."}
                  </p>
                </div>

                {form.restricted_countries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No countries added yet.
                  </p>
                ) : null}

                {form.restricted_countries.map((country, index) => (
                  <div
                    key={`country-${index}`}
                    className="grid gap-2 sm:grid-cols-[96px_1fr_auto]"
                  >
                    <Input
                      aria-label={`Country code ${index + 1}`}
                      placeholder="US"
                      maxLength={2}
                      value={country.code}
                      onChange={(event) =>
                        updateCountry(index, "code", event.target.value)
                      }
                      disabled={submitting}
                    />
                    <Input
                      aria-label={`Country name ${index + 1}`}
                      placeholder="United States"
                      value={country.name}
                      onChange={(event) =>
                        updateCountry(index, "name", event.target.value)
                      }
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove country ${index + 1}`}
                      onClick={() =>
                        setForm((current) =>
                          current
                            ? {
                                ...current,
                                restricted_countries:
                                  current.restricted_countries.filter(
                                    (_, rowIndex) => rowIndex !== index,
                                  ),
                              }
                            : current,
                        )
                      }
                      disabled={submitting}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="server-group-ib-ids">
                Allowed IB external user IDs
              </Label>
              <p className="text-xs text-muted-foreground">
                One ID per line. Leave empty to allow all eligible users.
              </p>
              <textarea
                id="server-group-ib-ids"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={form.ib_external_user_ids}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          ib_external_user_ids: event.target.value,
                        }
                      : current,
                  )
                }
                disabled={submitting}
              />
            </div>
          </div>
        ) : null}

        <SheetFooter className="border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !form}
          >
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
