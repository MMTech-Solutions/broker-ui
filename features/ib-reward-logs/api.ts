import type {
  IbRewardSettlementRun,
  IbRewardSettlementRunListFilters,
  IbTradingAccountPeriodSnapshot,
  IbTradingAccountPeriodSnapshotListFilters,
} from "@/features/ib-reward-logs/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const PERIOD_SNAPSHOTS_PATH = "v1/admin/ib-trading-account-period-snapshots";
const SETTLEMENT_RUNS_PATH = "v1/admin/ib-reward-settlement-runs";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listIbTradingAccountPeriodSnapshots(
  filters: IbTradingAccountPeriodSnapshotListFilters = {},
): Promise<BrokerSuccessResponse<IbTradingAccountPeriodSnapshot[]>> {
  return browserBrokerRequest<IbTradingAccountPeriodSnapshot[]>(
    PERIOD_SNAPSHOTS_PATH,
    {
      searchParams: compactFilters(filters),
    },
  );
}

export async function listIbRewardSettlementRuns(
  filters: IbRewardSettlementRunListFilters = {},
): Promise<BrokerSuccessResponse<IbRewardSettlementRun[]>> {
  return browserBrokerRequest<IbRewardSettlementRun[]>(SETTLEMENT_RUNS_PATH, {
    searchParams: compactFilters(filters),
  });
}
