import { formatInitialAmount } from "@/features/initial-amount/format";
import type { FinancePaymentStatus } from "@/features/client-finance/types";

export function formatFinanceDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatExternalAmount(
  value: string | number | null | undefined,
  currency?: string | null,
): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(parsed);

  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatInternalAmount(
  value: number | null | undefined,
): string {
  if (value == null) {
    return "—";
  }

  return formatInitialAmount(value);
}

export function financePaymentStatusLabel(value: string): string {
  switch (value as FinancePaymentStatus) {
    case "paid":
      return "Pagado";
    case "pending":
      return "Pendiente";
    case "processing":
      return "Procesando";
    case "failed":
      return "Fallido";
    default:
      return value;
  }
}

export function financePaymentStatusVariant(
  value: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (value) {
    case "paid":
      return "default";
    case "pending":
    case "processing":
      return "outline";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export function externalTransactionTypeLabel(value: string): string {
  switch (value) {
    case "deposit":
      return "Depósito";
    case "withdrawal":
      return "Retiro";
    default:
      return value;
  }
}

export function internalTransactionTypeLabel(): string {
  return "Transferencia interna";
}

export function formatAccountLabel(
  accountId: string,
  labels: Map<string, string>,
): string {
  return labels.get(accountId) ?? accountId;
}
