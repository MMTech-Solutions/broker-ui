"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterXIcon,
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
import { Input } from "@/components/ui/input";
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
  EMPTY_BONUS_OFFER_FILTERS,
  type BonusOffer,
  type BonusOfferFilterFormState,
  type BonusOfferListFilters,
  type BonusOfferSortBy,
  type BonusOfferSortDirection,
} from "@/features/bonus-offer/types";
import { listPlatforms } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const bonusOffersBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus offers", current: true },
];

const TABLE_COLUMN_COUNT = 11;

const bonusOfferTypeLabels = Object.fromEntries(
  BONUS_OFFER_TYPES.map((option) => [option.value, option.label]),
) as Record<string, string>;

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formToAppliedFilters(
  form: BonusOfferFilterFormState,
  sortBy: BonusOfferSortBy,
  sortDirection: BonusOfferSortDirection,
): BonusOfferListFilters {
  const filters: BonusOfferListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const name = form.name.trim();
  if (name) {
    filters.name = name;
  }

  if (form.type === "manual_claim" || form.type === "deposit_triggered") {
    filters.type = form.type;
  }

  const platformId = form.platform_id.trim();
  if (platformId && platformId !== "all") {
    filters.platform_id = platformId;
  }

  const serverGroupsCount = parseOptionalNumber(form.server_groups_count);
  if (serverGroupsCount !== undefined) {
    filters.server_groups_count = serverGroupsCount;
  }

  const excludedCount = parseOptionalNumber(form.excluded_instruments_count);
  if (excludedCount !== undefined) {
    filters.excluded_instruments_count = excludedCount;
  }

  const ibsCount = parseOptionalNumber(form.introducing_brokers_count);
  if (ibsCount !== undefined) {
    filters.introducing_brokers_count = ibsCount;
  }

  const assignmentsCount = parseOptionalNumber(form.assignments_count);
  if (assignmentsCount !== undefined) {
    filters.assignments_count = assignmentsCount;
  }

  const claimExpiresAt = form.claim_expires_at.trim();
  if (claimExpiresAt) {
    filters.claim_expires_at = claimExpiresAt;
  }

  if (form.is_active === "true" || form.is_active === "false") {
    filters.is_active = form.is_active === "true";
  }

  return filters;
}

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

type ColumnSortHeadProps = {
  label: string;
  sortKey: BonusOfferSortBy;
  activeSortBy: BonusOfferSortBy;
  activeDirection: BonusOfferSortDirection;
  onSort: (sortKey: BonusOfferSortBy) => void;
  disabled?: boolean;
};

function ColumnSortHead({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
}: ColumnSortHeadProps) {
  const isActive = activeSortBy === sortKey;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0"
        disabled={disabled}
        title={
          isActive
            ? `Sorted ${activeDirection === "asc" ? "ascending" : "descending"} — click to toggle`
            : `Sort by ${label}`
        }
        onClick={() => onSort(sortKey)}
      >
        {isActive ? (
          activeDirection === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : (
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function BonusOffersView() {
  const [bonusOffers, setBonusOffers] = useState<BonusOffer[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [warnings, setWarnings] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] = useState<BonusOfferFilterFormState>(
    EMPTY_BONUS_OFFER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<BonusOfferListFilters>({
    sort_by: "created_at",
    sort_direction: "desc",
  });
  const [sortBy, setSortBy] = useState<BonusOfferSortBy>("created_at");
  const [sortDirection, setSortDirection] =
    useState<BonusOfferSortDirection>("desc");

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

  const platformLabels = useMemo(
    () =>
      Object.fromEntries(
        platforms.map((platform) => [
          platform.id,
          platform.custom_name ?? platform.name,
        ]),
      ),
    [platforms],
  );

  const loadBonusOffers = useCallback(
    async (
      requestedPage: number,
      filters: BonusOfferListFilters,
      options?: { silent?: boolean },
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const [offersResponse, platformsResponse] = await Promise.all([
          listBonusOffers({
            ...filters,
            page: requestedPage,
            per_page: 15,
          }),
          listPlatforms({ per_page: 100 }),
        ]);

        setBonusOffers(offersResponse.data);
        setPagination(offersResponse.meta.pagination ?? null);
        setWarnings(offersResponse.meta.warnings ?? []);
        setPlatforms(platformsResponse.data);
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
    void loadBonusOffers(page, appliedFilters);
  }, [appliedFilters, loadBonusOffers, page]);

  function commitFilters(
    form: BonusOfferFilterFormState,
    nextSortBy: BonusOfferSortBy,
    nextSortDirection: BonusOfferSortDirection,
  ) {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(form, nextSortBy, nextSortDirection));
  }

  function patchDraft(
    patch: Partial<BonusOfferFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...draftFilters, ...patch };
    setDraftFilters(next);
    if (options?.apply) {
      commitFilters(next, sortBy, sortDirection);
    }
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      commitFilters(draftFilters, sortBy, sortDirection);
    }
  }

  function toggleSort(column: BonusOfferSortBy) {
    let nextDirection: BonusOfferSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_BONUS_OFFER_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_BONUS_OFFER_FILTERS, "created_at", "desc");
  }

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
    void loadBonusOffers(page, appliedFilters, { silent: true });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={bonusOffersBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={loading}
          title="Clear column filters and sort"
        >
          <FilterXIcon data-icon="inline-start" />
          Clear filters
        </Button>
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
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Name"
                  sortKey="name"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Filter… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.name}
                  onChange={(event) => patchDraft({ name: event.target.value })}
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Type"
                  sortKey="type"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.type || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        type:
                          value === "all"
                            ? ""
                            : (value as BonusOfferFilterFormState["type"]),
                      },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {BONUS_OFFER_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead>Reward</TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Platform"
                  sortKey="platform_id"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.platform_id || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      { platform_id: value === "all" ? "" : (value ?? "") },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.custom_name ?? platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="min-w-[110px] align-bottom">
                <ColumnSortHead
                  label="Server groups"
                  sortKey="server_groups_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.server_groups_count}
                  onChange={(event) =>
                    patchDraft({ server_groups_count: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[110px] align-bottom">
                <ColumnSortHead
                  label="Excluded"
                  sortKey="excluded_instruments_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.excluded_instruments_count}
                  onChange={(event) =>
                    patchDraft({
                      excluded_instruments_count: event.target.value,
                    })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[90px] align-bottom">
                <ColumnSortHead
                  label="IBs"
                  sortKey="introducing_brokers_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.introducing_brokers_count}
                  onChange={(event) =>
                    patchDraft({
                      introducing_brokers_count: event.target.value,
                    })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[110px] align-bottom">
                <ColumnSortHead
                  label="Assignments"
                  sortKey="assignments_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.assignments_count}
                  onChange={(event) =>
                    patchDraft({ assignments_count: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Claim expires"
                  sortKey="claim_expires_at"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Date… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.claim_expires_at}
                  onChange={(event) =>
                    patchDraft({ claim_expires_at: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[120px] align-bottom">
                <ColumnSortHead
                  label="Status"
                  sortKey="is_active"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.is_active || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        is_active:
                          value === "all"
                            ? ""
                            : (value as "true" | "false"),
                      },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && bonusOffers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
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
                      {platformLabels[offer.platform_id] ?? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {offer.platform_id.slice(0, 8)}…
                        </span>
                      )}
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
