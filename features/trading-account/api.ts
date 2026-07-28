import type {
  TradingAccount,
  TradingAccountListFilters,
  UpdateTradingAccountInput,
} from "@/features/trading-account/types";
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
