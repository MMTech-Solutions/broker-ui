"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAccountAnalyticsDurationScatter,
  getAccountAnalyticsSessions,
  getAccountAnalyticsTimeHeatmap,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsDurationScatter,
  AnalyticsSessions,
  AnalyticsTimeHeatmap,
  AnalyticsTimeHeatmapCell,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientAnalyticsTemporalPanelProps = {
  accountId: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number, digits = 1): string {
  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${formatNumber(pct, digits)}%`;
}

function formatSignedCurrency(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : "-"}$${formatNumber(Math.abs(value), digits)}`;
}

function formatHours(seconds: number, digits = 1): string {
  return `${formatNumber(seconds / 3600, digits)}h`;
}

function PanelCard({
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

function heatCellColor(cell: AnalyticsTimeHeatmapCell | undefined) {
  if (!cell || cell.trades <= 0) {
    return "bg-muted/10 text-muted-foreground";
  }

  if (cell.win_rate >= 0.7) {
    return "bg-emerald-500/35 text-emerald-50";
  }

  if (cell.win_rate >= 0.5) {
    return "bg-blue-500/35 text-blue-50";
  }

  if (cell.win_rate > 0) {
    return "bg-rose-500/25 text-rose-50";
  }

  return "bg-muted/10 text-muted-foreground";
}

function HourWeekdayHeatmap({ data }: { data: AnalyticsTimeHeatmap }) {
  const weekdays = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 7 },
  ];
  const hourBlocks = [0, 3, 6, 9, 12, 15, 18, 21];
  const cells = new Map(
    data.cells.map((cell) => [`${cell.weekday}-${cell.hour_block}`, cell]),
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[48px_repeat(8,minmax(0,1fr))] gap-2 text-[11px] text-muted-foreground">
        <div />
        {hourBlocks.map((hour) => (
          <div key={hour} className="text-center">
            {hour}h
          </div>
        ))}
      </div>

      {weekdays.map((weekday) => (
        <div
          key={weekday.value}
          className="grid grid-cols-[48px_repeat(8,minmax(0,1fr))] gap-2"
        >
          <div className="flex items-center text-xs text-muted-foreground">
            {weekday.label}
          </div>
          {hourBlocks.map((hour) => {
            const cell = cells.get(`${weekday.value}-${hour}`);
            return (
              <div
                key={`${weekday.value}-${hour}`}
                className="group relative"
              >
                <div
                  className={cn(
                    "flex h-14 items-center justify-center rounded-xl border text-xs font-medium tabular-nums",
                    heatCellColor(cell),
                  )}
                >
                  {cell?.trades ? formatPercent(cell.win_rate, 0) : ""}
                </div>

                {cell?.trades ? (
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-40 -translate-x-1/2 rounded-xl border bg-popover px-3 py-2 text-left text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    <div className="mb-2 font-medium">
                      {weekday.label}: {hour}h-{hour + 3}h
                    </div>
                    <div className="flex items-center justify-between gap-3 text-muted-foreground">
                      <span>Trades</span>
                      <span className="font-medium text-foreground">{cell.trades}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-muted-foreground">
                      <span>Win rate</span>
                      <span className="font-medium text-foreground">
                        {formatPercent(cell.win_rate, 0)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-muted-foreground">
                      <span>Net PnL</span>
                      <span
                        className={cn(
                          "font-medium",
                          cell.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500",
                        )}
                      >
                        {formatSignedCurrency(cell.net_pnl)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SessionBars({ sessions }: { sessions: AnalyticsSessions }) {
  if (!sessions.sessions.length) {
    return <EmptyPanel message="No session stats for the selected range." />;
  }

  const ordered = ["sydney", "tokyo", "london", "ny"].map((key) =>
    sessions.sessions.find((item) => item.session === key),
  );
  const maxAbs = Math.max(
    ...ordered.map((item) => Math.abs(item?.net_pnl ?? 0)),
    1,
  );

  return (
    <div className="space-y-5">
      <div className="grid h-[180px] grid-cols-4 items-end gap-5 rounded-3xl border bg-muted/10 p-5">
        {ordered.map((item, index) => {
          const label = item?.session ?? ["sydney", "tokyo", "london", "new york"][index];
          return (
            <div key={label} className="flex h-full flex-col justify-end gap-2">
              <div className="relative flex-1">
                <div className="absolute top-4 right-0 left-0 h-px bg-border" />
                <div
                  className={cn(
                    "absolute bottom-0 left-1/2 w-10 -translate-x-1/2 rounded-t-md",
                    (item?.net_pnl ?? 0) >= 0 ? "bg-emerald-500" : "bg-rose-500",
                  )}
                  style={{
                    height: `${Math.max((Math.abs(item?.net_pnl ?? 0) / maxAbs) * 120, item ? 8 : 2)}px`,
                  }}
                />
              </div>
              <div className="text-center text-[11px] text-muted-foreground">
                {label === "ny" ? "New York" : label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {ordered.map((item, index) => {
          const label = item?.session ?? ["sydney", "tokyo", "london", "ny"][index];
          return (
            <div key={`${label}-card`} className="rounded-2xl border bg-muted/10 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {label === "ny" ? "New York" : label}
              </div>
              <div className="mt-3 text-lg font-semibold tabular-nums">
                {item ? formatPercent(item.win_rate, 1) : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item ? `${item.trades} trades` : "0 trades"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DurationScatterPlot({ data }: { data: AnalyticsDurationScatter }) {
  if (!data.points.length) {
    return <EmptyPanel message="No closed trades to plot in this range." />;
  }

  const width = 620;
  const height = 260;
  const padding = 24;
  const maxDuration = Math.max(...data.points.map((point) => point.duration_sec / 3600), 1);
  const maxAbsPnl = Math.max(...data.points.map((point) => Math.abs(point.pnl)), 1);
  const zeroY = height / 2;

  const points = data.points.map((point) => {
    const x = padding + ((point.duration_sec / 3600) / maxDuration) * (width - padding * 2);
    const y = zeroY - (point.pnl / maxAbsPnl) * ((height - padding * 2) / 2);
    return { ...point, x, y };
  });

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full">
        <line
          x1={padding}
          y1={zeroY}
          x2={width - padding}
          y2={zeroY}
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

        {points.map((point, index) => (
          <circle
            key={`${point.symbol}-${point.duration_sec}-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            className={point.pnl >= 0 ? "fill-emerald-500" : "fill-rose-500"}
          >
            <title>
              {`${point.symbol} · ${formatHours(point.duration_sec, 1)} · ${formatSignedCurrency(point.pnl)}`}
            </title>
          </circle>
        ))}
      </svg>

      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            trade +
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            trade -
          </span>
        </div>
        <span>avg duration {formatHours(data.avg_duration_sec, 1)}</span>
      </div>
    </div>
  );
}

export function ClientAnalyticsTemporalPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
}: ClientAnalyticsTemporalPanelProps) {
  const [heatmap, setHeatmap] = useState<AnalyticsTimeHeatmap | null>(null);
  const [sessions, setSessions] = useState<AnalyticsSessions | null>(null);
  const [scatter, setScatter] = useState<AnalyticsDurationScatter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [heatmapResponse, sessionsResponse, scatterResponse] = await Promise.all([
          getAccountAnalyticsTimeHeatmap(accountId, {
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
          getAccountAnalyticsDurationScatter(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
        ]);

        if (!cancelled) {
          setHeatmap(heatmapResponse.data);
          setSessions(sessionsResponse.data);
          setScatter(scatterResponse.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setHeatmap(null);
          setSessions(null);
          setScatter(null);
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
  }, [accountId, active, fromUtc, refreshToken, session, side, symbol, toUtc]);

  if (loading && !heatmap) {
    return (
      <div className="space-y-4">
        <Card className="rounded-[28px]">
          <CardContent className="pt-6">
            <Skeleton className="h-[18rem] w-full rounded-3xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ApiErrorAlert title="No se pudo cargar Temporal" message={error} />;
  }

  if (!heatmap || !sessions || !scatter) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos temporales para esta cuenta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PanelCard
        title="Hour x weekday heatmap"
        subtitle="Win rate per 3h block of open hour (UTC)."
        kicker="Win rate"
      >
        <HourWeekdayHeatmap data={heatmap} />
      </PanelCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <PanelCard
          title="Performance by session"
          subtitle="Sydney 21-8 · Tokyo 0-9 · London 7-16 · NY 13-22 (UTC, open hour, they overlap)."
        >
          <SessionBars sessions={sessions} />
        </PanelCard>

        <PanelCard
          title="PnL vs trade duration"
          subtitle="Latest closed trades in the range."
          kicker="Scalp or swing?"
        >
          <DurationScatterPlot data={scatter} />
        </PanelCard>
      </div>
    </div>
  );
}
