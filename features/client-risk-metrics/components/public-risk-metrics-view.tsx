"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart2Icon, RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  getPublicRiskMetricsHistory,
  getPublicRiskMetricsSummary,
} from "@/features/client-risk-metrics/api";
import { RiskMetricsEquityChart } from "@/features/client-risk-metrics/components/risk-metrics-equity-chart";
import { RiskMetricsSummaryCards } from "@/features/client-risk-metrics/components/risk-metrics-summary-cards";
import type {
  RiskMetricsHistory,
  RiskMetricsSummary,
} from "@/features/client-risk-metrics/types";
import { BrokerApiError, formatBrokerApiError } from "@/lib/api/errors";

const DAYS_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

type Tab = "summary" | "chart";

type PublicRiskMetricsViewProps = {
  shareUuid: string;
};

function isInactiveShareError(err: unknown): boolean {
  return err instanceof BrokerApiError && (err.status === 404 || err.status === 403);
}

export function PublicRiskMetricsView({ shareUuid }: PublicRiskMetricsViewProps) {
  const [summary, setSummary] = useState<RiskMetricsSummary | null>(null);
  const [equityHistory, setEquityHistory] =
    useState<RiskMetricsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [inactive, setInactive] = useState(false);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

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

  const fetchEquityHistory = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setHistoryLoading(true);
      else setHistoryRefreshing(true);
      setHistoryError(null);

      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

      try {
        const response = await getPublicRiskMetricsHistory(shareUuid, {
          metric_key: "equity",
          from_utc: from.toISOString(),
          to_utc: to.toISOString(),
          granularity: "hour",
          sort: "time_asc",
          limit: 5000,
        });
        setEquityHistory(response.data);
      } catch (err) {
        if (isInactiveShareError(err)) {
          setInactive(true);
          setEquityHistory(null);
          setHistoryError(null);
        } else {
          setHistoryError(formatBrokerApiError(err));
        }
      } finally {
        setHistoryLoading(false);
        setHistoryRefreshing(false);
      }
    },
    [shareUuid, days],
  );

  useEffect(() => {
    void fetchSummary(true);
    if (activeTab === "chart") {
      void fetchEquityHistory(true);
    }
  }, [fetchSummary, fetchEquityHistory, activeTab]);

  function handleManualRefresh() {
    void fetchSummary(false);
    if (activeTab === "chart") {
      void fetchEquityHistory(false);
    }
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
          disabled={loading || refreshing || historyLoading || historyRefreshing}
          aria-label="Actualizar métricas"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${
              refreshing || historyRefreshing ? "animate-spin" : ""
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

      {historyError && activeTab === "chart" ? (
        <ApiErrorAlert
          title="No se pudo cargar el historial de equity"
          message={historyError}
        />
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "summary"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2Icon className="h-3.5 w-3.5" />
              Resumen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chart")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "chart"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M1 12 L5 7 L8 9 L11 4 L15 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Curva de equity
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Período:</span>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              {DAYS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDays(option.value)}
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

        {activeTab === "summary" ? (
          <RiskMetricsSummaryCards summary={summary} loading={loading} />
        ) : (
          <RiskMetricsEquityChart
            history={equityHistory}
            loading={historyLoading}
          />
        )}

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
            {refreshing || historyRefreshing ? (
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
