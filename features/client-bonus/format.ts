import {
  formatInitialAmount,
  parseMajorAmountToMinorUnits,
} from "@/features/initial-amount/format";
import { formatDepositPercentValue } from "@/features/bonus-offer/format";
import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import type { BonusOffer } from "@/features/bonus-offer/types";

export function formatAccountBalance(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBonusMinorAmount(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return formatInitialAmount(parsed);
}

/** Formats amounts already expressed in major currency units (e.g. assignment credited_amount). */
export function formatBonusMajorAmount(
  value: string | number | null | undefined,
  precision = 2,
): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(parsed);
}

export function formatBonusDateTime(value?: string | null): string {
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

export function clientBonusAssignmentStatusLabel(value: string): string {
  switch (value) {
    case "queued":
      return "En cola";
    case "active":
      return "Activo";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    case "pending_removal":
      return "Retiro pendiente";
    default:
      return value;
  }
}

export function clientBonusAssignmentStatusVariant(
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

export function formatOfferRewardSummary(offer: BonusOffer): string {
  const precision = offer.currency_precision ?? 2;

  if (offer.type === "deposit_triggered") {
    const percent =
      offer.deposit_percent != null
        ? formatDepositPercentValue(offer.deposit_percent)
        : "—";
    const max =
      offer.max_credit_amount != null
        ? formatBonusMajorAmount(offer.max_credit_amount, precision)
        : null;

    return max != null ? `${percent}% (máx. ${max})` : `${percent}% del depósito`;
  }

  return offer.credit_amount != null
    ? formatBonusMajorAmount(offer.credit_amount, precision)
    : "—";
}

export function formatOfferTypeLabel(type: BonusOffer["type"]): string {
  return type === "deposit_triggered"
    ? "Por depósito"
    : "Reclamo manual";
}

export function getConversionProgress(assignment: BonusAssignment): {
  requiredActivity: number;
  accumulatedActivity: number;
  percent: number;
} | null {
  if (
    assignment.required_activity == null ||
    assignment.progress_ratio == null
  ) {
    return null;
  }

  const requiredActivity = Number(assignment.required_activity);
  const progressRatio = Number(assignment.progress_ratio);
  const accumulated = Number(assignment.accumulated_activity ?? 0);

  if (!Number.isFinite(requiredActivity) || !Number.isFinite(progressRatio)) {
    return null;
  }

  return {
    requiredActivity,
    accumulatedActivity: Number.isFinite(accumulated) ? accumulated : 0,
    percent: Math.min(100, Math.max(0, progressRatio * 100)),
  };
}

export function getOfferTermsSummary(offer: BonusOffer): string[] {
  const terms: string[] = [];

  if (offer.conversion_window_days != null) {
    terms.push(
      `Plazo de conversión: ${offer.conversion_window_days} días desde la activación.`,
    );
  }

  if (offer.activity_per_credit_unit != null) {
    terms.push(
      `Actividad requerida: ${offer.activity_per_credit_unit} unidades por cada unidad de crédito acreditada.`,
    );
  }

  if (offer.burn_on_withdrawal) {
    terms.push("El bono se pierde si retiras fondos de la cuenta.");
  }

  if (offer.burn_on_negative_balance) {
    terms.push("El bono se pierde si el balance de la cuenta es negativo.");
  }

  if (offer.min_real_balance != null && Number(offer.min_real_balance) > 0) {
    terms.push(
      `Balance real mínimo requerido: ${formatBonusMajorAmount(offer.min_real_balance, offer.currency_precision ?? 2)}.`,
    );
  }

  if (offer.min_deposit_amount != null && Number(offer.min_deposit_amount) > 0) {
    terms.push(
      `Depósito mínimo acumulado requerido: ${formatBonusMajorAmount(offer.min_deposit_amount, offer.currency_precision ?? 2)}.`,
    );
  }

  return terms;
}

export function formatUnmetRequirementSummary(
  requirement: {
    code: string;
    met: boolean;
    required: number;
    current: number;
  },
): string | null {
  if (requirement.met || requirement.required <= 0) {
    return null;
  }

  const missing = Math.max(0, requirement.required - requirement.current);

  if (requirement.code === "min_real_balance") {
    return `Faltan ${formatBonusMinorAmount(missing)} de balance real (mín. ${formatBonusMinorAmount(requirement.required)}).`;
  }

  if (requirement.code === "min_deposit_amount") {
    return `Faltan ${formatBonusMinorAmount(missing)} de depósitos acumulados (mín. ${formatBonusMinorAmount(requirement.required)}).`;
  }

  return null;
}

export function getUnmetRequirementSummaries(
  requirements: Array<{
    code: string;
    met: boolean;
    required: number;
    current: number;
  }>,
): string[] {
  return requirements
    .map((requirement) => formatUnmetRequirementSummary(requirement))
    .filter((value): value is string => value != null);
}

export { formatInitialAmount, parseMajorAmountToMinorUnits };
