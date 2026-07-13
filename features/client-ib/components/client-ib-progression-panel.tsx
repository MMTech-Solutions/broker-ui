"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CircleDotIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listMyIbPlanProgressionLogs } from "@/features/client-ib/api";
import {
  clientIbProgressionDirectionLabel,
  formatIbDateTime,
  formatProgressionVolume,
} from "@/features/client-ib/format";
import type {
  ClientIbPlan,
  IbActivePlanContext,
  IbPlanProgressionLog,
} from "@/features/client-ib/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientIbProgressionPanelProps = {
  plan: ClientIbPlan;
  activeContext: IbActivePlanContext;
};

export function ClientIbProgressionPanel({
  plan,
  activeContext,
}: ClientIbProgressionPanelProps) {
  const [logs, setLogs] = useState<IbPlanProgressionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProgramId = activeContext.placement.ib_program_id;

  const sortedPrograms = useMemo(() => {
    return [...(plan.programs ?? [])].sort(
      (left, right) => left.sort_order - right.sort_order,
    );
  }, [plan.programs]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listMyIbPlanProgressionLogs(plan.id, {
        per_page: 50,
      });
      setLogs(response.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [plan.id]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu progresión en {plan.name}</CardTitle>
        <CardDescription>
          Programa actual:{" "}
          <span className="font-medium text-foreground">
            {activeContext.program.name}
          </span>
          {activeContext.placement.progression_metric_value ? (
            <>
              {" "}
              · volumen acumulado{" "}
              {formatProgressionVolume(
                activeContext.placement.progression_metric_value,
              )}
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Escalera de programas</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedPrograms.map((entry, index) => {
              const isCurrent = entry.program.id === currentProgramId;
              const isPast =
                entry.sort_order <
                (sortedPrograms.find(
                  (item) => item.program.id === currentProgramId,
                )?.sort_order ?? Number.MAX_SAFE_INTEGER);

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-lg border p-4",
                    isCurrent && "border-primary bg-primary/5",
                    isPast && !isCurrent && "opacity-80",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Nivel {index + 1}
                      </p>
                      <p className="font-medium">{entry.program.name}</p>
                    </div>
                    {isCurrent ? (
                      <Badge>Actual</Badge>
                    ) : isPast ? (
                      <Badge variant="secondary">Completado</Badge>
                    ) : (
                      <Badge variant="outline">Siguiente</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Volumen {formatProgressionVolume(entry.progression_min_volume)}{" "}
                    – {formatProgressionVolume(entry.progression_max_volume)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {error ? (
          <ApiErrorAlert
            title="No se pudo cargar el historial de progresión"
            message={error}
          />
        ) : null}

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Historial de movimientos</h3>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Movimiento</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead className="text-right">Volumen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`progression-skeleton-${index}`}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-20 text-center text-muted-foreground"
                    >
                      Aún no hay movimientos registrados en tu escalera.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatIbDateTime(log.evaluated_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ProgressionDirectionIcon direction={log.direction} />
                            <span>
                              {clientIbProgressionDirectionLabel(log.direction)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.from_program?.name ?? "—"}
                        </TableCell>
                        <TableCell>{log.to_program?.name ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatProgressionVolume(log.progression_metric_value)}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressionDirectionIcon({
  direction,
}: {
  direction: IbPlanProgressionLog["direction"];
}) {
  switch (direction) {
    case "up":
      return <ArrowUpIcon className="size-4 text-emerald-600" />;
    case "down":
      return <ArrowDownIcon className="size-4 text-destructive" />;
    default:
      return <CircleDotIcon className="size-4 text-muted-foreground" />;
  }
}
