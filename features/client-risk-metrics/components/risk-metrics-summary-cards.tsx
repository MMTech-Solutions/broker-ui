"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskMetricsSummary } from "@/features/client-risk-metrics/types";

const METRIC_LABELS: Record<string, string> = {
  balance: "Balance",
  equity: "Equity",
  drawdown: "Drawdown",
  return_equity_pct_day: "Retorno diario (%)",
  profit: "Beneficio",
  loss: "Pérdida",
  margin: "Margen",
  margin_level: "Nivel de margen (%)",
  floating_pnl: "PnL flotante",
  closed_pnl: "PnL cerrado",
};

function getMetricLabel(key: string): string {
  return METRIC_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toFixed(2);
}

function formatDeltaPercent(previous: number, diff: number): string | null {
  if (previous === 0) return null;
  const pct = (diff / Math.abs(previous)) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

type MetricCardProps = {
  metricKey: string;
  currentValue: number | null;
  delta: { previous: number; diff: number } | null;
};

function MetricCard({ metricKey, currentValue, delta }: MetricCardProps) {
  const label = getMetricLabel(metricKey);
  const isPositiveDiff = delta && delta.diff >= 0;
  const diffColor = delta
    ? delta.diff > 0
      ? "text-emerald-500"
      : delta.diff < 0
        ? "text-red-500"
        : "text-muted-foreground"
    : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold tabular-nums">
          {currentValue !== null ? formatValue(currentValue) : "—"}
        </p>
        {delta ? (
          <p className={`text-xs tabular-nums ${diffColor}`}>
            {isPositiveDiff ? "+" : ""}
            {formatValue(delta.diff)}
            {delta.previous !== 0 ? (
              <span className="ml-1 text-muted-foreground">
                ({formatDeltaPercent(delta.previous, delta.diff)})
              </span>
            ) : null}
            <span className="ml-1 text-muted-foreground">vs ayer</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

type RiskMetricsSummaryCardsProps = {
  summary: RiskMetricsSummary | null;
  loading: boolean;
};

export function RiskMetricsSummaryCards({ summary, loading }: RiskMetricsSummaryCardsProps) {
  if (loading && !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const seriesKeys = Object.keys(summary.series);

  if (seriesKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos de métricas disponibles para este período.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {seriesKeys.map((key) => {
        const values = summary.series[key];
        const lastValue = values
          ? [...values].reverse().find((v) => v !== null) ?? null
          : null;
        const delta = summary.daily_deltas[key] ?? null;

        return (
          <MetricCard
            key={key}
            metricKey={key}
            currentValue={lastValue}
            delta={delta}
          />
        );
      })}
    </div>
  );
}
