"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterXIcon,
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPlatforms } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import { listTradingAccounts } from "@/features/trading-account/api";
import {
  TradingAccountAccessDialog,
  type TradingAccountAccessAction,
} from "@/features/trading-account/components/trading-account-access-dialog";
import { TradingAccountActionsMenu } from "@/features/trading-account/components/trading-account-actions-menu";
import { TradingAccountPositionsDialog } from "@/features/trading-account/components/trading-account-positions-dialog";
import { TradingAccountNotesDialog } from "@/features/trading-account/components/trading-account-notes-dialog";
import { TradingAccountResetCredentialsDialog } from "@/features/trading-account/components/trading-account-reset-credentials-dialog";
import {
  EMPTY_TRADING_ACCOUNT_FILTERS,
  resolveAccountOwner,
  type TradingAccount,
  type TradingAccountFilterFormState,
  type TradingAccountListFilters,
  type TradingAccountListTotals,
  type TradingAccountSortBy,
  type TradingAccountSortDirection,
} from "@/features/trading-account/types";
import {
  listServerGroupsForAdmin,
  listTradingServerEnvironments,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import type { TradingServerEnvironment } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const tradingAccountsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Trading accounts", current: true },
];

const TABLE_COLUMN_COUNT = 17;
const TABLE_LEADING_COLUMN_COUNT = 8;
const PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

type ServerGroupOption = {
  id: string;
  label: string;
  platformLabel: string;
  environment: number | null;
};

const moneyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

function pnlClassName(value: number): string {
  if (value > 0) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (value < 0) {
    return "text-destructive";
  }

  return "";
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formToAppliedFilters(
  form: TradingAccountFilterFormState,
  sortBy: TradingAccountSortBy,
  sortDirection: TradingAccountSortDirection,
): TradingAccountListFilters {
  const filters: TradingAccountListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const externalTraderId = form.external_trader_id.trim();
  const customName = form.custom_name.trim();
  const userId = form.user_id.trim();
  const userName = form.user_name.trim();
  const userEmail = form.user_email.trim();
  const platformId = form.platform_id.trim();
  const serverGroupId = form.server_group_id.trim();

  if (externalTraderId) {
    filters.external_trader_id = externalTraderId;
  }

  if (customName) {
    filters.custom_name = customName;
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

  if (platformId && platformId !== "all") {
    filters.platform_id = platformId;
  }

  const environment = form.environment.trim();
  if (environment && environment !== "all") {
    const parsed = Number.parseInt(environment, 10);
    if (Number.isFinite(parsed)) {
      filters.environment = parsed;
    }
  }

  if (serverGroupId && serverGroupId !== "all") {
    filters.server_group_id = serverGroupId;
  }

  if (form.is_active === "true" || form.is_active === "false") {
    filters.is_active = form.is_active === "true";
  }

  if (
    form.is_trading_enabled === "true" ||
    form.is_trading_enabled === "false"
  ) {
    filters.is_trading_enabled = form.is_trading_enabled === "true";
  }

  const balance = parseOptionalNumber(form.current_balance);
  if (balance !== undefined) {
    filters.current_balance = balance;
  }

  const equity = parseOptionalNumber(form.current_equity);
  if (equity !== undefined) {
    filters.current_equity = equity;
  }

  const credit = parseOptionalNumber(form.current_credit);
  if (credit !== undefined) {
    filters.current_credit = credit;
  }

  const realizedProfit = parseOptionalNumber(form.realized_profit);
  if (realizedProfit !== undefined) {
    filters.realized_profit = realizedProfit;
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
  sortKey: TradingAccountSortBy;
  activeSortBy: TradingAccountSortBy;
  activeDirection: TradingAccountSortDirection;
  onSort: (sortKey: TradingAccountSortBy) => void;
  disabled?: boolean;
  className?: string;
  align?: "left" | "right";
};

function ColumnSortHead({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
  className,
  align = "left",
}: ColumnSortHeadProps) {
  const isActive = activeSortBy === sortKey;

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" && "justify-end",
        className,
      )}
    >
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

export function TradingAccountsView() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [totals, setTotals] = useState<TradingAccountListTotals | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(
    15,
  );
  const [pageInput, setPageInput] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<TradingAccountFilterFormState>(EMPTY_TRADING_ACCOUNT_FILTERS);
  const [sortBy, setSortBy] = useState<TradingAccountSortBy>("created_at");
  const [sortDirection, setSortDirection] =
    useState<TradingAccountSortDirection>("desc");
  const [appliedFilters, setAppliedFilters] = useState<TradingAccountListFilters>(
    formToAppliedFilters(EMPTY_TRADING_ACCOUNT_FILTERS, "created_at", "desc"),
  );

  const [serverGroupOptions, setServerGroupOptions] = useState<
    ServerGroupOption[]
  >([]);
  // Start false so SSR and the first client paint match (Base UI Select
  // serializes disabled={true} differently on the server).
  const [serverGroupsLoading, setServerGroupsLoading] = useState(false);
  const [platformOptions, setPlatformOptions] = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [environmentOptions, setEnvironmentOptions] = useState<
    TradingServerEnvironment[]
  >([]);

  const [accessAccount, setAccessAccount] = useState<TradingAccount | null>(
    null,
  );
  const [accessAction, setAccessAction] =
    useState<TradingAccountAccessAction | null>(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [positionsAccount, setPositionsAccount] = useState<TradingAccount | null>(
    null,
  );
  const [positionsDialogOpen, setPositionsDialogOpen] = useState(false);
  const [resetAccount, setResetAccount] = useState<TradingAccount | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [notesAccount, setNotesAccount] = useState<TradingAccount | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  const loadServerGroupOptions = useCallback(async () => {
    setServerGroupsLoading(true);
    setPlatformsLoading(true);

    try {
      const [serversResponse, platformsResponse, environmentsResponse] =
        await Promise.all([
          listTradingServersForAdmin({ per_page: 100 }),
          listPlatforms({ per_page: 100 }),
          listTradingServerEnvironments("admin"),
        ]);

      setPlatformOptions(platformsResponse.data);
      setEnvironmentOptions(environmentsResponse.data);

      const platformLabelById = new Map(
        platformsResponse.data.map((platform) => [
          platform.id,
          platform.custom_name ?? platform.name,
        ]),
      );

      const groupsByServer = await Promise.all(
        serversResponse.data.map(async (server) => {
          const groupsResponse = await listServerGroupsForAdmin(server.id, {
            per_page: 100,
          });
          const platformLabel =
            platformLabelById.get(server.platform_id) ?? "—";

          return groupsResponse.data.map((group) => ({
            id: group.id,
            label:
              group.meta_name?.trim() ||
              group.name?.trim() ||
              group.id,
            platformLabel,
            environment: group.environment ?? null,
          }));
        }),
      );

      const uniqueGroups = new Map<string, ServerGroupOption>();

      for (const group of groupsByServer.flat()) {
        uniqueGroups.set(group.id, group);
      }

      setServerGroupOptions(
        Array.from(uniqueGroups.values()).sort((left, right) =>
          left.label.localeCompare(right.label),
        ),
      );
    } catch {
      setServerGroupOptions([]);
      setPlatformOptions([]);
      setEnvironmentOptions([]);
    } finally {
      setServerGroupsLoading(false);
      setPlatformsLoading(false);
    }
  }, []);

  const loadTradingAccounts = useCallback(
    async (
      requestedPage: number,
      requestedPageSize: number,
      filters: TradingAccountListFilters,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listTradingAccounts({
          ...filters,
          page: requestedPage,
          per_page: requestedPageSize,
        });

        setAccounts(response.data);
        setPagination(response.meta.pagination ?? null);
        setTotals(response.meta.totals ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setAccounts([]);
        setPagination(null);
        setTotals(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadServerGroupOptions();
  }, [loadServerGroupOptions]);

  useEffect(() => {
    void loadTradingAccounts(page, pageSize, appliedFilters);
  }, [appliedFilters, loadTradingAccounts, page, pageSize]);

  function commitFilters(
    form: TradingAccountFilterFormState,
    nextSortBy = sortBy,
    nextDirection = sortDirection,
  ) {
    changePage(1);
    setAppliedFilters(formToAppliedFilters(form, nextSortBy, nextDirection));
  }

  function applyFiltersFromDraft() {
    commitFilters(draftFilters);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_TRADING_ACCOUNT_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_TRADING_ACCOUNT_FILTERS, "created_at", "desc");
  }

  function toggleSort(column: TradingAccountSortBy) {
    let nextDirection: TradingAccountSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function patchDraft(
    patch: Partial<TradingAccountFilterFormState>,
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

  function goToPage() {
    const lastPage = pagination?.last_page ?? 1;
    const requestedPage = Number.parseInt(pageInput, 10);
    const nextPage = Number.isFinite(requestedPage)
      ? Math.min(Math.max(requestedPage, 1), lastPage)
      : page;

    changePage(nextPage);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    setPageInput(String(nextPage));
  }

  function changePageSize(value: string | null) {
    const nextPageSize = Number.parseInt(value ?? "", 10);

    if (!PAGE_SIZE_OPTIONS.includes(nextPageSize as (typeof PAGE_SIZE_OPTIONS)[number])) {
      return;
    }

    setPageSize(nextPageSize as (typeof PAGE_SIZE_OPTIONS)[number]);
    changePage(1);
  }

  function openPositionsDialog(account: TradingAccount) {
    setPositionsAccount(account);
    setPositionsDialogOpen(true);
  }

  function openAccessDialog(
    account: TradingAccount,
    action: TradingAccountAccessAction,
  ) {
    setAccessAccount(account);
    setAccessAction(action);
    setAccessDialogOpen(true);
  }

  function openResetPasswordDialog(account: TradingAccount) {
    setResetAccount(account);
    setResetDialogOpen(true);
  }

  function openNotesDialog(account: TradingAccount) {
    setNotesAccount(account);
    setNotesDialogOpen(true);
  }

  const serverGroupById = useMemo(
    () => new Map(serverGroupOptions.map((option) => [option.id, option])),
    [serverGroupOptions],
  );

  const environmentLabelByValue = useMemo(
    () =>
      new Map(
        environmentOptions.map((environment) => [
          environment.value,
          environment.label,
        ]),
      ),
    [environmentOptions],
  );

  function formatEnvironmentLabel(environment: number | null | undefined): string {
    if (environment == null) {
      return "—";
    }

    return environmentLabelByValue.get(environment) ?? String(environment);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
      <PageContentToolbar
        breadcrumbs={tradingAccountsBreadcrumbs}
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
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load trading accounts" message={error} />
      ) : null}

      <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Trader ID"
                  sortKey="external_trader_id"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Filter… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.external_trader_id}
                  onChange={(event) =>
                    patchDraft({ external_trader_id: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[120px] align-bottom">
                <ColumnSortHead
                  label="Account name"
                  sortKey="custom_name"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Name… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.custom_name}
                  onChange={(event) =>
                    patchDraft({ custom_name: event.target.value })
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
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8 font-mono text-xs"
                  placeholder="UUID… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.user_id}
                  onChange={(event) =>
                    patchDraft({ user_id: event.target.value })
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
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Name… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.user_name}
                  onChange={(event) =>
                    patchDraft({ user_name: event.target.value })
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
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Email… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.user_email}
                  onChange={(event) =>
                    patchDraft({ user_email: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[130px] align-bottom">
                <span className="text-xs font-medium">Platform</span>
                <Select
                  value={draftFilters.platform_id || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        platform_id: value === "all" ? "" : (value ?? ""),
                      },
                      { apply: true },
                    )
                  }
                  disabled={platformsLoading}
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue
                      placeholder={
                        platformsLoading ? "Loading…" : "All platforms"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.custom_name?.trim() || platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="min-w-[120px] align-bottom">
                <span className="text-xs font-medium">Environment</span>
                <Select
                  value={draftFilters.environment || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        environment: value === "all" ? "" : (value ?? ""),
                      },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {environmentOptions.map((environment) => (
                      <SelectItem
                        key={environment.value}
                        value={String(environment.value)}
                      >
                        {environment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Server group"
                  sortKey="server_group_id"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.server_group_id || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        server_group_id: value === "all" ? "" : (value ?? ""),
                      },
                      { apply: true },
                    )
                  }
                  disabled={serverGroupsLoading}
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue
                      placeholder={
                        serverGroupsLoading ? "Loading…" : "All groups"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {serverGroupOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="min-w-[100px] align-bottom text-right">
                <ColumnSortHead
                  label="Balance"
                  sortKey="current_balance"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
                <Input
                  className="mt-1.5 h-8 text-right"
                  inputMode="decimal"
                  placeholder="Exact… (Enter)"
                  title="Exact match. Press Enter to apply."
                  value={draftFilters.current_balance}
                  onChange={(event) =>
                    patchDraft({ current_balance: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[100px] align-bottom text-right">
                <ColumnSortHead
                  label="Equity"
                  sortKey="current_equity"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
                <Input
                  className="mt-1.5 h-8 text-right"
                  inputMode="decimal"
                  placeholder="Exact… (Enter)"
                  title="Exact match. Press Enter to apply."
                  value={draftFilters.current_equity}
                  onChange={(event) =>
                    patchDraft({ current_equity: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[100px] align-bottom text-right">
                <ColumnSortHead
                  label="Credit"
                  sortKey="current_credit"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
                <Input
                  className="mt-1.5 h-8 text-right"
                  inputMode="decimal"
                  placeholder="Exact… (Enter)"
                  title="Exact match. Press Enter to apply."
                  value={draftFilters.current_credit}
                  onChange={(event) =>
                    patchDraft({ current_credit: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[100px] align-bottom text-right">
                <ColumnSortHead
                  label="PnL"
                  sortKey="pnl"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
              </TableHead>

              <TableHead className="min-w-[110px] align-bottom text-right">
                <ColumnSortHead
                  label="Profit"
                  sortKey="realized_profit"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
                <Input
                  className="mt-1.5 h-8 text-right"
                  inputMode="decimal"
                  placeholder="Exact… (Enter)"
                  title="Exact match. Press Enter to apply."
                  value={draftFilters.realized_profit}
                  onChange={(event) =>
                    patchDraft({ realized_profit: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>

              <TableHead className="min-w-[110px] align-bottom text-right">
                <ColumnSortHead
                  label="Withdrawals"
                  sortKey="withdrawals"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                  align="right"
                />
              </TableHead>

              <TableHead className="min-w-[120px] align-bottom">
                <ColumnSortHead
                  label="Trading"
                  sortKey="is_trading_enabled"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.is_trading_enabled || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        is_trading_enabled:
                          value === "true" || value === "false" ? value : "",
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
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
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
                          value === "true" || value === "false" ? value : "",
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
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="w-[72px] text-right align-bottom">
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

            {!loading && accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="h-24 text-center text-muted-foreground"
                >
                  No trading accounts found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? accounts.map((account) => {
                  const serverGroupMeta =
                    serverGroupById.get(account.server_group.id) ?? null;
                  const owner = resolveAccountOwner(account);

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.external_trader_id}
                      </TableCell>
                      <TableCell>{account.custom_name ?? "—"}</TableCell>
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
                        {account.platform?.custom_name ??
                          account.platform?.name ??
                          serverGroupMeta?.platformLabel ??
                          "—"}
                      </TableCell>
                      <TableCell>
                        {formatEnvironmentLabel(serverGroupMeta?.environment)}
                      </TableCell>
                      <TableCell>
                        {serverGroupMeta?.label ??
                          (account.server_group.meta_name?.trim() ||
                            account.server_group.name?.trim() || (
                              <span className="font-mono text-xs text-muted-foreground">
                                {abbreviateUuid(account.server_group.id)}
                              </span>
                            ))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(account.current_balance)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(account.current_equity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(account.current_credit)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          pnlClassName(account.pnl),
                        )}
                      >
                        {formatMoney(account.pnl)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          pnlClassName(account.realized_profit),
                        )}
                      >
                        {formatMoney(account.realized_profit)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(account.withdrawals ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            account.is_trading_enabled ? "default" : "secondary"
                          }
                        >
                          {account.is_trading_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={account.is_active ? "default" : "secondary"}
                        >
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TradingAccountActionsMenu
                          account={account}
                          onViewPositions={openPositionsDialog}
                          onResetPassword={openResetPasswordDialog}
                          onViewNotes={openNotesDialog}
                          onAccessAction={openAccessDialog}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
          {!loading && totals ? (
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={TABLE_LEADING_COLUMN_COUNT}
                  className="text-muted-foreground"
                  title="Totals for the current filters, across all pages"
                >
                  Totals
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(totals.current_balance)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(totals.current_equity)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(totals.current_credit)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    pnlClassName(totals.pnl),
                  )}
                >
                  {formatMoney(totals.pnl)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    pnlClassName(totals.realized_profit),
                  )}
                >
                  {formatMoney(totals.realized_profit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(totals.withdrawals)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {pagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} (
            {pagination.total} total)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Per page
              <Select
                value={String(pageSize)}
                onValueChange={changePageSize}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-[76px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Go to page
              <Input
                className="h-8 w-16 text-center"
                type="number"
                min={1}
                max={pagination.last_page}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={goToPage}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    goToPage();
                  }
                }}
                disabled={loading}
                aria-label={`Go to page, from 1 to ${pagination.last_page}`}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => changePage(Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() => changePage(Math.min(pagination.last_page, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <TradingAccountAccessDialog
        account={accessAccount}
        action={accessAction}
        open={accessDialogOpen}
        onOpenChange={(open) => {
          setAccessDialogOpen(open);
          if (!open) {
            setAccessAccount(null);
            setAccessAction(null);
          }
        }}
        onSuccess={() => {
          void loadTradingAccounts(page, pageSize, appliedFilters);
        }}
      />

      <TradingAccountPositionsDialog
        account={positionsAccount}
        open={positionsDialogOpen}
        onOpenChange={(open) => {
          setPositionsDialogOpen(open);
          if (!open) {
            setPositionsAccount(null);
          }
        }}
      />

      <TradingAccountResetCredentialsDialog
        account={resetAccount}
        open={resetDialogOpen}
        onOpenChange={(open) => {
          setResetDialogOpen(open);
          if (!open) {
            setResetAccount(null);
          }
        }}
        onSuccess={() => {
          void loadTradingAccounts(page, pageSize, appliedFilters);
        }}
      />

      <TradingAccountNotesDialog
        account={notesAccount}
        open={notesDialogOpen}
        onOpenChange={(open) => {
          setNotesDialogOpen(open);
          if (!open) {
            setNotesAccount(null);
          }
        }}
      />
    </div>
  );
}
