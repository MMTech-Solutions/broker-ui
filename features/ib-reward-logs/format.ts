export function formatMoneyValue(value: string | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(parsed);
}

export function formatDateTimeValue(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function paymentRuleTypeLabel(value: string): string {
  switch (value) {
    case "by_volume":
      return "Volume";
    case "by_pnl":
      return "PnL";
    case "by_cpa":
      return "CPA";
    default:
      return value;
  }
}
