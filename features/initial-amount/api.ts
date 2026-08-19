import type {
  CreateInitialAmountInput,
  InitialAmount,
  InitialAmountListFilters,
  SyncInitialAmountServerGroupsInput,
  UpdateInitialAmountInput,
} from "@/features/initial-amount/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

/** Shared read catalog for authenticated client sessions (`GET /v1/initial-amounts`). */
const INITIAL_AMOUNTS_PATH = "v1/initial-amounts";
/** Admin list + mutations (`/v1/admin/initial-amounts`). */
const INITIAL_AMOUNTS_ADMIN_PATH = "v1/admin/initial-amounts";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as URLSearchParams | Record<string, string | number | boolean>;
}

/** Client-area catalog (uses client session / customer_app surface). */
export async function listClientInitialAmounts(
  filters: InitialAmountListFilters = {},
): Promise<BrokerSuccessResponse<InitialAmount[]>> {
  return browserBrokerRequest<InitialAmount[]>(INITIAL_AMOUNTS_PATH, {
    searchParams: compactFilters(filters),
  });
}

/** Admin-area list (uses admin session / admin_panel surface). */
export async function listInitialAmounts(
  filters: InitialAmountListFilters = {},
): Promise<BrokerSuccessResponse<InitialAmount[]>> {
  return browserBrokerRequest<InitialAmount[]>(INITIAL_AMOUNTS_ADMIN_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function getInitialAmount(
  initialAmountId: string,
): Promise<BrokerSuccessResponse<InitialAmount>> {
  return browserBrokerRequest<InitialAmount>(
    `${INITIAL_AMOUNTS_ADMIN_PATH}/${initialAmountId}`,
  );
}

export async function createInitialAmount(
  input: CreateInitialAmountInput,
): Promise<BrokerSuccessResponse<InitialAmount>> {
  return browserBrokerRequest<InitialAmount>(INITIAL_AMOUNTS_ADMIN_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateInitialAmount(
  initialAmountId: string,
  input: UpdateInitialAmountInput,
): Promise<BrokerSuccessResponse<InitialAmount>> {
  return browserBrokerRequest<InitialAmount>(
    `${INITIAL_AMOUNTS_ADMIN_PATH}/${initialAmountId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function deleteInitialAmount(
  initialAmountId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${INITIAL_AMOUNTS_ADMIN_PATH}/${initialAmountId}`,
    {
      method: "DELETE",
    },
  );
}

export async function syncInitialAmountServerGroups(
  initialAmountId: string,
  serverGroupIds: string[],
): Promise<BrokerSuccessResponse<InitialAmount>> {
  const body: SyncInitialAmountServerGroupsInput = {
    server_group_ids: serverGroupIds,
  };

  return browserBrokerRequest<InitialAmount>(
    `${INITIAL_AMOUNTS_ADMIN_PATH}/${initialAmountId}/server-groups`,
    {
      method: "PATCH",
      body,
    },
  );
}
