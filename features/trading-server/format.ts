import type {
  BalanceAdjustmentType,
  RestrictedCountry,
  ServerGroup,
  ServerGroupCurrency,
  UpdateServerGroupInput,
} from "@/features/trading-server/types";

const CONFIGURATION_WARNING_LABELS: Record<string, string> = {
  default_and_private:
    "This group is marked as default and private at the same time.",
  default_inactive: "The default group is inactive.",
  deposit_disabled_with_default_amount:
    "Default amount is set but deposits are disabled.",
  withdrawal_disabled: "Withdrawals are disabled for this group.",
  countries_restrictions_empty:
    "Country restrictions are enabled but no countries are listed.",
  no_leverages_assigned: "No leverages are assigned to this group.",
};

export function formatConfigurationWarning(code: string): string {
  return CONFIGURATION_WARNING_LABELS[code] ?? code;
}

export function getServerGroupCurrency(
  currency: ServerGroup["currency"],
): ServerGroupCurrency {
  if (currency == null) {
    return { code: "USD", precision: 2 };
  }

  if (typeof currency === "string") {
    return { code: currency, precision: 2 };
  }

  return {
    code: currency.code ?? currency.iso_code ?? "USD",
    precision: currency.precision ?? 2,
  };
}

export function formatCurrencyLabel(currency: ServerGroup["currency"]): string {
  return getServerGroupCurrency(currency).code;
}

export function decimalMajorToMinorUnits(
  value: string | number | null | undefined,
  precision: number,
): string {
  if (value == null || value === "") {
    return "0";
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return "0";
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const paddedFraction = fractionPart.padEnd(precision, "0").slice(0, precision);
  const minorUnits = `${wholePart}${paddedFraction}`.replace(/^-/, "");

  return minorUnits === "" ? "0" : minorUnits;
}

export function parseOptionalMinorUnits(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export type ServerGroupEditFormState = {
  description: string;
  is_default: boolean;
  is_private: boolean;
  is_active: boolean;
  is_deposit_enabled: boolean;
  is_withdrawal_enabled: boolean;
  use_countries_restrictions: boolean;
  restricted_countries: RestrictedCountry[];
  default_amount: string;
  default_amount_type: BalanceAdjustmentType;
  account_limits: string;
  min_deposit: string;
  min_withdrawal: string;
  ib_external_user_ids: string;
};

export function buildServerGroupEditFormState(
  serverGroup: ServerGroup,
): ServerGroupEditFormState {
  const currency = getServerGroupCurrency(serverGroup.currency);

  return {
    description: serverGroup.description ?? "",
    is_default: serverGroup.is_default ?? false,
    is_private: serverGroup.is_private ?? false,
    is_active: serverGroup.is_active,
    is_deposit_enabled: serverGroup.is_deposit_enabled ?? true,
    is_withdrawal_enabled: serverGroup.is_withdrawal_enabled ?? true,
    use_countries_restrictions: serverGroup.use_countries_restrictions ?? false,
    restricted_countries: serverGroup.restricted_countries ?? [],
    default_amount: decimalMajorToMinorUnits(
      serverGroup.default_amount,
      currency.precision,
    ),
    default_amount_type: serverGroup.default_amount_type ?? "BALANCE",
    account_limits: String(serverGroup.account_limits ?? 0),
    min_deposit: decimalMajorToMinorUnits(
      serverGroup.min_deposit,
      currency.precision,
    ),
    min_withdrawal: decimalMajorToMinorUnits(
      serverGroup.min_withdrawal,
      currency.precision,
    ),
    ib_external_user_ids: (serverGroup.ib_external_user_ids ?? []).join("\n"),
  };
}

export function buildUpdateServerGroupInput(
  form: ServerGroupEditFormState,
): UpdateServerGroupInput {
  const restrictedCountries = form.restricted_countries
    .map((country) => ({
      code: country.code.trim().toUpperCase(),
      name: country.name.trim(),
    }))
    .filter((country) => country.code.length > 0 && country.name.length > 0);

  const ibExternalUserIds = form.ib_external_user_ids
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    description: form.description.trim() || null,
    is_default: form.is_default,
    is_private: form.is_private,
    is_active: form.is_active,
    is_deposit_enabled: form.is_deposit_enabled,
    is_withdrawal_enabled: form.is_withdrawal_enabled,
    use_countries_restrictions: form.use_countries_restrictions,
    restricted_countries: restrictedCountries,
    default_amount: parseOptionalMinorUnits(form.default_amount) ?? 0,
    default_amount_type: form.default_amount_type,
    account_limits: parseOptionalMinorUnits(form.account_limits) ?? 0,
    min_deposit: parseOptionalMinorUnits(form.min_deposit) ?? 0,
    min_withdrawal: parseOptionalMinorUnits(form.min_withdrawal) ?? 0,
    ib_external_user_ids: ibExternalUserIds,
  };
}
