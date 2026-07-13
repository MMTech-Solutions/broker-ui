import type { TradingAccount } from "@/features/trading-account/types";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";
import type {
  ClientAccountInsurance,
  ClientAccountInsuranceListFilters,
  ClientInsuranceEligibleAccount,
  ContractClientAccountInsuranceInput,
  InsurancePlansForAccount,
} from "@/features/client-insurance/types";
import {
  IN_PROGRESS_INSURANCE_STATUSES,
  type ClientInsurancePlan,
} from "@/features/client-insurance/types";
import { hasContractableInsuranceOptions } from "@/features/client-insurance/format";
import { listClientTradingAccounts } from "@/features/client-trading-account/api";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const INSURANCE_PATH = "v1/insurance";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listClientAccountInsurances(
  filters: ClientAccountInsuranceListFilters = {},
): Promise<BrokerSuccessResponse<ClientAccountInsurance[]>> {
  return browserBrokerRequest<ClientAccountInsurance[]>(
    `${INSURANCE_PATH}/account-insurances`,
    {
      searchParams: compactFilters(
        filters,
      ) as Record<string, string | number | boolean>,
    },
  );
}

export async function listInsurancePlansForAccount(
  accountId: string,
): Promise<BrokerSuccessResponse<InsurancePlansForAccount>> {
  return browserBrokerRequest<InsurancePlansForAccount>(
    `${INSURANCE_PATH}/accounts/${accountId}/plans`,
  );
}

export async function contractClientAccountInsurance(
  input: ContractClientAccountInsuranceInput,
): Promise<BrokerSuccessResponse<ClientAccountInsurance>> {
  return browserBrokerRequest<ClientAccountInsurance>(
    `${INSURANCE_PATH}/account-insurances`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function claimClientAccountInsurance(
  accountInsuranceId: string,
): Promise<BrokerSuccessResponse<ClientAccountInsurance>> {
  return browserBrokerRequest<ClientAccountInsurance>(
    `${INSURANCE_PATH}/account-insurances/${accountInsuranceId}/claim`,
    {
      method: "POST",
      body: {},
    },
  );
}

export async function cancelClientAccountInsurance(
  accountInsuranceId: string,
): Promise<BrokerSuccessResponse<ClientAccountInsurance>> {
  return browserBrokerRequest<ClientAccountInsurance>(
    `${INSURANCE_PATH}/account-insurances/${accountInsuranceId}/cancel`,
    {
      method: "POST",
      body: {},
    },
  );
}

export async function loadAccountsWithInProgressInsurance(): Promise<
  Set<string>
> {
  const insuredAccountIds = new Set<string>();

  for (const status of IN_PROGRESS_INSURANCE_STATUSES) {
    try {
      const response = await listClientAccountInsurances({
        status,
        per_page: 100,
      });

      for (const insurance of response.data) {
        insuredAccountIds.add(insurance.account_id);
      }
    } catch {
      // Ignore individual status load failures.
    }
  }

  return insuredAccountIds;
}

export function isInsuranceCandidateAccount(
  account: TradingAccount,
  environment: number | null | undefined,
  insuredAccountIds: Set<string>,
): boolean {
  return (
    account.is_active &&
    environment === TRADING_SERVER_ENVIRONMENT.LIVE &&
    account.current_balance > 0 &&
    account.margin === 0 &&
    !insuredAccountIds.has(account.id)
  );
}

export async function resolveInsuranceEligibilityForAccount(
  accountId: string,
): Promise<ClientInsurancePlan[] | null> {
  try {
    const response = await listInsurancePlansForAccount(accountId);

    if (!hasContractableInsuranceOptions(response.data)) {
      return null;
    }

    return response.data.plans;
  } catch {
    return null;
  }
}

export async function loadClientInsuranceEligibleAccounts(options?: {
  environmentByAccountId?: Map<string, number | null>;
}): Promise<ClientInsuranceEligibleAccount[]> {
  const [accountsResponse, insuredAccountIds] = await Promise.all([
    listClientTradingAccounts({ per_page: 100 }),
    loadAccountsWithInProgressInsurance(),
  ]);

  const environmentByAccountId = options?.environmentByAccountId ?? new Map();

  const candidates = accountsResponse.data.filter((account) =>
    isInsuranceCandidateAccount(
      account,
      environmentByAccountId.get(account.id) ?? null,
      insuredAccountIds,
    ),
  );

  const eligibilityResults = await Promise.all(
    candidates.map(async (account) => {
      const plans = await resolveInsuranceEligibilityForAccount(account.id);

      if (!plans) {
        return null;
      }

      return {
        id: account.id,
        external_trader_id: account.external_trader_id,
        current_balance: account.current_balance,
        server_group_id: account.server_group_id,
        plans,
      } satisfies ClientInsuranceEligibleAccount;
    }),
  );

  return eligibilityResults.filter(
    (entry): entry is ClientInsuranceEligibleAccount => entry !== null,
  );
}

export async function loadInsuranceEligibleAccountIds(
  accounts: TradingAccount[],
  environmentByAccountId: Map<string, number | null>,
): Promise<Set<string>> {
  const insuredAccountIds = await loadAccountsWithInProgressInsurance();

  const candidates = accounts.filter((account) =>
    isInsuranceCandidateAccount(
      account,
      environmentByAccountId.get(account.id) ?? null,
      insuredAccountIds,
    ),
  );

  const eligibilityResults = await Promise.all(
    candidates.map(async (account) => {
      const plans = await resolveInsuranceEligibilityForAccount(account.id);
      return plans ? account.id : null;
    }),
  );

  return new Set(
    eligibilityResults.filter((id): id is string => id !== null),
  );
}
