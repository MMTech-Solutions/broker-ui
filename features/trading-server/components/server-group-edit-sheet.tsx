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
import { updateServerGroup } from "@/features/trading-server/api";
import {
  buildServerGroupEditFormState,
  buildUpdateServerGroupInput,
  formatConfigurationWarning,
  formatCurrencyLabel,
  type ServerGroupEditFormState,
} from "@/features/trading-server/format";
import type { RestrictedCountry, ServerGroup } from "@/features/trading-server/types";
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const currencyLabel = useMemo(
    () => formatCurrencyLabel(serverGroup?.currency),
    [serverGroup?.currency],
  );

  useEffect(() => {
    if (!open || !serverGroup) {
      return;
    }

    setForm(buildServerGroupEditFormState(serverGroup));
    setWarnings(serverGroup.configuration_warnings ?? []);
    setError(null);
  }, [open, serverGroup]);

  async function handleSubmit() {
    if (!serverGroup || !form) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await updateServerGroup(
        tradingServerId,
        serverGroup.id,
        buildUpdateServerGroupInput(form),
      );

      setWarnings(response.meta.configuration_warnings ?? []);
      onSuccess(response.data);
      onOpenChange(false);
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
            Edit commercial settings for this server group. Synced fields such as
            name, meta name, and currency are read-only.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="server-group-meta-name">Meta name</Label>
                <Input
                  id="server-group-meta-name"
                  value={serverGroup?.meta_name ?? ""}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-group-currency">Currency</Label>
                <Input
                  id="server-group-currency"
                  value={currencyLabel}
                  disabled
                />
              </div>
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
                  ["is_deposit_enabled", "Deposits enabled"],
                  ["is_withdrawal_enabled", "Withdrawals enabled"],
                  ["use_countries_restrictions", "Country restrictions"],
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

            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Amounts and limits</p>
              <p className="text-xs text-muted-foreground">
                Monetary fields use minor currency units (e.g. cents for{" "}
                {currencyLabel}).
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="server-group-default-amount">
                    Default amount
                  </Label>
                  <Input
                    id="server-group-default-amount"
                    inputMode="numeric"
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

                <div className="space-y-2">
                  <Label htmlFor="server-group-min-deposit">Min deposit</Label>
                  <Input
                    id="server-group-min-deposit"
                    inputMode="numeric"
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
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="server-group-min-withdrawal">
                    Min withdrawal
                  </Label>
                  <Input
                    id="server-group-min-withdrawal"
                    inputMode="numeric"
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
                </div>
              </div>
            </div>

            {form.use_countries_restrictions ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Restricted countries</p>
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
