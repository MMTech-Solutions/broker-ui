export type PremiumMode = "fixed" | "percent_from_balance";

export type AccountInsuranceStatus =
  | "cancelled"
  | "active"
  | "pending_claim"
  | "credited"
  | "claimable"
  | "credit_recovered";

export type InsurancePlanServerGroup = {
  id: string;
  insurance_plan_id: string;
  server_group_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InsurancePlanOption = {
  id: string;
  insurance_plan_id: string;
  coverage_percentage: string | number;
  premium: number;
  premium_mode: PremiumMode;
  duration_days: number;
  minimum_balance: number;
  maximum_balance: number;
  is_free_first: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InsurancePlan = {
  id: string;
  name: string;
  description?: string | null;
  requires_approval: boolean;
  is_active: boolean;
  options_count?: number;
  server_groups_count?: number;
  options?: InsurancePlanOption[];
  server_groups?: InsurancePlanServerGroup[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type InsurancePlanListFilters = {
  name?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateInsurancePlanInput = {
  name: string;
  description?: string | null;
  requires_approval: boolean;
  is_active: boolean;
};

export type UpdateInsurancePlanInput = {
  name?: string;
  description?: string | null;
  requires_approval?: boolean;
  is_active?: boolean;
};

export type CreateInsurancePlanOptionInput = {
  coverage_percentage: number;
  premium: number;
  premium_mode: PremiumMode;
  duration_days: number;
  minimum_balance: number;
  maximum_balance: number;
  is_free_first: boolean;
  is_active: boolean;
};

export type UpdateInsurancePlanOptionInput = Partial<CreateInsurancePlanOptionInput>;

/** Owner payload from broker API (post user-enrichment). */
export type AccountInsuranceOwner = {
  id: string;
  email: string | null;
  name: string;
};

export type AccountInsurance = {
  id: string;
  user: AccountInsuranceOwner;
  account_id: string;
  insurance_plan_option_id: string;
  initial_balance: string | number;
  insured_amount: string | number;
  coverage_percent: number;
  premium_charged: string | number;
  premium_external_transaction_id?: string | null;
  is_free: boolean;
  started_at?: string | null;
  expires_at?: string | null;
  final_balance?: string | number | null;
  balance_withdrawn?: string | number | null;
  loss_amount?: string | number | null;
  compensation_amount?: string | number | null;
  claimed_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by_user_id?: string | null;
  notes?: string | null;
  status: AccountInsuranceStatus;
  plan?: {
    id: string;
    name: string;
    requires_approval: boolean;
  };
  option?: {
    id: string;
    coverage_percentage: number;
    duration_days: number;
    premium_mode: PremiumMode;
  };
  created_at?: string | null;
  updated_at?: string | null;
};

export type AccountInsuranceAdminSortBy =
  | "created_at"
  | "updated_at"
  | "status"
  | "started_at"
  | "expires_at"
  | "claimed_at"
  | "reviewed_at"
  | "user.id"
  | "user.name"
  | "user.email";

export type AccountInsuranceAdminSortDirection = "asc" | "desc";

export type AccountInsuranceAdminListFilters = {
  page?: number;
  per_page?: number;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  account_id?: string;
  status?: AccountInsuranceStatus;
  insurance_plan_option_id?: string;
  sort_by?: AccountInsuranceAdminSortBy;
  sort_direction?: AccountInsuranceAdminSortDirection;
};

export type AccountInsuranceAdminFilterFormState = {
  user_id: string;
  user_name: string;
  user_email: string;
  account_id: string;
  status: "" | AccountInsuranceStatus;
  insurance_plan_option_id: string;
};

export const EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS: AccountInsuranceAdminFilterFormState =
  {
    user_id: "",
    user_name: "",
    user_email: "",
    account_id: "",
    status: "",
    insurance_plan_option_id: "",
  };

export function resolveAccountInsuranceOwner(
  insurance: AccountInsurance,
): AccountInsuranceOwner {
  return {
    id: insurance.user?.id ?? "",
    email: insurance.user?.email ?? null,
    name: insurance.user?.name ?? "",
  };
}

export type RejectAccountInsuranceClaimInput = {
  notes?: string | null;
  publish_notification?: boolean;
};

export const PREMIUM_MODES: { value: PremiumMode; label: string }[] = [
  { value: "fixed", label: "Fixed" },
  { value: "percent_from_balance", label: "Percent from balance" },
];

export const ACCOUNT_INSURANCE_STATUSES: {
  value: AccountInsuranceStatus;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "claimable", label: "Claimable" },
  { value: "pending_claim", label: "Pending claim" },
  { value: "credited", label: "Credited" },
  { value: "credit_recovered", label: "Credit recovered" },
  { value: "cancelled", label: "Cancelled" },
];
