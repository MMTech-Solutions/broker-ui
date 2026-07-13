"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  AreaSeries,
  ColorType,
  LineStyle,
  type IChartApi,
  type Time,
  type AreaData,
  type AreaSeriesOptions,
  type AreaStyleOptions,
  type DeepPartial,
  type ISeriesApi,
  type SeriesOptionsCommon,
  type WhitespaceData,
} from "lightweight-charts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskMetricsSummary } from "@/features/client-risk-metrics/types";

const SERIES_COLORS: string[] = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

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
  return (
    METRIC_LABELS[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

type SeriesEntry = ISeriesApi<
  "Area",
  Time,
  WhitespaceData<Time> | AreaData<Time>,
  AreaSeriesOptions,
  DeepPartial<AreaStyleOptions & SeriesOptionsCommon>
>;

type RiskMetricsBalanceChartProps = {
  summary: RiskMetricsSummary | null;
  loading: boolean;
};

export function RiskMetricsBalanceChart({
  summary,
  loading,
}: RiskMetricsBalanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, SeriesEntry>>(new Map());
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    function onChange(e: MediaQueryListEvent) {
      setIsDark(e.matches);
    }

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!summary) return;
    const keys = Object.keys(summary.series);
    if (keys.length > 0 && selectedSeries.size === 0) {
      const preferredKeys = ["balance", "equity"];
      const initial = keys.find((k) => preferredKeys.includes(k)) ?? keys[0];
      if (initial) {
        setSelectedSeries(new Set([initial]));
      }
    }
  }, [summary, selectedSeries.size]);

  useEffect(() => {
    if (!containerRef.current || !summary) return;

    const bgColor = isDark ? "#0a0a0a" : "#ffffff";
    const textColor = isDark ? "#a1a1aa" : "#71717a";
    const borderColor = isDark ? "#27272a" : "#e4e4e7";
    const crosshairColor = isDark ? "#52525b" : "#a1a1aa";

    if (!chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: bgColor },
          textColor,
          fontSize: 12,
        },
        grid: {
          vertLines: { color: borderColor, style: LineStyle.Dotted },
          horzLines: { color: borderColor, style: LineStyle.Dotted },
        },
        crosshair: {
          vertLine: {
            color: crosshairColor,
            labelBackgroundColor: bgColor,
          },
          horzLine: {
            color: crosshairColor,
            labelBackgroundColor: bgColor,
          },
        },
        rightPriceScale: { borderColor },
        timeScale: { borderColor, timeVisible: true, secondsVisible: false },
        handleScroll: true,
        handleScale: true,
      });
    } else {
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: bgColor },
          textColor,
        },
        grid: {
          vertLines: { color: borderColor },
          horzLines: { color: borderColor },
        },
      });
    }

    const chart = chartRef.current;
    const { dates_utc, series } = summary;
    const keysToShow = Array.from(selectedSeries);

    seriesRefs.current.forEach((s, key) => {
      if (!keysToShow.includes(key)) {
        chart.removeSeries(s as Parameters<typeof chart.removeSeries>[0]);
        seriesRefs.current.delete(key);
      }
    });

    keysToShow.forEach((key, idx) => {
      const values = series[key];
      if (!values) return;

      const color = SERIES_COLORS[idx % SERIES_COLORS.length] ?? "#3b82f6";
      const existing = seriesRefs.current.get(key);
      const areaSeries: SeriesEntry = existing ?? chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: `${color}33`,
        bottomColor: `${color}05`,
        lineWidth: 2,
        title: getMetricLabel(key),
        priceLineVisible: true,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });

      if (!existing) {
        seriesRefs.current.set(key, areaSeries);
      }

      const data: AreaData<Time>[] = dates_utc
        .map((date, i) => {
          const val = values[i];
          if (val === null || val === undefined) return null;
          return { time: date as Time, value: val };
        })
        .filter((d): d is AreaData<Time> => d !== null);

      areaSeries.setData(data);
    });

    chart.timeScale().fitContent();
  }, [summary, selectedSeries, isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !chartRef.current) return;

    const chart = chartRef.current;
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRefs.current.clear();
      }
    };
  }, []);

  function toggleSeries(key: string) {
    setSelectedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  if (loading && !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Curva de balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!summary || Object.keys(summary.series).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Curva de balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay datos de series temporales disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableKeys = Object.keys(summary.series);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Curva de balance</CardTitle>
        <div className="flex flex-wrap gap-1">
          {availableKeys.map((key, idx) => {
            const color = SERIES_COLORS[idx % SERIES_COLORS.length] ?? "#3b82f6";
            const active = selectedSeries.has(key);

            return (
              <button
                key={key}
                onClick={() => toggleSeries(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity ${active ? "opacity-100" : "opacity-40"}`}
                style={{ borderColor: color, color: active ? color : undefined }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {getMetricLabel(key)}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4 pr-4">
        <div ref={containerRef} className="h-[320px] w-full" />
      </CardContent>
    </Card>
  );
}
