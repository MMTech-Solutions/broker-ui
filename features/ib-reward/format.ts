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

export function paymentStatusLabel(value: string): string {
  switch (value) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return value;
  }
}

export function paymentStatusVariant(
  value: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (value) {
    case "paid":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    case "processing":
      return "default";
    default:
      return "outline";
  }
}

export function sourceTypeLabel(value: string): string {
  switch (value) {
    case "volume":
      return "Volume";
    case "pnl":
      return "PnL";
    case "cpa":
      return "CPA";
    default:
      return value;
  }
}
