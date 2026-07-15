import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type {
  AccountPosition,
  ClosePositionInput,
  ListAccountPositionsParams,
  OpenPositionInput,
  OpenPositionsWatchResponse,
} from "@/features/client-positions/types";

const accountPositionsPath = (accountId: string) =>
  `v1/accounts/${accountId}/open-positions`;

const accountHistoryPath = (accountId: string) =>
  `v1/accounts/${accountId}/positions`;

const accountWatchPath = (accountId: string) =>
  `v1/accounts/${accountId}/positions/watch`;

export async function listAccountPositions(
  accountId: string,
  params: ListAccountPositionsParams,
): Promise<BrokerSuccessResponse<AccountPosition[]>> {
  const search = new URLSearchParams();
  search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("per_page", String(params.per_page ?? 15));
  if (params.symbol) {
    search.set("symbol", params.symbol);
  }

  return browserBrokerRequest<AccountPosition[]>(
    `${accountHistoryPath(accountId)}?${search.toString()}`,
  );
}

export async function watchOpenPositions(
  accountId: string,
): Promise<BrokerSuccessResponse<OpenPositionsWatchResponse>> {
  return browserBrokerRequest<OpenPositionsWatchResponse>(
    accountWatchPath(accountId),
    { method: "POST" },
  );
}

export async function heartbeatOpenPositionsWatch(
  accountId: string,
  watchId: string,
): Promise<BrokerSuccessResponse<OpenPositionsWatchResponse>> {
  return browserBrokerRequest<OpenPositionsWatchResponse>(
    `${accountWatchPath(accountId)}/heartbeat`,
    {
      method: "POST",
      body: { watch_id: watchId },
    },
  );
}

export async function unwatchOpenPositions(
  accountId: string,
  watchId: string,
): Promise<BrokerSuccessResponse<{ unwatched: boolean }>> {
  return browserBrokerRequest<{ unwatched: boolean }>(
    `${accountWatchPath(accountId)}?watch_id=${encodeURIComponent(watchId)}`,
    { method: "DELETE" },
  );
}

export async function openPosition(
  accountId: string,
  input: OpenPositionInput,
): Promise<BrokerSuccessResponse<{ opened: boolean }>> {
  return browserBrokerRequest<{ opened: boolean }>(
    accountPositionsPath(accountId),
    {
      method: "POST",
      body: input,
    },
  );
}

export async function closePosition(
  accountId: string,
  positionId: string,
  input: ClosePositionInput = {},
): Promise<BrokerSuccessResponse<{ closed: boolean }>> {
  return browserBrokerRequest<{ closed: boolean }>(
    `${accountPositionsPath(accountId)}/${positionId}/close`,
    {
      method: "POST",
      body: input,
    },
  );
}
