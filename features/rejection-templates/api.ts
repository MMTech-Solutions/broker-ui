import type {
  CreateRejectionTemplateInput,
  RejectionTemplate,
  RejectionTemplateListFilters,
  UpdateRejectionTemplateInput,
} from "@/features/rejection-templates/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const REJECTION_TEMPLATES_PATH = "v1/admin/rejection-templates";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as URLSearchParams | Record<string, string | number | boolean>;
}

export async function listRejectionTemplates(
  filters: RejectionTemplateListFilters = {},
): Promise<BrokerSuccessResponse<RejectionTemplate[]>> {
  return browserBrokerRequest<RejectionTemplate[]>(REJECTION_TEMPLATES_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function getRejectionTemplate(
  rejectionTemplateId: string,
): Promise<BrokerSuccessResponse<RejectionTemplate>> {
  return browserBrokerRequest<RejectionTemplate>(
    `${REJECTION_TEMPLATES_PATH}/${rejectionTemplateId}`,
  );
}

export async function createRejectionTemplate(
  input: CreateRejectionTemplateInput,
): Promise<BrokerSuccessResponse<RejectionTemplate>> {
  return browserBrokerRequest<RejectionTemplate>(REJECTION_TEMPLATES_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateRejectionTemplate(
  rejectionTemplateId: string,
  input: UpdateRejectionTemplateInput,
): Promise<BrokerSuccessResponse<RejectionTemplate>> {
  return browserBrokerRequest<RejectionTemplate>(
    `${REJECTION_TEMPLATES_PATH}/${rejectionTemplateId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteRejectionTemplate(
  rejectionTemplateId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${REJECTION_TEMPLATES_PATH}/${rejectionTemplateId}`,
    {
      method: "DELETE",
    },
  );
}
