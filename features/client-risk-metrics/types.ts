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
  min_abs_delta?: number;
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

export type GetAnalyticsOverviewParams = {
  from_utc?: string;
  to_utc?: string;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

export type AnalyticsFilterRange = {
  from_utc: string | null;
  to_utc: string | null;
  symbol: string | null;
  side: string | null;
  session: string | null;
  granularity: string | null;
};

export type AnalyticsOverviewKpis = {
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  win_rate: number;
  profit_factor: number;
  expectancy: number;
  payoff_ratio: number;
  avg_win: number;
  avg_loss: number;
  best_trade: number;
  worst_trade: number;
  avg_duration_sec: number;
  volume_sum: number;
};

export type AnalyticsOverviewCosts = {
  gross_pnl: number;
  gross_profit: number;
  gross_loss: number;
  commission_sum: number;
  swap_sum: number;
  net_pnl: number;
  cost_drag_pct: number;
};

export type AnalyticsOverviewEquity = {
  equity_first: number;
  equity_last: number;
  return_pct: number;
};

export type AnalyticsOverviewRisk = {
  max_drawdown_abs: number;
  max_drawdown_pct: number;
  ulcer_index: number;
  recovery_factor: number;
  underwater_now_pct: number;
};

export type AnalyticsOverviewLive = {
  equity: number;
  balance: number;
  margin_used: number;
  margin_free: number;
  margin_level_pct: number;
  floating_pnl: number;
  open_positions: number;
  snapshot_at: string | null;
};

export type AnalyticsOverviewHealth = {
  score: number;
  level: string;
};

export type AnalyticsOverviewDays = {
  days_traded: number;
  days_positive: number;
  days_negative: number;
  max_consecutive_positive: number;
  max_consecutive_negative: number;
  current_consecutive_positive: number;
  consistency_largest_day_pct: number;
};

export type AnalyticsOverviewStreaks = {
  current_win_streak: number;
  current_loss_streak: number;
  max_win_streak: number;
  max_loss_streak: number;
};

export type AnalyticsOverview = {
  generated_at: string;
  range: AnalyticsFilterRange;
  kpis: AnalyticsOverviewKpis;
  costs: AnalyticsOverviewCosts;
  equity: AnalyticsOverviewEquity;
  risk: AnalyticsOverviewRisk;
  days: AnalyticsOverviewDays;
  streaks: AnalyticsOverviewStreaks;
  live: AnalyticsOverviewLive;
  health: AnalyticsOverviewHealth;
};
