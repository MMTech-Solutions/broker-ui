"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getIbPlanSubscriptionFormSubmission } from "@/features/ib-plan-subscription/api";
import { JwfSubmissionReadonly } from "@/features/ib-plan-subscription/components/jwf-submission-readonly";
import type { IbPlanSubscription, IbPlanSubscriptionFormSubmission } from "@/features/ib-plan-subscription/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type Props = {
  subscription: IbPlanSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function IbPlanSubscriptionFormSubmissionDialog({
  subscription,
  open,
  onOpenChange,
}: Props) {
  const [submission, setSubmission] = useState<IbPlanSubscriptionFormSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription?.has_form_submission) {
      setSubmission(null);
      setError(null);
      return;
    }

    setSubmission(null);
    setError(null);
    void getIbPlanSubscriptionFormSubmission(subscription.ib_plan_id, subscription.id)
      .then((response) => setSubmission(response.data))
      .catch((loadError) => setError(formatBrokerApiError(loadError)));
  }, [open, subscription]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-0 min-w-0 flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Formulario enviado</DialogTitle>
          <DialogDescription>
            Detalles de las respuestas enviadas en la solicitud de suscripción.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto py-4">
          {error ? <ApiErrorAlert title="No se pudo cargar el formulario" message={error} /> : null}
          {!submission && !error ? (
            <p className="text-sm text-muted-foreground">Cargando formulario...</p>
          ) : null}
          {submission ? <JwfSubmissionReadonly submission={submission} /> : null}
        </div>
        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
