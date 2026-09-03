"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, DownloadIcon, FilterXIcon, RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { PageNumberPagination } from "@/components/page-number-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listIbPrograms } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import {
  REPORT_FLAGS,
  bookLabel,
  environmentLabel,
  exportIbVolumeRewardTrades,
  formatDuration,
  formatReportDate,
  formatReportMoney,
  formatReportNumber,
  formatReportRatio,
  listIbVolumeRewardTrades,
  reportFlagLabel,
  type IbVolumeRewardTrade,
  type IbVolumeRewardTradeFilters,
  type IbVolumeRewardTradeFlag,
  type IbVolumeRewardTradeSort,
  type IbVolumeRewardTradeTotal,
} from "@/features/reports/ib-volume-reward-trades";
import { RewardLinesDialog } from "@/features/reports/ib-volume-reward-trades/components/reward-lines-dialog";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const DEFAULT_FILTERS: IbVolumeRewardTradeFilters = {
  page: 1,
  per_page: 25,
  sort_by: "closed_at",
  sort_direction: "desc",
};

type FilterDraft = {
  closedAtFrom: string;
  closedAtTo: string;
  q: string;
  platformId: string;
  environment: string;
  serverGroupId: string;
  bookType: string;
  symbol: string;
  side: string;
  programId: string;
  beneficiaryId: string;
  volumeMin: string;
  ratioBucket: string;
  flags: IbVolumeRewardTradeFlag[];
};

const EMPTY_DRAFT: FilterDraft = {
  closedAtFrom: "", closedAtTo: "", q: "", platformId: "", environment: "all",
  serverGroupId: "", bookType: "all", symbol: "", side: "all", programId: "all",
  beneficiaryId: "", volumeMin: "", ratioBucket: "all", flags: [],
};

function timestamp(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
}

function identity(identity: { id: string; name: string | null; email: string | null } | null) {
  if (!identity) return <span>—</span>;
  return (
    <div className="min-w-44">
      <p className="font-medium">{identity.name || identity.id}</p>
      {identity.email ? <p className="text-xs text-muted-foreground">{identity.email}</p> : null}
      <p className="font-mono text-[11px] text-muted-foreground">{identity.id}</p>
    </div>
  );
}

export function IbVolumeRewardTradesReportView() {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [filters, setFilters] = useState<IbVolumeRewardTradeFilters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<IbVolumeRewardTrade[]>([]);
  const [totals, setTotals] = useState<IbVolumeRewardTradeTotal[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [identityPartial, setIdentityPartial] = useState(false);
  const [programs, setPrograms] = useState<IbProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"trade" | "reward" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<IbVolumeRewardTrade | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listIbVolumeRewardTrades(filters);
      setRows(response.data);
      setTotals(response.meta.totals_by_currency ?? []);
      setPagination(response.meta.pagination ?? null);
      setIdentityPartial(response.meta.identity_enrichment_partial === true);
    } catch (cause) {
      setRows([]);
      setTotals([]);
      setPagination(null);
      setIdentityPartial(false);
      setError(formatBrokerApiError(cause));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  useEffect(() => {
    void listIbPrograms({ per_page: 100 }).then((response) => setPrograms(response.data)).catch(() => setPrograms([]));
  }, []);

  function applyFilters() {
    setFilters((current) => ({
      page: 1,
      per_page: current.per_page ?? 25,
      sort_by: current.sort_by ?? "closed_at",
      sort_direction: current.sort_direction ?? "desc",
      closed_at_from: timestamp(draft.closedAtFrom),
      closed_at_to: timestamp(draft.closedAtTo),
      q: draft.q.trim() || undefined,
      platform_id: draft.platformId.trim() || undefined,
      environment: draft.environment === "all" ? undefined : draft.environment,
      server_group_id: draft.serverGroupId.trim() || undefined,
      book_type: draft.bookType === "all" ? undefined : draft.bookType,
      symbol: draft.symbol.trim() || undefined,
      side: draft.side === "all" ? undefined : draft.side,
      ib_program_id: draft.programId === "all" ? undefined : draft.programId,
      beneficiary_id: draft.beneficiaryId.trim() || undefined,
      volume_min: draft.volumeMin.trim() || undefined,
      ratio_bucket: draft.ratioBucket === "all" ? undefined : draft.ratioBucket as IbVolumeRewardTradeFilters["ratio_bucket"],
      flags: draft.flags.length ? draft.flags : undefined,
    }));
  }

  function clearFilters() {
    setDraft(EMPTY_DRAFT);
    setFilters(DEFAULT_FILTERS);
  }

  function sortBy(sort: IbVolumeRewardTradeSort) {
    setFilters((current) => ({
      ...current,
      page: 1,
      sort_by: sort,
      sort_direction: current.sort_by === sort && current.sort_direction === "desc" ? "asc" : "desc",
    }));
  }

  async function download(grain: "trade" | "reward") {
    setExporting(grain);
    setExportError(null);
    try { await exportIbVolumeRewardTrades(filters, grain); }
    catch (cause) { setExportError(formatBrokerApiError(cause)); }
    finally { setExporting(null); }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
      <PageContentToolbar breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "IB reward trades", current: true }]}>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}>
            <RefreshCwIcon className={cn(loading && "animate-spin")} /> Refresh
          </Button>
          <Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => void download("trade")}>
            <DownloadIcon /> {exporting === "trade" ? "Exporting…" : "Trades CSV"}
          </Button>
          <Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => void download("reward")}>
            <DownloadIcon /> {exporting === "reward" ? "Exporting…" : "Rewards CSV"}
          </Button>
        </div>
      </PageContentToolbar>

      <Filters draft={draft} programs={programs} onChange={setDraft} onApply={applyFilters} onClear={clearFilters} />

      {identityPartial ? (
        <Alert><AlertTitle>Identity data is partial</AlertTitle><AlertDescription>IAM could not enrich every client or IB. IDs remain available in the report.</AlertDescription></Alert>
      ) : null}
      {error ? <ApiErrorAlert title="Could not load the IB reward trades report" message={error} /> : null}
      {exportError ? <ApiErrorAlert title="Could not export the report" message={exportError} /> : null}

      <TotalsTable totals={totals} loading={loading} />
      <TradesTable rows={rows} loading={loading} filters={filters} onSort={sortBy} onOpenDetail={setSelectedTrade} />

      {pagination ? (
        <PageNumberPagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          disabled={loading}
          perPage={pagination.per_page}
          perPageOptions={[25, 50, 100]}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onPerPageChange={(perPage) => setFilters((current) => ({ ...current, page: 1, per_page: perPage }))}
        />
      ) : null}

      <RewardLinesDialog trade={selectedTrade} open={selectedTrade !== null} onOpenChange={(open) => { if (!open) setSelectedTrade(null); }} />
    </div>
  );
}

function Filters({ draft, programs, onChange, onApply, onClear }: {
  draft: FilterDraft;
  programs: IbProgram[];
  onChange: React.Dispatch<React.SetStateAction<FilterDraft>>;
  onApply: () => void;
  onClear: () => void;
}) {
  const field = (key: keyof FilterDraft, value: string) => onChange((current) => ({ ...current, [key]: value }));
  return (
    <section className="space-y-4 rounded-xl border p-4" aria-label="Report filters">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <FilterInput id="report-q" label="Search" value={draft.q} placeholder="Client, IB, account or operation" onChange={(value) => field("q", value)} />
        <FilterInput id="report-from" label="Closed from" type="datetime-local" value={draft.closedAtFrom} onChange={(value) => field("closedAtFrom", value)} />
        <FilterInput id="report-to" label="Closed to" type="datetime-local" value={draft.closedAtTo} onChange={(value) => field("closedAtTo", value)} />
        <FilterInput id="report-platform" label="Platform ID" value={draft.platformId} onChange={(value) => field("platformId", value)} />
        <SelectFilter id="report-environment" label="Environment" value={draft.environment} options={[{ value: "all", label: "All" }, { value: "1", label: "Demo" }, { value: "2", label: "Live" }]} onChange={(value) => field("environment", value)} />
        <FilterInput id="report-group" label="Server group ID" value={draft.serverGroupId} onChange={(value) => field("serverGroupId", value)} />
        <SelectFilter id="report-book" label="Book" value={draft.bookType} options={[{ value: "all", label: "All" }, { value: "a_book", label: "A-book" }, { value: "b_book", label: "B-book" }]} onChange={(value) => field("bookType", value)} />
        <FilterInput id="report-symbol" label="Symbol" value={draft.symbol} onChange={(value) => field("symbol", value)} />
        <SelectFilter id="report-side" label="Side" value={draft.side} options={[{ value: "all", label: "All" }, { value: "buy", label: "Buy" }, { value: "sell", label: "Sell" }]} onChange={(value) => field("side", value)} />
        <SelectFilter id="report-program" label="IB program" value={draft.programId} options={[{ value: "all", label: "All" }, ...programs.map((program) => ({ value: program.id, label: program.name }))]} onChange={(value) => field("programId", value)} />
        <FilterInput id="report-beneficiary" label="Beneficiary IB ID" value={draft.beneficiaryId} onChange={(value) => field("beneficiaryId", value)} />
        <FilterInput id="report-volume" label="Minimum volume" type="number" value={draft.volumeMin} onChange={(value) => field("volumeMin", value)} />
        <SelectFilter id="report-ratio" label="Ratio bucket" value={draft.ratioBucket} options={[{ value: "all", label: "All" }, { value: "under_70", label: "< 70%" }, { value: "70_to_100", label: "70–100%" }, { value: "over_100", label: "> 100%" }]} onChange={(value) => field("ratioBucket", value)} />
      </div>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-3">
        <legend className="mb-2 text-sm font-medium">Flags</legend>
        {REPORT_FLAGS.map((flag) => (
          <label key={flag.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={draft.flags.includes(flag.value)}
              onCheckedChange={(checked) => onChange((current) => ({
                ...current,
                flags: checked ? [...current.flags, flag.value] : current.flags.filter((item) => item !== flag.value),
              }))}
            />
            {flag.label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onApply}>Apply filters</Button>
        <Button size="sm" variant="outline" onClick={onClear}><FilterXIcon /> Clear</Button>
      </div>
    </section>
  );
}

function FilterInput({ id, label, value, onChange, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SelectFilter({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Select value={value} onValueChange={(next) => onChange(next ?? "all")}><SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
  );
}

function TotalsTable({ totals, loading }: { totals: IbVolumeRewardTradeTotal[]; loading: boolean }) {
  return (
    <section className="space-y-2">
      <div><h2 className="font-medium">Totals by currency</h2><p className="text-sm text-muted-foreground">Calculated over the complete filtered result, not only this page.</p></div>
      <div className="overflow-x-auto rounded-xl border">
        <Table><TableHeader><TableRow><TableHead>Currency</TableHead><TableHead className="text-right">Trades</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Lines</TableHead><TableHead className="text-right">Econ. available</TableHead><TableHead className="text-right">Econ. unavailable</TableHead><TableHead className="text-right">Commission</TableHead><TableHead className="text-right">Markup</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">PnL</TableHead><TableHead className="text-right">Broker gross</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Pending</TableHead><TableHead className="text-right">Failed</TableHead><TableHead className="text-right">Cancelled</TableHead><TableHead className="text-right">Margin</TableHead><TableHead className="text-right">Ratio</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow>{Array.from({ length: 17 }).map((_, index) => <TableCell key={index}><Skeleton className="h-4 w-16" /></TableCell>)}</TableRow> : null}
            {!loading && totals.length === 0 ? <TableRow><TableCell colSpan={17} className="h-16 text-center text-muted-foreground">No totals for the current filters.</TableCell></TableRow> : null}
            {!loading ? totals.map((total, index) => { const money = (value: string | null) => formatReportMoney(value, total.currency_code, total.currency_precision); return (
              <TableRow key={`${total.currency_code ?? "unknown"}-${index}`}><TableCell className="font-medium">{total.currency_code || "Unknown"}</TableCell><TableCell className="text-right">{total.trades}</TableCell><TableCell className="text-right">{formatReportNumber(total.volume)}</TableCell><TableCell className="text-right">{total.reward_lines}</TableCell><TableCell className="text-right">{total.economics_available_trades}</TableCell><TableCell className="text-right">{total.economics_unavailable_trades}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.commission)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.markup_revenue)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.revenue)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.pnl)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.broker_gross)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.reward_paid)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.reward_pending)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.reward_failed)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.reward_cancelled)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(total.margin)}</TableCell><TableCell className="text-right">{formatReportRatio(total.ratio)}</TableCell></TableRow>
            ); }) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function SortHead({ label, value, filters, onSort, align = "right" }: { label: string; value: IbVolumeRewardTradeSort; filters: IbVolumeRewardTradeFilters; onSort: (sort: IbVolumeRewardTradeSort) => void; align?: "left" | "right" }) {
  const active = filters.sort_by === value;
  const Icon = !active ? ArrowUpDownIcon : filters.sort_direction === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return <TableHead className={align === "right" ? "text-right" : undefined}><Button variant="ghost" size="sm" className="-mx-2 whitespace-nowrap" onClick={() => onSort(value)}>{label}<Icon className="size-3.5" /></Button></TableHead>;
}

function TradesTable({ rows, loading, filters, onSort, onOpenDetail }: { rows: IbVolumeRewardTrade[]; loading: boolean; filters: IbVolumeRewardTradeFilters; onSort: (sort: IbVolumeRewardTradeSort) => void; onOpenDetail: (trade: IbVolumeRewardTrade) => void }) {
  const money = (trade: IbVolumeRewardTrade, value: string | null) => formatReportMoney(value, trade.currency_code, trade.currency_precision);
  return (
    <section className="space-y-2"><div><h2 className="font-medium">Reward-generating trades</h2><p className="text-sm text-muted-foreground">One row per closed position. Horizontal scrolling keeps every report field available.</p></div>
      <div className="min-w-0 overflow-x-auto rounded-xl border">
        <Table><TableHeader><TableRow><SortHead label="Opened" value="opened_at" align="left" filters={filters} onSort={onSort} /><SortHead label="Closed" value="closed_at" align="left" filters={filters} onSort={onSort} /><TableHead>Client</TableHead><TableHead>Direct IB</TableHead><TableHead>Account</TableHead><TableHead>Operation</TableHead><TableHead>Platform</TableHead><TableHead>Environment</TableHead><TableHead>Group</TableHead><TableHead>Book</TableHead><TableHead>Symbol</TableHead><TableHead>Side</TableHead><SortHead label="Volume" value="volume" filters={filters} onSort={onSort} /><TableHead className="text-right">Open price</TableHead><TableHead className="text-right">Close price</TableHead><SortHead label="Duration" value="duration_seconds" filters={filters} onSort={onSort} /><SortHead label="Commission" value="commission" filters={filters} onSort={onSort} /><SortHead label="Markup/lot" value="markup_per_lot" filters={filters} onSort={onSort} /><SortHead label="Markup" value="markup_revenue" filters={filters} onSort={onSort} /><SortHead label="Revenue" value="revenue" filters={filters} onSort={onSort} /><SortHead label="PnL" value="pnl" filters={filters} onSort={onSort} /><SortHead label="Broker gross" value="broker_gross" filters={filters} onSort={onSort} /><SortHead label="Paid" value="reward_paid" filters={filters} onSort={onSort} /><SortHead label="Pending" value="reward_pending" filters={filters} onSort={onSort} /><SortHead label="Failed" value="reward_failed" filters={filters} onSort={onSort} /><SortHead label="Cancelled" value="reward_cancelled" filters={filters} onSort={onSort} /><SortHead label="Ratio" value="ratio" filters={filters} onSort={onSort} /><SortHead label="Margin" value="margin" filters={filters} onSort={onSort} /><SortHead label="Lines" value="reward_lines" filters={filters} onSort={onSort} /><SortHead label="IBs" value="distinct_ibs" filters={filters} onSort={onSort} /><SortHead label="Max level" value="max_level" filters={filters} onSort={onSort} /><TableHead>Flags</TableHead><TableHead>Economics</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, rowIndex) => <TableRow key={rowIndex}>{Array.from({ length: 34 }).map((__, cellIndex) => <TableCell key={cellIndex}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>) : null}
            {!loading && rows.length === 0 ? <TableRow><TableCell colSpan={34} className="h-24 text-center text-muted-foreground">No reward-generating trades match the filters.</TableCell></TableRow> : null}
            {!loading ? rows.map((trade) => (
              <TableRow key={trade.position_id}><TableCell className="whitespace-nowrap">{formatReportDate(trade.opened_at)}</TableCell><TableCell className="whitespace-nowrap">{formatReportDate(trade.closed_at)}</TableCell><TableCell>{identity(trade.client)}</TableCell><TableCell>{identity(trade.direct_ib)}</TableCell><TableCell className="font-mono text-xs">{trade.account_id}</TableCell><TableCell className="font-mono text-xs">{trade.operation_id ?? "—"}</TableCell><TableCell>{trade.platform.name || trade.platform.id}</TableCell><TableCell>{environmentLabel(trade.environment)}</TableCell><TableCell>{trade.server_group.name || trade.server_group.id}</TableCell><TableCell>{bookLabel(trade.book_type)}</TableCell><TableCell className="font-medium">{trade.symbol}</TableCell><TableCell className="capitalize">{trade.side}</TableCell><TableCell className="text-right">{formatReportNumber(trade.volume)}</TableCell><TableCell className="text-right">{formatReportNumber(trade.open_price)}</TableCell><TableCell className="text-right">{formatReportNumber(trade.close_price)}</TableCell><TableCell className="whitespace-nowrap text-right">{formatDuration(trade.duration_seconds)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.commission)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.markup_per_lot)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.markup_revenue)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.revenue)}</TableCell><TableCell className={cn("whitespace-nowrap text-right", Number(trade.pnl) < 0 && "text-destructive")}>{money(trade, trade.pnl)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.broker_gross)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.reward_paid)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.reward_pending)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.reward_failed)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.reward_cancelled)}</TableCell><TableCell className={cn("text-right", Number(trade.ratio) > 1 && "font-medium text-destructive")}>{formatReportRatio(trade.ratio)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(trade, trade.margin)}</TableCell><TableCell className="text-right">{trade.reward_lines}</TableCell><TableCell className="text-right">{trade.distinct_ibs}</TableCell><TableCell className="text-right">{trade.max_level}</TableCell><TableCell><div className="flex min-w-48 flex-wrap gap-1">{trade.flags.length ? trade.flags.map((flag) => <Badge key={flag} variant={flag === "reward_exceeds_revenue" || flag === "economics_unavailable" ? "destructive" : "outline"}>{reportFlagLabel(flag)}</Badge>) : <span>—</span>}</div></TableCell><TableCell><Badge variant={trade.calculation_availability.status === "available" ? "secondary" : "outline"}>{trade.calculation_availability.status}</Badge>{trade.calculation_availability.missing.length ? <p className="mt-1 max-w-52 text-xs text-muted-foreground">Missing: {trade.calculation_availability.missing.join(", ")}</p> : null}{trade.calculation_availability.snapshotted_at ? <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">Snapshot: {formatReportDate(trade.calculation_availability.snapshotted_at)}</p> : null}</TableCell><TableCell><Button size="sm" variant="outline" onClick={() => onOpenDetail(trade)}>View rewards</Button></TableCell></TableRow>
            )) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
