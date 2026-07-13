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
  config_schema_id: string;
  config: Record<string, string | number>;
  connection_signature: string;
  connection_id: string | null;
  environment: number;
  is_active: boolean;
  initialized_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TradingServerListFilters = {
  platform_id?: string;
  environment?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type BalanceAdjustmentType = "BALANCE" | "CREDIT";

export type ServerGroupCurrency = {
  code: string;
  precision: number;
  iso_code?: string;
};

export type RestrictedCountry = {
  code: string;
  name: string;
};

export type ServerGroup = {
  id: string;
  name: string;
  meta_name: string;
  trading_server_id: string;
  description?: string | null;
  min_deposit?: string | null;
  min_withdrawal?: string | null;
  account_limits?: number;
  default_amount?: string | null;
  default_amount_type?: BalanceAdjustmentType | null;
  currency?: string | ServerGroupCurrency | { code?: string; iso_code?: string; precision?: number };
  currency_denomination_factor?: number;
  is_private?: boolean;
  is_default?: boolean;
  is_active: boolean;
  is_deposit_enabled?: boolean;
  is_withdrawal_enabled?: boolean;
  use_countries_restrictions?: boolean;
  restricted_countries?: RestrictedCountry[] | null;
  has_ib_restrictions?: boolean;
  configuration_warnings?: string[] | null;
  ib_external_user_ids?: string[] | null;
};

export type UpdateServerGroupInput = {
  description?: string | null;
  is_default?: boolean;
  is_private?: boolean;
  is_active?: boolean;
  is_deposit_enabled?: boolean;
  is_withdrawal_enabled?: boolean;
  use_countries_restrictions?: boolean;
  restricted_countries?: RestrictedCountry[];
  default_amount?: number;
  default_amount_type?: BalanceAdjustmentType;
  account_limits?: number;
  min_deposit?: number;
  min_withdrawal?: number;
  ib_external_user_ids?: string[];
};

export type ServerGroupListFilters = {
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
  trading_server_id: string;
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
  config_schema_id?: string;
  config: Record<string, string | number>;
  environment: number;
  is_active?: boolean;
};

export type UpdateTradingServerInput = {
  config_schema_id?: string;
  config?: Record<string, string | number>;
  environment?: number;
  is_active?: boolean;
};
