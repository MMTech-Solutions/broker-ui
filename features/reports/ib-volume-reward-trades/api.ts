import type { IbVolumeRewardTradeDetail, IbVolumeRewardTradeFilters, IbVolumeRewardTradesResponse } from "@/features/reports/ib-volume-reward-trades/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import { BrokerApiError } from "@/lib/api/errors";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const REPORT_PATH = "v1/admin/reports/ib-volume-reward-trades";

export function buildReportSearchParams(filters: IbVolumeRewardTradeFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, item));
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

export async function listIbVolumeRewardTrades(filters: IbVolumeRewardTradeFilters): Promise<IbVolumeRewardTradesResponse> {
  return browserBrokerRequest(REPORT_PATH, { searchParams: buildReportSearchParams(filters) }) as Promise<IbVolumeRewardTradesResponse>;
}

export async function getIbVolumeRewardTradeRewards(positionId: string): Promise<BrokerSuccessResponse<IbVolumeRewardTradeDetail>> {
  return browserBrokerRequest<IbVolumeRewardTradeDetail>(`${REPORT_PATH}/${encodeURIComponent(positionId)}/rewards`);
}

export async function exportIbVolumeRewardTrades(filters: IbVolumeRewardTradeFilters, grain: "trade" | "reward"): Promise<void> {
  const params = buildReportSearchParams(filters);
  params.delete("page");
  params.delete("per_page");
  params.set("grain", grain);
  const response = await fetch(`/api/broker/${REPORT_PATH}/export?${params.toString()}`, {
    headers: { Accept: "text/csv" }, cache: "no-store",
  });

  if (!response.ok) {
    let payload: unknown = null;
    try { payload = await response.json(); } catch { /* Use fallback below. */ }
    throw BrokerApiError.fromResponse(response.status, payload, "Could not export the report.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ib-volume-reward-trades-${grain}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

