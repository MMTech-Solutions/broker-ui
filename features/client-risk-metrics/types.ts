export type RiskMetricsSummary = {
  dates_utc: string[];
  series: Record<string, (number | null)[]>;
  daily_deltas: Record<string, { previous: number; diff: number }>;
  series_end_date_utc: string;
  phase_id: string;
  phase_name: string;
};

export type RiskMetricsHistoryPoint = {
  at: string;
  value: number;
  delta_from_prev: number | null;
};

export type RiskMetricsHistorySummaryStats = {
  rows_in_range: number;
  rows_returned: number;
  offset: number;
  limit: number;
  truncated: boolean;
  first_at: string | null;
  last_at: string | null;
  min_value: number | null;
  max_value: number | null;
  net_change_first_to_last: number | null;
  max_abs_delta: number | null;
};

export type RiskMetricsHistory = {
  metric_key: string;
  granularity: string;
  points: RiskMetricsHistoryPoint[];
  summary: RiskMetricsHistorySummaryStats;
};

export type SharedRiskMetricStatus = "shared" | "unshared" | "expired";

export type SharedRiskMetric = {
  id: string;
  trading_account_id: string;
  is_shared: boolean;
  status: SharedRiskMetricStatus;
  expirable: boolean;
  expires_at: string | null;
  visit_count?: number;
  created_at: string;
  updated_at: string;
};

export type CreateSharedRiskMetricInput = {
  trading_account_id: string;
  expirable: boolean;
};

export type UpdateSharedRiskMetricInput = {
  status?: SharedRiskMetricStatus;
  expirable?: boolean;
};

export type GetRiskMetricsSummaryParams = {
  days?: number;
};

export type GetRiskMetricsHistoryParams = {
  metric_key: string;
  from_utc: string;
  to_utc: string;
  granularity?: "day" | "hour" | "minute" | "snapshot";
  only_nonzero_delta?: boolean;
  sort?: "time_asc" | "time_desc" | "delta_abs_desc" | "delta_desc";
  offset?: number;
  limit?: number;
};

export type RiskMetricChangeDelta = {
  key: string;
  old_value_json: string | null;
  new_value_json: string | null;
};

export type RiskMetricChangedPayload = {
  trading_account_id: string;
  login: string;
  risk_account_id: string | null;
  phase_id: string | null;
  phase_name: string | null;
  change_log_id: string;
  changed_at: string;
  changes: RiskMetricChangeDelta[];
};
