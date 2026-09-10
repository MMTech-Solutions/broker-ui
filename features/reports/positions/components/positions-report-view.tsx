"use client";

import { Popover } from "@base-ui/react/popover";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, FilterIcon, FilterXIcon, RefreshCwIcon } from "lucide-react";

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
import { REPORT_FLAGS, bookLabel, environmentLabel, formatReportDate, formatReportMoney, formatReportRatio, reportFlagLabel } from "@/features/reports/ib-volume-reward-trades";
import { exportPositionsReport, listPositionsReport } from "@/features/reports/positions/api";
import { PositionReportDetailDialog } from "@/features/reports/positions/components/position-report-detail-dialog";
import type { PositionReportFilters, PositionReportRow, PositionReportTotal } from "@/features/reports/positions/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const DEFAULT_FILTERS: PositionReportFilters = { status: "all", page: 1, per_page: 25, sort_by: "opened_at", sort_direction: "desc" };
const TEXT_FILTERS = [
  ["q", "Search", "Client, IB, account or operation"], ["position_id", "Position ID", "UUID"],
  ["order_id", "Order ID", "Contains"], ["user_id", "Client ID", "External user ID"],
  ["user_name", "Client name", "Contains"], ["user_email", "Client email", "Contains"],
  ["account_id", "Account ID", "UUID"], ["account_query", "External account", "Contains"],
  ["platform_id", "Platform ID", "UUID"], ["server_group_id", "Server group ID", "UUID"],
  ["symbol", "Symbol", "EURUSD"], ["comment", "Comment", "Contains"],
] as const;
const RANGE_FILTERS = [
  ["volume", "Volume"], ["open_price", "Open price"], ["close_price", "Close price"],
  ["sl", "Stop loss"], ["tp", "Take profit"], ["swap", "Swap"],
  ["commission", "Commission"], ["pnl", "PnL"],
] as const;
const SORTS = ["opened_at", "closed_at", "duration_seconds", "volume", "open_price", "close_price", "swap", "commission", "markup_per_lot", "markup_revenue", "revenue", "pnl", "broker_gross", "reward_paid", "reward_pending", "reward_failed", "reward_cancelled", "ratio", "margin", "reward_lines", "distinct_ibs", "max_level"];

function fromSearch(search: URLSearchParams): PositionReportFilters {
  const filters: PositionReportFilters = { ...DEFAULT_FILTERS };
  search.forEach((value, key) => {
    if (key === "flags[]") filters.flags = search.getAll("flags[]");
    else filters[key] = value;
  });
  return filters;
}

function activeCount(filters: PositionReportFilters): number {
  return Object.entries(filters).filter(([key, value]) => !["page", "per_page", "sort_by", "sort_direction", "status"].includes(key) && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)).length + (filters.status && filters.status !== "all" ? 1 : 0);
}

function datetimeInput(value: string | number | string[] | undefined): string {
  if (value === undefined || Array.isArray(value) || value === "") return "";
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PositionsReportView() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => fromSearch(search), [search]);
  const [draft, setDraft] = useState<PositionReportFilters>(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rows, setRows] = useState<PositionReportRow[]>([]);
  const [totals, setTotals] = useState<PositionReportTotal[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [programs, setPrograms] = useState<IbProgram[]>([]);
  const [identityPartial, setIdentityPartial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"trade" | "reward" | null>(null);
  const [selected, setSelected] = useState<PositionReportRow | null>(null);

  useEffect(() => { queueMicrotask(() => setDraft(filters)); }, [filters]);
  useEffect(() => { void listIbPrograms({ per_page: 100 }).then((response) => setPrograms(response.data)).catch(() => setPrograms([])); }, []);

  const replace = useCallback((next: PositionReportFilters) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) return;
      if (Array.isArray(value)) value.forEach((item) => params.append(`${key}[]`, item));
      else if (value !== DEFAULT_FILTERS[key]) params.set(key, String(value));
    });
    router.replace(params.size ? `${pathname}?${params}` : pathname);
  }, [pathname, router]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await listPositionsReport(filters);
      setRows(response.data ?? []); setTotals(response.meta.totals_by_currency ?? []);
      setPagination(response.meta.pagination ?? null); setIdentityPartial(response.meta.identity_enrichment_partial === true);
    } catch (cause) {
      setRows([]); setTotals([]); setPagination(null); setIdentityPartial(false); setError(formatBrokerApiError(cause));
    } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  function apply() { replace({ ...draft, page: 1 }); setFiltersOpen(false); }
  function clear() { const next = { ...DEFAULT_FILTERS, sort_by: filters.sort_by, sort_direction: filters.sort_direction }; setDraft(next); replace(next); setFiltersOpen(false); }
  function onEnter(event: KeyboardEvent<HTMLInputElement>) { if (event.key === "Enter") { event.preventDefault(); apply(); } }
  function patch(key: string, value: string | number | string[] | undefined) { setDraft((current) => ({ ...current, [key]: value })); }
  async function download(grain: "trade" | "reward") { setExporting(grain); setError(null); try { await exportPositionsReport(filters, grain); } catch (cause) { setError(formatBrokerApiError(cause)); } finally { setExporting(null); } }
  function changeSort(sortBy: string) { replace({ ...filters, page: 1, sort_by: sortBy, sort_direction: filters.sort_by === sortBy && filters.sort_direction === "desc" ? "asc" : "desc" }); }

  return <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
    <PageContentToolbar breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Positions report", current: true }]}>
      <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}><RefreshCwIcon className={cn(loading && "animate-spin")} />Refresh</Button><Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => void download("trade")}><DownloadIcon />{exporting === "trade" ? "Exporting…" : "Trades CSV"}</Button><Button variant="outline" size="sm" disabled={exporting !== null} onClick={() => void download("reward")}><DownloadIcon />{exporting === "reward" ? "Exporting…" : "Rewards CSV"}</Button></div>
    </PageContentToolbar>
    {identityPartial ? <Alert><AlertTitle>Identity data is partial</AlertTitle><AlertDescription>IDs remain available for identities IAM could not enrich.</AlertDescription></Alert> : null}
    {error ? <ApiErrorAlert title="Could not load positions report" message={error} /> : null}
    <Totals totals={totals} loading={loading} />
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Popover.Root open={filtersOpen} onOpenChange={setFiltersOpen}><Popover.Trigger render={<Button variant="outline" size="sm" />}><FilterIcon />Filters{activeCount(filters) ? <Badge variant="secondary">{activeCount(filters)}</Badge> : null}</Popover.Trigger><Popover.Portal><Popover.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-50"><Popover.Popup className="z-50 max-h-[calc(100vh-2rem)] w-[52rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none">
          <div className="mb-4"><p className="font-medium">Filter positions report</p><p className="text-xs text-muted-foreground">Combine trade, identity, economics and reward criteria.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField label="Status" value={String(draft.status ?? "all")} options={["all", "open", "closed"]} onChange={(value) => patch("status", value)} />
            {TEXT_FILTERS.map(([key, label, placeholder]) => <Field key={key} label={label} value={String(draft[key] ?? "")} placeholder={placeholder} onChange={(value) => patch(key, value)} onKeyDown={onEnter} />)}
            <SelectField label="Environment" value={String(draft.environment ?? "all")} options={["all", "1", "2"]} labels={{ "1": "Demo", "2": "Live" }} onChange={(value) => patch("environment", value === "all" ? undefined : value)} />
            <SelectField label="Book" value={String(draft.book_type ?? "all")} options={["all", "a_book", "b_book"]} onChange={(value) => patch("book_type", value === "all" ? undefined : value)} />
            <SelectField label="Side" value={String(draft.side ?? "all")} options={["all", "buy", "sell"]} onChange={(value) => patch("side", value === "all" ? undefined : value)} />
            <SelectField label="IB program" value={String(draft.ib_program_id ?? "all")} options={["all", ...programs.map((program) => program.id)]} labels={Object.fromEntries(programs.map((program) => [program.id, program.name]))} onChange={(value) => patch("ib_program_id", value === "all" ? undefined : value)} />
            <Field label="Beneficiary IB ID" value={String(draft.beneficiary_id ?? "")} onChange={(value) => patch("beneficiary_id", value)} onKeyDown={onEnter} />
            <SelectField label="Ratio" value={String(draft.ratio_bucket ?? "all")} options={["all", "under_70", "70_to_100", "over_100"]} labels={{ under_70: "< 70%", "70_to_100": "70–100%", over_100: "> 100%" }} onChange={(value) => patch("ratio_bucket", value === "all" ? undefined : value)} />
            <Field label="Opened from" type="datetime-local" value={datetimeInput(draft.opened_at_from)} onChange={(value) => patch("opened_at_from", value ? new Date(value).getTime() : undefined)} />
            <Field label="Opened to" type="datetime-local" value={datetimeInput(draft.opened_at_to)} onChange={(value) => patch("opened_at_to", value ? new Date(value).getTime() : undefined)} />
            <Field label="Closed from" type="datetime-local" value={datetimeInput(draft.closed_at_from)} onChange={(value) => patch("closed_at_from", value ? new Date(value).getTime() : undefined)} />
            <Field label="Closed to" type="datetime-local" value={datetimeInput(draft.closed_at_to)} onChange={(value) => patch("closed_at_to", value ? new Date(value).getTime() : undefined)} />
            {RANGE_FILTERS.map(([key, label]) => <div key={key} className="space-y-1.5"><Label>{label}</Label><div className="grid grid-cols-2 gap-2"><Input inputMode="decimal" placeholder="Min" value={String(draft[`${key}_min`] ?? "")} onChange={(event) => patch(`${key}_min`, event.target.value)} onKeyDown={onEnter} /><Input inputMode="decimal" placeholder="Max" value={String(draft[`${key}_max`] ?? "")} onChange={(event) => patch(`${key}_max`, event.target.value)} onKeyDown={onEnter} /></div></div>)}
            <SelectField label="Sort by" value={String(draft.sort_by ?? "opened_at")} options={SORTS} onChange={(value) => patch("sort_by", value)} />
            <SelectField label="Direction" value={String(draft.sort_direction ?? "desc")} options={["desc", "asc"]} onChange={(value) => patch("sort_direction", value)} />
          </div>
          <fieldset className="mt-4"><legend className="mb-2 text-sm font-medium">Flags</legend><div className="flex flex-wrap gap-x-5 gap-y-2">{REPORT_FLAGS.map((flag) => <label key={flag.value} className="flex items-center gap-2 text-sm"><Checkbox checked={(draft.flags ?? []).includes(flag.value)} onCheckedChange={(checked) => patch("flags", checked ? [...(draft.flags ?? []), flag.value] : (draft.flags ?? []).filter((item) => item !== flag.value))} />{flag.label}</label>)}</div></fieldset>
          <div className="mt-5 flex justify-end gap-2 border-t pt-4"><Button variant="ghost" size="sm" onClick={clear}><FilterXIcon />Clear</Button><Button size="sm" onClick={apply}>Apply filters</Button></div>
        </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>
        <p className="text-sm text-muted-foreground">{pagination?.total ?? 0} positions · one row per trade</p>
      </div>
      <PositionsTable rows={rows} loading={loading} filters={filters} onSort={changeSort} onSelect={setSelected} />
    </section>
    {pagination ? <PageNumberPagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={pagination.per_page} disabled={loading} perPageOptions={[25, 50, 100]} onPageChange={(page) => replace({ ...filters, page })} onPerPageChange={(per_page) => replace({ ...filters, page: 1, per_page })} /> : null}
    <PositionReportDetailDialog position={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} />
  </div>;
}

function Field({ label, value, onChange, onKeyDown, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onKeyDown={onKeyDown} /></div>;
}

function SelectField({ label, value, options, labels = {}, onChange }: { label: string; value: string; options: readonly string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={(next) => onChange(next ?? "all")}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{labels[option] ?? option.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>;
}

function Totals({ totals, loading }: { totals: PositionReportTotal[]; loading: boolean }) {
  if (loading) return <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  if (!totals.length) return null;
  return <section className="space-y-2"><div><h2 className="font-medium">Filtered totals</h2><p className="text-sm text-muted-foreground">Complete result, grouped without mixing currencies.</p></div><div className="grid gap-3 xl:grid-cols-2">{totals.map((total, index) => {
    const money = (value: string | null) => formatReportMoney(value, total.currency_code, total.currency_precision);
    return <div key={`${total.currency_code ?? "unknown"}-${index}`} className="rounded-xl border p-3"><div className="flex items-center justify-between"><strong>{total.currency_code ?? "Unknown currency"}</strong><span className="text-sm text-muted-foreground">{total.positions} positions · {total.volume} lots</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><span>Revenue <strong>{money(total.revenue)}</strong></span><span>PnL <strong>{money(total.pnl)}</strong></span><span>Gross <strong>{money(total.broker_gross)}</strong></span><span>Paid <strong>{money(total.reward_paid)}</strong></span><span>Outstanding <strong>{money(total.reward_pending)}</strong></span><span>Failed <strong>{money(total.reward_failed)}</strong></span><span>Margin <strong>{money(total.margin)}</strong></span><span>Ratio <strong>{formatReportRatio(total.ratio)}</strong></span></div></div>;
  })}</div></section>;
}

function PositionsTable({ rows, loading, filters, onSort, onSelect }: { rows: PositionReportRow[]; loading: boolean; filters: PositionReportFilters; onSort: (key: string) => void; onSelect: (row: PositionReportRow) => void }) {
  const head = (label: string, key?: string) => <TableHead>{key ? <Button variant="ghost" size="sm" className="-mx-2" onClick={() => onSort(key)}>{label}{filters.sort_by === key ? filters.sort_direction === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon /> : null}</Button> : label}</TableHead>;
  return <div className="min-w-0 overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow>{head("Order")}{head("Status")}{head("Open / close time", "opened_at")}{head("Open / close price", "open_price")}{head("Client")}{head("Account")}{head("Platform")}{head("Server group")}{head("Book type")}{head("Instrument")}{head("Volume", "volume")}{head("Commission", "commission")}{head("Markup", "markup_revenue")}{head("Revenue", "revenue")}{head("PnL", "pnl")}{head("Broker gross", "broker_gross")}{head("Flags")}{head("Actions")}</TableRow></TableHeader><TableBody>
    {loading ? Array.from({ length: 5 }).map((_, index) => <TableRow key={index}>{Array.from({ length: 18 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-12 w-24" /></TableCell>)}</TableRow>) : null}
    {!loading && !rows.length ? <TableRow><TableCell colSpan={18} className="h-24 text-center text-muted-foreground">No positions match the current filters.</TableCell></TableRow> : null}
    {!loading ? rows.map((row) => {
      const money = (value: string | null) => formatReportMoney(value, row.currency_code, row.currency_precision);
      return <TableRow key={row.position_id}>
        <TableCell className="whitespace-nowrap font-mono text-xs">{row.operation_id}</TableCell>
        <TableCell><Badge variant={row.status === "closed" ? "secondary" : "default"}>{row.status}</Badge></TableCell>
        <TableCell className="min-w-40 whitespace-nowrap"><p>{formatReportDate(row.opened_at)}</p><p className="text-xs text-muted-foreground">{row.closed_at ? formatReportDate(row.closed_at) : "—"}</p></TableCell>
        <TableCell className="whitespace-nowrap text-right"><p>{row.open_price}</p><p className="text-xs text-muted-foreground">{row.close_price ?? "—"}</p></TableCell>
        <TableCell className="min-w-44"><p>{row.client.name || row.client.id}</p><p className="text-xs text-muted-foreground">{row.client.email || "—"}</p></TableCell>
        <TableCell className="min-w-36"><p>{row.trading_account.custom_name || "—"}</p><p className="font-mono text-[10px] text-muted-foreground">{row.trading_account.external_trader_id}</p></TableCell>
        <TableCell className="min-w-32"><p>{row.platform.name || row.platform.id}</p><p className="text-xs text-muted-foreground">{environmentLabel(row.environment)}</p></TableCell>
        <TableCell className="min-w-40"><p>{row.server_group.meta_name || "—"}</p><p className="text-xs text-muted-foreground">{row.server_group.name || row.server_group.id}</p></TableCell>
        <TableCell><Badge variant="outline">{bookLabel(row.book_type)}</Badge></TableCell>
        <TableCell><strong>{row.symbol}</strong><p className="uppercase text-xs text-muted-foreground">{row.side}</p></TableCell>
        <TableCell className="whitespace-nowrap text-right">{row.volume}</TableCell>
        <TableCell className="whitespace-nowrap text-right">{money(row.commission)}</TableCell>
        <TableCell className="whitespace-nowrap text-right">{money(row.markup_revenue)}</TableCell>
        <TableCell className="whitespace-nowrap text-right">{money(row.revenue)}</TableCell>
        <TableCell className={cn("whitespace-nowrap text-right", Number(row.pnl) < 0 && "text-destructive")}>{money(row.pnl)}</TableCell>
        <TableCell className="whitespace-nowrap text-right">{money(row.broker_gross)}</TableCell>
        <TableCell className="min-w-32"><Badge variant="outline">{row.calculation_availability.status.replaceAll("_", " ")}</Badge><div className="mt-1 flex flex-wrap gap-1">{row.flags.map((flag) => <Badge key={flag} variant="outline" title={reportFlagLabel(flag)}>{flag.slice(0, 3).toUpperCase()}</Badge>)}</div></TableCell>
        <TableCell><Button size="sm" variant="outline" onClick={() => onSelect(row)}>View details</Button></TableCell>
      </TableRow>;
    }) : null}
  </TableBody></Table></div>;
}
