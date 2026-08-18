import type {
  TradingAccount,
  TradingAccountListFilters,
  TradingAccountListTotals,
  UpdateTradingAccountInput,
} from "@/features/trading-account/types";
import type { AccountPosition } from "@/features/client-positions/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessMeta, BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const TRADING_ACCOUNTS_PATH = "v1/admin/accounts";

export type TradingAccountListMeta = BrokerSuccessMeta & {
  totals?: TradingAccountListTotals;
};

export type TradingAccountListResponse = BrokerSuccessResponse<TradingAccount[]> & {
  meta: TradingAccountListMeta;
};

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
): Promise<TradingAccountListResponse> {
  const response = await browserBrokerRequest<TradingAccount[]>(
    TRADING_ACCOUNTS_PATH,
    {
      searchParams: toSearchParams(filters),
    },
  );

  return response as TradingAccountListResponse;
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

export type ResetTradingAccountCredentialsInput = {
  reset_password: boolean;
  reset_investor_password: boolean;
  password?: string;
  investor_password?: string;
};

export async function resetTradingAccountCredentials(
  accountId: string,
  input: ResetTradingAccountCredentialsInput,
): Promise<BrokerSuccessResponse<TradingAccount>> {
  const body: Record<string, boolean | string> = {
    reset_password: input.reset_password,
    reset_investor_password: input.reset_investor_password,
  };

  if (input.reset_password && input.password) {
    body.password = input.password;
  }

  if (input.reset_investor_password && input.investor_password) {
    body.investor_password = input.investor_password;
  }

  return browserBrokerRequest<TradingAccount>(
    `${TRADING_ACCOUNTS_PATH}/${accountId}/credentials/reset`,
    {
      method: "POST",
      body,
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
