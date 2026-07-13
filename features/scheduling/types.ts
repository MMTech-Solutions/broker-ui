export type ScheduledCommandFeatureArea =
  | "ib"
  | "bonus"
  | "finance"
  | "contests"
  | "insurance"
  | "risk";

export type ScheduledCommandRunTrigger = "automatic" | "manual";

export type ScheduledCommandRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ScheduledCommandParameters = Record<string, boolean>;

export type ScheduledCommand = {
  id: string;
  signature: string;
  description: string;
  feature_area: ScheduledCommandFeatureArea | string;
  cron_expression: string | null;
  is_automatic: boolean;
  parameters: ScheduledCommandParameters | null;
  allowed_parameters: string[];
  created_at?: string;
  updated_at?: string;
};

export type ScheduledCommandRun = {
  id: string;
  scheduled_command_id: string;
  trigger: ScheduledCommandRunTrigger;
  status: ScheduledCommandRunStatus;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  triggered_by_sub: string | null;
  parameters: ScheduledCommandParameters | null;
  created_at?: string;
  updated_at?: string;
};

export type ScheduledCommandDetail = ScheduledCommand & {
  recent_runs: ScheduledCommandRun[];
};

export type ScheduledCommandListFilters = {
  signature?: string;
  feature_area?: ScheduledCommandFeatureArea | string;
  is_automatic?: boolean;
  page?: number;
  per_page?: number;
};

export type UpdateScheduledCommandInput = {
  description?: string;
  cron_expression?: string | null;
  is_automatic?: boolean;
  parameters?: ScheduledCommandParameters | null;
};

export type RunScheduledCommandInput = {
  parameters?: ScheduledCommandParameters | null;
};

export const SCHEDULED_COMMAND_FEATURE_AREAS: {
  value: ScheduledCommandFeatureArea;
  label: string;
}[] = [
  { value: "ib", label: "IB" },
  { value: "bonus", label: "Bonus" },
  { value: "finance", label: "Finance" },
  { value: "contests", label: "Contests" },
  { value: "insurance", label: "Insurance" },
  { value: "risk", label: "Risk" },
];

export const SCHEDULED_COMMAND_RUN_STATUSES: {
  value: ScheduledCommandRunStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];
