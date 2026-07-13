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

export function bonusAssignmentStatusLabel(value: string): string {
  switch (value) {
    case "queued":
      return "Queued";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "pending_removal":
      return "Pending removal";
    default:
      return value;
  }
}

export function bonusAssignmentStatusVariant(
  value: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (value) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "pending_removal":
      return "outline";
    default:
      return "outline";
  }
}

export function truncateId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
