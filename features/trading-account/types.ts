import type { Leverage } from "@/features/leverage/types";

export type TradingAccountServerGroup = {
  id: string;
  /** Platform name (admin) or display label meta_name ?? name (client). */
  name: string;
  /** Present for admin responses only. */
  meta_name?: string | null;
  trading_server_id: string;
  currency: {
    code: string | null;
    precision: number | null;
  };
};

/** Nested platform on accounts: client name is display label; admin also has custom_name. */
export type TradingAccountPlatform = {
  id: string;
  name: string;
  /** Present for admin responses only. */
  custom_name?: string | null;
  description?: string | null;
  image_path?: string | null;
};

/** Owner payload from broker list (post user-enrichment). */
export type TradingAccountOwner = {
  id: string;
  email: string | null;
  name: string;
};

export type TradingAccount = {
  id: string;
  custom_name: string | null;
  /**
   * Legacy field while production broker still returns external_user_id.
   * Prefer `user.id` when present.
   */
  external_user_id?: string;
  /** Enriched owner (id, email, name). */
  user?: TradingAccountOwner;
  external_trader_id: string;
  server_group: TradingAccountServerGroup;
  platform: TradingAccountPlatform;
  leverage: Pick<Leverage, "id" | "name" | "value">;
  initial_deposit: number;
  current_balance: number;
  current_equity: number;
  current_credit: number;
  margin: number;
  free_margin: number;
  pnl: number;
  realized_profit: number;
  /** External paid withdrawals (admin list only). */
  withdrawals?: number;
  is_active: boolean;
  is_trading_enabled: boolean;
  comments: string | null;
  cancellation_reason: string | null;
  trading_disabled_reason: string | null;
};

/** Sort keys accepted by broker GET /admin/accounts (see ListTradingAccountsSort). */
export type TradingAccountSortBy =
  | "created_at"
  | "updated_at"
  | "external_trader_id"
  | "custom_name"
  | "is_active"
  | "is_trading_enabled"
  | "current_balance"
  | "current_equity"
  | "current_credit"
  | "margin"
  | "free_margin"
  | "pnl"
  | "realized_profit"
  | "withdrawals"
  | "initial_deposit"
  | "server_group_id"
  | "user.id"
  | "user.name"
  | "user.email";

export type TradingAccountListTotals = {
  current_balance: number;
  current_credit: number;
  current_equity: number;
  pnl: number;
  realized_profit: number;
  withdrawals: number;
};

export type TradingAccountSortDirection = "asc" | "desc";

export type TradingAccountListFilters = {
  external_user_id?: string;
  external_trader_id?: string;
  custom_name?: string;
  platform_id?: string;
  environment?: number;
  server_group_id?: string;
  is_active?: boolean;
  is_trading_enabled?: boolean;
  current_balance?: number;
  current_equity?: number;
  current_credit?: number;
  realized_profit?: number;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  sort_by?: TradingAccountSortBy;
  sort_direction?: TradingAccountSortDirection;
  page?: number;
  per_page?: number;
};

export type UpdateTradingAccountInput = {
  is_active?: boolean;
  is_trading_enabled?: boolean;
  comments?: string | null;
  custom_name?: string | null;
  /** When restricting access, close all open positions on the platform. Defaults to false. */
  close_open_positions?: boolean;
  rejection_reason?: string;
  publish_notification?: boolean;
};

export type TradingAccountFilterFormState = {
  external_trader_id: string;
  custom_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  platform_id: string;
  environment: string;
  server_group_id: string;
  current_balance: string;
  current_equity: string;
  current_credit: string;
  realized_profit: string;
  is_trading_enabled: "" | "true" | "false";
  is_active: "" | "true" | "false";
};

export const EMPTY_TRADING_ACCOUNT_FILTERS: TradingAccountFilterFormState = {
  external_trader_id: "",
  custom_name: "",
  user_id: "",
  user_name: "",
  user_email: "",
  platform_id: "",
  environment: "",
  server_group_id: "",
  current_balance: "",
  current_equity: "",
  current_credit: "",
  realized_profit: "",
  is_trading_enabled: "",
  is_active: "",
};

export function resolveAccountOwner(account: TradingAccount): {
  id: string;
  email: string | null;
  name: string;
} {
  if (account.user) {
    return {
      id: account.user.id,
      email: account.user.email,
      name: account.user.name,
    };
  }

  return {
    id: account.external_user_id ?? "",
    email: null,
    name: "",
  };
}
