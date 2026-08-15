"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAccountAnalyticsSymbols } from "@/features/client-risk-metrics/api";
import { ClientAnalyticsBehaviorPanel } from "@/features/client-risk-metrics/components/client-analytics-behavior-panel";
import { ClientAnalyticsProfitabilityPanel } from "@/features/client-risk-metrics/components/client-analytics-profitability-panel";
import { ClientAnalyticsRiskDrawdownPanel } from "@/features/client-risk-metrics/components/client-analytics-risk-drawdown-panel";
import { ClientAnalyticsSymbolPanel } from "@/features/client-risk-metrics/components/client-analytics-symbol-panel";
import { ClientAnalyticsTemporalPanel } from "@/features/client-risk-metrics/components/client-analytics-temporal-panel";
import { ClientAnalyticsDashboardPanel } from "@/features/client-risk-metrics/components/client-analytics-dashboard-panel";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const DEFAULT_SYMBOL_OPTION = { value: "all", label: "All" };

const DATE_RANGE_OPTIONS = [
  { value: "7", label: "7d" },
  { value: "14", label: "14d" },
  { value: "30", label: "30d" },
  { value: "60", label: "60d" },
  { value: "90", label: "90d" },
];

const SESSION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "sydney", label: "Sydney" },
  { value: "tokyo", label: "Tokyo" },
  { value: "london", label: "London" },
  { value: "ny", label: "New York" },
];

const SIDE_OPTIONS = [
  { value: "both", label: "Both" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

const ANALYTICS_TABS = [
  {
    value: "overview",
    label: "Overview",
    description: "Where am I?",
  },
  {
    value: "profitability",
    label: "Profitability",
    description: "Do I make money, and why?",
  },
  {
    value: "behavior",
    label: "Behavior",
    description: "Which habits hurt me?",
  },
  {
    value: "risk",
    label: "Risk & Drawdown",
    description: "Am I managing risk?",
  },
  {
    value: "symbol",
    label: "By symbol",
    description: "Where do I win/lose?",
  },
  {
    value: "temporal",
    label: "Temporal",
    description: "When do I trade best?",
  },
] as const;

type AnalyticsTab = (typeof ANALYTICS_TABS)[number]["value"];

type ClientRiskMetricsViewProps = {
  accountId: string;
  accountLogin?: string;
};

function AnalyticsTabPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[24rem] items-center justify-center rounded-2xl border border-dashed bg-background/80 px-6 py-10 text-center text-sm text-muted-foreground">
          Vista en maqueta pendiente de detalle funcional.
        </div>
      </CardContent>
    </Card>
  );
}

export function ClientRiskMetricsView({
  accountId,
  accountLogin,
}: ClientRiskMetricsViewProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [days, setDays] = useState("30");
  const [symbol, setSymbol] = useState("all");
  const [side, setSide] = useState("both");
  const [session, setSession] = useState("all");
  const [analyticsRefreshToken, setAnalyticsRefreshToken] = useState(0);
  const [symbolOptions, setSymbolOptions] = useState([DEFAULT_SYMBOL_OPTION]);

  const analyticsWindow = useMemo(() => {
    const totalDays = Number.parseInt(days, 10) || 30;
    const to = new Date();
    to.setUTCSeconds(0, 0);
    const from = new Date(to.getTime() - totalDays * 24 * 60 * 60 * 1000);

    return {
      from_utc: from.toISOString(),
      to_utc: to.toISOString(),
    };
  }, [days]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/client" },
    { label: "Cuentas de trading", href: "/client/accounts" },
    {
      label: accountLogin ? `Cuenta ${accountLogin}` : "Cuenta",
      href: "/client/accounts",
    },
    { label: "Métricas", current: true },
  ];

  const activeTabMeta =
    ANALYTICS_TABS.find((tab) => tab.value === activeTab) ?? ANALYTICS_TABS[0];

  useEffect(() => {
    let cancelled = false;

    async function loadSymbolOptions() {
      try {
        const response = await getAccountAnalyticsSymbols(accountId, {
          from_utc: analyticsWindow.from_utc,
          to_utc: analyticsWindow.to_utc,
          side: side === "both" ? undefined : side,
          session: session === "all" ? undefined : session,
        });

        if (cancelled) {
          return;
        }

        const nextOptions = response.data.symbols
          .map((item) => item.symbol?.trim())
          .filter((item): item is string => Boolean(item))
          .filter((item, index, items) => items.indexOf(item) === index)
          .sort((left, right) => left.localeCompare(right))
          .map((item) => ({ value: item, label: item }));

        setSymbolOptions([DEFAULT_SYMBOL_OPTION, ...nextOptions]);
        setSymbol((current) =>
          current === "all" || nextOptions.some((option) => option.value === current)
            ? current
            : "all",
        );
      } catch {
        if (!cancelled) {
          setSymbolOptions([DEFAULT_SYMBOL_OPTION]);
          setSymbol("all");
        }
      }
    }

    void loadSymbolOptions();

    return () => {
      cancelled = true;
    };
  }, [
    accountId,
    analyticsRefreshToken,
    analyticsWindow.from_utc,
    analyticsWindow.to_utc,
    side,
    session,
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setAnalyticsRefreshToken((current) => current + 1)}
          aria-label="Actualizar analytics"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </PageContentToolbar>

      <section className="rounded-[28px] border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Advanced Analytics for{" "}
              <span className="text-emerald-600">
                {accountLogin ?? accountId}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Current phase only · Performance, behavior, and risk for this
              trading account.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {ANALYTICS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "min-w-[140px] rounded-2xl border px-4 py-3 text-left transition-colors",
                    activeTab === tab.value
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      activeTab === tab.value
                        ? "text-emerald-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
              <div className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                Live
              </div>

              <AnalyticsFilterSelect
                label="Date range"
                value={days}
                onValueChange={setDays}
                options={DATE_RANGE_OPTIONS}
              />
              <AnalyticsFilterSelect
                label="Symbol"
                value={symbol}
                onValueChange={setSymbol}
                options={symbolOptions}
              />
              <AnalyticsFilterSelect
                label="Side"
                value={side}
                onValueChange={setSide}
                options={SIDE_OPTIONS}
              />
              <AnalyticsFilterSelect
                label="Session"
                value={session}
                onValueChange={setSession}
                options={SESSION_OPTIONS}
              />
            </div>
          </div>

          {activeTab === "overview" ? (
            <ClientAnalyticsDashboardPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : activeTab === "profitability" ? (
            <ClientAnalyticsProfitabilityPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : activeTab === "behavior" ? (
            <ClientAnalyticsBehaviorPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : activeTab === "risk" ? (
            <ClientAnalyticsRiskDrawdownPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : activeTab === "symbol" ? (
            <ClientAnalyticsSymbolPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : activeTab === "temporal" ? (
            <ClientAnalyticsTemporalPanel
              accountId={accountId}
              fromUtc={analyticsWindow.from_utc}
              toUtc={analyticsWindow.to_utc}
              refreshToken={analyticsRefreshToken}
              active
              symbol={symbol === "all" ? undefined : symbol}
              side={side === "both" ? undefined : side}
              session={session === "all" ? undefined : session}
            />
          ) : (
            <AnalyticsTabPlaceholder
              title={activeTabMeta.label}
              description={activeTabMeta.description}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function AnalyticsFilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <span className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 rounded-full bg-background px-4">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
