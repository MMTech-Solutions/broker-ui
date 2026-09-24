import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

import type { IbPartnerTier } from "@/features/ib-analytics/partner-tier-types";

export function getIbPartnerTier(
  audience: "admin" | "client",
  ibUserId?: string,
): Promise<BrokerSuccessResponse<IbPartnerTier>> {
  const path = audience === "admin"
    ? "v1/admin/reports/ib-analytics/partner-tier"
    : "v1/ib-analytics/partner-tier";

  return browserBrokerRequest<IbPartnerTier>(path, {
    searchParams: audience === "admin" && ibUserId ? { ib_user_id: ibUserId } : undefined,
  });
}
