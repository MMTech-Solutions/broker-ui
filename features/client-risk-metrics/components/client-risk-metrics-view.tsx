"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart2Icon,
  LayersIcon,
  RefreshCwIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { ClientPositionsPanel } from "@/features/client-positions/components/client-positions-panel";
import {
  applyLiveEquityChange,
  applyRiskMetricChanges,
} from "@/features/client-risk-metrics/apply-metric-changes";
import {
  getAccountRiskMetricsHistory,
  getAccountRiskMetricsSummary,
} from "@/features/client-risk-metrics/api";
import { RiskMetricsEquityChart } from "@/features/client-risk-metrics/components/risk-metrics-equity-chart";
import { RiskMetricsShareDialog } from "@/features/client-risk-metrics/components/risk-metrics-share-dialog";
import { RiskMetricsSummaryCards } from "@/features/client-risk-metrics/components/risk-metrics-summary-cards";
import type {
  RiskMetricChangedPayload,
  RiskMetricsHistory,
  RiskMetricsSummary,
} from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import {
  getEchoClient,
  isRealtimeConfigured,
  riskMetricsPrivateChannel,
  subscribeEchoConnectionStatus,
} from "@/lib/realtime/echo";

const DAYS_OPTIONS = [
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

type Tab = "summary" | "chart" | "positions";
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
  const [equityHistory, setEquityHistory] =
    useState<RiskMetricsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
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

  const fetchEquityHistory = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setHistoryLoading(true);
      else setHistoryRefreshing(true);
      setHistoryError(null);

      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

      try {
        const response = await getAccountRiskMetricsHistory(accountId, {
          metric_key: "equity",
          from_utc: from.toISOString(),
          to_utc: to.toISOString(),
          granularity: "hour",
          sort: "time_asc",
          limit: 5000,
        });
        setEquityHistory(response.data);
      } catch (err) {
        setHistoryError(formatBrokerApiError(err));
      } finally {
        setHistoryLoading(false);
        setHistoryRefreshing(false);
      }
    },
    [accountId, days],
  );

  useEffect(() => {
    if (activeTab === "positions") {
      return;
    }

    void fetchSummary(true);
    if (activeTab === "chart") {
      void fetchEquityHistory(true);
    }
  }, [fetchEquityHistory, fetchSummary, activeTab]);

  const activeTabRef = useRef(activeTab);
  const fetchEquityHistoryRef = useRef(fetchEquityHistory);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    fetchEquityHistoryRef.current = fetchEquityHistory;
  }, [fetchEquityHistory]);

  useEffect(() => {
    if (!isRealtimeConfigured()) {
      setLiveStatus("unavailable");
      return;
    }

    let echo: ReturnType<typeof getEchoClient>;

    try {
      echo = getEchoClient();
    } catch {
      setLiveStatus("error");
      return;
    }

    if (!echo) {
      setLiveStatus("unavailable");
      return;
    }

    setLiveStatus("connecting");
    const channelName = riskMetricsPrivateChannel(accountId);
    const unsubscribeConnection = subscribeEchoConnectionStatus(
      echo,
      (status) => {
        if (status === "connected") {
          // Keep "connecting" until private channel auth succeeds.
          setLiveStatus((current) =>
            current === "connected" ? current : "connecting",
          );
          return;
        }

        if (status === "failed" || status === "unavailable") {
          setLiveStatus("error");
          return;
        }

        if (status === "disconnected") {
          setLiveStatus("error");
        }
      },
    );

    const channel = echo.private(channelName);

    channel
      .subscribed(() => {
        setLiveStatus("connected");
        if (activeTabRef.current === "chart") {
          void fetchEquityHistoryRef.current(false);
        }
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
        setEquityHistory((current) =>
          current ? applyLiveEquityChange(current, payload) : current,
        );
      });

    return () => {
      unsubscribeConnection();
      echo?.leave(channelName);
    };
  }, [accountId]);

  function handleManualRefresh() {
    void fetchSummary(false);
    if (activeTab === "chart") {
      void fetchEquityHistory(false);
    }
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

  const showMetricsChrome = activeTab !== "positions";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        {liveLabel && showMetricsChrome ? (
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
        {showMetricsChrome ? (
          <>
            <RiskMetricsShareDialog accountId={accountId} />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleManualRefresh}
              disabled={
                loading ||
                refreshing ||
                historyLoading ||
                historyRefreshing
              }
              aria-label="Actualizar métricas"
            >
              <RefreshCwIcon
                className={`h-4 w-4 ${
                  refreshing || historyRefreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          </>
        ) : null}
      </PageContentToolbar>

      {error && showMetricsChrome ? (
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
              Curva de equity
            </button>
            <button
              onClick={() => setActiveTab("positions")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "positions"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayersIcon className="h-3.5 w-3.5" />
              Posiciones
            </button>
          </div>

          {showMetricsChrome ? (
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
          ) : null}
        </div>

        {activeTab === "summary" ? (
          <RiskMetricsSummaryCards summary={summary} loading={loading} />
        ) : activeTab === "chart" ? (
          <RiskMetricsEquityChart
            history={equityHistory}
            loading={historyLoading}
          />
        ) : (
          <ClientPositionsPanel accountId={accountId} />
        )}

        {summary && showMetricsChrome ? (
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
