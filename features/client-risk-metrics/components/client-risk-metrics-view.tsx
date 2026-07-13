"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart2Icon, RefreshCwIcon, WifiIcon, WifiOffIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { applyRiskMetricChanges } from "@/features/client-risk-metrics/apply-metric-changes";
import { getAccountRiskMetricsSummary } from "@/features/client-risk-metrics/api";
import { RiskMetricsBalanceChart } from "@/features/client-risk-metrics/components/risk-metrics-balance-chart";
import { RiskMetricsShareDialog } from "@/features/client-risk-metrics/components/risk-metrics-share-dialog";
import { RiskMetricsSummaryCards } from "@/features/client-risk-metrics/components/risk-metrics-summary-cards";
import type {
  RiskMetricChangedPayload,
  RiskMetricsSummary,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import {
  getEchoClient,
  isRealtimeConfigured,
  riskMetricsPrivateChannel,
} from "@/lib/realtime/echo";

const DAYS_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

type Tab = "summary" | "chart";
type LiveStatus = "idle" | "connecting" | "connected" | "unavailable" | "error";

type ClientRiskMetricsViewProps = {
  accountId: string;
  accountLogin?: string;
};

export function ClientRiskMetricsView({
  accountId,
  accountLogin,
}: ClientRiskMetricsViewProps) {
  const [summary, setSummary] = useState<RiskMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("idle");

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/client" },
    { label: "Cuentas de trading", href: "/client/accounts" },
    {
      label: accountLogin ? `Cuenta ${accountLogin}` : "Cuenta",
      href: `/client/accounts`,
    },
    { label: "Métricas", current: true },
  ];

  const fetchSummary = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const response = await getAccountRiskMetricsSummary(accountId, { days });
        setSummary(response.data);
      } catch (err) {
        setError(formatBrokerApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId, days],
  );

  useEffect(() => {
    void fetchSummary(true);
  }, [fetchSummary]);

  useEffect(() => {
    if (!isRealtimeConfigured()) {
      setLiveStatus("unavailable");
      return;
    }

    const echo = getEchoClient();
    if (!echo) {
      setLiveStatus("unavailable");
      return;
    }

    setLiveStatus("connecting");
    const channelName = riskMetricsPrivateChannel(accountId);
    const channel = echo.private(channelName);

    channel
      .subscribed(() => {
        setLiveStatus("connected");
      })
      .error(() => {
        setLiveStatus("error");
      })
      .listen(".metric.changed", (payload: RiskMetricChangedPayload) => {
        setSummary((current) => {
          if (!current) {
            return current;
          }

          return applyRiskMetricChanges(current, payload);
        });
      });

    return () => {
      echo.leave(channelName);
    };
  }, [accountId]);

  function handleManualRefresh() {
    void fetchSummary(false);
  }

  const liveLabel =
    liveStatus === "connected"
      ? "En vivo"
      : liveStatus === "connecting"
        ? "Conectando…"
        : liveStatus === "error"
          ? "Tiempo real no disponible"
          : liveStatus === "unavailable"
            ? "Sin WebSocket"
            : null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        {liveLabel ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
              liveStatus === "connected"
                ? "border-emerald-500/40 text-emerald-600"
                : "text-muted-foreground"
            }`}
          >
            {liveStatus === "connected" ? (
              <WifiIcon className="h-3.5 w-3.5" />
            ) : (
              <WifiOffIcon className="h-3.5 w-3.5" />
            )}
            {liveLabel}
          </span>
        ) : null}
        <RiskMetricsShareDialog accountId={accountId} />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleManualRefresh}
          disabled={loading || refreshing}
          aria-label="Actualizar métricas"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar las métricas"
          message={error}
        />
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <button
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
              Curva de balance
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Período:</span>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              {DAYS_OPTIONS.map((option) => (
                <button
                  key={option.value}
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
          <RiskMetricsBalanceChart summary={summary} loading={loading} />
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
