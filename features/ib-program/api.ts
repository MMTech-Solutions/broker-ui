import type {
  CreateIbProgramInput,
  IbProgram,
  IbProgramListFilters,
  UpdateIbProgramInput,
} from "@/features/ib-program/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PROGRAMS_PATH = "v1/admin/ib-programs";

function appendIbProgramFormData(
  formData: FormData,
  input: CreateIbProgramInput | UpdateIbProgramInput,
): void {
  if (input.name !== undefined) {
    formData.append("name", input.name);
  }

  if (input.description !== undefined) {
    formData.append("description", input.description);
  }

  if (input.settlement_period !== undefined) {
    formData.append("settlement_period", input.settlement_period);
  }

  if (input.is_active !== undefined) {
    formData.append("is_active", input.is_active ? "1" : "0");
  }

  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  if ("remove_image" in input && input.remove_image) {
    formData.append("remove_image", "1");
  }
}

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
  const formData = new FormData();
  appendIbProgramFormData(formData, input);

  return browserBrokerRequest<IbProgram>(IB_PROGRAMS_PATH, {
    method: "POST",
    body: formData,
  });
}

export async function updateIbProgram(
  ibProgramId: string,
  input: UpdateIbProgramInput,
): Promise<BrokerSuccessResponse<IbProgram>> {
  const formData = new FormData();
  appendIbProgramFormData(formData, input);

  return browserBrokerRequest<IbProgram>(
    `${IB_PROGRAMS_PATH}/${ibProgramId}`,
    {
      method: "PATCH",
      body: formData,
    },
  );
}

export async function deleteIbProgram(
  ibProgramId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${IB_PROGRAMS_PATH}/${ibProgramId}`, {
    method: "DELETE",
  });
}
