import type {
  TradingAccount,
  TradingAccountListFilters,
  UpdateTradingAccountInput,
} from "@/features/trading-account/types";
import type { AccountPosition } from "@/features/client-positions/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const TRADING_ACCOUNTS_PATH = "v1/admin/accounts";

function toSearchParams(
  filters: TradingAccountListFilters,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listTradingAccounts(
  filters: TradingAccountListFilters = {},
): Promise<BrokerSuccessResponse<TradingAccount[]>> {
  return browserBrokerRequest<TradingAccount[]>(TRADING_ACCOUNTS_PATH, {
    searchParams: toSearchParams(filters),
  });
}

export async function updateTradingAccount(
  accountId: string,
  input: UpdateTradingAccountInput,
): Promise<BrokerSuccessResponse<TradingAccount>> {
  return browserBrokerRequest<TradingAccount>(
    `${TRADING_ACCOUNTS_PATH}/${accountId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export type ListTradingAccountPositionsParams = {
  status?: "open" | "closed";
  page?: number;
  per_page?: number;
  symbol?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
};

export async function listTradingAccountPositions(
  accountId: string,
  params: ListTradingAccountPositionsParams = {},
): Promise<BrokerSuccessResponse<AccountPosition[]>> {
  const searchParams: Record<string, string | number> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 15,
  };

  if (params.status) {
    searchParams.status = params.status;
  }

  if (params.symbol) {
    searchParams.symbol = params.symbol;
  }

  if (params.sort_by) {
    searchParams.sort_by = params.sort_by;
  }

  if (params.sort_direction) {
    searchParams.sort_direction = params.sort_direction;
  }

  return browserBrokerRequest(
    `${TRADING_ACCOUNTS_PATH}/${accountId}/positions`,
    { searchParams },
  );
}
