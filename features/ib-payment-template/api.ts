import type {
  CreateIbPaymentTemplateInput,
  CreateIbPaymentTemplateLevelInput,
  IbPaymentTemplate,
  IbPaymentTemplateLevel,
  IbPaymentTemplateListFilters,
  UpdateIbPaymentTemplateLevelInput,
} from "@/features/ib-payment-template/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PAYMENT_TEMPLATES_PATH = "v1/admin/ib-payment-templates";

export async function listIbPaymentTemplates(
  filters: IbPaymentTemplateListFilters = {},
): Promise<BrokerSuccessResponse<IbPaymentTemplate[]>> {
  return browserBrokerRequest<IbPaymentTemplate[]>(IB_PAYMENT_TEMPLATES_PATH, {
    searchParams: filters,
  });
}

export async function createIbPaymentTemplate(
  input: CreateIbPaymentTemplateInput,
): Promise<BrokerSuccessResponse<IbPaymentTemplate>> {
  return browserBrokerRequest<IbPaymentTemplate>(IB_PAYMENT_TEMPLATES_PATH, {
    method: "POST",
    body: input,
  });
}

export async function createIbPaymentTemplateLevel(
  ibPaymentTemplateId: string,
  input: CreateIbPaymentTemplateLevelInput,
): Promise<BrokerSuccessResponse<IbPaymentTemplateLevel>> {
  return browserBrokerRequest<IbPaymentTemplateLevel>(
    `${IB_PAYMENT_TEMPLATES_PATH}/${ibPaymentTemplateId}/levels`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function updateIbPaymentTemplateLevel(
  ibPaymentTemplateId: string,
  ibPaymentTemplateLevelId: string,
  input: UpdateIbPaymentTemplateLevelInput,
): Promise<BrokerSuccessResponse<IbPaymentTemplateLevel>> {
  return browserBrokerRequest<IbPaymentTemplateLevel>(
    `${IB_PAYMENT_TEMPLATES_PATH}/${ibPaymentTemplateId}/levels/${ibPaymentTemplateLevelId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteIbPaymentTemplate(
  ibPaymentTemplateId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${IB_PAYMENT_TEMPLATES_PATH}/${ibPaymentTemplateId}`,
    {
      method: "DELETE",
    },
  );
}

export async function deleteIbPaymentTemplateLevel(
  ibPaymentTemplateId: string,
  ibPaymentTemplateLevelId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${IB_PAYMENT_TEMPLATES_PATH}/${ibPaymentTemplateId}/levels/${ibPaymentTemplateLevelId}`,
    {
      method: "DELETE",
    },
  );
}
