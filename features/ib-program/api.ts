import type {
  CreateIbProgramInput,
  IbProgram,
  IbProgramListFilters,
  UpdateIbProgramInput,
} from "@/features/ib-program/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PROGRAMS_PATH = "v1/admin/ib-programs";

export async function listIbPrograms(
  filters: IbProgramListFilters = {},
): Promise<BrokerSuccessResponse<IbProgram[]>> {
  return browserBrokerRequest<IbProgram[]>(IB_PROGRAMS_PATH, {
    searchParams: filters,
  });
}

export async function createIbProgram(
  input: CreateIbProgramInput,
): Promise<BrokerSuccessResponse<IbProgram>> {
  return browserBrokerRequest<IbProgram>(IB_PROGRAMS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateIbProgram(
  ibProgramId: string,
  input: UpdateIbProgramInput,
): Promise<BrokerSuccessResponse<IbProgram>> {
  return browserBrokerRequest<IbProgram>(`${IB_PROGRAMS_PATH}/${ibProgramId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteIbProgram(
  ibProgramId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${IB_PROGRAMS_PATH}/${ibProgramId}`, {
    method: "DELETE",
  });
}
