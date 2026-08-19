"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAccountAnalyticsBehavior,
  getAccountAnalyticsDaily,
  getAccountAnalyticsDailyDayTrades,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsBehavior,
  AnalyticsDaily,
  AnalyticsDailyDay,
  AnalyticsDailyDayTrades,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientAnalyticsBehaviorPanelProps = {
  accountId: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

type CalendarViewMode = "month" | "year";

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
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value), digits)}`;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return "0m";
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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

function SmallKpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex min-h-[110px] flex-col gap-3 pt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <div className="text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
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

function buildCalendarGrid(monthDate: Date) {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(Date.UTC(year, month, day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function dailyKey(dateUtc: string) {
  return dateUtc.slice(0, 10);
}

function CalendarMonthView({
  monthDate,
  activeDays,
  onSelectDay,
}: {
  monthDate: Date;
  activeDays: Map<string, AnalyticsDailyDay>;
  onSelectDay: (dateUtc: string) => void;
}) {
  const cells = useMemo(() => buildCalendarGrid(monthDate), [monthDate]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="px-2 py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-[84px]" />;
          }

          const dateUtc = date.toISOString().slice(0, 10);
          const daily = activeDays.get(dateUtc);

          return (
            <button
              key={dateUtc}
              type="button"
              disabled={!daily}
              onClick={() => daily && onSelectDay(dateUtc)}
              className={cn(
                "flex h-[84px] flex-col rounded-2xl border p-2 text-left transition-colors",
                daily
                  ? daily.pnl >= 0
                    ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                    : "border-rose-500/40 bg-rose-500/12 hover:bg-rose-500/18"
                  : "border-border/60 bg-muted/5 text-muted-foreground",
              )}
            >
              <span className="text-xs">{date.getUTCDate()}</span>
              {daily ? (
                <>
                  <span className="mt-auto text-sm font-semibold tabular-nums">
                    {formatSignedCurrency(daily.pnl)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {daily.trades} trades
                  </span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarYearView({
  monthTotals,
  selectedMonth,
  onSelectMonth,
}: {
  monthTotals: AnalyticsDaily["month_totals"];
  selectedMonth: Date;
  onSelectMonth: (date: Date) => void;
}) {
  const year = selectedMonth.getUTCFullYear();
  const totalsMap = new Map(monthTotals.map((month) => [month.month, month]));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }, (_, index) => {
        const monthDate = new Date(Date.UTC(year, index, 1));
        const key = `${year}-${String(index + 1).padStart(2, "0")}`;
        const summary = totalsMap.get(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectMonth(monthDate)}
            className="rounded-3xl border bg-muted/10 p-4 text-left transition-colors hover:bg-muted/15"
          >
            <div className="text-sm font-medium">
              {monthDate.toLocaleString("en-US", { month: "long", timeZone: "UTC" })}
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums">
              {summary ? formatSignedCurrency(summary.pnl) : "—"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {summary
                ? `${summary.trades} trades · ${summary.days_traded} traded days`
                : "No traded days"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StreakTimeline({ segments }: { segments: AnalyticsDaily["day_behavior"]["streak_segments"] }) {
  const totalLength = Math.max(
    segments.reduce((sum, segment) => sum + segment.length, 0),
    1,
  );

  if (!segments.length) {
    return <EmptyPanel message="No streak segments in the selected range." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex overflow-hidden rounded-full border bg-muted/10">
        {segments.map((segment, index) => (
          <div
            key={`${segment.start_date}-${index}`}
            className={cn(
              "h-8",
              segment.sign === "+" ? "bg-emerald-500" : "bg-rose-500",
            )}
            style={{ width: `${(segment.length / totalLength) * 100}%` }}
          />
        ))}
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        {segments.map((segment, index) => (
          <div key={`${segment.end_date}-${index}`}>
            {segment.sign} {segment.start_date.slice(5)} - {segment.end_date.slice(5)} ·{" "}
            {segment.length} traded days
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyPnlTradesChart({ days }: { days: AnalyticsDaily["days"] }) {
  if (!days.length) {
    return <EmptyPanel message="No daily observations in the selected range." />;
  }

  const maxAbsPnl = Math.max(...days.map((day) => Math.abs(day.pnl)), 1);
  const maxTrades = Math.max(...days.map((day) => day.trades), 1);

  return (
    <div className="rounded-3xl border bg-muted/10 p-5">
      <div className="grid h-[220px] grid-cols-[repeat(auto-fit,minmax(36px,1fr))] items-end gap-3">
        {days.map((day) => (
          <div key={day.date_utc} className="flex h-full flex-col justify-end gap-2">
            <div className="relative flex-1">
              <div className="absolute top-6 right-0 left-0 h-px bg-border" />
              <div
                className={cn(
                  "absolute top-6 left-1/2 w-7 -translate-x-1/2 rounded-md",
                  day.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500",
                )}
                style={{
                  height: `${Math.max((Math.abs(day.pnl) / maxAbsPnl) * 120, 8)}px`,
                }}
              />
              <div
                className="absolute right-1/2 bottom-2 h-1 rounded-full bg-blue-400"
                style={{
                  width: `${Math.max((day.trades / maxTrades) * 26, 6)}px`,
                }}
              />
            </div>
            <div className="text-center text-[11px] text-muted-foreground">
              {day.date_utc.slice(5)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WinRateSeriesChart({ behavior }: { behavior: AnalyticsBehavior }) {
  const cumulative = behavior.trade_win_rate_series.cumulative
    .map((value, index) => ({ index: index + 1, value }))
    .filter((point): point is { index: number; value: number } => point.value !== null);
  const rolling = behavior.trade_win_rate_series.rolling_10
    .map((value, index) => ({ index: index + 1, value }))
    .filter((point): point is { index: number; value: number } => point.value !== null);

  const allPoints = [...cumulative, ...rolling];
  if (allPoints.length < 2) {
    return <EmptyPanel message="You need more than one trade observation for this chart." />;
  }

  const width = 520;
  const height = 210;
  const padding = 20;
  const maxIndex = Math.max(...allPoints.map((point) => point.index), 1);

  const toPath = (points: Array<{ index: number; value: number }>) =>
    points
      .map((point, index) => {
        const x = padding + ((point.index - 1) / Math.max(maxIndex - 1, 1)) * (width - padding * 2);
        const y = height - padding - point.value * (height - padding * 2);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full">
      <path
        d={toPath(rolling)}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d={toPath(cumulative)}
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.5"
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

function TransitionMatrix({
  matrix,
}: {
  matrix: AnalyticsDaily["day_behavior"]["transition_matrix"];
}) {
  if (matrix.total <= 0) {
    return <EmptyPanel message="You need at least 2 days with a clear sign." />;
  }

  const cells = [
    { label: "+ to +", value: matrix.p_pos_after_pos },
    { label: "+ to -", value: matrix.p_neg_after_pos },
    { label: "- to +", value: matrix.p_pos_after_neg },
    { label: "- to -", value: matrix.p_neg_after_neg },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cells.map((cell) => (
        <div key={cell.label} className="rounded-3xl border bg-muted/10 p-4">
          <div className="text-xs text-muted-foreground">{cell.label}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {formatPercent(cell.value, 1)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TradeSequence({ sequence }: { sequence: string }) {
  const chars = sequence.split("");

  if (!chars.length) {
    return <EmptyPanel message="No recent sequence available." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex overflow-hidden rounded-full border bg-muted/10">
        {chars.map((char, index) => (
          <div
            key={`${char}-${index}`}
            className={cn(
              "h-8 flex-1",
              char === "W" ? "bg-emerald-500" : "bg-rose-500",
            )}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {chars.map((char, index) => (
          <span key={`${char}-label-${index}`} className="mr-3">
            {index + 1} {char}
          </span>
        ))}
      </div>
    </div>
  );
}

function HistogramLine({
  buckets,
}: {
  buckets: AnalyticsBehavior["gap_histogram"];
}) {
  const total = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {buckets.map((bucket) => (
          <div
            key={bucket.label}
            className="h-3 bg-blue-400"
            style={{ width: `${(bucket.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {buckets.map((bucket) => (
          <span key={bucket.label}>
            {bucket.label} {bucket.count}
          </span>
        ))}
      </div>
    </div>
  );
}

function FirstTradeHourBars({
  hours,
}: {
  hours: AnalyticsBehavior["first_trade_hours"];
}) {
  if (!hours.length) {
    return <EmptyPanel message="No first-trade-hour stats in range." />;
  }

  const maxAbs = Math.max(...hours.map((entry) => Math.abs(entry.day_pnl_avg)), 1);

  return (
    <div className="rounded-3xl border bg-muted/10 p-4">
      <div className="grid h-[170px] grid-cols-[repeat(auto-fit,minmax(42px,1fr))] items-end gap-3">
        {hours.map((entry) => (
          <div key={entry.hour} className="flex h-full flex-col justify-end gap-2">
            <div className="relative flex-1">
              <div className="absolute top-4 right-0 left-0 h-px bg-border" />
              <div
                className={cn(
                  "absolute top-4 left-1/2 w-7 -translate-x-1/2 rounded-md",
                  entry.day_pnl_avg >= 0 ? "bg-emerald-500" : "bg-rose-500",
                )}
                style={{
                  height: `${Math.max((Math.abs(entry.day_pnl_avg) / maxAbs) * 100, 8)}px`,
                }}
              />
            </div>
            <div className="text-center text-[11px] text-muted-foreground">
              {entry.hour}h
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayTradesDialog({
  open,
  onOpenChange,
  accountId,
  dateUtc,
  fromUtc,
  toUtc,
  symbol,
  side,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  dateUtc: string | null;
  fromUtc: string;
  toUtc: string;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
}) {
  const [data, setData] = useState<AnalyticsDailyDayTrades | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !dateUtc) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getAccountAnalyticsDailyDayTrades(accountId, dateUtc ?? "", {
          from_utc: fromUtc,
          to_utc: toUtc,
          symbol,
          side,
          session,
        });

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setData(null);
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
  }, [accountId, dateUtc, fromUtc, open, session, side, symbol, toUtc]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-[28px] bg-popover p-6">
        <DialogHeader>
          <DialogTitle>
            {dateUtc
              ? new Date(`${dateUtc}T00:00:00Z`).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })
              : "Day details"}
          </DialogTitle>
          <DialogDescription>
            Daily PnL and the closed trades behind it.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-3xl" />
        ) : error ? (
          <ApiErrorAlert title="No se pudo cargar el detalle del día" message={error} />
        ) : data ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <MetricTile label="Daily PnL" value={formatSignedCurrency(data.pnl)} />
              <MetricTile label="Trades" value={String(data.trades)} />
              <MetricTile label="Win rate" value={formatPercent(data.win_rate, 1)} />
              <MetricTile label="Volume" value={formatNumber(data.volume, 2)} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Side</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Vol</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>TP</TableHead>
                  <TableHead>Costs</TableHead>
                  <TableHead className="text-right">Net PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => (
                  <TableRow key={`${row.symbol}-${row.opened_at}-${index}`}>
                    <TableCell className="font-medium uppercase">{row.side}</TableCell>
                    <TableCell>{row.symbol}</TableCell>
                    <TableCell>{formatNumber(row.volume, 2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>Open {row.opened_at?.slice(11, 19) ?? "—"}</div>
                        <div className="text-muted-foreground">
                          Close {row.closed_at?.slice(11, 19) ?? "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{row.price_open ?? "—"}</div>
                        <div className="text-muted-foreground">~ {row.price_close ?? "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{row.sl_price ?? "—"}</TableCell>
                    <TableCell>{row.tp_price ?? "—"}</TableCell>
                    <TableCell>{formatSignedCurrency(-(row.commission + row.swap))}</TableCell>
                    <TableCell className={cn("text-right font-semibold", row.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                      {formatSignedCurrency(row.net_pnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/10 p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function ClientAnalyticsBehaviorPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
}: ClientAnalyticsBehaviorPanelProps) {
  const [daily, setDaily] = useState<AnalyticsDaily | null>(null);
  const [behavior, setBehavior] = useState<AnalyticsBehavior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [dailyResponse, behaviorResponse] = await Promise.all([
          getAccountAnalyticsDaily(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
          getAccountAnalyticsBehavior(accountId, {
            from_utc: fromUtc,
            to_utc: toUtc,
            symbol,
            side,
            session,
          }),
        ]);

        if (!cancelled) {
          setDaily(dailyResponse.data);
          setBehavior(behaviorResponse.data);
          const firstDate =
            dailyResponse.data.days[dailyResponse.data.days.length - 1]?.date_utc ??
            dailyResponse.data.month_totals[
              dailyResponse.data.month_totals.length - 1
            ]?.month;

          if (firstDate) {
            const nextMonth = firstDate.length === 7
              ? new Date(`${firstDate}-01T00:00:00Z`)
              : new Date(`${firstDate}T00:00:00Z`);
            setSelectedMonth(
              new Date(
                Date.UTC(
                  nextMonth.getUTCFullYear(),
                  nextMonth.getUTCMonth(),
                  1,
                ),
              ),
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setDaily(null);
          setBehavior(null);
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

  const activeDaysByDate = useMemo(() => {
    if (!daily) {
      return new Map<string, AnalyticsDailyDay>();
    }

    return new Map(daily.days.map((day) => [dailyKey(day.date_utc), day]));
  }, [daily]);

  const visibleMonthDate = useMemo(
    () =>
      selectedMonth ??
      new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
      ),
    [selectedMonth],
  );

  const visibleMonthDays = useMemo(() => {
    if (!daily) {
      return [];
    }

    const monthPrefix = `${visibleMonthDate.getUTCFullYear()}-${String(
      visibleMonthDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    return daily.days.filter((day) => day.date_utc.startsWith(monthPrefix));
  }, [daily, visibleMonthDate]);

  if (loading && !daily) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="rounded-3xl">
              <CardContent className="pt-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-4 h-10 w-24" />
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
    return (
      <ApiErrorAlert title="No se pudo cargar Behavior" message={error} />
    );
  }

  if (!daily || !behavior) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos de behavior para esta cuenta.
      </p>
    );
  }

  const dayBalanceRatio =
    daily.stats.days_negative > 0
      ? daily.stats.days_positive / daily.stats.days_negative
      : daily.stats.days_positive;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SmallKpiCard
          title="Winning days"
          value={String(daily.stats.days_positive)}
          subtitle={`${formatPercent(
            daily.stats.days_traded > 0
              ? daily.stats.days_positive / daily.stats.days_traded
              : 0,
            0,
          )} of days positive`}
        />
        <SmallKpiCard
          title="Trades / day"
          value={formatNumber(daily.day_behavior.avg_trades_per_day, 1)}
          subtitle={`${daily.stats.days_traded} active days`}
        />
        <SmallKpiCard
          title="Win-day streak"
          value={String(daily.stats.max_consecutive_positive)}
          subtitle={`max ${daily.stats.current_consecutive_positive} consecutive`}
        />
        <SmallKpiCard
          title="Volatility Σ"
          value={daily.day_behavior.daily_pnl_std > 0 ? formatNumber(daily.day_behavior.daily_pnl_std) : "—"}
          subtitle={`Daily PnL dispersion (${daily.stats.days_traded} days)`}
        />
        <SmallKpiCard
          title="Break-even days"
          value={String(daily.day_behavior.near_breakeven.count)}
          subtitle={`${formatPercent(daily.day_behavior.near_breakeven.pct, 0)} with small |PnL|`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <PanelCard
          title="Daily PnL calendar"
          subtitle="Month: day calendar. Year: all 12 month cards - click one to open that month."
          kicker="Habit map"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">
                {visibleMonthDate.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </div>
            </div>
            <div className="flex gap-1 rounded-full border bg-muted/10 p-1">
              {(["month", "year"] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCalendarMode(mode)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    calendarMode === mode
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {calendarMode === "month" ? (
            <CalendarMonthView
              monthDate={visibleMonthDate}
              activeDays={activeDaysByDate}
              onSelectDay={(dateUtc) => {
                setSelectedDate(dateUtc);
                setDayDialogOpen(true);
              }}
            />
          ) : (
            <CalendarYearView
              monthTotals={daily.month_totals}
              selectedMonth={visibleMonthDate}
              onSelectMonth={(month) => {
                setSelectedMonth(month);
                setCalendarMode("month");
              }}
            />
          )}
        </PanelCard>

        <div className="flex flex-col gap-4">
          <PanelCard
            title="Day balance"
            subtitle="Positive vs negative day structure."
            kicker="Counts"
          >
            <div className="space-y-2">
              <MetricTile label="Positive PnL days" value={String(daily.stats.days_positive)} />
              <MetricTile label="Negative PnL days" value={String(daily.stats.days_negative)} />
              <MetricTile label="Max consecutive + days" value={String(daily.stats.max_consecutive_positive)} />
              <MetricTile label="Max consecutive red days" value={String(daily.stats.max_consecutive_negative)} />
              <MetricTile label="Traded days" value={String(daily.stats.days_traded)} />
              <MetricTile label="+ / - day ratio" value={formatNumber(dayBalanceRatio, 3)} />
            </div>
          </PanelCard>

          <PanelCard
            title="Streak timeline"
            subtitle="Consecutive blocks of positive (green) or negative (red) days."
            kicker="Streaks"
          >
            <StreakTimeline segments={daily.day_behavior.streak_segments} />
          </PanelCard>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PanelCard
          title="Daily PnL and trades"
          subtitle="Net result (bars) and trade volume (line)."
          kicker="Day by day"
        >
          <DailyPnlTradesChart days={visibleMonthDays.length ? visibleMonthDays : daily.days} />
        </PanelCard>

        <PanelCard
          title="Win rate per trade"
          subtitle="10-trade rolling WR and cumulative WR."
          kicker="Consistency"
        >
          <WinRateSeriesChart behavior={behavior} />
        </PanelCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PanelCard
          title="Post-loss & rest"
          subtitle="Trades after red days, rest days, and Fri to Mon carryover."
          kicker="Psychology"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <MetricTile
              label="Overall avg trades/day"
              value={formatNumber(daily.day_behavior.avg_trades_per_day, 1)}
            />
            <MetricTile
              label="Trades/day green vs red"
              value={`${formatNumber(daily.day_behavior.avg_trades_pos_days, 1)} / ${formatNumber(daily.day_behavior.avg_trades_neg_days, 1)}`}
            />
            <MetricTile
              label="Days off"
              value={String(daily.day_behavior.off_days.break_count)}
            />
            <MetricTile
              label="Avg next-day PnL"
              value={formatSignedCurrency(daily.day_behavior.off_days.avg_pnl_after_trade_day)}
            />
            <MetricTile
              label="After red Fri"
              value={formatSignedCurrency(daily.day_behavior.weekend_carryover.mon_after_red_fri)}
            />
            <MetricTile
              label="After green Fri"
              value={formatSignedCurrency(daily.day_behavior.weekend_carryover.mon_after_green_fri)}
            />
          </div>
        </PanelCard>

        <PanelCard
          title="Day transition matrix"
          subtitle="Probability that a +/- day is followed by another +/- day."
          kicker="Markov"
        >
          <TransitionMatrix matrix={daily.day_behavior.transition_matrix} />
        </PanelCard>
      </div>

      <PanelCard
        title="Trade-level behavior"
        subtitle="Revenge, gaps, sizing, first-trade hour, and W/L sequence."
        kicker="Trade level"
      >
        <div className="grid gap-3 lg:grid-cols-4">
          <MetricTile label="Max L streak" value={String(behavior.max_consecutive_losses)} />
          <MetricTile label="Revenge (1H)" value={String(behavior.revenge_trades)} />
          <MetricTile label="Σ lots" value={formatNumber(behavior.volume_std_lots, 2)} />
          <MetricTile label="Avg gap" value={formatDuration(behavior.avg_gap_sec)} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                W/L sequence (recent trades)
              </div>
              <TradeSequence sequence={behavior.win_loss_sequence} />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Time between trades
              </div>
              <HistogramLine buckets={behavior.gap_histogram} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                First trade of day to avg PnL
              </div>
              <FirstTradeHourBars hours={behavior.first_trade_hours} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                First trade predicts the day:{" "}
                <strong className="text-foreground">
                  {formatPercent(behavior.first_trade_predicts_day_pct, 0)}
                </strong>
              </span>
              <span>
                Recent WR{" "}
                <strong className="text-foreground">
                  {formatPercent(behavior.recent_trade_win_rate, 0)}
                </strong>{" "}
                vs baseline{" "}
                <strong className="text-foreground">
                  {formatPercent(behavior.baseline_trade_win_rate, 0)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </PanelCard>

      <DayTradesDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        accountId={accountId}
        dateUtc={selectedDate}
        fromUtc={fromUtc}
        toUtc={toUtc}
        symbol={symbol}
        side={side}
        session={session}
      />
    </div>
  );
}
