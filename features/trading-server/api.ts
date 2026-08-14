import type {
  CatalogServerGroupListFilters,
  CreateTradingServerInput,
  Security,
  SecurityListFilters,
  ServerGroup,
  ServerGroupListFilters,
  SymbolListFilters,
  TradingServer,
  TradingServerConfigSchema,
  TradingServerEnvironment,
  TradingServerListFilters,
  TradingSymbol,
  UpdateServerGroupInput,
  UpdateSymbolsMarkupInput,
  UpdateTradingServerInput,
  SymbolsMarkupUpdate,
} from "@/features/trading-server/types";
import type { Leverage, LeverageListFilters } from "@/features/leverage/types";
import { BrokerApiError } from "@/lib/api/errors";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const TRADING_SERVERS_CLIENT_PATH = "v1/trading-servers";
const TRADING_SERVERS_ADMIN_PATH = "v1/admin/trading-servers";
const SERVER_GROUPS_CLIENT_PATH = "v1/server-groups";

type TradingServerAudience = "client" | "admin";

function tradingServersBasePath(audience: TradingServerAudience): string {
  return audience === "admin"
    ? TRADING_SERVERS_ADMIN_PATH
    : TRADING_SERVERS_CLIENT_PATH;
}

const cachedEnvironmentsByAudience = new Map<
  TradingServerAudience,
  TradingServerEnvironment[]
>();
const configSchemasByPlatform = new Map<
  string,
  TradingServerConfigSchema[]
>();
const configSchemasDeniedPlatforms = new Set<string>();

export async function listTradingServers(
  filters: TradingServerListFilters = {},
  audience: TradingServerAudience = "client",
): Promise<BrokerSuccessResponse<TradingServer[]>> {
  return browserBrokerRequest<TradingServer[]>(
    tradingServersBasePath(audience),
    {
      searchParams: filters,
    },
  );
}

export async function listServerGroups(
  tradingServerId: string,
  filters: ServerGroupListFilters = {},
  audience: TradingServerAudience = "client",
): Promise<BrokerSuccessResponse<ServerGroup[]>> {
  return browserBrokerRequest<ServerGroup[]>(
    `${tradingServersBasePath(audience)}/${tradingServerId}/server-groups`,
    { searchParams: toSearchParams(filters) },
  );
}

/**
 * Client catalog: list server groups filtered by environment / platform
 * without selecting a trading server first.
 */
export async function listCatalogServerGroups(
  filters: CatalogServerGroupListFilters = {},
): Promise<BrokerSuccessResponse<ServerGroup[]>> {
  return browserBrokerRequest<ServerGroup[]>(SERVER_GROUPS_CLIENT_PATH, {
    searchParams: toSearchParams(filters),
  });
}

export async function updateServerGroup(
  tradingServerId: string,
  serverGroupId: string,
  input: UpdateServerGroupInput,
): Promise<BrokerSuccessResponse<ServerGroup>> {
  return browserBrokerRequest<ServerGroup>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/server-groups/${serverGroupId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function listServerGroupLeverages(
  tradingServerId: string,
  serverGroupId: string,
  filters: LeverageListFilters = {},
  audience: TradingServerAudience = "client",
): Promise<BrokerSuccessResponse<Leverage[]>> {
  return browserBrokerRequest<Leverage[]>(
    `${tradingServersBasePath(audience)}/${tradingServerId}/server-groups/${serverGroupId}/leverages`,
    { searchParams: toSearchParams(filters) },
  );
}

/** Client catalog: leverages for a server group (no trading-server path). */
export async function listCatalogServerGroupLeverages(
  serverGroupId: string,
  filters: LeverageListFilters = {},
): Promise<BrokerSuccessResponse<Leverage[]>> {
  return browserBrokerRequest<Leverage[]>(
    `${SERVER_GROUPS_CLIENT_PATH}/${serverGroupId}/leverages`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function synchronizeServerGroupLeverages(
  tradingServerId: string,
  serverGroupId: string,
  leverageIds: string[],
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/server-groups/${serverGroupId}/leverages/synchronization`,
    {
      method: "POST",
      body: { leverage_ids: leverageIds },
    },
  );
}

function toSearchParams(
  filters: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listSecurities(
  tradingServerId: string,
  filters: SecurityListFilters = {},
): Promise<BrokerSuccessResponse<Security[]>> {
  return browserBrokerRequest<Security[]>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/securities`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function listServerGroupSecurities(
  tradingServerId: string,
  serverGroupId: string,
  filters: SecurityListFilters = {},
): Promise<BrokerSuccessResponse<Security[]>> {
  return browserBrokerRequest<Security[]>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/server-groups/${serverGroupId}/securities`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function listSymbols(
  tradingServerId: string,
  filters: SymbolListFilters = {},
): Promise<BrokerSuccessResponse<TradingSymbol[]>> {
  return browserBrokerRequest<TradingSymbol[]>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/symbols`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function listSecuritySymbols(
  tradingServerId: string,
  securityId: string,
  filters: SymbolListFilters = {},
): Promise<BrokerSuccessResponse<TradingSymbol[]>> {
  return browserBrokerRequest<TradingSymbol[]>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/securities/${securityId}/symbols`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function updateSymbolsMarkup(
  tradingServerId: string,
  input: UpdateSymbolsMarkupInput,
): Promise<BrokerSuccessResponse<SymbolsMarkupUpdate>> {
  return browserBrokerRequest<SymbolsMarkupUpdate>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/symbols/markup`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function listTradingServerEnvironments(
  audience: TradingServerAudience = "client",
): Promise<
  BrokerSuccessResponse<TradingServerEnvironment[]>
> {
  const cached = cachedEnvironmentsByAudience.get(audience);

  if (cached) {
    return {
      success: true,
      data: cached,
      meta: {},
    };
  }

  const response = await browserBrokerRequest<TradingServerEnvironment[]>(
    `${tradingServersBasePath(audience)}/environments/availables`,
  );

  cachedEnvironmentsByAudience.set(audience, response.data);

  return response;
}

export async function listTradingServerConfigSchemas(
  platformId: string,
): Promise<BrokerSuccessResponse<TradingServerConfigSchema[]>> {
  if (configSchemasDeniedPlatforms.has(platformId)) {
    throw new BrokerApiError(
      "You do not have permission to read trading server config schemas (broker.trading_server.manage).",
      {
        status: 403,
        code: "FORBIDDEN",
      },
    );
  }

  const cached = configSchemasByPlatform.get(platformId);

  if (cached) {
    return {
      success: true,
      data: cached,
      meta: {},
    };
  }

  try {
    const response = await browserBrokerRequest<TradingServerConfigSchema[]>(
      `${TRADING_SERVERS_ADMIN_PATH}/config-schemas`,
      { searchParams: { platform_id: platformId } },
    );

    configSchemasByPlatform.set(platformId, response.data);

    return response;
  } catch (error) {
    if (error instanceof BrokerApiError && error.status === 403) {
      configSchemasDeniedPlatforms.add(platformId);
    }

    throw error;
  }
}

export async function getTradingServer(
  tradingServerId: string,
  audience: TradingServerAudience = "client",
): Promise<BrokerSuccessResponse<TradingServer>> {
  return browserBrokerRequest<TradingServer>(
    `${tradingServersBasePath(audience)}/${tradingServerId}`,
  );
}

export async function createTradingServer(
  input: CreateTradingServerInput,
): Promise<BrokerSuccessResponse<TradingServer>> {
  return browserBrokerRequest<TradingServer>(TRADING_SERVERS_ADMIN_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateTradingServer(
  tradingServerId: string,
  input: UpdateTradingServerInput,
): Promise<BrokerSuccessResponse<TradingServer>> {
  return browserBrokerRequest<TradingServer>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteTradingServer(
  tradingServerId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}`,
    {
      method: "DELETE",
    },
  );
}

type SyncTradingServerOptions = {
  async?: boolean;
};

export type { TradingServerAudience };

export function listTradingServersForAdmin(
  filters: TradingServerListFilters = {},
) {
  return listTradingServers(filters, "admin");
}

export function listServerGroupsForAdmin(
  tradingServerId: string,
  filters: ServerGroupListFilters = {},
) {
  return listServerGroups(tradingServerId, filters, "admin");
}

export function getTradingServerForAdmin(tradingServerId: string) {
  return getTradingServer(tradingServerId, "admin");
}

export async function syncTradingServer(
  tradingServerId: string,
  options: SyncTradingServerOptions = {},
): Promise<BrokerSuccessResponse<void>> {
  const headers = new Headers();

  if (options.async) {
    headers.set("X-Async", "true");
  }

  return browserBrokerRequest<void>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/sync`,
    {
      method: "POST",
      headers,
    },
  );
}
