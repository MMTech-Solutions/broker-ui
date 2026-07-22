import type {
  AdminAssignBonusInput,
  AdminEligibleBonusAccount,
  BonusExcludedInstrument,
  BonusOffer,
  BonusOfferIntroducingBroker,
  BonusOfferListFilters,
  BonusOfferServerGroup,
  CreateBonusOfferInput,
  EligibleIntroducingBroker,
  ListEligibleIntroducingBrokersFilters,
  SyncBonusExcludedInstrumentsInput,
  SyncBonusOfferIntroducingBrokersInput,
  SyncBonusOfferServerGroupsInput,
  DeleteBonusOfferInput,
  UpdateBonusOfferInput,
} from "@/features/bonus-offer/types";
import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import type { BonusOfferTemplate } from "@/features/bonus-offer-template/types";
import { listBonusOfferTemplates as fetchBonusOfferTemplates } from "@/features/bonus-offer-template/api";
import type { Platform } from "@/features/platform/types";
import { listPlatforms } from "@/features/platform/api";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const BONUS_OFFERS_PATH = "v1/admin/bonus-offers";

let cachedFormCatalog: {
  platforms: Platform[];
  templates: BonusOfferTemplate[];
} | null = null;

function toSearchParams(
  filters: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listBonusOffers(
  filters: BonusOfferListFilters = {},
): Promise<BrokerSuccessResponse<BonusOffer[]>> {
  return browserBrokerRequest<BonusOffer[]>(BONUS_OFFERS_PATH, {
    searchParams: toSearchParams(filters),
  });
}

export async function getBonusOffer(
  bonusOfferId: string,
): Promise<BrokerSuccessResponse<BonusOffer>> {
  return browserBrokerRequest<BonusOffer>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}`,
  );
}

export async function createBonusOffer(
  input: CreateBonusOfferInput,
): Promise<BrokerSuccessResponse<BonusOffer>> {
  return browserBrokerRequest<BonusOffer>(BONUS_OFFERS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateBonusOffer(
  bonusOfferId: string,
  input: UpdateBonusOfferInput,
): Promise<BrokerSuccessResponse<BonusOffer>> {
  return browserBrokerRequest<BonusOffer>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteBonusOffer(
  bonusOfferId: string,
  input: DeleteBonusOfferInput,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}`,
    {
      method: "DELETE",
      searchParams: {
        invalidate_assignments: input.invalidate_assignments,
      },
    },
  );
}

export async function syncBonusExcludedInstruments(
  bonusOfferId: string,
  input: SyncBonusExcludedInstrumentsInput,
): Promise<BrokerSuccessResponse<BonusExcludedInstrument[]>> {
  return browserBrokerRequest<BonusExcludedInstrument[]>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/excluded-instruments`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function listEligibleIntroducingBrokers(
  filters: ListEligibleIntroducingBrokersFilters = {},
): Promise<BrokerSuccessResponse<EligibleIntroducingBroker[]>> {
  return browserBrokerRequest<EligibleIntroducingBroker[]>(
    `${BONUS_OFFERS_PATH}/eligible-introducing-brokers`,
    {
      searchParams: toSearchParams(filters),
    },
  );
}

export async function syncBonusOfferIntroducingBrokers(
  bonusOfferId: string,
  input: SyncBonusOfferIntroducingBrokersInput,
): Promise<BrokerSuccessResponse<BonusOfferIntroducingBroker[]>> {
  return browserBrokerRequest<BonusOfferIntroducingBroker[]>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/introducing-brokers`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function syncBonusOfferServerGroups(
  bonusOfferId: string,
  input: SyncBonusOfferServerGroupsInput,
): Promise<BrokerSuccessResponse<BonusOfferServerGroup[]>> {
  return browserBrokerRequest<BonusOfferServerGroup[]>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/server-groups`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function listEligibleAccountsForBonusOfferAdmin(
  bonusOfferId: string,
  externalUserId: string,
): Promise<BrokerSuccessResponse<AdminEligibleBonusAccount[]>> {
  return browserBrokerRequest<AdminEligibleBonusAccount[]>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/eligible-accounts`,
    {
      searchParams: { external_user_id: externalUserId },
    },
  );
}

export async function adminAssignBonus(
  bonusOfferId: string,
  input: AdminAssignBonusInput,
): Promise<BrokerSuccessResponse<BonusAssignment>> {
  return browserBrokerRequest<BonusAssignment>(
    `${BONUS_OFFERS_PATH}/${bonusOfferId}/assignments`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function listBonusOfferTemplates(
  filters: { is_active?: boolean; per_page?: number } = {},
): Promise<BrokerSuccessResponse<BonusOfferTemplate[]>> {
  return fetchBonusOfferTemplates({
    is_active: filters.is_active,
    per_page: filters.per_page ?? 100,
  });
}

export function invalidateBonusOfferFormCatalog(): void {
  cachedFormCatalog = null;
}

export async function loadBonusOfferFormCatalog(): Promise<{
  platforms: Platform[];
  templates: BonusOfferTemplate[];
}> {
  if (cachedFormCatalog) {
    return cachedFormCatalog;
  }

  const [platformsResponse, templatesResponse] = await Promise.all([
    listPlatforms({ per_page: 100 }),
    listBonusOfferTemplates({ is_active: true, per_page: 100 }),
  ]);

  cachedFormCatalog = {
    platforms: platformsResponse.data,
    templates: templatesResponse.data,
  };

  return cachedFormCatalog;
}
