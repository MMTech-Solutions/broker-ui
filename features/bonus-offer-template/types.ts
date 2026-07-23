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

export type BonusOfferTemplateListFilters = {
  name?: string;
  is_active?: boolean;
  platform_id?: string;
  page?: number;
  per_page?: number;
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
