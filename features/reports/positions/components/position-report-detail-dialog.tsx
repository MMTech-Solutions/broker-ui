"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentStatusLabel, paymentStatusVariant } from "@/features/ib-reward";
import { formatDuration, formatReportDate, formatReportMoney, formatReportRatio } from "@/features/reports/ib-volume-reward-trades";
import { getPositionReportDetail } from "@/features/reports/positions/api";
import type { PositionReportDetail, PositionReportIdentity, PositionReportRow } from "@/features/reports/positions/types";
import { formatBrokerApiError } from "@/lib/api/errors";

function identity(value: PositionReportIdentity) {
  return <div className="min-w-36"><p className="font-medium">{value.name || value.id}</p>{value.email ? <p className="text-xs text-muted-foreground">{value.email}</p> : null}<p className="font-mono text-[10px] text-muted-foreground">{value.id}</p></div>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 font-medium tabular-nums">{value}</div></div>;
}

export function PositionReportDetailDialog({ position, open, onOpenChange }: { position: PositionReportRow | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [detail, setDetail] = useState<PositionReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !position) return;
    const controller = new AbortController();
    queueMicrotask(() => { setLoading(true); setDetail(null); setError(null); });
    void getPositionReportDetail(position.position_id, controller.signal)
      .then((response) => { if (!controller.signal.aborted) setDetail(response.data); })
      .catch((cause) => { if (!controller.signal.aborted) setError(formatBrokerApiError(cause)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, position]);

  const row = detail?.position ?? position;
  const money = (value: string | null) => formatReportMoney(value, row?.currency_code, row?.currency_precision);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[min(76rem,calc(100%-2rem))]">
      <DialogHeader><DialogTitle>Position details</DialogTitle><DialogDescription>Trade, economics and IB reward hierarchy.</DialogDescription></DialogHeader>
      <div className="min-h-0 space-y-5 overflow-auto pr-1">
        {error ? <ApiErrorAlert title="Could not load position detail" message={error} /> : null}
        {loading ? <div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : null}
        {row ? <section className="space-y-3"><h3 className="font-medium">Trade</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Order / status" value={<>{row.operation_id} · <Badge variant={row.status === "closed" ? "secondary" : "default"}>{row.status}</Badge></>} />
          <Metric label="Client" value={row.client.name || row.client.id} />
          <Metric label="Account" value={row.trading_account.custom_name || row.trading_account.external_trader_id} />
          <Metric label="Platform / group" value={`${row.platform.name || row.platform.id} · ${row.server_group.meta_name || row.server_group.name || row.server_group.id}`} />
          <Metric label="Instrument" value={`${row.symbol} · ${row.side.toUpperCase()}`} />
          <Metric label="Volume / prices" value={`${row.volume} · ${row.open_price} → ${row.close_price ?? "open"}`} />
          <Metric label="Opened / closed" value={`${formatReportDate(row.opened_at)} · ${formatReportDate(row.closed_at)}`} />
          <Metric label="Duration / swap" value={`${formatDuration(row.duration_seconds)} · ${row.swap}`} />
        </div></section> : null}

        {detail ? <><section className="space-y-3"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">Economics</h3><Badge variant={detail.economics.calculation_availability.status === "available" ? "secondary" : "outline"}>{detail.economics.calculation_availability.status.replaceAll("_", " ")}</Badge></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Commission" value={money(detail.economics.commission)} /><Metric label="Markup revenue" value={money(detail.economics.markup_revenue)} /><Metric label="Revenue" value={money(detail.economics.revenue)} /><Metric label="PnL / gross" value={`${money(detail.economics.pnl)} / ${money(detail.economics.broker_gross)}`} /><Metric label="Reward / margin / ratio" value={`${money(row?.reward_paid ?? null)} / ${money(detail.economics.margin)} / ${formatReportRatio(detail.economics.ratio)}`} /></div>
          <p className="rounded-lg bg-muted/40 p-3 font-mono text-xs text-muted-foreground">Revenue = commission + (volume × markup per lot). Broker gross = {row?.book_type === "b_book" ? "revenue − PnL" : "revenue"}. Margin = revenue − paid rewards.</p>
          {detail.economics.flags.length ? <div className="flex flex-wrap gap-1">{detail.economics.flags.map((flag) => <Badge key={flag} variant="outline">{flag.replaceAll("_", " ")}</Badge>)}</div> : null}
        </section>

        <section className="space-y-3"><h3 className="font-medium">Reward summary</h3>{detail.reward_summary.length ? <div className="grid gap-3 md:grid-cols-2">{detail.reward_summary.map((summary, index) => {
          const summaryMoney = (value: string) => formatReportMoney(value, summary.currency_code, summary.currency_precision);
          return <div key={`${summary.currency_code ?? "unknown"}-${index}`} className="rounded-lg border p-3"><p className="font-medium">{summary.currency_code ?? "Unknown currency"} · {summary.lines} lines</p><div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5"><span>Paid {summaryMoney(summary.paid)}</span><span>Pending {summaryMoney(summary.pending)}</span><span>Processing {summaryMoney(summary.processing)}</span><span>Failed {summaryMoney(summary.failed)}</span><span>Cancelled {summaryMoney(summary.cancelled)}</span></div></div>;
        })}</div> : <p className="rounded-lg border p-5 text-sm text-muted-foreground">This position has no volume reward lines.</p>}
        <p className="text-sm text-muted-foreground">{row?.reward_lines ?? 0} lines · {row?.distinct_ibs ?? 0} IBs · maximum level {row?.max_level || "—"}</p></section>

        <section className="space-y-3"><h3 className="font-medium">Reward lines</h3><div className="overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Program / ID</TableHead><TableHead>Benefactor</TableHead><TableHead>Beneficiary</TableHead><TableHead>Rule</TableHead><TableHead>Tier / level</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Transaction / dates</TableHead><TableHead>Calculation</TableHead></TableRow></TableHeader><TableBody>
          {detail.rewards.length === 0 ? <TableRow><TableCell colSpan={9} className="h-20 text-center text-muted-foreground">No reward lines.</TableCell></TableRow> : detail.rewards.map((reward) => <TableRow key={reward.id}><TableCell><p>{reward.program_name || reward.ib_program_id}</p><p className="font-mono text-[10px] text-muted-foreground">{reward.id}</p></TableCell><TableCell>{identity(reward.benefactor)}</TableCell><TableCell>{identity(reward.beneficiary)}</TableCell><TableCell>{reward.calculation_basis || reward.payment_rule_type}<p className="text-xs text-muted-foreground">Rate {reward.rate ?? "—"}</p></TableCell><TableCell>{reward.tier ?? "—"} / L{reward.level}</TableCell><TableCell className="whitespace-nowrap text-right">{formatReportMoney(reward.amount.value, reward.amount.currency_code, reward.amount.currency_precision)}</TableCell><TableCell><Badge variant={paymentStatusVariant(reward.payment_status)}>{paymentStatusLabel(reward.payment_status)}</Badge></TableCell><TableCell><p className="font-mono text-xs">{reward.external_transaction_id || "—"}</p><p className="whitespace-nowrap text-xs text-muted-foreground">{formatReportDate(reward.created_at)} / {formatReportDate(reward.paid_at)}</p></TableCell><TableCell><details className="max-w-64"><summary className="cursor-pointer text-sm">Inputs</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[10px]">{JSON.stringify({ formula_version: reward.formula_version, settlement_run_id: reward.settlement_run_id, comments: reward.comments, inputs: reward.calculation_inputs }, null, 2)}</pre></details></TableCell></TableRow>)}
        </TableBody></Table></div></section></> : null}
      </div>
    </DialogContent>
  </Dialog>;
}
