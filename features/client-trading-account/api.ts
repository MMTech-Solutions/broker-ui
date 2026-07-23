import type {
  ClientAccountCatalog,
  ClientServerGroup,
  CreateClientTradingAccountInput,
  CreateExternalDepositInput,
  CreateExternalWithdrawalInput,
} from "@/features/client-trading-account/types";
import { listInitialAmounts } from "@/features/initial-amount/api";
import { listLeverages } from "@/features/leverage/api";
import type { Platform } from "@/features/platform/types";
import type {
  TradingAccount,
  TradingAccountListFilters,
} from "@/features/trading-account/types";
import {
  listServerGroups,
  listTradingServers,
} from "@/features/trading-server/api";
import type { TradingServer } from "@/features/trading-server/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const ACCOUNTS_PATH = "v1/accounts";
const FINANCE_PATH = "v1/finance";

export async function listClientTradingAccounts(
  filters: TradingAccountListFilters = {},
): Promise<BrokerSuccessResponse<TradingAccount[]>> {
  return browserBrokerRequest<TradingAccount[]>(ACCOUNTS_PATH, {
    searchParams: filters,
  });
}

export async function createClientTradingAccount(
  input: CreateClientTradingAccountInput,
): Promise<BrokerSuccessResponse<TradingAccount>> {
  return browserBrokerRequest<TradingAccount>(ACCOUNTS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function createExternalDeposit(
  input: CreateExternalDepositInput,
): Promise<BrokerSuccessResponse<unknown>> {
  return browserBrokerRequest(`${FINANCE_PATH}/external-deposits`, {
    method: "POST",
    body: input,
  });
}

export async function createExternalWithdrawal(
  input: CreateExternalWithdrawalInput,
): Promise<BrokerSuccessResponse<unknown>> {
  return browserBrokerRequest(`${FINANCE_PATH}/external-withdrawals`, {
    method: "POST",
    body: input,
  });
}

function formatPlatformLabel(platform: string | number | undefined): string {
  if (platform === undefined || platform === null) {
    return "—";
  }

  return String(platform);
}

function buildPlatformsFromTradingServers(
  tradingServers: TradingServer[],
  serverGroups: ClientServerGroup[],
): Platform[] {
  const labelByPlatformId = new Map<string, string>();

  for (const server of tradingServers) {
    const group = serverGroups.find(
      (item) => item.trading_server_id === server.id,
    );
    const label = formatPlatformLabel(group?.platform ?? server.platform_id);
    labelByPlatformId.set(server.platform_id, label);
  }

  return [...labelByPlatformId.entries()].map(([id, name]) => ({
    id,
    name,
    custom_name: null,
    volume_factor: 0,
    is_active: true,
  }));
}

export async function loadClientAccountCatalog(): Promise<ClientAccountCatalog> {
  const tradingServersResponse = await listTradingServers({
    per_page: 100,
  });

  const groupsByServer = await Promise.all(
    tradingServersResponse.data.map(async (server) => {
      const groupsResponse = await listServerGroups(server.id, {
        per_page: 100,
      });

      return groupsResponse.data.map(
        (group): ClientServerGroup => ({
          ...group,
          environment: server.environment,
          platform: formatPlatformLabel(
            (group as ClientServerGroup).platform ?? server.platform_id,
          ),
        }),
      );
    }),
  );

  const serverGroups = groupsByServer.flat();
  const platforms = buildPlatformsFromTradingServers(
    tradingServersResponse.data,
    serverGroups,
  );
  const platformById = new Map(platforms.map((platform) => [platform.id, platform]));

  let leverages: ClientAccountCatalog["leverages"] = [];

  try {
    const leveragesResponse = await listLeverages({ per_page: 100 });
    leverages = leveragesResponse.data;
  } catch {
    leverages = [];
  }

  let initialAmounts: ClientAccountCatalog["initialAmounts"] = [];

  try {
    const initialAmountsResponse = await listInitialAmounts({ per_page: 100 });
    initialAmounts = initialAmountsResponse.data;
  } catch {
    initialAmounts = [];
  }

  const serverGroupById = new Map(serverGroups.map((group) => [group.id, group]));
  const leverageById = new Map(
    leverages.map((leverage) => [leverage.id, leverage]),
  );
  const tradingServerById = new Map(
    tradingServersResponse.data.map((server) => [server.id, server]),
  );

  return {
    platforms,
    tradingServers: tradingServersResponse.data,
    serverGroups,
    leverages,
    initialAmounts,
    serverGroupById,
    leverageById,
    tradingServerById,
    platformById,
  };
}

/**
 * Lightweight map of server_group_id → trading-server environment.
 * Used by insurance eligibility without loading leverages/initial amounts.
 */
export async function loadClientServerGroupEnvironments(): Promise<
  Map<string, number>
> {
  const tradingServersResponse = await listTradingServers({
    per_page: 100,
  });

  const groupsByServer = await Promise.all(
    tradingServersResponse.data.map(async (server) => {
      const groupsResponse = await listServerGroups(server.id, {
        per_page: 100,
      });

      return groupsResponse.data.map(
        (group) => [group.id, server.environment] as const,
      );
    }),
  );

  return new Map(groupsByServer.flat());
}
