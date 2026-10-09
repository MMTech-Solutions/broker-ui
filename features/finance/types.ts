export type FinanceKind = "internal-transactions" | "account-balance-transactions";

export type FinanceAccount = {
  id: string;
  custom_name: string | null;
  external_trader_id: string | null;
  user: { id: string; name: string; email: string | null } | null;
  platform: { id: string; name: string | null } | null;
};

export type FinanceTransaction = {
  id: string;
  amount_minor: string;
  amount: string | null;
  currency: string | null;
  currency_precision: number | null;
  type: "credit" | "debit";
  payment_status: "paid" | "pending" | "processing" | "failed";
  account?: FinanceAccount;
  from_account?: FinanceAccount;
  to_account?: FinanceAccount;
  platform?: { id: string; name: string | null };
  external_account_id?: string;
  external_transaction_id?: string;
  comments: string | null;
  failure_reason: string | null;
  debit_completed_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type FinanceFilters = {
  user_id?: string;
  type?: string;
  payment_status?: string;
  created_from?: string;
  created_to?: string;
  amount_minor?: string;
  comments?: string;
  from_account_id?: string;
  to_account_id?: string;
  account_id?: string;
  platform_id?: string;
  external_account_id?: string;
  external_transaction_id?: string;
  page?: number;
  per_page?: number;
};
