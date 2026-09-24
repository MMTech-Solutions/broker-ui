"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIbReferralAccounts, getIbReferrals, type IbAnalyticsAudience, type IbAnalyticsFilters } from "@/features/ib-admin-analytics/api";
import type { IbReferral, IbReferralAccount, IbReferralGeo, IbReferrals } from "@/features/ib-admin-analytics/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type Props = {
  referrals: IbReferrals;
  geo: IbReferralGeo | null;
  filters: IbAnalyticsFilters;
  onPageChange: (page: number) => void;
  audience?: IbAnalyticsAudience;
};

type ChildState = { loading: boolean; error: string | null; data: IbReferrals | null };

function number(value: string | number | null): string {
  if (value === null) return "Indisponible";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(parsed) : "—";
}

function money(value: string | number | null, currency: string): string {
  return value === null ? "Indisponible" : `${value} ${currency}`;
}

function date(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
}

function flag(country: string | null): string {
  if (!country || !/^[A-Z]{2}$/.test(country)) return "";
  return String.fromCodePoint(...[...country].map((letter) => 127397 + letter.charCodeAt(0)));
}

function AccountsDialog({ referral, filters, audience, onOpenChange }: { referral: IbReferral | null; filters: IbAnalyticsFilters; audience?: IbAnalyticsAudience; onOpenChange: (open: boolean) => void }) {
  const [items, setItems] = useState<IbReferralAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resolvedAudience = audience ?? (filters.ib_user_id ? "admin" : "client");

  useEffect(() => {
    if (!referral) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      setLoading(true); setError(null); setItems(null);
      void getIbReferralAccounts(resolvedAudience, referral.user_id, filters)
        .then((response) => { if (!controller.signal.aborted) setItems(response.data.items); })
        .catch((cause) => { if (!controller.signal.aborted) setError(formatBrokerApiError(cause)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    });
    return () => controller.abort();
  }, [filters, referral, resolvedAudience]);

  return <Dialog open={referral !== null} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[min(72rem,calc(100%-2rem))]"><DialogHeader><DialogTitle>Cuentas de {referral?.full_name || "referido"}</DialogTitle><DialogDescription>Detalle autorizado de cuentas. No incluye balance, equity, PnL, credenciales ni progreso CPA.</DialogDescription></DialogHeader>{error ? <ApiErrorAlert title="No se pudieron cargar las cuentas" message={error} /> : null}<div className="min-h-0 overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Login</TableHead><TableHead>Plataforma</TableHead><TableHead>Grupo</TableHead><TableHead>Moneda</TableHead><TableHead>Apertura UTC</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Lots</TableHead><TableHead>Última operación UTC</TableHead><TableHead className="text-right">Comisión generada</TableHead></TableRow></TableHeader><TableBody>{loading ? Array.from({ length: 3 }, (_, index) => <TableRow key={index}><TableCell colSpan={9}><Skeleton className="h-5 w-full" /></TableCell></TableRow>) : null}{!loading && items?.length === 0 ? <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No hay cuentas autorizadas para este referido.</TableCell></TableRow> : null}{items?.map((account, index) => <TableRow key={`${account.login ?? "account"}-${index}`}><TableCell className="font-mono text-xs">{account.login ?? "—"}</TableCell><TableCell>{account.platform ?? "—"}</TableCell><TableCell>{account.server_group ?? "—"}</TableCell><TableCell>{account.currency_code ?? "—"}</TableCell><TableCell>{date(account.opened_at)}</TableCell><TableCell>{account.status ?? "—"}</TableCell><TableCell className="text-right tabular-nums">{number(account.lots)}</TableCell><TableCell>{date(account.last_activity_at)}</TableCell><TableCell className="text-right tabular-nums">{money(account.commission_generated, filters.currency_code)}</TableCell></TableRow>)}</TableBody></Table></div></DialogContent></Dialog>;
}

function GeoRanking({ geo, currency }: { geo: IbReferralGeo | null; currency: string }) {
  const countries = useMemo(() => [...(geo?.items ?? [])].sort((a, b) => Number(b.lots ?? -1) - Number(a.lots ?? -1)).slice(0, 10), [geo]);
  const maximum = Math.max(1, ...countries.map((item) => Number(item.lots ?? 0)));
  return <Card><CardHeader><CardTitle>Concentración por país</CardTitle><p className="text-sm text-muted-foreground">Ranking de la red actual de IAM; lots y rewards conservan el período seleccionado.</p></CardHeader><CardContent className="space-y-3">{countries.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No hay países para este período.</p> : countries.map((country) => <div key={country.country_code} className="grid grid-cols-[minmax(8rem,1fr)_minmax(8rem,2fr)_auto] items-center gap-3 text-sm"><span className="truncate">{flag(country.country_code)} {country.country_code}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min((Number(country.lots ?? 0) / maximum) * 100, 100))}%` }} /></div><span className="text-right tabular-nums">{geo?.trading_available ? `${number(country.lots)} lots · ${money(country.rewards, currency)}` : "Trading indisponible"}</span></div>)}{geo && !geo.net_deposits_available ? <p className="text-xs text-muted-foreground">Net deposits no está disponible para este período.</p> : null}</CardContent></Card>;
}

export function IbReferralsContent({ referrals, geo, filters, onPageChange, audience }: Props) {
  const [children, setChildren] = useState<Record<string, ChildState>>({});
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [accountsReferral, setAccountsReferral] = useState<IbReferral | null>(null);
  const resolvedAudience = audience ?? (filters.ib_user_id ? "admin" : "client");
  const roots = referrals.items;
  const allRows = (items: IbReferral[], depth = 0): Array<{ item: IbReferral; depth: number }> => items.flatMap((item) => [{ item, depth }, ...(expanded.has(item.user_id) ? allRows(children[item.user_id]?.data?.items ?? [], depth + 1) : [])]);
  const rows = allRows(roots);
  const currentPage = referrals.pagination.current_page ?? referrals.pagination.page ?? 1;
  const lastPage = referrals.pagination.last_page ?? referrals.pagination.totalPages ?? currentPage;

  const toggle = async (item: IbReferral) => {
    if (!item.has_children) return;
    if (expanded.has(item.user_id)) { setExpanded((value) => { const next = new Set(value); next.delete(item.user_id); return next; }); return; }
    setExpanded((value) => new Set(value).add(item.user_id));
    if (children[item.user_id]?.data || children[item.user_id]?.loading) return;
    setChildren((value) => ({ ...value, [item.user_id]: { loading: true, error: null, data: null } }));
    try {
      const response = await getIbReferrals(resolvedAudience, { ...filters, parent_id: item.user_id, page: 1, per_page: 25 });
      setChildren((value) => ({ ...value, [item.user_id]: { loading: false, error: null, data: response.data } }));
    } catch (cause) {
      setChildren((value) => ({ ...value, [item.user_id]: { loading: false, error: formatBrokerApiError(cause), data: null } }));
    }
  };

  return <div className="space-y-4"><GeoRanking geo={geo} currency={filters.currency_code} /><Card><CardHeader><CardTitle>Referidos directos y subniveles</CardTitle><p className="text-sm text-muted-foreground">Red e identidad: snapshot actual de IAM. Los importes y rewards mantienen la semántica histórica del backend.</p></CardHeader><CardContent><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Referido</TableHead><TableHead>País</TableHead><TableHead>Alta UTC</TableHead><TableHead>Nivel</TableHead><TableHead className="text-right">Cuentas</TableHead><TableHead>Última operación UTC</TableHead><TableHead className="text-right">Lots</TableHead><TableHead>CPA</TableHead><TableHead className="text-right">Comisión período</TableHead><TableHead className="text-right">LTV</TableHead><TableHead className="text-right">Net deposits</TableHead></TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={11} className="h-28 text-center text-muted-foreground">No hay referidos en esta rama.</TableCell></TableRow> : rows.map(({ item, depth }) => { const child = children[item.user_id]; const unavailable = !item.trading_available; return <TableRow key={item.user_id}><TableCell><div className="flex items-start gap-1" style={{ paddingLeft: `${depth * 20}px` }}>{item.has_children ? <Button variant="ghost" size="icon-xs" aria-label={`${expanded.has(item.user_id) ? "Contraer" : "Expandir"} referidos de ${item.full_name || item.user_id}`} aria-expanded={expanded.has(item.user_id)} onClick={() => void toggle(item)}>{expanded.has(item.user_id) ? <ChevronDownIcon /> : <ChevronRightIcon />}</Button> : <span className="inline-block size-7" />}<div><p>{item.full_name || "Identidad no disponible"}</p>{item.email ? <p className="text-xs text-muted-foreground">{item.email}</p> : null}{child?.loading ? <p className="text-xs text-muted-foreground">Cargando subnivel…</p> : null}{child?.error ? <p className="text-xs text-destructive">{child.error}</p> : null}</div></div></TableCell><TableCell>{flag(item.country_code)} {item.country_code ?? "—"}</TableCell><TableCell>{date(item.signup_at)}</TableCell><TableCell>L{item.level}</TableCell><TableCell className="text-right tabular-nums"><Button variant="link" size="sm" className="h-auto p-0" onClick={() => setAccountsReferral(item)}>{unavailable ? "Indisponible" : item.accounts_count ?? "—"}</Button></TableCell><TableCell>{unavailable ? "Indisponible" : date(item.last_activity_at)}</TableCell><TableCell className="text-right tabular-nums">{unavailable ? "Indisponible" : number(item.lots)}</TableCell><TableCell>{unavailable ? "Indisponible" : item.cpa_status ? <Badge variant="secondary" className="capitalize">{item.cpa_status.replaceAll("_", " ")}</Badge> : "—"}</TableCell><TableCell className={cn("text-right tabular-nums", !unavailable && "text-emerald-700 dark:text-emerald-300")}>{unavailable ? "Indisponible" : money(item.reward, filters.currency_code)}</TableCell><TableCell className="text-right tabular-nums">{unavailable ? "Indisponible" : money(item.ltv, filters.currency_code)}</TableCell><TableCell className="text-right tabular-nums">{item.net_deposits_available ? money(item.net_deposits, filters.currency_code) : "Indisponible"}</TableCell></TableRow>; })}</TableBody></Table></div><div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Página {currentPage} de {lastPage}. La expansión es accesible por teclado y solo consulta hijos autorizados por el backend.</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}>Siguiente</Button></div></div></CardContent></Card><AccountsDialog referral={accountsReferral} filters={filters} onOpenChange={(open) => { if (!open) setAccountsReferral(null); }} /></div>;
}
