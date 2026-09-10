import { browserBrokerRequest } from "@/lib/api/browser-client";
import { BrokerApiError } from "@/lib/api/errors";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { PositionReportDetail, PositionReportFilters, PositionsReportResponse } from "@/features/reports/positions/types";

const REPORT_PATH = "v1/admin/reports/positions";

export function buildPositionsReportSearchParams(filters: PositionReportFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => params.append(`${key}[]`, item));
    else params.set(key, String(value));
  });
  return params;
}

export function listPositionsReport(filters: PositionReportFilters): Promise<PositionsReportResponse> {
  return browserBrokerRequest(REPORT_PATH, { searchParams: buildPositionsReportSearchParams(filters) }) as Promise<PositionsReportResponse>;
}

export function getPositionReportDetail(positionId: string, signal?: AbortSignal): Promise<BrokerSuccessResponse<PositionReportDetail>> {
  return browserBrokerRequest<PositionReportDetail>(`${REPORT_PATH}/${encodeURIComponent(positionId)}`, { signal });
}

export async function exportPositionsReport(filters: PositionReportFilters, grain: "trade" | "reward"): Promise<void> {
  const params = buildPositionsReportSearchParams(filters);
  params.delete("page");
  params.delete("per_page");
  params.set("grain", grain);
  const response = await fetch(`/api/broker/${REPORT_PATH}/export?${params.toString()}`, { headers: { Accept: "text/csv" }, cache: "no-store" });
  if (!response.ok) {
    let payload: unknown = null;
    try { payload = await response.json(); } catch { /* Fall back to the generic message. */ }
    throw BrokerApiError.fromResponse(response.status, payload, "Could not export the positions report.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `positions-report-${grain}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
