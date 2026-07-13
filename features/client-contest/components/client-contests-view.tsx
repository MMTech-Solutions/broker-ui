"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPublicContests } from "@/features/client-contest/api";
import type { Contest, ContestStatus } from "@/features/client-contest/types";
import {
  formatContestDateRange,
  formatMinorUnits,
  getContestStatusBadgeVariant,
} from "@/features/contest/format";
import { CONTEST_STATUSES } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const clientContestsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "Concursos", current: true },
];

const CLIENT_CONTEST_STATUSES = CONTEST_STATUSES.filter(
  (option) => option.value !== "draft" && option.value !== "cancelled",
);

const statusLabels = Object.fromEntries(
  CONTEST_STATUSES.map((option) => [option.value, option.label]),
) as Record<string, string>;

const statusLabelsEs: Record<ContestStatus, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

export function ClientContestsView() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [status, setStatus] = useState<ContestStatus>("active");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listPublicContests({
        status,
        page,
        per_page: 15,
      });
      setContests(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setContests([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    void loadContests();
  }, [loadContests]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={clientContestsBreadcrumbs}
        backHref="/client"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Filtra por estado y abre un concurso para ver reglas, premios e
            inscribirte.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          <label htmlFor="client-contest-status" className="text-xs font-medium">
            Estado
          </label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as ContestStatus);
              setPage(1);
            }}
          >
            <SelectTrigger id="client-contest-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_CONTEST_STATUSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {statusLabelsEs[option.value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? <ApiErrorAlert message={error} /> : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Calendario</TableHead>
              <TableHead>Cuota</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && contests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No hay concursos publicados con este filtro.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? contests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">{contest.name}</TableCell>
                    <TableCell>
                      <Badge variant={getContestStatusBadgeVariant(contest.status)}>
                        {statusLabelsEs[contest.status] ??
                          statusLabels[contest.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{contest.server_group?.name ?? "—"}</TableCell>
                    <TableCell>
                      {formatContestDateRange(
                        contest.starts_at,
                        contest.ends_at,
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMinorUnits(
                        contest.entry_fee,
                        contest.server_group?.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/client/contests/${contest.id}`} />}
                      >
                        Ver detalle
                        <ArrowRightIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Página {pagination.current_page} de {pagination.last_page} (
            {pagination.total} concursos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
