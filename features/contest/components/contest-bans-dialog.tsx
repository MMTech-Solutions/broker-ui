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
  Undo2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { listContestBans, revertContestBan } from "@/features/contest/api";
import { formatContestDateTime } from "@/features/contest/format";
import {
  EMPTY_CONTEST_BAN_FILTERS,
  resolveContestBanOwner,
  type Contest,
  type ContestBan,
  type ContestBanFilterFormState,
  type ContestBanListFilters,
  type ContestBanSortBy,
  type ContestBanSortDirection,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const TABLE_COLUMN_COUNT = 8;
const ALL_STATUS_VALUE = "all";

function formToAppliedFilters(
  form: ContestBanFilterFormState,
  sortBy: ContestBanSortBy,
  sortDirection: ContestBanSortDirection,
): ContestBanListFilters {
  const filters: ContestBanListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const userId = form.user_id.trim();
  const userName = form.user_name.trim();
  const userEmail = form.user_email.trim();
  const traderId = form.external_trader_id.trim();
  const reason = form.reason.trim();

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
  if (reason) {
    filters.reason = reason;
  }
  if (form.is_active === "true" || form.is_active === "false") {
    filters.is_active = form.is_active === "true";
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
  sortKey: ContestBanSortBy;
  activeSortBy: ContestBanSortBy;
  activeDirection: ContestBanSortDirection;
  onSort: (sortKey: ContestBanSortBy) => void;
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

type ContestBansDialogProps = {
  contest: Contest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ContestBansDialog({
  contest,
  open,
  onOpenChange,
  onSuccess,
}: ContestBansDialogProps) {
  const [bans, setBans] = useState<ContestBan[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revertingBanId, setRevertingBanId] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<ContestBanFilterFormState>(EMPTY_CONTEST_BAN_FILTERS);
  const [sortBy, setSortBy] = useState<ContestBanSortBy>("banned_at");
  const [sortDirection, setSortDirection] =
    useState<ContestBanSortDirection>("desc");
  const [appliedFilters, setAppliedFilters] = useState<ContestBanListFilters>(
    formToAppliedFilters(EMPTY_CONTEST_BAN_FILTERS, "banned_at", "desc"),
  );

  const loadBans = useCallback(
    async (
      contestId: string,
      requestedPage: number,
      filters: ContestBanListFilters,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContestBans(contestId, {
          ...filters,
          page: requestedPage,
          per_page: 15,
        });

        setBans(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setBans([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (open && contest) {
      void loadBans(contest.id, page, appliedFilters);
    }
  }, [open, contest, page, appliedFilters, loadBans]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setActionError(null);
      setDraftFilters(EMPTY_CONTEST_BAN_FILTERS);
      setSortBy("banned_at");
      setSortDirection("desc");
      setAppliedFilters(
        formToAppliedFilters(EMPTY_CONTEST_BAN_FILTERS, "banned_at", "desc"),
      );
    }
  }, [open]);

  function commitFilters(
    form: ContestBanFilterFormState,
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
    setDraftFilters(EMPTY_CONTEST_BAN_FILTERS);
    setSortBy("banned_at");
    setSortDirection("desc");
    commitFilters(EMPTY_CONTEST_BAN_FILTERS, "banned_at", "desc");
  }

  function toggleSort(column: ContestBanSortBy) {
    let nextDirection: ContestBanSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function patchDraft(
    patch: Partial<ContestBanFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...draftFilters, ...patch };
    setDraftFilters(next);
    if (options?.apply) {
      commitFilters(next);
    }
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFiltersFromDraft();
    }
  }

  async function handleRevert(ban: ContestBan) {
    if (!contest || !ban.is_active) {
      return;
    }

    setRevertingBanId(ban.id);
    setActionError(null);

    try {
      await revertContestBan(contest.id, ban.id);
      await loadBans(contest.id, page, appliedFilters);
      onSuccess();
    } catch (revertError) {
      setActionError(formatBrokerApiError(revertError));
    } finally {
      setRevertingBanId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-6xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Contest exclusions</DialogTitle>
          <DialogDescription>
            Banned participants for{" "}
            <span className="font-medium text-foreground">
              {contest?.name}
            </span>
            . Reverting a ban allows the user to subscribe again.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-4">
          <div className="mb-3 flex justify-end">
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

          {error ? (
            <ApiErrorAlert title="Could not load exclusions" message={error} />
          ) : null}

          {actionError ? (
            <ApiErrorAlert title="Could not revert ban" message={actionError} />
          ) : null}

          <div className={cn("rounded-xl border")}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                  <TableHead className="h-auto min-w-[160px] align-bottom whitespace-normal">
                    <div className="flex flex-col gap-1.5">
                      <ColumnSortHead
                        label="Reason"
                        sortKey="reason"
                        activeSortBy={sortBy}
                        activeDirection={sortDirection}
                        onSort={toggleSort}
                        disabled={loading}
                      />
                      <Input
                        className="h-8"
                        placeholder="Filter reason"
                        value={draftFilters.reason}
                        onChange={(event) =>
                          patchDraft({ reason: event.target.value })
                        }
                        onKeyDown={onFilterEnter}
                        disabled={loading}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-auto min-w-[120px] align-bottom whitespace-normal">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium">Status</span>
                      <Select
                        value={draftFilters.is_active || ALL_STATUS_VALUE}
                        onValueChange={(value) =>
                          patchDraft(
                            {
                              is_active:
                                value === ALL_STATUS_VALUE
                                  ? ""
                                  : value === "true" || value === "false"
                                    ? value
                                    : "",
                            },
                            { apply: true },
                          )
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_STATUS_VALUE}>All</SelectItem>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Reverted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  <TableHead className="h-auto min-w-[120px] align-bottom whitespace-normal">
                    <div className="flex flex-col gap-1.5">
                      <ColumnSortHead
                        label="Banned at"
                        sortKey="banned_at"
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
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={TABLE_COLUMN_COUNT}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && bans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No exclusions recorded.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? bans.map((ban) => {
                      const owner = resolveContestBanOwner(ban);

                      return (
                        <TableRow key={ban.id}>
                          <TableCell
                            className="font-medium"
                            title={owner.id || undefined}
                          >
                            {owner.id ? abbreviateUuid(owner.id) : "—"}
                          </TableCell>
                          <TableCell>{owner.name || "—"}</TableCell>
                          <TableCell>{owner.email || "—"}</TableCell>
                          <TableCell>
                            {ban.account?.external_trader_id ?? "—"}
                          </TableCell>
                          <TableCell className="max-w-[240px] truncate">
                            {ban.reason}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ban.is_active ? "destructive" : "secondary"
                              }
                            >
                              {ban.is_active ? "Active" : "Reverted"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatContestDateTime(ban.banned_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            {ban.is_active ? (
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip={`Revert ban for ${owner.name || owner.id}`}
                                disabled={revertingBanId === ban.id}
                                onClick={() => void handleRevert(ban)}
                              >
                                <Undo2Icon />
                              </ActionTooltipButton>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination && pagination.last_page > 1 ? (
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm text-muted-foreground">
              Page {pagination.current_page} of {pagination.last_page}
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

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
