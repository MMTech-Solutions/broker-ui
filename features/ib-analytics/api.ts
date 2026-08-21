import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { IbAnalyticsReward, IbAnalyticsRewardFilters, IbAnalyticsSeriesPoint, IbAnalyticsSummary } from "@/features/ib-analytics/types";

function path(audience: "admin" | "client", suffix: string): string {
  return `v1/${audience === "admin" ? "admin/" : ""}ib-analytics/${suffix}`;
}

function toSearchParams(filters: IbAnalyticsRewardFilters & { month?: string; year?: number }): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) value.forEach((status) => params.append("payment_status[]", status));
    else params.set(key, String(value));
  }
  return params;
}

export function getIbAnalyticsSummary(audience: "admin" | "client", beneficiaryId?: string): Promise<BrokerSuccessResponse<IbAnalyticsSummary>> {
  return browserBrokerRequest<IbAnalyticsSummary>(path(audience, "summary"), { searchParams: beneficiaryId ? { beneficiary_id: beneficiaryId } : undefined });
}

export function listIbAnalyticsRewards(audience: "admin" | "client", filters: IbAnalyticsRewardFilters): Promise<BrokerSuccessResponse<IbAnalyticsReward[]>> {
  return browserBrokerRequest<IbAnalyticsReward[]>(path(audience, "rewards"), { searchParams: toSearchParams(filters) });
}

export function getIbAnalyticsMonthly(audience: "admin" | "client", filters: IbAnalyticsRewardFilters & { month: string }): Promise<BrokerSuccessResponse<IbAnalyticsSeriesPoint[]>> {
  return browserBrokerRequest<IbAnalyticsSeriesPoint[]>(path(audience, "rewards/monthly"), { searchParams: toSearchParams(filters) });
}

export function getIbAnalyticsYtd(audience: "admin" | "client", filters: IbAnalyticsRewardFilters & { year: number }): Promise<BrokerSuccessResponse<IbAnalyticsSeriesPoint[]>> {
  return browserBrokerRequest<IbAnalyticsSeriesPoint[]>(path(audience, "rewards/ytd"), { searchParams: toSearchParams(filters) });
}
