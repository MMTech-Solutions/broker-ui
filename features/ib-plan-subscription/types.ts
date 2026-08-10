import type { IbPlan } from "@/features/ib-plan/types";
import type { IbProgram } from "@/features/ib-program/types";

export type IbPlanSubscriptionStatus = "pending" | "active" | "denied";

export type IbPlanProgramPlacement = {
  id: string;
  ib_program_id: string;
  is_pinned: boolean;
  assigned_by: "initial" | "admin" | "progression";
  assigned_at?: string | null;
  progression_metric_value?: string | null;
  program?: IbProgram;
};

/** Owner payload from broker API (post user-enrichment). */
export type IbPlanSubscriptionOwner = {
  id: string;
  email: string | null;
  name: string;
};

export type IbPlanSubscription = {
  id: string;
  user: IbPlanSubscriptionOwner;
  ib_plan_id: string;
  personal_rate: string;
  is_master: boolean;
  master_rate: string;
  master_level: number;
  status: IbPlanSubscriptionStatus;
  comments: string | null;
  rejection_reason: string | null;
  plan?: IbPlan;
  placement?: IbPlanProgramPlacement | null;
  created_at?: string;
  updated_at?: string;
};

export type IbPlanSubscriptionSortBy =
  | "created_at"
  | "updated_at"
  | "status"
  | "is_master"
  | "personal_rate"
  | "master_rate"
  | "master_level"
  | "user.id"
  | "user.name"
  | "user.email";

export type IbPlanSubscriptionSortDirection = "asc" | "desc";

export type IbPlanSubscriptionListFilters = {
  external_user_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  status?: IbPlanSubscriptionStatus;
  is_master?: boolean;
  personal_rate?: number;
  comments?: string;
  ib_program_id?: string;
  sort_by?: IbPlanSubscriptionSortBy;
  sort_direction?: IbPlanSubscriptionSortDirection;
  page?: number;
  per_page?: number;
};

export type IbPlanSubscriptionFilterFormState = {
  user_id: string;
  user_name: string;
  user_email: string;
  status: "" | IbPlanSubscriptionStatus;
  ib_program_id: string;
  personal_rate: string;
  is_master: "" | "true" | "false";
  comments: string;
};

export const EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS: IbPlanSubscriptionFilterFormState =
  {
    user_id: "",
    user_name: "",
    user_email: "",
    status: "",
    ib_program_id: "",
    personal_rate: "",
    is_master: "",
    comments: "",
  };

export type CreateIbPlanSubscriptionInput = {
  external_user_id?: string;
  ib_program_id?: string;
  personal_rate?: number;
  is_master?: boolean;
  master_rate?: number;
  master_level?: number;
  comments?: string | null;
};

export type UpdateIbPlanSubscriptionInput = {
  status: "active" | "denied";
  ib_program_id?: string;
  reason?: string;
};

export type UpdateIbPlanSubscriptionParametersInput = {
  personal_rate?: number;
  is_master?: boolean;
  master_rate?: number;
};

export type UpdateIbPlanProgramPlacementInput = {
  ib_program_id?: string;
  is_pinned?: boolean;
};

export const IB_PLAN_SUBSCRIPTION_STATUSES: {
  value: IbPlanSubscriptionStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "denied", label: "Denied" },
];

export const PLACEMENT_ASSIGNED_BY_LABELS: Record<
  IbPlanProgramPlacement["assigned_by"],
  string
> = {
  initial: "Initial",
  admin: "Admin",
  progression: "Progression",
};

export function resolveSubscriptionOwner(subscription: IbPlanSubscription): {
  id: string;
  email: string | null;
  name: string;
} {
  return {
    id: subscription.user?.id ?? "",
    email: subscription.user?.email ?? null,
    name: subscription.user?.name ?? "",
  };
}
