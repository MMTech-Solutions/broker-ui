"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountAnalyticsOverview } from "@/features/client-risk-metrics/api";
import type { AnalyticsOverview } from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientAnalyticsDashboardPanelProps = {
  accountId: string;
  fromUtc: string;
  toUtc: string;
  refreshToken: number;
  active: boolean;
};

function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number): string {
  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${formatNumber(pct)}%`;
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ClientAnalyticsDashboardPanel({
  accountId,
  fromUtc,
  toUtc,
  refreshToken,
  active,
}: ClientAnalyticsDashboardPanelProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getAccountAnalyticsOverview(accountId, {
          from_utc: fromUtc,
          to_utc: toUtc,
        });
        if (!cancelled) {
          setOverview(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatBrokerApiError(err));
          setOverview(null);
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
  }, [accountId, fromUtc, toUtc, refreshToken, active]);

  if (loading && !overview) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
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

  const kpis = overview.kpis;
  const costs = overview.costs;
  const equity = overview.equity;
  const risk = overview.risk;
  const live = overview.live;
  const health = overview.health;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Generado:{" "}
          <span className="font-medium tabular-nums text-foreground">
            {new Date(overview.generated_at).toLocaleString("es-ES")}
          </span>
          {health ? (
            <>
              {" · "}Salud:{" "}
              <span className="font-medium text-foreground">
                {health.level} ({formatNumber(health.score, 0)})
              </span>
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => setShowRaw((current) => !current)}
          className="rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {showRaw ? "Ocultar JSON" : "Ver JSON crudo"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard label="Trades" value={String(kpis.trades)} />
        <KpiCard label="Win rate" value={formatPercent(kpis.win_rate)} />
        <KpiCard label="Profit factor" value={formatNumber(kpis.profit_factor)} />
        <KpiCard label="Expectancy" value={formatNumber(kpis.expectancy)} />
        <KpiCard label="Avg win" value={formatNumber(kpis.avg_win)} />
        <KpiCard label="Avg loss" value={formatNumber(kpis.avg_loss)} />
        <KpiCard label="Best trade" value={formatNumber(kpis.best_trade)} />
        <KpiCard label="Worst trade" value={formatNumber(kpis.worst_trade)} />
      </div>

      {costs || equity || risk || live ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {costs ? (
            <KpiCard label="Net PnL" value={formatNumber(costs.net_pnl)} />
          ) : null}
          {equity ? (
            <KpiCard
              label="Return"
              value={formatPercent(equity.return_pct)}
            />
          ) : null}
          {risk ? (
            <KpiCard
              label="Max drawdown"
              value={formatPercent(risk.max_drawdown_pct)}
            />
          ) : null}
          {live ? (
            <KpiCard label="Equity live" value={formatNumber(live.equity)} />
          ) : null}
        </div>
      ) : null}

      {showRaw ? (
        <pre className="max-h-[32rem] overflow-auto rounded-xl border bg-muted/40 p-4 text-xs leading-relaxed">
          {JSON.stringify(overview, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
