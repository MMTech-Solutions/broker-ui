"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listExternalDeposits,
  listExternalWithdrawals,
  listInternalTransfers,
} from "@/features/client-finance/api";
import { ClientInternalTransferPanel } from "@/features/client-finance/components/client-internal-transfer-panel";
import { ClientSimulatedDepositPanel } from "@/features/client-finance/components/client-simulated-deposit-panel";
import {
  externalTransactionTypeLabel,
  financePaymentStatusLabel,
  financePaymentStatusVariant,
  formatAccountLabel,
  formatExternalAmount,
  formatFinanceDateTime,
  formatInternalAmount,
  internalTransactionTypeLabel,
} from "@/features/client-finance/format";
import {
  FINANCE_PAYMENT_STATUSES,
  type ClientFinanceTab,
  type ExternalTransaction,
  type FinancePaymentStatus,
  type InternalTransaction,
} from "@/features/client-finance/types";
import { listClientTradingAccounts } from "@/features/client-trading-account/api";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { TradingAccount } from "@/features/trading-account/types";
import { cn } from "@/lib/utils";

const clientFinanceBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "Finanzas", current: true },
];

const financeTabs: { value: ClientFinanceTab; label: string }[] = [
  { value: "transfers", label: "Transferencias" },
  { value: "deposits", label: "Depósitos simulados" },
];

export function ClientFinanceView() {
  const [activeTab, setActiveTab] = useState<ClientFinanceTab>("transfers");
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [internalTransfers, setInternalTransfers] = useState<
    InternalTransaction[]
  >([]);
  const [externalDeposits, setExternalDeposits] = useState<ExternalTransaction[]>(
    [],
  );
  const [externalWithdrawals, setExternalWithdrawals] = useState<
    ExternalTransaction[]
  >([]);

  const [internalPagination, setInternalPagination] =
    useState<BrokerPaginationMeta | null>(null);
  const [depositsPagination, setDepositsPagination] =
    useState<BrokerPaginationMeta | null>(null);
  const [withdrawalsPagination, setWithdrawalsPagination] =
    useState<BrokerPaginationMeta | null>(null);

  const [internalPage, setInternalPage] = useState(1);
  const [depositsPage, setDepositsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);

  const [internalStatusFilter, setInternalStatusFilter] = useState<
    FinancePaymentStatus | "all"
  >("all");
  const [externalStatusFilter, setExternalStatusFilter] = useState<
    FinancePaymentStatus | "all"
  >("all");

  const [internalLoading, setInternalLoading] = useState(true);
  const [externalLoading, setExternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accountLabels = useMemo(
    () =>
      new Map(
        accounts.map((account) => [account.id, account.external_trader_id]),
      ),
    [accounts],
  );

  const internalStatusLabel = useMemo(() => {
    return (
      FINANCE_PAYMENT_STATUSES.find(
        (option) => option.value === internalStatusFilter,
      )?.label ?? "Todos"
    );
  }, [internalStatusFilter]);

  const externalStatusLabel = useMemo(() => {
    return (
      FINANCE_PAYMENT_STATUSES.find(
        (option) => option.value === externalStatusFilter,
      )?.label ?? "Todos"
    );
  }, [externalStatusFilter]);

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);

    try {
      const response = await listClientTradingAccounts({ per_page: 100 });
      setAccounts(response.data);
    } catch {
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const loadInternalTransfers = useCallback(
    async (requestedPage: number) => {
      setInternalLoading(true);
      setError(null);

      try {
        const response = await listInternalTransfers({
          page: requestedPage,
          per_page: 15,
          payment_status:
            internalStatusFilter === "all" ? undefined : internalStatusFilter,
        });

        setInternalTransfers(response.data);
        setInternalPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setInternalTransfers([]);
        setInternalPagination(null);
      } finally {
        setInternalLoading(false);
      }
    },
    [internalStatusFilter],
  );

  const loadExternalTransactions = useCallback(
    async (depositsRequestedPage: number, withdrawalsRequestedPage: number) => {
      setExternalLoading(true);
      setError(null);

      try {
        const [depositsResponse, withdrawalsResponse] = await Promise.all([
          listExternalDeposits({
            page: depositsRequestedPage,
            per_page: 15,
            payment_status:
              externalStatusFilter === "all" ? undefined : externalStatusFilter,
          }),
          listExternalWithdrawals({
            page: withdrawalsRequestedPage,
            per_page: 15,
            payment_status:
              externalStatusFilter === "all" ? undefined : externalStatusFilter,
          }),
        ]);

        setExternalDeposits(depositsResponse.data);
        setDepositsPagination(depositsResponse.meta.pagination ?? null);
        setExternalWithdrawals(withdrawalsResponse.data);
        setWithdrawalsPagination(withdrawalsResponse.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setExternalDeposits([]);
        setExternalWithdrawals([]);
        setDepositsPagination(null);
        setWithdrawalsPagination(null);
      } finally {
        setExternalLoading(false);
      }
    },
    [externalStatusFilter],
  );

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (activeTab === "transfers") {
      void loadInternalTransfers(internalPage);
    }
  }, [activeTab, internalPage, loadInternalTransfers]);

  useEffect(() => {
    if (activeTab === "deposits") {
      void loadExternalTransactions(depositsPage, withdrawalsPage);
    }
  }, [
    activeTab,
    depositsPage,
    withdrawalsPage,
    loadExternalTransactions,
  ]);

  useEffect(() => {
    setInternalPage(1);
  }, [internalStatusFilter]);

  useEffect(() => {
    setDepositsPage(1);
    setWithdrawalsPage(1);
  }, [externalStatusFilter]);

  function handleTransferSuccess() {
    void loadAccounts();
    void loadInternalTransfers(internalPage);
  }

  function handleDepositSuccess() {
    void loadAccounts();
    void loadExternalTransactions(depositsPage, withdrawalsPage);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={clientFinanceBreadcrumbs} />

      <div className="flex flex-wrap gap-2">
        {financeTabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant={activeTab === tab.value ? "default" : "outline"}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar los movimientos"
          message={error}
        />
      ) : null}

      {activeTab === "transfers" ? (
        <div className="space-y-4">
          {accountsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ClientInternalTransferPanel
              accounts={accounts}
              onTransferred={handleTransferSuccess}
            />
          )}

          <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-2 md:min-w-[220px]">
              <Label htmlFor="internal-status-filter">Estado</Label>
              <Select
                value={internalStatusFilter}
                onValueChange={(value) => {
                  if (value) {
                    setInternalStatusFilter(
                      value as FinancePaymentStatus | "all",
                    );
                  }
                }}
              >
                <SelectTrigger id="internal-status-filter">
                  <SelectValue placeholder="Todos">
                    {internalStatusLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FINANCE_PAYMENT_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={internalLoading}
              onClick={() => void loadInternalTransfers(internalPage)}
            >
              <RefreshCwIcon />
              Actualizar
            </Button>
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Comentarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`internal-skeleton-${index}`}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!internalLoading && internalTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay transferencias internas registradas.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!internalLoading
                  ? internalTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-sm">
                          {formatFinanceDateTime(transfer.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAccountLabel(
                            transfer.from_account_id,
                            accountLabels,
                          )}
                        </TableCell>
                        <TableCell>
                          {formatAccountLabel(
                            transfer.to_account_id,
                            accountLabels,
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatInternalAmount(transfer.amount)}
                        </TableCell>
                        <TableCell>{internalTransactionTypeLabel()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={financePaymentStatusVariant(
                              transfer.payment_status,
                            )}
                          >
                            {financePaymentStatusLabel(transfer.payment_status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {transfer.comments || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>

          {internalPagination && internalPagination.last_page > 1 ? (
            <PaginationBar
              pagination={internalPagination}
              page={internalPage}
              loading={internalLoading}
              onPageChange={setInternalPage}
            />
          ) : null}
        </div>
      ) : null}

      {activeTab === "deposits" ? (
        <div className="space-y-4">
          {accountsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ClientSimulatedDepositPanel
              accounts={accounts}
              onDeposited={handleDepositSuccess}
            />
          )}

          <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-2 md:min-w-[220px]">
              <Label htmlFor="external-status-filter">Estado</Label>
              <Select
                value={externalStatusFilter}
                onValueChange={(value) => {
                  if (value) {
                    setExternalStatusFilter(
                      value as FinancePaymentStatus | "all",
                    );
                  }
                }}
              >
                <SelectTrigger id="external-status-filter">
                  <SelectValue placeholder="Todos">
                    {externalStatusLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FINANCE_PAYMENT_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={externalLoading}
              onClick={() =>
                void loadExternalTransactions(depositsPage, withdrawalsPage)
              }
            >
              <RefreshCwIcon />
              Actualizar
            </Button>
          </div>

          <ExternalTransactionsSection
            title="Depósitos externos"
            description="Movimientos registrados vía el endpoint de depósitos externos."
            transactions={externalDeposits}
            loading={externalLoading}
            accountLabels={accountLabels}
            emptyMessage="No hay depósitos externos registrados."
          />

          {depositsPagination && depositsPagination.last_page > 1 ? (
            <PaginationBar
              pagination={depositsPagination}
              page={depositsPage}
              loading={externalLoading}
              onPageChange={setDepositsPage}
            />
          ) : null}

          <ExternalTransactionsSection
            title="Retiros externos"
            description="Movimientos registrados vía el endpoint de retiros externos."
            transactions={externalWithdrawals}
            loading={externalLoading}
            accountLabels={accountLabels}
            emptyMessage="No hay retiros externos registrados."
          />

          {withdrawalsPagination && withdrawalsPagination.last_page > 1 ? (
            <PaginationBar
              pagination={withdrawalsPagination}
              page={withdrawalsPage}
              loading={externalLoading}
              onPageChange={setWithdrawalsPage}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type PaginationBarProps = {
  pagination: BrokerPaginationMeta;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
};

function PaginationBar({
  pagination,
  page,
  loading,
  onPageChange,
}: PaginationBarProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página {pagination.current_page} de {pagination.last_page} (
        {pagination.total} en total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pagination.last_page || loading}
          onClick={() =>
            onPageChange(Math.min(pagination.last_page, page + 1))
          }
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

type ExternalTransactionsSectionProps = {
  title: string;
  description: string;
  transactions: ExternalTransaction[];
  loading: boolean;
  accountLabels: Map<string, string>;
  emptyMessage: string;
};

function ExternalTransactionsSection({
  title,
  description,
  transactions,
  loading,
  accountLabels,
  emptyMessage,
}: ExternalTransactionsSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Comentarios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`external-skeleton-${title}-${index}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {formatFinanceDateTime(transaction.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAccountLabel(
                        transaction.account_id,
                        accountLabels,
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatExternalAmount(
                        transaction.amount,
                        transaction.currency,
                      )}
                    </TableCell>
                    <TableCell>
                      {externalTransactionTypeLabel(transaction.type)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={financePaymentStatusVariant(
                          transaction.payment_status,
                        )}
                      >
                        {financePaymentStatusLabel(transaction.payment_status)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "max-w-[200px] truncate text-sm text-muted-foreground",
                        transaction.failure_reason && "text-destructive",
                      )}
                    >
                      {transaction.failure_reason ||
                        transaction.comments ||
                        "—"}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
