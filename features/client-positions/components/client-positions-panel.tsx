"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCwIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
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
import { applyOpenPositionsSnapshot } from "@/features/client-positions/apply-position-snapshot";
import { OpenPositionDialog } from "@/features/client-positions/components/open-position-dialog";
import {
  formatNumber,
  formatOpenedAt,
  formatSide,
} from "@/features/client-positions/format";
import { useAccountPositionsChannel } from "@/features/client-positions/hooks/use-account-positions-channel";
import type {
  AccountPosition,
  OpenPositionsSnapshotPayload,
} from "@/features/client-positions/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type ClientPositionsPanelProps = {
  accountId: string;
};

type PositionsFilter = "open" | "closed";

export function ClientPositionsPanel({ accountId }: ClientPositionsPanelProps) {
  const [filter, setFilter] = useState<PositionsFilter>("open");
  const [historyRows, setHistoryRows] = useState<AccountPosition[]>([]);
  const [latestSnapshot, setLatestSnapshot] =
    useState<OpenPositionsSnapshotPayload | null>(null);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOpenFilter = filter === "open";
  const columnCount = isOpenFilter ? 11 : 10;

  const displayRows = useMemo(() => {
    if (!isOpenFilter || !latestSnapshot) {
      return historyRows;
    }

    return applyOpenPositionsSnapshot(historyRows, latestSnapshot).displayRows;
  }, [historyRows, isOpenFilter, latestSnapshot]);

  const handleSnapshot = useCallback((payload: OpenPositionsSnapshotPayload) => {
    setLatestSnapshot(payload);
  }, []);

  const liveStatus = useAccountPositionsChannel({
    accountId,
    enabled: isOpenFilter,
    onSnapshot: handleSnapshot,
  });

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
        setHistoryRows(response.data ?? []);
        setPagination(response.meta.pagination ?? null);
      } catch (err) {
        setError(formatBrokerApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId, filter],
  );

  function changeFilter(next: PositionsFilter) {
    if (next === filter) {
      return;
    }
    setFilter(next);
    setPage(1);
    setLatestSnapshot(null);
    setHistoryRows([]);
    setPagination(null);
    setError(null);
    setActionError(null);
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setLatestSnapshot(null);
      void fetchPositions(true, page);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPositions, page]);

  async function handleClose(position: AccountPosition) {
    const platformId = position.order_id ?? position.id;
    setClosingId(platformId);
    setActionError(null);

    try {
      await closePosition(accountId, platformId);
      await fetchPositions(false, page);
    } catch (err) {
      setActionError(formatBrokerApiError(err));
    } finally {
      setClosingId(null);
    }
  }

  const liveBadge = useMemo(() => {
    if (!isOpenFilter) return null;

    if (liveStatus === "connected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <WifiIcon className="h-3 w-3" />
          Live
        </span>
      );
    }

    if (liveStatus === "connecting") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
          <WifiIcon className="h-3 w-3 animate-pulse" />
          Conectando…
        </span>
      );
    }

    if (liveStatus === "unavailable" || liveStatus === "error") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          <WifiOffIcon className="h-3 w-3" />
          Sin live
        </span>
      );
    }

    return null;
  }, [isOpenFilter, liveStatus]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => changeFilter("open")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isOpenFilter
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posiciones abiertas
          </button>
          <button
            type="button"
            onClick={() => changeFilter("closed")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !isOpenFilter
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posiciones cerradas
          </button>
        </div>
        <div className="flex items-center gap-2">
          {liveBadge}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void fetchPositions(false, page)}
            disabled={loading || refreshing}
            aria-label="Actualizar posiciones"
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          {isOpenFilter ? (
            <OpenPositionDialog
              accountId={accountId}
              onOpened={() => void fetchPositions(false, page)}
            />
          ) : null}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {isOpenFilter
          ? "Histórico local (más reciente primero) y actualización live vía Risk."
          : "Histórico de posiciones cerradas desde la base de datos local."}
      </p>

      {isOpenFilter && latestSnapshot ? (
        <p className="text-xs text-muted-foreground">
          Live: {latestSnapshot.positions_count} posiciones · P&amp;L{" "}
          <span
            className={
              latestSnapshot.total_profit >= 0
                ? "text-emerald-600"
                : "text-destructive"
            }
          >
            {formatNumber(latestSnapshot.total_profit, 2)}
          </span>
          {" · "}
          snapshot {formatOpenedAt(latestSnapshot.snapshot_at)}
        </p>
      ) : null}

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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Símbolo</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Volumen</TableHead>
              <TableHead className="text-right">Apertura</TableHead>
              <TableHead className="text-right">
                {isOpenFilter ? "Actual" : "Cierre"}
              </TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">TP</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead>Abierta</TableHead>
              <TableHead>{isOpenFilter ? "Estado" : "Cierre"}</TableHead>
              {isOpenFilter ? (
                <TableHead className="text-right">Acción</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  Cargando posiciones…
                </TableCell>
              </TableRow>
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {isOpenFilter
                    ? "No hay posiciones abiertas."
                    : "No hay posiciones cerradas."}
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((position) => {
                const rowKey = `${position.id}-${position.order_id ?? ""}`;
                const platformId = position.order_id ?? position.id;
                return (
                  <TableRow key={rowKey}>
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
                      {formatNumber(
                        isOpenFilter
                          ? position.current_price
                          : (position.close_price ?? position.current_price),
                        5,
                      )}
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
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {isOpenFilter
                        ? position.is_live
                          ? "Live"
                          : "Histórico"
                        : formatOpenedAt(position.closed_at)}
                    </TableCell>
                    {isOpenFilter ? (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={closingId === platformId}
                          onClick={() => void handleClose(position)}
                        >
                          {closingId === platformId ? "Cerrando…" : "Cerrar"}
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            )}
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
                setPage((current) =>
                  Math.min(pagination.last_page, current + 1),
                )
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
