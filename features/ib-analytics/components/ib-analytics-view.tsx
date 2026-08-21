"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, ColorType, createChart, LineStyle, type IChartApi, type Time, type UTCTimestamp } from "lightweight-charts";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIbAnalyticsMonthly, getIbAnalyticsSummary, getIbAnalyticsYtd, listIbAnalyticsRewards } from "@/features/ib-analytics/api";
import type { IbAnalyticsAudience, IbAnalyticsReward, IbAnalyticsRewardFilters, IbAnalyticsSeriesPoint, IbAnalyticsSummary } from "@/features/ib-analytics/types";
import { formatDateTimeValue, formatMoneyValue, paymentStatusLabel, paymentStatusVariant, sourceTypeLabel } from "@/features/ib-reward";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type MainTab = "referrals" | "rewards" | "analytics";
type AnalyticsTab = "monthly" | "ytd";

type IbAnalyticsViewProps = { audience: IbAnalyticsAudience; beneficiaryId?: string };

const STATUSES = ["pending", "processing", "paid", "failed", "cancelled"] as const;
const SOURCE_TABS = [
  ["all", "Todas"], ["volume", "Volumen"], ["pnl", "PnL"], ["cpa", "CPA"],
] as const;
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

function money(value: string, currency?: string | null): string {
  return `${formatMoneyValue(value)}${currency ? ` ${currency}` : ""}`;
}

function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (value: T) => void; items: ReadonlyArray<readonly [T, string]> }) {
  return <div role="tablist" className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border bg-background p-1">
    {items.map(([key, label]) => <Button key={key} role="tab" aria-selected={value === key} variant={value === key ? "default" : "ghost"} size="sm" className="shrink-0" onClick={() => onChange(key)}>{label}</Button>)}
  </div>;
}

function bucketTime(bucket: string): UTCTimestamp | null {
  const date = bucket.length === 7 ? new Date(`${bucket}-01T00:00:00Z`) : new Date(`${bucket}T00:00:00Z`);
  const time = Math.floor(date.getTime() / 1000);
  return Number.isFinite(time) ? time as UTCTimestamp : null;
}

function RewardSeriesChart({ title, series, loading }: { title: string; series: IbAnalyticsSeriesPoint[]; loading: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const currencies = useMemo(() => Array.from(new Map(series.flatMap((point) => point.totals.map((total) => [`${total.currency.code ?? "UNRESOLVED"}:${total.currency.precision ?? ""}`, total.currency.code ?? "UNRESOLVED"]))).entries()), [series]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    chart.current?.remove();
    const instance = createChart(element, {
      width: element.clientWidth, height: 300,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#71717a" },
      grid: { vertLines: { color: "#e4e4e7", style: LineStyle.Dotted }, horzLines: { color: "#e4e4e7", style: LineStyle.Dotted } },
      rightPriceScale: { borderColor: "#e4e4e7" }, timeScale: { borderColor: "#e4e4e7", timeVisible: true },
    });
    currencies.forEach(([currencyKey, code], index) => {
      const data = series.flatMap((point) => {
        const total = point.totals.find((entry) => `${entry.currency.code ?? "UNRESOLVED"}:${entry.currency.precision ?? ""}` === currencyKey);
        const time = bucketTime(point.bucket);
        const value = Number(total?.amount ?? 0);
        return time !== null && Number.isFinite(value) ? [{ time: time as Time, value }] : [];
      });
      const color = COLORS[index % COLORS.length];
      instance.addSeries(AreaSeries, { lineColor: color, topColor: `${color}33`, bottomColor: `${color}05`, title: code, lineWidth: 2 }).setData(data);
    });
    instance.timeScale().fitContent();
    chart.current = instance;
    const observer = new ResizeObserver(() => instance.applyOptions({ width: element.clientWidth }));
    observer.observe(element);
    return () => { observer.disconnect(); instance.remove(); chart.current = null; };
  }, [currencies, series]);

  return <Card><CardHeader><CardTitle>{title}</CardTitle><p className="text-xs text-muted-foreground">{currencies.map(([, code]) => code).join(" · ") || "Sin actividad"}</p></CardHeader><CardContent className="relative"><div ref={container} className="h-[300px] w-full" />{loading ? <Skeleton className="absolute inset-0 h-[300px] w-full" /> : null}{!loading && series.length === 0 ? <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No hay datos para este período.</p> : null}</CardContent></Card>;
}

export function IbAnalyticsView({ audience, beneficiaryId }: IbAnalyticsViewProps) {
  const [mainTab, setMainTab] = useState<MainTab>("referrals");
  const [sourceTab, setSourceTab] = useState<"all" | IbAnalyticsReward["source_type"]>("all");
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("monthly");
  const [summary, setSummary] = useState<IbAnalyticsSummary | null>(null);
  const [rewards, setRewards] = useState<IbAnalyticsReward[]>([]);
  const [series, setSeries] = useState<IbAnalyticsSeriesPoint[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"all" | IbAnalyticsReward["source_type"]>("all");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<IbAnalyticsRewardFilters["sort_by"]>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(() => String(new Date().getUTCFullYear()));
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);

  const baseFilters = useCallback((): IbAnalyticsRewardFilters => ({
    ...(audience === "admin" && beneficiaryId ? { beneficiary_id: beneficiaryId } : {}),
    ...(source === "all" ? {} : { source_type: source }),
    ...(statuses.length ? { payment_status: statuses as IbAnalyticsReward["payment_status"][] } : {}),
    ...(from ? { from } : {}), ...(to ? { to } : {}), sort_by: sortBy, sort_direction: sortDirection,
  }), [audience, beneficiaryId, from, sortBy, sortDirection, source, statuses, to]);

  const loadRewards = useCallback(async (targetPage = page) => {
    setLoading(true); setError(null);
    try {
      const [summaryResponse, rewardsResponse] = await Promise.all([
        getIbAnalyticsSummary(audience, beneficiaryId),
        listIbAnalyticsRewards(audience, { ...baseFilters(), page: targetPage, per_page: 15 }),
      ]);
      setSummary(summaryResponse.data); setRewards(rewardsResponse.data); setPagination(rewardsResponse.meta.pagination ?? null);
    } catch (loadError) { setError(formatBrokerApiError(loadError)); setRewards([]); setSummary(null); setPagination(null); }
    finally { setLoading(false); }
  }, [audience, baseFilters, beneficiaryId, page]);

  const loadSeries = useCallback(async () => {
    setSeriesLoading(true);
    try {
      const filters = baseFilters();
      const response = analyticsTab === "monthly"
        ? await getIbAnalyticsMonthly(audience, { ...filters, month })
        : await getIbAnalyticsYtd(audience, { ...filters, year: Number(year) || new Date().getUTCFullYear() });
      setSeries(response.data);
    } catch (loadError) { setError(formatBrokerApiError(loadError)); setSeries([]); }
    finally { setSeriesLoading(false); }
  }, [analyticsTab, audience, baseFilters, month, year]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void loadRewards(page));
    return () => cancelAnimationFrame(frame);
  }, [loadRewards, page]);
  useEffect(() => {
    if (mainTab !== "analytics") return;
    const frame = requestAnimationFrame(() => void loadSeries());
    return () => cancelAnimationFrame(frame);
  }, [loadSeries, mainTab]);

  const visibleRewards = useMemo(() => rewards.filter((reward) => (sourceTab === "all" || reward.source_type === sourceTab) && (!selectedReferral || reward.user.name === selectedReferral)), [rewards, selectedReferral, sourceTab]);
  const referrals = useMemo(() => Array.from(rewards.reduce((map, reward) => {
    const entry = map.get(reward.user.name) ?? { name: reward.user.name, count: 0, totals: new Map<string, string>() };
    entry.count += 1;
    const code = reward.currency.code ?? "UNRESOLVED";
    entry.totals.set(code, String(Number(entry.totals.get(code) ?? 0) + Number(reward.amount)));
    map.set(entry.name, entry); return map;
  }, new Map<string, { name: string; count: number; totals: Map<string, string> }>() ).values()), [rewards]);
  const breadcrumbs: BreadcrumbItem[] = audience === "admin" ? [{ label: "IB Subscriptions", href: "/ib-subscriptions" }, { label: "IB Metrics", current: true }] : [{ label: "Inicio", href: "/client" }, { label: "IB Dashboard", href: "/client/ib" }, { label: "Mis métricas", current: true }];

  function toggleStatus(status: string) { setPage(1); setStatuses((current) => current.includes(status) ? current.filter((item) => item !== status) : [...current, status]); }
  function applyFilter() { setPage(1); void loadRewards(1); if (mainTab === "analytics") void loadSeries(); }

  return <div className="flex flex-1 flex-col gap-4 p-4">
    <PageContentToolbar breadcrumbs={breadcrumbs}><Button variant="outline" size="sm" disabled={loading} onClick={() => { void loadRewards(page); if (mainTab === "analytics") void loadSeries(); }}><RefreshCwIcon className={cn(loading && "animate-spin")} />Actualizar</Button></PageContentToolbar>
    {error ? <ApiErrorAlert title="No se pudieron cargar las métricas IB" message={error} /> : null}
    <div className="space-y-2"><Label>Sección</Label><Tabs value={mainTab} onChange={setMainTab} items={[["referrals", "Referidos"], ["rewards", "Recompensas"], ["analytics", "Analíticas"]]} /></div>
    {mainTab === "referrals" ? <div className="space-y-3"><div><h2 className="text-lg font-semibold">Referidos con recompensas</h2><p className="text-sm text-muted-foreground">Se muestran exclusivamente referidos de tu red directa que han generado recompensas.</p></div><div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Referido</TableHead><TableHead>Recompensas</TableHead><TableHead>Importes</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow> : referrals.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No hay referidos directos con recompensas en estos resultados.</TableCell></TableRow> : referrals.map((referral) => <TableRow key={referral.name}><TableCell>{referral.name || "—"}</TableCell><TableCell>{referral.count}</TableCell><TableCell>{Array.from(referral.totals, ([code, value]) => money(value, code)).join(" · ")}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => { setSelectedReferral(referral.name); setMainTab("rewards"); }}>Ver recompensas</Button></TableCell></TableRow>)}</TableBody></Table></div></div> : null}
    {mainTab === "rewards" ? <div className="space-y-4"><div className="grid gap-3 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-4"><div><Label>Fuente</Label><Select value={source} onValueChange={(value) => { setSource((value ?? "all") as typeof source); setPage(1); }}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="volume">Volumen</SelectItem><SelectItem value="pnl">PnL</SelectItem><SelectItem value="cpa">CPA</SelectItem></SelectContent></Select></div><div><Label>Desde</Label><Input className="mt-1" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div><div><Label>Hasta</Label><Input className="mt-1" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div><div><Label>Orden</Label><div className="mt-1 flex gap-2"><Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="created_at">Fecha</SelectItem><SelectItem value="amount">Importe</SelectItem><SelectItem value="payment_status">Estado</SelectItem><SelectItem value="source_type">Fuente</SelectItem><SelectItem value="user.name">Referido</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")}>{sortDirection.toUpperCase()}</Button></div></div><div className="md:col-span-2 xl:col-span-4"><Label>Estados</Label><div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((status) => <Button key={status} size="sm" variant={statuses.includes(status) ? "secondary" : "outline"} onClick={() => toggleStatus(status)}>{paymentStatusLabel(status)}</Button>)}<Button size="sm" onClick={applyFilter}>Aplicar</Button></div></div></div><Tabs value={sourceTab} onChange={setSourceTab} items={SOURCE_TABS} />{selectedReferral ? <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">Filtrando por referido: <strong>{selectedReferral}</strong><Button size="sm" variant="ghost" onClick={() => setSelectedReferral(null)}>Quitar</Button></div> : null}<div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Referido</TableHead><TableHead>Programa</TableHead><TableHead>Importe</TableHead><TableHead>Estado</TableHead><TableHead>Fuente / contexto</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow> : visibleRewards.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No hay recompensas para estos filtros.</TableCell></TableRow> : visibleRewards.map((reward) => <TableRow key={reward.id}><TableCell>{formatDateTimeValue(reward.created_at)}</TableCell><TableCell><div>{reward.user.name || "—"}</div>{audience === "admin" && reward.user.email ? <div className="text-xs text-muted-foreground">{reward.user.email}</div> : null}</TableCell><TableCell>{reward.program?.name ?? "—"}</TableCell><TableCell>{money(reward.amount, reward.currency.code)}</TableCell><TableCell><Badge variant={paymentStatusVariant(reward.payment_status)}>{paymentStatusLabel(reward.payment_status)}</Badge></TableCell><TableCell><div>{sourceTypeLabel(reward.source_type)} · nivel {reward.distribution_level}</div>{reward.trading_account ? <p className="text-xs text-muted-foreground">{[reward.trading_account.platform, reward.trading_account.server_group, audience === "admin" ? reward.trading_account.external_trader_id : null].filter(Boolean).join(" · ")}</p> : null}{reward.cpa_context ? <p className="text-xs text-muted-foreground">CPA capturado {formatDateTimeValue(reward.cpa_context.captured_at)}</p> : null}</TableCell></TableRow>)}</TableBody></Table></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Página {pagination?.current_page ?? page} de {pagination?.last_page ?? 1}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={loading || page >= (pagination?.last_page ?? 1)} onClick={() => setPage((value) => value + 1)}>Siguiente</Button></div></div></div> : null}
    {mainTab === "analytics" ? <div className="space-y-4">{summary ? <div className="grid gap-4 lg:grid-cols-3"><Card><CardHeader><CardTitle>Plan</CardTitle></CardHeader><CardContent>{summary.plan?.name ?? "Sin suscripción"}<p className="mt-1 text-xs text-muted-foreground">{summary.subscription?.status ?? "—"}</p></CardContent></Card><Card><CardHeader><CardTitle>Programa actual</CardTitle></CardHeader><CardContent>{summary.current_program?.name ?? "—"}</CardContent></Card><Card><CardHeader><CardTitle>Pendiente a pago</CardTitle></CardHeader><CardContent>{summary.totals.map((total) => <p key={total.currency.code}>{money(total.pending_to_pay, total.currency.code)}</p>) || "—"}</CardContent></Card></div> : null}<Card><CardHeader><CardTitle>Totales por moneda</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{summary?.totals.length ? summary.totals.map((total) => <div key={total.currency.code ?? "unresolved"} className="rounded-lg border p-3"><strong>{total.currency.code ?? "Sin moneda"}</strong><p className="mt-2 text-sm">Cobradas: {money(total.paid)}</p><p className="text-sm">Pendientes: {money(total.pending_to_pay)}</p><p className="text-sm text-muted-foreground">Fallidas/canceladas: {money(total.failed)} / {money(total.cancelled)}</p></div>) : <p className="text-sm text-muted-foreground">No hay importes históricos.</p>}</CardContent></Card><Tabs value={analyticsTab} onChange={setAnalyticsTab} items={[["monthly", "Mensual"], ["ytd", "YTD"]]} /><div className="flex gap-3">{analyticsTab === "monthly" ? <div><Label>Mes</Label><Input className="mt-1" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></div> : <div><Label>Año</Label><Input className="mt-1" type="number" min="2000" value={year} onChange={(event) => setYear(event.target.value)} /></div>}<Button className="mt-6" onClick={() => void loadSeries()}>Actualizar gráfico</Button></div><RewardSeriesChart title={analyticsTab === "monthly" ? "Recompensas diarias" : "Recompensas por mes"} series={series} loading={seriesLoading} /></div> : null}
  </div>;
}
