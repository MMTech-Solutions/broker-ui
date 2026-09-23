export type TradingMigrationAccount = {
  id: string;
  external_trader_id: string;
  custom_name?: string | null;
  current_balance?: number | null;
  current_equity?: number | null;
  risk_metric_phase_id?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
  server_group?: { name?: string | null; meta_name?: string | null } | null;
  platform?: { name?: string | null; custom_name?: string | null } | null;
};

export type TradingMigrationItemStatus = "created" | "failed" | "skipped";
export type TradingMigrationRunStatus = "running" | "completed" | "completed_with_errors" | "failed";

export type TradingMigrationItem = {
  id: string;
  trading_account_id: string;
  login: string;
  broker_id?: string | null;
  status: TradingMigrationItemStatus;
  external_risk_account_id?: string | null;
  external_risk_metric_phase_id?: string | null;
  error_code?: string | null;
  error_reason?: string | null;
  created_at?: string;
  account?: TradingMigrationAccount | null;
};

export type TradingMigrationRun = {
  id: string;
  selection: "account_ids" | "pending";
  batch_size?: number | null;
  phase_name: string;
  status: TradingMigrationRunStatus;
  created_count: number;
  failed_count: number;
  skipped_count: number;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
  items?: TradingMigrationItem[];
};

export type StartTradingMigrationInput =
  | { selection: "account_ids"; account_ids: string[] }
  | { selection: "pending"; batch_size: number };

export type StartTradingMigrationResult = {
  migration_run_id: string;
  status: TradingMigrationRunStatus;
  counts: { created: number; failed: number; skipped: number };
  created: TradingMigrationItem[];
  failed: TradingMigrationItem[];
  skipped: TradingMigrationItem[];
};
