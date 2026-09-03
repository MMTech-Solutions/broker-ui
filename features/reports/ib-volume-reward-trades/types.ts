import type {
  BrokerPaginationMeta,
  BrokerSuccessMeta,
} from "@/lib/api/types/broker-response";

export type ReportIdentity = { id: string; name: string | null; email: string | null };
export type ReportReference = { id: string; name: string | null };

export type CalculationAvailability = {
  status: "available" | "unavailable";
  missing: string[];
  snapshotted_at: string | null;
};

export type IbVolumeRewardTrade = {
  position_id: string;
  client: ReportIdentity;
  direct_ib: ReportIdentity | null;
  account_id: string;
  operation_id: string | number | null;
  platform: ReportReference;
  environment: number | string;
  server_group: ReportReference;
  book_type: "a_book" | "b_book" | null;
  symbol: string;
  side: string;
  volume: string;
  open_price: string | null;
  close_price: string | null;
  opened_at: string | null;
  closed_at: string | null;
  unix_opened_at: number | null;
  unix_closed_at: number | null;
  duration_seconds: string | number | null;
  currency_code: string | null;
  currency_precision: number | null;
  commission: string | null;
  markup_per_lot: string | null;
  markup_revenue: string | null;
  revenue: string | null;
  pnl: string | null;
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
  calculation_availability: CalculationAvailability;
};

export type IbVolumeRewardTradeFlag =
  | "reward_exceeds_revenue"
  | "scalp_under_60_seconds"
  | "multi_ib"
  | "bonus_group"
  | "no_markup"
  | "economics_unavailable";

export type IbVolumeRewardTradeTotal = {
  currency_code: string | null;
  currency_precision: number | null;
  trades: number;
  volume: string;
  reward_lines: number;
  economics_available_trades: number;
  economics_unavailable_trades: number;
  commission: string | null;
  markup_revenue: string | null;
  revenue: string | null;
  pnl: string | null;
  broker_gross: string | null;
  reward_paid: string;
  reward_pending: string;
  reward_failed: string;
  reward_cancelled: string;
  margin: string | null;
  ratio: string | null;
};

export type IbVolumeRewardTradeFilters = {
  page?: number;
  per_page?: number;
  closed_at_from?: number;
  closed_at_to?: number;
  q?: string;
  platform_id?: string;
  environment?: string;
  server_group_id?: string;
  book_type?: string;
  symbol?: string;
  side?: string;
  ib_program_id?: string;
  beneficiary_id?: string;
  volume_min?: string;
  ratio_bucket?: IbVolumeRewardRatioBucket;
  flags?: IbVolumeRewardTradeFlag[];
  sort_by?: IbVolumeRewardTradeSort;
  sort_direction?: "asc" | "desc";
};

export type IbVolumeRewardRatioBucket = "under_70" | "70_to_100" | "over_100";

export type IbVolumeRewardTradeSort =
  | "closed_at" | "opened_at" | "duration_seconds" | "volume"
  | "commission" | "markup_per_lot" | "markup_revenue" | "revenue"
  | "pnl" | "broker_gross" | "reward_paid" | "reward_pending"
  | "reward_failed" | "reward_cancelled" | "ratio" | "margin"
  | "reward_lines" | "distinct_ibs" | "max_level";

export type IbVolumeRewardTradesMeta = BrokerSuccessMeta & {
  pagination?: BrokerPaginationMeta;
  totals_by_currency?: IbVolumeRewardTradeTotal[];
  identity_enrichment_partial?: boolean;
};

export type IbVolumeRewardTradesResponse = {
  success: true;
  data: IbVolumeRewardTrade[];
  meta: IbVolumeRewardTradesMeta;
};

export type IbVolumeRewardLine = {
  id: string;
  ib_program_id: string;
  program_name: string | null;
  benefactor_id: string;
  beneficiary_id: string;
  ib: ReportIdentity;
  distribution_level: number;
  level: number;
  payment_rule_type: string;
  formula_version: string | null;
  calculation_basis: string | null;
  rate: string | null;
  calculation_inputs: Record<string, unknown> | null;
  amount: { value: string; currency_code: string | null; currency_precision: number | null };
  payment_status: string;
  external_transaction_id: string | null;
  comments: string | null;
  created_at: string | null;
  updated_at: string | null;
  paid_at: string | null;
};

export type IbVolumeRewardTradeDetail = {
  position_id: string;
  rewards: IbVolumeRewardLine[];
  reward_paid: string;
  paid_lines_sum: string;
  paid_sum_matches_parent: boolean;
  identity_enrichment_partial: boolean;
};

export const REPORT_FLAGS: ReadonlyArray<{ value: IbVolumeRewardTradeFlag; label: string }> = [
  { value: "reward_exceeds_revenue", label: "Reward exceeds revenue" },
  { value: "scalp_under_60_seconds", label: "Scalp under 60 seconds" },
  { value: "multi_ib", label: "Multiple IBs" },
  { value: "bonus_group", label: "Bonus group" },
  { value: "no_markup", label: "No markup" },
  { value: "economics_unavailable", label: "Economics unavailable" },
];
