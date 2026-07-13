import type {
  IbProgramSymbol,
  IbProgramSymbolListFilters,
  SyncIbProgramSymbolsInput,
} from "@/features/ib-program-symbol/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const ibProgramPath = (ibProgramId: string) =>
  `v1/admin/ib-programs/${ibProgramId}`;

export async function listIbProgramSymbols(
  ibProgramId: string,
  filters: IbProgramSymbolListFilters = {},
): Promise<BrokerSuccessResponse<IbProgramSymbol[]>> {
  return browserBrokerRequest<IbProgramSymbol[]>(
    `${ibProgramPath(ibProgramId)}/symbols`,
    { searchParams: filters },
  );
}

export async function syncIbProgramSymbols(
  ibProgramId: string,
  input: SyncIbProgramSymbolsInput,
): Promise<BrokerSuccessResponse<IbProgramSymbol[]>> {
  return browserBrokerRequest<IbProgramSymbol[]>(
    `${ibProgramPath(ibProgramId)}/symbols`,
    { method: "PATCH", body: input },
  );
}

export async function listAllIbProgramSymbols(
  ibProgramId: string,
): Promise<IbProgramSymbol[]> {
  const collected: IbProgramSymbol[] = [];
  let page = 1;

  while (true) {
    const response = await listIbProgramSymbols(ibProgramId, {
      page,
      per_page: 100,
    });

    collected.push(...response.data);

    const pagination = response.meta.pagination;

    if (!pagination || page >= pagination.last_page) {
      break;
    }

    page += 1;
  }

  return collected;
}
