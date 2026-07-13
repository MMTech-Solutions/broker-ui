"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveIbPlanContext,
  getMyIbPlanSubscription,
  listClientIbPlans,
  subscribeToIbPlan,
} from "@/features/client-ib/api";
import { ClientIbPlanCard } from "@/features/client-ib/components/client-ib-plan-card";
import { ClientIbProgressionPanel } from "@/features/client-ib/components/client-ib-progression-panel";
import type {
  ClientIbPlan,
  IbActivePlanContext,
} from "@/features/client-ib/types";
import type { IbPlanSubscription } from "@/features/ib-plan-subscription/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const clientIbBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "IB Dashboard", current: true },
];

export function ClientIbDashboardView() {
  const [plans, setPlans] = useState<ClientIbPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<IbPlanSubscription | null>(
    null,
  );
  const [activeContext, setActiveContext] = useState<IbActivePlanContext | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null,
  );

  const activePlan = useMemo(() => {
    if (!activeContext) {
      return null;
    }

    return (
      plans.find((plan) => plan.id === activeContext.subscription.ib_plan_id) ??
      activeContext.subscription.plan ??
      null
    );
  }, [activeContext, plans]);

  const hidePlansWhenSubscriptionExists =
    mySubscription?.status === "active" || mySubscription?.status === "pending";

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        listClientIbPlans(),
        getMyIbPlanSubscription(),
      ]);

      setPlans(plansResponse.data);
      setMySubscription(subscriptionResponse.data);

      if (subscriptionResponse.data?.status === "active") {
        try {
          const activeResponse = await getActiveIbPlanContext();
          setActiveContext(activeResponse.data);
        } catch {
          setActiveContext(null);
        }
      } else {
        setActiveContext(null);
      }
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setPlans([]);
      setMySubscription(null);
      setActiveContext(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSubscribe(planId: string) {
    setSubscribingPlanId(planId);

    try {
      await subscribeToIbPlan(planId);
      await loadDashboard();
    } finally {
      setSubscribingPlanId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={clientIbBreadcrumbs}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void loadDashboard()}
        >
          <RefreshCwIcon />
          Actualizar
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert
          title="No se pudo cargar el IB Dashboard"
          message={error}
        />
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`ib-plan-skeleton-${index}`} className="h-72 w-full" />
          ))}
        </div>
      ) : null}

      {!loading && activeContext && activePlan ? (
        <ClientIbProgressionPanel
          plan={activePlan as ClientIbPlan}
          activeContext={activeContext}
        />
      ) : null}

      {!loading ? (
        hidePlansWhenSubscriptionExists ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            {mySubscription?.status === "pending"
              ? "Tu solicitud de suscripción está en revisión. Cuando sea aprobada, verás tu progresión."
              : "Tu suscripción está activa. Tu progresión ya se muestra arriba."}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Planes de broker IB</h2>
              <p className="text-sm text-muted-foreground">
                Explora los planes disponibles, revisa sus beneficios y solicita
                tu suscripción.
              </p>
            </div>

            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay planes IB activos disponibles en este momento.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {plans.map((plan) => (
                  <ClientIbPlanCard
                    key={plan.id}
                    plan={plan}
                    mySubscription={mySubscription}
                    subscribingPlanId={subscribingPlanId}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </div>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
