import type { IbPlan, IbPlanProgram } from "@/features/ib-plan/types";
import type {
  IbPlanProgramPlacement,
  IbPlanSubscription,
} from "@/features/ib-plan-subscription/types";
import type { IbProgram } from "@/features/ib-program/types";

export type ClientIbPlan = IbPlan & {
  programs?: IbPlanProgram[];
};

export type IbActivePlanContext = {
  subscription: IbPlanSubscription;
  placement: IbPlanProgramPlacement;
  program: IbProgram;
};

export type IbPlanProgressionDirection =
  | "up"
  | "down"
  | "initial"
  | "admin";

export type IbPlanProgressionLog = {
  id: string;
  external_user_id: string;
  ib_plan_id: string;
  from_program_id: string | null;
  to_program_id: string;
  direction: IbPlanProgressionDirection;
  progression_metric_value: string;
  evaluated_at?: string | null;
  from_program?: IbProgram | null;
  to_program?: IbProgram;
  created_at?: string | null;
  updated_at?: string | null;
};

export type IbPlanProgressionLogListFilters = {
  direction?: IbPlanProgressionDirection;
  page?: number;
  per_page?: number;
};

export const CLIENT_IB_PLAN_SUBSCRIPTION_TYPE_LABELS: Record<
  ClientIbPlan["subscription_type"],
  string
> = {
  automatic: "Suscripción automática",
  manual: "Aprobación manual",
  restricted: "Solo por invitación",
};
