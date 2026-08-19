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
  CheckIcon,
  FilterXIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
  AccountInsuranceApproveDialog,
  AccountInsuranceRejectDialog,
} from "@/features/insurance/components/account-insurance-claim-dialogs";
import {
  ACCOUNT_INSURANCE_STATUSES,
  accountInsuranceStatusLabel,
  accountInsuranceStatusVariant,
  approveAccountInsuranceClaim,
  EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS,
  formatDateTimeValue,
  formatMoneyValue,
  listAccountInsurancesAdmin,
  resolveAccountInsuranceOwner,
  truncateId,
  type AccountInsurance,
  type AccountInsuranceAdminFilterFormState,
  type AccountInsuranceAdminListFilters,
  type AccountInsuranceAdminSortBy,
  type AccountInsuranceAdminSortDirection,
  type AccountInsuranceStatus,
} from "@/features/insurance";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Account insurances", current: true },
];

const TABLE_COLUMN_COUNT = 11;
const ALL_STATUS_VALUE = "all";

function formToAppliedFilters(
  form: AccountInsuranceAdminFilterFormState,
  sortBy: AccountInsuranceAdminSortBy,
  sortDirection: AccountInsuranceAdminSortDirection,
): AccountInsuranceAdminListFilters {
  const filters: AccountInsuranceAdminListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const userId = form.user_id.trim();
  const userName = form.user_name.trim();
  const userEmail = form.user_email.trim();
  const accountId = form.account_id.trim();
  const optionId = form.insurance_plan_option_id.trim();

  if (userId) {
    filters.user_id = userId;
  }
  if (userName) {
    filters.user_name = userName;
  }
  if (userEmail) {
    filters.user_email = userEmail;
  }
  if (accountId) {
    filters.account_id = accountId;
  }
  if (optionId) {
    filters.insurance_plan_option_id = optionId;
  }
  if (form.status) {
    filters.status = form.status;
  }

  return filters;
}

type ColumnSortHeadProps = {
  label: string;
  sortKey: AccountInsuranceAdminSortBy;
  activeSortBy: AccountInsuranceAdminSortBy;
  activeDirection: AccountInsuranceAdminSortDirection;
  onSort: (sortKey: AccountInsuranceAdminSortBy) => void;
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

export function AccountInsurancesAdminView() {
  const [assignments, setAssignments] = useState<AccountInsurance[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<AccountInsuranceAdminFilterFormState>(
      EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS,
    );
  const [sortBy, setSortBy] =
    useState<AccountInsuranceAdminSortBy>("created_at");
  const [sortDirection, setSortDirection] =
    useState<AccountInsuranceAdminSortDirection>("desc");
  const [appliedFilters, setAppliedFilters] =
    useState<AccountInsuranceAdminListFilters>(
      formToAppliedFilters(
        EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS,
        "created_at",
        "desc",
      ),
    );

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AccountInsurance | null>(null);

  const loadAssignments = useCallback(
    async (
      requestedPage: number,
      filters: AccountInsuranceAdminListFilters,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listAccountInsurancesAdmin({
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

  useEffect(() => {
    void loadAssignments(page, appliedFilters);
  }, [loadAssignments, page, appliedFilters]);

  function commitFilters(
    form: AccountInsuranceAdminFilterFormState,
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
    setDraftFilters(EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS, "created_at", "desc");
  }

  function toggleSort(column: AccountInsuranceAdminSortBy) {
    let nextDirection: AccountInsuranceAdminSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function patchDraft(
    patch: Partial<AccountInsuranceAdminFilterFormState>,
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

  function refresh() {
    void loadAssignments(page, appliedFilters);
  }

  async function approveAccountInsuranceClaimEvent (value:string): Promise<void> {
    approveAccountInsuranceClaim(value ?? "")
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
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
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCwIcon className={cn(loading && "animate-spin")} />
          Refresh
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert
          title="Could not load account insurances"
          message={error}
        />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px] align-bottom whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <ColumnSortHead
                    label="Created"
                    sortKey="created_at"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px] align-bottom whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">Plan option</span>
                  <Input
                    className="h-8 font-mono text-xs"
                    placeholder="Option UUID… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.insurance_plan_option_id}
                    onChange={(event) =>
                      patchDraft({
                        insurance_plan_option_id: event.target.value,
                      })
                    }
                    onKeyDown={onFilterEnter}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px] align-bottom whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium">Account</span>
                  <Input
                    className="h-8 font-mono text-xs"
                    placeholder="Account UUID… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.account_id}
                    onChange={(event) =>
                      patchDraft({ account_id: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px] align-bottom whitespace-normal">
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
                    className="h-8 font-mono text-xs"
                    placeholder="UUID… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_id}
                    onChange={(event) =>
                      patchDraft({ user_id: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom whitespace-normal">
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
                    placeholder="Name… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_name}
                    onChange={(event) =>
                      patchDraft({ user_name: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[160px] align-bottom whitespace-normal">
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
                    placeholder="Email… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_email}
                    onChange={(event) =>
                      patchDraft({ user_email: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <ColumnSortHead
                    label="Status"
                    sortKey="status"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Select
                    value={draftFilters.status || ALL_STATUS_VALUE}
                    onValueChange={(value) =>
                      patchDraft(
                        {
                          status:
                            value === ALL_STATUS_VALUE
                              ? ""
                              : (value as AccountInsuranceStatus),
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
                      {ACCOUNT_INSURANCE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="min-w-[100px] align-bottom">
                Insured
              </TableHead>
              <TableHead className="min-w-[110px] align-bottom">
                Compensation
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <ColumnSortHead
                    label="Expires"
                    sortKey="expires_at"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[96px] align-bottom text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`insurance-skeleton-${index}`}>
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && assignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="text-center text-muted-foreground"
                >
                  No account insurances found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? assignments.map((assignment) => {
                  const owner = resolveAccountInsuranceOwner(assignment);

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {formatDateTimeValue(assignment.created_at)}
                      </TableCell>
                      <TableCell>
                        {assignment.plan?.name ?? "—"}
                        {assignment.option ? (
                          <p className="text-xs text-muted-foreground">
                            {assignment.option.coverage_percentage}% ·{" "}
                            {assignment.option.duration_days}d
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {truncateId(assignment.account_id)}
                      </TableCell>
                      <TableCell
                        className="font-mono text-xs"
                        title={owner.id || undefined}
                      >
                        {owner.id ? truncateId(owner.id) : "—"}
                      </TableCell>
                      <TableCell>{owner.name || "—"}</TableCell>
                      <TableCell>{owner.email || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={accountInsuranceStatusVariant(
                            assignment.status,
                          )}
                        >
                          {accountInsuranceStatusLabel(assignment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatMoneyValue(assignment.insured_amount)}
                      </TableCell>
                      <TableCell>
                        {formatMoneyValue(
                          assignment.compensation_amount ?? null,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateTimeValue(assignment.expires_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {assignment.status === "pending_claim" ? (
                          <div className="flex justify-end gap-1">
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Approve claim"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setApproveOpen(true);
                              }}
                            >
                              <CheckIcon />
                            </ActionTooltipButton>
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Reject claim"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setRejectOpen(true);
                              }}
                            >
                              <XIcon />
                            </ActionTooltipButton>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>

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

      <AccountInsuranceApproveDialog
        accountInsurance={selectedAssignment}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onApprove={(value) => approveAccountInsuranceClaimEvent(value)}
        onSuccess={() => void loadAssignments(page, appliedFilters)}
      />

      <AccountInsuranceRejectDialog
        accountInsurance={selectedAssignment}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSuccess={() => void loadAssignments(page, appliedFilters)}
      />
    </div>
  );
}
