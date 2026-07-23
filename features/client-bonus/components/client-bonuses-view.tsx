"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EyeIcon, GiftIcon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  listAvailableBonusOffers,
  listClientBonusAssignments,
} from "@/features/client-bonus/api";
import { ClientBonusAssignmentDetailDialog } from "@/features/client-bonus/components/client-bonus-assignment-detail-dialog";
import { ClientBonusClaimDialog } from "@/features/client-bonus/components/client-bonus-claim-dialog";
import {
  clientBonusAssignmentStatusLabel,
  clientBonusAssignmentStatusVariant,
  formatBonusDateTime,
  formatBonusMajorAmount,
  formatBonusMinorAmount,
  formatOfferRewardSummary,
  formatOfferTypeLabel,
  getConversionProgress,
} from "@/features/client-bonus/format";
import type {
  BonusAssignment,
  BonusOffer,
  ClientBonusAssignmentListFilters,
} from "@/features/client-bonus/types";
import { CLIENT_BONUS_ASSIGNMENT_STATUSES } from "@/features/client-bonus/types";
import { listClientTradingAccounts } from "@/features/client-trading-account/api";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const clientBonusesBreadcrumbs: BreadcrumbItem[] = [
  { label: "Inicio", href: "/client" },
  { label: "Bonos", current: true },
];

export function ClientBonusesView() {
  const [availableOffers, setAvailableOffers] = useState<BonusOffer[]>([]);
  const [assignments, setAssignments] = useState<BonusAssignment[]>([]);
  const [accountLabels, setAccountLabels] = useState<Map<string, string>>(
    new Map(),
  );
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );

  const [offersLoading, setOffersLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    ClientBonusAssignmentListFilters["status"] | "all"
  >("all");
  const [page, setPage] = useState(1);

  const [claimOpen, setClaimOpen] = useState(false);
  const [offerToClaim, setOfferToClaim] = useState<BonusOffer | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  const statusFilterLabel = useMemo(() => {
    return (
      CLIENT_BONUS_ASSIGNMENT_STATUSES.find(
        (option) => option.value === statusFilter,
      )?.label ?? "Todos"
    );
  }, [statusFilter]);

  const selectedAssignmentAccountLabel = useMemo(() => {
    if (!selectedAssignmentId) {
      return undefined;
    }

    const assignment = assignments.find(
      (entry) => entry.id === selectedAssignmentId,
    );

    if (!assignment) {
      return undefined;
    }

    return (
      accountLabels.get(assignment.account_id) ?? assignment.account_id
    );
  }, [accountLabels, assignments, selectedAssignmentId]);

  const loadOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError(null);

    try {
      const response = await listAvailableBonusOffers();
      setAvailableOffers(response.data);
    } catch (loadError) {
      setOffersError(formatBrokerApiError(loadError));
      setAvailableOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  const loadAssignments = useCallback(async (requestedPage: number) => {
    setAssignmentsLoading(true);
    setAssignmentsError(null);

    try {
      const assignmentsResponse = await listClientBonusAssignments({
        page: requestedPage,
        per_page: 15,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setAssignments(assignmentsResponse.data);
      setPagination(assignmentsResponse.meta.pagination ?? null);

      try {
        const accountsResponse = await listClientTradingAccounts({ per_page: 100 });
        setAccountLabels(
          new Map(
            accountsResponse.data.map((account) => [
              account.id,
              account.external_trader_id,
            ]),
          ),
        );
      } catch {
        setAccountLabels(new Map());
      }
    } catch (loadError) {
      setAssignmentsError(formatBrokerApiError(loadError));
      setAssignments([]);
      setPagination(null);
      setAccountLabels(new Map());
    } finally {
      setAssignmentsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    void loadAssignments(page);
  }, [loadAssignments, page]);

  function handleClaimed() {
    void loadOffers();
    void loadAssignments(page);
  }

  function openClaimDialog(offer: BonusOffer) {
    setOfferToClaim(offer);
    setClaimOpen(true);
  }

  function openDetailDialog(assignment: BonusAssignment) {
    setSelectedAssignmentId(assignment.id);
    setDetailOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={clientBonusesBreadcrumbs} />

      {offersError ? (
        <ApiErrorAlert
          title="No se pudieron cargar los bonos disponibles"
          message={offersError}
        />
      ) : null}

      {assignmentsError ? (
        <ApiErrorAlert
          title="No se pudieron cargar tus bonos asignados"
          message={assignmentsError}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GiftIcon className="size-5" />
            Bonos disponibles
          </CardTitle>
          <CardDescription>
            Ofertas de reclamo manual que aún no has utilizado. Los bonos por
            depósito se aplican automáticamente al depositar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="w-[120px] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offersLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`offer-skeleton-${index}`}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!offersLoading && availableOffers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No hay bonos disponibles para reclamar en este momento.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!offersLoading
                  ? availableOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          {offer.name}
                        </TableCell>
                        <TableCell>
                          {formatOfferRewardSummary(offer)}
                        </TableCell>
                        <TableCell>
                          {formatBonusDateTime(offer.claim_expires_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openClaimDialog(offer)}
                          >
                            Reclamar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Mis bonos</CardTitle>
            <CardDescription>
              Historial de bonos reclamados o acreditados en tus cuentas,
              incluidos depósitos automáticos.
            </CardDescription>
          </div>
          <div className="w-full space-y-2 sm:w-56">
            <Label htmlFor="bonus-status-filter">Estado</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger id="bonus-status-filter">
                <SelectValue placeholder="Todos">
                  {statusFilterLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CLIENT_BONUS_ASSIGNMENT_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Crédito</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Límite</TableHead>
                  <TableHead className="w-[80px] text-right">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`assignment-skeleton-${index}`}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!assignmentsLoading && assignments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No tienes bonos asignados con los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!assignmentsLoading
                  ? assignments.map((assignment) => {
                      const progress = getConversionProgress(assignment);
                      const accountLabel =
                        accountLabels.get(assignment.account_id) ??
                        assignment.account_id;

                      return (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.bonus_offer?.name ?? "—"}
                          </TableCell>
                          <TableCell>{accountLabel}</TableCell>
                          <TableCell>
                            {assignment.bonus_offer
                              ? formatOfferTypeLabel(
                                  assignment.bonus_offer.type,
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatBonusMajorAmount(
                              assignment.credited_amount,
                              assignment.currency_precision ?? 2,
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={clientBonusAssignmentStatusVariant(
                                assignment.status,
                              )}
                            >
                              {clientBonusAssignmentStatusLabel(
                                assignment.status,
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {progress
                              ? `${progress.percent.toFixed(1)}%`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {formatBonusDateTime(
                              assignment.conversion_deadline_at,
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Ver detalle"
                              onClick={() => openDetailDialog(assignment)}
                            >
                              <EyeIcon />
                            </ActionTooltipButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                  disabled={page <= 1 || assignmentsLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= pagination.last_page || assignmentsLoading
                  }
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
        </CardContent>
      </Card>

      <ClientBonusClaimDialog
        offer={offerToClaim}
        open={claimOpen}
        onOpenChange={setClaimOpen}
        onClaimed={handleClaimed}
      />

      <ClientBonusAssignmentDetailDialog
        assignmentId={selectedAssignmentId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        accountLabel={selectedAssignmentAccountLabel}
      />
    </div>
  );
}
