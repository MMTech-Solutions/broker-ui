export function formatMoneyValue(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return String(value);
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

export function premiumModeLabel(value: string): string {
  switch (value) {
    case "fixed":
      return "Fixed";
    case "percent_from_balance":
      return "Percent from balance";
    default:
      return value;
  }
}

export function accountInsuranceStatusLabel(value: string): string {
  switch (value) {
    case "active":
      return "Active";
    case "claimable":
      return "Claimable";
    case "pending_claim":
      return "Pending claim";
    case "credited":
      return "Credited";
    case "credit_recovered":
      return "Credit recovered";
    case "cancelled":
      return "Cancelled";
    default:
      return value;
  }
}

export function accountInsuranceStatusVariant(
  value: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (value) {
    case "active":
    case "claimable":
      return "default";
    case "pending_claim":
      return "outline";
    case "credited":
      return "secondary";
    case "cancelled":
    case "credit_recovered":
      return "destructive";
    default:
      return "outline";
  }
}

export function truncateId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
