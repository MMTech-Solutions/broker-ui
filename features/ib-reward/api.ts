import type { IbReward, IbRewardListFilters } from "@/features/ib-reward/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_REWARDS_PATH = "v1/admin/ib-rewards";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listIbRewards(
  filters: IbRewardListFilters = {},
): Promise<BrokerSuccessResponse<IbReward[]>> {
  return browserBrokerRequest<IbReward[]>(IB_REWARDS_PATH, {
    searchParams: compactFilters(filters),
  });
}
