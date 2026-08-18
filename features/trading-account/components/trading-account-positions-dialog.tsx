"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountPosition } from "@/features/client-positions/types";
import {
  formatNumber,
  formatOpenedAt,
  formatSide,
} from "@/features/client-positions/format";
import { listTradingAccountPositions } from "@/features/trading-account/api";
import type { TradingAccount } from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type TradingAccountPositionsDialogProps = {
  account: TradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PositionsFilter = "open" | "closed";

const TABLE_COLUMN_COUNT = 12;

export function TradingAccountPositionsDialog({
  account,
  open,
  onOpenChange,
}: TradingAccountPositionsDialogProps) {
  const [filter, setFilter] = useState<PositionsFilter>("open");
  const [rows, setRows] = useState<AccountPosition[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountId = account?.id ?? null;
  const traderLabel =
    account?.custom_name?.trim() ||
    account?.external_trader_id ||
    "Trading account";

  const fetchPositions = useCallback(
    async (showLoader: boolean, pageToLoad: number) => {
      if (!accountId) {
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const response = await listTradingAccountPositions(accountId, {
          status: filter,
          page: pageToLoad,
          per_page: 15,
          sort_by: filter === "closed" ? "closed_at" : "opened_at",
          sort_direction: "desc",
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
    if (!open || !accountId) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      void fetchPositions(true, page);
    });

    return () => {
      cancelled = true;
    };
  }, [accountId, fetchPositions, open, page]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setFilter("open");
      setPage(1);
      setRows([]);
      setPagination(null);
      setError(null);
    }
  }

  function changeFilter(next: PositionsFilter) {
    if (next === filter) {
      return;
    }

    setFilter(next);
    setPage(1);
    setRows([]);
    setPagination(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-6xl">
        <DialogHeader className="gap-1 border-b pb-4">
          <DialogTitle>Account positions</DialogTitle>
          <DialogDescription>
            Positions for {traderLabel}
            {account?.external_trader_id
              ? ` (${account.external_trader_id})`
              : ""}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => changeFilter("open")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "open"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => changeFilter("closed")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "closed"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || refreshing || !accountId}
              onClick={() => void fetchPositions(false, page)}
            >
              <RefreshCwIcon
                className={refreshing ? "animate-spin" : undefined}
                data-icon="inline-start"
              />
              Refresh
            </Button>
          </div>

          {error ? (
            <ApiErrorAlert title="Could not load positions" message={error} />
          ) : null}

          <div className="min-h-0 overflow-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  {filter === "closed" ? (
                    <TableHead className="text-right">Close</TableHead>
                  ) : null}
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">TP</TableHead>
                  <TableHead className="text-right">Swap</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={TABLE_COLUMN_COUNT}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No {filter} positions found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? rows.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-mono text-xs">
                          {position.order_id ?? position.id}
                        </TableCell>
                        <TableCell>{position.symbol}</TableCell>
                        <TableCell>{formatSide(position.side)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              (position.status ?? filter) === "open"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {position.status ?? filter}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.volume)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.open_price)}
                        </TableCell>
                        {filter === "closed" ? (
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(position.close_price)}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.sl)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.tp)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.swap)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.profit)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatOpenedAt(position.opened_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.last_page > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page} (
                {pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
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
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
