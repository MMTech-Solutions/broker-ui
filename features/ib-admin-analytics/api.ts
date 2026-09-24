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

export type IbAnalyticsAudience = "admin" | "client";

function path(audience: IbAnalyticsAudience, suffix: string): string {
  return audience === "admin"
    ? `v1/admin/reports/ib-analytics/${suffix}`
    : `v1/ib-analytics/${suffix}`;
}

export type IbAnalyticsOverviewFilters = {
  ib_user_id?: string;
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
  audience: IbAnalyticsAudience,
  filters: IbAnalyticsOverviewFilters,
): Promise<BrokerSuccessResponse<IbAnalyticsOverview>> {
  return browserBrokerRequest<IbAnalyticsOverview>(path(audience, "overview"), {
    searchParams: filters,
  });
}

export function getIbAnalytics(
  audience: IbAnalyticsAudience,
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbAnalytics>> {
  return browserBrokerRequest<IbAnalytics>(path(audience, "analytics"), {
    searchParams: filters,
  });
}

function earningsSearchParams(filters: IbEarningsRequestFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.ib_user_id) params.set("ib_user_id", filters.ib_user_id);
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
  audience: IbAnalyticsAudience,
  filters: IbEarningsRequestFilters,
): Promise<BrokerSuccessResponse<IbEarnings>> {
  return browserBrokerRequest<IbEarnings>(path(audience, "earnings"), {
    searchParams: earningsSearchParams(filters),
  });
}

export function getIbEarningsDailyTrades(
  audience: IbAnalyticsAudience,
  dailyRowId: string,
  filters: IbEarningsRequestFilters,
): Promise<BrokerSuccessResponse<IbEarningsDailyTrades>> {
  return browserBrokerRequest<IbEarningsDailyTrades>(
    `${path(audience, "earnings")}/daily/${encodeURIComponent(dailyRowId)}/trades`,
    { searchParams: earningsSearchParams(filters) },
  );
}

export function getIbReferrals(
  audience: IbAnalyticsAudience,
  filters: IbReferralsRequestFilters,
): Promise<BrokerSuccessResponse<IbReferrals>> {
  return browserBrokerRequest<IbReferrals>(path(audience, "referrals"), { searchParams: filters });
}

export function getIbReferralsGeo(
  audience: IbAnalyticsAudience,
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbReferralGeo>> {
  return browserBrokerRequest<IbReferralGeo>(`${path(audience, "referrals")}/geo`, { searchParams: filters });
}

export function getIbReferralAccounts(
  audience: IbAnalyticsAudience,
  referralId: string,
  filters: IbAnalyticsFilters,
): Promise<BrokerSuccessResponse<IbReferralAccounts>> {
  return browserBrokerRequest<IbReferralAccounts>(
    `${path(audience, "referrals")}/${encodeURIComponent(referralId)}/accounts`,
    { searchParams: filters },
  );
}
