"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterXIcon,
  RefreshCwIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
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
import {
  BONUS_ASSIGNMENT_STATUSES,
  DEPOSIT_BONUS_INTENT_STATUSES,
  EMPTY_BONUS_ASSIGNMENT_FILTERS,
  EMPTY_DEPOSIT_BONUS_INTENT_FILTERS,
  bonusAssignmentOfferLabel,
  bonusAssignmentStatusLabel,
  bonusAssignmentStatusVariant,
  depositBonusIntentStatusLabel,
  depositBonusIntentStatusVariant,
  formatActivityProgress,
  formatDateTimeValue,
  formatMoneyValue,
  formatProgressPercent,
  listBonusAssignments,
  listDepositBonusIntents,
  resolveBonusOwner,
  truncateId,
  type BonusAssignment,
  type BonusAssignmentFilterFormState,
  type BonusAssignmentListFilters,
  type BonusAssignmentSortBy,
  type BonusAssignmentStatus,
  type BonusListSortDirection,
  type BonusLogsTab,
  type DepositBonusIntent,
  type DepositBonusIntentFilterFormState,
  type DepositBonusIntentListFilters,
  type DepositBonusIntentSortBy,
  type DepositBonusIntentStatus,
} from "@/features/bonus-assignment-logs";
import { BonusAssignmentDetailDialog } from "@/features/bonus-assignment-logs/components/bonus-assignment-detail-dialog";
import { CancelBonusAssignmentDialog } from "@/features/bonus-assignment-logs/components/cancel-bonus-assignment-dialog";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus logs", current: true },
];

const logsTabs: { value: BonusLogsTab; label: string }[] = [
  { value: "assignments", label: "Assignments" },
  { value: "deposit-intents", label: "Deposit intents" },
];

function abbreviateUuid(value: string): string {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…`;
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function assignmentFormToFilters(
  form: BonusAssignmentFilterFormState,
  sortBy: BonusAssignmentSortBy,
  sortDirection: BonusListSortDirection,
): BonusAssignmentListFilters {
  const filters: BonusAssignmentListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const createdAt = form.created_at.trim();
  if (createdAt) {
    filters.created_at = createdAt;
  }

  const offerName = form.offer_name.trim();
  if (offerName) {
    filters.offer_name = offerName;
  }

  const accountId = form.account_id.trim();
  if (accountId) {
    filters.account_id = accountId;
  }

  const platform = form.platform.trim();
  if (platform) {
    filters.platform = platform;
  }

  const externalTraderId = form.external_trader_id.trim();
  if (externalTraderId) {
    filters.external_trader_id = externalTraderId;
  }

  const userId = form.user_id.trim();
  if (userId) {
    filters.user_id = userId;
  }

  const userName = form.user_name.trim();
  if (userName) {
    filters.user_name = userName;
  }

  const userEmail = form.user_email.trim();
  if (userEmail) {
    filters.user_email = userEmail;
  }

  const creditedAmount = parseOptionalNumber(form.credited_amount);
  if (creditedAmount !== undefined) {
    filters.credited_amount = creditedAmount;
  }

  if (form.status) {
    filters.status = form.status;
  }

  const activatedAt = form.activated_at.trim();
  if (activatedAt) {
    filters.activated_at = activatedAt;
  }

  const conversionDeadlineAt = form.conversion_deadline_at.trim();
  if (conversionDeadlineAt) {
    filters.conversion_deadline_at = conversionDeadlineAt;
  }

  const accumulatedActivity = form.accumulated_activity.trim();
  if (accumulatedActivity) {
    filters.accumulated_activity = accumulatedActivity;
  }

  if (form.pending_removal === "true" || form.pending_removal === "false") {
    filters.pending_removal = form.pending_removal === "true";
  }

  return filters;
}

function intentFormToFilters(
  form: DepositBonusIntentFilterFormState,
  sortBy: DepositBonusIntentSortBy,
  sortDirection: BonusListSortDirection,
): DepositBonusIntentListFilters {
  const filters: DepositBonusIntentListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const createdAt = form.created_at.trim();
  if (createdAt) {
    filters.created_at = createdAt;
  }

  const accountId = form.account_id.trim();
  if (accountId) {
    filters.account_id = accountId;
  }

  const userId = form.user_id.trim();
  if (userId) {
    filters.user_id = userId;
  }

  const userName = form.user_name.trim();
  if (userName) {
    filters.user_name = userName;
  }

  const userEmail = form.user_email.trim();
  if (userEmail) {
    filters.user_email = userEmail;
  }

  if (form.status) {
    filters.status = form.status;
  }

  const bonusAssignmentId = form.bonus_assignment_id.trim();
  if (bonusAssignmentId) {
    filters.bonus_assignment_id = bonusAssignmentId;
  }

  const lastEvaluatedAt = form.last_evaluated_at.trim();
  if (lastEvaluatedAt) {
    filters.last_evaluated_at = lastEvaluatedAt;
  }

  const cancellationReason = form.cancellation_reason.trim();
  if (cancellationReason) {
    filters.cancellation_reason = cancellationReason;
  }

  return filters;
}

type ColumnSortHeadProps<T extends string> = {
  label: string;
  sortKey: T;
  activeSortBy: T;
  activeDirection: BonusListSortDirection;
  onSort: (sortKey: T) => void;
  disabled?: boolean;
};

function ColumnSortHead<T extends string>({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
}: ColumnSortHeadProps<T>) {
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

export function BonusAssignmentLogsView() {
  const [activeTab, setActiveTab] = useState<BonusLogsTab>("assignments");

  const [assignments, setAssignments] = useState<BonusAssignment[]>([]);
  const [intents, setIntents] = useState<DepositBonusIntent[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [cancelAssignment, setCancelAssignment] = useState<BonusAssignment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [assignmentDraft, setAssignmentDraft] =
    useState<BonusAssignmentFilterFormState>(EMPTY_BONUS_ASSIGNMENT_FILTERS);
  const [assignmentFilters, setAssignmentFilters] =
    useState<BonusAssignmentListFilters>({
      sort_by: "created_at",
      sort_direction: "desc",
    });
  const [assignmentSortBy, setAssignmentSortBy] =
    useState<BonusAssignmentSortBy>("created_at");
  const [assignmentSortDirection, setAssignmentSortDirection] =
    useState<BonusListSortDirection>("desc");

  const [intentDraft, setIntentDraft] =
    useState<DepositBonusIntentFilterFormState>(
      EMPTY_DEPOSIT_BONUS_INTENT_FILTERS,
    );
  const [intentFilters, setIntentFilters] =
    useState<DepositBonusIntentListFilters>({
      sort_by: "created_at",
      sort_direction: "desc",
    });
  const [intentSortBy, setIntentSortBy] =
    useState<DepositBonusIntentSortBy>("created_at");
  const [intentSortDirection, setIntentSortDirection] =
    useState<BonusListSortDirection>("desc");

  const loadAssignments = useCallback(
    async (requestedPage: number, filters: BonusAssignmentListFilters) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listBonusAssignments({
          ...filters,
          page: requestedPage,
          per_page: 15,
        });

        setAssignments(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setAssignments([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadIntents = useCallback(
    async (requestedPage: number, filters: DepositBonusIntentListFilters) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listDepositBonusIntents({
          ...filters,
          page: requestedPage,
          per_page: 15,
        });

        setIntents(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setIntents([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    setError(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "assignments") {
      void loadAssignments(page, assignmentFilters);
      return;
    }

    void loadIntents(page, intentFilters);
  }, [
    activeTab,
    assignmentFilters,
    intentFilters,
    loadAssignments,
    loadIntents,
    page,
  ]);

  function commitAssignmentFilters(
    form: BonusAssignmentFilterFormState,
    nextSortBy: BonusAssignmentSortBy,
    nextSortDirection: BonusListSortDirection,
  ) {
    setPage(1);
    setAssignmentFilters(
      assignmentFormToFilters(form, nextSortBy, nextSortDirection),
    );
  }

  function commitIntentFilters(
    form: DepositBonusIntentFilterFormState,
    nextSortBy: DepositBonusIntentSortBy,
    nextSortDirection: BonusListSortDirection,
  ) {
    setPage(1);
    setIntentFilters(intentFormToFilters(form, nextSortBy, nextSortDirection));
  }

  function patchAssignmentDraft(
    patch: Partial<BonusAssignmentFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...assignmentDraft, ...patch };
    setAssignmentDraft(next);
    if (options?.apply) {
      commitAssignmentFilters(
        next,
        assignmentSortBy,
        assignmentSortDirection,
      );
    }
  }

  function patchIntentDraft(
    patch: Partial<DepositBonusIntentFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...intentDraft, ...patch };
    setIntentDraft(next);
    if (options?.apply) {
      commitIntentFilters(next, intentSortBy, intentSortDirection);
    }
  }

  function onAssignmentFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      commitAssignmentFilters(
        assignmentDraft,
        assignmentSortBy,
        assignmentSortDirection,
      );
    }
  }

  function onIntentFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      commitIntentFilters(intentDraft, intentSortBy, intentSortDirection);
    }
  }

  function toggleAssignmentSort(column: BonusAssignmentSortBy) {
    let nextDirection: BonusListSortDirection = "asc";
    if (assignmentSortBy === column) {
      nextDirection = assignmentSortDirection === "asc" ? "desc" : "asc";
    }

    setAssignmentSortBy(column);
    setAssignmentSortDirection(nextDirection);
    commitAssignmentFilters(assignmentDraft, column, nextDirection);
  }

  function toggleIntentSort(column: DepositBonusIntentSortBy) {
    let nextDirection: BonusListSortDirection = "asc";
    if (intentSortBy === column) {
      nextDirection = intentSortDirection === "asc" ? "desc" : "asc";
    }

    setIntentSortBy(column);
    setIntentSortDirection(nextDirection);
    commitIntentFilters(intentDraft, column, nextDirection);
  }

  function clearFilters() {
    if (activeTab === "assignments") {
      setAssignmentDraft(EMPTY_BONUS_ASSIGNMENT_FILTERS);
      setAssignmentSortBy("created_at");
      setAssignmentSortDirection("desc");
      commitAssignmentFilters(
        EMPTY_BONUS_ASSIGNMENT_FILTERS,
        "created_at",
        "desc",
      );
      return;
    }

    setIntentDraft(EMPTY_DEPOSIT_BONUS_INTENT_FILTERS);
    setIntentSortBy("created_at");
    setIntentSortDirection("desc");
    commitIntentFilters(EMPTY_DEPOSIT_BONUS_INTENT_FILTERS, "created_at", "desc");
  }

  function refresh() {
    if (activeTab === "assignments") {
      void loadAssignments(page, assignmentFilters);
      return;
    }

    void loadIntents(page, intentFilters);
  }

  function openAssignmentDetail(assignmentId: string) {
    setSelectedAssignmentId(assignmentId);
    setDetailOpen(true);
  }

  function openCancelAssignment(assignment: BonusAssignment) {
    setCancelAssignment(assignment);
    setCancelDialogOpen(true);
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
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
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCwIcon className={cn(loading && "animate-spin")} />
          Refresh
        </Button>
      </PageContentToolbar>

      <div className="flex flex-wrap gap-2">
        {logsTabs.map((tab) => (
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
          title={
            activeTab === "assignments"
              ? "Could not load bonus assignments"
              : "Could not load deposit bonus intents"
          }
          message={error}
        />
      ) : null}

      {activeTab === "assignments" ? (
        <AssignmentsTable
          loading={loading}
          assignments={assignments}
          draft={assignmentDraft}
          sortBy={assignmentSortBy}
          sortDirection={assignmentSortDirection}
          onPatchDraft={patchAssignmentDraft}
          onFilterEnter={onAssignmentFilterEnter}
          onSort={toggleAssignmentSort}
          onOpenDetail={openAssignmentDetail}
          onCancel={openCancelAssignment}
        />
      ) : (
        <DepositIntentsTable
          loading={loading}
          intents={intents}
          draft={intentDraft}
          sortBy={intentSortBy}
          sortDirection={intentSortDirection}
          onPatchDraft={patchIntentDraft}
          onFilterEnter={onIntentFilterEnter}
          onSort={toggleIntentSort}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Page {pagination?.current_page ?? page} of {totalPages}
          {pagination?.total != null ? ` · ${pagination.total} records` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <BonusAssignmentDetailDialog
        assignmentId={selectedAssignmentId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedAssignmentId(null);
          }
        }}
      />
      <CancelBonusAssignmentDialog
        assignment={cancelAssignment}
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setCancelAssignment(null);
        }}
        onSuccess={refresh}
      />
    </div>
  );
}

function AssignmentsTable({
  loading,
  assignments,
  draft,
  sortBy,
  sortDirection,
  onPatchDraft,
  onFilterEnter,
  onSort,
  onOpenDetail,
  onCancel,
}: {
  loading: boolean;
  assignments: BonusAssignment[];
  draft: BonusAssignmentFilterFormState;
  sortBy: BonusAssignmentSortBy;
  sortDirection: BonusListSortDirection;
  onPatchDraft: (
    patch: Partial<BonusAssignmentFilterFormState>,
    options?: { apply?: boolean },
  ) => void;
  onFilterEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSort: (sortKey: BonusAssignmentSortBy) => void;
  onOpenDetail: (assignmentId: string) => void;
  onCancel: (assignment: BonusAssignment) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Created"
                sortKey="created_at"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Date… (Enter)"
                value={draft.created_at}
                onChange={(event) =>
                  onPatchDraft({ created_at: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Offer"
                sortKey="offer_name"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Name… (Enter)"
                value={draft.offer_name}
                onChange={(event) =>
                  onPatchDraft({ offer_name: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Account"
                sortKey="account_id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="UUID… (Enter)"
                value={draft.account_id}
                onChange={(event) =>
                  onPatchDraft({ account_id: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[120px] align-bottom">
              <ColumnSortHead
                label="Platform"
                sortKey="platform"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Platform… (Enter)"
                value={draft.platform}
                onChange={(event) => onPatchDraft({ platform: event.target.value })}
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[150px] align-bottom">
              <ColumnSortHead
                label="External trader ID"
                sortKey="external_trader_id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="Trader ID… (Enter)"
                value={draft.external_trader_id}
                onChange={(event) => onPatchDraft({ external_trader_id: event.target.value })}
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[150px] align-bottom">
              <ColumnSortHead
                label="User ID"
                sortKey="user.id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="UUID… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_id}
                onChange={(event) =>
                  onPatchDraft({ user_id: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="User name"
                sortKey="user.name"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Name… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_name}
                onChange={(event) =>
                  onPatchDraft({ user_name: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[160px] align-bottom">
              <ColumnSortHead
                label="User email"
                sortKey="user.email"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Email… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_email}
                onChange={(event) =>
                  onPatchDraft({ user_email: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[110px] align-bottom">
              <ColumnSortHead
                label="Credited"
                sortKey="credited_amount"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Amount… (Enter)"
                value={draft.credited_amount}
                onChange={(event) =>
                  onPatchDraft({ credited_amount: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[110px] align-bottom">
              Deposit
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Status"
                sortKey="status"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Select
                value={draft.status || "all"}
                onValueChange={(value) =>
                  onPatchDraft(
                    {
                      status:
                        value === "all"
                          ? ""
                          : (value as BonusAssignmentStatus),
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
                  {BONUS_ASSIGNMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Activated"
                sortKey="activated_at"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Date… (Enter)"
                value={draft.activated_at}
                onChange={(event) =>
                  onPatchDraft({ activated_at: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[150px] align-bottom">
              <ColumnSortHead
                label="Conversion deadline"
                sortKey="conversion_deadline_at"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Date… (Enter)"
                value={draft.conversion_deadline_at}
                onChange={(event) =>
                  onPatchDraft({ conversion_deadline_at: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[120px] align-bottom">
              <ColumnSortHead
                label="Activity"
                sortKey="accumulated_activity"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Value… (Enter)"
                value={draft.accumulated_activity}
                onChange={(event) =>
                  onPatchDraft({ accumulated_activity: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[130px] align-bottom">
              <ColumnSortHead
                label="Pending removal"
                sortKey="pending_removal"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Select
                value={draft.pending_removal || "all"}
                onValueChange={(value) =>
                  onPatchDraft(
                    {
                      pending_removal:
                        value === "all" ? "" : (value as "true" | "false"),
                    },
                    { apply: true },
                  )
                }
              >
                <SelectTrigger className="mt-1.5 h-8 w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="w-[1%] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`assignment-skeleton-${index}`}>
                  {Array.from({ length: 17 }).map((__, cellIndex) => (
                    <TableCell
                      key={`assignment-skeleton-${index}-${cellIndex}`}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && assignments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={17}
                className="text-center text-muted-foreground"
              >
                No bonus assignments found.
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? assignments.map((assignment) => {
                const owner = resolveBonusOwner(assignment);
                const tradingAccount = assignment.trading_account;

                return (
                <TableRow key={assignment.id}>
                  <TableCell>
                    {formatDateTimeValue(assignment.created_at)}
                  </TableCell>
                  <TableCell>
                    {bonusAssignmentOfferLabel(assignment)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tradingAccount?.id
                      ? truncateId(tradingAccount.id)
                      : assignment.account_id ?? "\u2014"}
                  </TableCell>
                  <TableCell>{tradingAccount?.platform.name ?? "\u2014"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {tradingAccount?.external_trader_id ?? "\u2014"}
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-xs text-muted-foreground"
                      title={owner.id}
                    >
                      {owner.id ? abbreviateUuid(owner.id) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {owner.name?.trim() ? owner.name : "—"}
                  </TableCell>
                  <TableCell>
                    {owner.email?.trim() ? owner.email : "—"}
                  </TableCell>
                  <TableCell>
                    {formatMoneyValue(assignment.credited_amount)}
                  </TableCell>
                  <TableCell>
                    {assignment.deposit_amount
                      ? formatMoneyValue(assignment.deposit_amount.major_units)
                      : "â€”"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={bonusAssignmentStatusVariant(assignment.status)}
                    >
                      {bonusAssignmentStatusLabel(assignment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {formatProgressPercent(assignment.progress_ratio)}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(assignment.activated_at)}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(assignment.conversion_deadline_at)}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {formatActivityProgress(
                      assignment.accumulated_activity,
                      assignment.required_activity,
                    )}
                  </TableCell>
                  <TableCell>
                    {assignment.pending_removal ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => onOpenDetail(assignment.id)}>View</Button>
                      {(["queued", "active", "pending_removal"] as BonusAssignmentStatus[]).includes(assignment.status) ? (
                        <Button type="button" variant="destructive" size="sm" onClick={() => onCancel(assignment)}>Cancel</Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
    </div>
  );
}

function DepositIntentsTable({
  loading,
  intents,
  draft,
  sortBy,
  sortDirection,
  onPatchDraft,
  onFilterEnter,
  onSort,
}: {
  loading: boolean;
  intents: DepositBonusIntent[];
  draft: DepositBonusIntentFilterFormState;
  sortBy: DepositBonusIntentSortBy;
  sortDirection: BonusListSortDirection;
  onPatchDraft: (
    patch: Partial<DepositBonusIntentFilterFormState>,
    options?: { apply?: boolean },
  ) => void;
  onFilterEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSort: (sortKey: DepositBonusIntentSortBy) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Created"
                sortKey="created_at"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Date… (Enter)"
                value={draft.created_at}
                onChange={(event) =>
                  onPatchDraft({ created_at: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Account"
                sortKey="account_id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="UUID… (Enter)"
                value={draft.account_id}
                onChange={(event) =>
                  onPatchDraft({ account_id: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[150px] align-bottom">
              <ColumnSortHead
                label="User ID"
                sortKey="user.id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="UUID… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_id}
                onChange={(event) =>
                  onPatchDraft({ user_id: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="User name"
                sortKey="user.name"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Name… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_name}
                onChange={(event) =>
                  onPatchDraft({ user_name: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[160px] align-bottom">
              <ColumnSortHead
                label="User email"
                sortKey="user.email"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Email… (Enter)"
                title="Press Enter to apply filter"
                value={draft.user_email}
                onChange={(event) =>
                  onPatchDraft({ user_email: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Status"
                sortKey="status"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Select
                value={draft.status || "all"}
                onValueChange={(value) =>
                  onPatchDraft(
                    {
                      status:
                        value === "all"
                          ? ""
                          : (value as DepositBonusIntentStatus),
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
                  {DEPOSIT_BONUS_INTENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="min-w-[140px] align-bottom">
              <ColumnSortHead
                label="Assignment"
                sortKey="bonus_assignment_id"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8 font-mono text-xs"
                placeholder="UUID… (Enter)"
                value={draft.bonus_assignment_id}
                onChange={(event) =>
                  onPatchDraft({ bonus_assignment_id: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[150px] align-bottom">
              <ColumnSortHead
                label="Last evaluated"
                sortKey="last_evaluated_at"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Date… (Enter)"
                value={draft.last_evaluated_at}
                onChange={(event) =>
                  onPatchDraft({ last_evaluated_at: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
            <TableHead className="min-w-[160px] align-bottom">
              <ColumnSortHead
                label="Cancellation reason"
                sortKey="cancellation_reason"
                activeSortBy={sortBy}
                activeDirection={sortDirection}
                onSort={onSort}
                disabled={loading}
              />
              <Input
                className="mt-1.5 h-8"
                placeholder="Reason… (Enter)"
                value={draft.cancellation_reason}
                onChange={(event) =>
                  onPatchDraft({ cancellation_reason: event.target.value })
                }
                onKeyDown={onFilterEnter}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`intent-skeleton-${index}`}>
                  {Array.from({ length: 9 }).map((__, cellIndex) => (
                    <TableCell key={`intent-skeleton-${index}-${cellIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && intents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-muted-foreground"
              >
                No deposit bonus intents found.
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? intents.map((intent) => {
                const owner = resolveBonusOwner(intent);

                return (
                <TableRow key={intent.id}>
                  <TableCell>
                    {formatDateTimeValue(intent.created_at)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateId(intent.account_id)}
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-xs text-muted-foreground"
                      title={owner.id}
                    >
                      {owner.id ? abbreviateUuid(owner.id) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {owner.name?.trim() ? owner.name : "—"}
                  </TableCell>
                  <TableCell>
                    {owner.email?.trim() ? owner.email : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={depositBonusIntentStatusVariant(intent.status)}
                    >
                      {depositBonusIntentStatusLabel(intent.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {intent.bonus_assignment_id
                      ? truncateId(intent.bonus_assignment_id)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(intent.last_evaluated_at)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {intent.cancellation_reason ?? "—"}
                  </TableCell>
                </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
