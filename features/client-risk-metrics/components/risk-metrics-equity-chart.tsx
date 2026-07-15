"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  LineStyle,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskMetricsHistory } from "@/features/client-risk-metrics/types";

type RiskMetricsEquityChartProps = {
  history: RiskMetricsHistory | null;
  loading: boolean;
};

function toChartData(history: RiskMetricsHistory | null): AreaData<Time>[] {
  if (!history) {
    return [];
  }

  const valuesBySecond = new Map<number, number>();

  for (const point of history.points) {
    const milliseconds = new Date(point.at).getTime();
    if (!Number.isFinite(milliseconds) || !Number.isFinite(point.value)) {
      continue;
    }

    valuesBySecond.set(Math.floor(milliseconds / 1000), point.value);
  }

  return Array.from(valuesBySecond.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, value]) => ({
      time: time as UTCTimestamp,
      value,
    }));
}

export function RiskMetricsEquityChart({
  history,
  loading,
}: RiskMetricsEquityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [isDark, setIsDark] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const data = useMemo(() => toChartData(history), [history]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function onChange(event: MediaQueryListEvent) {
      setIsDark(event.matches);
    }

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const backgroundColor = isDark ? "#0a0a0a" : "#ffffff";
    const textColor = isDark ? "#a1a1aa" : "#71717a";
    const borderColor = isDark ? "#27272a" : "#e4e4e7";
    const crosshairColor = isDark ? "#52525b" : "#a1a1aa";

    if (!chartRef.current) {
      const chart = createChart(container, {
        width: container.clientWidth,
        height: 320,
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
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
            labelBackgroundColor: backgroundColor,
          },
          horzLine: {
            color: crosshairColor,
            labelBackgroundColor: backgroundColor,
          },
        },
        localization: {
          priceFormatter: (value: number) =>
            value.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        },
        rightPriceScale: { borderColor },
        timeScale: {
          borderColor,
          timeVisible: true,
          secondsVisible: true,
        },
        handleScroll: true,
        handleScale: true,
      });

      chartRef.current = chart;
      seriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: "#10b981",
        topColor: "#10b98133",
        bottomColor: "#10b98105",
        lineWidth: 2,
        title: "Equity",
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });
    } else {
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        grid: {
          vertLines: { color: borderColor },
          horzLines: { color: borderColor },
        },
        rightPriceScale: { borderColor },
        timeScale: { borderColor },
      });
    }

    seriesRef.current?.setData(data);
    chartRef.current.timeScale().fitContent();
  }, [data, isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      chartRef.current?.applyOptions({ width: container.clientWidth });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    },
    [],
  );

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Curva de equity
        </CardTitle>
        {history ? (
          <span className="text-xs text-muted-foreground">
            {history.granularity === "hour"
              ? "Histórico por hora + tiempo real"
              : "Histórico + tiempo real"}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="relative p-0 pb-4 pr-4">
        <div ref={containerRef} className="h-[320px] w-full" />
        {loading && !history ? (
          <Skeleton className="absolute inset-0 h-[320px] w-full rounded-md" />
        ) : null}
        {!loading && !hasData ? (
          <div className="absolute inset-0 flex h-[320px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No hay datos de equity disponibles para este período.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
