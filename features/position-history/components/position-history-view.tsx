"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterXIcon, RefreshCwIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { applyOpenPositionsSnapshot } from "@/features/client-positions/apply-position-snapshot";
import { formatNumber, formatOpenedAt, formatSide } from "@/features/client-positions/format";
import { useTradingStreamPositionsChannel } from "@/features/client-positions/hooks/use-trading-stream-positions-channel";
import type { AccountPosition, OpenPositionsSnapshotPayload } from "@/features/client-positions/types";
import { listGlobalPositions } from "@/features/position-history/api";
import type { GlobalPosition, PositionHistoryFilters } from "@/features/position-history/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const FILTER_KEYS = ["account_id", "account_query", "user_id", "user_name", "user_email", "platform_id", "server_group_id", "environment", "order_id", "symbol", "side", "comment", "opened_at_from", "opened_at_to", "closed_at_from", "closed_at_to", "volume_min", "volume_max", "open_price_min", "open_price_max", "close_price_min", "close_price_max", "sl_min", "sl_max", "tp_min", "tp_max", "swap_min", "swap_max", "profit_min", "profit_max", "broker_granted_commission_min", "broker_granted_commission_max"] as const;
const DEFAULTS: PositionHistoryFilters = { status: "open", page: 1, per_page: 25, sort_by: "opened_at", sort_direction: "desc" };
type PositionsTab = "open" | "closed" | "live";

function fromSearch(search: URLSearchParams): PositionHistoryFilters {
  const result: PositionHistoryFilters = { ...DEFAULTS };
  for (const [key, value] of search.entries()) result[key] = value;
  return result;
}

function historyTab(filters: PositionHistoryFilters): "open" | "closed" {
  return filters.status === "closed" ? "closed" : "open";
}

export function PositionHistoryView() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => fromSearch(search), [search]);
  const [draft, setDraft] = useState<PositionHistoryFilters>(filters);
  const [tab, setTab] = useState<PositionsTab>(() => historyTab(filters));
  const [rows, setRows] = useState<GlobalPosition[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<OpenPositionsSnapshotPayload | null>(null);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedAccount = typeof filters.account_id === "string" && filters.account_id !== "";
  const isLive = tab === "live";

  useEffect(() => {
    queueMicrotask(() => setDraft(filters));
    if (!isLive) queueMicrotask(() => setTab(historyTab(filters)));
  }, [filters, isLive]);

  const replace = useCallback((next: PositionHistoryFilters) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== DEFAULTS[key]) params.set(key, String(value));
    });
    router.replace(params.size ? pathname + "?" + params : pathname);
  }, [pathname, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listGlobalPositions(filters);
      setRows(response.data ?? []);
      setPagination(response.meta.pagination ?? null);
    } catch (cause) {
      setRows([]);
      setPagination(null);
      setError(formatBrokerApiError(cause));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isLive) queueMicrotask(() => void load());
  }, [isLive, load]);

  const liveStatus = useTradingStreamPositionsChannel({
    accountId: selectedAccount ? filters.account_id! : "",
    enabled: isLive && selectedAccount,
    onSnapshot: setLatestSnapshot,
  });
  const liveRows = latestSnapshot ? applyOpenPositionsSnapshot([], latestSnapshot).liveRows : [];

  function apply() {
    setLatestSnapshot(null);
    setTab(historyTab(draft));
    replace({ ...draft, page: 1 });
  }

  function changeHistoryTab(nextTab: "open" | "closed") {
    setLatestSnapshot(null);
    setTab(nextTab);
    replace({ ...filters, status: nextTab, page: 1, sort_by: nextTab === "closed" ? "closed_at" : "opened_at" });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
      <PageContentToolbar breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Positions", current: true }]} backHref="/trading-accounts" backLabel="Back">
        <Button variant="outline" size="sm" onClick={() => replace(DEFAULTS)}><FilterXIcon data-icon="inline-start" />Clear filters</Button>
      </PageContentToolbar>
      <div className="flex flex-wrap gap-2 rounded-xl border p-3">
        {FILTER_KEYS.map((key) => <Input key={key} value={String(draft[key] ?? "")} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} placeholder={key.replaceAll("_", " ")} className="h-8 w-[150px]" />)}
        <Button size="sm" onClick={apply}>Apply filters</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
          <Button size="sm" variant={tab === "open" ? "default" : "ghost"} onClick={() => changeHistoryTab("open")}>Open</Button>
          <Button size="sm" variant={tab === "closed" ? "default" : "ghost"} onClick={() => changeHistoryTab("closed")}>Closed</Button>
          <Button size="sm" disabled={!selectedAccount} variant={isLive ? "default" : "ghost"} title={selectedAccount ? "Show live positions for the selected account." : "Live requires an exact account filter."} onClick={() => { if (selectedAccount) { setLatestSnapshot(null); setError(null); setTab("live"); } }}>Live</Button>
        </div>
        {isLive ? <LiveStatusBadge status={liveStatus} /> : <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}><RefreshCwIcon className={loading ? "animate-spin" : undefined} data-icon="inline-start" />Refresh</Button>}
      </div>
      {!selectedAccount ? <p className="text-sm text-muted-foreground">Live positions require an exact account filter. Open and Closed use the local history.</p> : null}
      {isLive ? <LivePositionsTable rows={liveRows} snapshot={latestSnapshot} /> : <HistoryPositionsTable rows={rows} loading={loading} />}
      {!isLive && error ? <ApiErrorAlert title="Could not load positions" message={error} /> : null}
      {!isLive && pagination ? <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={loading || pagination.current_page <= 1} onClick={() => replace({ ...filters, page: pagination.current_page - 1 })}>Previous</Button><Button size="sm" variant="outline" disabled={loading || pagination.current_page >= pagination.last_page} onClick={() => replace({ ...filters, page: pagination.current_page + 1 })}>Next</Button></div></div> : null}
    </div>
  );
}

function HistoryPositionsTable({ rows, loading }: { rows: GlobalPosition[]; loading: boolean }) {
  return <div className="min-w-0 overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>User</TableHead><TableHead>Account</TableHead><TableHead>Platform</TableHead><TableHead>Server group</TableHead><TableHead>Symbol</TableHead><TableHead>Side</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Open</TableHead><TableHead className="text-right">Close</TableHead><TableHead className="text-right">Profit</TableHead><TableHead>Opened</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.order_id ?? row.id}</TableCell><TableCell>{row.user.name || row.user.id}<div className="text-xs text-muted-foreground">{row.user.email}</div></TableCell><TableCell>{row.trading_account.custom_name || row.trading_account.external_trader_id}</TableCell><TableCell>{row.platform.custom_name || row.platform.name || "—"}</TableCell><TableCell>{row.server_group.meta_name || row.server_group.name || "—"}</TableCell><TableCell>{row.symbol}</TableCell><TableCell>{formatSide(row.side)}</TableCell><TableCell className="text-right">{formatNumber(row.volume)}</TableCell><TableCell className="text-right">{formatNumber(row.open_price)}</TableCell><TableCell className="text-right">{formatNumber(row.close_price)}</TableCell><TableCell className="text-right">{formatNumber(row.profit)}</TableCell><TableCell>{formatOpenedAt(row.opened_at)}</TableCell></TableRow>)}{!loading && rows.length === 0 ? <TableRow><TableCell colSpan={12} className="h-24 text-center text-muted-foreground">No positions found.</TableCell></TableRow> : null}</TableBody></Table></div>;
}

function LivePositionsTable({ rows, snapshot }: { rows: AccountPosition[]; snapshot: OpenPositionsSnapshotPayload | null }) {
  return <><div className="min-w-0 overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Symbol</TableHead><TableHead>Side</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Open</TableHead><TableHead className="text-right">Current</TableHead><TableHead className="text-right">SL</TableHead><TableHead className="text-right">TP</TableHead><TableHead className="text-right">Swap</TableHead><TableHead className="text-right">Profit</TableHead><TableHead>Opened</TableHead></TableRow></TableHeader><TableBody>{rows.map((position) => <TableRow key={position.id}><TableCell className="font-mono text-xs">{position.order_id ?? position.id}</TableCell><TableCell>{position.symbol}</TableCell><TableCell>{formatSide(position.side)}</TableCell><TableCell><Badge variant="default">open</Badge></TableCell><TableCell className="text-right">{formatNumber(position.volume)}</TableCell><TableCell className="text-right">{formatNumber(position.open_price)}</TableCell><TableCell className="text-right">{formatNumber(position.current_price)}</TableCell><TableCell className="text-right">{formatNumber(position.sl)}</TableCell><TableCell className="text-right">{formatNumber(position.tp)}</TableCell><TableCell className="text-right">{formatNumber(position.swap)}</TableCell><TableCell className="text-right">{formatNumber(position.profit)}</TableCell><TableCell>{formatOpenedAt(position.opened_at)}</TableCell></TableRow>)}{rows.length === 0 ? <TableRow><TableCell colSpan={12} className="h-24 text-center text-muted-foreground">Waiting for the live positions snapshot.</TableCell></TableRow> : null}</TableBody></Table></div>{snapshot ? <p className="text-sm text-muted-foreground">{snapshot.positions_count} live positions · P&amp;L <span className={snapshot.total_profit >= 0 ? "text-emerald-600" : "text-destructive"}>{formatNumber(snapshot.total_profit, 2)}</span>{" · "}snapshot {formatOpenedAt(snapshot.snapshot_at)}</p> : null}</>;
}

function LiveStatusBadge({ status }: { status: "idle" | "connecting" | "connected" | "unavailable" | "error" }) {
  if (status === "connected") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700"><WifiIcon className="size-3" />Live</span>;
  if (status === "connecting" || status === "idle") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700"><WifiIcon className="size-3 animate-pulse" />Connecting…</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"><WifiOffIcon className="size-3" />Live unavailable</span>;
}
