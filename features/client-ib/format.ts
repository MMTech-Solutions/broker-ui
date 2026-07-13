import {
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/features/ib-plan-subscription/format";
import type { IbPlanProgressionDirection } from "@/features/client-ib/types";
import { CLIENT_IB_PLAN_SUBSCRIPTION_TYPE_LABELS } from "@/features/client-ib/types";

export function clientIbPlanSubscriptionTypeLabel(value: string): string {
  return (
    CLIENT_IB_PLAN_SUBSCRIPTION_TYPE_LABELS[
      value as keyof typeof CLIENT_IB_PLAN_SUBSCRIPTION_TYPE_LABELS
    ] ?? value
  );
}

export function clientIbSubscriptionStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Solicitud pendiente";
    case "active":
      return "Suscripción activa";
    case "denied":
      return "Solicitud rechazada";
    default:
      return subscriptionStatusLabel(status);
  }
}

export {
  subscriptionStatusVariant as clientIbSubscriptionStatusVariant,
};

export function clientIbProgressionDirectionLabel(
  direction: IbPlanProgressionDirection | string,
): string {
  switch (direction) {
    case "up":
      return "Ascenso";
    case "down":
      return "Descenso";
    case "initial":
      return "Ingreso inicial";
    case "admin":
      return "Asignación administrativa";
    default:
      return direction;
  }
}

export function formatIbDateTime(value?: string | null): string {
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

export function formatProgressionVolume(value?: string | null): string {
  if (value == null || value === "") {
    return "—";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(parsed);
}
