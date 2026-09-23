import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

import type {
  IbAnalytics,
  IbAnalyticsOverview,
  IbEarnings,
  IbEarningsDailyTrades,
  IbEarningsGrain,
  IbEarningsPaymentStatus,
  IbEarningsType,
  IbReferralAccounts,
  IbReferralGeo,
  IbReferrals,
} from "@/features/ib-admin-analytics/types";

const IB_ANALYTICS_OVERVIEW_PATH = "v1/admin/reports/ib-analytics/overview";
const IB_ANALYTICS_PATH = "v1/admin/reports/ib-analytics/analytics";
const IB_EARNINGS_PATH = "v1/admin/reports/ib-analytics/earnings";
const IB_REFERRALS_PATH = "v1/admin/reports/ib-analytics/referrals";

export type IbAnalyticsOverviewFilters = {
  ib_user_id: string;
  from: string;
  to: string;
};

export type IbAnalyticsFilters = IbAnalyticsOverviewFilters & {
  currency_code: string;
};

export type IbEarningsRequestFilters = IbAnalyticsFilters & {
  status?: IbEarningsPaymentStatus[];
  type?: IbEarningsType[];
  level?: number;
  symbol_group?: string;
  platform?: string;
  q?: string;
  grain?: IbEarningsGrain;
  cursor?: string;
  limit?: number;
};

export type IbReferralsRequestFilters = IbAnalyticsFilters & {
  parent_id?: string;
  page?: number;
  per_page?: number;
};

export function getIbAnalyticsOverview(
  filters: IbAnalyticsOverviewFilters,
): Promise<BrokerSuccessResponse<IbAnalyticsOverview>> {
  return browserBrokerRequest<IbAnalyticsOverview>(IB_ANALYTICS_OVERVIEW_PATH, {
    searchParams: filters,
  });
}

export function getIbAnalytics(
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbAnalytics>> {
  return browserBrokerRequest<IbAnalytics>(IB_ANALYTICS_PATH, {
    searchParams: filters,
  });
}

function earningsSearchParams(filters: IbEarningsRequestFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set("ib_user_id", filters.ib_user_id);
  params.set("from", filters.from);
  params.set("to", filters.to);
  params.set("currency_code", filters.currency_code);
  filters.status?.forEach((status) => params.append("status[]", status));
  filters.type?.forEach((type) => params.append("type[]", type));
  if (filters.level !== undefined) params.set("level", String(filters.level));
  if (filters.symbol_group) params.set("symbol_group", filters.symbol_group);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.q) params.set("q", filters.q);
  if (filters.grain) params.set("grain", filters.grain);
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.limit) params.set("limit", String(filters.limit));

  return params;
}

export function getIbEarnings(
  filters: IbEarningsRequestFilters,
): Promise<BrokerSuccessResponse<IbEarnings>> {
  return browserBrokerRequest<IbEarnings>(IB_EARNINGS_PATH, {
    searchParams: earningsSearchParams(filters),
  });
}

export function getIbEarningsDailyTrades(
  dailyRowId: string,
  filters: IbEarningsRequestFilters,
): Promise<BrokerSuccessResponse<IbEarningsDailyTrades>> {
  return browserBrokerRequest<IbEarningsDailyTrades>(
    `${IB_EARNINGS_PATH}/daily/${encodeURIComponent(dailyRowId)}/trades`,
    { searchParams: earningsSearchParams(filters) },
  );
}

export function getIbReferrals(
  filters: IbReferralsRequestFilters,
): Promise<BrokerSuccessResponse<IbReferrals>> {
  return browserBrokerRequest<IbReferrals>(IB_REFERRALS_PATH, { searchParams: filters });
}

export function getIbReferralsGeo(
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbReferralGeo>> {
  return browserBrokerRequest<IbReferralGeo>(`${IB_REFERRALS_PATH}/geo`, { searchParams: filters });
}

export function getIbReferralAccounts(
  referralId: string,
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbReferralAccounts>> {
  return browserBrokerRequest<IbReferralAccounts>(
    `${IB_REFERRALS_PATH}/${encodeURIComponent(referralId)}/accounts`,
    { searchParams: filters },
  );
}
