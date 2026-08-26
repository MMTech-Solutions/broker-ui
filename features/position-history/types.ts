import type { PositionSide } from "@/features/client-positions/types";

export type PositionHistoryFilters = Record<string, string | number | undefined> & { status?: "open" | "closed" | "all"; account_id?: string; account_query?: string; page?: number; per_page?: number; sort_by?: string; sort_direction?: "asc" | "desc"; };
export type GlobalPosition = { id: string; order_id: string | null; symbol: string; side: PositionSide | null; status: "open" | "closed"; volume: number; open_price: number; close_price: number | null; profit: number; opened_at: string | number | null; closed_at: string | number | null; has_ib_commission_reward: boolean; user: { id: string; name: string; email: string | null }; trading_account: { id: string; external_trader_id: string; custom_name: string | null }; platform: { id: string | null; name: string | null; custom_name: string | null }; server_group: { id: string | null; name: string | null; meta_name: string | null; environment: number | null }; };

export type PositionCommissionReward = {
  reward_id: string;
  payment_status: string;
  level: number;
  rate: string | null;
  amount: {
    major_units: string;
    minor_units: string;
    currency: { code: string; precision: number };
  } | null;
};
