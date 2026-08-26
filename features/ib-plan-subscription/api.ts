import type {
  CreateIbPlanSubscriptionInput,
  IbPlanProgramPlacement,
  IbPlanSubscription,
  IbPlanSubscriptionAdminInteraction,
  IbPlanSubscriptionListFilters,
  UpdateIbPlanProgramPlacementInput,
  UpdateIbPlanSubscriptionInput,
  UpdateIbPlanSubscriptionParametersInput,
} from "@/features/ib-plan-subscription/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

function adminSubscriptionsPath(
  ibPlanId: string,
  subscriptionId?: string,
): string {
  const base = `v1/admin/ib-plans/${ibPlanId}/subscriptions`;

  return subscriptionId ? `${base}/${subscriptionId}` : base;
}

function toSearchParams(
  filters: IbPlanSubscriptionListFilters,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

export async function listIbPlanSubscriptions(
  ibPlanId: string,
  filters: IbPlanSubscriptionListFilters = {},
): Promise<BrokerSuccessResponse<IbPlanSubscription[]>> {
  return browserBrokerRequest<IbPlanSubscription[]>(
    adminSubscriptionsPath(ibPlanId),
    { searchParams: toSearchParams(filters) },
  );
}

export async function listIbPlanSubscriptionAdminInteractions(
  ibPlanId: string,
  subscriptionId: string,
): Promise<BrokerSuccessResponse<IbPlanSubscriptionAdminInteraction[]>> {
  return browserBrokerRequest<IbPlanSubscriptionAdminInteraction[]>(
    `${adminSubscriptionsPath(ibPlanId, subscriptionId)}/admin-interactions`,
    {
      searchParams: {
        per_page: 50,
        sort_by: "created_at",
        sort_direction: "desc",
      },
    },
  );
}

export async function createIbPlanSubscription(
  ibPlanId: string,
  input: CreateIbPlanSubscriptionInput,
): Promise<BrokerSuccessResponse<IbPlanSubscription>> {
  return browserBrokerRequest<IbPlanSubscription>(adminSubscriptionsPath(ibPlanId), {
    method: "POST",
    body: input,
  });
}

export async function updateIbPlanSubscription(
  ibPlanId: string,
  subscriptionId: string,
  input: UpdateIbPlanSubscriptionInput,
): Promise<BrokerSuccessResponse<IbPlanSubscription>> {
  return browserBrokerRequest<IbPlanSubscription>(
    adminSubscriptionsPath(ibPlanId, subscriptionId),
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function updateIbPlanSubscriptionParameters(
  ibPlanId: string,
  subscriptionId: string,
  input: UpdateIbPlanSubscriptionParametersInput,
): Promise<BrokerSuccessResponse<IbPlanSubscription>> {
  return browserBrokerRequest<IbPlanSubscription>(
    `${adminSubscriptionsPath(ibPlanId, subscriptionId)}/parameters`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function updateIbPlanSubscriptionPlacement(
  ibPlanId: string,
  subscriptionId: string,
  input: UpdateIbPlanProgramPlacementInput,
): Promise<BrokerSuccessResponse<IbPlanProgramPlacement>> {
  return browserBrokerRequest<IbPlanProgramPlacement>(
    `${adminSubscriptionsPath(ibPlanId, subscriptionId)}/placement`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
