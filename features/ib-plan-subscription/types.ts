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

export type IbPlanSubscription = {
  id: string;
  external_user_id: string;
  ib_plan_id: string;
  personal_rate: string;
  is_master: boolean;
  master_rate: string;
  master_level: number;
  status: IbPlanSubscriptionStatus;
  comments: string | null;
  plan?: IbPlan;
  placement?: IbPlanProgramPlacement | null;
  created_at?: string;
  updated_at?: string;
};

export type IbPlanSubscriptionListFilters = {
  external_user_id?: string;
  status?: IbPlanSubscriptionStatus;
  is_master?: boolean;
  page?: number;
  per_page?: number;
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
