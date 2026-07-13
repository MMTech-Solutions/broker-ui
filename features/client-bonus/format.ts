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
  if (offer.type === "deposit_triggered") {
    const percent =
      offer.deposit_percent != null
        ? formatDepositPercentValue(offer.deposit_percent)
        : "—";
    const max =
      offer.max_credit_amount != null
        ? formatBonusMinorAmount(offer.max_credit_amount)
        : null;

    return max != null ? `${percent}% (máx. ${max})` : `${percent}% del depósito`;
  }

  return offer.credit_amount != null
    ? formatBonusMinorAmount(offer.credit_amount)
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
  const offer = assignment.bonus_offer;

  if (
    !offer?.activity_per_credit_unit ||
    assignment.credited_amount == null
  ) {
    return null;
  }

  const activityPerUnit = Number(offer.activity_per_credit_unit);
  const creditedAmount = Number(assignment.credited_amount);
  const accumulated = Number(assignment.accumulated_activity ?? 0);

  if (
    !Number.isFinite(activityPerUnit) ||
    activityPerUnit <= 0 ||
    !Number.isFinite(creditedAmount)
  ) {
    return null;
  }

  const requiredActivity = creditedAmount / activityPerUnit;
  const percent =
    requiredActivity > 0
      ? Math.min(100, (accumulated / requiredActivity) * 100)
      : 0;

  return {
    requiredActivity,
    accumulatedActivity: accumulated,
    percent,
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
      `Balance real mínimo requerido: ${formatBonusMinorAmount(offer.min_real_balance)}.`,
    );
  }

  if (offer.min_deposit_amount != null && Number(offer.min_deposit_amount) > 0) {
    terms.push(
      `Depósito mínimo acumulado requerido: ${formatBonusMinorAmount(offer.min_deposit_amount)}.`,
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
