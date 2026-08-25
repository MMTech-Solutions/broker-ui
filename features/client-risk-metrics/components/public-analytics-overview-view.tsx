"use client";

import { useMemo, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientAnalyticsDashboardPanel } from "@/features/client-risk-metrics/components/client-analytics-dashboard-panel";
import { TradingStreamLiveStatus } from "@/features/client-risk-metrics/components/trading-stream-live-status";
import { useTradingStreamPhaseMetricsChannel } from "@/features/client-risk-metrics/hooks/use-trading-stream-phase-metrics-channel";

const SELECT_OPTIONS = {
  days: [["7", "7d"], ["14", "14d"], ["30", "30d"], ["60", "60d"], ["90", "90d"]],
  side: [["both", "Both"], ["buy", "Buy"], ["sell", "Sell"]],
  session: [["all", "All"], ["sydney", "Sydney"], ["tokyo", "Tokyo"], ["london", "London"], ["ny", "New York"]],
} as const;

export function PublicAnalyticsOverviewView({ shareUuid }: { shareUuid: string }) {
  const [days, setDays] = useState("30");
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("both");
  const [session, setSession] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const range = useMemo(() => {
    const to = new Date();
    to.setUTCSeconds(0, 0);
    const from = new Date(to.getTime() - (Number.parseInt(days, 10) || 30) * 86_400_000);
    return { fromUtc: from.toISOString(), toUtc: to.toISOString() };
  }, [days]);

  const streamStatus = useTradingStreamPhaseMetricsChannel({
    shareUuid,
    enabled: isLive,
    onMetrics: () => setRefreshToken((value) => value + 1),
  });

  function filter(setter: (value: string) => void, value: string) {
    setter(value);
    setIsLive(false);
  }

  function goLive() {
    setDays("30");
    setSymbol("");
    setSide("both");
    setSession("all");
    setIsLive(true);
    setRefreshToken((value) => value + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-8">
      <section className="rounded-[28px] border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Advanced Analytics</h1>
            <p className="text-sm text-muted-foreground">Shared read-only view. Current phase only.</p>
          </div>
          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <div className="min-w-[140px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                <span className="block text-sm font-semibold text-foreground">Overview</span>
                <span className="mt-1 block text-xs text-emerald-600">Where am I?</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {isLive ? <TradingStreamLiveStatus status={streamStatus} /> : <Button variant="outline" size="sm" onClick={goLive}>Go Live</Button>}
              <Filter label="Date range" value={days} options={SELECT_OPTIONS.days} onChange={(value) => filter(setDays, value)} />
              <label className="flex items-center gap-2 text-xs text-muted-foreground"><span>Symbol</span><input className="h-8 w-24 rounded-md border bg-background px-2 text-xs text-foreground" value={symbol} placeholder="All" onChange={(event) => filter(setSymbol, event.target.value)} /></label>
              <Filter label="Side" value={side} options={SELECT_OPTIONS.side} onChange={(value) => filter(setSide, value)} />
              <Filter label="Session" value={session} options={SELECT_OPTIONS.session} onChange={(value) => filter(setSession, value)} />
              <Button variant="ghost" size="icon-sm" onClick={() => setRefreshToken((value) => value + 1)} aria-label="Refresh overview"><RefreshCwIcon className="h-4 w-4" /></Button>
            </div>
          </div>
          <ClientAnalyticsDashboardPanel
            shareUuid={shareUuid}
            fromUtc={range.fromUtc}
            toUtc={range.toUtc}
            refreshToken={refreshToken}
            active
            symbol={symbol || undefined}
            side={side === "both" ? undefined : side as "buy" | "sell"}
            session={session === "all" ? undefined : session as "sydney" | "tokyo" | "london" | "ny"}
          />
        </div>
      </section>
    </div>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <label className="flex items-center gap-2 text-xs text-muted-foreground"><span>{label}</span><select className="h-8 rounded-md border bg-background px-2 text-xs text-foreground" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}
