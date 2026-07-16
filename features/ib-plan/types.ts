export type IbPlanSubscriptionType = "automatic" | "manual" | "restricted";

export type IbPlan = {
  id: string;
  name: string;
  description: string;
  image_path: string | null;
  subscription_type: IbPlanSubscriptionType;
  is_active: boolean;
  programs_count?: number;
  /** Solo presente para usuarios con `broker.ib_plan.manage`. */
  subscriptions_count?: number;
  active_subscriptions_count?: number;
  inactive_subscriptions_count?: number;
  thresholds_warning?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type IbPlanListFilters = {
  name?: string;
  description?: string;
  subscription_type?: IbPlanSubscriptionType;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateIbPlanInput = {
  name: string;
  description: string;
  image_path?: string | null;
  subscription_type?: IbPlanSubscriptionType;
  is_active?: boolean;
};

export type UpdateIbPlanInput = {
  name?: string;
  description?: string;
  image_path?: string | null;
  subscription_type?: IbPlanSubscriptionType;
  is_active?: boolean;
};

export const IB_PLAN_SUBSCRIPTION_TYPES: {
  value: IbPlanSubscriptionType;
  label: string;
}[] = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "restricted", label: "Restricted" },
];

export type IbPlanProgram = {
  id: string;
  sort_order: number;
  progression_min_volume: string;
  progression_max_volume: string;
  program: {
    id: string;
    name: string;
    description: string;
    settlement_period?: string;
    is_active?: boolean;
  };
  created_at?: string;
  updated_at?: string;
};

export type IbPlanProgramsResponse = {
  programs: IbPlanProgram[];
  thresholds_warning: boolean;
};

export type SyncIbPlanProgramsInput = {
  programs: {
    ib_program_id: string;
    sort_order: number;
    progression_min_volume: string;
    progression_max_volume: string;
  }[];
};

export type PlanProgramAssignment = {
  ibProgramId: string;
  name: string;
  description: string;
  sortOrder: number;
  progressionMinVolume: string;
  progressionMaxVolume: string;
};
