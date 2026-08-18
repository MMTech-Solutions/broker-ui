export const TRADING_SERVER_ENVIRONMENT = {
  DEMO: 1,
  LIVE: 2,
} as const;

export type TradingServerEnvironment = {
  name: string;
  label: string;
  value: number;
};

export type ConfigSchemaField = {
  key: string;
  type: "string" | "integer";
  required: boolean;
  secret: boolean;
  min?: number;
  max?: number;
};

export type TradingServerConfigSchema = {
  id: string;
  platform_id: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  definition: {
    identity: string[];
    fields: ConfigSchemaField[];
  };
};

export type TradingServer = {
  id: string;
  platform_id: string;
  name: string;
  code: string;
  config_schema_id: string;
  config: Record<string, string | number>;
  connection_signature: string;
  connection_id: string | null;
  is_active: boolean;
  initialized_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  configuration_warnings?: string[] | null;
};

export type TradingServerListFilters = {
  platform_id?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type BalanceAdjustmentType = "BALANCE" | "CREDIT";

export type BookType = "a_book" | "b_book";

export type ServerGroupCurrency = {
  code: string;
  precision: number | null;
  iso_code?: string;
};

export type RestrictedCountry = {
  code: string;
  name: string;
};

export type ServerGroupTradingTerms = {
  pips: string;
  lot: string;
  min_trade: string;
  margin_call: number;
  commission: string;
  stop_out: number;
};

export type ServerGroup = {
  id: string;
  /** Platform identity (admin list/update only; omitted for clients). */
  name?: string;
  meta_name: string;
  trading_server_id: string;
  description?: string | null;
  /** Major-unit decimal string from the API (MoneyTransformer). */
  min_deposit?: string | null;
  /** Major-unit decimal string from the API (MoneyTransformer). */
  min_withdrawal?: string | null;
  account_limits?: number;
  /** Major-unit decimal string from the API (MoneyTransformer). */
  default_amount?: string | null;
  default_amount_type?: BalanceAdjustmentType | null;
  currency?: string | ServerGroupCurrency | { code?: string; iso_code?: string; precision?: number | null };
  currency_denomination_factor?: number;
  book_type?: BookType | null;
  is_private?: boolean;
  is_default?: boolean;
  is_active: boolean;
  is_deposit_enabled?: boolean;
  is_withdrawal_enabled?: boolean;
  use_countries_restrictions?: boolean;
  is_restricted_countries_allowlist?: boolean;
  restricted_countries?: RestrictedCountry[] | null;
  has_ib_restrictions?: boolean;
  configuration_warnings?: string[] | null;
  ib_external_user_ids?: string[] | null;
  environment?: number | null;
  trading_terms?: ServerGroupTradingTerms;
  /** Nested platform: client has id+name (display); admin also has custom_name. */
  platform?: {
    id: string;
    name: string;
    custom_name?: string | null;
    description?: string | null;
    image_path?: string | null;
  };
};

export type UpdateServerGroupInput = {
  description?: string | null;
  meta_name?: string;
  environment?: number | null;
  is_default?: boolean;
  is_private?: boolean;
  is_active?: boolean;
  is_deposit_enabled?: boolean;
  is_withdrawal_enabled?: boolean;
  use_countries_restrictions?: boolean;
  is_restricted_countries_allowlist?: boolean;
  restricted_countries?: RestrictedCountry[];
  currency?: string;
  currency_precision?: number;
  currency_denomination_factor?: number;
  book_type?: BookType | null;
  /** Minor units integer expected by PATCH. */
  default_amount?: number;
  default_amount_type?: BalanceAdjustmentType;
  account_limits?: number;
  /** Minor units integer expected by PATCH. */
  min_deposit?: number;
  /** Minor units integer expected by PATCH. */
  min_withdrawal?: number;
  ib_external_user_ids?: string[];
  trading_terms?: Partial<ServerGroupTradingTerms>;
};

export type ServerGroupListFilters = {
  name?: string;
  meta_name?: string;
  page?: number;
  per_page?: number;
};

/** Client-facing catalog of server groups (no trading-server path). */
export type CatalogServerGroupListFilters = {
  environment?: number;
  platform_id?: string;
  name?: string;
  meta_name?: string;
  page?: number;
  per_page?: number;
};

export type Security = {
  id: string;
  name: string;
  position: number;
  trading_server_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SecurityListFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type TradingSymbol = {
  id: string;
  name: string;
  alpha: string;
  stype: number;
  markup: string;
  trading_server_id: string;
};

export type SymbolsMarkupScope =
  | { type: "trading_server" }
  | { type: "server_group"; serverGroupId: string; label: string }
  | { type: "security"; securityId: string; label: string }
  | { type: "symbols"; symbolIds: string[]; label?: string };

export type UpdateSymbolsMarkupInput = {
  markup: string;
  server_group_id?: string;
  security_id?: string;
  symbol_ids?: string[];
};

export type SymbolsMarkupUpdate = {
  updated_count: number;
  markup: string;
};

export type SymbolListFilters = {
  name?: string;
  alpha?: string;
  stype?: number;
  page?: number;
  per_page?: number;
};

export type CreateTradingServerInput = {
  platform_id: string;
  name: string;
  code?: string | null;
  config_schema_id?: string;
  config: Record<string, string | number>;
  is_active?: boolean;
};

export type UpdateTradingServerInput = {
  name?: string;
  code?: string | null;
  config_schema_id?: string;
  config?: Record<string, string | number>;
  is_active?: boolean;
};
