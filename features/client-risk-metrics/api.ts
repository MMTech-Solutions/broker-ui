import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type {
  CreateSharedRiskMetricInput,
  GetRiskMetricsSummaryParams,
  RiskMetricsHistory,
  RiskMetricsSummary,
  SharedRiskMetric,
  UpdateSharedRiskMetricInput,
} from "@/features/client-risk-metrics/types";

const RISK_METRICS_PATH = "v1/accounts";
const SHARES_PATH = "v1/risk-metrics/shares";

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
  params: {
    metric_key: string;
    from_utc: string;
    to_utc: string;
    granularity?: string;
    sort?: string;
    limit?: number;
  },
): Promise<BrokerSuccessResponse<RiskMetricsHistory>> {
  return browserBrokerRequest<RiskMetricsHistory>(
    `${RISK_METRICS_PATH}/${accountId}/risk-metrics/history`,
    { searchParams: params as Record<string, string | number | boolean> },
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
