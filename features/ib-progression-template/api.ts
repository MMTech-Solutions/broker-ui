import type {
  CreateIbProgressionTemplateInput,
  IbProgressionTemplate,
  IbProgressionTemplateListFilters,
  UpdateIbProgressionTemplateInput,
} from "@/features/ib-progression-template/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const PATH = "v1/admin/ib-progression-templates";

export function listIbProgressionTemplates(
  filters: IbProgressionTemplateListFilters = {},
): Promise<BrokerSuccessResponse<IbProgressionTemplate[]>> {
  return browserBrokerRequest<IbProgressionTemplate[]>(PATH, { searchParams: filters });
}

export function createIbProgressionTemplate(
  input: CreateIbProgressionTemplateInput,
): Promise<BrokerSuccessResponse<IbProgressionTemplate>> {
  return browserBrokerRequest<IbProgressionTemplate>(PATH, { method: "POST", body: input });
}

export function updateIbProgressionTemplate(
  id: string,
  input: UpdateIbProgressionTemplateInput,
): Promise<BrokerSuccessResponse<IbProgressionTemplate>> {
  return browserBrokerRequest<IbProgressionTemplate>(PATH + "/" + id, { method: "PATCH", body: input });
}

export function deleteIbProgressionTemplate(
  id: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(PATH + "/" + id, { method: "DELETE" });
}
