"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import {
  AreaSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

import { getIbAnalytics, getIbAnalyticsOverview, getIbEarnings, getIbReferrals, getIbReferralsGeo, type IbAnalyticsAudience } from "@/features/ib-admin-analytics/api";
import { IbEarningsContent } from "@/features/ib-admin-analytics/components/ib-earnings-content";
import { IbReferralsContent } from "@/features/ib-admin-analytics/components/ib-referrals-content";
import type {
  IbAnalytics,
  IbAnalyticsHistoricalRule,
  IbAnalyticsMoney,
  IbAnalyticsMoneyAvailability,
  IbAnalyticsOverview,
  IbEarnings,
  IbEarningsGrain,
  IbEarningsPaymentStatus,
  IbEarningsType,
  IbReferralGeo,
  IbReferrals,
  IbOverviewFunnelStage,
  IbOverviewKpis,
} from "@/features/ib-admin-analytics/types";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type AnalyticsTab = "overview" | "analytics" | "earnings" | "referrals";

type IbAdminAnalyticsViewProps = { beneficiaryId?: string; audience?: IbAnalyticsAudience };

const TABS: ReadonlyArray<{ key: AnalyticsTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "analytics", label: "Analytics" },
  { key: "earnings", label: "Earnings" },
  { key: "referrals", label: "Referrals" },
];

const KPI_LABELS = {
  revenue: "Comisiones generadas",
  lots: "Lots negociados",
  net_deposits: "Depósitos netos",
  signups: "Registros",
  active_traders: "Traders activos",
} as const;

export function utcMonthBounds(date = new Date()): { from: string; to: string } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  return {
    from: `${prefix}-01`,
    to: `${prefix}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatNumber(value: string | number): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numeric)
    : "—";
}

function formatMoney(item: IbAnalyticsMoney): string {
  const numeric = Number(item.amount);
  const currency = item.currency_code ?? "Unresolved";
  const digits = item.currency_precision ?? 2;

  return Number.isFinite(numeric)
    ? `${new Intl.NumberFormat(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(numeric)} ${currency}`
    : `— ${currency}`;
}

function availabilityReason(reason: string | null | undefined): string {
  return reason?.replaceAll("_", " ") ?? "No disponible";
}

function isMoneyAvailability(value: unknown): value is IbAnalyticsMoneyAvailability {
  return typeof value === "object" && value !== null && "currency_groups" in value;
}

function moneyValue(value: IbAnalyticsMoneyAvailability): string {
  return value.currency_groups.length > 0
    ? value.currency_groups.map(formatMoney).join(" · ")
    : "Sin actividad";
}

function KpiCards({
  current,
  previous,
}: {
  current: IbOverviewKpis;
  previous: IbOverviewKpis | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {(Object.keys(KPI_LABELS) as Array<keyof typeof KPI_LABELS>).map((key) => {
        const currentMetric = current[key];
        const previousMetric = previous?.[key] ?? null;
        const value = currentMetric.available
          ? isMoneyAvailability(currentMetric)
            ? moneyValue(currentMetric)
            : formatNumber(currentMetric.value)
          : "Indisponible";
        const previousValue = previousMetric?.available
          ? isMoneyAvailability(previousMetric)
            ? moneyValue(previousMetric)
            : formatNumber(previousMetric.value)
          : null;

        return (
          <Card key={key} size="sm" className="min-h-34">
            <CardHeader>
              <CardTitle>{KPI_LABELS[key]}</CardTitle>
              <p className="text-xs text-muted-foreground">Período actual</p>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-lg font-semibold",
                  !currentMetric.available && "text-muted-foreground",
                )}
              >
                {value}
              </p>
              {currentMetric.available ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Anterior: {previousValue ?? "No disponible"}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  {availabilityReason(currentMetric.reason)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EmptyData() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      No hay datos para este período.
    </p>
  );
}

function toTimestamp(bucket: string): UTCTimestamp | null {
  const value = Math.floor(new Date(`${bucket}T00:00:00Z`).getTime() / 1000);
  return Number.isFinite(value) ? (value as UTCTimestamp) : null;
}

function PerformanceChart({ series }: { series: IbAnalyticsOverview["series"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const currencyGroups = useMemo(() => {
    const groups = new Map<string, IbAnalyticsMoney>();
    series.forEach((item) => item.commission.forEach((commission) => {
      const key = `${commission.currency_code ?? "unresolved"}:${commission.currency_precision ?? ""}`;
      groups.set(key, commission);
    }));
    return Array.from(groups.entries());
  }, [series]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    chartRef.current?.remove();
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 330,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(148, 163, 184, 0.12)", style: LineStyle.Dotted },
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.18)" },
      leftPriceScale: { visible: true, borderColor: "rgba(148, 163, 184, 0.18)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.18)", timeVisible: true },
    });
    const lots = chart.addSeries(HistogramSeries, {
      color: "#5b93e6",
      priceScaleId: "left",
      title: "Lots",
    });
    lots.setData(series.flatMap((item) => {
      const time = toTimestamp(item.bucket);
      const value = Number(item.lots);
      return time !== null && Number.isFinite(value) ? [{ time, value }] : [];
    }));

    if (currencyGroups.length === 1) {
      const [currencyKey, currency] = currencyGroups[0];
      const commission = chart.addSeries(AreaSeries, {
        lineColor: "#4fc18a",
        topColor: "rgba(79, 193, 138, 0.24)",
        bottomColor: "rgba(79, 193, 138, 0.02)",
        lineWidth: 2,
        title: `Comisión (${currency.currency_code ?? "—"})`,
        priceScaleId: "right",
      });
      commission.setData(series.flatMap((item) => {
        const time = toTimestamp(item.bucket);
        const value = item.commission
          .filter((entry) => `${entry.currency_code ?? "unresolved"}:${entry.currency_precision ?? ""}` === currencyKey)
          .reduce((total, entry) => total + Number(entry.amount), 0);
        return time !== null && Number.isFinite(value) ? [{ time, value }] : [];
      }));
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth }));
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [currencyGroups, series]);

  return <div ref={containerRef} className="h-[330px] w-full" />;
}

function DailySeries({ overview }: { overview: IbAnalyticsOverview }) {
  const currencyCount = new Set(
    overview.series.flatMap((item) => item.commission.map((entry) => `${entry.currency_code ?? "unresolved"}:${entry.currency_precision ?? ""}`)),
  ).size;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance over time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lots negociados y comisiones generadas en el período seleccionado.
        </p>
      </CardHeader>
      <CardContent>
        {overview.series.length === 0 ? (
          <EmptyData />
        ) : (
          <><PerformanceChart series={overview.series} />
            <p className="mt-3 text-xs text-muted-foreground">{currencyCount === 1 ? "Barras: lots · línea: comisión" : "Barras: lots. La comisión no se grafica porque el período contiene varias monedas."}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ClientFunnel({ stages }: { stages: IbOverviewFunnelStage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de clientes</CardTitle>
        <p className="text-sm text-muted-foreground">Base: registros del período.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.key}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="capitalize">{stage.key.replaceAll("_", " ")}</span>
              <span className="font-medium">
                {stage.available ? formatNumber(stage.value ?? 0) : "Indisponible"}
              </span>
            </div>
            {stage.available ? (
              <>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(0, Math.min(stage.percentage_of_signups ?? 0, 100))}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stage.percentage_of_signups === null
                    ? "Sin base suficiente"
                    : `${formatNumber(stage.percentage_of_signups)}% de registros`}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                {availabilityReason(stage.reason)}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CommissionBySource({ overview }: { overview: IbAnalyticsOverview }) {
  const labels = {
    cpa: "CPA",
    direct_rebate: "Rebate directo",
    sublevel_rebate: "Rebate subnivel",
  } as const;
  const colors = {
    direct_rebate: "bg-blue-500",
    sublevel_rebate: "bg-emerald-500",
    cpa: "bg-amber-500",
  } as const;
  const groups = new Map<string, { currency: IbAnalyticsMoney; items: typeof overview.commission_by_source.cur }>();
  overview.commission_by_source.cur.forEach((item) => {
    const key = `${item.currency_code ?? "unresolved"}:${item.currency_precision ?? ""}`;
    const group = groups.get(key) ?? { currency: item, items: [] };
    group.items.push(item);
    groups.set(key, group);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comisión por fuente</CardTitle>
        <p className="text-sm text-muted-foreground">
          Agrupada por tipo de recompensa y moneda.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {overview.commission_by_source.cur.length === 0 ? (
          <EmptyData />
        ) : (
          Array.from(groups.entries()).map(([key, group]) => {
            const total = group.items.reduce((sum, item) => sum + Number(item.amount), 0);
            return <div key={key} className="space-y-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm text-muted-foreground">Total</span><strong>{formatMoney({ ...group.currency, amount: String(total) })}</strong></div><div className="flex h-8 overflow-hidden rounded-full bg-muted">{group.items.map((item) => <div key={item.source} className={cn("min-w-0 transition-all", colors[item.source])} style={{ width: `${total > 0 ? (Number(item.amount) / total) * 100 : 0}%` }} title={`${labels[item.source]}: ${formatMoney(item)}`} />)}</div><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">{group.items.map((item) => <span key={`${item.source}-label`} className="flex items-center gap-1.5"><i className={cn("size-2 rounded-full", colors[item.source])} /><span>{labels[item.source]}</span><strong>{formatMoney(item)}</strong><span className="text-muted-foreground">{total > 0 ? `${formatNumber((Number(item.amount) / total) * 100)}%` : "0%"}</span></span>)}</div></div>;
          })
        )}
      </CardContent>
    </Card>
  );
}

function formatAnalyticsMoney(value: number, analytics: IbAnalytics): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: analytics.currency.currency_precision ?? 2,
    maximumFractionDigits: analytics.currency.currency_precision ?? 2,
  }).format(value) + ` ${analytics.currency.currency_code}`;
}

function AnalyticsKpis({ analytics }: { analytics: IbAnalytics }) {
  const kpis = analytics.kpis.cur;
  const completion = kpis.cpa_pipeline_completion;
  const items = [
    ["Lots negociados", formatNumber(kpis.lots_traded), "Volumen con reward de rebate"],
    ["Comisión rebate", formatAnalyticsMoney(kpis.rebate_commission.principal, analytics), "Pendiente, processing y paid"],
    ["Comisión CPA", formatAnalyticsMoney(kpis.cpa_commission.principal, analytics), "CPA registrada en el período"],
    ["Promedio por lot", kpis.average_per_lot === null ? "—" : formatAnalyticsMoney(Number(kpis.average_per_lot), analytics), "Rebate / lots"],
    ["Por trader activo", kpis.commission_per_active_trader === null ? "—" : formatAnalyticsMoney(Number(kpis.commission_per_active_trader), analytics), "Rebate y CPA / traders"],
    ["Conversión CPA", completion.value === null ? "—" : `${formatNumber(Number(completion.value) * 100)}%`, `${completion.paid} paid de ${completion.total} contextos`],
  ] as const;

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{items.map(([label, value, caption]) => <Card key={label} size="sm" className="min-h-34"><CardHeader><CardTitle>{label}</CardTitle><p className="text-xs text-muted-foreground">Período actual</p></CardHeader><CardContent><p className="text-lg font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{caption}</p></CardContent></Card>)}</div>;
}

function AnalyticsSeriesChart({ analytics }: { analytics: IbAnalytics }) {
  const items = analytics.series.items;
  const maxCommission = Math.max(1, ...items.map((item) => item.rebate_commission.principal + item.cpa_commission.principal));
  const maxLots = Math.max(1, ...items.map((item) => item.lots));
  const points = items.map((item, index) => {
    const x = items.length === 1 ? 50 : 4 + (index / (items.length - 1)) * 92;
    const y = 94 - (item.lots / maxLots) * 84;
    return `${x},${y}`;
  }).join(" ");

  return <Card><CardHeader><CardTitle>Volumen vs comisión</CardTitle><p className="text-sm text-muted-foreground">Barras: rebate y CPA · línea: lots · granularidad {analytics.series.granularity === "day" ? "diaria" : "mensual"}.</p></CardHeader><CardContent>{items.length === 0 ? <EmptyData /> : <><div className="h-72 min-w-160 overflow-x-auto"><div className="relative h-full min-w-160"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="Lots negociados"><polyline fill="none" stroke="#4fc18a" strokeWidth="1.2" vectorEffect="non-scaling-stroke" points={points} /></svg><div className="absolute inset-x-2 bottom-5 top-2 flex items-end gap-1">{items.map((item) => { const rebate = (item.rebate_commission.principal / maxCommission) * 100; const cpa = (item.cpa_commission.principal / maxCommission) * 100; return <div key={item.period} className="flex h-full min-w-7 flex-1 flex-col justify-end" title={`${item.period}: rebate ${formatAnalyticsMoney(item.rebate_commission.principal, analytics)}, CPA ${formatAnalyticsMoney(item.cpa_commission.principal, analytics)}, lots ${formatNumber(item.lots)}`}><div className="bg-amber-500/85" style={{ height: `${cpa}%` }} /><div className="bg-blue-500/85" style={{ height: `${rebate}%` }} /><span className="mt-1 truncate text-center text-[10px] text-muted-foreground">{item.period.slice(5)}</span></div>; })}</div></div></div><div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-blue-500" />Rebate</span><span><i className="mr-1.5 inline-block size-2 rounded-sm bg-amber-500" />CPA</span><span><i className="mr-1.5 inline-block size-2 rounded-full bg-emerald-500" />Lots</span></div></>}</CardContent></Card>;
}

const CATEGORY_COLORS = ["#5b93e6", "#e9a72f", "#4fc18a", "#e86a6a", "#9a7ee8", "#76a9ea"];

function CategoryDistribution({ analytics }: { analytics: IbAnalytics }) {
  const items = analytics.by_category.filter((item) => item.lots > 0);
  const total = items.reduce((sum, item) => sum + item.lots, 0);
  const stops = items.reduce<{ offset: number; values: string[] }>((result, item, index) => {
    const start = result.offset;
    const end = start + (total > 0 ? (item.lots / total) * 100 : 0);
    return {
      offset: end,
      values: [...result.values, `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}% ${end}%`],
    };
  }, { offset: 0, values: [] }).values.join(", ");
  return <Card><CardHeader><CardTitle>Distribución por categoría</CardTitle><p className="text-sm text-muted-foreground">Participación de lots negociados.</p></CardHeader><CardContent>{items.length === 0 ? <EmptyData /> : <div className="flex flex-col items-center gap-5 sm:flex-row"><div className="size-44 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}><div className="m-[26%] size-[48%] rounded-full bg-card" /></div><div className="w-full space-y-2">{items.map((item, index) => <div key={item.category} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2"><i className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} /> <span className="truncate">{item.category}</span></span><span className="shrink-0 tabular-nums">{formatNumber(item.lots)} · {total > 0 ? formatNumber((item.lots / total) * 100) : "0"}%</span></div>)}</div></div>}</CardContent></Card>;
}

function HistoricalRule({ rules }: { rules: IbAnalyticsHistoricalRule[] }) {
  if (rules.length !== 1) return <span className="text-muted-foreground">Múltiples</span>;
  const rule = rules[0];
  const rate = rule.level_rate ?? rule.commission_value;
  return <span>{rate === null ? "Snapshot" : `${rate}${rule.commission_type === "percentage" ? "%" : ""}`}<span className="block text-xs text-muted-foreground">Nivel {rule.distribution_level}</span></span>;
}

function CountryTable({ analytics }: { analytics: IbAnalytics }) {
  const countries = analytics.by_country.items;
  return <Card><CardHeader><CardTitle>Volumen y comisión por país</CardTitle><p className="text-sm text-muted-foreground">País y red corresponden al snapshot actual de IAM.</p></CardHeader><CardContent>{countries.length === 0 ? <EmptyData /> : <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>País</TableHead><TableHead className="text-right">Traders</TableHead><TableHead className="text-right">Lots</TableHead><TableHead className="text-right">Net deposits</TableHead><TableHead className="text-right">Comisión</TableHead><TableHead className="text-right">Por lot</TableHead><TableHead className="min-w-44">Share</TableHead></TableRow></TableHeader><TableBody>{countries.map((country) => <TableRow key={country.country_code}><TableCell>{country.country_code}</TableCell><TableCell className="text-right tabular-nums">{country.traders}</TableCell><TableCell className="text-right tabular-nums">{formatNumber(country.lots)}</TableCell><TableCell className="text-right tabular-nums">{analytics.by_country.net_deposits_available && country.net_deposits !== null ? formatAnalyticsMoney(country.net_deposits, analytics) : "Indisponible"}</TableCell><TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">{formatAnalyticsMoney(country.commission.principal, analytics)}</TableCell><TableCell className="text-right tabular-nums">{country.effective_per_lot === null ? "—" : formatAnalyticsMoney(country.effective_per_lot, analytics)}</TableCell><TableCell><div className="flex items-center gap-2"><div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(country.share * 100, 100))}%` }} /></div><span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{formatNumber(country.share * 100)}%</span></div></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>;
}

function SymbolTable({ analytics }: { analytics: IbAnalytics }) {
  return <Card><CardHeader><CardTitle>Comisión por símbolo</CardTitle><p className="text-sm text-muted-foreground">Las reglas son snapshots históricos, no tarifas vigentes.</p></CardHeader><CardContent>{analytics.by_symbol.length === 0 ? <EmptyData /> : <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Categoría</TableHead><TableHead>Programa</TableHead><TableHead>Símbolo</TableHead><TableHead className="text-right">Lots</TableHead><TableHead className="text-right">Comisión</TableHead><TableHead className="text-right">Efectivo por lot</TableHead><TableHead>Regla histórica</TableHead></TableRow></TableHeader><TableBody>{analytics.by_symbol.map((item) => { const effective = item.lots > 0 ? item.commission.principal / item.lots : null; return <TableRow key={`${item.program}-${item.symbol}-${item.category}`}><TableCell>{item.category}</TableCell><TableCell>{item.program ?? "—"}</TableCell><TableCell className="font-mono">{item.symbol ?? "—"}</TableCell><TableCell className="text-right tabular-nums">{formatNumber(item.lots)}</TableCell><TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">{formatAnalyticsMoney(item.commission.principal, analytics)}</TableCell><TableCell className="text-right tabular-nums">{effective === null ? "—" : formatAnalyticsMoney(effective, analytics)}</TableCell><TableCell><HistoricalRule rules={item.historical_rules} /></TableCell></TableRow>; })}</TableBody></Table></div>}</CardContent></Card>;
}

function AnalyticsContent({ analytics }: { analytics: IbAnalytics }) {
  return <div className="space-y-4"><AnalyticsKpis analytics={analytics} /><div className="grid gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(280px,0.75fr)]"><AnalyticsSeriesChart analytics={analytics} /><CategoryDistribution analytics={analytics} /></div><CountryTable analytics={analytics} /><SymbolTable analytics={analytics} /></div>;
}

export function IbAdminAnalyticsView({ beneficiaryId, audience = "admin" }: IbAdminAnalyticsViewProps) {
  const initialRange = useMemo(() => utcMonthBounds(), []);
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [overview, setOverview] = useState<IbAnalyticsOverview | null>(null);
  const [analytics, setAnalytics] = useState<IbAnalytics | null>(null);
  const [earnings, setEarnings] = useState<IbEarnings | null>(null);
  const [referrals, setReferrals] = useState<IbReferrals | null>(null);
  const [referralsGeo, setReferralsGeo] = useState<IbReferralGeo | null>(null);
  const [referralsPage, setReferralsPage] = useState(1);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [referralsError, setReferralsError] = useState<string | null>(null);
  const [earningsStatus, setEarningsStatus] = useState<IbEarningsPaymentStatus | "all">("all");
  const [earningsType, setEarningsType] = useState<IbEarningsType | "all">("all");
  const [earningsQuery, setEarningsQuery] = useState("");
  const [earningsGrain, setEarningsGrain] = useState<IbEarningsGrain>("daily");
  const [earningsCursor, setEarningsCursor] = useState<string | null>(null);
  const [earningsPreviousCursors, setEarningsPreviousCursors] = useState<string[]>([]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "IB Subscriptions", href: "/ib-subscriptions" },
    { label: "IB Analytics", current: true },
  ];

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const response = await getIbAnalyticsOverview(audience, {
        ...(audience === "admin" ? { ib_user_id: beneficiaryId } : {}),
        from,
        to,
      });
      setOverview(response.data);
    } catch (loadError) {
      setOverview(null);
      setOverviewError(formatBrokerApiError(loadError));
    } finally {
      setOverviewLoading(false);
    }
  }, [audience, beneficiaryId, from, to]);

  const loadAnalytics = useCallback(async () => {
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrencyCode)) {
      setAnalytics(null);
      setAnalyticsError("La moneda debe ser un código ISO-3 válido.");
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await getIbAnalytics(audience, {
        ...(audience === "admin" ? { ib_user_id: beneficiaryId } : {}),
        from,
        to,
        currency_code: normalizedCurrencyCode,
      });
      setAnalytics(response.data);
    } catch (loadError) {
      setAnalytics(null);
      setAnalyticsError(formatBrokerApiError(loadError));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [audience, beneficiaryId, currencyCode, from, to]);

  const loadEarnings = useCallback(async () => {
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrencyCode)) {
      setEarnings(null);
      setEarningsError("La moneda debe ser un código ISO-3 válido.");
      return;
    }

    setEarningsLoading(true);
    setEarningsError(null);
    try {
      const response = await getIbEarnings(audience, {
        ...(audience === "admin" ? { ib_user_id: beneficiaryId } : {}),
        from,
        to,
        currency_code: normalizedCurrencyCode,
        status: earningsStatus === "all" ? undefined : [earningsStatus],
        type: earningsType === "all" ? undefined : [earningsType],
        q: earningsQuery.trim() || undefined,
        grain: earningsGrain,
        cursor: earningsCursor ?? undefined,
        limit: 25,
      });
      setEarnings(response.data);
    } catch (loadError) {
      setEarnings(null);
      setEarningsError(formatBrokerApiError(loadError));
    } finally {
      setEarningsLoading(false);
    }
  }, [audience, beneficiaryId, currencyCode, earningsCursor, earningsGrain, earningsQuery, earningsStatus, earningsType, from, to]);

  const loadReferrals = useCallback(async () => {
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrencyCode)) {
      setReferrals(null);
      setReferralsGeo(null);
      setReferralsError("La moneda debe ser un código ISO-3 válido.");
      return;
    }

    setReferralsLoading(true);
    setReferralsError(null);
    try {
      const filters = { ...(audience === "admin" ? { ib_user_id: beneficiaryId } : {}), from, to, currency_code: normalizedCurrencyCode };
      const [listResponse, geoResponse] = await Promise.all([
        getIbReferrals(audience, { ...filters, page: referralsPage, per_page: 25 }),
        getIbReferralsGeo(audience, filters),
      ]);
      setReferrals(listResponse.data);
      setReferralsGeo(geoResponse.data);
    } catch (loadError) {
      setReferrals(null);
      setReferralsGeo(null);
      setReferralsError(formatBrokerApiError(loadError));
    } finally {
      setReferralsLoading(false);
    }
  }, [audience, beneficiaryId, currencyCode, from, referralsPage, to]);

  useEffect(() => {
    if (tab !== "overview") return;
    const frame = requestAnimationFrame(() => void loadOverview());
    return () => cancelAnimationFrame(frame);
  }, [loadOverview, tab]);

  useEffect(() => {
    if (tab !== "analytics") return;
    const frame = requestAnimationFrame(() => void loadAnalytics());
    return () => cancelAnimationFrame(frame);
  }, [loadAnalytics, tab]);

  useEffect(() => {
    if (tab !== "earnings") return;
    const frame = requestAnimationFrame(() => void loadEarnings());
    return () => cancelAnimationFrame(frame);
  }, [loadEarnings, tab]);

  useEffect(() => {
    if (tab !== "referrals") return;
    const frame = requestAnimationFrame(() => void loadReferrals());
    return () => cancelAnimationFrame(frame);
  }, [loadReferrals, tab]);

  const isActiveTabLoading = tab === "overview" ? overviewLoading : tab === "analytics" ? analyticsLoading : tab === "earnings" ? earningsLoading : referralsLoading;
  const reloadActiveTab = () => {
    if (tab === "overview") return loadOverview();
    if (tab === "analytics") return loadAnalytics();
    if (tab === "earnings") return loadEarnings();
    return loadReferrals();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref="/ib-subscriptions"
        backLabel="Volver a suscripciones"
      >
        <Button variant="outline" size="sm" disabled={isActiveTabLoading} onClick={() => void reloadActiveTab()}>
          <RefreshCwIcon className={cn(isActiveTabLoading && "animate-spin")} />
          Actualizar
        </Button>
      </PageContentToolbar>
      <div>
        <h1 className="text-xl font-semibold">IB Analytics</h1>
        <p className="text-sm text-muted-foreground">Reporte administrativo del IB seleccionado.</p>
      </div>
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border bg-background p-1" role="tablist" aria-label="IB Analytics tabs">
        {TABS.map((item) => (
          <Button key={item.key} role="tab" aria-selected={tab === item.key} variant={tab === item.key ? "default" : "ghost"} size="sm" className="shrink-0" onClick={() => setTab(item.key)}>{item.label}</Button>
        ))}
      </div>
      <>
        <Card size="sm">
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(140px,0.65fr)_auto]">
            <div><Label htmlFor="ib-analytics-from">Desde</Label><Input id="ib-analytics-from" className="mt-1" type="date" value={from} max={to} onChange={(event) => { setFrom(event.target.value); setEarningsCursor(null); setEarningsPreviousCursors([]); setReferralsPage(1); }} /></div>
            <div><Label htmlFor="ib-analytics-to">Hasta</Label><Input id="ib-analytics-to" className="mt-1" type="date" value={to} min={from} onChange={(event) => { setTo(event.target.value); setEarningsCursor(null); setEarningsPreviousCursors([]); setReferralsPage(1); }} /></div>
            {tab === "analytics" || tab === "earnings" || tab === "referrals" ? <div><Label htmlFor="ib-analytics-currency">Moneda</Label><Input id="ib-analytics-currency" className="mt-1 uppercase" value={currencyCode} maxLength={3} list="ib-analytics-currencies" onChange={(event) => { setCurrencyCode(event.target.value.toUpperCase()); setEarningsCursor(null); setEarningsPreviousCursors([]); setReferralsPage(1); }} /><datalist id="ib-analytics-currencies"><option value="USD" /><option value="EUR" /><option value="GBP" /><option value="JPY" /></datalist></div> : <div className="hidden xl:block" />}
            <Button className="self-end" disabled={isActiveTabLoading || !from || !to || from > to || ((tab === "analytics" || tab === "earnings" || tab === "referrals") && !/^[A-Z]{3}$/.test(currencyCode.trim()))} onClick={() => void reloadActiveTab()}>Aplicar rango</Button>
          </CardContent>
        </Card>
        {tab === "overview" ? <>
          {overviewError ? <ApiErrorAlert title="No se pudo cargar el overview IB" message={overviewError} /> : null}
          {overviewLoading ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div><Skeleton className="h-80 w-full" /></> : overview ? <div className="space-y-4"><KpiCards current={overview.kpis.cur} previous={overview.kpis.prev} /><div className="grid gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(280px,0.75fr)]"><DailySeries overview={overview} /><ClientFunnel stages={overview.client_funnel.stages} /></div><CommissionBySource overview={overview} /></div> : null}
        </> : tab === "analytics" ? <>
          {analyticsError ? <ApiErrorAlert title="No se pudo cargar Analytics IB" message={analyticsError} /> : null}
          {analyticsLoading ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div><Skeleton className="h-80 w-full" /></> : analytics ? <AnalyticsContent analytics={analytics} /> : null}
        </> : tab === "earnings" ? <>
          {earningsError ? <ApiErrorAlert title="No se pudo cargar Earnings IB" message={earningsError} /> : null}
          {earningsLoading ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div><Skeleton className="h-96 w-full" /></> : earnings ? <IbEarningsContent earnings={earnings} loading={earningsLoading} controls={{ status: earningsStatus, type: earningsType, q: earningsQuery, grain: earningsGrain }} dailyRequestFilters={{ ib_user_id: beneficiaryId, from, to, currency_code: currencyCode.trim().toUpperCase(), status: earningsStatus === "all" ? undefined : [earningsStatus], type: earningsType === "all" ? undefined : [earningsType], q: earningsQuery.trim() || undefined }} hasPreviousPage={earningsPreviousCursors.length > 0} onControlsChange={(controls) => { setEarningsStatus(controls.status); setEarningsType(controls.type); setEarningsQuery(controls.q); setEarningsGrain(controls.grain); setEarningsCursor(null); setEarningsPreviousCursors([]); }} onPreviousPage={() => { const previous = earningsPreviousCursors.at(-1) ?? null; setEarningsPreviousCursors((cursors) => cursors.slice(0, -1)); setEarningsCursor(previous); }} onNextPage={() => { if (!earnings.next_cursor) return; setEarningsPreviousCursors((cursors) => [...cursors, earningsCursor ?? ""]); setEarningsCursor(earnings.next_cursor); }} /> : null}
        </> : <>
          {referralsError ? <ApiErrorAlert title="No se pudieron cargar los referrals IB" message={referralsError} /> : null}
          {referralsLoading ? <><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></> : referrals ? <IbReferralsContent referrals={referrals} geo={referralsGeo} filters={{ ib_user_id: beneficiaryId, from, to, currency_code: currencyCode.trim().toUpperCase() }} onPageChange={setReferralsPage} /> : null}
        </>}
      </>
    </div>
  );
}
