import type { IbProgram } from "@/features/ib-program/types";

export type IbReward = {
  id: string;
  ib_program_id: string;
  settlement_run_id: string | null;
  benefactor_id: string;
  beneficiary_id: string;
  payment_rule_type: string;
  distribution_level: number;
  amount: string;
  payment_status: string;
  source_type: string;
  source_id: string;
  external_transaction_id: string | null;
  comments: string | null;
  program?: IbProgram;
  created_at: string | null;
  updated_at: string | null;
};

export type IbRewardListFilters = {
  page?: number;
  per_page?: number;
  ib_program_id?: string;
  settlement_run_id?: string;
  benefactor_id?: string;
  beneficiary_id?: string;
  payment_rule_type?: string;
  payment_status?: string;
  source_type?: string;
  created_at_from?: string;
  created_at_to?: string;
};

export const IB_PAYMENT_RULE_TYPES = [
  "by_volume",
  "by_pnl",
  "by_cpa",
] as const;

export const IB_REWARD_PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
] as const;

export const IB_REWARD_SOURCE_TYPES = ["volume", "pnl", "cpa"] as const;
