import type { InitialAmount } from "@/features/initial-amount/types";
import type { Leverage } from "@/features/leverage/types";
import type { Platform } from "@/features/platform/types";
import type { ServerGroup, TradingServer } from "@/features/trading-server/types";
import type { TradingAccount } from "@/features/trading-account/types";

export type { TradingAccount };

export type ClientServerGroup = ServerGroup & {
  environment?: number;
  platform?: string | number;
};

export type ClientTradingAccountListFilters = {
  platformId: string;
  tradingServerId: string;
  leverageId: string;
};

export const EMPTY_CLIENT_TRADING_ACCOUNT_FILTERS: ClientTradingAccountListFilters =
  {
    platformId: "all",
    tradingServerId: "all",
    leverageId: "all",
  };

export type CreateClientTradingAccountInput = {
  server_group_id: string;
  leverage_id: string;
  amount_id?: string;
};

export type CreateExternalDepositInput = {
  account_id: string;
  amount: number;
  comments?: string | null;
};

export type CreateExternalWithdrawalInput = {
  account_id: string;
  amount: number;
  code: string;
  comments?: string | null;
};

export type ClientAccountCatalog = {
  platforms: Platform[];
  tradingServers: TradingServer[];
  serverGroups: ClientServerGroup[];
  leverages: Leverage[];
  initialAmounts: InitialAmount[];
  serverGroupById: Map<string, ClientServerGroup>;
  leverageById: Map<string, Leverage>;
  tradingServerById: Map<string, TradingServer>;
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
};
