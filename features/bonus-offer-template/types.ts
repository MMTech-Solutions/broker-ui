export type BonusOfferTemplateExcludedInstrument = {
  id: string;
  bonus_offer_template_id: string;
  server_group_id: string;
  symbol_id: string;
  /** Present when symbol relation is loaded. */
  alpha?: string | null;
  /** Present when symbol relation is loaded. */
  name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferTemplate = {
  id: string;
  name: string;
  platform_id: string;
  conversion_window_days: number;
  activity_per_credit_unit: string | number;
  burn_on_withdrawal: boolean;
  burn_on_negative_balance: boolean;
  min_deposit_amount: string | number;
  min_position_duration_seconds: string | number;
  is_active: boolean;
  excluded_instruments_count?: number;
  offers_count?: number;
  excluded_instruments?: BonusOfferTemplateExcludedInstrument[];
  created_at?: string;
  updated_at?: string;
};

export type BonusOfferTemplateSortBy =
  | "id"
  | "name"
  | "platform_id"
  | "conversion_window_days"
  | "activity_per_credit_unit"
  | "burn_on_withdrawal"
  | "burn_on_negative_balance"
  | "min_deposit_amount"
  | "min_position_duration_seconds"
  | "is_active"
  | "created_at"
  | "updated_at"
  | "excluded_instruments_count"
  | "offers_count";

export type BonusOfferTemplateSortDirection = "asc" | "desc";

export type BonusOfferTemplateListFilters = {
  id?: string;
  name?: string;
  platform_id?: string;
  conversion_window_days?: number;
  activity_per_credit_unit?: number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  excluded_instruments_count?: number;
  offers_count?: number;
  sort_by?: BonusOfferTemplateSortBy;
  sort_direction?: BonusOfferTemplateSortDirection;
  page?: number;
  per_page?: number;
};

export type BonusOfferTemplateFilterFormState = {
  name: string;
  platform_id: string;
  conversion_window_days: string;
  activity_per_credit_unit: string;
  excluded_instruments_count: string;
  offers_count: string;
  is_active: "" | "true" | "false";
};

export const EMPTY_BONUS_OFFER_TEMPLATE_FILTERS: BonusOfferTemplateFilterFormState =
  {
    name: "",
    platform_id: "",
    conversion_window_days: "",
    activity_per_credit_unit: "",
    excluded_instruments_count: "",
    offers_count: "",
    is_active: "",
  };

export type CreateBonusOfferTemplateInput = {
  name: string;
  platform_id: string;
  conversion_window_days: number;
  activity_per_credit_unit: string | number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  is_active?: boolean;
};

export type UpdateBonusOfferTemplateInput = {
  name?: string;
  platform_id?: string;
  conversion_window_days?: number;
  activity_per_credit_unit?: string | number;
  burn_on_withdrawal?: boolean;
  burn_on_negative_balance?: boolean;
  min_deposit_amount?: number;
  min_position_duration_seconds?: number;
  is_active?: boolean;
};

export type SyncBonusOfferTemplateExcludedInstrumentsInput = {
  instruments: {
    server_group_id: string;
    symbol_id: string;
  }[];
};
