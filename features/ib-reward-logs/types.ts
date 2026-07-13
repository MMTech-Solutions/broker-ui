import type { IbProgram } from "@/features/ib-program/types";

export type IbTradingAccountPeriodSnapshot = {
  id: string;
  ib_program_id: string;
  settlement_run_id: string | null;
  account_id: string;
  balance_before: string;
  balance_after: string;
  deposits: string;
  withdrawals: string;
  dw_net: string;
  npnl: string;
  distribution_levels: number;
  program?: IbProgram;
  created_at: string | null;
  updated_at: string | null;
};

export type IbRewardSettlementRun = {
  id: string;
  ib_program_id: string;
  payment_rule_type: string;
  started_at: string | null;
  finished_at: string | null;
  rewards_count: number;
  total_amount: string;
  is_failed: boolean;
  failure_reason: string | null;
  program?: IbProgram;
  created_at: string | null;
  updated_at: string | null;
};

export type IbTradingAccountPeriodSnapshotListFilters = {
  page?: number;
  per_page?: number;
  ib_program_id?: string;
  account_id?: string;
  settlement_run_id?: string;
  created_at_from?: string;
  created_at_to?: string;
};

export type IbRewardSettlementRunListFilters = {
  page?: number;
  per_page?: number;
  ib_program_id?: string;
  payment_rule_type?: string;
  is_failed?: boolean;
  started_at_from?: string;
  started_at_to?: string;
};

export const IB_REWARD_LOG_TABS = [
  "period-snapshots",
  "settlement-runs",
] as const;

export type IbRewardLogTab = (typeof IB_REWARD_LOG_TABS)[number];

export const IB_PAYMENT_RULE_TYPES = [
  "by_volume",
  "by_pnl",
  "by_cpa",
] as const;

export type IbPaymentRuleType = (typeof IB_PAYMENT_RULE_TYPES)[number];
