import type { InitialAmount } from "@/features/initial-amount/types";
import type { Leverage } from "@/features/leverage/types";
import type { Platform } from "@/features/platform/types";
import type { ServerGroup } from "@/features/trading-server/types";
import type { TradingAccount } from "@/features/trading-account/types";

export type { TradingAccount };

export type ClientServerGroup = ServerGroup & {
  environment?: number;
};

export type ClientTradingAccountListFilters = {
  platformId: string;
  environment: string;
  leverageId: string;
};

export const EMPTY_CLIENT_TRADING_ACCOUNT_FILTERS: ClientTradingAccountListFilters =
  {
    platformId: "all",
    environment: "all",
    leverageId: "all",
  };

export type CreateClientTradingAccountInput = {
  server_group_id: string;
  leverage_id: string;
  amount_id?: string;
};

export type UpdateTradingAccountCredentialsInput = {
  password?: string;
  investor_password?: string;
  challenge_id: string;
  code: string;
};

export type TwoFactorChallengeMethod = "email" | "google_authenticator";

export type TwoFactorChallenge = {
  challenge_id: string;
  method: TwoFactorChallengeMethod;
  context: "trading_credentials";
  expires_in_minutes: number;
};

export type ClientAccountCatalog = {
  platforms: Platform[];
  serverGroups: ClientServerGroup[];
  leverages: Leverage[];
  initialAmounts: InitialAmount[];
  serverGroupById: Map<string, ClientServerGroup>;
  leverageById: Map<string, Leverage>;
  platformById: Map<string, Platform>;
};

export type EnrichedClientTradingAccount = TradingAccount & {
  serverGroupLabel: string;
  platformLabel: string;
  environmentLabel: string;
  leverageLabel: string;
  tradingServerId: string | null;
  platformId: string | null;
  environment: number | null;
  currencyCode: string | null;
  currencyPrecision: number | null;
};
