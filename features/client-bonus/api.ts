import type {
  ClaimBonusOfferInput,
  ClientBonusAssignmentListFilters,
  ClientBonusEligibleAccount,
} from "@/features/client-bonus/types";
import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const BONUS_ASSIGNMENTS_PATH = "v1/bonus-assignments";
const BONUS_OFFERS_PATH = "v1/bonus-offers";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function listAvailableBonusOffers(): Promise<
  BrokerSuccessResponse<BonusOffer[]>
> {
  // Use bonus-assignments path to avoid colliding with admin GET bonus-offers/{uuid}
  // when "available" would match ShowBonusOffer (broker.bonus.manage required).
  return browserBrokerRequest<BonusOffer[]>(
    `${BONUS_ASSIGNMENTS_PATH}/available-offers`,
  );
}

export async function listEligibleAccountsForBonusOffer(
  bonusOfferId: string,
): Promise<BrokerSuccessResponse<ClientBonusEligibleAccount[]>> {
  return browserBrokerRequest<ClientBonusEligibleAccount[]>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/eligible-accounts`,
  );
}

export async function claimBonusOffer(
  bonusOfferId: string,
  input: ClaimBonusOfferInput,
): Promise<BrokerSuccessResponse<BonusAssignment>> {
  return browserBrokerRequest<BonusAssignment>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/claim`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function listClientBonusAssignments(
  filters: ClientBonusAssignmentListFilters = {},
): Promise<BrokerSuccessResponse<BonusAssignment[]>> {
  return browserBrokerRequest<BonusAssignment[]>(BONUS_ASSIGNMENTS_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function getClientBonusAssignment(
  bonusAssignmentId: string,
): Promise<BrokerSuccessResponse<BonusAssignment>> {
  return browserBrokerRequest<BonusAssignment>(
    `${BONUS_ASSIGNMENTS_PATH}/${bonusAssignmentId}`,
  );
}
