import type { BonusOffer } from "@/features/bonus-offer/types";

export type BonusAssignmentStatus =
  | "queued"
  | "active"
  | "completed"
  | "cancelled"
  | "pending_removal";

export type BonusAssignment = {
  id: string;
  bonus_offer_id: string;
  account_id: string;
  external_user_id: string;
  credited_amount: string | number;
  status: BonusAssignmentStatus;
  activated_at?: string | null;
  conversion_deadline_at?: string | null;
  accumulated_activity?: string | number | null;
  pending_removal?: boolean;
  source_external_transaction_id?: string | null;
  bonus_offer?: BonusOffer;
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
