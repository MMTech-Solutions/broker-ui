import type {
  Contest,
  ContestAward,
  ContestCondition,
  ContestGlobalSettings,
  ContestStatus,
  ContestSubscription,
} from "@/features/contest/types";
import type {
  BrokerPaginationMeta,
  BrokerSuccessMeta,
} from "@/lib/api/types/broker-response";

export type ClientContestListFilters = {
  status?: ContestStatus;
  page?: number;
  per_page?: number;
};

export type ClientEligibleAccount = {
  id: string;
  external_trader_id: string;
  server_group_id: string;
  current_balance: number;
};

export type SubscribeToContestInput = {
  account_id: string;
  access_code?: string | null;
};

export type ClientContestLeaderboardFilters = {
  page?: number;
  per_page?: number;
  include_non_ranked?: boolean;
};

export type ClientContestLeaderboardMeta = BrokerSuccessMeta & {
  include_non_ranked?: boolean;
  non_ranked?: {
    data: ContestSubscription[];
    pagination: BrokerPaginationMeta;
  };
};

export type {
  Contest,
  ContestAward,
  ContestCondition,
  ContestGlobalSettings,
  ContestStatus,
  ContestSubscription,
};
