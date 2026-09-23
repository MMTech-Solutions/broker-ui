export type IbAnalyticsMoney = {
  currency_code: string | null;
  currency_precision: number | null;
  amount: string;
};

export type IbAnalyticsAvailability<T> =
  | { available: true; value: T; source_timestamp: string }
  | { available: false; value: null; reason: string };

export type IbAnalyticsMoneyAvailability = {
  available: true;
  currency_groups: IbAnalyticsMoney[];
  source_timestamp: string;
};

export type IbOverviewKpis = {
  revenue: IbAnalyticsMoneyAvailability;
  lots: IbAnalyticsAvailability<string>;
  net_deposits: IbAnalyticsMoneyAvailability | IbAnalyticsAvailability<never>;
  signups: IbAnalyticsAvailability<number>;
  active_traders: IbAnalyticsAvailability<number>;
};

export type IbOverviewSeriesItem = {
  bucket: string;
  lots: string;
  commission: IbAnalyticsMoney[];
};

export type IbOverviewFunnelStage = {
  key: string;
  available: boolean;
  value: number | null;
  percentage_of_signups: number | null;
  reason?: string | null;
};

export type IbOverviewCommissionSource = IbAnalyticsMoney & {
  source: "cpa" | "direct_rebate" | "sublevel_rebate";
};

export type IbAnalyticsOverview = {
  ib_user_id: string;
  network_scope: "current_snapshot";
  range: { from: string; to: string };
  kpis: { cur: IbOverviewKpis; prev: IbOverviewKpis | null };
  series: IbOverviewSeriesItem[];
  client_funnel: { denominator: "signed_up"; stages: IbOverviewFunnelStage[] };
  commission_by_source: {
    cur: IbOverviewCommissionSource[];
    prev: IbOverviewCommissionSource[] | null;
  };
};

export type IbAnalyticsMoneyBreakdown = {
  principal: number;
  pending: number;
  processing: number;
  paid: number;
  failed: number;
  cancelled: number;
};

export type IbAnalyticsHistoricalRule = {
  payment_rule_type: string;
  commission_type: string | null;
  commission_value: string | number | null;
  distribution_level: number;
  payment_template_level: string | null;
  level_rate: string | number | null;
};

export type IbAnalyticsMetricGroup = {
  category: string;
  program: string | null;
  symbol: string | null;
  lots: number;
  commission: IbAnalyticsMoneyBreakdown;
  historical_rules: IbAnalyticsHistoricalRule[];
  nominal_rate: "multiple" | "snapshot";
};

export type IbAnalyticsCountry = {
  country_code: string;
  traders: number;
  lots: number;
  net_deposits: number | null;
  commission: IbAnalyticsMoneyBreakdown;
  effective_per_lot: number | null;
  share: number;
};

export type IbAnalytics = {
  ib_user_id: string;
  network_scope: "current_snapshot";
  country_scope: "current_profile";
  range: { from: string; to: string };
  currency: { currency_code: string; currency_precision: number | null };
  timestamps: { rebate: "unix_closed_at"; cpa: "ib_rewards.created_at" };
  kpis: {
    cur: {
      lots_traded: string;
      rebate_commission: IbAnalyticsMoneyBreakdown;
      cpa_commission: IbAnalyticsMoneyBreakdown;
      average_per_lot: string | null;
      commission_per_active_trader: string | null;
      cpa_pipeline_completion: {
        value: string | null;
        paid: number;
        total: number;
        pending: number;
        failed: number;
        cancelled: number;
      };
    };
    prev: unknown | null;
  };
  series: {
    granularity: "day" | "month";
    items: Array<{
      period: string;
      lots: number;
      rebate_commission: IbAnalyticsMoneyBreakdown;
      cpa_commission: IbAnalyticsMoneyBreakdown;
    }>;
  };
  by_category: IbAnalyticsMetricGroup[];
  by_symbol: IbAnalyticsMetricGroup[];
  by_country: {
    available: true;
    net_deposits_available: boolean;
    items: IbAnalyticsCountry[];
  };
};

export const IB_EARNINGS_PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
] as const;

export const IB_EARNINGS_TYPES = ["volume", "pnl", "cpa"] as const;

export type IbEarningsPaymentStatus = (typeof IB_EARNINGS_PAYMENT_STATUSES)[number];
export type IbEarningsType = (typeof IB_EARNINGS_TYPES)[number];
export type IbEarningsGrain = "trade" | "daily";

export type IbEarningsCurrency = {
  currency_code: string;
  currency_precision: number;
};

export type IbEarningsItem = {
  id?: string;
  daily_row_id?: string;
  date: string;
  trade_id?: string;
  trade_reference_type: "order_id" | "position_id" | null;
  trade_count?: number;
  account_id: string | null;
  customer: { id: string; name: string | null } | null;
  platform: string | null;
  type: IbEarningsType;
  level: number;
  symbol: string | null;
  symbol_group: string | null;
  volume: string | null;
  base: string | null;
  commission_type: string | null;
  commission_value: string | number | null;
  level_rate: string | number | null;
  amount: string;
  currency_code: string;
  currency_precision: number;
  payment_status: IbEarningsPaymentStatus;
  status_label: string;
  benefactor_id: string;
  calculation: {
    formula_version: string | null;
    inputs: Record<string, unknown> | null;
  };
};

export type IbEarningsCards = {
  lifetime_paid: string;
  pending_to_pay: string;
  paid_ytd: string;
  cpa_pipeline: string;
};

export type IbEarningsFilters = {
  status: IbEarningsPaymentStatus[];
  type: IbEarningsType[];
  level: number | null;
  symbol_group: string | null;
  platform: string | null;
  q: string | null;
};

export type IbEarnings = {
  ib_user_id: string;
  range: { from: string; to: string };
  available_currencies: IbEarningsCurrency[];
  currency: IbEarningsCurrency;
  filters: IbEarningsFilters;
  grain: IbEarningsGrain;
  cards: IbEarningsCards;
  items: IbEarningsItem[];
  next_cursor: string | null;
};

export type IbEarningsDailyTrades = {
  items: IbEarningsItem[];
};

export type IbReferralPagination = {
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
  page?: number;
  totalPages?: number;
};

export type IbReferral = {
  user_id: string;
  parent_id: string | null;
  full_name: string;
  email: string;
  country_code: string | null;
  signup_at: string | null;
  level: number;
  has_children: boolean;
  accounts_count: number | null;
  last_activity_at: string | null;
  lots: string | number | null;
  reward: string | number | null;
  ltv: string | number | null;
  cpa_status: string | null;
  trading_available: boolean;
  net_deposits: string | number | null;
  net_deposits_available: boolean;
};

export type IbReferrals = {
  ib_user_id: string;
  network_scope: "current_snapshot";
  currency_code: string;
  items: IbReferral[];
  pagination: IbReferralPagination;
};

export type IbReferralGeoItem = {
  country_code: string;
  traders: number;
  lots: string | number | null;
  rewards: string | number | null;
  net_deposits: string | number | null;
};

export type IbReferralGeo = {
  ib_user_id: string;
  network_scope: "current_snapshot";
  currency_code: string;
  trading_available: boolean;
  net_deposits_available: boolean;
  items: IbReferralGeoItem[];
};

export type IbReferralAccount = {
  login: string | number | null;
  platform: string | null;
  server_group: string | null;
  currency_code: string | null;
  opened_at: string | null;
  status: string | null;
  lots: string | number | null;
  last_activity_at: string | null;
  commission_generated: string | number | null;
};

export type IbReferralAccounts = {
  ib_user_id: string;
  referral_user_id: string;
  network_scope: "current_snapshot";
  currency_code: string;
  items: IbReferralAccount[];
};
