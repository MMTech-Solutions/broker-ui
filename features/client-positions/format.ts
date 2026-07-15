import type { AccountPosition } from "@/features/client-positions/types";

export function formatNumber(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatSide(side: AccountPosition["side"]): string {
  if (side === "buy") return "Buy";
  if (side === "sell") return "Sell";
  return "—";
}

export function formatOpenedAt(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  let date: Date;

  if (typeof value === "number") {
    date = new Date(value < 1_000_000_000_000 ? value * 1000 : value);
  } else if (/^\d+$/.test(value.trim())) {
    const numeric = Number(value);
    date = new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
