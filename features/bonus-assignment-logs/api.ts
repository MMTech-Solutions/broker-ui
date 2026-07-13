import type {
  BonusAssignment,
  BonusAssignmentListFilters,
} from "@/features/bonus-assignment-logs/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const BONUS_ASSIGNMENTS_PATH = "v1/admin/bonus-assignments";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listBonusAssignments(
  filters: BonusAssignmentListFilters = {},
): Promise<BrokerSuccessResponse<BonusAssignment[]>> {
  return browserBrokerRequest<BonusAssignment[]>(BONUS_ASSIGNMENTS_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function getBonusAssignment(
  bonusAssignmentId: string,
): Promise<BrokerSuccessResponse<BonusAssignment>> {
  return browserBrokerRequest<BonusAssignment>(
    `${BONUS_ASSIGNMENTS_PATH}/${bonusAssignmentId}`,
  );
}
