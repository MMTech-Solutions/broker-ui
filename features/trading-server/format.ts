import type {
  BalanceAdjustmentType,
  BookType,
  RestrictedCountry,
  ServerGroup,
  ServerGroupCurrency,
  ServerGroupTradingTerms,
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
  withdrawal_disabled: "Withdrawals are disabled for this group.",
  countries_restrictions_empty:
    "Country restrictions are enabled but no countries are listed.",
  no_leverages_assigned: "No leverages are assigned to this group.",
  currency_missing:
    "Currency code is not configured. Set it before activating this group.",
  currency_precision_missing:
    "Currency precision is not configured. Set it before activating this group.",
  environment_missing:
    "Environment is not configured. Set Demo or Live before activating this group. If the group is already active, configure it now.",
  default_without_amount:
    "This group is marked as default but has no default amount.",
  demo_private: "Demo groups should not be private.",
  demo_default: "Demo groups should not be the system default group.",
  demo_deposit_enabled: "Demo groups should not have deposits enabled.",
  demo_withdrawal_enabled: "Demo groups should not have withdrawals enabled.",
  demo_default_amount: "Demo groups should not have a default amount.",
  demo_min_deposit: "Demo groups should not have a minimum deposit.",
  demo_min_withdrawal: "Demo groups should not have a minimum withdrawal.",
  meta_name_missing:
    "Meta name is not set. Clients will fall back to the platform group name.",
  no_server_groups:
    "This trading server is active but has no server groups. Sync from the platform or review connectivity.",
  no_active_server_groups:
    "This trading server is active but none of its server groups are active.",
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

/**
 * Client / human label for a server group: meta_name ?? name.
 * Warns when meta_name is missing so operators notice the fallback.
 */
export function serverGroupDisplayName(
  group: Pick<ServerGroup, "name" | "meta_name"> | {
    name?: string | null;
    meta_name?: string | null;
  },
): string {
  const metaName = group.meta_name?.trim() ?? "";
  if (metaName) {
    return metaName;
  }

  const platformName = group.name?.trim() ?? "";
  if (typeof console !== "undefined") {
    console.warn(
      "Server group missing meta_name; falling back to platform name.",
      group,
    );
  }

  return platformName;
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

/**
 * API money fields are already decimal major strings (MoneyTransformer).
 * Keep them as-is for operator input; convert back to minor units on submit.
 */
export function moneyInputFromApi(
  value: string | number | null | undefined,
  precision: number | null,
): string {
  if (precision == null) {
    return "";
  }

  if (value == null || value === "") {
    return "0";
  }

  return String(value);
}

export function parseOptionalMajorToMinorUnits(
  value: string,
  precision: number,
): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return undefined;
  }

  const parsed = Number.parseInt(
    decimalMajorToMinorUnits(trimmed, precision),
    10,
  );

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export type ServerGroupEditFormState = {
  meta_name: string;
  description: string;
  environment: number | null;
  is_default: boolean;
  is_private: boolean;
  is_active: boolean;
  is_deposit_enabled: boolean;
  is_withdrawal_enabled: boolean;
  use_countries_restrictions: boolean;
  is_restricted_countries_allowlist: boolean;
  restricted_countries: RestrictedCountry[];
  currency_code: string;
  currency_code_editable: boolean;
  currency_precision: string;
  currency_denomination_factor: string;
  book_type: BookType | "";
  default_amount: string;
  default_amount_type: BalanceAdjustmentType;
  account_limits: string;
  min_deposit: string;
  min_withdrawal: string;
  ib_external_user_ids: string;
  pips: string;
  lot: string;
  min_trade: string;
  margin_call: string;
  commission: string;
  stop_out: string;
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
    meta_name: serverGroup.meta_name ?? "",
    description: serverGroup.description ?? "",
    environment: serverGroup.environment ?? null,
    is_default: serverGroup.is_default ?? false,
    is_private: serverGroup.is_private ?? false,
    is_active: serverGroup.is_active,
    is_deposit_enabled: serverGroup.is_deposit_enabled ?? true,
    is_withdrawal_enabled: serverGroup.is_withdrawal_enabled ?? true,
    use_countries_restrictions: serverGroup.use_countries_restrictions ?? false,
    is_restricted_countries_allowlist:
      serverGroup.is_restricted_countries_allowlist ?? false,
    restricted_countries: serverGroup.restricted_countries ?? [],
    currency_code: currency.code,
    currency_code_editable: currencyCodeMissing,
    currency_precision: precisionMissing ? "" : String(precision),
    currency_denomination_factor: String(
      serverGroup.currency_denomination_factor ?? 1,
    ),
    book_type: serverGroup.book_type ?? "",
    default_amount: moneyInputFromApi(serverGroup.default_amount, precision),
    default_amount_type: serverGroup.default_amount_type ?? "BALANCE",
    account_limits: String(serverGroup.account_limits ?? 0),
    min_deposit: moneyInputFromApi(serverGroup.min_deposit, precision),
    min_withdrawal: moneyInputFromApi(serverGroup.min_withdrawal, precision),
    ib_external_user_ids: (serverGroup.ib_external_user_ids ?? []).join("\n"),
    pips: formatMarkup(serverGroup.trading_terms?.pips),
    lot: formatMarkup(serverGroup.trading_terms?.lot),
    min_trade: formatMarkup(serverGroup.trading_terms?.min_trade),
    margin_call: String(serverGroup.trading_terms?.margin_call ?? 0),
    commission: formatMarkup(serverGroup.trading_terms?.commission),
    stop_out: String(serverGroup.trading_terms?.stop_out ?? 0),
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
  const toMinorUnits = (value: string) =>
    currencyPrecision === undefined
      ? 0
      : (parseOptionalMajorToMinorUnits(value, currencyPrecision) ?? 0);

  return {
    meta_name: form.meta_name.trim(),
    description: form.description.trim() || null,
    environment: form.environment,
    is_default: form.is_default,
    is_private: form.is_private,
    is_active: form.is_active,
    is_deposit_enabled: form.is_deposit_enabled,
    is_withdrawal_enabled: form.is_withdrawal_enabled,
    use_countries_restrictions: form.use_countries_restrictions,
    is_restricted_countries_allowlist: form.is_restricted_countries_allowlist,
    restricted_countries: restrictedCountries,
    book_type: form.book_type === "" ? null : form.book_type,
    ...(form.currency_code_editable && currencyCode !== ""
      ? { currency: currencyCode }
      : {}),
    ...(currencyPrecision !== undefined
      ? { currency_precision: currencyPrecision }
      : {}),
    currency_denomination_factor:
      parseOptionalMinorUnits(form.currency_denomination_factor) ?? 1,
    default_amount: toMinorUnits(form.default_amount),
    default_amount_type: form.default_amount_type,
    account_limits: parseOptionalMinorUnits(form.account_limits) ?? 0,
    min_deposit: toMinorUnits(form.min_deposit),
    min_withdrawal: toMinorUnits(form.min_withdrawal),
    ib_external_user_ids: ibExternalUserIds,
    trading_terms: {
      pips: parseNonNegativeDecimal(form.pips) ?? "0",
      lot: parseNonNegativeDecimal(form.lot) ?? "0",
      min_trade: parseNonNegativeDecimal(form.min_trade) ?? "0",
      margin_call: parseOptionalMinorUnits(form.margin_call) ?? 0,
      commission: parseNonNegativeDecimal(form.commission) ?? "0",
      stop_out: parseOptionalMinorUnits(form.stop_out) ?? 0,
    },
  };
}

export function formatMarkup(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "0";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return String(numeric);
}

export function parseNonNegativeDecimal(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "0";
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function getServerGroupTradingTerms(
  terms: ServerGroup["trading_terms"],
): ServerGroupTradingTerms {
  return {
    pips: formatMarkup(terms?.pips),
    lot: formatMarkup(terms?.lot),
    min_trade: formatMarkup(terms?.min_trade),
    margin_call:
      typeof terms?.margin_call === "number" && Number.isFinite(terms.margin_call)
        ? Math.max(0, Math.trunc(terms.margin_call))
        : 0,
    commission: formatMarkup(terms?.commission),
    stop_out:
      typeof terms?.stop_out === "number" && Number.isFinite(terms.stop_out)
        ? Math.max(0, Math.trunc(terms.stop_out))
        : 0,
  };
}

export function formatTradingTermPercent(value: number): string {
  return `${value}%`;
}

export const CLIENT_TRADING_TERM_ROWS: {
  key: keyof ServerGroupTradingTerms;
  label: string;
}[] = [
  { key: "pips", label: "Pips" },
  { key: "lot", label: "Lote" },
  { key: "min_trade", label: "Min. trade" },
  { key: "margin_call", label: "Margin call" },
  { key: "commission", label: "Comisión" },
  { key: "stop_out", label: "Stop out" },
];

export function formatServerGroupTradingTermValue(
  key: keyof ServerGroupTradingTerms,
  terms: ServerGroupTradingTerms,
): string {
  if (key === "margin_call" || key === "stop_out") {
    return formatTradingTermPercent(terms[key]);
  }

  return formatMarkup(terms[key]);
}
