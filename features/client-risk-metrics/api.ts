import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type {
  CreateSharedRiskMetricInput,
  GetAnalyticsOverviewParams,
  GetRiskMetricsHistoryParams,
  GetRiskMetricsSummaryParams,
  AnalyticsOverview,
  RiskMetricsHistory,
  RiskMetricsSummary,
  SharedRiskMetric,
  UpdateSharedRiskMetricInput,
} from "@/features/client-risk-metrics/types";

const RISK_METRICS_PATH = "v1/accounts";
const SHARES_PATH = "v1/risk-metrics/shares";
const PUBLIC_SHARES_PATH = "v1/public/risk-metrics/shares";

export async function getPublicRiskMetricsSummary(
  shareUuid: string,
  params: GetRiskMetricsSummaryParams = {},
): Promise<BrokerSuccessResponse<RiskMetricsSummary>> {
  return browserBrokerRequest<RiskMetricsSummary>(
    `${PUBLIC_SHARES_PATH}/${shareUuid}/summary`,
    { searchParams: params as Record<string, string | number | boolean> },
  );
}

export async function getPublicRiskMetricsHistory(
  shareUuid: string,
  params: GetRiskMetricsHistoryParams,
): Promise<BrokerSuccessResponse<RiskMetricsHistory>> {
  return browserBrokerRequest<RiskMetricsHistory>(
    `${PUBLIC_SHARES_PATH}/${shareUuid}/history`,
    { searchParams: params as Record<string, string | number | boolean> },
  );
}

export async function getAccountRiskMetricsSummary(
  accountId: string,
  params: GetRiskMetricsSummaryParams = {},
): Promise<BrokerSuccessResponse<RiskMetricsSummary>> {
  return browserBrokerRequest<RiskMetricsSummary>(
    `${RISK_METRICS_PATH}/${accountId}/risk-metrics/summary`,
    { searchParams: params as Record<string, string | number | boolean> },
  );
}

export async function getAccountRiskMetricsHistory(
  accountId: string,
  params: GetRiskMetricsHistoryParams,
): Promise<BrokerSuccessResponse<RiskMetricsHistory>> {
  return browserBrokerRequest<RiskMetricsHistory>(
    `${RISK_METRICS_PATH}/${accountId}/risk-metrics/history`,
    { searchParams: params as Record<string, string | number | boolean> },
  );
}

const analyticsOverviewInflight = new Map<
  string,
  Promise<BrokerSuccessResponse<AnalyticsOverview>>
>();

function analyticsOverviewRequestKey(
  accountId: string,
  params: GetAnalyticsOverviewParams,
): string {
  return JSON.stringify({ accountId, ...params });
}

function toSearchParams(
  params: GetAnalyticsOverviewParams,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function getAccountAnalyticsOverview(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsOverview>> {
  const key = analyticsOverviewRequestKey(accountId, params);
  const existing = analyticsOverviewInflight.get(key);

  if (existing) {
    return existing;
  }

  const request = browserBrokerRequest<AnalyticsOverview>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/overview`,
    { searchParams: toSearchParams(params) },
  ).finally(() => {
    analyticsOverviewInflight.delete(key);
  });

  analyticsOverviewInflight.set(key, request);

  return request;
}

export async function getAccountRiskMetricShare(
  accountId: string,
): Promise<BrokerSuccessResponse<SharedRiskMetric | null>> {
  return browserBrokerRequest<SharedRiskMetric | null>(
    `${RISK_METRICS_PATH}/${accountId}/risk-metrics/share`,
  );
}

export async function createRiskMetricShare(
  input: CreateSharedRiskMetricInput,
): Promise<BrokerSuccessResponse<SharedRiskMetric>> {
  return browserBrokerRequest<SharedRiskMetric>(SHARES_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateRiskMetricShare(
  shareUuid: string,
  input: UpdateSharedRiskMetricInput,
): Promise<BrokerSuccessResponse<SharedRiskMetric>> {
  return browserBrokerRequest<SharedRiskMetric>(`${SHARES_PATH}/${shareUuid}`, {
    method: "PATCH",
    body: input,
  });
}
