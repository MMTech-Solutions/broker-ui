export type IbAnalyticsAudience = "admin" | "client";

export type IbAnalyticsCurrency = { code: string | null; precision: number | null };

export type IbAnalyticsUser = { id: string | null; name: string; email: string | null };

export type IbAnalyticsTradingAccount = {
  id: string | null;
  external_trader_id: string | null;
  custom_name: string | null;
  platform: string;
  server_group: string;
  currency_code: string | null;
};

export type IbAnalyticsReward = {
  id: string;
  program: { id: string | null; name: string | null } | null;
  user: IbAnalyticsUser;
  amount: string;
  currency: IbAnalyticsCurrency;
  payment_status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  payment_rule_type: string;
  source_type: "volume" | "pnl" | "cpa";
  distribution_level: number;
  trading_account: IbAnalyticsTradingAccount | null;
  cpa_context: { id: string; referred_external_user_id: string; distribution_level: number; captured_at: string | null; rule_snapshot: Record<string, unknown> } | null;
  created_at: string | null;
};

export type IbAnalyticsRewardFilters = {
  beneficiary_id?: string;
  source_type?: IbAnalyticsReward["source_type"];
  payment_status?: IbAnalyticsReward["payment_status"][];
  from?: string;
  to?: string;
  sort_by?: "created_at" | "amount" | "currency_code" | "payment_status" | "source_type" | "payment_rule_type" | "distribution_level" | "program.name" | "user.name";
  sort_direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type IbAnalyticsTotal = { currency: IbAnalyticsCurrency; paid: string; pending: string; processing: string; pending_to_pay: string; failed: string; cancelled: string };

export type IbAnalyticsSummary = {
  subscription: { id: string; status: string; assigned_at: string | null } | null;
  plan: { id: string; name: string } | null;
  current_program: { id: string; name: string; assigned_at: string | null } | null;
  totals: IbAnalyticsTotal[];
};

export type IbAnalyticsSeriesPoint = { bucket: string; totals: Array<{ currency: IbAnalyticsCurrency; amount: string }> };
