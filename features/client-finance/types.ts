export type FinancePaymentStatus =
  | "paid"
  | "pending"
  | "failed"
  | "processing";

export type ExternalTransactionType = "deposit" | "withdrawal";

export type ExternalTransaction = {
  id: string;
  account_id: string;
  platform_id: string;
  amount: string;
  currency: string;
  type: ExternalTransactionType;
  payment_status: FinancePaymentStatus;
  failure_reason?: string | null;
  external_account_id?: string | null;
  external_transaction_id?: string | null;
  comments?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InternalTransaction = {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  type: string;
  payment_status: FinancePaymentStatus;
  failure_reason?: string | null;
  debit_completed_at?: string | null;
  comments?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ExternalTransactionListFilters = {
  account_id?: string;
  platform_id?: string;
  payment_status?: FinancePaymentStatus;
  page?: number;
  per_page?: number;
};

export type InternalTransferListFilters = {
  from_account_id?: string;
  to_account_id?: string;
  payment_status?: FinancePaymentStatus;
  page?: number;
  per_page?: number;
};

export type CreateInternalTransferInput = {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  comments?: string | null;
};

export type CreateExternalDepositInput = {
  account_id: string;
  amount: number;
  comments?: string | null;
};

export const FINANCE_PAYMENT_STATUSES: {
  value: FinancePaymentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Pagado" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "failed", label: "Fallido" },
];

export type ClientFinanceTab = "transfers" | "deposits";
