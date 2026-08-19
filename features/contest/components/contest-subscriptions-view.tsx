"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BanIcon,
  FilterXIcon,
  ShieldBanIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { listContestParticipants, listContests } from "@/features/contest/api";
import { ContestBansDialog } from "@/features/contest/components/contest-bans-dialog";
import { ContestSubscriptionBanDialog } from "@/features/contest/components/contest-subscription-ban-dialog";
import {
  formatContestDateTime,
  formatDecimalValue,
  formatMinorUnits,
  formatPerformanceIndex,
  getContestStatusBadgeVariant,
} from "@/features/contest/format";
import {
  CONTEST_STATUSES,
  EMPTY_CONTEST_PARTICIPANT_FILTERS,
  resolveContestSubscriptionOwner,
  type Contest,
  type ContestParticipantFilterFormState,
  type ContestParticipantListFilters,
  type ContestParticipantSortBy,
  type ContestParticipantSortDirection,
  type ContestStatus,
  type ContestSubscription,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const subscriptionsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", href: "/contests" },
  { label: "Subscriptions", current: true },
];

const ALL_CONTESTS_VALUE = "__all__";
const ALL_STATUSES_VALUE = "__all_statuses__";
const TABLE_COLUMN_COUNT = 13;

const statusLabels = Object.fromEntries(
  CONTEST_STATUSES.map((option) => [option.value, option.label]),
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
  form: ContestParticipantFilterFormState,
  sortBy: ContestParticipantSortBy,
  sortDirection: ContestParticipantSortDirection,
): ContestParticipantListFilters {
  const filters: ContestParticipantListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const contestId = form.contest_id.trim();
  const contestName = form.contest_name.trim();
  const contestStatus = form.contest_status.trim();
  const userId = form.user_id.trim();
  const userName = form.user_name.trim();
  const userEmail = form.user_email.trim();
  const traderId = form.external_trader_id.trim();

  if (contestId) {
    filters.contest_id = contestId;
  }
  if (contestName) {
    filters.contest_name = contestName;
  }
  if (contestStatus) {
    filters.contest_status = contestStatus as ContestStatus;
  }
  if (userId) {
    filters.user_id = userId;
  }
  if (userName) {
    filters.user_name = userName;
  }
  if (userEmail) {
    filters.user_email = userEmail;
  }
  if (traderId) {
    filters.external_trader_id = traderId;
  }

  const performanceIndex = parseOptionalNumber(form.performance_index);
  if (performanceIndex !== undefined) {
    filters.performance_index = performanceIndex;
  }

  const balanceSnapshot = parseOptionalNumber(form.balance_snapshot);
  if (balanceSnapshot !== undefined) {
    filters.balance_snapshot = balanceSnapshot;
  }

  const entryFee = parseOptionalNumber(form.entry_fee_charged);
  if (entryFee !== undefined) {
    filters.entry_fee_charged = entryFee;
  }

  return filters;
}

function abbreviateUuid(value: string): string {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…`;
}

type ColumnSortHeadProps = {
  label: string;
  sortKey: ContestParticipantSortBy;
  activeSortBy: ContestParticipantSortBy;
  activeDirection: ContestParticipantSortDirection;
  onSort: (sortKey: ContestParticipantSortBy) => void;
  disabled?: boolean;
  className?: string;
};

function ColumnSortHead({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
  className,
}: ColumnSortHeadProps) {
  const isActive = activeSortBy === sortKey;

  return (
    <div className={cn("flex items-center gap-1", className)}>
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

type ContestSubscriptionsViewProps = {
  initialContestId?: string;
};

export function ContestSubscriptionsView({
  initialContestId,
}: ContestSubscriptionsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestIdFromUrl = searchParams.get("contestId") ?? initialContestId ?? "";

  const [contests, setContests] = useState<Contest[]>([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState(contestIdFromUrl);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const [subscriptions, setSubscriptions] = useState<ContestSubscription[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<ContestParticipantFilterFormState>(EMPTY_CONTEST_PARTICIPANT_FILTERS);
  const [sortBy, setSortBy] =
    useState<ContestParticipantSortBy>("performance_index");
  const [sortDirection, setSortDirection] =
    useState<ContestParticipantSortDirection>("desc");
  const [appliedFilters, setAppliedFilters] =
    useState<ContestParticipantListFilters>(
      formToAppliedFilters(
        EMPTY_CONTEST_PARTICIPANT_FILTERS,
        "performance_index",
        "desc",
      ),
    );

  const [banOpen, setBanOpen] = useState(false);
  const [subscriptionToBan, setSubscriptionToBan] =
    useState<ContestSubscription | null>(null);

  const [bansOpen, setBansOpen] = useState(false);

  const loadContests = useCallback(async () => {
    setContestsLoading(true);
    setError(null);

    try {
      const response = await listContests({ per_page: 100 });
      setContests(response.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setContests([]);
    } finally {
      setContestsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContests();
  }, [loadContests]);

  useEffect(() => {
    if (contestIdFromUrl) {
      setSelectedContestId(contestIdFromUrl);
      setPage(1);
    }
  }, [contestIdFromUrl]);

  useEffect(() => {
    setSelectedContest(
      contests.find((contest) => contest.id === selectedContestId) ?? null,
    );
  }, [contests, selectedContestId]);

  const loadSubscriptions = useCallback(
    async (
      contestId: string,
      requestedPage: number,
      filters: ContestParticipantListFilters,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContestParticipants({
          ...filters,
          ...(contestId ? { contest_id: contestId } : {}),
          page: requestedPage,
          per_page: 15,
        });

        setSubscriptions(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSubscriptions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadSubscriptions(selectedContestId, page, appliedFilters);
  }, [loadSubscriptions, selectedContestId, page, appliedFilters]);

  const contestOptions = useMemo(() => {
    return [...contests].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [contests]);

  function handleContestChange(contestId: string) {
    const nextContestId = contestId === ALL_CONTESTS_VALUE ? "" : contestId;

    setSelectedContestId(nextContestId);
    setPage(1);
    setDraftFilters(EMPTY_CONTEST_PARTICIPANT_FILTERS);
    setSortBy("performance_index");
    setSortDirection("desc");
    setAppliedFilters(
      formToAppliedFilters(
        EMPTY_CONTEST_PARTICIPANT_FILTERS,
        "performance_index",
        "desc",
      ),
    );

    if (nextContestId) {
      router.replace(`/contest-subscriptions?contestId=${nextContestId}`);
      return;
    }

    router.replace("/contest-subscriptions");
  }

  function commitFilters(
    form: ContestParticipantFilterFormState,
    nextSortBy = sortBy,
    nextDirection = sortDirection,
  ) {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(form, nextSortBy, nextDirection));
  }

  function applyFiltersFromDraft() {
    commitFilters(draftFilters);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_CONTEST_PARTICIPANT_FILTERS);
    setSortBy("performance_index");
    setSortDirection("desc");
    commitFilters(EMPTY_CONTEST_PARTICIPANT_FILTERS, "performance_index", "desc");
  }

  function toggleSort(column: ContestParticipantSortBy) {
    let nextDirection: ContestParticipantSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function patchDraft(patch: Partial<ContestParticipantFilterFormState>) {
    setDraftFilters((current) => ({ ...current, ...patch }));
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFiltersFromDraft();
    }
  }

  function openBanDialog(subscription: ContestSubscription) {
    setSubscriptionToBan(subscription);
    setBanOpen(true);
  }

  function handleMutationSuccess() {
    void loadContests();
    void loadSubscriptions(selectedContestId, page, appliedFilters);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={subscriptionsBreadcrumbs}
        backHref="/contests"
        backLabel="Ir atrás"
      >
        {selectedContest ? (
          <Button
            variant="outline"
            onClick={() => setBansOpen(true)}
            disabled={contestsLoading}
          >
            <ShieldBanIcon />
            View exclusions
          </Button>
        ) : null}
      </PageContentToolbar>

      <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="contest-subscription-filter">Contest</Label>
          <Select
            value={selectedContestId || ALL_CONTESTS_VALUE}
            onValueChange={(value) =>
              handleContestChange(value ?? ALL_CONTESTS_VALUE)
            }
            disabled={contestsLoading}
          >
            <SelectTrigger id="contest-subscription-filter" className="w-full">
              <SelectValue placeholder="All contests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CONTESTS_VALUE}>
                All contests
              </SelectItem>
              {contestOptions.map((contest) => (
                <SelectItem key={contest.id} value={contest.id}>
                  {contest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-1">
            {selectedContest ? (
              <>
                <Badge variant={getContestStatusBadgeVariant(selectedContest.status)}>
                  {statusLabels[selectedContest.status] ?? selectedContest.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedContest.subscriptions_count ?? 0} active subscriptions
                </span>
              </>
            ) : pagination ? (
              <span className="text-sm text-muted-foreground">
                {pagination.total} active subscriptions
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={loading}
            >
              <FilterXIcon />
              Clear filters
            </Button>
          </div>
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load subscriptions" message={error} />
      ) : null}

      <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Contest ID"
                      sortKey="contest.id"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Filter ID"
                      value={
                        selectedContestId || draftFilters.contest_id
                      }
                      onChange={(event) =>
                        patchDraft({ contest_id: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading || Boolean(selectedContestId)}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[150px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Contest"
                      sortKey="contest.name"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Filter name"
                      value={draftFilters.contest_name}
                      onChange={(event) =>
                        patchDraft({ contest_name: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Contest status"
                      sortKey="contest.status"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Select
                      value={draftFilters.contest_status || ALL_STATUSES_VALUE}
                      onValueChange={(value) => {
                        const nextStatus =
                          value === ALL_STATUSES_VALUE
                            ? ""
                            : (value as ContestStatus);
                        const nextForm = {
                          ...draftFilters,
                          contest_status: nextStatus,
                        };
                        setDraftFilters(nextForm as ContestParticipantFilterFormState);
                        commitFilters(nextForm as ContestParticipantFilterFormState);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_STATUSES_VALUE}>
                          All statuses
                        </SelectItem>
                        {CONTEST_STATUSES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="User ID"
                      sortKey="user.id"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Filter ID"
                      value={draftFilters.user_id}
                      onChange={(event) =>
                        patchDraft({ user_id: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="User name"
                      sortKey="user.name"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Filter name"
                      value={draftFilters.user_name}
                      onChange={(event) =>
                        patchDraft({ user_name: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[150px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="User email"
                      sortKey="user.email"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Filter email"
                      value={draftFilters.user_email}
                      onChange={(event) =>
                        patchDraft({ user_email: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium">Trader ID</span>
                    <Input
                      className="h-8"
                      placeholder="Filter trader"
                      value={draftFilters.external_trader_id}
                      onChange={(event) =>
                        patchDraft({ external_trader_id: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[120px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Performance"
                      sortKey="performance_index"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Exact"
                      value={draftFilters.performance_index}
                      onChange={(event) =>
                        patchDraft({ performance_index: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[140px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Balance snapshot"
                      sortKey="balance_snapshot"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Exact"
                      value={draftFilters.balance_snapshot}
                      onChange={(event) =>
                        patchDraft({ balance_snapshot: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[120px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium">Current equity</span>
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[120px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Entry fee"
                      sortKey="entry_fee_charged"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                    <Input
                      className="h-8"
                      placeholder="Exact"
                      value={draftFilters.entry_fee_charged}
                      onChange={(event) =>
                        patchDraft({ entry_fee_charged: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto min-w-[130px] align-bottom whitespace-normal">
                  <div className="flex flex-col gap-1.5">
                    <ColumnSortHead
                      label="Subscribed at"
                      sortKey="subscribed_at"
                      activeSortBy={sortBy}
                      activeDirection={sortDirection}
                      onSort={toggleSort}
                      disabled={loading}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-auto w-[72px] align-bottom text-right">
                  Actions
                </TableHead>
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

              {!loading && subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_COLUMN_COUNT}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No active subscriptions.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading
                ? subscriptions.map((subscription) => {
                    const owner = resolveContestSubscriptionOwner(subscription);
                    const rowContest =
                      contests.find(
                        (contest) => contest.id === subscription.contest_id,
                      ) ?? selectedContest;
                    const contestStatus =
                      subscription.contest?.status ?? rowContest?.status;

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell
                          className="font-medium"
                          title={subscription.contest?.id ?? subscription.contest_id}
                        >
                          {abbreviateUuid(
                            subscription.contest?.id ?? subscription.contest_id,
                          )}
                        </TableCell>
                        <TableCell>
                          {subscription.contest?.name ?? rowContest?.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          {contestStatus ? (
                            <Badge
                              variant={getContestStatusBadgeVariant(contestStatus)}
                            >
                              {statusLabels[contestStatus] ?? contestStatus}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          title={owner.id || undefined}
                        >
                          {owner.id ? abbreviateUuid(owner.id) : "—"}
                        </TableCell>
                        <TableCell>{owner.name || "—"}</TableCell>
                        <TableCell>{owner.email || "—"}</TableCell>
                        <TableCell>
                          {subscription.account?.external_trader_id ?? "—"}
                        </TableCell>
                        <TableCell>
                          {formatPerformanceIndex(
                            subscription.performance_index,
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDecimalValue(subscription.balance_snapshot)}
                        </TableCell>
                        <TableCell>
                          {formatDecimalValue(
                            subscription.account?.current_equity,
                          )}
                        </TableCell>
                        <TableCell>
                          {formatMinorUnits(
                            subscription.entry_fee_charged ?? 0,
                            rowContest?.server_group?.currency,
                            rowContest?.server_group?.currency_precision,
                          )}
                        </TableCell>
                        <TableCell>
                          {formatContestDateTime(subscription.subscribed_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Exclude ${owner.name || owner.id}`}
                            onClick={() => openBanDialog(subscription)}
                          >
                            <BanIcon />
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

      <ContestSubscriptionBanDialog
        contest={selectedContest}
        subscription={subscriptionToBan}
        open={banOpen}
        onOpenChange={setBanOpen}
        onSuccess={handleMutationSuccess}
      />

      <ContestBansDialog
        contest={selectedContest}
        open={bansOpen}
        onOpenChange={setBansOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
