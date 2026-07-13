"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, LineChartIcon, PlusIcon, ShieldCheckIcon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
  loadClientAccountCatalog,
  listClientTradingAccounts,
} from "@/features/client-trading-account/api";
import { ClientTradingAccountCreateDialog } from "@/features/client-trading-account/components/client-trading-account-create-dialog";
import { ClientTradingAccountDepositDialog } from "@/features/client-trading-account/components/client-trading-account-deposit-dialog";
import { ClientTradingAccountWithdrawDialog } from "@/features/client-trading-account/components/client-trading-account-withdraw-dialog";
import {
  formatAccountMoney,
  formatEnvironmentLabel,
} from "@/features/client-trading-account/format";
import type {
  ClientAccountCatalog,
  ClientTradingAccountListFilters,
  EnrichedClientTradingAccount,
  TradingAccount,
} from "@/features/client-trading-account/types";
import { ClientInsuranceContractDialog } from "@/features/client-insurance/components/client-insurance-contract-dialog";
import { ClientInsuranceEligibleAccountsDialog } from "@/features/client-insurance/components/client-insurance-eligible-accounts-dialog";
import { loadInsuranceEligibleAccountIds } from "@/features/client-insurance/api";
import type { ClientInsuranceEligibleAccount } from "@/features/client-insurance/types";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const clientTradingAccountsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "Cuentas de trading", current: true },
];

function enrichAccounts(
  accounts: TradingAccount[],
  catalog: ClientAccountCatalog | null,
): EnrichedClientTradingAccount[] {
  if (!catalog) {
    return accounts.map((account) => ({
      ...account,
      serverGroupLabel: account.server_group_id,
      platformLabel: "—",
      environmentLabel: "—",
      leverageLabel: account.leverage_id,
      tradingServerId: null,
      platformId: null,
      environment: null,
    }));
  }

  return accounts.map((account) => {
    const serverGroup = catalog.serverGroupById.get(account.server_group_id);
    const leverage = catalog.leverageById.get(account.leverage_id);
    const tradingServer = serverGroup
      ? catalog.tradingServerById.get(serverGroup.trading_server_id)
      : null;
    const platform = tradingServer
      ? catalog.platformById.get(tradingServer.platform_id)
      : null;

    return {
      ...account,
      serverGroupLabel: serverGroup?.name ?? account.server_group_id,
      platformLabel:
        platform?.custom_name ?? platform?.name ?? String(serverGroup?.platform ?? "—"),
      environmentLabel: formatEnvironmentLabel(
        serverGroup?.environment ?? tradingServer?.environment,
      ),
      leverageLabel: leverage?.name ?? account.leverage_id,
      tradingServerId: serverGroup?.trading_server_id ?? null,
      platformId: tradingServer?.platform_id ?? null,
      environment: serverGroup?.environment ?? tradingServer?.environment ?? null,
    };
  });
}

export function ClientTradingAccountsView() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [catalog, setCatalog] = useState<ClientAccountCatalog | null>(null);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ClientTradingAccountListFilters>({
    platformId: "all",
    tradingServerId: "all",
    leverageId: "all",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [insuranceEligibleOpen, setInsuranceEligibleOpen] = useState(false);
  const [insuranceContractOpen, setInsuranceContractOpen] = useState(false);
  const [accountToInsure, setAccountToInsure] =
    useState<ClientInsuranceEligibleAccount | null>(null);
  const [eligibleAccountIds, setEligibleAccountIds] = useState<Set<string>>(
    new Set(),
  );
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<EnrichedClientTradingAccount | null>(null);

  const loadData = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const [accountsResponse, catalogData] = await Promise.all([
        listClientTradingAccounts({
          page: requestedPage,
          per_page: 15,
        }),
        loadClientAccountCatalog(),
      ]);

      setAccounts(accountsResponse.data);
      setPagination(accountsResponse.meta.pagination ?? null);
      setCatalog(catalogData);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setAccounts([]);
      setPagination(null);
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(page);
  }, [loadData, page]);

  const enrichedAccounts = useMemo(
    () => enrichAccounts(accounts, catalog),
    [accounts, catalog],
  );

  const environmentByAccountId = useMemo(() => {
    return new Map(
      enrichedAccounts.map((account) => [account.id, account.environment]),
    );
  }, [enrichedAccounts]);

  useEffect(() => {
    if (!catalog || accounts.length === 0) {
      setEligibleAccountIds(new Set());
      return;
    }

    let cancelled = false;

    async function loadEligibility() {
      setLoadingEligibility(true);

      try {
        const ids = await loadInsuranceEligibleAccountIds(
          accounts,
          environmentByAccountId,
        );

        if (!cancelled) {
          setEligibleAccountIds(ids);
        }
      } catch {
        if (!cancelled) {
          setEligibleAccountIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setLoadingEligibility(false);
        }
      }
    }

    void loadEligibility();

    return () => {
      cancelled = true;
    };
  }, [accounts, catalog, environmentByAccountId]);

  const filteredAccounts = useMemo(() => {
    return enrichedAccounts.filter((account) => {
      if (
        filters.platformId !== "all" &&
        account.platformId !== filters.platformId
      ) {
        return false;
      }

      if (
        filters.tradingServerId !== "all" &&
        account.tradingServerId !== filters.tradingServerId
      ) {
        return false;
      }

      if (
        filters.leverageId !== "all" &&
        account.leverage_id !== filters.leverageId
      ) {
        return false;
      }

      return true;
    });
  }, [enrichedAccounts, filters]);

  const tradingServerOptions = useMemo(() => {
    if (!catalog) {
      return [];
    }

    if (filters.platformId === "all") {
      return catalog.tradingServers;
    }

    return catalog.tradingServers.filter(
      (server) => server.platform_id === filters.platformId,
    );
  }, [catalog, filters.platformId]);

  const platformFilterLabel = useMemo(() => {
    if (filters.platformId === "all") {
      return "Todas";
    }

    const platform = catalog?.platforms.find(
      (entry) => entry.id === filters.platformId,
    );

    return platform?.custom_name ?? platform?.name ?? null;
  }, [catalog, filters.platformId]);

  const tradingServerFilterLabel = useMemo(() => {
    if (filters.tradingServerId === "all") {
      return "Todos";
    }

    const server =
      tradingServerOptions.find(
        (entry) => entry.id === filters.tradingServerId,
      ) ??
      catalog?.tradingServers.find(
        (entry) => entry.id === filters.tradingServerId,
      );

    return server?.connection_signature ?? null;
  }, [catalog, filters.tradingServerId, tradingServerOptions]);

  const leverageFilterLabel = useMemo(() => {
    if (filters.leverageId === "all") {
      return "Todos";
    }

    const leverage = catalog?.leverages.find(
      (entry) => entry.id === filters.leverageId,
    );

    return leverage ? `${leverage.name} (${leverage.value})` : null;
  }, [catalog, filters.leverageId]);

  function handleMutationSuccess() {
    void loadData(page);
  }

  function openDeposit(account: EnrichedClientTradingAccount) {
    setSelectedAccount(account);
    setDepositOpen(true);
  }

  function openWithdraw(account: EnrichedClientTradingAccount) {
    setSelectedAccount(account);
    setWithdrawOpen(true);
  }

  function openInsuranceContract(account: EnrichedClientTradingAccount) {
    setAccountToInsure({
      id: account.id,
      external_trader_id: account.external_trader_id,
      current_balance: account.current_balance,
      server_group_id: account.server_group_id,
      plans: [],
    });
    setInsuranceContractOpen(true);
  }

  function handleInsuranceContracted() {
    void loadData(page);
  }

  function openInsuranceFromEligible(account: ClientInsuranceEligibleAccount) {
    setAccountToInsure(account);
    setInsuranceContractOpen(true);
  }

  function openMetrics(account: EnrichedClientTradingAccount) {
    router.push(`/client/accounts/${account.id}/metrics`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={clientTradingAccountsBreadcrumbs}>
        <Button variant="outline" onClick={() => setInsuranceEligibleOpen(true)}>
          <ShieldCheckIcon />
          Asegurar cuenta
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Nueva cuenta
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="filter-platform">Plataforma</Label>
          <Select
            value={filters.platformId}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                platformId: value,
                tradingServerId: "all",
              }))
            }
          >
            <SelectTrigger id="filter-platform">
              <SelectValue placeholder="Todas">
                {platformFilterLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {catalog?.platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.custom_name ?? platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-trading-server">Trading server</Label>
          <Select
            value={filters.tradingServerId}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                tradingServerId: value,
              }))
            }
          >
            <SelectTrigger id="filter-trading-server">
              <SelectValue placeholder="Todos">
                {tradingServerFilterLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {tradingServerOptions.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  {server.connection_signature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-leverage">Apalancamiento</Label>
          <Select
            value={filters.leverageId}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                leverageId: value,
              }))
            }
          >
            <SelectTrigger id="filter-leverage">
              <SelectValue placeholder="Todos">
                {leverageFilterLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {catalog?.leverages.map((leverage) => (
                <SelectItem key={leverage.id} value={leverage.id}>
                  {leverage.name} ({leverage.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar las cuentas"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Login</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Entorno</TableHead>
              <TableHead>Apalancamiento</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[168px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay cuentas que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.external_trader_id}
                    </TableCell>
                    <TableCell>{account.platformLabel}</TableCell>
                    <TableCell>{account.serverGroupLabel}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.environment ===
                          TRADING_SERVER_ENVIRONMENT.LIVE
                            ? "default"
                            : "secondary"
                        }
                      >
                        {account.environmentLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.leverageLabel}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAccountMoney(account.current_balance)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.is_active ? "default" : "secondary"}
                      >
                        {account.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {eligibleAccountIds.has(account.id) &&
                        !loadingEligibility ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Asegurar cuenta"
                            onClick={() => openInsuranceContract(account)}
                          >
                            <ShieldCheckIcon />
                          </ActionTooltipButton>
                        ) : null}
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip="Ver métricas"
                          onClick={() => openMetrics(account)}
                        >
                          <LineChartIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip="Depositar"
                          onClick={() => openDeposit(account)}
                        >
                          <ArrowDownIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip="Retirar"
                          onClick={() => openWithdraw(account)}
                        >
                          <ArrowUpIcon />
                        </ActionTooltipButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 ? (
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
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.last_page, current + 1),
                )
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

      <ClientTradingAccountCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        catalog={catalog}
        onSuccess={handleMutationSuccess}
      />

      <ClientTradingAccountDepositDialog
        account={selectedAccount}
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onSuccess={handleMutationSuccess}
      />

      <ClientTradingAccountWithdrawDialog
        account={selectedAccount}
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onSuccess={handleMutationSuccess}
      />

      <ClientInsuranceEligibleAccountsDialog
        open={insuranceEligibleOpen}
        onOpenChange={setInsuranceEligibleOpen}
        environmentByAccountId={environmentByAccountId}
        onSelectAccount={openInsuranceFromEligible}
      />

      <ClientInsuranceContractDialog
        account={accountToInsure}
        open={insuranceContractOpen}
        onOpenChange={setInsuranceContractOpen}
        onContracted={handleInsuranceContracted}
      />
    </div>
  );
}
