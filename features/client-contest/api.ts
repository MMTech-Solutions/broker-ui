import type {
  ClientContestLeaderboardFilters,
  ClientContestLeaderboardMeta,
  ClientContestListFilters,
  ClientEligibleAccount,
  Contest,
  ContestCondition,
  ContestGlobalSettings,
  ContestSubscription,
  SubscribeToContestInput,
} from "@/features/client-contest/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const CONTESTS_PATH = "v1/contests";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listPublicContests(
  filters: ClientContestListFilters = {},
): Promise<BrokerSuccessResponse<Contest[]>> {
  return browserBrokerRequest<Contest[]>(`${CONTESTS_PATH}/public`, {
    searchParams: compactFilters(filters),
  });
}

export async function getPublicContest(
  contestId: string,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(`${CONTESTS_PATH}/public/${contestId}`);
}

export async function listPublicContestConditions(
  contestId: string,
  filters: { per_page?: number } = {},
): Promise<BrokerSuccessResponse<ContestCondition[]>> {
  return browserBrokerRequest<ContestCondition[]>(
    `${CONTESTS_PATH}/public/${contestId}/conditions`,
    {
      searchParams: compactFilters({
        ...filters,
        per_page: filters.per_page ?? 100,
      }),
    },
  );
}

export async function getPublicContestGlobalSettings(): Promise<
  BrokerSuccessResponse<ContestGlobalSettings>
> {
  return browserBrokerRequest<ContestGlobalSettings>(
    `${CONTESTS_PATH}/global-settings/public`,
  );
}

export async function listEligibleAccountsForContest(
  contestId: string,
): Promise<BrokerSuccessResponse<ClientEligibleAccount[]>> {
  return browserBrokerRequest<ClientEligibleAccount[]>(
    `${CONTESTS_PATH}/${contestId}/eligible-accounts`,
  );
}

export async function subscribeToContest(
  contestId: string,
  input: SubscribeToContestInput,
): Promise<BrokerSuccessResponse<ContestSubscription>> {
  return browserBrokerRequest<ContestSubscription>(
    `${CONTESTS_PATH}/${contestId}/subscribe`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function unsubscribeFromContest(
  contestId: string,
): Promise<BrokerSuccessResponse<ContestSubscription>> {
  return browserBrokerRequest<ContestSubscription>(
    `${CONTESTS_PATH}/${contestId}/subscribe`,
    { method: "DELETE" },
  );
}

export async function listContestLeaderboard(
  contestId: string,
  filters: ClientContestLeaderboardFilters = {},
): Promise<BrokerSuccessResponse<ContestSubscription[]>> {
  return browserBrokerRequest<ContestSubscription[]>(
    `${CONTESTS_PATH}/${contestId}/leaderboard`,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function getContestLeaderboardTop(
  contestId: string,
): Promise<BrokerSuccessResponse<ContestSubscription[]>> {
  return browserBrokerRequest<ContestSubscription[]>(
    `${CONTESTS_PATH}/${contestId}/leaderboard/top`,
  );
}
