import type {
  ClientIbPlan,
  IbActivePlanContext,
  IbPlanProgressionLog,
  IbPlanProgressionLogListFilters,
} from "@/features/client-ib/types";
import type { IbPlanSubscription } from "@/features/ib-plan-subscription/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PLANS_PATH = "v1/ib-plans";

function compactFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listClientIbPlans(): Promise<
  BrokerSuccessResponse<ClientIbPlan[]>
> {
  return browserBrokerRequest<ClientIbPlan[]>(IB_PLANS_PATH, {
    searchParams: { per_page: 100 },
  });
}

export async function getMyIbPlanSubscription(): Promise<
  BrokerSuccessResponse<IbPlanSubscription | null>
> {
  const response = await browserBrokerRequest<unknown>(
    `${IB_PLANS_PATH}/subscriptions/mine`,
  );

  // El backend responde `data: []` cuando no existe suscripción.
  if (Array.isArray((response as BrokerSuccessResponse<unknown>).data)) {
    return {
      ...(response as BrokerSuccessResponse<unknown>),
      data: null,
    } as BrokerSuccessResponse<IbPlanSubscription | null>;
  }

  return response as BrokerSuccessResponse<IbPlanSubscription>;
}

export async function getActiveIbPlanContext(): Promise<
  BrokerSuccessResponse<IbActivePlanContext>
> {
  return browserBrokerRequest<IbActivePlanContext>(`${IB_PLANS_PATH}/active`);
}

export async function subscribeToIbPlan(
  ibPlanId: string,
): Promise<BrokerSuccessResponse<IbPlanSubscription>> {
  return browserBrokerRequest<IbPlanSubscription>(
    `${IB_PLANS_PATH}/${ibPlanId}/subscriptions`,
    {
      method: "POST",
      body: {},
    },
  );
}

export async function listMyIbPlanProgressionLogs(
  ibPlanId: string,
  filters: IbPlanProgressionLogListFilters = {},
): Promise<BrokerSuccessResponse<IbPlanProgressionLog[]>> {
  return browserBrokerRequest<IbPlanProgressionLog[]>(
    `${IB_PLANS_PATH}/${ibPlanId}/progression-logs`,
    {
      searchParams: compactFilters(filters),
    },
  );
}
