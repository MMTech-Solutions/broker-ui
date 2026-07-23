export type TradingAccount = {
  id: string;
  custom_name: string | null;
  external_user_id: string;
  external_trader_id: string;
  server_group_id: string;
  leverage_id: string;
  initial_deposit: number;
  current_balance: number;
  current_equity: number;
  current_credit: number;
  margin: number;
  free_margin: number;
  pnl: number;
  is_active: boolean;
  is_trading_enabled: boolean;
  comments: string | null;
};

export type TradingAccountListFilters = {
  external_user_id?: string;
  external_trader_id?: string;
  server_group_id?: string;
  is_active?: boolean;
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
};

export type TradingAccountFilterFormState = {
  external_user_id: string;
  external_trader_id: string;
  server_group_id: string;
  is_active: "" | "true" | "false";
};

export const EMPTY_TRADING_ACCOUNT_FILTERS: TradingAccountFilterFormState = {
  external_user_id: "",
  external_trader_id: "",
  server_group_id: "",
  is_active: "",
};
