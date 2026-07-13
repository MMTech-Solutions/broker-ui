"use client";

import { useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HtmlContent } from "@/features/client-ib/components/html-content";
import {
  clientIbPlanSubscriptionTypeLabel,
  clientIbSubscriptionStatusLabel,
  clientIbSubscriptionStatusVariant,
} from "@/features/client-ib/format";
import type { ClientIbPlan } from "@/features/client-ib/types";
import type { IbPlanSubscription } from "@/features/ib-plan-subscription/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientIbPlanCardProps = {
  plan: ClientIbPlan;
  mySubscription: IbPlanSubscription | null;
  subscribingPlanId: string | null;
  onSubscribe: (planId: string) => Promise<void>;
};

export function ClientIbPlanCard({
  plan,
  mySubscription,
  subscribingPlanId,
  onSubscribe,
}: ClientIbPlanCardProps) {
  const [error, setError] = useState<string | null>(null);

  const isThisPlan = mySubscription?.ib_plan_id === plan.id;
  const hasOpenSubscription =
    mySubscription !== null &&
    (mySubscription.status === "active" || mySubscription.status === "pending");
  const isOpenOnThisPlan = hasOpenSubscription && isThisPlan;
  const isOpenElsewhere = hasOpenSubscription && !isThisPlan;

  // Cuando la suscripción ya fue aprobada o está en aprobación,
  // no mostramos en las cards el resumen de "programas IB" del plan.
  const hideProgramsMeta = mySubscription?.status === "active" || mySubscription?.status === "pending";

  const isRestricted = plan.subscription_type === "restricted";
  const isManual = plan.subscription_type === "manual";

  const showStatus = isThisPlan && mySubscription !== null;
  const canSubscribe = !isRestricted && !isOpenElsewhere && !isOpenOnThisPlan;

  const subscribeDisabledReason = isRestricted
    ? "Este plan solo está disponible por invitación del broker."
    : isOpenElsewhere
      ? "Ya tienes una solicitud o suscripción activa en otro plan."
      : isOpenOnThisPlan && mySubscription?.status === "pending"
        ? "Tu solicitud está en revisión."
        : isOpenOnThisPlan && mySubscription?.status === "active"
          ? "Ya estás suscrito a este plan."
          : null;

  async function handleSubscribe() {
    setError(null);

    try {
      await onSubscribe(plan.id);
    } catch (subscribeError) {
      setError(formatBrokerApiError(subscribeError));
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {clientIbPlanSubscriptionTypeLabel(plan.subscription_type)}
            </CardDescription>
          </div>
          {showStatus && mySubscription ? (
            <Badge variant={clientIbSubscriptionStatusVariant(mySubscription.status)}>
              {clientIbSubscriptionStatusLabel(mySubscription.status)}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {error ? (
          <ApiErrorAlert title="No se pudo suscribir" message={error} />
        ) : null}

        <HtmlContent html={plan.description} />

        {isThisPlan && mySubscription?.status === "denied" && mySubscription.comments ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">Motivo del rechazo</p>
            <p className="mt-1 text-muted-foreground">{mySubscription.comments}</p>
          </div>
        ) : null}

        {isThisPlan && mySubscription?.status === "pending" ? (
          <p className="text-sm text-muted-foreground">
            Tu solicitud fue enviada y está pendiente de aprobación por el equipo
            del broker.
          </p>
        ) : null}

        {isManual && !showStatus ? (
          <p className="text-sm text-muted-foreground">
            Al solicitar la suscripción, un administrador revisará tu perfil antes
            de activarte en el plan.
          </p>
        ) : null}

        {plan.subscription_type === "automatic" && !showStatus ? (
          <p className="text-sm text-muted-foreground">
            Al suscribirte, tu cuenta se activará de inmediato en el programa
            inicial del plan.
          </p>
        ) : null}

        {!hideProgramsMeta && (plan.programs?.length ?? 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            {plan.programs?.length} programa(s) de escalamiento disponibles.
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2">
        {canSubscribe ? (
          <Button
            type="button"
            disabled={subscribingPlanId === plan.id}
            onClick={() => void handleSubscribe()}
          >
            {subscribingPlanId === plan.id
              ? "Procesando..."
              : isManual
                ? "Solicitar suscripción"
                : "Suscribirme al plan"}
          </Button>
        ) : subscribeDisabledReason ? (
          <p className="text-sm text-muted-foreground">{subscribeDisabledReason}</p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
