import type { BrokerPaginationMeta, BrokerSuccessMeta } from "@/lib/api/types/broker-response";
import type { IbVolumeRewardTradeFlag } from "@/features/reports/ib-volume-reward-trades";

export type PositionReportIdentity = { id: string; name: string; email: string | null };
export type PositionReportReference = { id: string; name: string | null };

export type PositionReportRow = {
  position_id: string;
  status: "open" | "closed";
  client: PositionReportIdentity;
  direct_ib: PositionReportIdentity | null;
  trading_account: { id: string; external_trader_id: string; custom_name: string | null };
  operation_id: string;
  platform: PositionReportReference;
  environment: number;
  server_group: PositionReportReference & { meta_name: string | null };
  book_type: "a_book" | "b_book" | null;
  symbol: string;
  side: string;
  volume: string;
  open_price: string;
  close_price: string | null;
  sl: string | null;
  tp: string | null;
  swap: string;
  comment: string | null;
  opened_at: string;
  closed_at: string | null;
  unix_opened_at: number;
  unix_closed_at: number | null;
  duration_seconds: string | null;
  currency_code: string | null;
  currency_precision: number | null;
  commission: string;
  markup_per_lot: string | null;
  markup_revenue: string | null;
  revenue: string | null;
  pnl: string;
  broker_gross: string | null;
  reward_paid: string;
  reward_pending: string;
  reward_failed: string;
  reward_cancelled: string;
  ratio: string | null;
  margin: string | null;
  reward_lines: number;
  distinct_ibs: number;
  max_level: number;
  flags: IbVolumeRewardTradeFlag[];
  calculation_availability: {
    status: "available" | "unavailable" | "not_available_yet";
    missing: string[];
    snapshotted_at: string | null;
  };
};

export type PositionReportTotal = {
  currency_code: string | null;
  currency_precision: number | null;
  positions: number;
  volume: string;
  reward_lines: number;
  economics_available_positions: number;
  economics_unavailable_positions: number;
  economics_pending_positions: number;
  commission: string;
  markup_revenue: string | null;
  revenue: string | null;
  pnl: string;
  broker_gross: string | null;
  reward_paid: string;
  reward_pending: string;
  reward_failed: string;
  reward_cancelled: string;
  margin: string | null;
  ratio: string | null;
};

export type PositionReportReward = {
  id: string;
  ib_program_id: string;
  program_name: string;
  settlement_run_id: string | null;
  benefactor: PositionReportIdentity;
  beneficiary: PositionReportIdentity;
  distribution_level: number;
  level: number;
  payment_rule_type: string;
  formula_version: string | null;
  calculation_basis: string | null;
  rate: string | null;
  tier: string | number | null;
  calculation_inputs: Record<string, unknown> | null;
  amount: { value: string; currency_code: string | null; currency_precision: number | null };
  payment_status: string;
  external_transaction_id: string | null;
  comments: string | null;
  created_at: string | null;
  updated_at: string | null;
  paid_at: string | null;
};

export type PositionReportDetail = {
  position: PositionReportRow;
  economics: Pick<PositionReportRow, "currency_code" | "currency_precision" | "commission" | "markup_per_lot" | "markup_revenue" | "revenue" | "pnl" | "broker_gross" | "ratio" | "margin" | "flags" | "calculation_availability">;
  reward_summary: Array<{ currency_code: string | null; currency_precision: number | null; lines: number; paid: string; pending: string; processing: string; failed: string; cancelled: string }>;
  rewards: PositionReportReward[];
  identity_enrichment_partial: boolean;
};

export type PositionReportFilters = Record<string, string | number | string[] | undefined> & {
  status?: "open" | "closed" | "all";
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  flags?: string[];
};

export type PositionsReportResponse = {
  success: true;
  data: PositionReportRow[];
  meta: BrokerSuccessMeta & { pagination?: BrokerPaginationMeta; totals_by_currency?: PositionReportTotal[]; identity_enrichment_partial?: boolean };
};
