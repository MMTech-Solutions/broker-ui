"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCwIcon, ShieldCheckIcon, XIcon } from "lucide-react";

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
  cancelClientAccountInsurance,
  claimClientAccountInsurance,
  listClientAccountInsurances,
} from "@/features/client-insurance/api";
import { ClientInsuranceContractDialog } from "@/features/client-insurance/components/client-insurance-contract-dialog";
import { ClientInsuranceEligibleAccountsDialog } from "@/features/client-insurance/components/client-insurance-eligible-accounts-dialog";
import {
  clientAccountInsuranceStatusLabel,
  clientAccountInsuranceStatusVariant,
  formatCoveragePercent,
  formatInsuranceDateTime,
  formatInsuranceMinorAmount,
} from "@/features/client-insurance/format";
import {
  CLIENT_ACCOUNT_INSURANCE_STATUSES,
  type ClientAccountInsurance,
  type ClientAccountInsuranceListFilters,
  type ClientInsuranceEligibleAccount,
} from "@/features/client-insurance/types";
import { listClientTradingAccounts } from "@/features/client-trading-account/api";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const clientInsuranceBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "Seguros", current: true },
];

export function ClientInsurancesView() {
  const [insurances, setInsurances] = useState<ClientAccountInsurance[]>([]);
  const [accountLabels, setAccountLabels] = useState<Map<string, string>>(
    new Map(),
  );
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    ClientAccountInsuranceListFilters["status"] | "all"
  >("all");

  const [eligibleOpen, setEligibleOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [accountToContract, setAccountToContract] =
    useState<ClientInsuranceEligibleAccount | null>(null);

  const statusFilterLabel = useMemo(() => {
    return (
      CLIENT_ACCOUNT_INSURANCE_STATUSES.find(
        (option) => option.value === statusFilter,
      )?.label ?? "Todos"
    );
  }, [statusFilter]);

  const loadAccountLabels = useCallback(async () => {
    try {
      const response = await listClientTradingAccounts({ per_page: 100 });
      setAccountLabels(
        new Map(
          response.data.map((account) => [
            account.id,
            account.external_trader_id,
          ]),
        ),
      );
    } catch {
      setAccountLabels(new Map());
    }
  }, []);

  const loadInsurances = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listClientAccountInsurances({
          page: requestedPage,
          per_page: 15,
          status: statusFilter === "all" ? undefined : statusFilter,
        });

        setInsurances(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setInsurances([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    void loadAccountLabels();
  }, [loadAccountLabels]);

  useEffect(() => {
    void loadInsurances(page);
  }, [loadInsurances, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  function handleContracted() {
    void loadInsurances(page);
  }

  function openContractForAccount(account: ClientInsuranceEligibleAccount) {
    setAccountToContract(account);
    setContractOpen(true);
  }

  async function handleClaim(insurance: ClientAccountInsurance) {
    setActionId(insurance.id);

    try {
      await claimClientAccountInsurance(insurance.id);
      await loadInsurances(page);
    } catch (claimError) {
      setError(formatBrokerApiError(claimError));
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(insurance: ClientAccountInsurance) {
    setActionId(insurance.id);

    try {
      await cancelClientAccountInsurance(insurance.id);
      await loadInsurances(page);
    } catch (cancelError) {
      setError(formatBrokerApiError(cancelError));
    } finally {
      setActionId(null);
    }
  }

  function canClaim(insurance: ClientAccountInsurance): boolean {
    return insurance.status === "active" || insurance.status === "claimable";
  }

  function canCancel(insurance: ClientAccountInsurance): boolean {
    return (
      insurance.status === "active" ||
      insurance.status === "claimable" ||
      insurance.status === "pending_claim"
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={clientInsuranceBreadcrumbs}>
        <Button onClick={() => setEligibleOpen(true)}>
          <ShieldCheckIcon />
          Contratar seguro
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:max-w-xs">
        <div className="space-y-2">
          <Label htmlFor="insurance-status-filter">Estado</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(
                value as ClientAccountInsuranceListFilters["status"] | "all",
              )
            }
          >
            <SelectTrigger id="insurance-status-filter">
              <SelectValue placeholder="Todos">{statusFilterLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CLIENT_ACCOUNT_INSURANCE_STATUSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert
          title="No se pudieron cargar los seguros"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cuenta</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Cobertura</TableHead>
              <TableHead className="text-right">Monto asegurado</TableHead>
              <TableHead className="text-right">Prima</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
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

            {!loading && insurances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tienes seguros registrados con este filtro.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? insurances.map((insurance) => (
                  <TableRow key={insurance.id}>
                    <TableCell className="font-medium">
                      {accountLabels.get(insurance.account_id) ??
                        insurance.account_id}
                    </TableCell>
                    <TableCell>{insurance.plan?.name ?? "—"}</TableCell>
                    <TableCell>
                      {formatCoveragePercent(insurance.coverage_percent)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatInsuranceMinorAmount(insurance.insured_amount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {insurance.is_free
                        ? "Gratis"
                        : formatInsuranceMinorAmount(insurance.premium_charged)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{formatInsuranceDateTime(insurance.started_at)}</div>
                      <div className="text-muted-foreground">
                        hasta {formatInsuranceDateTime(insurance.expires_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={clientAccountInsuranceStatusVariant(
                          insurance.status,
                        )}
                      >
                        {clientAccountInsuranceStatusLabel(insurance.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canClaim(insurance) ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Reclamar seguro"
                            disabled={actionId === insurance.id}
                            onClick={() => void handleClaim(insurance)}
                          >
                            <ShieldCheckIcon
                              className={cn(
                                actionId === insurance.id && "animate-pulse",
                              )}
                            />
                          </ActionTooltipButton>
                        ) : null}
                        {canCancel(insurance) ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Cancelar seguro"
                            disabled={actionId === insurance.id}
                            onClick={() => void handleCancel(insurance)}
                          >
                            <XIcon />
                          </ActionTooltipButton>
                        ) : null}
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
            <Button
              variant="outline"
              size="icon-sm"
              disabled={loading}
              onClick={() => void loadInsurances(page)}
            >
              <RefreshCwIcon />
            </Button>
          </div>
        </div>
      ) : null}

      <ClientInsuranceEligibleAccountsDialog
        open={eligibleOpen}
        onOpenChange={setEligibleOpen}
        onSelectAccount={openContractForAccount}
      />

      <ClientInsuranceContractDialog
        account={accountToContract}
        open={contractOpen}
        onOpenChange={setContractOpen}
        onContracted={handleContracted}
      />
    </div>
  );
}
