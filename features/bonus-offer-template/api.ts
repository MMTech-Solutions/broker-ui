import type {
  BonusOfferTemplate,
  BonusOfferTemplateExcludedInstrument,
  BonusOfferTemplateListFilters,
  CreateBonusOfferTemplateInput,
  SyncBonusOfferTemplateExcludedInstrumentsInput,
  UpdateBonusOfferTemplateInput,
} from "@/features/bonus-offer-template/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const BONUS_OFFER_TEMPLATES_PATH = "v1/admin/bonus-offer-templates";

function toSearchParams(
  filters: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listBonusOfferTemplates(
  filters: BonusOfferTemplateListFilters = {},
): Promise<BrokerSuccessResponse<BonusOfferTemplate[]>> {
  return browserBrokerRequest<BonusOfferTemplate[]>(
    BONUS_OFFER_TEMPLATES_PATH,
    {
      searchParams: toSearchParams(filters),
    },
  );
}

export async function getBonusOfferTemplate(
  bonusOfferTemplateId: string,
): Promise<BrokerSuccessResponse<BonusOfferTemplate>> {
  return browserBrokerRequest<BonusOfferTemplate>(
    `${BONUS_OFFER_TEMPLATES_PATH}/${bonusOfferTemplateId}`,
  );
}

export async function createBonusOfferTemplate(
  input: CreateBonusOfferTemplateInput,
): Promise<BrokerSuccessResponse<BonusOfferTemplate>> {
  return browserBrokerRequest<BonusOfferTemplate>(BONUS_OFFER_TEMPLATES_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateBonusOfferTemplate(
  bonusOfferTemplateId: string,
  input: UpdateBonusOfferTemplateInput,
): Promise<BrokerSuccessResponse<BonusOfferTemplate>> {
  return browserBrokerRequest<BonusOfferTemplate>(
    `${BONUS_OFFER_TEMPLATES_PATH}/${bonusOfferTemplateId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteBonusOfferTemplate(
  bonusOfferTemplateId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${BONUS_OFFER_TEMPLATES_PATH}/${bonusOfferTemplateId}`,
    {
      method: "DELETE",
    },
  );
}

export async function syncBonusOfferTemplateExcludedInstruments(
  bonusOfferTemplateId: string,
  input: SyncBonusOfferTemplateExcludedInstrumentsInput,
): Promise<BrokerSuccessResponse<BonusOfferTemplateExcludedInstrument[]>> {
  return browserBrokerRequest<BonusOfferTemplateExcludedInstrument[]>(
    `${BONUS_OFFER_TEMPLATES_PATH}/${bonusOfferTemplateId}/excluded-instruments`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
