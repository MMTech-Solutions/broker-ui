export type BonusOfferType = "manual_claim" | "deposit_triggered";

export type DepositApplicationMode = "once_per_account" | "per_deposit";

export type BonusExcludedInstrument = {
  id: string;
  bonus_offer_id: string;
  server_group_id: string;
  symbol_id: string;
  /** Present when symbol relation is loaded. */
  alpha?: string | null;
  /** Present when symbol relation is loaded. */
  name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferIntroducingBroker = {
  id: string;
  bonus_offer_id: string;
  external_user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferServerGroup = {
  id: string;
  bonus_offer_id: string;
  server_group_id: string;
  created_at?: string;
  updated_at?: string;
};

export type EligibleIntroducingBroker = {
  external_user_id: string;
};

export type BonusOffer = {
  id: string;
  type: BonusOfferType;
  name: string;
  bonus_offer_template_id: string | null;
  platform_id: string;
  is_active?: boolean;
  /** Major currency units (API converts from stored minor units). */
  credit_amount: string | number | null;
  deposit_percent: string | number | null;
  /** Major currency units (API converts from stored minor units). */
  max_credit_amount: string | number | null;
  deposit_application_mode?: DepositApplicationMode | null;
  claim_expires_at?: string | null;
  /** Major currency units (API converts from stored minor units). */
  min_real_balance?: string | number | null;
  /** Major currency units (API converts from stored minor units). */
  min_deposit_amount?: string | number | null;
  min_position_duration_seconds?: string | number | null;
  conversion_window_days?: number | null;
  activity_per_credit_unit?: string | number | null;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  currency?: string | null;
  currency_precision?: number | null;
  server_groups_count?: number;
  excluded_instruments_count?: number;
  introducing_brokers_count?: number;
  assignments_count?: number;
  excluded_instruments?: BonusExcludedInstrument[];
  introducing_brokers?: BonusOfferIntroducingBroker[];
  server_groups?: BonusOfferServerGroup[];
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferTemplate = Pick<
  import("@/features/bonus-offer-template/types").BonusOfferTemplate,
  "id" | "name" | "platform_id" | "is_active"
>;

export type BonusOfferSortBy =
  | "id"
  | "name"
  | "type"
  | "bonus_offer_template_id"
  | "platform_id"
  | "is_active"
  | "credit_amount"
  | "deposit_percent"
  | "max_credit_amount"
  | "deposit_application_mode"
  | "claim_expires_at"
  | "min_real_balance"
  | "min_deposit_amount"
  | "min_position_duration_seconds"
  | "conversion_window_days"
  | "activity_per_credit_unit"
  | "burn_on_withdrawal"
  | "burn_on_negative_balance"
  | "created_at"
  | "updated_at"
  | "server_groups_count"
  | "excluded_instruments_count"
  | "introducing_brokers_count"
  | "assignments_count";

export type BonusOfferSortDirection = "asc" | "desc";

export type BonusOfferListFilters = {
  id?: string;
  name?: string;
  type?: BonusOfferType;
  bonus_offer_template_id?: string;
  platform_id?: string;
  is_active?: boolean;
  credit_amount?: number;
  deposit_percent?: number;
  max_credit_amount?: number;
  deposit_application_mode?: DepositApplicationMode;
  claim_expires_at?: string;
  min_real_balance?: number;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  conversion_window_days?: number;
  activity_per_credit_unit?: number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  created_at?: string;
  updated_at?: string;
  server_groups_count?: number;
  excluded_instruments_count?: number;
  introducing_brokers_count?: number;
  assignments_count?: number;
  sort_by?: BonusOfferSortBy;
  sort_direction?: BonusOfferSortDirection;
  page?: number;
  per_page?: number;
};

export type BonusOfferFilterFormState = {
  name: string;
  type: "" | BonusOfferType;
  platform_id: string;
  server_groups_count: string;
  excluded_instruments_count: string;
  introducing_brokers_count: string;
  assignments_count: string;
  claim_expires_at: string;
  is_active: "" | "true" | "false";
};

export const EMPTY_BONUS_OFFER_FILTERS: BonusOfferFilterFormState = {
  name: "",
  type: "",
  platform_id: "",
  server_groups_count: "",
  excluded_instruments_count: "",
  introducing_brokers_count: "",
  assignments_count: "",
  claim_expires_at: "",
  is_active: "",
};

export type CreateBonusOfferInput = {
  type: BonusOfferType;
  name: string;
  bonus_offer_template_id?: string;
  platform_id?: string;
  is_active?: boolean;
  credit_amount?: number;
  deposit_percent?: number;
  max_credit_amount?: number;
  deposit_application_mode?: DepositApplicationMode;
  claim_expires_at?: string;
  min_real_balance?: number;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  conversion_window_days?: number;
  activity_per_credit_unit?: string | number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  server_group_ids: string[];
  /** Only for deposit_triggered. Empty = default deposit offer (no IB link). */
  introducing_broker_external_user_ids?: string[];
};

export type UpdateBonusOfferInput = {
  type?: BonusOfferType;
  name?: string;
  platform_id?: string;
  is_active?: boolean;
  /** Required by API when deactivating (`is_active` false on an active offer). */
  invalidate_assignments?: boolean;
  credit_amount?: number | null;
  deposit_percent?: number | null;
  max_credit_amount?: number | null;
  deposit_application_mode?: DepositApplicationMode | null;
  claim_expires_at?: string | null;
  min_real_balance?: number | null;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  conversion_window_days?: number;
  activity_per_credit_unit?: string | number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
};

export type DeleteBonusOfferInput = {
  invalidate_assignments: boolean;
};

export type SyncBonusExcludedInstrumentsInput = {
  instruments: {
    server_group_id: string;
    symbol_id: string;
  }[];
};

export type SyncBonusOfferIntroducingBrokersInput = {
  external_user_ids: string[];
};

export type SyncBonusOfferServerGroupsInput = {
  server_group_ids: string[];
};

export type ListEligibleIntroducingBrokersFilters = {
  exclude_bonus_offer_id?: string;
};

export type AdminBonusAccountRequirementCode =
  | "min_real_balance"
  | "min_deposit_amount"
  | "not_already_claimed"
  | "no_active_bonus"
  | "no_previous_deposit_bonus"
  | "credit_amount_positive";

export type AdminBonusAccountRequirement = {
  code: AdminBonusAccountRequirementCode | string;
  met: boolean;
  required: number;
  current: number;
};

export type AdminEligibleBonusAccount = {
  id: string;
  external_trader_id: string;
  server_group_id: string;
  current_balance: number;
  is_eligible: boolean;
  requirements: AdminBonusAccountRequirement[];
};

export type AdminAssignBonusInput = {
  account_id: string;
  external_user_id: string;
};

export const BONUS_OFFER_TYPES: {
  value: BonusOfferType;
  label: string;
}[] = [
  { value: "manual_claim", label: "Manual claim" },
  { value: "deposit_triggered", label: "Deposit triggered" },
];

export const DEPOSIT_APPLICATION_MODES: {
  value: DepositApplicationMode;
  label: string;
}[] = [
  { value: "once_per_account", label: "Once per account" },
  { value: "per_deposit", label: "Per deposit" },
];
