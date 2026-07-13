import { formatInitialAmount } from "@/features/initial-amount/format";
import type {
  ClientInsurancePlan,
  ClientInsurancePlanOption,
  InsurancePlansForAccount,
} from "@/features/client-insurance/types";

export function formatInsuranceMinorAmount(
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

export function formatInsuranceDateTime(value?: string | null): string {
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

export function clientAccountInsuranceStatusLabel(value: string): string {
  switch (value) {
    case "active":
      return "Activo";
    case "claimable":
      return "Reclamable";
    case "pending_claim":
      return "Reclamo pendiente";
    case "credited":
      return "Acreditado";
    case "credit_recovered":
      return "Crédito recuperado";
    case "cancelled":
      return "Cancelado";
    default:
      return value;
  }
}

export function clientAccountInsuranceStatusVariant(
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

export function formatCoveragePercent(value: number): string {
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function formatInsuranceOptionSummary(
  option: ClientInsurancePlanOption,
): string {
  const coverage = formatCoveragePercent(option.coverage_percentage);
  const duration = `${option.duration_days} días`;

  if (option.is_free_eligible) {
    return `${coverage} cobertura · ${duration} · primera vez gratis`;
  }

  return `${coverage} cobertura · ${duration} · prima ${formatInsuranceMinorAmount(option.premium)}`;
}

export function hasContractableInsuranceOptions(
  data: InsurancePlansForAccount,
): boolean {
  return data.plans.some((plan) => getContractableOptions(plan).length > 0);
}

export function getContractableOptions(
  plan: ClientInsurancePlan,
): ClientInsurancePlanOption[] {
  return plan.options.filter(
    (option) => !option.is_too_low && !option.is_too_high,
  );
}

export function formatAccountBalance(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
