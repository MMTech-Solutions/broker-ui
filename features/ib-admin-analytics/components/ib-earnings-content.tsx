"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIbEarningsDailyTrades, type IbEarningsRequestFilters } from "@/features/ib-admin-analytics/api";
import {
  IB_EARNINGS_PAYMENT_STATUSES,
  IB_EARNINGS_TYPES,
  type IbEarnings,
  type IbEarningsGrain,
  type IbEarningsItem,
  type IbEarningsPaymentStatus,
  type IbEarningsType,
} from "@/features/ib-admin-analytics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type EarningsControls = {
  status: IbEarningsPaymentStatus | "all";
  type: IbEarningsType | "all";
  q: string;
  grain: IbEarningsGrain;
};

type IbEarningsContentProps = {
  earnings: IbEarnings;
  controls: EarningsControls;
  dailyRequestFilters: Omit<IbEarningsRequestFilters, "grain" | "cursor" | "limit">;
  loading: boolean;
  onControlsChange: (controls: EarningsControls) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  hasPreviousPage: boolean;
};

const statusClass: Record<IbEarningsPaymentStatus, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  processing: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function formatMoney(amount: string, currencyCode: string, precision: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `— ${currencyCode}`;
  return `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value)} ${currencyCode}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date);
}

function typeLabel(type: IbEarningsType): string {
  return type === "volume" ? "Rebate" : type === "pnl" ? "PnL" : "CPA";
}

function rateLabel(item: IbEarningsItem): string {
  const rate = item.level_rate ?? item.commission_value;
  if (rate === null) return "Snapshot";
  return item.commission_type === "percentage" ? `${rate}%` : String(rate);
}

function EarningsCards({ earnings }: { earnings: IbEarnings }) {
  const money = (amount: string) => formatMoney(amount, earnings.currency.currency_code, earnings.currency.currency_precision);
  const cards = [
    ["Pagado histórico", money(earnings.cards.lifetime_paid), "Solo rewards con estado Pagado."],
    ["Pendiente de pago", money(earnings.cards.pending_to_pay), "Suma Pendiente y Procesando; no los confunde."],
    ["Pagado YTD", money(earnings.cards.paid_ytd), "Liquidado desde el inicio del año UTC."],
    ["CPA en calificación", money(earnings.cards.cpa_pipeline), "Potencial; todavía no es un reward."],
  ];

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, caption]) => <Card key={label} size="sm" className="min-h-32"><CardHeader><CardTitle>{label}</CardTitle><p className="text-xs text-muted-foreground">{caption}</p></CardHeader><CardContent><p className="text-lg font-semibold tabular-nums">{value}</p></CardContent></Card>)}</div>;
}

function EarningsDetailDialog({ row, filters, onOpenChange }: { row: IbEarningsItem | null; filters: Omit<IbEarningsRequestFilters, "grain" | "cursor" | "limit">; onOpenChange: (open: boolean) => void }) {
  const [items, setItems] = useState<IbEarningsItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!row?.daily_row_id) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
      setItems(null);
      void getIbEarningsDailyTrades(row.daily_row_id!, { ...filters, grain: "daily" })
        .then((response) => { if (!controller.signal.aborted) setItems(response.data.items); })
        .catch((cause) => { if (!controller.signal.aborted) setError(formatBrokerApiError(cause)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    });
    return () => controller.abort();
  }, [filters, row]);

  return <Dialog open={row !== null} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[min(70rem,calc(100%-2rem))]"><DialogHeader><DialogTitle>Rewards del resumen diario</DialogTitle><DialogDescription>El backend vuelve a validar el IB objetivo y los filtros antes de revelar cada reward.</DialogDescription></DialogHeader>{error ? <ApiErrorAlert title="No se pudo cargar el desglose diario" message={error} /> : null}<div className="min-h-0 overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Fecha UTC</TableHead><TableHead>Trade</TableHead><TableHead>Cuenta</TableHead><TableHead>Referido</TableHead><TableHead>Evento</TableHead><TableHead>Nivel</TableHead><TableHead>Base / tasa</TableHead><TableHead className="text-right">Comisión</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{loading ? Array.from({ length: 3 }, (_, index) => <TableRow key={index}><TableCell colSpan={9}><Skeleton className="h-5 w-full" /></TableCell></TableRow>) : null}{!loading && items?.length === 0 ? <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No se encontraron rewards para este resumen.</TableCell></TableRow> : null}{!loading ? items?.map((item) => <EarningsRow key={item.id ?? item.date} item={item} />) : null}</TableBody></Table></div></DialogContent></Dialog>;
}

function tradeCell(item: IbEarningsItem, daily: boolean) {
  if (daily) {
    const count = item.trade_count ?? 0;
    return <Badge variant="outline">{count > 0 ? `${count} ${count === 1 ? "trade" : "trades"}` : "Sin trades"}</Badge>;
  }

  return <><span className="font-mono text-xs">{item.trade_id || "—"}</span>{item.trade_reference_type === "position_id" ? <span className="block font-sans text-muted-foreground">ID de posición</span> : null}</>;
}

function EarningsRow({ item, daily = false, onOpen }: { item: IbEarningsItem; daily?: boolean; onOpen?: () => void }) {
  return <TableRow><TableCell className="whitespace-nowrap text-xs">{formatDate(item.date)}<span className="block text-muted-foreground">UTC</span></TableCell><TableCell>{tradeCell(item, daily)}</TableCell><TableCell className="font-mono text-xs">{item.account_id ?? "—"}</TableCell><TableCell><p>{item.customer?.name ?? item.customer?.id ?? "No disponible"}</p>{item.customer?.name && item.customer.id !== item.customer.name ? <p className="font-mono text-xs text-muted-foreground">{item.customer.id}</p> : null}</TableCell><TableCell><p>{item.symbol ?? typeLabel(item.type)}</p><p className="text-xs text-muted-foreground">{item.platform ?? "Sin plataforma"}{item.symbol_group ? ` · ${item.symbol_group}` : ""}</p></TableCell><TableCell>L{item.level}</TableCell><TableCell><p>{item.base === null ? "No aplica" : item.base}</p><p className="text-xs text-muted-foreground">{rateLabel(item)}</p></TableCell><TableCell className="whitespace-nowrap text-right font-medium tabular-nums text-emerald-700 dark:text-emerald-300">{formatMoney(item.amount, item.currency_code, item.currency_precision)}</TableCell><TableCell><Badge className={cn("border-0", statusClass[item.payment_status])} variant="secondary">{item.status_label}</Badge>{daily && onOpen ? <Button className="mt-2" variant="outline" size="sm" onClick={onOpen}>Ver rewards</Button> : null}</TableCell></TableRow>;
}

export function IbEarningsContent({ earnings, controls, dailyRequestFilters, loading, onControlsChange, onPreviousPage, onNextPage, hasPreviousPage }: IbEarningsContentProps) {
  const [detailRow, setDetailRow] = useState<IbEarningsItem | null>(null);
  const items = earnings.items;
  const daily = earnings.grain === "daily";

  return <div className="space-y-4"><EarningsCards earnings={earnings} /><Card size="sm"><CardContent className="grid gap-3 pt-4 md:grid-cols-4"><div><Label htmlFor="ib-earnings-search">Buscar</Label><Input id="ib-earnings-search" className="mt-1" value={controls.q} onChange={(event) => onControlsChange({ ...controls, q: event.target.value })} placeholder="IB, cuenta o trade" /></div><div><Label htmlFor="ib-earnings-status">Estado</Label><select id="ib-earnings-status" className="mt-1 h-8 w-full rounded-lg border bg-transparent px-2 text-sm" value={controls.status} onChange={(event) => onControlsChange({ ...controls, status: event.target.value as EarningsControls["status"] })}><option value="all">Todos los estados</option>{IB_EARNINGS_PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status === "paid" ? "Pagado" : status === "pending" ? "Pendiente" : status === "processing" ? "Procesando" : status === "failed" ? "Fallido" : "Cancelado"}</option>)}</select></div><div><Label htmlFor="ib-earnings-type">Tipo</Label><select id="ib-earnings-type" className="mt-1 h-8 w-full rounded-lg border bg-transparent px-2 text-sm" value={controls.type} onChange={(event) => onControlsChange({ ...controls, type: event.target.value as EarningsControls["type"] })}><option value="all">Todos los eventos</option>{IB_EARNINGS_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}</select></div><div><Label htmlFor="ib-earnings-grain">Vista</Label><select id="ib-earnings-grain" className="mt-1 h-8 w-full rounded-lg border bg-transparent px-2 text-sm" value={controls.grain} onChange={(event) => onControlsChange({ ...controls, grain: event.target.value as IbEarningsGrain })}><option value="daily">Resumen diario</option><option value="trade">Por trade</option></select></div></CardContent></Card><Card><CardHeader><CardTitle>{daily ? "Resumen diario de comisiones" : "Eventos de comisión"}</CardTitle><p className="text-sm text-muted-foreground">{daily ? "El badge indica cuántos trades agrupa cada fila; abra Ver rewards para el detalle autorizado." : "Cada fila conserva su snapshot de cálculo histórico."}</p></CardHeader><CardContent><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Fecha UTC</TableHead><TableHead>{daily ? "Trades" : "Trade"}</TableHead><TableHead>Cuenta</TableHead><TableHead>Referido</TableHead><TableHead>Evento</TableHead><TableHead>Nivel</TableHead><TableHead>Base / tasa</TableHead><TableHead className="text-right">Comisión</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground">No hay earnings para la moneda, rango y filtros seleccionados.</TableCell></TableRow> : items.map((item) => <EarningsRow key={item.id ?? item.daily_row_id ?? item.date} item={item} daily={daily} onOpen={() => setDetailRow(item)} />)}</TableBody></Table></div><div className="mt-4 flex items-center justify-end gap-2"><Button variant="outline" size="sm" disabled={loading || !hasPreviousPage} onClick={onPreviousPage}>Anterior</Button><Button variant="outline" size="sm" disabled={loading || !earnings.next_cursor} onClick={onNextPage}>Siguiente</Button></div></CardContent></Card><EarningsDetailDialog row={detailRow} filters={dailyRequestFilters} onOpenChange={(open) => { if (!open) setDetailRow(null); }} /></div>;
}
