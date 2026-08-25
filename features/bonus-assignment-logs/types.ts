import type {
  BonusOffer,
  BonusOfferType,
} from "@/features/bonus-offer/types";

export type BonusAssignmentStatus =
  | "queued"
  | "active"
  | "completed"
  | "cancelled"
  | "pending_removal";

export type DepositBonusIntentStatus = "watching" | "applied" | "cancelled";

/** Frozen excluded instrument on the assignment snapshot at grant time. */
export type BonusAssignmentExcludedInstrument = {
  server_group_id: string;
  symbol_id?: string;
  alpha?: string;
  /** Legacy snapshot shape. */
  symbol?: string;
};

export type BonusUserOwner = {
  id: string;
  email: string | null;
  name: string;
};

export type BonusAssignmentTradingAccount = {
  id: string;
  platform: {
    id: string | null;
    name: string | null;
  };
  external_trader_id: string | null;
  custom_name: string | null;
};

/** Deposit amount that originated a deposit-triggered bonus. */
export type BonusAssignmentDepositAmount = {
  minor_units: number;
  major_units: string;
};

export type BonusAssignment = {
  id: string;
  bonus_offer_id: string;
  /** Current API projection. */
  trading_account?: BonusAssignmentTradingAccount;
  /** Kept during the API rollout for responses from an older broker service. */
  account_id?: string;
  /**
   * Legacy field while production broker still returns external_user_id.
   * Prefer `user.id` when present.
   */
  external_user_id?: string;
  /** Enriched owner (id, email, name). */
  user?: BonusUserOwner;
  /** Major currency units (API converts from stored minor units). */
  credited_amount: string | number;
  /** Null for bonuses not granted from a deposit. */
  deposit_amount?: BonusAssignmentDepositAmount | null;
  currency?: string | null;
  currency_precision?: number | null;
  status: BonusAssignmentStatus;
  activated_at?: string | null;
  conversion_deadline_at?: string | null;
  accumulated_activity?: string | number | null;
  /** Volume required to convert; from API (`credited_amount` minor / activity_per_credit_unit). */
  required_activity?: string | number | null;
  /** 0–1 conversion progress from API. */
  progress_ratio?: number | null;
  pending_removal?: boolean;
  cancellation_reason?: string | null;
  cancellation_reason_code?: string | null;
  source_external_transaction_id?: string | null;
  /** Snapshot: offer name frozen at grant time. */
  offer_name?: string | null;
  /** Snapshot: offer type frozen at grant time. */
  offer_type?: BonusOfferType | null;
  /** Snapshot: major units of credit per closed volume unit. */
  activity_per_credit_unit?: string | number | null;
  /** Snapshot: conversion window in days from activation. */
  conversion_window_days?: number | null;
  /** Snapshot: minimum open duration for activity to count. */
  min_position_duration_seconds?: string | number | null;
  /** Snapshot: cancel on withdrawal. */
  burn_on_withdrawal?: boolean | null;
  /** Snapshot: cancel on non-positive equity. */
  burn_on_negative_balance?: boolean | null;
  /** Snapshot: instruments excluded from activity. */
  excluded_instruments?: BonusAssignmentExcludedInstrument[];
  bonus_offer?: BonusOffer;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DepositBonusIntent = {
  id: string;
  account_id: string;
  /**
   * Legacy field while production broker still returns external_user_id.
   * Prefer `user.id` when present.
   */
  external_user_id?: string;
  user?: BonusUserOwner;
  status: DepositBonusIntentStatus;
  bonus_assignment_id?: string | null;
  cancellation_reason?: string | null;
  last_evaluated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CancelBonusAssignmentInput = {
  rejection_reason: string;
  publish_notification?: boolean;
};

export type BonusAssignmentSortBy =
  | "id"
  | "bonus_offer_id"
  | "offer_name"
  | "offer_type"
  | "activity_per_credit_unit"
  | "conversion_window_days"
  | "min_position_duration_seconds"
  | "burn_on_withdrawal"
  | "burn_on_negative_balance"
  | "account_id"
  | "platform"
  | "external_trader_id"
  | "credited_amount"
  | "status"
  | "activated_at"
  | "conversion_deadline_at"
  | "accumulated_activity"
  | "pending_removal"
  | "source_external_transaction_id"
  | "created_at"
  | "updated_at"
  | "user.id"
  | "user.name"
  | "user.email";

export type DepositBonusIntentSortBy =
  | "id"
  | "account_id"
  | "status"
  | "bonus_assignment_id"
  | "cancellation_reason"
  | "last_evaluated_at"
  | "created_at"
  | "updated_at"
  | "user.id"
  | "user.name"
  | "user.email";

export type BonusListSortDirection = "asc" | "desc";

export type BonusAssignmentListFilters = {
  id?: string;
  bonus_offer_id?: string;
  offer_name?: string;
  offer_type?: BonusOfferType;
  activity_per_credit_unit?: number;
  conversion_window_days?: number;
  min_position_duration_seconds?: number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  account_id?: string;
  platform?: string;
  external_trader_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  credited_amount?: number;
  status?: BonusAssignmentStatus;
  activated_at?: string;
  conversion_deadline_at?: string;
  accumulated_activity?: number | string;
  pending_removal?: boolean;
  source_external_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
  sort_by?: BonusAssignmentSortBy;
  sort_direction?: BonusListSortDirection;
  page?: number;
  per_page?: number;
};

export type DepositBonusIntentListFilters = {
  id?: string;
  account_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  status?: DepositBonusIntentStatus;
  bonus_assignment_id?: string;
  cancellation_reason?: string;
  last_evaluated_at?: string;
  created_at?: string;
  updated_at?: string;
  sort_by?: DepositBonusIntentSortBy;
  sort_direction?: BonusListSortDirection;
  page?: number;
  per_page?: number;
};

export type BonusAssignmentFilterFormState = {
  created_at: string;
  offer_name: string;
  account_id: string;
  platform: string;
  external_trader_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  credited_amount: string;
  status: "" | BonusAssignmentStatus;
  activated_at: string;
  conversion_deadline_at: string;
  accumulated_activity: string;
  pending_removal: "" | "true" | "false";
};

export const EMPTY_BONUS_ASSIGNMENT_FILTERS: BonusAssignmentFilterFormState = {
  created_at: "",
  offer_name: "",
  account_id: "",
  platform: "",
  external_trader_id: "",
  user_id: "",
  user_name: "",
  user_email: "",
  credited_amount: "",
  status: "",
  activated_at: "",
  conversion_deadline_at: "",
  accumulated_activity: "",
  pending_removal: "",
};

export type DepositBonusIntentFilterFormState = {
  created_at: string;
  account_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: "" | DepositBonusIntentStatus;
  bonus_assignment_id: string;
  last_evaluated_at: string;
  cancellation_reason: string;
};

export const EMPTY_DEPOSIT_BONUS_INTENT_FILTERS: DepositBonusIntentFilterFormState =
  {
    created_at: "",
    account_id: "",
    user_id: "",
    user_name: "",
    user_email: "",
    status: "",
    bonus_assignment_id: "",
    last_evaluated_at: "",
    cancellation_reason: "",
  };

export const BONUS_ASSIGNMENT_STATUSES: {
  value: BonusAssignmentStatus;
  label: string;
}[] = [
  { value: "queued", label: "Queued" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending_removal", label: "Pending removal" },
];

export const DEPOSIT_BONUS_INTENT_STATUSES: {
  value: DepositBonusIntentStatus;
  label: string;
}[] = [
  { value: "watching", label: "Watching" },
  { value: "applied", label: "Applied" },
  { value: "cancelled", label: "Cancelled" },
];

export type BonusLogsTab = "assignments" | "deposit-intents";

export function resolveBonusOwner(record: {
  user?: BonusUserOwner;
  external_user_id?: string;
}): BonusUserOwner {
  if (record.user) {
    return {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
    };
  }

  return {
    id: record.external_user_id ?? "",
    email: null,
    name: "",
  };
}
