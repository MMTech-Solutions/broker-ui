export type BonusOfferType = "manual_claim" | "deposit_triggered";

export type DepositApplicationMode = "once_per_account" | "per_deposit";

export type BonusExcludedInstrument = {
  id: string;
  bonus_offer_id: string;
  server_group_id: string;
  symbol: string;
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
  credit_amount: string | number | null;
  deposit_percent: string | number | null;
  max_credit_amount: string | number | null;
  deposit_application_mode?: DepositApplicationMode | null;
  claim_expires_at?: string | null;
  min_real_balance?: string | number | null;
  min_deposit_amount?: string | number | null;
  min_position_duration_seconds?: string | number | null;
  conversion_window_days?: number | null;
  activity_per_credit_unit?: string | number | null;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  server_groups_count?: number;
  excluded_instruments_count?: number;
  introducing_brokers_count?: number;
  assignments_count?: number;
  excluded_instruments?: BonusExcludedInstrument[];
  introducing_brokers?: BonusOfferIntroducingBroker[];
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferTemplate = Pick<
  import("@/features/bonus-offer-template/types").BonusOfferTemplate,
  "id" | "name" | "platform_id" | "is_active"
>;

export type BonusOfferListFilters = {
  name?: string;
  type?: BonusOfferType;
  is_active?: boolean;
  platform_id?: string;
  page?: number;
  per_page?: number;
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
};

export type UpdateBonusOfferInput = {
  type?: BonusOfferType;
  name?: string;
  platform_id?: string;
  is_active?: boolean;
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

export type SyncBonusExcludedInstrumentsInput = {
  instruments: {
    server_group_id: string;
    symbol: string;
  }[];
};

export type SyncBonusOfferIntroducingBrokersInput = {
  external_user_ids: string[];
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
