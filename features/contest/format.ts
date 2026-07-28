import type { ContestStatus } from "@/features/contest/types";

export function formatContestDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatContestDateRange(
  startsAt?: string | null,
  endsAt?: string | null,
): string {
  if (!startsAt && !endsAt) {
    return "—";
  }

  return `${formatContestDateTime(startsAt)} → ${formatContestDateTime(endsAt)}`;
}

const DEFAULT_CURRENCY_PRECISION = 2;

export function formatMinorUnits(
  value: number,
  currency?: string | null,
  precision = DEFAULT_CURRENCY_PRECISION,
): string {
  const divisor = 10 ** precision;
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(value / divisor);

  return currency ? `${formatted} ${currency}` : formatted;
}

export function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export function getContestStatusBadgeVariant(
  status: ContestStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "upcoming":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function parseOptionalInteger(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatPerformanceIndex(
  value: number | null | undefined,
): string {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

export function formatDecimalValue(
  value: number | null | undefined,
): string {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}
