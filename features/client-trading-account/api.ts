import type {
  ClientAccountCatalog,
  ClientServerGroup,
  CreateClientTradingAccountInput,
  TwoFactorChallenge,
  UpdateTradingAccountCredentialsInput,
} from "@/features/client-trading-account/types";
import { listClientInitialAmounts } from "@/features/initial-amount/api";
import { listLeverages } from "@/features/leverage/api";
import { listConfiguredPlatforms } from "@/features/platform/api";
import type {
  TradingAccount,
  TradingAccountListFilters,
} from "@/features/trading-account/types";
import { listCatalogServerGroups } from "@/features/trading-server/api";
import type { ServerGroup } from "@/features/trading-server/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import { browserIamRequest } from "@/lib/api/iam-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const ACCOUNTS_PATH = "v1/accounts";

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

export async function startTradingCredentialsChallenge(): Promise<
  BrokerSuccessResponse<TwoFactorChallenge>
> {
  return browserIamRequest<TwoFactorChallenge>(
    "v1/auth/user/2fa/challenge/start",
    {
      method: "POST",
      body: { context: "trading_credentials" },
    },
  );
}

export async function updateClientTradingAccountCredentials(
  accountUuid: string,
  input: UpdateTradingAccountCredentialsInput,
): Promise<BrokerSuccessResponse<TradingAccount>> {
  return browserBrokerRequest<TradingAccount>(
    `${ACCOUNTS_PATH}/${accountUuid}/credentials`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

function toClientServerGroup(group: ServerGroup): ClientServerGroup {
  return {
    ...group,
    environment: group.environment as number | undefined,
  };
}

/**
 * Base catalog for client account screens: configured platforms, leverages,
 * initial amounts. Server groups are loaded on demand (filtered by platform/env)
 * when creating an account.
 */
export async function loadClientAccountCatalog(): Promise<ClientAccountCatalog> {
  const platformsResponse = await listConfiguredPlatforms();
  const platforms = platformsResponse.data;
  const platformById = new Map(
    platforms.map((platform) => [platform.id, platform]),
  );

  let leverages: ClientAccountCatalog["leverages"] = [];

  try {
    const leveragesResponse = await listLeverages({ per_page: 100 });
    leverages = leveragesResponse.data;
  } catch {
    leverages = [];
  }

  let initialAmounts: ClientAccountCatalog["initialAmounts"] = [];

  try {
    const initialAmountsResponse = await listClientInitialAmounts({
      per_page: 100,
    });
    initialAmounts = initialAmountsResponse.data;
  } catch {
    initialAmounts = [];
  }

  // Keep a full group map for enriching existing accounts (environment labels, etc.).
  let serverGroups: ClientServerGroup[] = [];

  try {
    const serverGroupsResponse = await listCatalogServerGroups({
      per_page: 100,
    });
    serverGroups = serverGroupsResponse.data.map(toClientServerGroup);
  } catch {
    serverGroups = [];
  }

  const serverGroupById = new Map(
    serverGroups.map((group) => [group.id, group]),
  );
  const leverageById = new Map(
    leverages.map((leverage) => [leverage.id, leverage]),
  );

  return {
    platforms,
    serverGroups,
    leverages,
    initialAmounts,
    serverGroupById,
    leverageById,
    platformById,
  };
}

export async function listClientServerGroupsForSelection(filters: {
  platformId: string;
  environment: number;
}): Promise<ClientServerGroup[]> {
  const response = await listCatalogServerGroups({
    platform_id: filters.platformId,
    environment: filters.environment,
    per_page: 100,
  });

  return response.data.map(toClientServerGroup);
}

/**
 * Lightweight map of server_group_id → environment.
 * Used by insurance eligibility without loading leverages/initial amounts.
 */
export async function loadClientServerGroupEnvironments(): Promise<
  Map<string, number>
> {
  const serverGroupsResponse = await listCatalogServerGroups({
    per_page: 100,
  });

  return new Map(
    serverGroupsResponse.data
      .filter((group) => group.environment != null)
      .map((group) => [group.id, group.environment as number]),
  );
}
