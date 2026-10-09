"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { Popover } from "@base-ui/react/popover";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  FilterIcon,
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
  AccountInsuranceApproveDialog,
  AccountInsuranceRejectDialog,
} from "@/features/insurance/components/account-insurance-claim-dialogs";
import { AccountInsuranceCoverageCell } from "@/features/insurance/components/account-insurance-coverage-cell";
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

const TABLE_COLUMN_COUNT = 10;
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

function countActiveFilters(form: AccountInsuranceAdminFilterFormState): number {
  return [
    form.user_id,
    form.user_name,
    form.user_email,
    form.account_id,
    form.insurance_plan_option_id,
    form.status,
  ].filter((value) => value.trim() !== "").length;
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = useMemo(
    () => countActiveFilters(draftFilters),
    [draftFilters],
  );

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
    setFiltersOpen(false);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_ACCOUNT_INSURANCE_ADMIN_FILTERS, "created_at", "desc");
    setFiltersOpen(false);
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

  function patchDraft(patch: Partial<AccountInsuranceAdminFilterFormState>) {
    setDraftFilters((current) => ({ ...current, ...patch }));
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

  async function approveAccountInsuranceClaimEvent(value: string): Promise<void> {
    await approveAccountInsuranceClaim(value ?? "");
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
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

      <div className="flex items-center gap-3">
        <Popover.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Popover.Trigger
            render={<Button type="button" variant="outline" size="sm" />}
          >
            <FilterIcon data-icon="inline-start" />
            Filters
            {activeFilterCount > 0 ? (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            ) : null}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              side="bottom"
              sideOffset={4}
              align="start"
              className="isolate z-50"
            >
              <Popover.Popup className="z-50 max-h-[calc(100vh-2rem)] w-[42rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                <div className="mb-4">
                  <p className="font-medium">Filter account insurances</p>
                  <p className="text-xs text-muted-foreground">
                    Combine one or more fields and apply them to the table.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-user-id">User ID</Label>
                    <Input
                      id="insurance-filter-user-id"
                      className="font-mono text-xs"
                      placeholder="UUID"
                      value={draftFilters.user_id}
                      onChange={(event) =>
                        patchDraft({ user_id: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-user-name">User name</Label>
                    <Input
                      id="insurance-filter-user-name"
                      placeholder="Name"
                      value={draftFilters.user_name}
                      onChange={(event) =>
                        patchDraft({ user_name: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-user-email">
                      User email
                    </Label>
                    <Input
                      id="insurance-filter-user-email"
                      placeholder="Email"
                      value={draftFilters.user_email}
                      onChange={(event) =>
                        patchDraft({ user_email: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-account-id">
                      Account ID
                    </Label>
                    <Input
                      id="insurance-filter-account-id"
                      className="font-mono text-xs"
                      placeholder="UUID"
                      value={draftFilters.account_id}
                      onChange={(event) =>
                        patchDraft({ account_id: event.target.value })
                      }
                      onKeyDown={onFilterEnter}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-option-id">
                      Plan option ID
                    </Label>
                    <Input
                      id="insurance-filter-option-id"
                      className="font-mono text-xs"
                      placeholder="UUID"
                      value={draftFilters.insurance_plan_option_id}
                      onChange={(event) =>
                        patchDraft({
                          insurance_plan_option_id: event.target.value,
                        })
                      }
                      onKeyDown={onFilterEnter}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="insurance-filter-status">Status</Label>
                    <Select
                      value={draftFilters.status || ALL_STATUS_VALUE}
                      onValueChange={(value) =>
                        patchDraft({
                          status:
                            value === ALL_STATUS_VALUE
                              ? ""
                              : (value as AccountInsuranceStatus),
                        })
                      }
                    >
                      <SelectTrigger id="insurance-filter-status" className="w-full">
                        <SelectValue placeholder="All statuses" />
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
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={loading && activeFilterCount === 0}
                  >
                    <FilterXIcon data-icon="inline-start" />
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={applyFiltersFromDraft}
                    disabled={loading}
                  >
                    Apply filters
                  </Button>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {activeFilterCount > 0 ? (
          <span className="text-sm text-muted-foreground">
            {activeFilterCount} active{" "}
            {activeFilterCount === 1 ? "filter" : "filters"}
          </span>
        ) : null}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[120px]">
                <ColumnSortHead
                  label="Created"
                  sortKey="created_at"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
              </TableHead>
              <TableHead className="min-w-[140px]">Plan</TableHead>
              <TableHead className="min-w-[140px]">Account</TableHead>
              <TableHead className="min-w-[160px]">
                <ColumnSortHead
                  label="User"
                  sortKey="user.name"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
              </TableHead>
              <TableHead className="min-w-[120px]">
                <ColumnSortHead
                  label="Status"
                  sortKey="status"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
              </TableHead>
              <TableHead className="min-w-[100px]">Insured</TableHead>
              <TableHead className="min-w-[140px]">Claimable / paid</TableHead>
              <TableHead className="min-w-[110px]">Recovered</TableHead>
              <TableHead className="min-w-[120px]">
                <ColumnSortHead
                  label="Expires"
                  sortKey="expires_at"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
              </TableHead>
              <TableHead className="w-[96px] text-right">Actions</TableHead>
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
                  const accountId = assignment.account?.id ?? assignment.account_id;
                  const login =
                    assignment.account?.external_trader_id ?? "—";

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
                      <TableCell>
                        <div className="font-medium">{login}</div>
                        <div
                          className="font-mono text-xs text-muted-foreground"
                          title={accountId}
                        >
                          {truncateId(accountId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{owner.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {owner.email || "—"}
                        </div>
                      </TableCell>
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
                        <AccountInsuranceCoverageCell
                          insurance={assignment}
                          formatAmount={formatMoneyValue}
                          remainingLabel={(remaining) =>
                            `${remaining} left to cap`
                          }
                        />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <div>{formatMoneyValue(assignment.recovered_amount)}</div>
                        {assignment.recovery_outcome?.message ? (
                          <p
                            className="max-w-[160px] truncate text-xs text-muted-foreground"
                            title={assignment.recovery_outcome.message}
                          >
                            {assignment.recovery_outcome.code ===
                            "platform_rejected_no_money"
                              ? "No money"
                              : assignment.recovery_outcome.message}
                          </p>
                        ) : null}
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
