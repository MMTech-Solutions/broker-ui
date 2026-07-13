import type {
  CreateExternalDepositInput,
  CreateInternalTransferInput,
  ExternalTransaction,
  ExternalTransactionListFilters,
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

export async function listExternalDeposits(
  filters: ExternalTransactionListFilters = {},
): Promise<BrokerSuccessResponse<ExternalTransaction[]>> {
  return browserBrokerRequest<ExternalTransaction[]>(
    `${FINANCE_PATH}/external-deposits`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function listExternalWithdrawals(
  filters: ExternalTransactionListFilters = {},
): Promise<BrokerSuccessResponse<ExternalTransaction[]>> {
  return browserBrokerRequest<ExternalTransaction[]>(
    `${FINANCE_PATH}/external-withdrawals`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function createExternalDeposit(
  input: CreateExternalDepositInput,
): Promise<BrokerSuccessResponse<ExternalTransaction>> {
  return browserBrokerRequest<ExternalTransaction>(
    `${FINANCE_PATH}/external-deposits`,
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
