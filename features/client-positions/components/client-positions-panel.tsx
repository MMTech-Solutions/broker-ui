"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  closePosition,
  listAccountPositions,
} from "@/features/client-positions/api";
import { OpenPositionDialog } from "@/features/client-positions/components/open-position-dialog";
import {
  formatNumber,
  formatOpenedAt,
  formatSide,
} from "@/features/client-positions/format";
import type { AccountPosition } from "@/features/client-positions/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type ClientPositionsPanelProps = {
  accountId: string;
};

type PositionsFilter = "all" | "open" | "closed";

const TABLE_COLUMN_COUNT = 12;

const emptyStateByFilter: Record<PositionsFilter, string> = {
  all: "No hay posiciones registradas.",
  open: "No hay posiciones abiertas.",
  closed: "No hay posiciones cerradas.",
};

export function ClientPositionsPanel({ accountId }: ClientPositionsPanelProps) {
  const [filter, setFilter] = useState<PositionsFilter>("all");
  const [rows, setRows] = useState<AccountPosition[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPositions = useCallback(
    async (showLoader: boolean, pageToLoad: number) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const response = await listAccountPositions(accountId, {
          status: filter,
          page: pageToLoad,
          per_page: 15,
        });
        setRows(response.data ?? []);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setRows([]);
        setPagination(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId, filter],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void fetchPositions(true, page);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPositions, page]);

  function changeFilter(next: PositionsFilter) {
    if (next === filter) return;

    setFilter(next);
    setPage(1);
    setRows([]);
    setPagination(null);
    setError(null);
    setActionError(null);
  }

  async function handleClose(position: AccountPosition) {
    const platformId = position.order_id ?? position.id;
    setClosingId(platformId);
    setActionError(null);

    try {
      await closePosition(accountId, platformId);
      await fetchPositions(false, page);
    } catch (closeError) {
      setActionError(formatBrokerApiError(closeError));
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
          {([
            ["all", "Todas"],
            ["open", "Abiertas"],
            ["closed", "Cerradas"],
          ] as const).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "ghost"}
              onClick={() => changeFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void fetchPositions(false, page)}
            disabled={loading || refreshing}
            aria-label="Actualizar posiciones"
          >
            <RefreshCwIcon className={refreshing ? "animate-spin" : undefined} />
          </Button>
          <OpenPositionDialog
            accountId={accountId}
            onOpened={() => void fetchPositions(false, page)}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Historial de posiciones almacenado en la base de datos local.
      </p>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar las posiciones"
          message={error}
        />
      ) : null}

      {actionError ? (
        <ApiErrorAlert
          title="No se pudo cerrar la posición"
          message={actionError}
        />
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Volumen</TableHead>
              <TableHead className="text-right">Apertura</TableHead>
              <TableHead className="text-right">Cierre</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">TP</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead>Abierta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="h-24 text-center text-muted-foreground"
                >
                  Cargando posiciones…
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyStateByFilter[filter]}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? rows.map((position) => {
                  const platformId = position.order_id ?? position.id;
                  const isOpen = position.status === "open";

                  return (
                    <TableRow key={`${position.id}-${position.order_id ?? ""}`}>
                      <TableCell className="font-mono text-xs">
                        {platformId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {position.symbol}
                      </TableCell>
                      <TableCell>{formatSide(position.side)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(position.volume, 2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(position.open_price, 5)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(position.close_price, 5)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {position.sl ? formatNumber(position.sl, 5) : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {position.tp ? formatNumber(position.tp, 5) : "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          position.profit >= 0
                            ? "text-emerald-600"
                            : "text-destructive"
                        }`}
                      >
                        {formatNumber(position.profit, 2)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatOpenedAt(position.opened_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isOpen ? "default" : "secondary"}>
                          {position.status ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isOpen ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={closingId === platformId}
                            onClick={() => void handleClose(position)}
                          >
                            {closingId === platformId ? "Cerrando…" : "Cerrar"}
                          </Button>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.current_page} de {pagination.last_page} (
            {pagination.total} en total)
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
              onClick={() =>
                setPage((current) => Math.min(pagination.last_page, current + 1))
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
