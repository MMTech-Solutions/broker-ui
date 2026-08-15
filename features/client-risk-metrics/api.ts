import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type {
  AnalyticsBehavior,
  AnalyticsDailyDayTrades,
  AnalyticsDaily,
  AnalyticsDrawdowns,
  AnalyticsDurationScatter,
  AnalyticsEquityCurve,
  AnalyticsOverview,
  AnalyticsPnlDistribution,
  AnalyticsProfitability,
  AnalyticsSessions,
  AnalyticsSymbols,
  AnalyticsTimeHeatmap,
  CreateSharedRiskMetricInput,
  GetAnalyticsEquityCurveParams,
  GetAnalyticsOverviewParams,
  GetRiskMetricsHistoryParams,
  GetRiskMetricsSummaryParams,
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

export async function getAccountAnalyticsEquityCurve(
  accountId: string,
  params: GetAnalyticsEquityCurveParams = {},
): Promise<BrokerSuccessResponse<AnalyticsEquityCurve>> {
  return browserBrokerRequest<AnalyticsEquityCurve>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/equity-curve`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsSymbols(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsSymbols>> {
  return browserBrokerRequest<AnalyticsSymbols>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/symbols`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsProfitability(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsProfitability>> {
  return browserBrokerRequest<AnalyticsProfitability>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/profitability`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsDaily(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsDaily>> {
  return browserBrokerRequest<AnalyticsDaily>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/daily`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsDailyDayTrades(
  accountId: string,
  dateUtc: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsDailyDayTrades>> {
  return browserBrokerRequest<AnalyticsDailyDayTrades>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/daily/${dateUtc}/trades`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsPnlDistribution(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsPnlDistribution>> {
  return browserBrokerRequest<AnalyticsPnlDistribution>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/pnl-distribution`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsSessions(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsSessions>> {
  return browserBrokerRequest<AnalyticsSessions>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/sessions`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsBehavior(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsBehavior>> {
  return browserBrokerRequest<AnalyticsBehavior>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/behavior`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsDrawdowns(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsDrawdowns>> {
  return browserBrokerRequest<AnalyticsDrawdowns>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/drawdowns`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsTimeHeatmap(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsTimeHeatmap>> {
  return browserBrokerRequest<AnalyticsTimeHeatmap>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/time-heatmap`,
    { searchParams: toSearchParams(params) },
  );
}

export async function getAccountAnalyticsDurationScatter(
  accountId: string,
  params: GetAnalyticsOverviewParams = {},
): Promise<BrokerSuccessResponse<AnalyticsDurationScatter>> {
  return browserBrokerRequest<AnalyticsDurationScatter>(
    `${RISK_METRICS_PATH}/${accountId}/analytics/duration-scatter`,
    { searchParams: toSearchParams(params) },
  );
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
