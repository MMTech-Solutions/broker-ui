"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAccountAnalyticsDaily,
  getAccountAnalyticsDailyDayTrades,
  getAccountAnalyticsOverview,
  getAccountAnalyticsPnlDistribution,
  getAccountAnalyticsProfitability,
  getAccountAnalyticsSessions,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsCumulativePnlPoint,
  AnalyticsDaily,
  AnalyticsDailyDayTrades,
  AnalyticsOverview,
  AnalyticsPnlDistribution,
  AnalyticsProfitability,
  AnalyticsSessions,
  AnalyticsValueBucket,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientAnalyticsProfitabilityPanelProps = {
  accountId: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

type CumulativeGranularity = "day" | "week" | "month";
type ProfitFactorSeriesPoint = {
  label: string;
  tradeIndex: number;
  value: number | null;
};

function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number, digits = 2): string {
  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${formatNumber(pct, digits)}%`;
}

function formatCurrency(value: number, digits = 2): string {
  return `${formatNumber(value, digits)} US$`;
}

function formatMetric(
  value: number | null | undefined,
  formatter: (value: number) => string,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatter(value);
}

function ProfitabilityKpiCard({
  title,
  subtitle,
  value,
}: {
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex min-h-[112px] flex-col gap-3 pt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function AnalyticsPanelCard({
  title,
  subtitle,
  kicker,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  kicker?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("rounded-[28px]", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {kicker ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {kicker}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-[170px] items-center justify-center rounded-3xl border border-dashed bg-muted/10 px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function EdgeMap({
  winRate,
  payoffRatio,
}: {
  winRate: number;
  payoffRatio: number;
}) {
  const width = 420;
  const height = 180;
  const padding = 24;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const maxX = Math.max(3, payoffRatio + 0.75);
  const x = padding + Math.min(payoffRatio / maxX, 1) * plotWidth;
  const y = padding + (1 - Math.min(Math.max(winRate, 0), 1)) * plotHeight;

  const curvePoints = Array.from({ length: 24 }, (_, index) => {
    const px = (index / 23) * maxX;
    const py = 1 / (1 + px);
    return `${padding + (px / maxX) * plotWidth},${
      padding + (1 - py) * plotHeight
    }`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="currentColor"
        className="text-border"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="currentColor"
        className="text-border"
      />
      <polyline
        fill="none"
        stroke="currentColor"
        className="text-muted-foreground"
        strokeDasharray="4 4"
        strokeWidth="1.5"
        points={curvePoints}
      />
      <circle cx={x} cy={y} r="6" fill="#10b981" />
      <text
        x={x + 10}
        y={y - 8}
        fontSize="11"
        fill="currentColor"
        className="text-emerald-600"
      >
        Current edge
      </text>
      <text
        x={padding}
        y={14}
        fontSize="11"
        fill="currentColor"
        className="text-muted-foreground"
      >
        Win rate
      </text>
      <text
        x={width - padding - 56}
        y={height - 8}
        fontSize="11"
        fill="currentColor"
        className="text-muted-foreground"
      >
        Payoff
      </text>
    </svg>
  );
}

function HistogramBlocks({
  buckets,
  formatter,
}: {
  buckets: AnalyticsValueBucket[];
  formatter?: (bucket: AnalyticsValueBucket) => string;
}) {
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 0);

  if (!buckets.length || maxCount <= 0) {
    return null;
  }

  return (
    <div className="flex min-h-[180px] items-end gap-2 rounded-3xl border bg-muted/10 p-4">
      {buckets.map((bucket) => (
        <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="text-[11px] font-medium text-muted-foreground">
            {bucket.count}
          </div>
          <div
            className="w-full rounded-t-xl bg-emerald-500/75"
            style={{ height: `${Math.max((bucket.count / maxCount) * 120, 8)}px` }}
          />
          <div className="text-center text-[11px] text-muted-foreground">
            {formatter ? formatter(bucket) : bucket.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ points }: { points: AnalyticsCumulativePnlPoint[] }) {
  if (points.length < 2) {
    return null;
  }

  const width = 520;
  const height = 190;
  const padding = 18;
  const values = points.map((point) => point.pnl_cum);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((point.pnl_cum - min) / span) * (height - padding * 2);

      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full">
      <path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="currentColor"
        className="text-border"
      />
    </svg>
  );
}

function buildProfitFactorSeries(
  dayTrades: AnalyticsDailyDayTrades[],
): ProfitFactorSeriesPoint[] {
  const rows = dayTrades
    .flatMap((day) => day.rows)
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(left.closed_at ?? left.opened_at ?? 0).getTime();
      const rightTime = new Date(right.closed_at ?? right.opened_at ?? 0).getTime();
      return leftTime - rightTime;
    });

  let grossProfit = 0;
  let grossLossAbs = 0;

  return rows.map((row, index) => {
    if (row.net_pnl >= 0) {
      grossProfit += row.net_pnl;
    } else {
      grossLossAbs += Math.abs(row.net_pnl);
    }

    return {
      label: row.closed_at ?? row.opened_at ?? `Trade ${index + 1}`,
      tradeIndex: index + 1,
      value: grossLossAbs > 0 ? grossProfit / grossLossAbs : null,
    };
  });
}

function MiniProfitFactorChart({
  points,
}: {
  points: ProfitFactorSeriesPoint[];
}) {
  const plottedPoints = points.filter(
    (point): point is ProfitFactorSeriesPoint & { value: number } =>
      point.value !== null,
  );

  if (plottedPoints.length < 2) {
    return null;
  }

  const width = 520;
  const height = 190;
  const padding = 18;
  const values = plottedPoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const pathSegments = plottedPoints
    .map((point, index) => {
      const x =
        padding + (index / (plottedPoints.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((point.value - min) / span) * (height - padding * 2);

      return { command: `${index === 0 ? "M" : "L"}${x},${y}`, x, y };
    })
    .filter(Boolean);

  const path = pathSegments.map((segment) => segment.command).join(" ");
  const firstPoint = pathSegments[0];
  const lastPoint = pathSegments[pathSegments.length - 1];
  const areaPath = `${path} L${lastPoint.x},${height - padding} L${firstPoint.x},${
    height - padding
  } Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full">
      <path d={areaPath} fill="rgba(59,130,246,0.14)" />
      <path
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={padding}
        y1={padding}
        x2={width - padding}
        y2={padding}
        stroke="currentColor"
        className="text-border"
      />
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="currentColor"
        className="text-border"
      />
    </svg>
  );
}

function BreakEvenGauge({
  marginPts,
  winRate,
  breakevenWinRate,
}: {
  marginPts: number;
  winRate: number;
  breakevenWinRate: number;
}) {
  const clamped = Math.max(-20, Math.min(20, marginPts));
  const markerPosition = ((clamped + 20) / 40) * 100;

  return (
    <div className="space-y-4">
      <div className="text-5xl font-semibold tabular-nums">
        {marginPts >= 0 ? "+" : ""}
        {formatNumber(marginPts, 1)} pts
      </div>
      <p className="text-sm text-muted-foreground">
        {marginPts >= 0
          ? "You are above the break-even win rate."
          : "You are below the break-even win rate."}
      </p>
      <div className="rounded-[32px] border bg-muted/10 p-5">
        <div className="relative h-16 overflow-hidden rounded-full bg-[linear-gradient(90deg,rgba(244,63,94,0.25)_0%,rgba(100,116,139,0.2)_50%,rgba(16,185,129,0.25)_100%)]">
          <div className="absolute inset-y-3 left-1/2 w-px bg-border" />
          <div
            className="absolute top-2 h-12 w-1 rounded-full bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.6)]"
            style={{ left: `calc(${markerPosition}% - 2px)` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>-20 pts</span>
          <span>0</span>
          <span>+20 pts</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricStatTile label="Your WR" value={formatPercent(winRate, 1)} />
        <MetricStatTile
          label="Break-even WR"
          value={formatPercent(breakevenWinRate, 1)}
        />
      </div>
    </div>
  );
}

function MetricStatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/10 p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ExpectancyContributionBar({
  positive,
  negative,
}: {
  positive: number;
  negative: number;
}) {
  const total = Math.abs(positive) + Math.abs(negative) || 1;
  const positiveWidth = (Math.abs(positive) / total) * 100;
  const negativeWidth = (Math.abs(negative) / total) * 100;

  return (
    <div className="overflow-hidden rounded-2xl border bg-muted/10">
      <div className="flex h-18">
        <div
          className="flex items-center justify-end bg-emerald-500/85 px-4 text-sm font-semibold text-white"
          style={{ width: `${positiveWidth}%` }}
        >
          +{formatNumber(positive)}
        </div>
        <div
          className="flex items-center justify-end bg-rose-500/85 px-4 text-sm font-semibold text-white"
          style={{ width: `${negativeWidth}%` }}
        >
          {formatNumber(negative)}
        </div>
      </div>
    </div>
  );
}

function WaterfallChart({
  gross,
  commissions,
  swaps,
  net,
}: {
  gross: number;
  commissions: number;
  swaps: number;
  net: number;
}) {
  const bars = [
    { label: "Gross PnL", value: gross, color: "bg-blue-500" },
    { label: "Commissions", value: commissions, color: "bg-rose-500" },
    { label: "Swaps", value: swaps, color: "bg-slate-500" },
    { label: "Net PnL", value: net, color: "bg-blue-500" },
  ];
  const maxAbs = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <div className="rounded-3xl border bg-muted/10 p-5">
      <div className="grid h-[240px] grid-cols-4 items-end gap-8">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full flex-col justify-end gap-3">
            <div className="relative flex-1">
              <div className="absolute top-6 right-0 left-0 h-px bg-border" />
              <div
                className={cn(
                  "absolute top-6 left-1/2 w-12 -translate-x-1/2 rounded-t-xl rounded-b-sm",
                  bar.color,
                )}
                style={{
                  height: `${Math.max((Math.abs(bar.value) / maxAbs) * 130, 8)}px`,
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-[11px] text-muted-foreground">{bar.label}</div>
              <div className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(bar.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DirectionBreakdown({
  side,
  trades,
  netPnl,
  winRate,
  profitFactor,
  expectancy,
}: {
  side: string;
  trades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
}) {
  const isPositive = netPnl >= 0;

  return (
    <div className="rounded-3xl border bg-muted/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium capitalize">{side}</div>
          <div className="text-xs text-muted-foreground">{trades} trades</div>
        </div>
        <div
          className={cn(
            "text-2xl font-semibold tabular-nums",
            isPositive ? "text-emerald-600" : "text-rose-500",
          )}
        >
          {formatCurrency(netPnl)}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricStatTile label="Win %" value={formatPercent(winRate, 0)} />
        <MetricStatTile
          label="PF"
          value={profitFactor > 0 ? formatNumber(profitFactor) : "—"}
        />
        <MetricStatTile label="Exp." value={formatCurrency(expectancy)} />
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 rounded-full bg-muted">
      <div
        className="h-3 rounded-full bg-amber-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function SessionBars({ sessions }: { sessions: AnalyticsSessions["sessions"] }) {
  const maxAbs = Math.max(...sessions.map((entry) => Math.abs(entry.net_pnl)), 1);

  return (
    <div className="rounded-3xl border bg-muted/10 p-5">
      <div className="grid h-[220px] grid-cols-4 items-end gap-6">
        {sessions.map((entry) => (
          <div key={entry.session} className="flex h-full flex-col justify-end gap-3">
            <div className="relative flex-1">
              <div className="absolute top-4 right-0 left-0 h-px bg-border" />
              <div
                className={cn(
                  "absolute top-4 left-1/2 w-9 -translate-x-1/2 rounded-t-lg rounded-b-sm",
                  entry.net_pnl >= 0 ? "bg-emerald-500" : "bg-rose-500",
                )}
                style={{
                  height: `${Math.max((Math.abs(entry.net_pnl) / maxAbs) * 135, 8)}px`,
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-[11px] capitalize text-muted-foreground">
                {entry.session}
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(entry.net_pnl)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientAnalyticsProfitabilityPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
}: ClientAnalyticsProfitabilityPanelProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [profitability, setProfitability] = useState<AnalyticsProfitability | null>(
    null,
  );
  const [daily, setDaily] = useState<AnalyticsDaily | null>(null);
  const [distribution, setDistribution] =
    useState<AnalyticsPnlDistribution | null>(null);
  const [sessionsData, setSessionsData] = useState<AnalyticsSessions | null>(null);
  const [profitFactorSeries, setProfitFactorSeries] = useState<
    ProfitFactorSeriesPoint[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<CumulativeGranularity>("day");

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [overviewResponse, profitabilityResponse, dailyResponse, distributionResponse, sessionsResponse] =
          await Promise.all([
            getAccountAnalyticsOverview(accountId, {
              from_utc: fromUtc,
              to_utc: toUtc,
              symbol,
              side,
              session,
            }),
            getAccountAnalyticsProfitability(accountId, {
              from_utc: fromUtc,
              to_utc: toUtc,
              symbol,
              side,
              session,
            }),
            getAccountAnalyticsDaily(accountId, {
              from_utc: fromUtc,
              to_utc: toUtc,
              symbol,
              side,
              session,
            }),
            getAccountAnalyticsPnlDistribution(accountId, {
              from_utc: fromUtc,
              to_utc: toUtc,
              symbol,
              side,
              session,
            }),
            getAccountAnalyticsSessions(accountId, {
              from_utc: fromUtc,
              to_utc: toUtc,
              symbol,
              side,
              session,
            }),
          ]);

        let nextProfitFactorSeries: ProfitFactorSeriesPoint[] = [];
        if (overviewResponse.data.kpis.trades >= 2 && dailyResponse.data.days.length) {
          const dayTradesResponses = await Promise.all(
            dailyResponse.data.days.map((day) =>
              getAccountAnalyticsDailyDayTrades(accountId, day.date_utc, {
                from_utc: fromUtc,
                to_utc: toUtc,
                symbol,
                side,
                session,
              }),
            ),
          );

          nextProfitFactorSeries = buildProfitFactorSeries(
            dayTradesResponses.map((response) => response.data),
          );
        }

        if (!cancelled) {
          setOverview(overviewResponse.data);
          setProfitability(profitabilityResponse.data);
          setDaily(dailyResponse.data);
          setDistribution(distributionResponse.data);
          setSessionsData(sessionsResponse.data);
          setProfitFactorSeries(nextProfitFactorSeries);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setOverview(null);
          setProfitability(null);
          setDaily(null);
          setDistribution(null);
          setSessionsData(null);
          setProfitFactorSeries([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [accountId, fromUtc, toUtc, refreshToken, active, symbol, side, session]);

  const cumulativePoints = useMemo(() => {
    if (!daily) {
      return [];
    }

    return daily.cumulative_pnl[granularity] ?? [];
  }, [daily, granularity]);

  if (loading && !profitability) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="rounded-3xl">
              <CardContent className="pt-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-4 h-10 w-24" />
                <Skeleton className="mt-3 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-[28px]">
          <CardContent className="pt-6">
            <Skeleton className="h-[16rem] w-full rounded-3xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorAlert
        title="No se pudo cargar Profitability"
        message={error}
      />
    );
  }

  if (!overview || !profitability || !daily || !distribution || !sessionsData) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos de profitability para esta cuenta.
      </p>
    );
  }

  const trades = overview.kpis.trades;
  const hasTrades = trades > 0;
  const hasMultipleTrades = trades >= 2;
  const breakEvenMargin = (
    profitability.edge.win_rate - profitability.edge.breakeven_win_rate
  ) * 100;
  const sides = profitability.sides;
  const latestProfitFactorPoint =
    profitFactorSeries.findLast((point) => point.value !== null) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <ProfitabilityKpiCard
          title="Profit Factor"
          subtitle="gross profit / gross loss"
          value={hasTrades ? formatNumber(profitability.concentration.profit_factor) : "—"}
        />
        <ProfitabilityKpiCard
          title="Expectancy / Trade"
          subtitle="avg winner less avg loser"
          value={hasTrades ? formatCurrency(profitability.expectancy.expectancy) : "—"}
        />
        <ProfitabilityKpiCard
          title="Payoff Ratio"
          subtitle="avg win / avg loss"
          value={hasTrades ? formatNumber(profitability.edge.payoff_ratio) : "—"}
        />
        <ProfitabilityKpiCard
          title="Win Rate"
          subtitle="vs break-even"
          value={hasTrades ? formatPercent(profitability.edge.win_rate) : "—"}
        />
        <ProfitabilityKpiCard
          title="Cost Drag"
          subtitle="commissions + swaps on gross +"
          value={hasTrades ? formatPercent(overview.costs.cost_drag_pct) : "—"}
        />
        <ProfitabilityKpiCard
          title="PnL per Lot"
          subtitle="efficiency per lot traded"
          value={hasTrades ? formatCurrency(profitability.pnl_per_lot) : "—"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <AnalyticsPanelCard
          title="Edge map"
          subtitle="Your point (win rate, payoff) vs the WR = 1/(1+payoff) curve. Below the line -> PF < 1."
          kicker={profitability.edge.edge_pct > 0 ? "Do you have edge?" : undefined}
        >
          {hasTrades ? (
            <EdgeMap
              winRate={profitability.edge.win_rate}
              payoffRatio={profitability.edge.payoff_ratio}
            />
          ) : (
            <EmptyPanel message="You need winning and losing trades for the edge map." />
          )}
        </AnalyticsPanelCard>

        <AnalyticsPanelCard
          title="Break-even margin"
          subtitle="Current WR - minimum WR, in percentage points."
          kicker="Edge KPI"
        >
          {hasTrades ? (
            <BreakEvenGauge
              marginPts={breakEvenMargin}
              winRate={profitability.edge.win_rate}
              breakevenWinRate={profitability.edge.breakeven_win_rate}
            />
          ) : (
            <EmptyPanel message="No data in the selected range." />
          )}
        </AnalyticsPanelCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanelCard
          title="Expectancy equation"
          subtitle="Breakdown: what winners add vs what losers subtract, per trade."
          kicker="Why am I winning?"
        >
          {hasTrades ? (
            <div className="space-y-4">
              <ExpectancyContributionBar
                positive={profitability.expectancy.win_contribution}
                negative={profitability.expectancy.loss_contribution}
              />
              <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.9fr]">
                <div className="rounded-3xl border bg-muted/10 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600">
                    Winners
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {formatPercent(profitability.expectancy.win_rate, 1)} x{" "}
                    {formatCurrency(profitability.expectancy.avg_win)}
                  </div>
                </div>
                <div className="rounded-3xl border bg-muted/10 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500">
                    Losers
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {formatPercent(profitability.expectancy.loss_rate, 1)} x{" "}
                    {formatCurrency(profitability.expectancy.avg_loss)}
                  </div>
                </div>
                <div className="rounded-3xl border bg-muted/10 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Expectancy / trade
                  </div>
                  <div className="mt-3 text-3xl font-semibold">
                    {formatCurrency(profitability.expectancy.expectancy)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    WinRate*AvgWin - LossRate*AvgLoss
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyPanel message="No data in the selected range." />
          )}
        </AnalyticsPanelCard>

        <AnalyticsPanelCard
          title="Profit factor over time"
          subtitle="Cumulative PF trade by trade. Complements the Behavior tab rolling win rate."
          kicker="Edge evolution"
        >
          {profitFactorSeries.filter((point) => point.value !== null).length >= 2 ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border bg-muted/10 p-4">
                  <div className="text-xs text-muted-foreground">Latest PF</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {latestProfitFactorPoint?.value !== null &&
                    latestProfitFactorPoint?.value !== undefined
                      ? formatNumber(latestProfitFactorPoint.value)
                      : "—"}
                  </div>
                </div>
                <div className="rounded-3xl border bg-muted/10 p-4">
                  <div className="text-xs text-muted-foreground">Trades processed</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {profitFactorSeries.length}
                  </div>
                </div>
              </div>
              <MiniProfitFactorChart points={profitFactorSeries} />
            </div>
          ) : hasMultipleTrades ? (
            <EmptyPanel message="Need both winners and losers in chronological trades to compute cumulative PF." />
          ) : (
            <EmptyPanel message="You need at least 2 closed trades in the range." />
          )}
        </AnalyticsPanelCard>
      </div>

      <AnalyticsPanelCard
        title="Waterfall: Gross -> Net"
        subtitle="Impact of commissions and swaps on realized PnL in the range."
        kicker="Operating cost"
      >
        {hasTrades ? (
          <WaterfallChart
            gross={overview.costs.gross_pnl}
            commissions={-Math.abs(overview.costs.commission_sum)}
            swaps={-Math.abs(overview.costs.swap_sum)}
            net={overview.costs.net_pnl}
          />
        ) : (
          <EmptyPanel message="No data in the selected range." />
        )}
      </AnalyticsPanelCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanelCard
          title="Cumulative realized PnL"
          subtitle="Running sum of closed-trade PnL, grouped by day."
        >
          <div className="mb-4 flex justify-end gap-1">
            {(["day", "week", "month"] as CumulativeGranularity[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGranularity(option)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  granularity === option
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          {cumulativePoints.length >= 2 ? (
            <MiniLineChart points={cumulativePoints} />
          ) : (
            <EmptyPanel message="You need at least 2 active periods in the range." />
          )}
        </AnalyticsPanelCard>

        <AnalyticsPanelCard
          title="PnL distribution per trade"
          subtitle="Long left tail = poorly managed losses."
          kicker="Distribution shape"
        >
          {distribution.buckets.length ? (
            <HistogramBlocks buckets={distribution.buckets} />
          ) : (
            <EmptyPanel message="No data in the selected range." />
          )}
        </AnalyticsPanelCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanelCard
          title="R-multiple distribution"
          subtitle="Each trade PnL in multiples of initial risk (R). How much you make when you win."
          kicker="Trade quality"
        >
          {profitability.r_multiple.buckets.length ? (
            <HistogramBlocks
              buckets={profitability.r_multiple.buckets}
              formatter={(bucket) => bucket.label}
            />
          ) : (
            <EmptyPanel message="No per-trade risk basis (R) in the range." />
          )}
        </AnalyticsPanelCard>

        <AnalyticsPanelCard
          title="Long vs Short"
          subtitle="Do you extract edge on the long or short side?"
          kicker="By direction"
        >
          {sides.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {sides.map((entry) => (
                <DirectionBreakdown
                  key={entry.side}
                  side={entry.side}
                  trades={entry.trades}
                  netPnl={entry.net_pnl}
                  winRate={entry.win_rate}
                  profitFactor={entry.profit_factor}
                  expectancy={entry.expectancy}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel message="No data in the selected range." />
          )}
        </AnalyticsPanelCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanelCard
          title="Profit concentration"
          subtitle="Is your edge real or carried by a few trades?"
          kicker="Robustness"
        >
          {hasTrades ? (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Top-5 of gross +</span>
                  <span className="font-semibold tabular-nums">
                    {formatPercent(profitability.concentration.top5_pct_of_gross)}
                  </span>
                </div>
                <ProgressBar
                  value={profitability.concentration.top5_pct_of_gross}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Your profit depends{" "}
                  {profitability.concentration.top5_pct_of_gross >= 70
                    ? "heavily"
                    : "moderately"}{" "}
                  on a few trades.
                </p>
              </div>
              <MetricRow
                label="Best trade"
                value={formatCurrency(profitability.concentration.best_trade)}
              />
              <MetricRow
                label="PF ex best"
                value={formatNumber(profitability.concentration.profit_factor_ex_best)}
              />
              <MetricRow
                label="Winners for half"
                value={String(profitability.concentration.winners_for_half)}
              />
            </div>
          ) : (
            <EmptyPanel message="No winning trades in the range." />
          )}
        </AnalyticsPanelCard>

        <AnalyticsPanelCard
          title="Net PnL by session"
          subtitle="Session by open hour (UTC)."
          kicker="Market timing"
        >
          {sessionsData.sessions.length ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {sessionsData.session_windows
                  .map(
                    (window) =>
                      `${window.session} ${window.start_hour_utc}-${window.end_hour_utc}`,
                  )
                  .join(" • ")}
              </p>
              <SessionBars sessions={sessionsData.sessions} />
            </div>
          ) : (
            <EmptyPanel message="No data in the selected range." />
          )}
        </AnalyticsPanelCard>
      </div>
    </div>
  );
}

function WaterfallStep({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-3xl border bg-muted/10 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "positive"
            ? "text-emerald-600"
            : tone === "negative"
              ? "text-rose-500"
              : "text-foreground",
        )}
      >
        {formatMetric(value, formatCurrency)}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
