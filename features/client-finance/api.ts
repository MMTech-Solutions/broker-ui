import type {
  AccountTransaction,
  AccountTransactionListFilters,
  CreateCreditInput,
  CreateInternalTransferInput,
  InternalTransaction,
  InternalTransferListFilters,
} from "@/features/client-finance/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const FINANCE_PATH = "v1/finance";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listCredits(
  filters: AccountTransactionListFilters = {},
): Promise<BrokerSuccessResponse<AccountTransaction[]>> {
  return browserBrokerRequest<AccountTransaction[]>(
    `${FINANCE_PATH}/credits`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function listDebits(
  filters: AccountTransactionListFilters = {},
): Promise<BrokerSuccessResponse<AccountTransaction[]>> {
  return browserBrokerRequest<AccountTransaction[]>(
    `${FINANCE_PATH}/debits`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function createCredit(
  input: CreateCreditInput,
): Promise<BrokerSuccessResponse<AccountTransaction>> {
  return browserBrokerRequest<AccountTransaction>(
    `${FINANCE_PATH}/credits`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function listInternalTransfers(
  filters: InternalTransferListFilters = {},
): Promise<BrokerSuccessResponse<InternalTransaction[]>> {
  return browserBrokerRequest<InternalTransaction[]>(
    `${FINANCE_PATH}/internal-transfers`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function createInternalTransfer(
  input: CreateInternalTransferInput,
): Promise<BrokerSuccessResponse<InternalTransaction>> {
  return browserBrokerRequest<InternalTransaction>(
    `${FINANCE_PATH}/internal-transfers`,
    {
      method: "POST",
      body: input,
    },
  );
}
