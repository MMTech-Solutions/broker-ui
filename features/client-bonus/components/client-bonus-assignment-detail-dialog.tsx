"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getClientBonusAssignment } from "@/features/client-bonus/api";
import {
  clientBonusAssignmentStatusLabel,
  clientBonusAssignmentStatusVariant,
  formatBonusDateTime,
  formatBonusMajorAmount,
  formatOfferRewardSummary,
  formatOfferTypeLabel,
  getConversionProgress,
  getOfferTermsSummary,
} from "@/features/client-bonus/format";
import type { BonusAssignment } from "@/features/client-bonus/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientBonusAssignmentDetailDialogProps = {
  assignmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountLabel?: string;
};

export function ClientBonusAssignmentDetailDialog({
  assignmentId,
  open,
  onOpenChange,
  accountLabel,
}: ClientBonusAssignmentDetailDialogProps) {
  const [assignment, setAssignment] = useState<BonusAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !assignmentId) {
      return;
    }

    let cancelled = false;

    async function loadAssignment() {
      setLoading(true);
      setError(null);

      try {
        const response = await getClientBonusAssignment(assignmentId);
        if (!cancelled) {
          setAssignment(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setAssignment(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, open]);

  const progress = assignment ? getConversionProgress(assignment) : null;
  const offer = assignment?.bonus_offer;
  const terms = offer ? getOfferTermsSummary(offer) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Detalle del bono</DialogTitle>
          <DialogDescription>
            Estado, progreso de conversión y condiciones del bono asignado.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
          {error ? (
            <ApiErrorAlert
              title="No se pudo cargar el bono"
              message={error}
            />
          ) : null}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`detail-skeleton-${index}`} className="h-8 w-full" />
              ))}
            </div>
          ) : null}

          {!loading && assignment ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={clientBonusAssignmentStatusVariant(assignment.status)}>
                  {clientBonusAssignmentStatusLabel(assignment.status)}
                </Badge>
                {offer ? (
                  <Badge variant="outline">{formatOfferTypeLabel(offer.type)}</Badge>
                ) : null}
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Oferta</dt>
                  <dd className="font-medium">{offer?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cuenta</dt>
                  <dd className="font-medium">{accountLabel ?? assignment.account_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Crédito acreditado</dt>
                  <dd className="font-medium tabular-nums">
                    {formatBonusMajorAmount(
                      assignment.credited_amount,
                      assignment.currency_precision ?? 2,
                    )}
                  </dd>
                </div>
                {offer ? (
                  <div>
                    <dt className="text-muted-foreground">Recompensa de la oferta</dt>
                    <dd>{formatOfferRewardSummary(offer)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Activado</dt>
                  <dd>{formatBonusDateTime(assignment.activated_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Fecha límite de conversión
                  </dt>
                  <dd>{formatBonusDateTime(assignment.conversion_deadline_at)}</dd>
                </div>
              </dl>

              {assignment.status === "queued" ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  Este bono está en cola y se activará automáticamente cuando la
                  cuenta no tenga otro bono activo y mantenga saldo positivo.
                </p>
              ) : null}

              {assignment.status === "active" && progress ? (
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progreso de conversión</span>
                    <span className="tabular-nums text-muted-foreground">
                      {progress.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Actividad acumulada:{" "}
                    {progress.accumulatedActivity.toFixed(2)} /{" "}
                    {progress.requiredActivity.toFixed(2)}
                  </p>
                </div>
              ) : null}

              {terms.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Condiciones</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
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
