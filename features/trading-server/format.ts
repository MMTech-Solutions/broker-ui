import type {
  BalanceAdjustmentType,
  BookType,
  RestrictedCountry,
  ServerGroup,
  ServerGroupCurrency,
  UpdateServerGroupInput,
} from "@/features/trading-server/types";

const CONFIGURATION_WARNING_LABELS: Record<string, string> = {
  default_and_private:
    "This group is marked as default and private at the same time.",
  default_inactive: "The default group is inactive.",
  default_with_auto_create_disabled:
    "This group is marked as default, but create-default-account on registration is disabled.",
  auto_create_without_default_group:
    "Create-default-account on registration is enabled, but there is no active default server group.",
  deposit_disabled_with_default_amount:
    "Default amount is set but deposits are disabled.",
  withdrawal_disabled: "Withdrawals are disabled for this group.",
  countries_restrictions_empty:
    "Country restrictions are enabled but no countries are listed.",
  no_leverages_assigned: "No leverages are assigned to this group.",
  currency_missing:
    "Currency code is not configured. Set it before activating this group.",
  currency_precision_missing:
    "Currency precision is not configured. Set it before activating this group.",
};

export function formatConfigurationWarning(code: string): string {
  return CONFIGURATION_WARNING_LABELS[code] ?? code;
}

/**
 * Normalize server-group currency without fabricating defaults.
 * Missing code or precision stay empty/null so callers can gate money ops.
 */
export function getServerGroupCurrency(
  currency: ServerGroup["currency"],
): ServerGroupCurrency {
  if (currency == null) {
    return { code: "", precision: null };
  }

  if (typeof currency === "string") {
    return { code: currency.trim(), precision: null };
  }

  const code = (currency.code ?? currency.iso_code ?? "").trim();
  const precision =
    typeof currency.precision === "number" ? currency.precision : null;

  return {
    code,
    precision,
    ...(currency.iso_code ? { iso_code: currency.iso_code } : {}),
  };
}

export function hasResolvedServerGroupCurrency(
  currency: ServerGroup["currency"],
): boolean {
  if (currency == null) {
    return false;
  }

  if (typeof currency === "string") {
    return false;
  }

  const code = currency.code ?? currency.iso_code;

  return Boolean(code) && typeof currency.precision === "number";
}

export function formatServerGroupOptionLabel(
  groupName: string,
  currency: ServerGroup["currency"],
  tradingServerSignature?: string | null,
): string {
  const resolved = getServerGroupCurrency(currency);
  const currencyPart = hasResolvedServerGroupCurrency(currency)
    ? `${resolved.code} (precision ${resolved.precision})`
    : resolved.code
      ? `${resolved.code} (precision unset)`
      : "currency unavailable";

  const serverPart = tradingServerSignature
    ? `${tradingServerSignature.slice(0, 8)}…`
    : null;

  return serverPart
    ? `${groupName} · ${currencyPart} · ${serverPart}`
    : `${groupName} · ${currencyPart}`;
}

export function formatCurrencyLabel(currency: ServerGroup["currency"]): string {
  const code = getServerGroupCurrency(currency).code;

  return code || "—";
}

export function formatBookTypeLabel(bookType: BookType | null | undefined): string {
  if (bookType === "a_book") {
    return "A-book";
  }

  if (bookType === "b_book") {
    return "B-book";
  }

  return "—";
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
  currency_code: string;
  currency_code_editable: boolean;
  currency_precision: string;
  book_type: BookType | "";
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
  const currencyCodeMissing = currency.code === "";
  const precisionMissing =
    (serverGroup.configuration_warnings ?? []).includes(
      "currency_precision_missing",
    ) || currency.precision == null;

  const precision = currency.precision;

  return {
    description: serverGroup.description ?? "",
    is_default: serverGroup.is_default ?? false,
    is_private: serverGroup.is_private ?? false,
    is_active: serverGroup.is_active,
    is_deposit_enabled: serverGroup.is_deposit_enabled ?? true,
    is_withdrawal_enabled: serverGroup.is_withdrawal_enabled ?? true,
    use_countries_restrictions: serverGroup.use_countries_restrictions ?? false,
    restricted_countries: serverGroup.restricted_countries ?? [],
    currency_code: currency.code,
    currency_code_editable: currencyCodeMissing,
    currency_precision: precisionMissing ? "" : String(precision),
    book_type: serverGroup.book_type ?? "",
    default_amount:
      precision == null
        ? ""
        : decimalMajorToMinorUnits(serverGroup.default_amount, precision),
    default_amount_type: serverGroup.default_amount_type ?? "BALANCE",
    account_limits: String(serverGroup.account_limits ?? 0),
    min_deposit:
      precision == null
        ? ""
        : decimalMajorToMinorUnits(serverGroup.min_deposit, precision),
    min_withdrawal:
      precision == null
        ? ""
        : decimalMajorToMinorUnits(serverGroup.min_withdrawal, precision),
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

  const currencyCode = form.currency_code.trim().toUpperCase();
  const currencyPrecision = parseOptionalMinorUnits(form.currency_precision);

  return {
    description: form.description.trim() || null,
    is_default: form.is_default,
    is_private: form.is_private,
    is_active: form.is_active,
    is_deposit_enabled: form.is_deposit_enabled,
    is_withdrawal_enabled: form.is_withdrawal_enabled,
    use_countries_restrictions: form.use_countries_restrictions,
    restricted_countries: restrictedCountries,
    book_type: form.book_type === "" ? null : form.book_type,
    ...(form.currency_code_editable && currencyCode !== ""
      ? { currency: currencyCode }
      : {}),
    ...(currencyPrecision !== undefined
      ? { currency_precision: currencyPrecision }
      : {}),
    default_amount: parseOptionalMinorUnits(form.default_amount) ?? 0,
    default_amount_type: form.default_amount_type,
    account_limits: parseOptionalMinorUnits(form.account_limits) ?? 0,
    min_deposit: parseOptionalMinorUnits(form.min_deposit) ?? 0,
    min_withdrawal: parseOptionalMinorUnits(form.min_withdrawal) ?? 0,
    ib_external_user_ids: ibExternalUserIds,
  };
}
