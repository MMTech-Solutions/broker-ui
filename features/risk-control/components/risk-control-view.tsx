"use client";

/* eslint-disable react-hooks/set-state-in-effect -- request-backed effects intentionally own loading state */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArchiveIcon, EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { archiveRiskControlRule, createRiskControlRule, listRiskControlExecutions, listRiskControlRules, loadRiskControlCatalog, updateRiskControlIdentity } from "@/features/risk-control/api";
import type { RiskControlActionCatalogItem, RiskControlDirection, RiskControlExecution, RiskControlKpi, RiskControlRule, RiskControlSurface } from "@/features/risk-control/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

type Props = { accountId: string; surface: RiskControlSurface };
type IntervalUnit = "seconds" | "minutes" | "hours";
const UNIT_MS: Record<IntervalUnit, number> = { seconds: 1000, minutes: 60000, hours: 3600000 };

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active" || status === "published") return "default";
  if (status === "sync_failed" || status === "failed") return "destructive";
  if (status === "archived") return "outline";
  return "secondary";
}

function IdentityDialog({ rule, accountId, open, onOpenChange, onSaved }: { rule: RiskControlRule | null; accountId: string; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && rule) {
      setName(rule.name);
      setDescription(rule.description ?? "");
      setError(null);
    }
  }, [open, rule]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rule) return;
    setSaving(true);
    setError(null);
    try {
      await updateRiskControlIdentity(accountId, rule.id, { name: name.trim(), description: description.trim() || null });
      onOpenChange(false);
      onSaved();
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="space-y-4" onSubmit={submit}>
          <DialogHeader><DialogTitle>Editar identidad</DialogTitle><DialogDescription>La condición y las acciones permanecen inmutables.</DialogDescription></DialogHeader>
          {error ? <ApiErrorAlert title="No se pudo actualizar" message={error} /> : null}
          <div className="space-y-2"><Label htmlFor="edit-rule-name">Nombre</Label><Input id="edit-rule-name" minLength={3} maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="edit-rule-description">Descripción</Label><textarea id="edit-rule-description" maxLength={500} rows={4} className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving || name.trim().length < 3}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateDialog({ accountId, kpis, actions, open, onOpenChange, onCreated }: { accountId: string; kpis: RiskControlKpi[]; actions: RiskControlActionCatalogItem[]; open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kpi, setKpi] = useState("");
  const [direction, setDirection] = useState<RiskControlDirection>("loss");
  const [threshold, setThreshold] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [resumeCron, setResumeCron] = useState("0 0 * * *");
  const [notifyAfter, setNotifyAfter] = useState("1");
  const [intervalValue, setIntervalValue] = useState("");
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>("minutes");
  const [oneShot, setOneShot] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open && !kpi && kpis[0]) setKpi(kpis[0].code); }, [kpi, kpis, open]);
  const disableTrading = selectedActions.includes("disable_trading");

  function toggleAction(code: string, checked: boolean) {
    setSelectedActions((current) => checked ? [...current, code] : current.filter((item) => item !== code));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (selectedActions.length === 0) { setError("Selecciona al menos una acción."); return; }
    setSaving(true);
    setError(null);
    try {
      const interval = intervalValue.trim() === "" ? null : Number(intervalValue) * UNIT_MS[intervalUnit];
      await createRiskControlRule(accountId, {
        name: name.trim(), description: description.trim() || null, kpi_code: kpi, direction,
        threshold: Number(threshold),
        actions: selectedActions.map((type) => type === "disable_trading" ? { type, resume_cron: resumeCron } : { type }),
        notify_after_matches: Number(notifyAfter), violation_interval: interval, unassign_on_match: oneShot,
      });
      onOpenChange(false);
      setName(""); setDescription(""); setThreshold(""); setSelectedActions([]); setOneShot(true);
      onCreated();
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form className="space-y-5" onSubmit={submit}>
          <DialogHeader><DialogTitle>Nueva regla de control de riesgo</DialogTitle><DialogDescription>Risk vigilará la métrica y ejecutará las acciones seleccionadas.</DialogDescription></DialogHeader>
          {error ? <ApiErrorAlert title="No se pudo crear la regla" message={error} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="rule-name">Nombre</Label><Input id="rule-name" required minLength={3} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="rule-description">Descripción (opcional)</Label><textarea id="rule-description" rows={3} maxLength={500} className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
            <div className="space-y-2"><Label>KPI</Label><Select value={kpi} onValueChange={(value) => value && setKpi(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{kpis.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Dirección</Label><Select value={direction} onValueChange={(value) => value && setDirection(value as RiskControlDirection)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loss">Pérdida</SelectItem><SelectItem value="profit">Ganancia</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="rule-threshold">Umbral (%)</Label><Input id="rule-threshold" type="number" min="0.0000001" step="any" required value={threshold} onChange={(event) => setThreshold(event.target.value)} /></div>
          </div>
          <fieldset className="space-y-3"><legend className="text-sm font-medium">Acciones</legend>{actions.map((action) => <div key={action.code} className="flex items-start gap-3 rounded-lg border p-3"><Checkbox id={`action-${action.code}`} checked={selectedActions.includes(action.code)} onCheckedChange={(checked) => toggleAction(action.code, checked === true)} /><div className="flex-1"><Label htmlFor={`action-${action.code}`}>{action.label}</Label><p className="text-xs text-muted-foreground">Ejecutor: {action.executor}</p>{action.code === "disable_trading" && disableTrading ? <Select value={resumeCron} onValueChange={(value) => value && setResumeCron(value)}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{action.parameters[0]?.options?.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select> : null}</div></div>)}</fieldset>
          <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Configuración avanzada</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="notify-after">Matches antes de actuar</Label><Input id="notify-after" type="number" min="1" max="10000" value={notifyAfter} onChange={(event) => setNotifyAfter(event.target.value)} /></div><div className="space-y-2"><Label>Intervalo entre violaciones</Label><div className="flex gap-2"><Input type="number" min="1" placeholder="Sin intervalo" value={intervalValue} onChange={(event) => setIntervalValue(event.target.value)} /><Select value={intervalUnit} onValueChange={(value) => value && setIntervalUnit(value as IntervalUnit)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seconds">Segundos</SelectItem><SelectItem value="minutes">Minutos</SelectItem><SelectItem value="hours">Horas</SelectItem></SelectContent></Select></div></div><label className="flex items-center gap-3 sm:col-span-2"><Checkbox checked={oneShot} onCheckedChange={(checked) => setOneShot(checked === true)} /><span className="text-sm">Archivar la asignación después del primer match (one-shot)</span></label></div></details>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Creando…" : "Crear regla"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RuleDetailSheet({ accountId, surface, rule, open, onOpenChange, actionLabels }: { accountId: string; surface: RiskControlSurface; rule: RiskControlRule | null; open: boolean; onOpenChange: (open: boolean) => void; actionLabels: Map<string, string> }) {
  const [executions, setExecutions] = useState<RiskControlExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !rule) return;
    setLoading(true); setError(null);
    void listRiskControlExecutions(surface, accountId, rule.id).then((response) => setExecutions(response.data)).catch((cause) => setError(formatBrokerApiError(cause))).finally(() => setLoading(false));
  }, [accountId, open, rule, surface]);
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{rule?.name ?? "Regla"}</SheetTitle><SheetDescription>{rule?.description || "Sin descripción"}</SheetDescription></SheetHeader>{rule ? <div className="space-y-5 px-4 pb-6"><div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm"><span className="text-muted-foreground">Condición</span><span>{rule.kpi_code} {rule.direction === "loss" ? "≤" : "≥"} {rule.threshold}%</span><span className="text-muted-foreground">Acciones</span><span>{rule.actions.map((action) => actionLabels.get(action.type) ?? action.type).join(", ")}</span><span className="text-muted-foreground">Intervalo</span><span>{rule.violation_interval ? `${rule.violation_interval} ms` : "Sin intervalo"}</span><span className="text-muted-foreground">Modo</span><span>{rule.unassign_on_match ? "One-shot" : "Recurrente"}</span></div><h3 className="font-medium">Ejecuciones</h3>{error ? <ApiErrorAlert title="No se pudieron cargar" message={error} /> : null}{loading ? <Skeleton className="h-24 w-full" /> : executions.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay matches.</p> : executions.map((execution) => <div key={execution.id} className="space-y-2 rounded-lg border p-3 text-sm"><div className="flex items-center justify-between"><strong>Match {formatDate(execution.matched_at)}</strong><Badge variant={statusVariant(execution.notification_publish_status)}>{execution.notification_publish_status}</Badge></div><p>Valor observado: {execution.observed_value ?? "—"}</p><p className="text-muted-foreground">Snapshot: {execution.rule_name}</p>{execution.notification_last_error ? <p className="text-destructive">{execution.notification_last_error}</p> : null}</div>)}</div> : null}</SheetContent></Sheet>;
}

export function RiskControlView({ accountId, surface }: Props) {
  const readOnly = surface === "admin";
  const [rules, setRules] = useState<RiskControlRule[]>([]);
  const [kpis, setKpis] = useState<RiskControlKpi[]>([]);
  const [actions, setActions] = useState<RiskControlActionCatalogItem[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [kpiFilter, setKpiFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<RiskControlRule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string | number> = { page, per_page: 15 };
      if (status !== "all") params.status = status;
      if (kpiFilter !== "all") params.kpi_code = kpiFilter;
      if (actionFilter !== "all") params.action = actionFilter;
      const [response, catalog] = await Promise.all([listRiskControlRules(surface, accountId, params), loadRiskControlCatalog(surface)]);
      setRules(response.data); setPagination(response.meta.pagination ?? null); setKpis(catalog.kpis); setActions(catalog.actions);
    } catch (cause) { setError(formatBrokerApiError(cause)); setRules([]); } finally { setLoading(false); }
  }, [accountId, actionFilter, kpiFilter, page, status, surface]);
  useEffect(() => { void load(); }, [load]);
  const actionLabels = useMemo(() => new Map(actions.map((action) => [action.code, action.label])), [actions]);
  const breadcrumbs: BreadcrumbItem[] = surface === "client" ? [{ label: "Inicio", href: "/client" }, { label: "Cuentas", href: "/client/accounts" }, { label: "Control de riesgo", current: true }] : [{ label: "Dashboard", href: "/" }, { label: "Trading accounts", href: "/trading-accounts" }, { label: "Risk control", current: true }];

  async function archiveSelected() {
    if (!selected) return;
    setArchiving(true); setError(null);
    try { await archiveRiskControlRule(accountId, selected.id); setArchiveOpen(false); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } finally { setArchiving(false); }
  }

  return <div className="flex flex-1 flex-col gap-4 p-4"><PageContentToolbar breadcrumbs={breadcrumbs}>{!readOnly ? <Button onClick={() => setCreateOpen(true)}><PlusIcon />Nueva regla</Button> : null}<Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCwIcon />Actualizar</Button></PageContentToolbar>{error ? <ApiErrorAlert title="No se pudo completar la operación" message={error} /> : null}<div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3"><Select value={status} onValueChange={(value) => { setPage(1); setStatus(value ?? "all"); }}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem>{["active", "completed", "provisioning", "sync_failed", "archived"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Select value={kpiFilter} onValueChange={(value) => { setPage(1); setKpiFilter(value ?? "all"); }}><SelectTrigger><SelectValue placeholder="KPI" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los KPI</SelectItem>{kpis.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select><Select value={actionFilter} onValueChange={(value) => { setPage(1); setActionFilter(value ?? "all"); }}><SelectTrigger><SelectValue placeholder="Acción" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las acciones</SelectItem>{actions.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="overflow-x-auto rounded-xl border"><Table><TableHeader><TableRow><TableHead>Regla</TableHead><TableHead>Condición</TableHead><TableHead>Acciones / ejecutores</TableHead><TableHead>Estado</TableHead><TableHead>Matches</TableHead><TableHead>Último match</TableHead><TableHead className="text-right">Opciones</TableHead></TableRow></TableHeader><TableBody>{loading ? Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) : null}{!loading && rules.length === 0 ? <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No hay reglas con estos filtros.</TableCell></TableRow> : null}{!loading ? rules.map((rule) => <TableRow key={rule.id}><TableCell><p className="font-medium">{rule.name}</p><p className="max-w-64 truncate text-xs text-muted-foreground">{rule.description || "Sin descripción"}</p></TableCell><TableCell>{rule.kpi_code} {rule.direction === "loss" ? "≤" : "≥"} {rule.threshold}%</TableCell><TableCell>{rule.actions.map((action) => <div key={action.type} className="text-sm">{actionLabels.get(action.type) ?? action.type} <span className="text-xs text-muted-foreground">({actions.find((item) => item.code === action.type)?.executor ?? "risk"})</span></div>)}</TableCell><TableCell><div className="space-y-1"><Badge variant={statusVariant(rule.status)}>{rule.status}</Badge><p className="text-xs text-muted-foreground">{rule.membership_status ?? "—"}</p></div></TableCell><TableCell>{rule.match_count}</TableCell><TableCell>{formatDate(rule.last_matched_at)}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => { setSelected(rule); setDetailOpen(true); }}><EyeIcon /></Button>{!readOnly && rule.status !== "archived" ? <><Button variant="ghost" size="icon-sm" title="Editar nombre y descripción" onClick={() => { setSelected(rule); setEditOpen(true); }}><PencilIcon /></Button><Button variant="ghost" size="icon-sm" title="Archivar" onClick={() => { setSelected(rule); setArchiveOpen(true); }}><ArchiveIcon /></Button></> : null}</div></TableCell></TableRow>) : null}</TableBody></Table></div>{pagination && pagination.last_page > 1 ? <div className="flex items-center justify-between text-sm"><span>Página {pagination.current_page} de {pagination.last_page}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Anterior</Button><Button variant="outline" disabled={page >= pagination.last_page || loading} onClick={() => setPage((value) => value + 1)}>Siguiente</Button></div></div> : null}<CreateDialog accountId={accountId} kpis={kpis} actions={actions} open={createOpen} onOpenChange={setCreateOpen} onCreated={() => void load()} /><IdentityDialog rule={selected} accountId={accountId} open={editOpen} onOpenChange={setEditOpen} onSaved={() => void load()} /><RuleDetailSheet accountId={accountId} surface={surface} rule={selected} open={detailOpen} onOpenChange={setDetailOpen} actionLabels={actionLabels} /><Dialog open={archiveOpen} onOpenChange={setArchiveOpen}><DialogContent><DialogHeader><DialogTitle>Archivar regla</DialogTitle><DialogDescription>La regla se conservará como dato auditable y dejará de estar asignada en Risk.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancelar</Button><Button variant="destructive" disabled={archiving} onClick={() => void archiveSelected()}>{archiving ? "Archivando…" : "Archivar"}</Button></DialogFooter></DialogContent></Dialog></div>;
}
