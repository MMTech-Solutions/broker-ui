"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIbPartnerTier } from "@/features/ib-analytics/partner-tier-api";
import type { IbPartnerTier, IbPartnerTierPaymentSymbol } from "@/features/ib-analytics/partner-tier-types";
import { formatBrokerApiError } from "@/lib/api/errors";

type Props = { audience: "admin" | "client"; beneficiaryId?: string };

function number(value: string | null): string {
  if (value === null) return "—";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(parsed) : value;
}

function rate(symbol: IbPartnerTierPaymentSymbol | undefined): string {
  if (!symbol?.commission_value) return "—";
  return symbol.commission_type === "percentage"
    ? `${symbol.commission_value}%`
    : `${symbol.commission_value}/lot`;
}

function evaluationPeriod(value: string | null): string {
  if (!value) return "No evaluado todavía";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function IbPartnerTierPanel({ audience, beneficiaryId }: Props) {
  const [tier, setTier] = useState<IbPartnerTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void getIbPartnerTier(audience, beneficiaryId)
      .then((response) => { if (mounted) setTier(response.data); })
      .catch((cause) => { if (mounted) setError(formatBrokerApiError(cause)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [audience, beneficiaryId]);

  const ratesByGroup = useMemo(() => {
    if (!tier) return [];
    const groups = new Map<string, { name: string; symbols: IbPartnerTierPaymentSymbol[] }>();
    tier.payment_symbols.forEach((symbol) => {
      const name = symbol.symbol.category?.name ?? "Sin categoría";
      const group = groups.get(name) ?? { name, symbols: [] };
      group.symbols.push(symbol);
      groups.set(name, group);
    });
    return [...groups.values()];
  }, [tier]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-56 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /></div>;
  if (error) return <ApiErrorAlert title="No se pudo cargar Partner Tier" message={error} />;
  if (!tier) return null;

  const current = tier.current_program;
  const next = tier.next_program;
  const metric = tier.progression.metric_value ?? tier.placement.progression_metric_value;

  return <div className="space-y-4">
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Broker Partnership · Tier {current ? current.sort_order + 1 : "—"}</p><CardTitle className="mt-1 text-2xl">{current?.name ?? "Sin programa activo"}</CardTitle></div><div className="text-right"><p className="text-sm text-muted-foreground">Siguiente tier</p><p className="text-lg font-semibold text-primary">{next?.name ?? "Tier final"}</p></div></div></CardHeader>
      <CardContent className="space-y-3 pt-5"><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-medium">Qualification progress · network lots</span><strong>{number(metric)}{next ? ` / ${number(next.progression_min_volume)} lots` : ""} · {tier.progression.percentage ?? 100}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(tier.progression.percentage ?? 100, 100))}%` }} /></div><p className="text-sm text-muted-foreground">Las operaciones cerradas de referidos directos y subniveles cuentan para el tier. Las rechazadas no cuentan.</p></CardContent>
    </Card>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Lots en ventana de evaluación" value={number(metric)} caption="Snapshot de la última evaluación" />
      <Kpi label="Traders activos / referrals" value={tier.active_traders.available ? `${tier.active_traders.count ?? "—"} / —` : "Indisponible"} caption="Referidos con posición abierta elegible" />
      <Kpi label="Métrica de evaluación" value="Network lots" caption={tier.progression_templates.length ? tier.progression_templates.map((template) => template.name).join(" · ") : "Configuración del programa"} />
      <Kpi label="Período de evaluación" value="Rolling window" caption={`Última evaluación: ${evaluationPeriod(tier.progression.evaluated_at)}`} />
    </div>

    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Program tiers</CardTitle><p className="text-sm text-muted-foreground">Matriz del programa IB</p></div></CardHeader><CardContent><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Tier</TableHead><TableHead className="text-right">Qualification range</TableHead><TableHead className="text-right">Rebate rate</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{tier.programs.map((program) => { const symbol = tier.payment_symbols.find((item) => item.ib_program_id === program.id); const state = program.id === current?.id ? "Current" : program.id === next?.id ? "Next" : "Program"; return <TableRow key={program.id}><TableCell className="font-medium">{program.name}</TableCell><TableCell className="text-right tabular-nums">{number(program.progression_min_volume)} – {program.progression_max_volume === null ? "∞" : number(program.progression_max_volume)} lots</TableCell><TableCell className="text-right tabular-nums">{rate(symbol)}</TableCell><TableCell><Badge variant={state === "Current" ? "default" : "secondary"}>{state}</Badge></TableCell></TableRow>; })}</TableBody></Table></div></CardContent></Card>

    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Rates by symbol group</CardTitle><p className="text-sm text-muted-foreground">Tarifas vigentes del tier actual y siguiente</p></div></CardHeader><CardContent><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Symbol group</TableHead><TableHead>Commission mode</TableHead><TableHead className="text-right">{current?.name ?? "Actual"}</TableHead><TableHead className="text-right">{next?.name ?? "Siguiente"}</TableHead><TableHead>Example symbols</TableHead></TableRow></TableHeader><TableBody>{ratesByGroup.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No hay rates de volumen configurados para estos tiers.</TableCell></TableRow> : ratesByGroup.map((group) => { const currentRate = group.symbols.find((symbol) => symbol.ib_program_id === current?.id); const nextRate = group.symbols.find((symbol) => symbol.ib_program_id === next?.id); const exampleSymbols = [...new Set(group.symbols.map((symbol) => symbol.symbol.alpha ?? symbol.symbol.name).filter(Boolean))].join(", "); return <TableRow key={group.name}><TableCell className="font-medium">{group.name}</TableCell><TableCell><Badge variant="outline">{currentRate?.commission_type === "percentage" ? "% trading commission" : "Fixed per lot"}</Badge></TableCell><TableCell className="text-right tabular-nums">{rate(currentRate)}</TableCell><TableCell className="text-right tabular-nums">{rate(nextRate)}</TableCell><TableCell className="text-muted-foreground">{exampleSymbols || "—"}</TableCell></TableRow>; })}</TableBody></Table></div></CardContent></Card>
  </div>;
}

function Kpi({ label, value, caption }: { label: string; value: string; caption: string }) {
  return <Card size="sm"><CardHeader><p className="text-sm text-muted-foreground">{label}</p><CardTitle className="text-xl">{value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{caption}</p></CardContent></Card>;
}
