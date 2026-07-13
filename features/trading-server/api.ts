import type {
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
  UpdateTradingServerInput,
} from "@/features/trading-server/types";
import type { Leverage, LeverageListFilters } from "@/features/leverage/types";
import { BrokerApiError } from "@/lib/api/errors";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const TRADING_SERVERS_CLIENT_PATH = "v1/trading-servers";
const TRADING_SERVERS_ADMIN_PATH = "v1/admin/trading-servers";

type TradingServerAudience = "client" | "admin";

function tradingServersBasePath(audience: TradingServerAudience): string {
  return audience === "admin"
    ? TRADING_SERVERS_ADMIN_PATH
    : TRADING_SERVERS_CLIENT_PATH;
}

let cachedEnvironments: TradingServerEnvironment[] | null = null;
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
): Promise<BrokerSuccessResponse<Leverage[]>> {
  return browserBrokerRequest<Leverage[]>(
    `${TRADING_SERVERS_ADMIN_PATH}/${tradingServerId}/server-groups/${serverGroupId}/leverages`,
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

export async function listTradingServerEnvironments(): Promise<
  BrokerSuccessResponse<TradingServerEnvironment[]>
> {
  if (cachedEnvironments) {
    return {
      success: true,
      data: cachedEnvironments,
      meta: {},
    };
  }

  const response = await browserBrokerRequest<TradingServerEnvironment[]>(
    `${TRADING_SERVERS_CLIENT_PATH}/environments/availables`,
  );

  cachedEnvironments = response.data;

  return response;
}

export async function listTradingServerConfigSchemas(
  platformId: string,
): Promise<BrokerSuccessResponse<TradingServerConfigSchema[]>> {
  if (configSchemasDeniedPlatforms.has(platformId)) {
    throw new BrokerApiError(
      "You do not have permission to read trading server config schemas (trading_server.manage).",
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
