"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCwIcon, WifiIcon, WifiOffIcon } from "lucide-react";

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
import { applyOpenPositionsSnapshot } from "@/features/client-positions/apply-position-snapshot";
import { useTradingStreamPositionsChannel } from "@/features/client-positions/hooks/use-trading-stream-positions-channel";
import type { OpenPositionsSnapshotPayload } from "@/features/client-positions/types";
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

type PositionsTab = "open" | "closed" | "live";

const TABLE_COLUMN_COUNT = 12;

export function TradingAccountPositionsDialog({
  account,
  open,
  onOpenChange,
}: TradingAccountPositionsDialogProps) {
  const [tab, setTab] = useState<PositionsTab>("open");
  const [rows, setRows] = useState<AccountPosition[]>([]);
  const [latestSnapshot, setLatestSnapshot] =
    useState<OpenPositionsSnapshotPayload | null>(null);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountId = account?.id ?? null;
  const isHistoryTab = tab === "open" || tab === "closed";
  const traderLabel =
    account?.custom_name?.trim() ||
    account?.external_trader_id ||
    "Trading account";

  const fetchPositions = useCallback(
    async (showLoader: boolean, pageToLoad: number) => {
      if (!accountId || tab === "live") {
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
          status: tab,
          page: pageToLoad,
          per_page: 15,
          sort_by: tab === "closed" ? "closed_at" : "opened_at",
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
    [accountId, tab],
  );

  const handleSnapshot = useCallback((payload: OpenPositionsSnapshotPayload) => {
    setLatestSnapshot(payload);
  }, []);

  const liveStatus = useTradingStreamPositionsChannel({
    accountId: accountId ?? "",
    enabled: open && Boolean(accountId) && tab === "live",
    onSnapshot: handleSnapshot,
  });

  const liveRows = latestSnapshot
    ? applyOpenPositionsSnapshot([], latestSnapshot).liveRows
    : [];

  useEffect(() => {
    if (!open || !accountId || !isHistoryTab) {
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
  }, [accountId, fetchPositions, isHistoryTab, open, page]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setTab("open");
      setPage(1);
      setRows([]);
      setLatestSnapshot(null);
      setPagination(null);
      setError(null);
    }
  }

  function changeTab(next: PositionsTab) {
    if (next === tab) {
      return;
    }

    setTab(next);
    setPage(1);
    setRows([]);
    setLatestSnapshot(null);
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
                onClick={() => changeTab("open")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === "open"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => changeTab("closed")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === "closed"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed
              </button>
              <button
                type="button"
                onClick={() => changeTab("live")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === "live"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live
              </button>
            </div>

            {tab === "live" ? (
              <LiveStatusBadge status={liveStatus} />
            ) : (
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
            )}
          </div>

          {isHistoryTab && error ? (
            <ApiErrorAlert title="Could not load positions" message={error} />
          ) : null}

          {tab === "live" && latestSnapshot ? (
            <p className="text-sm text-muted-foreground">
              {latestSnapshot.positions_count} live positions · P&amp;L{" "}
              <span
                className={
                  latestSnapshot.total_profit >= 0
                    ? "text-emerald-600"
                    : "text-destructive"
                }
              >
                {formatNumber(latestSnapshot.total_profit, 2)}
              </span>
              {" · "}snapshot {formatOpenedAt(latestSnapshot.snapshot_at)}
            </p>
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
                  {tab === "closed" ? (
                    <TableHead className="text-right">Close</TableHead>
                  ) : null}
                  {tab === "live" ? (
                    <TableHead className="text-right">Current</TableHead>
                  ) : null}
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">TP</TableHead>
                  <TableHead className="text-right">Swap</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isHistoryTab && loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={TABLE_COLUMN_COUNT}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {isHistoryTab && !loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No {tab} positions found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {tab === "live" && liveRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Waiting for the live positions snapshot.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && isHistoryTab
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
                              (position.status ?? tab) === "open"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {position.status ?? tab}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.volume)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.open_price)}
                        </TableCell>
                        {tab === "closed" ? (
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
                {tab === "live"
                  ? liveRows.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-mono text-xs">
                          {position.order_id ?? position.id}
                        </TableCell>
                        <TableCell>{position.symbol}</TableCell>
                        <TableCell>{formatSide(position.side)}</TableCell>
                        <TableCell>
                          <Badge variant="default">open</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.volume)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.open_price)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(position.current_price)}
                        </TableCell>
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

          {isHistoryTab && pagination && pagination.last_page > 1 ? (
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

function LiveStatusBadge({
  status,
}: {
  status: "idle" | "connecting" | "connected" | "unavailable" | "error";
}) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
        <WifiIcon className="size-3" />
        Live
      </span>
    );
  }

  if (status === "connecting" || status === "idle") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700">
        <WifiIcon className="size-3 animate-pulse" />
        Connecting…
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <WifiOffIcon className="size-3" />
      Live unavailable
    </span>
  );
}
