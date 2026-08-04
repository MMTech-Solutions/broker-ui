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

export function depositBonusIntentStatusLabel(value: string): string {
  switch (value) {
    case "watching":
      return "Watching";
    case "applied":
      return "Applied";
    case "cancelled":
      return "Cancelled";
    default:
      return value;
  }
}

export function depositBonusIntentStatusVariant(
  value: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (value) {
    case "watching":
      return "default";
    case "applied":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatProgressPercent(
  progressRatio: number | null | undefined,
): string {
  if (progressRatio == null || !Number.isFinite(Number(progressRatio))) {
    return "—";
  }

  return `${(Math.min(1, Math.max(0, Number(progressRatio))) * 100).toFixed(1)}%`;
}

export function formatActivityProgress(
  accumulated: string | number | null | undefined,
  required: string | number | null | undefined,
): string {
  if (required == null || required === "") {
    return formatMoneyValue(accumulated ?? null);
  }

  return `${formatMoneyValue(accumulated ?? 0)} / ${formatMoneyValue(required)}`;
}

export function bonusAssignmentOfferLabel(assignment: {
  offer_name?: string | null;
  bonus_offer?: { name?: string } | null;
  bonus_offer_id: string;
}): string {
  const snapshotName = assignment.offer_name?.trim();
  if (snapshotName) {
    return snapshotName;
  }

  if (assignment.bonus_offer?.name) {
    return assignment.bonus_offer.name;
  }

  return truncateId(assignment.bonus_offer_id);
}

export function formatExcludedInstrumentsSummary(
  instruments:
    | Array<{ alpha?: string; symbol?: string }>
    | null
    | undefined,
): string {
  if (!instruments?.length) {
    return "—";
  }

  const labels = instruments
    .map((instrument) => instrument.alpha ?? instrument.symbol)
    .filter((value): value is string => Boolean(value?.trim()));

  return labels.length > 0 ? labels.join(", ") : `${instruments.length} instrument(s)`;
}

export function truncateId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
