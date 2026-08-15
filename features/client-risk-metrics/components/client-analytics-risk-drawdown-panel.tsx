"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAccountAnalyticsDrawdowns,
  getAccountAnalyticsEquityCurve,
  getAccountAnalyticsOverview,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsDrawdowns,
  AnalyticsEquityCurve,
  AnalyticsOverview,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientAnalyticsRiskDrawdownPanelProps = {
  accountId: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

type UnderwaterMode = "pct" | "abs";

function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCurrency(value: number, digits = 2): string {
  return `${value >= 0 ? "" : "-"}${formatNumber(Math.abs(value), digits)} US$`;
}

function formatSignedCurrency(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value), digits)}`;
}

function formatPercent(value: number, digits = 1): string {
  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatNumber(Math.abs(pct), digits)}%`;
}

function formatDays(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} days`;
}

function RiskKpiCard({
  title,
  value,
  subtitle,
  negative = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  negative?: boolean;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex min-h-[110px] flex-col gap-3 pt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <div
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            negative ? "text-rose-500" : "text-foreground",
          )}
        >
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function PanelCard({
  title,
  subtitle,
  kicker,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
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

function MetricRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function UnderwaterChart({
  curve,
  mode,
  onModeChange,
}: {
  curve: AnalyticsEquityCurve | null;
  mode: UnderwaterMode;
  onModeChange: (mode: UnderwaterMode) => void;
}) {
  const points = useMemo(() => {
    if (!curve?.points.length) {
      return [];
    }

    return curve.points.map((point) => {
      const underwaterAbs = point.peak_adj - point.equity_adj;
      const underwaterPct = point.drawdown_pct > 0 ? -point.drawdown_pct : point.drawdown_pct;

      return {
        label: point.date_utc.slice(5),
        value: mode === "pct" ? underwaterPct : -underwaterAbs,
      };
    });
  }, [curve, mode]);

  if (!points.length) {
    return <EmptyPanel message="No underwater curve for this range." />;
  }

  const width = 900;
  const height = 280;
  const padding = 20;
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const maxAbs = Math.max(Math.abs(minValue), 1);

  const coords = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = padding + (Math.abs(point.value) / maxAbs) * (height - padding * 2);
    return { x, y, ...point };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L${coords[coords.length - 1]?.x ?? padding},${height - padding} L${coords[0]?.x ?? padding},${height - padding} Z`;
  const currentValue = coords[coords.length - 1]?.value ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-rose-500">
          {mode === "pct" ? formatPercent(currentValue, 1) : formatSignedCurrency(currentValue)}
        </div>
        <div className="flex gap-1 rounded-full border bg-muted/10 p-1">
          <button
            type="button"
            onClick={() => onModeChange("pct")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              mode === "pct"
                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => onModeChange("abs")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              mode === "abs"
                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            $
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full">
        <defs>
          <linearGradient id="underwater-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              className="text-border/60"
            />
          );
        })}

        <path d={areaPath} fill="url(#underwater-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex justify-between gap-3 text-[11px] text-muted-foreground">
        <span>{coords[0]?.label}</span>
        <span>{coords[Math.floor(coords.length / 2)]?.label}</span>
        <span>{coords[coords.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function DurationHistogram({ drawdowns }: { drawdowns: AnalyticsDrawdowns }) {
  if (!drawdowns.histogram.length) {
    return <EmptyPanel message="No drawdown duration buckets in this range." />;
  }

  const maxCount = Math.max(...drawdowns.histogram.map((bucket) => bucket.count), 1);

  return (
    <div className="rounded-3xl border bg-muted/10 p-5">
      <div className="grid h-[180px] grid-cols-[repeat(auto-fit,minmax(62px,1fr))] items-end gap-5">
        {drawdowns.histogram.map((bucket) => (
          <div key={bucket.label} className="flex h-full flex-col justify-end gap-3">
            <div className="relative flex-1">
              <div
                className="absolute right-0 bottom-0 left-0 rounded-t-md bg-blue-500"
                style={{
                  height: `${Math.max((bucket.count / maxCount) * 100, 8)}%`,
                }}
              />
            </div>
            <div className="text-center text-[11px] text-muted-foreground">
              {bucket.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientAnalyticsRiskDrawdownPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
}: ClientAnalyticsRiskDrawdownPanelProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [curve, setCurve] = useState<AnalyticsEquityCurve | null>(null);
  const [drawdowns, setDrawdowns] = useState<AnalyticsDrawdowns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [underwaterMode, setUnderwaterMode] = useState<UnderwaterMode>("pct");

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [overviewResponse, curveResponse, drawdownsResponse] = await Promise.all([
          getAccountAnalyticsOverview(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
          getAccountAnalyticsEquityCurve(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
          getAccountAnalyticsDrawdowns(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
        ]);

        if (!cancelled) {
          setOverview(overviewResponse.data);
          setCurve(curveResponse.data);
          setDrawdowns(drawdownsResponse.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setOverview(null);
          setCurve(null);
          setDrawdowns(null);
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

  if (loading && !overview) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-3xl">
              <CardContent className="pt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-10 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-[28px]">
          <CardContent className="pt-6">
            <Skeleton className="h-[18rem] w-full rounded-3xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ApiErrorAlert title="No se pudo cargar Risk & Drawdown" message={error} />;
  }

  if (!overview || !drawdowns) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos de drawdown para esta cuenta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RiskKpiCard
          title="Max DD Absoluto"
          value={formatCurrency(overview.risk.max_drawdown_abs)}
          subtitle="peak-to-trough, adjusted equity"
          negative
        />
        <RiskKpiCard
          title="Max DD %"
          value={formatPercent(-Math.abs(overview.risk.max_drawdown_pct), 1)}
          subtitle="from rolling peak"
          negative
        />
        <RiskKpiCard
          title="Ulcer Index"
          value={formatNumber(overview.risk.ulcer_index, 2)}
          subtitle="depth + duration"
        />
        <RiskKpiCard
          title="Recovery Factor"
          value={formatNumber(overview.risk.recovery_factor, 2)}
          subtitle="net PnL / max DD"
          negative={overview.risk.recovery_factor < 0}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <PanelCard
          title="Underwater"
          subtitle="% below the equity peak | flow-adjusted."
        >
          <UnderwaterChart
            curve={curve}
            mode={underwaterMode}
            onModeChange={setUnderwaterMode}
          />
        </PanelCard>

        <PanelCard
          title="Drawdown duration"
          subtitle="Peak-to-recovery episode stats."
          kicker="Episodes"
        >
          <div className="space-y-1">
            <MetricRow label="Episodes" value={String(drawdowns.episodes_total)} />
            <MetricRow
              label="Average duration"
              value={formatDays(drawdowns.avg_duration_days)}
            />
            <MetricRow
              label="Max duration"
              value={formatDays(drawdowns.max_duration_days)}
            />
            <MetricRow
              label="Days below peak (current)"
              value={formatDays(drawdowns.current_underwater_days)}
              valueClassName="text-amber-500"
            />
            <MetricRow
              label="Underwater now"
              value={formatPercent(-Math.abs(drawdowns.underwater_now_pct), 1)}
              valueClassName="text-rose-500"
            />
            <MetricRow
              label="Largest loss trade"
              value={formatSignedCurrency(drawdowns.worst_trade)}
              valueClassName="text-rose-500"
            />
            <MetricRow
              label="Largest win trade"
              value={formatSignedCurrency(drawdowns.best_trade)}
              valueClassName="text-emerald-600"
            />
          </div>
        </PanelCard>
      </div>

      <PanelCard
        title="Drawdown duration distribution"
        subtitle="Peak-to-recovery episodes detected on the daily curve."
        kicker="Histogram"
      >
        <DurationHistogram drawdowns={drawdowns} />
      </PanelCard>
    </div>
  );
}
