"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  LineSeries,
  LineStyle,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAccountAnalyticsEquityCurve,
  getAccountAnalyticsOverview,
  getPublicSharedAnalyticsOverview,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsEquityCurve,
  AnalyticsOverview,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientAnalyticsDashboardPanelProps = {
  accountId?: string;
  shareUuid?: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
  liveDashboard?: AnalyticsDashboardSnapshot | null;
};

export type AnalyticsDashboardSnapshot = {
  overview?: AnalyticsOverview;
  equity_curve?: AnalyticsEquityCurve;
};

function formatNumber(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${formatNumber(pct, digits)}%`;
}

function formatCurrency(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${formatNumber(value, digits)} US$`;
}

function formatSignedCurrency(
  value: number | null | undefined,
  digits = 2,
): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${formatCurrency(value, digits)}`;
}

function formatMetric(
  value: number | null | undefined,
  formatter: (metric: number) => string,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatter(value);
}

function toSeriesTime(value: string | null | undefined): UTCTimestamp | null {
  if (!value) {
    return null;
  }

  const normalizedDate = value.includes("T") ? value : `${value}T00:00:00Z`;
  const milliseconds = new Date(normalizedDate).getTime();

  if (!Number.isFinite(milliseconds)) {
    return null;
  }

  return Math.floor(milliseconds / 1000) as UTCTimestamp;
}

function toChartData(curve: AnalyticsEquityCurve | null): AreaData<Time>[] {
  if (!curve) {
    return [];
  }

  const valuesBySecond = new Map<number, number>();

  for (const point of curve.points) {
    const time = toSeriesTime(point.date_utc);

    if (!time || !Number.isFinite(point.equity_adj)) {
      continue;
    }

    valuesBySecond.set(time, point.equity_adj);
  }

  return Array.from(valuesBySecond.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, value]) => ({
      time: time as UTCTimestamp,
      value,
    }));
}

function toPeakData(
  curve: AnalyticsEquityCurve | null,
): Array<{ time: Time; value: number }> {
  if (!curve) {
    return [];
  }

  const valuesBySecond = new Map<number, number>();

  for (const point of curve.points) {
    const time = toSeriesTime(point.date_utc);

    if (!time || !Number.isFinite(point.peak_adj)) {
      continue;
    }

    valuesBySecond.set(time, point.peak_adj);
  }

  return Array.from(valuesBySecond.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, value]) => ({
      time: time as UTCTimestamp,
      value,
    }));
}

function toDrawdownData(
  curve: AnalyticsEquityCurve | null,
): Array<{ time: Time; value: number }> {
  if (!curve) {
    return [];
  }

  const valuesBySecond = new Map<number, number>();

  for (const point of curve.points) {
    const time = toSeriesTime(point.date_utc);

    if (!time || !Number.isFinite(point.drawdown_pct)) {
      continue;
    }

    valuesBySecond.set(time, -Math.abs(point.drawdown_pct));
  }

  return Array.from(valuesBySecond.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, value]) => ({
      time: time as UTCTimestamp,
      value,
    }));
}

function toMarkerData(curve: AnalyticsEquityCurve | null) {
  if (!curve) {
    return [];
  }

  const markers: Array<{
    time: Time;
    position: "aboveBar" | "belowBar" | "inBar";
    color: string;
    shape:
      | "circle"
      | "square"
      | "arrowUp"
      | "arrowDown";
    text: string;
  }> = [];

  const bestTrade =
    curve.best_trade_marker_index !== null
      ? curve.trade_markers[curve.best_trade_marker_index]
      : null;
  const bestTradeTime = toSeriesTime(
    bestTrade?.closed_at_utc ?? bestTrade?.opened_at_utc,
  );

  if (bestTrade && bestTradeTime) {
    markers.push({
      time: bestTradeTime,
      position: "belowBar",
      color: "#16a34a",
      shape: "arrowUp",
      text: "Best",
    });
  }

  const worstTrade =
    curve.worst_trade_marker_index !== null
      ? curve.trade_markers[curve.worst_trade_marker_index]
      : null;
  const worstTradeTime = toSeriesTime(
    worstTrade?.closed_at_utc ?? worstTrade?.opened_at_utc,
  );

  if (worstTrade && worstTradeTime) {
    markers.push({
      time: worstTradeTime,
      position: "aboveBar",
      color: "#dc2626",
      shape: "arrowDown",
      text: "Worst",
    });
  }

  const maxDrawdownPoint =
    curve.max_drawdown_point_index !== null
      ? curve.points[curve.max_drawdown_point_index]
      : null;
  const maxDrawdownTime = toSeriesTime(maxDrawdownPoint?.date_utc);

  if (maxDrawdownPoint && maxDrawdownTime) {
    markers.push({
      time: maxDrawdownTime,
      position: "aboveBar",
      color: "#f59e0b",
      shape: "circle",
      text: "Max DD",
    });
  }

  const livePoint = curve.points.findLast((point) => point.is_live);
  const liveTime = toSeriesTime(livePoint?.date_utc);

  if (livePoint && liveTime) {
    markers.push({
      time: liveTime,
      position: "inBar",
      color: "#0f766e",
      shape: "circle",
      text: "Live",
    });
  }

  return markers.sort((left, right) => Number(left.time) - Number(right.time));
}

function OverviewEquityChart({
  curve,
  loading,
}: {
  curve: AnalyticsEquityCurve | null;
  loading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const peakSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const drawdownSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const markersRef =
    useRef<ReturnType<typeof createSeriesMarkers<Time>> | null>(null);
  const [showPeak, setShowPeak] = useState(true);
  const [showDrawdown, setShowDrawdown] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    timeLabel: string;
    equity: string | null;
    peak: string | null;
    drawdown: string | null;
    markerLabels: string[];
  } | null>(null);
  const [isDark, setIsDark] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const data = useMemo(() => toChartData(curve), [curve]);
  const peakData = useMemo(() => toPeakData(curve), [curve]);
  const drawdownData = useMemo(() => toDrawdownData(curve), [curve]);
  const markerData = useMemo(() => toMarkerData(curve), [curve]);
  const visibleMarkerData = useMemo(
    () => (showMarkers ? markerData : []),
    [markerData, showMarkers],
  );
  const markerLookup = useMemo(() => {
    const nextLookup = new Map<number, string[]>();

    for (const marker of visibleMarkerData) {
      const timeKey = Number(marker.time);
      const labels = nextLookup.get(timeKey) ?? [];
      labels.push(marker.text);
      nextLookup.set(timeKey, labels);
    }

    return nextLookup;
  }, [visibleMarkerData]);

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

    const backgroundColor = isDark ? "#09090b" : "#ffffff";
    const textColor = isDark ? "#a1a1aa" : "#71717a";
    const borderColor = isDark ? "#27272a" : "#e4e4e7";
    const crosshairColor = isDark ? "#52525b" : "#94a3b8";
    const drawdownColor = isDark ? "#fb7185" : "#e11d48";
    const peakColor = isDark ? "#fbbf24" : "#f59e0b";

    if (!chartRef.current) {
      const chart = createChart(container, {
        width: container.clientWidth,
        height: 360,
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
        rightPriceScale: {
          borderColor,
          scaleMargins: { top: 0.08, bottom: 0.28 },
        },
        leftPriceScale: { visible: false },
        timeScale: {
          borderColor,
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
      });

      chartRef.current = chart;
      equitySeriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: "#2563eb",
        topColor: "#2563eb26",
        bottomColor: "#2563eb08",
        lineWidth: 2,
        title: "Equity",
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });
      peakSeriesRef.current = chart.addSeries(LineSeries, {
        color: peakColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: "Peak",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      drawdownSeriesRef.current = chart.addSeries(LineSeries, {
        color: drawdownColor,
        lineWidth: 1,
        title: "Drawdown",
        priceScaleId: "drawdown-scale",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      chart.priceScale("drawdown-scale").applyOptions({
        scaleMargins: { top: 0.78, bottom: 0.02 },
        borderVisible: false,
        visible: false,
      });
      markersRef.current = createSeriesMarkers(equitySeriesRef.current, []);
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
        rightPriceScale: {
          borderColor,
          scaleMargins: { top: 0.08, bottom: 0.28 },
        },
        timeScale: { borderColor },
      });
      peakSeriesRef.current?.applyOptions({ color: peakColor });
      drawdownSeriesRef.current?.applyOptions({ color: drawdownColor });
    }

    equitySeriesRef.current?.setData(data);
    peakSeriesRef.current?.setData(showPeak ? peakData : []);
    drawdownSeriesRef.current?.setData(showDrawdown ? drawdownData : []);
    markersRef.current?.setMarkers(visibleMarkerData);
    chartRef.current.timeScale().fitContent();
  }, [
    data,
    drawdownData,
    isDark,
    peakData,
    showDrawdown,
    showPeak,
    visibleMarkerData,
  ]);

  useEffect(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    const equitySeries = equitySeriesRef.current;
    const peakSeries = peakSeriesRef.current;
    const drawdownSeries = drawdownSeriesRef.current;

    if (!chart || !container || !equitySeries || !peakSeries || !drawdownSeries) {
      return;
    }

    function readSeriesValue(dataPoint: unknown): number | null {
      if (
        dataPoint &&
        typeof dataPoint === "object" &&
        "value" in dataPoint &&
        typeof dataPoint.value === "number"
      ) {
        return dataPoint.value;
      }

      return null;
    }

    function toTimeLabel(timeValue: Time | undefined): string | null {
      if (typeof timeValue === "number") {
        return new Date(timeValue * 1000).toLocaleString("es-ES");
      }

      if (
        timeValue &&
        typeof timeValue === "object" &&
        "year" in timeValue &&
        "month" in timeValue &&
        "day" in timeValue
      ) {
        return `${timeValue.day.toString().padStart(2, "0")}/${timeValue.month
          .toString()
          .padStart(2, "0")}/${timeValue.year}`;
      }

      return null;
    }

    const handleCrosshairMove = (param: {
      point?: { x: number; y: number };
      time?: Time;
      seriesData: Map<ISeriesApi<"Area" | "Line", Time>, unknown>;
    }) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setTooltip(null);
        return;
      }

      const timeLabel = toTimeLabel(param.time);
      if (!timeLabel) {
        setTooltip(null);
        return;
      }

      const equityValue = readSeriesValue(param.seriesData.get(equitySeries));
      const peakValue = readSeriesValue(param.seriesData.get(peakSeries));
      const drawdownValue = readSeriesValue(param.seriesData.get(drawdownSeries));
      const timeKey = typeof param.time === "number" ? param.time : null;
      const markerLabels = timeKey ? (markerLookup.get(timeKey) ?? []) : [];

      setTooltip({
        x: Math.min(param.point.x + 14, Math.max(container.clientWidth - 210, 0)),
        y: Math.max(param.point.y - 14, 16),
        timeLabel,
        equity: equityValue !== null ? formatCurrency(equityValue) : null,
        peak:
          showPeak && peakValue !== null ? formatCurrency(peakValue) : null,
        drawdown:
          showDrawdown && drawdownValue !== null
            ? formatPercent(Math.abs(drawdownValue))
            : null,
        markerLabels,
      });
    };

    chart.subscribeCrosshairMove((param) => handleCrosshairMove(param as unknown as { point?: { x: number; y: number }; time?: Time; seriesData: Map<ISeriesApi<"Area" | "Line", Time>, unknown> }));

    return () => {
      chart.unsubscribeCrosshairMove((param) => handleCrosshairMove(param as unknown as { point?: { x: number; y: number }; time?: Time; seriesData: Map<ISeriesApi<"Area" | "Line", Time>, unknown> }));
    };
  }, [markerLookup, showDrawdown, showPeak]);

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
      equitySeriesRef.current = null;
      peakSeriesRef.current = null;
      drawdownSeriesRef.current = null;
      markersRef.current = null;
    },
    [],
  );

  const hasData = data.length > 0;

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <ChartToggleChip
          active={showPeak}
          label="Peak"
          onClick={() => setShowPeak((current) => !current)}
        />
        <ChartToggleChip
          active={showDrawdown}
          label="Drawdown"
          onClick={() => setShowDrawdown((current) => !current)}
        />
        <ChartToggleChip
          active={showMarkers}
          label="Markers"
          onClick={() => setShowMarkers((current) => !current)}
        />
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
      {tooltip ? (
        <div
          className="pointer-events-none absolute z-20 min-w-[190px] rounded-2xl border bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-xs font-semibold text-foreground">
            {tooltip.timeLabel}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {tooltip.equity ? (
              <div className="flex items-center justify-between gap-3">
                <span>Equity</span>
                <span className="font-medium text-foreground">
                  {tooltip.equity}
                </span>
              </div>
            ) : null}
            {tooltip.peak ? (
              <div className="flex items-center justify-between gap-3">
                <span>Peak</span>
                <span className="font-medium text-foreground">{tooltip.peak}</span>
              </div>
            ) : null}
            {tooltip.drawdown ? (
              <div className="flex items-center justify-between gap-3">
                <span>Drawdown</span>
                <span className="font-medium text-foreground">
                  {tooltip.drawdown}
                </span>
              </div>
            ) : null}
            {tooltip.markerLabels.length ? (
              <div className="border-t pt-2 text-[11px] uppercase tracking-[0.14em] text-emerald-600">
                {tooltip.markerLabels.join(" · ")}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {loading && !curve ? (
        <Skeleton className="absolute inset-0 h-[360px] w-full rounded-[24px]" />
      ) : null}
      {!loading && !hasData ? (
        <div className="absolute inset-0 flex h-[360px] items-center justify-center rounded-[24px] border border-dashed bg-muted/15 px-6 text-center text-sm text-muted-foreground">
          No hay puntos de equity disponibles para este rango.
        </div>
      ) : null}
    </div>
  );
}

function ChartToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur transition-colors",
        active
          ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
          : "border-border bg-background/90 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function HeroMetricCard({
  eyebrow,
  value,
  tone = "default",
}: {
  eyebrow: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="min-h-[110px] justify-between rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-semibold tabular-nums tracking-tight",
            tone === "danger" ? "text-rose-500" : "text-foreground",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function MiniMetricCard({
  title,
  value,
  subtitle,
  accent = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  accent?: "default" | "warning";
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex h-full flex-col gap-3 pt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <div
          className={cn(
            "text-3xl font-semibold tabular-nums tracking-tight",
            accent === "warning" ? "text-amber-500" : "text-foreground",
          )}
        >
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function PerformanceRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function AccountHealthGauge({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const ringStyle = {
    background: `conic-gradient(from 210deg, #14b8a6 0deg, #3b82f6 ${
      safeScore * 2.4
    }deg, #e5e7eb ${safeScore * 2.4}deg 360deg)`,
  };

  return (
    <div
      className="relative grid size-28 place-items-center rounded-full"
      style={ringStyle}
    >
      <div className="grid size-[84px] place-items-center rounded-full bg-card text-center shadow-inner">
        <div>
          <div className="text-4xl font-semibold tabular-nums">{safeScore}</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">
            {level.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientAnalyticsDashboardPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
  liveDashboard,
  shareUuid,
}: ClientAnalyticsDashboardPanelProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [equityCurve, setEquityCurve] = useState<AnalyticsEquityCurve | null>(
    null,
  );
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
        if (shareUuid) {
          const response = await getPublicSharedAnalyticsOverview(shareUuid, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          });

          if (!cancelled) {
            setOverview(response.data.overview);
            setEquityCurve(response.data.equity_curve);
          }

          return;
        }

        if (!accountId) {
          throw new Error("An account or shared metrics link is required.");
        }

        const [overviewResponse, curveResponse] = await Promise.all([
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
            marker_limit: 100,
          }),
        ]);

        if (!cancelled) {
          setOverview(overviewResponse.data);
          setEquityCurve(curveResponse.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setOverview(null);
          setEquityCurve(null);
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
  }, [accountId, fromUtc, toUtc, refreshToken, active, symbol, side, session, shareUuid]);

  if (loading && !overview) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-3xl">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-[28px]">
          <CardContent className="pt-6">
            <Skeleton className="h-[24rem] w-full rounded-[24px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorAlert
        title="No se pudo cargar el overview de analytics"
        message={error}
      />
    );
  }

  if (!overview) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos de analytics para esta cuenta.
      </p>
    );
  }

  const displayedOverview = liveDashboard?.overview ?? overview;
  const displayedCurve = liveDashboard?.equity_curve ?? equityCurve;
  const kpis = displayedOverview.kpis;
  const costs = displayedOverview.costs;
  const equity = displayedOverview.equity;
  const risk = displayedOverview.risk;
  const live = displayedOverview.live;
  const health = displayedOverview.health;
  const days = displayedOverview.days;
  const streaks = displayedOverview.streaks;
  const hasTrades = kpis.trades > 0;
  const lastCurvePoint =
    displayedCurve && displayedCurve.points.length > 0
      ? displayedCurve.points[displayedCurve.points.length - 1]
      : null;
  const adjustedEquity =
    lastCurvePoint?.equity_adj ?? live.equity ?? equity.equity_last;
  const currentDrawdown = Math.abs(risk.underwater_now_pct);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Generated:{" "}
          <span className="font-medium tabular-nums text-foreground">
            {new Date(displayedOverview.generated_at).toLocaleString("es-ES")}
          </span>
        </p>
        <p>
          Range:{" "}
          <span className="font-medium text-foreground">
            {displayedOverview.range.symbol ?? "All symbols"}
          </span>
          {" · "}
          <span className="font-medium text-foreground">
            {displayedOverview.range.side ?? "Both sides"}
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <HeroMetricCard
          eyebrow="Equity Return"
          value={formatMetric(equity.return_pct, (value) => formatPercent(value))}
        />
        <HeroMetricCard
          eyebrow="Profit Factor"
          value={hasTrades ? formatNumber(kpis.profit_factor) : "—"}
        />
        <HeroMetricCard
          eyebrow="Win Rate"
          value={hasTrades ? formatPercent(kpis.win_rate) : "—"}
        />
        <HeroMetricCard
          eyebrow="Max Drawdown"
          value={formatMetric(risk.max_drawdown_pct, (value) =>
            formatPercent(value, 1),
          )}
          tone="danger"
        />
        <HeroMetricCard
          eyebrow="Expectancy"
          value={hasTrades ? formatCurrency(kpis.expectancy) : "—"}
        />
        <HeroMetricCard
          eyebrow="Ulcer Index"
          value={formatMetric(risk.ulcer_index, (value) => formatNumber(value))}
        />
      </div>

      <Card className="rounded-[28px]">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Equity (adjusted)
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">
                {formatCurrency(adjustedEquity)}
              </span>
              <span className="text-lg font-semibold text-emerald-600">
                {formatPercent(equity.return_pct)}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Range return · flow-adjusted</div>
            {displayedCurve ? (
              <div className="mt-1">
                {displayedCurve.trade_markers.length} trade markers
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Equity</span>
            <span>Rolling peak</span>
            <span>Drawdown</span>
            <span>Trade markers</span>
            <span>Flow-adjusted</span>
          </div>
          <OverviewEquityChart curve={displayedCurve} loading={loading} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <MiniMetricCard
          title="Balance"
          value={formatCurrency(live.balance)}
          subtitle="latest snapshot"
        />
        <MiniMetricCard
          title="Equity"
          value={formatCurrency(live.equity)}
          subtitle={`floating ${formatSignedCurrency(live.floating_pnl)}`}
        />
        <MiniMetricCard
          title="Realized PnL"
          value={formatCurrency(costs.net_pnl)}
          subtitle="closed trades"
        />
        <MiniMetricCard
          title="Trades"
          value={String(kpis.trades)}
          subtitle={`${days.days_traded} traded days`}
        />
        <MiniMetricCard
          title="Expectancy"
          value={hasTrades ? formatCurrency(kpis.expectancy) : "—"}
          subtitle="per trade"
        />
        <MiniMetricCard
          title="Margin Level"
          value={formatPercent(live.margin_level_pct, 0)}
          subtitle={`free ${formatCurrency(live.margin_free)}`}
          accent="warning"
        />
        <MiniMetricCard
          title="Current Streak"
          value={String(days.current_consecutive_positive)}
          subtitle="positive PnL days"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card className="rounded-[28px]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <CardTitle>Performance</CardTitle>
            <div className="text-right text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <div>Selected range</div>
              <div className="mt-1 text-sm font-semibold tracking-normal text-foreground">
                {kpis.trades} trades
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <PerformanceRow
              label="Max win streak"
              value={`${streaks.max_win_streak} trades`}
            />
            <PerformanceRow
              label="Max loss streak"
              value={`${streaks.max_loss_streak} trades`}
            />
            <PerformanceRow
              label="Best trade"
              value={hasTrades ? formatCurrency(kpis.best_trade) : "—"}
              valueClassName="text-emerald-600"
            />
            <PerformanceRow
              label="Worst trade"
              value={hasTrades ? formatCurrency(kpis.worst_trade) : "—"}
              valueClassName="text-rose-500"
            />
            <PerformanceRow
              label="Consecutive positive PnL days"
              value={String(days.max_consecutive_positive)}
            />
            <PerformanceRow
              label="Traded days"
              value={String(days.days_traded)}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <CardTitle>Account health</CardTitle>
            <div className="text-right text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <div>Latest snapshot</div>
              <div className="mt-1 text-sm font-semibold tracking-normal text-foreground">
                {live.snapshot_at
                  ? new Date(live.snapshot_at).toLocaleDateString("es-ES")
                  : "n/a"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <AccountHealthGauge score={health.score} level={health.level} />
              <div className="space-y-3">
                <PerformanceRow
                  label="Margin level"
                  value={formatPercent(live.margin_level_pct, 0)}
                  valueClassName="text-amber-500"
                />
                <PerformanceRow
                  label="Open positions"
                  value={String(live.open_positions)}
                />
                <PerformanceRow
                  label="Current drawdown"
                  value={formatPercent(currentDrawdown)}
                  valueClassName="text-emerald-600"
                />
                <PerformanceRow
                  label="Floating PnL"
                  value={formatCurrency(live.floating_pnl)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-dashed bg-muted/15 p-6">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Trade distribution
              </div>
              <div className="mt-10 text-center text-sm text-muted-foreground">
                {displayedCurve?.trade_markers.length
                  ? `${displayedCurve.trade_markers.length} trades marked on the curve.`
                  : "No trades in the selected range."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
