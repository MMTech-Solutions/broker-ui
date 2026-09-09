export type RiskControlSurface = "client" | "admin";
export type RiskControlDirection = "loss" | "profit";
export type RiskControlRuleStatus = "provisioning" | "active" | "completed" | "sync_failed" | "archived";

export type RiskControlKpi = {
  code: string;
  label: string;
  description: string;
  unit: { code: string; symbol: string };
  directions: Array<{ value: RiskControlDirection; operator: string }>;
};

export type RiskControlActionCatalogItem = {
  code: string;
  label: string;
  executor: "risk" | "notification_center";
  parameters: Array<{ name: string; required: boolean; timezone?: string; options?: Array<{ value: string; label: string }> }>;
};

export type RiskControlActionInput = {
  type: string;
  resume_cron?: string;
  executor?: "risk" | "notification_center";
};

export type RiskControlRule = {
  id: string;
  trading_account_id: string;
  name: string;
  description: string | null;
  kpi_code: string;
  direction: RiskControlDirection;
  threshold: number;
  actions: RiskControlActionInput[];
  notify_after_matches: number;
  violation_interval: number | null;
  unassign_on_match: boolean;
  status: RiskControlRuleStatus;
  membership_status: string | null;
  match_count: number;
  last_matched_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type RiskControlExecution = {
  id: string;
  matched_at: string | null;
  observed_value: number | null;
  match_number: number | null;
  rule_name: string | null;
  rule_description: string | null;
  condition: unknown[];
  actions: RiskControlActionInput[];
  action_results: unknown;
  action_status: string;
  rule_status_at_match: string;
  notification_publish_status: "not_requested" | "pending" | "published" | "failed";
  notification_event_id: string | null;
  notification_published_at: string | null;
  notification_last_error: string | null;
  created_at: string | null;
};

export type CreateRiskControlRuleInput = {
  name: string;
  description: string | null;
  kpi_code: string;
  direction: RiskControlDirection;
  threshold: number;
  actions: RiskControlActionInput[];
  notify_after_matches: number;
  violation_interval: number | null;
  unassign_on_match: boolean;
};

export type UpdateRiskControlIdentityInput = { name?: string; description?: string | null };
