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

export type BonusAssignment = {
  id: string;
  bonus_offer_id: string;
  account_id: string;
  external_user_id: string;
  /** Major currency units (API converts from stored minor units). */
  credited_amount: string | number;
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
  external_user_id: string;
  status: DepositBonusIntentStatus;
  bonus_assignment_id?: string | null;
  cancellation_reason?: string | null;
  last_evaluated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BonusAssignmentListFilters = {
  page?: number;
  per_page?: number;
  bonus_offer_id?: string;
  account_id?: string;
  status?: BonusAssignmentStatus;
};

export type DepositBonusIntentListFilters = {
  page?: number;
  per_page?: number;
  account_id?: string;
  external_user_id?: string;
  status?: DepositBonusIntentStatus;
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
