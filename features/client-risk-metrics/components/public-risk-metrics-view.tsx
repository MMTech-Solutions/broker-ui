"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { getPublicRiskMetricsSummary } from "@/features/client-risk-metrics/api";
import { RiskMetricsSummaryCards } from "@/features/client-risk-metrics/components/risk-metrics-summary-cards";
import { TradingStreamLiveStatus } from "@/features/client-risk-metrics/components/trading-stream-live-status";
import { applyRiskMetricChanges } from "@/features/client-risk-metrics/apply-metric-changes";
import { useTradingStreamPhaseMetricsChannel } from "@/features/client-risk-metrics/hooks/use-trading-stream-phase-metrics-channel";
import type { RiskMetricsSummary } from "@/features/client-risk-metrics/types";
import { BrokerApiError, formatBrokerApiError } from "@/lib/api/errors";

const DAYS_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

type PublicRiskMetricsViewProps = {
  shareUuid: string;
};

function isInactiveShareError(err: unknown): boolean {
  return err instanceof BrokerApiError && (err.status === 404 || err.status === 403);
}

export function PublicRiskMetricsView({ shareUuid }: PublicRiskMetricsViewProps) {
  const [summary, setSummary] = useState<RiskMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inactive, setInactive] = useState(false);
  const [days, setDays] = useState(30);
  const [isLive, setIsLive] = useState(true);

  const streamStatus = useTradingStreamPhaseMetricsChannel({
    shareUuid,
    enabled: isLive && !inactive,
    onMetrics: (payload) => {
      setSummary((current) => current ? applyRiskMetricChanges(current, payload) : current);
    },
  });

  const fetchSummary = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);
      setInactive(false);

      try {
        const response = await getPublicRiskMetricsSummary(shareUuid, { days });
        setSummary(response.data);
      } catch (err) {
        if (isInactiveShareError(err)) {
          setInactive(true);
          setSummary(null);
          setError(null);
        } else {
          setError(formatBrokerApiError(err));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [shareUuid, days],
  );

  useEffect(() => {
    queueMicrotask(() => void fetchSummary(true));
  }, [fetchSummary]);

  function handleManualRefresh() {
    void fetchSummary(false);
  }

  function handleDaysChange(value: number) {
    setDays(value);
    setIsLive(false);
  }

  function goLive() {
    setDays(30);
    setIsLive(true);
  }

  if (inactive) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 md:p-8">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Métricas compartidas
          </h1>
          <p className="text-sm text-muted-foreground">
            Enlace público de métricas de riesgo
          </p>
        </header>
        <ApiErrorAlert
          title="Enlace no disponible"
          message="Este enlace de métricas no está activo, ha expirado o no existe."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Métricas compartidas
          </h1>
          <p className="text-sm text-muted-foreground">
            Vista de solo lectura
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          aria-label="Actualizar métricas"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </Button>
      </header>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar las métricas"
          message={error}
        />
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-md border bg-muted/40 px-3 py-1.5 text-sm font-medium">
            Overview
          </span>

          <div className="flex items-center gap-2">
            {isLive ? (
              <TradingStreamLiveStatus status={streamStatus} />
            ) : (
              <Button variant="outline" size="sm" onClick={goLive}>
                Go Live
              </Button>
            )}
            <span className="text-xs text-muted-foreground">Período:</span>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              {DAYS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDaysChange(option.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    days === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <RiskMetricsSummaryCards summary={summary} loading={loading} />

        {summary ? (
          <p className="text-xs text-muted-foreground">
            Fase: <span className="font-medium">{summary.phase_name}</span>
            {" · "}
            Datos hasta:{" "}
            <span className="font-medium tabular-nums">
              {new Date(summary.series_end_date_utc).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            {refreshing ? (
              <span className="ml-2 text-muted-foreground/60">
                Actualizando…
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
