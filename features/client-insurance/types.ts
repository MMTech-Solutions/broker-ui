import type {
  AccountInsurance,
  AccountInsuranceStatus,
  PremiumMode,
} from "@/features/insurance/types";

export type ClientInsurancePlanOption = {
  id: string;
  coverage_percentage: number;
  premium: number;
  premium_mode: PremiumMode;
  duration_days: number;
  minimum_balance: number;
  maximum_balance: number;
  is_free_first: boolean;
  is_too_low: boolean;
  is_too_high: boolean;
  is_free_eligible: boolean;
};

export type ClientInsurancePlan = {
  id: string;
  name: string;
  description?: string | null;
  requires_approval: boolean;
  options: ClientInsurancePlanOption[];
};

export type InsurancePlansForAccount = {
  account_id: string;
  plans: ClientInsurancePlan[];
};

export type ClientInsuranceEligibleAccount = {
  id: string;
  external_trader_id: string;
  current_balance: number;
  server_group_id: string;
  plans: ClientInsurancePlan[];
};

export type ClientAccountInsuranceListFilters = {
  account_id?: string;
  status?: AccountInsuranceStatus;
  page?: number;
  per_page?: number;
};

export type ContractClientAccountInsuranceInput = {
  account_id: string;
  insurance_plan_option_id: string;
};

export type ClientAccountInsurance = AccountInsurance;

export const CLIENT_ACCOUNT_INSURANCE_STATUSES: {
  value: AccountInsuranceStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "claimable", label: "Reclamable" },
  { value: "pending_claim", label: "Reclamo pendiente" },
  { value: "credited", label: "Acreditado" },
  { value: "credit_recovered", label: "Crédito recuperado" },
  { value: "cancelled", label: "Cancelado" },
];

export const IN_PROGRESS_INSURANCE_STATUSES: AccountInsuranceStatus[] = [
  "active",
  "claimable",
  "pending_claim",
];
