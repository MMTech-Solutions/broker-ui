"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  GiftIcon,
  LayersIcon,
  ListXIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listBonusOffers } from "@/features/bonus-offer/api";
import { formatDepositPercentValue } from "@/features/bonus-offer/format";
import { BonusOfferAdminAssignDialog } from "@/features/bonus-offer/components/bonus-offer-admin-assign-dialog";
import { BonusOfferDeleteDialog } from "@/features/bonus-offer/components/bonus-offer-delete-dialog";
import { BonusOfferFormDialog } from "@/features/bonus-offer/components/bonus-offer-form-dialog";
import { BonusOfferIntroducingBrokersDialog } from "@/features/bonus-offer/components/bonus-offer-introducing-brokers-dialog";
import { BonusOfferServerGroupsDialog } from "@/features/bonus-offer/components/bonus-offer-server-groups-dialog";
import { bonusOfferExcludedInstrumentsPath } from "@/features/bonus-excluded-instrument/routes";
import {
  BONUS_OFFER_TYPES,
  type BonusOffer,
} from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const bonusOffersBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus offers", current: true },
];

const bonusOfferTypeLabels = Object.fromEntries(
  BONUS_OFFER_TYPES.map((option) => [option.value, option.label]),
) as Record<string, string>;

function formatRewardSummary(offer: BonusOffer): string {
  const precision = offer.currency_precision ?? 2;

  if (offer.type === "deposit_triggered") {
    const percent =
      offer.deposit_percent != null
        ? formatDepositPercentValue(offer.deposit_percent)
        : "—";
    const max = offer.max_credit_amount;

    if (max == null) {
      return `${percent}%`;
    }

    const maxMajor = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    }).format(Number(max));

    return `${percent}% (max ${maxMajor})`;
  }

  if (offer.credit_amount == null) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(Number(offer.credit_amount));
}

function formatExpiresAt(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BonusOffersView() {
  const [bonusOffers, setBonusOffers] = useState<BonusOffer[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [warnings, setWarnings] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedOffer, setSelectedOffer] = useState<BonusOffer | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<BonusOffer | null>(null);

  const [ibsOpen, setIbsOpen] = useState(false);
  const [offerForIbs, setOfferForIbs] = useState<BonusOffer | null>(null);

  const [serverGroupsOpen, setServerGroupsOpen] = useState(false);
  const [offerForServerGroups, setOfferForServerGroups] =
    useState<BonusOffer | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [offerForAssign, setOfferForAssign] = useState<BonusOffer | null>(null);

  const loadBonusOffers = useCallback(
    async (requestedPage: number, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await listBonusOffers({
          page: requestedPage,
          per_page: 15,
        });

        setBonusOffers(response.data);
        setPagination(response.meta.pagination ?? null);
        setWarnings(response.meta.warnings ?? []);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setBonusOffers([]);
        setPagination(null);
        setWarnings([]);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadBonusOffers(page);
  }, [loadBonusOffers, page]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedOffer(null);
    setFormOpen(true);
  }

  function openEditDialog(offer: BonusOffer) {
    setFormMode("edit");
    setSelectedOffer(offer);
    setFormOpen(true);
  }

  function openDeleteDialog(offer: BonusOffer) {
    setOfferToDelete(offer);
    setDeleteOpen(true);
  }

  function openIntroducingBrokersDialog(offer: BonusOffer) {
    setOfferForIbs(offer);
    setIbsOpen(true);
  }

  function openServerGroupsDialog(offer: BonusOffer) {
    setOfferForServerGroups(offer);
    setServerGroupsOpen(true);
  }

  function openAssignDialog(offer: BonusOffer) {
    setOfferForAssign(offer);
    setAssignOpen(true);
  }

  function handleMutationSuccess() {
    void loadBonusOffers(page, { silent: true });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={bonusOffersBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New bonus offer
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load bonus offers" message={error} />
      ) : null}

      {!loading && warnings.length > 0 ? (
        <Alert variant="warning">
          <AlertTitle>Operator warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Server groups</TableHead>
              <TableHead>Excluded</TableHead>
              <TableHead>IBs</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Claim expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={11}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && bonusOffers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-muted-foreground"
                >
                  No bonus offers found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? bonusOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>
                      {bonusOfferTypeLabels[offer.type] ?? offer.type}
                    </TableCell>
                    <TableCell>{formatRewardSummary(offer)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {offer.platform_id.slice(0, 8)}…
                      </span>
                    </TableCell>
                    <TableCell>{offer.server_groups_count ?? 0}</TableCell>
                    <TableCell>{offer.excluded_instruments_count ?? 0}</TableCell>
                    <TableCell>
                      {offer.type === "deposit_triggered"
                        ? (offer.introducing_brokers_count ?? 0) === 0
                          ? "Default"
                          : (offer.introducing_brokers_count ?? 0)
                        : "—"}
                    </TableCell>
                    <TableCell>{offer.assignments_count ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatExpiresAt(offer.claim_expires_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={offer.is_active ? "default" : "secondary"}
                      >
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={
                            offer.is_active
                              ? `Assign ${offer.name} to a user`
                              : "Activate the offer before assigning"
                          }
                          onClick={() => openAssignDialog(offer)}
                          disabled={!offer.is_active}
                        >
                          <GiftIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Server groups for ${offer.name}`}
                          onClick={() => openServerGroupsDialog(offer)}
                        >
                          <LayersIcon />
                        </ActionTooltipButton>
                        {offer.type === "deposit_triggered" ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Linked IBs for ${offer.name}`}
                            onClick={() => openIntroducingBrokersDialog(offer)}
                          >
                            <UsersIcon />
                          </ActionTooltipButton>
                        ) : null}
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Excluded instruments for ${offer.name}`}
                          render={
                            <Link
                              href={bonusOfferExcludedInstrumentsPath(offer.id)}
                            />
                          }
                        >
                          <ListXIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${offer.name}`}
                          onClick={() => openEditDialog(offer)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${offer.name}`}
                          onClick={() => openDeleteDialog(offer)}
                        >
                          <Trash2Icon />
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
            Page {pagination.current_page} of {pagination.last_page} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
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
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <BonusOfferFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        bonusOffer={selectedOffer}
        onSuccess={handleMutationSuccess}
      />

      <BonusOfferDeleteDialog
        bonusOffer={offerToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />

      <BonusOfferIntroducingBrokersDialog
        bonusOffer={offerForIbs}
        open={ibsOpen}
        onOpenChange={setIbsOpen}
        onSuccess={handleMutationSuccess}
      />

      <BonusOfferServerGroupsDialog
        bonusOffer={offerForServerGroups}
        open={serverGroupsOpen}
        onOpenChange={setServerGroupsOpen}
        onSuccess={handleMutationSuccess}
      />

      <BonusOfferAdminAssignDialog
        bonusOffer={offerForAssign}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
