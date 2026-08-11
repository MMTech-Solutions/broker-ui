import type {
  ClientAccountCatalog,
  ClientServerGroup,
  CreateClientTradingAccountInput,
  TwoFactorChallenge,
  UpdateTradingAccountCredentialsInput,
} from "@/features/client-trading-account/types";
import { listClientInitialAmounts } from "@/features/initial-amount/api";
import { listLeverages } from "@/features/leverage/api";
import type { Platform } from "@/features/platform/types";
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

function buildPlatformsFromServerGroups(
  serverGroups: ClientServerGroup[],
): Platform[] {
  const byId = new Map<string, Platform>();

  for (const group of serverGroups) {
    const nested = group.platform;
    if (!nested?.id) {
      continue;
    }

    if (!byId.has(nested.id)) {
      byId.set(nested.id, {
        id: nested.id,
        name: nested.name,
        custom_name: nested.custom_name ?? null,
        description: nested.description ?? null,
        image_path: nested.image_path ?? null,
        is_active: true,
      });
    }
  }

  return [...byId.values()];
}

function toClientServerGroup(group: ServerGroup): ClientServerGroup {
  return {
    ...group,
    environment: group.environment,
  };
}

export async function loadClientAccountCatalog(): Promise<ClientAccountCatalog> {
  const serverGroupsResponse = await listCatalogServerGroups({
    per_page: 100,
  });

  const serverGroups = serverGroupsResponse.data.map(toClientServerGroup);
  const platforms = buildPlatformsFromServerGroups(serverGroups);
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
