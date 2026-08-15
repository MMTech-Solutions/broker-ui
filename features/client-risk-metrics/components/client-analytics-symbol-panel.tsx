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
  getAccountAnalyticsSymbols,
} from "@/features/client-risk-metrics/api";
import type {
  AnalyticsSymbolSideStats,
  AnalyticsSymbolStats,
  AnalyticsSymbols,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";

type ClientAnalyticsSymbolPanelProps = {
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

function formatSymbolMetric(value: number, digits = 2): string {
  if (Math.abs(value) < 0.005) {
    return value < 0 ? "-$0" : "+$0";
  }

  return `${value >= 0 ? "+" : "-"}$${formatNumber(Math.abs(value), digits)}`;
}

function formatSideLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

function SummaryCard({
  title,
  headline,
  value,
  subtitle,
}: {
  title: string;
  headline: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex min-h-[136px] flex-col gap-3 pt-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <div className="text-3xl font-semibold tracking-tight">{headline}</div>
        <div className={cn("text-lg font-semibold", value.startsWith("-") ? "text-rose-500" : "text-emerald-600")}>
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
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function SymbolSideCard({ side }: { side: AnalyticsSymbolSideStats }) {
  return (
    <div className="rounded-3xl border bg-muted/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{formatSideLabel(side.side)}</div>
        <div className="text-xs text-muted-foreground">{side.trades} trades</div>
      </div>
      <div className={cn("mt-4 text-2xl font-semibold tabular-nums", side.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
        {formatSymbolMetric(side.net_pnl)}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Win rate {formatPercent(side.win_rate, 0)}
      </div>
    </div>
  );
}

function SymbolDetailDialog({
  symbol,
  open,
  onOpenChange,
}: {
  symbol: AnalyticsSymbolStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!symbol) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl rounded-[28px] bg-popover p-6">
        <DialogHeader>
          <DialogTitle>{symbol.symbol}</DialogTitle>
          <DialogDescription>
            {symbol.trades} trades · win {formatPercent(symbol.win_rate, 1)} · net{" "}
            <span className={symbol.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500"}>
              {formatSymbolMetric(symbol.net_pnl)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 xl:grid-cols-3">
          <PanelCard
            title="Edge"
            subtitle="Quality of wins vs losses on this symbol."
          >
            <div className="space-y-1">
              <MetricRow label="Avg win" value={formatSymbolMetric(symbol.avg_win)} valueClassName="text-emerald-600" />
              <MetricRow label="Avg loss" value={formatSymbolMetric(symbol.avg_loss)} valueClassName="text-rose-500" />
              <MetricRow label="W/L ratio" value={formatNumber(symbol.payoff_ratio, 2)} />
              <MetricRow label="PnL / lot" value={formatSymbolMetric(symbol.pnl_per_lot)} valueClassName={symbol.pnl_per_lot >= 0 ? "text-emerald-600" : "text-rose-500"} />
            </div>
          </PanelCard>

          <PanelCard
            title="Costs"
            subtitle="Commissions / fees eating into this symbol."
          >
            <div className="space-y-1">
              <MetricRow label="Total costs" value={formatNumber(symbol.costs_total, 2)} />
              <MetricRow label="Cost per trade" value={formatNumber(symbol.cost_per_trade, 2)} />
              <MetricRow label="Cost drag %" value={formatPercent(symbol.cost_drag_pct, 0)} />
              <MetricRow label="Adjusted PnL" value={formatSymbolMetric(symbol.pnl_adjusted)} valueClassName={symbol.pnl_adjusted >= 0 ? "text-emerald-600" : "text-rose-500"} />
            </div>
          </PanelCard>

          <PanelCard
            title="Contribution"
            subtitle="How much this symbol weighs in the account."
          >
            <div className="space-y-1">
              <MetricRow label="% of total PnL" value={formatPercent(symbol.pnl_share_pct, 0)} />
              <MetricRow label="% of trades" value={formatPercent(symbol.trades_share_pct, 0)} />
              <MetricRow label="% of volume" value={formatPercent(symbol.volume_share_pct, 0)} />
              <MetricRow label="Realized PnL" value={formatSymbolMetric(symbol.net_pnl)} valueClassName={symbol.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500"} />
            </div>
          </PanelCard>
        </div>

        <PanelCard
          title="Long / Short"
          subtitle="Results by direction on this symbol."
          className="mt-1"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {symbol.sides.length ? (
              symbol.sides.map((side) => <SymbolSideCard key={side.side} side={side} />)
            ) : (
              <EmptyPanel message="No side-level stats for this symbol." />
            )}
          </div>
        </PanelCard>
      </DialogContent>
    </Dialog>
  );
}

export function ClientAnalyticsSymbolPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
  symbol,
  side,
  session,
}: ClientAnalyticsSymbolPanelProps) {
  const [data, setData] = useState<AnalyticsSymbols | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<AnalyticsSymbolStats | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getAccountAnalyticsSymbols(accountId, {
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
  }, [accountId, active, fromUtc, refreshToken, session, side, symbol, toUtc]);

  const sortedSymbols = useMemo(
    () => [...(data?.symbols ?? [])].sort((a, b) => b.net_pnl - a.net_pnl),
    [data],
  );

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
            <Skeleton className="h-[16rem] w-full rounded-3xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ApiErrorAlert title="No se pudo cargar By Symbol" message={error} />;
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos por símbolo para esta cuenta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Best instrument"
          headline={data.best_symbol?.symbol ?? "—"}
          value={data.best_symbol ? `${formatSymbolMetric(data.best_symbol.net_pnl)} · PF ${formatNumber(data.best_symbol.profit_factor, 2)}` : "—"}
          subtitle={data.best_symbol ? `Exp. ${formatNumber(data.best_symbol.expectancy, 2)}` : "No symbol with positive edge"}
        />
        <SummaryCard
          title="Worst instrument"
          headline={data.worst_symbol?.symbol ?? "—"}
          value={data.worst_symbol ? `${formatSymbolMetric(data.worst_symbol.net_pnl)} · PF ${formatNumber(data.worst_symbol.profit_factor, 2)}` : "—"}
          subtitle={data.worst_symbol ? `Exp. ${formatNumber(data.worst_symbol.expectancy, 2)}` : "No weak symbol identified"}
        />
        <SummaryCard
          title="Dependency"
          headline={data.concentration.dependency_symbol ?? "—"}
          value={data.concentration.dependency_pct !== null ? `${formatPercent(data.concentration.dependency_pct, 0)} of positive PnL` : "—"}
          subtitle={
            data.concentration.top1_pnl_abs_share_pct !== null &&
            data.concentration.top3_pnl_abs_share_pct !== null
              ? `Top-1 ${formatPercent(data.concentration.top1_pnl_abs_share_pct, 0)} · Top-3 ${formatPercent(data.concentration.top3_pnl_abs_share_pct, 0)} of absolute impact`
              : "Concentration not available"
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <PanelCard
          title="Performance by symbol"
          subtitle="Click a row or the eye to open Edge, Costs, Contribution, and Long/Short."
          kicker="Table"
        >
          {sortedSymbols.length ? (
            <div className="overflow-hidden rounded-3xl border bg-muted/10">
              <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.7fr_0.8fr_0.9fr_0.8fr_0.9fr_42px] gap-3 border-b border-border/60 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <div>Symbol</div>
                <div>Trades</div>
                <div>Win %</div>
                <div>PF</div>
                <div>Exp.</div>
                <div>Costs</div>
                <div>% PnL</div>
                <div>Net PnL</div>
                <div />
              </div>
              {sortedSymbols.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(item);
                    setDialogOpen(true);
                  }}
                  className="grid w-full grid-cols-[1.3fr_0.8fr_0.8fr_0.7fr_0.8fr_0.9fr_0.8fr_0.9fr_42px] items-center gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/15"
                >
                  <div className="font-semibold">{item.symbol}</div>
                  <div className="tabular-nums">{item.trades}</div>
                  <div className="tabular-nums">{formatPercent(item.win_rate, 1)}</div>
                  <div className={cn("tabular-nums", item.profit_factor < 1 ? "text-rose-500" : "text-amber-500")}>
                    {formatNumber(item.profit_factor, 2)}
                  </div>
                  <div className={cn("tabular-nums", item.expectancy >= 0 ? "text-foreground" : "text-rose-500")}>
                    {formatSymbolMetric(item.expectancy)}
                  </div>
                  <div className="tabular-nums">{formatNumber(item.costs_total, 2)}</div>
                  <div className="tabular-nums">
                    {item.pnl_share_pct ? formatPercent(item.pnl_share_pct, 0) : "—"}
                  </div>
                  <div className={cn("tabular-nums font-semibold", item.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                    {formatSymbolMetric(item.net_pnl)}
                  </div>
                  <div className="flex justify-center">
                    <span className="rounded-full border p-2 text-muted-foreground">
                      <EyeIcon className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyPanel message="No symbol stats available for the selected filters." />
          )}
        </PanelCard>

        <PanelCard
          title="Net PnL by symbol"
          subtitle="Relative contribution by instrument."
          kicker="Green/Red"
        >
          {sortedSymbols.length ? (
            <div className="space-y-4">
              {sortedSymbols.map((item) => {
                const maxAbs = Math.max(...sortedSymbols.map((entry) => Math.abs(entry.net_pnl)), 1);
                return (
                  <div key={item.symbol} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                    <div className="text-sm font-medium">{item.symbol}</div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-3 rounded-full",
                          item.net_pnl >= 0 ? "bg-emerald-500" : "bg-rose-500",
                        )}
                        style={{
                          width: `${Math.max((Math.abs(item.net_pnl) / maxAbs) * 100, 6)}%`,
                        }}
                      />
                    </div>
                    <div className={cn("text-sm font-semibold tabular-nums", item.net_pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                      {formatSymbolMetric(item.net_pnl)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyPanel message="No bars to render for the current filter set." />
          )}
        </PanelCard>
      </div>

      <SymbolDetailDialog
        symbol={selectedSymbol}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
