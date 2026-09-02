import type {
  ClientIbPlan,
  IbActivePlanContext,
  IbPlanProgressionLog,
  IbPlanProgressionLogListFilters,
  IbSubscriptionFormInput,
  IbSubscriptionFormRuntime,
} from "@/features/client-ib/types";
import { ibPlanImageUrl } from "@/features/ib-plan/image";
import type { IbPlanSubscription } from "@/features/ib-plan-subscription/types";
import { ibProgramImageUrl } from "@/features/ib-program/image";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const IB_PLANS_PATH = "v1/ib-plans";

function withProxyProgramImage<T extends { id: string; image_path?: string | null }>(
  program: T,
): T {
  return {
    ...program,
    image_path: ibProgramImageUrl(program.id, program.image_path),
  };
}

function withProxyClientPlan(plan: ClientIbPlan): ClientIbPlan {
  return {
    ...plan,
    image_path: ibPlanImageUrl(plan.id, plan.image_path),
    programs: plan.programs?.map((assignment) => ({
      ...assignment,
      program: withProxyProgramImage(assignment.program),
    })),
  };
}

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
  const response = await browserBrokerRequest<ClientIbPlan[]>(IB_PLANS_PATH, {
    searchParams: { per_page: 100 },
  });

  return {
    ...response,
    data: response.data.map(withProxyClientPlan),
  };
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
  const response = await browserBrokerRequest<IbActivePlanContext>(
    `${IB_PLANS_PATH}/active`,
  );

  return {
    ...response,
    data: {
      ...response.data,
      program: withProxyProgramImage(response.data.program),
    },
  };
}

export async function subscribeToIbPlan(
  ibPlanId: string,
  formSubmission?: IbSubscriptionFormInput,
): Promise<BrokerSuccessResponse<IbPlanSubscription>> {
  return browserBrokerRequest<IbPlanSubscription>(
    `${IB_PLANS_PATH}/${ibPlanId}/subscriptions`,
    {
      method: "POST",
      body: formSubmission ? { form_submission: formSubmission } : {},
    },
  );
}

export async function getIbPlanSubscriptionForm(
  ibPlanId: string,
): Promise<BrokerSuccessResponse<IbSubscriptionFormRuntime>> {
  return browserBrokerRequest<IbSubscriptionFormRuntime>(
    `${IB_PLANS_PATH}/${ibPlanId}/subscription-form`,
  );
}

export async function listMyIbPlanProgressionLogs(
  ibPlanId: string,
  filters: IbPlanProgressionLogListFilters = {},
): Promise<BrokerSuccessResponse<IbPlanProgressionLog[]>> {
  const response = await browserBrokerRequest<IbPlanProgressionLog[]>(
    `${IB_PLANS_PATH}/${ibPlanId}/progression-logs`,
    {
      searchParams: compactFilters(filters),
    },
  );

  return {
    ...response,
    data: response.data.map((log) => ({
      ...log,
      from_program: log.from_program
        ? withProxyProgramImage(log.from_program)
        : log.from_program,
      to_program: log.to_program
        ? withProxyProgramImage(log.to_program)
        : log.to_program,
    })),
  };
}
