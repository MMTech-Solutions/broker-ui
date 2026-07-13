import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import type { BonusOffer } from "@/features/bonus-offer/types";

export type { BonusAssignment, BonusOffer };

export type BonusAssignmentStatus = BonusAssignment["status"];

export type ClientBonusAccountRequirementCode =
  | "min_real_balance"
  | "min_deposit_amount";

export type ClientBonusAccountRequirement = {
  code: ClientBonusAccountRequirementCode;
  met: boolean;
  required: number;
  current: number;
};

export type ClientBonusEligibleAccount = {
  id: string;
  external_trader_id: string;
  server_group_id: string;
  current_balance: number;
  is_eligible: boolean;
  requirements: ClientBonusAccountRequirement[];
};

export type ClaimBonusOfferInput = {
  account_id: string;
};

export type ClientBonusAssignmentListFilters = {
  status?: BonusAssignmentStatus;
  page?: number;
  per_page?: number;
};

export const CLIENT_BONUS_ASSIGNMENT_STATUSES: {
  value: BonusAssignmentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "queued", label: "En cola" },
  { value: "completed", label: "Completados" },
  { value: "cancelled", label: "Cancelados" },
  { value: "pending_removal", label: "Retiro pendiente" },
];
