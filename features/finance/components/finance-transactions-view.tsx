"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageNumberPagination } from "@/components/page-number-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { listFinanceTransactions, showFinanceTransaction } from "../api";
import type { FinanceAccount, FinanceFilters, FinanceKind, FinanceTransaction } from "../types";

function AccountSummary({ account }: { account?: FinanceAccount }) {
  if (!account) return <span>—</span>;
  return (
    <div className="space-y-1">
      <p className="font-medium">{account.custom_name || account.external_trader_id || account.id}</p>
      <p className="text-xs text-muted-foreground">{account.user?.name || account.user?.id || "Usuario no disponible"}</p>
      {account.user?.email && <p className="text-xs text-muted-foreground">{account.user.email}</p>}
    </div>
  );
}

function amountLabel(row: FinanceTransaction) {
  return row.amount !== null
    ? `${row.amount} ${row.currency ?? ""}`
    : `${row.amount_minor} unidades menores (moneda no disponible)`;
}

function dateLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "—";
}

const labels: Record<string, string> = {
  user_id: "ID de usuario", account_id: "ID de cuenta", platform_id: "ID de plataforma",
  from_account_id: "ID cuenta origen", to_account_id: "ID cuenta destino",
  amount_minor: "Monto exacto en unidades menores", comments: "Comentarios",
  external_account_id: "Referencia externa de cuenta / transferencia",
  external_transaction_id: "Referencia externa de transacción",
};

function Detail({ kind, id, onClose }: { kind: FinanceKind; id: string; onClose: () => void }) {
  const [record, setRecord] = useState<FinanceTransaction | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    showFinanceTransaction(kind, id, controller.signal)
      .then((response) => { if (!controller.signal.aborted) setRecord(response.data); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(formatBrokerApiError(reason)); });
    return () => controller.abort();
  }, [kind, id]);

  const accounts = record
    ? kind === "internal-transactions"
      ? [["Cuenta origen", record.from_account], ["Cuenta destino", record.to_account]] as const
      : [["Cuenta", record.account]] as const
    : [];
  const fields = record ? [
    ["ID", record.id], ["Monto", amountLabel(record)], ["Unidades menores", record.amount_minor],
    ["Tipo", record.type], ["Estado", record.payment_status],
    ["Plataforma", record.platform?.name || record.platform?.id],
    ["Referencia externa de cuenta / transferencia", record.external_account_id],
    ["Referencia externa de transacción", record.external_transaction_id],
    ["Comentarios", record.comments], ["Motivo de fallo", record.failure_reason],
    ["Creado", dateLabel(record.created_at)], ["Actualizado", dateLabel(record.updated_at)],
    ...(kind === "internal-transactions" ? [["Débito completado", dateLabel(record.debit_completed_at)]] : []),
  ] : [];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del registro financiero</DialogTitle>
          <DialogDescription>La moneda procede de la configuración actual de la cuenta; no representa un snapshot histórico.</DialogDescription>
        </DialogHeader>
        {error ? <ApiErrorAlert message={error} /> : !record ? <p role="status">Cargando detalle…</p> : (
          <div className="space-y-5">
            {accounts.map(([label, account]) => (
              <div key={label} className="rounded-lg border p-3">
                <h3 className="mb-2 font-medium">{label}</h3>
                <AccountSummary account={account} />
                <p className="mt-2 break-all text-xs text-muted-foreground">Cuenta: {account?.id ?? "—"}</p>
                <p className="break-all text-xs text-muted-foreground">Usuario: {account?.user?.id ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Plataforma: {account?.platform?.name ?? "—"}</p>
              </div>
            ))}
            <dl className="grid gap-3 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="break-all whitespace-pre-wrap">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function FinanceTransactionsView({ kind }: { kind: FinanceKind }) {
  const internal = kind === "internal-transactions";
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<FinanceFilters>({ page: 1, per_page: 15 });
  const [rows, setRows] = useState<FinanceTransaction[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    listFinanceTransactions(kind, filters, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setRows(response.data);
          setPagination(response.meta.pagination ?? null);
          setError("");
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setRows([]);
          setPagination(null);
          setError(formatBrokerApiError(reason));
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [kind, filters]);

  function updateFilters(next: FinanceFilters) {
    setLoading(true);
    setError("");
    setRows([]);
    setPagination(null);
    setFilters(next);
  }

  const textFields = ["user_id", ...(internal ? ["from_account_id", "to_account_id"] : ["account_id", "platform_id", "external_account_id", "external_transaction_id"]), "amount_minor", "comments"];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      <nav aria-label="Finanzas" className="flex flex-wrap gap-4 text-sm">
        <Link href="/finance/internal-transactions" className={internal ? "font-semibold underline" : "text-muted-foreground"}>Internas (legado)</Link>
        <Link href="/finance/account-balance-transactions" className={!internal ? "font-semibold underline" : "text-muted-foreground"}>Movimientos de saldo</Link>
      </nav>
      <p className="text-sm text-muted-foreground">
        {internal ? "Historial de transferencias internas legadas. Este flujo ya no genera registros nuevos." : "Créditos y débitos registrados por broker. Estos registros no identifican el tipo completo de transferencia del orquestador."}
      </p>
      <form className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== ""));
        updateFilters({ ...values, page: 1, per_page: filters.per_page });
      }}>
        {textFields.map((field) => (
          <label key={field} className="space-y-1 text-sm">
            <span>{labels[field]}</span>
            <Input value={draft[field] ?? ""} inputMode={field === "amount_minor" ? "numeric" : undefined}
              onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
          </label>
        ))}
        {[["type", "Tipo", ["credit", "debit"]], ["payment_status", "Estado", ["paid", "pending", "processing", "failed"]]].map(([field, label, options]) => (
          <label key={field as string} className="space-y-1 text-sm">
            <span>{label}</span>
            <select className="h-9 w-full rounded-md border bg-background px-3" value={draft[field as string] ?? ""}
              onChange={(event) => setDraft({ ...draft, [field as string]: event.target.value })}>
              <option value="">Todos</option>
              {(options as string[]).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
        {[["created_from", "Desde (ISO 8601)"], ["created_to", "Hasta (ISO 8601)"]].map(([field, label]) => (
          <label key={field} className="space-y-1 text-sm">
            <span>{label}</span>
            <Input value={draft[field] ?? ""} placeholder="2026-10-05T00:00:00-04:00"
              onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
          </label>
        ))}
        <div className="flex items-end gap-2">
          <Button type="submit">Filtrar</Button>
          <Button type="button" variant="outline" onClick={() => {
            setDraft({});
            updateFilters({ page: 1, per_page: filters.per_page });
          }}>Limpiar</Button>
        </div>
      </form>
      {error && <ApiErrorAlert message={error} />}
      <div className="overflow-x-auto rounded-xl border" aria-busy={loading}>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Fecha</TableHead><TableHead>{internal ? "Origen" : "Cuenta"}</TableHead>
            <TableHead>{internal ? "Destino" : "Plataforma"}</TableHead><TableHead>Monto</TableHead>
            <TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead>Detalle</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7}><span role="status">Cargando registros…</span></TableCell></TableRow>
              : !rows.length ? <TableRow><TableCell colSpan={7}>{error ? "No se pudo cargar el historial." : "No hay registros para estos filtros."}</TableCell></TableRow>
              : rows.map((row) => <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">{dateLabel(row.created_at)}</TableCell>
                <TableCell><AccountSummary account={internal ? row.from_account : row.account} /></TableCell>
                <TableCell>{internal ? <AccountSummary account={row.to_account} /> : row.platform?.name || row.platform?.id || "—"}</TableCell>
                <TableCell className="whitespace-nowrap font-mono">{amountLabel(row)}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell><Badge variant={row.payment_status === "failed" ? "destructive" : "secondary"}>{row.payment_status}</Badge></TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => setSelectedId(row.id)}>Ver detalle</Button></TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      {pagination && <PageNumberPagination currentPage={pagination.current_page} lastPage={pagination.last_page}
        total={pagination.total} perPage={filters.per_page ?? 15} disabled={loading}
        onPageChange={(page) => updateFilters({ ...filters, page })}
        onPerPageChange={(per_page) => updateFilters({ ...filters, per_page, page: 1 })} />}
      {selectedId && <Detail key={selectedId} kind={kind} id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
