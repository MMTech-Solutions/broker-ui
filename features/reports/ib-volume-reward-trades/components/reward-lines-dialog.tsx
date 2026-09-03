"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  bookLabel,
  environmentLabel,
  formatDuration,
  formatReportDate,
  formatReportMoney,
  formatReportNumber,
  formatReportRatio,
  getIbVolumeRewardTradeRewards,
  type IbVolumeRewardLine,
  type IbVolumeRewardTrade,
  type IbVolumeRewardTradeDetail,
} from "@/features/reports/ib-volume-reward-trades";
import { paymentStatusLabel, paymentStatusVariant } from "@/features/ib-reward";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type RewardLinesDialogProps = {
  trade: IbVolumeRewardTrade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function identityLabel(identity: { id: string; name: string | null; email: string | null }): ReactNode {
  return (
    <div className="min-w-44">
      <p className="font-medium">{identity.name || identity.id}</p>
      {identity.email ? <p className="text-xs text-muted-foreground">{identity.email}</p> : null}
    </div>
  );
}

function DetailMetric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EconomyRow({ label, value, emphasized = false, negative = false }: { label: ReactNode; value: ReactNode; emphasized?: boolean; negative?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b py-1.5 last:border-0", emphasized && "font-semibold")}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("whitespace-nowrap tabular-nums", negative && "text-destructive")}>{value}</span>
    </div>
  );
}

function rewardTier(reward: IbVolumeRewardLine): string {
  if (!reward.calculation_inputs) return "—";

  for (const key of ["ib_tier", "beneficiary_tier", "tier"]) {
    const value = reward.calculation_inputs[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }

  return "—";
}

function rateLabel(reward: IbVolumeRewardLine): string {
  if (reward.rate === null) return "—";
  return reward.calculation_basis === "per_lot" ? `${reward.rate}/lot` : reward.rate;
}

export function RewardLinesDialog({ trade, open, onOpenChange }: RewardLinesDialogProps) {
  const [detail, setDetail] = useState<IbVolumeRewardTradeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !trade) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setDetail(null);
      setError(null);

      void getIbVolumeRewardTradeRewards(trade.position_id)
        .then((response) => {
          if (!controller.signal.aborted) setDetail(response.data);
        })
        .catch((cause) => {
          if (!controller.signal.aborted) setError(formatBrokerApiError(cause));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    });

    return () => controller.abort();
  }, [open, trade]);

  const money = (value: string | null) => formatReportMoney(value, trade?.currency_code, trade?.currency_precision);
  const platform = trade ? `${trade.platform.name || trade.platform.id} · ${environmentLabel(trade.environment)} · book ${bookLabel(trade.book_type)}` : "—";
  const marginAvailable = Boolean(trade && trade.revenue !== null && trade.margin !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[min(68.75rem,calc(100%-2rem))]">
        <DialogHeader>
          <DialogTitle>Detalle del trade y rewards</DialogTitle>
          <DialogDescription className="sr-only">Detalle económico del trade y sus líneas de reward.</DialogDescription>
        </DialogHeader>

        {error ? <ApiErrorAlert title="No se pudo cargar el detalle de rewards" message={error} /> : null}

        <div className="min-h-0 space-y-4 overflow-auto pr-1">
          <section className="space-y-3">
            <h3 className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Detalles</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
              <DetailMetric value={trade?.operation_id ?? trade?.position_id ?? "—"} label="Orden" />
              <DetailMetric value={trade?.account_id ?? "—"} label="Cuenta" />
              <DetailMetric value={trade ? `${trade.symbol} · ${trade.server_group.name || trade.server_group.id}` : "—"} label="Símbolo · Grupo" />
              <DetailMetric value={<span className="uppercase">{trade?.side ?? "—"}</span>} label="CMD" />
              <DetailMetric value={formatReportNumber(trade?.volume)} label="Volumen" />
              <DetailMetric value={formatReportNumber(trade?.open_price)} label="Precio apertura" />
              <DetailMetric value={formatReportNumber(trade?.close_price)} label="Precio cierre" />
              <DetailMetric value={money(trade?.pnl ?? null)} label="PnL cliente" />
              <DetailMetric value={formatReportDate(trade?.opened_at)} label="Apertura" />
              <DetailMetric value={formatReportDate(trade?.closed_at)} label={`Cierre · ${formatDuration(trade?.duration_seconds ?? null)}`} />
              <DetailMetric value={platform} label="Plataforma" />
              <DetailMetric value="—" label="Swap" />
            </div>

            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <EconomyRow label="Comisión" value={money(trade?.commission ?? null)} />
              <EconomyRow
                label={!trade || trade.markup_per_lot === null
                  ? `Markup spread · ${trade?.symbol ?? "—"} · sin markup disponible`
                  : `Markup spread · ${trade?.symbol ?? "—"} · ${money(trade.markup_per_lot)}/lot × ${formatReportNumber(trade.volume)}`}
                value={money(trade?.markup_revenue ?? null)}
              />
              <EconomyRow label="Revenue broker" value={money(trade?.revenue ?? null)} />
              <EconomyRow label={`Reward pagado (${trade?.reward_lines ?? 0} líneas · ${trade?.distinct_ibs ?? 0} IBs)`} value={`−${money(trade?.reward_paid ?? null)}`} />
              <EconomyRow
                emphasized
                negative={Number(trade?.margin) < 0}
                label={`Margen del canal · ratio ${formatReportRatio(trade?.ratio)}`}
                value={money(trade?.margin ?? null)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Rewards</h3>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead className="text-right">Tasa</TableHead>
                    <TableHead>IB</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Nivel</TableHead>
                    <TableHead className="text-right">Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Pagado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? Array.from({ length: 3 }).map((_, rowIndex) => (
                    <TableRow key={`detail-skeleton-${rowIndex}`}>
                      {Array.from({ length: 11 }).map((__, cellIndex) => <TableCell key={`${rowIndex}-${cellIndex}`}><Skeleton className="h-4 w-24" /></TableCell>)}
                    </TableRow>
                  )) : null}

                  {!loading && detail?.rewards.length === 0 ? (
                    <TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">No se encontraron líneas de reward por volumen.</TableCell></TableRow>
                  ) : null}

                  {!loading ? detail?.rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-mono text-xs">{reward.id}</TableCell>
                      <TableCell>{reward.program_name || reward.ib_program_id}</TableCell>
                      <TableCell className="text-muted-foreground">{reward.calculation_basis || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{rateLabel(reward)}</TableCell>
                      <TableCell>{identityLabel(reward.ib)}</TableCell>
                      <TableCell>{rewardTier(reward)}</TableCell>
                      <TableCell className="text-right">L{reward.level}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{formatReportMoney(reward.amount.value, reward.amount.currency_code, reward.amount.currency_precision)}</TableCell>
                      <TableCell><Badge variant={paymentStatusVariant(reward.payment_status)}>{paymentStatusLabel(reward.payment_status)}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap">{formatReportDate(reward.created_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatReportDate(reward.paid_at)}</TableCell>
                    </TableRow>
                  )) : null}
                </TableBody>
              </Table>
            </div>

            {detail ? (
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Identidad: Σ líneas pagadas {money(detail.paid_lines_sum)} = reward_paid {money(detail.reward_paid)}{" "}
                <strong className={detail.paid_sum_matches_parent ? "text-emerald-600" : "text-destructive"}>{detail.paid_sum_matches_parent ? "✓" : "✗"}</strong>
                {" · "}revenue {money(trade?.revenue ?? null)} − reward {money(trade?.reward_paid ?? null)} = margen {money(trade?.margin ?? null)}{" "}
                <strong className={marginAvailable ? "text-emerald-600" : "text-muted-foreground"}>{marginAvailable ? "✓" : "—"}</strong>
              </div>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
