import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { GlobalPosition, PositionHistoryFilters } from "@/features/position-history/types";

export function listGlobalPositions(filters: PositionHistoryFilters): Promise<BrokerSuccessResponse<GlobalPosition[]>> {
  const searchParams = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")) as Record<string, string | number>;
  return browserBrokerRequest<GlobalPosition[]>("v1/admin/positions", { searchParams });
}
