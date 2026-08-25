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
  old_value_json: unknown;
  new_value_json: unknown;
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

export type GetAnalyticsEquityCurveParams = GetAnalyticsOverviewParams & {
  marker_limit?: number;
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

export type AnalyticsEquityCurvePoint = {
  date_utc: string;
  equity: number;
  equity_adj: number;
  peak_adj: number;
  drawdown_pct: number;
  is_live: boolean;
};

export type AnalyticsTradeMarker = {
  opened_at_utc: string | null;
  closed_at_utc: string | null;
  ticket: string;
  symbol: string;
  side: string;
  volume: number;
  pnl: number;
  duration_sec: number;
  r_multiple: number;
};

export type AnalyticsEquityCurveSparks = {
  win_rate: Array<number | null>;
  profit_factor: Array<number | null>;
  expectancy: Array<number | null>;
  return_pct: Array<number | null>;
};

export type AnalyticsEquityCurve = {
  generated_at: string;
  range: AnalyticsFilterRange;
  points: AnalyticsEquityCurvePoint[];
  trade_markers: AnalyticsTradeMarker[];
  sparks: AnalyticsEquityCurveSparks;
  best_trade_marker_index: number | null;
  worst_trade_marker_index: number | null;
  max_drawdown_point_index: number | null;
};

export type AnalyticsDashboard = {
  overview: AnalyticsOverview;
  equity_curve: AnalyticsEquityCurve;
};

export type AnalyticsSymbolSideStats = {
  side: string;
  trades: number;
  win_rate: number;
  net_pnl: number;
};

export type AnalyticsSymbolStats = {
  symbol: string;
  trades: number;
  win_rate: number;
  profit_factor: number;
  volume_sum: number;
  net_pnl: number;
  expectancy: number;
  avg_win: number;
  avg_loss: number;
  payoff_ratio: number;
  pnl_per_lot: number;
  commission_sum: number;
  swap_sum: number;
  costs_total: number;
  cost_per_trade: number;
  cost_drag_pct: number;
  gross_pnl: number;
  pnl_adjusted: number;
  pnl_share_pct: number;
  trades_share_pct: number;
  volume_share_pct: number;
  sides: AnalyticsSymbolSideStats[];
};

export type AnalyticsSymbolsConcentration = {
  top1_symbol: string | null;
  top1_pnl_abs_share_pct: number | null;
  top3_pnl_abs_share_pct: number | null;
  dependency_symbol: string | null;
  dependency_pct: number | null;
};

export type AnalyticsSymbols = {
  generated_at: string;
  range: AnalyticsFilterRange;
  symbols: AnalyticsSymbolStats[];
  best_symbol: AnalyticsSymbolStats | null;
  worst_symbol: AnalyticsSymbolStats | null;
  concentration: AnalyticsSymbolsConcentration;
};

export type AnalyticsValueBucket = {
  label: string;
  from_value: number;
  to_value: number;
  count: number;
};

export type AnalyticsProfitabilityEdge = {
  win_rate: number;
  payoff_ratio: number;
  breakeven_win_rate: number;
  edge_pct: number;
  kelly_pct: number;
};

export type AnalyticsProfitabilityExpectancy = {
  win_rate: number;
  loss_rate: number;
  avg_win: number;
  avg_loss: number;
  win_contribution: number;
  loss_contribution: number;
  expectancy: number;
};

export type AnalyticsProfitabilityRMultiple = {
  coverage_pct: number;
  trades_with_r: number;
  avg_r: number;
  expectancy_r: number;
  buckets: AnalyticsValueBucket[];
};

export type AnalyticsSideStats = {
  side: string;
  trades: number;
  win_rate: number;
  profit_factor: number;
  expectancy: number;
  net_pnl: number;
};

export type AnalyticsProfitabilityConcentration = {
  total_winners: number;
  best_trade: number;
  gross_profit: number;
  profit_factor: number;
  profit_factor_ex_best: number;
  pnl_ex_best: number;
  top5_pct_of_gross: number;
  winners_for_half: number;
};

export type AnalyticsProfitability = {
  generated_at: string;
  range: AnalyticsFilterRange;
  edge: AnalyticsProfitabilityEdge;
  expectancy: AnalyticsProfitabilityExpectancy;
  r_multiple: AnalyticsProfitabilityRMultiple;
  sides: AnalyticsSideStats[];
  concentration: AnalyticsProfitabilityConcentration;
  net_pnl: number;
  volume_sum: number;
  pnl_per_lot: number;
};

export type AnalyticsDailyDay = {
  date_utc: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  win_rate: number;
};

export type AnalyticsDailyStats = {
  days_traded: number;
  days_positive: number;
  days_negative: number;
  max_consecutive_positive: number;
  max_consecutive_negative: number;
  current_consecutive_positive: number;
  consistency_largest_day_pct: number;
};

export type AnalyticsDailyTransitionMatrix = {
  gg: number;
  gr: number;
  rg: number;
  rr: number;
  total: number;
  p_pos_after_pos: number;
  p_neg_after_pos: number;
  p_pos_after_neg: number;
  p_neg_after_neg: number;
};

export type AnalyticsDailyStreakSegment = {
  sign: string;
  length: number;
  start_date: string;
  end_date: string;
};

export type AnalyticsNearBreakeven = {
  threshold: number;
  count: number;
  pct: number;
};

export type AnalyticsPostLoss = {
  avg_trades_after_red: number;
  avg_trades_overall: number;
  samples: number;
};

export type AnalyticsOffDays = {
  break_count: number;
  avg_pnl_after_break: number;
  avg_pnl_after_trade_day: number;
};

export type AnalyticsWeekendCarryover = {
  mon_after_red_fri: number;
  mon_after_green_fri: number;
  fri_red_count: number;
  fri_green_count: number;
};

export type AnalyticsDailyDayBehavior = {
  transition_matrix: AnalyticsDailyTransitionMatrix;
  streak_segments: AnalyticsDailyStreakSegment[];
  daily_pnl_std: number;
  near_breakeven: AnalyticsNearBreakeven;
  post_loss: AnalyticsPostLoss;
  off_days: AnalyticsOffDays;
  weekend_carryover: AnalyticsWeekendCarryover;
  avg_trades_pos_days: number;
  avg_trades_neg_days: number;
  avg_trades_per_day: number;
  day_win_rate: number;
};

export type AnalyticsCumulativePnlPoint = {
  date_utc: string;
  pnl_cum: number;
};

export type AnalyticsCumulativePnl = {
  day: AnalyticsCumulativePnlPoint[];
  week: AnalyticsCumulativePnlPoint[];
  month: AnalyticsCumulativePnlPoint[];
};

export type AnalyticsMonthTotal = {
  month: string;
  pnl: number;
  trades: number;
  days_traded: number;
};

export type AnalyticsDaily = {
  generated_at: string;
  range: AnalyticsFilterRange;
  days: AnalyticsDailyDay[];
  stats: AnalyticsDailyStats;
  day_behavior: AnalyticsDailyDayBehavior;
  cumulative_pnl: AnalyticsCumulativePnl;
  month_totals: AnalyticsMonthTotal[];
};

export type AnalyticsPnlDistribution = {
  generated_at: string;
  range: AnalyticsFilterRange;
  bucket_base: number;
  buckets: AnalyticsValueBucket[];
};

export type AnalyticsSessionStats = {
  session: string;
  trades: number;
  win_rate: number;
  net_pnl: number;
  pnl_per_trade: number;
};

export type AnalyticsSessionWindow = {
  session: string;
  start_hour_utc: number;
  end_hour_utc: number;
};

export type AnalyticsSessions = {
  generated_at: string;
  range: AnalyticsFilterRange;
  sessions: AnalyticsSessionStats[];
  session_windows: AnalyticsSessionWindow[];
};

export type AnalyticsDailyTradeRow = {
  side: string;
  symbol: string;
  volume: number;
  opened_at: string | null;
  closed_at: string | null;
  price_open: number | null;
  price_close: number | null;
  sl_price: number | null;
  tp_price: number | null;
  commission: number;
  swap: number;
  net_pnl: number;
};

export type AnalyticsDailyDayTrades = {
  generated_at: string;
  date_utc: string;
  pnl: number;
  trades: number;
  wins: number;
  win_rate: number;
  volume: number;
  rows: AnalyticsDailyTradeRow[];
};

export type AnalyticsHistogramBucket = {
  label: string;
  count: number;
};

export type AnalyticsFirstTradeHour = {
  hour: number;
  days: number;
  day_pnl_avg: number;
  first_trade_win_rate: number;
};

export type AnalyticsTradeWinRateSeries = {
  cumulative: Array<number | null>;
  rolling_10: Array<number | null>;
};

export type AnalyticsBehavior = {
  generated_at: string;
  range: AnalyticsFilterRange;
  trades_total: number;
  max_consecutive_losses: number;
  max_consecutive_wins: number;
  volume_std_lots: number;
  revenge_trades: number;
  revenge_trades_pct: number;
  avg_gap_sec: number;
  gap_histogram: AnalyticsHistogramBucket[];
  first_trade_hours: AnalyticsFirstTradeHour[];
  first_trade_predicts_day_pct: number;
  win_loss_sequence: string;
  recent_trade_win_rate: number;
  baseline_trade_win_rate: number;
  trade_win_rate_series: AnalyticsTradeWinRateSeries;
};

export type AnalyticsDrawdowns = {
  generated_at: string;
  range: AnalyticsFilterRange;
  episodes_total: number;
  avg_duration_days: number;
  max_duration_days: number;
  current_underwater_days: number;
  underwater_now_pct: number;
  histogram: AnalyticsHistogramBucket[];
  best_trade: number;
  worst_trade: number;
};

export type AnalyticsTimeHeatmapCell = {
  weekday: number;
  hour_block: number;
  trades: number;
  win_rate: number;
  net_pnl: number;
};

export type AnalyticsTimeHeatmap = {
  generated_at: string;
  range: AnalyticsFilterRange;
  cells: AnalyticsTimeHeatmapCell[];
};

export type AnalyticsDurationScatterPoint = {
  duration_sec: number;
  pnl: number;
  symbol: string;
};

export type AnalyticsDurationScatter = {
  generated_at: string;
  range: AnalyticsFilterRange;
  points: AnalyticsDurationScatterPoint[];
  avg_duration_sec: number;
};
