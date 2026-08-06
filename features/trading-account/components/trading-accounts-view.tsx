"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterXIcon,
  LockIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  UnlockIcon,
} from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
import { listPlatforms } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import { listTradingAccounts } from "@/features/trading-account/api";
import {
  TradingAccountAccessDialog,
  type TradingAccountAccessAction,
} from "@/features/trading-account/components/trading-account-access-dialog";
import {
  EMPTY_TRADING_ACCOUNT_FILTERS,
  resolveAccountOwner,
  type TradingAccount,
  type TradingAccountFilterFormState,
  type TradingAccountListFilters,
  type TradingAccountSortBy,
  type TradingAccountSortDirection,
} from "@/features/trading-account/types";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const tradingAccountsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Trading accounts", current: true },
];

const TABLE_COLUMN_COUNT = 13;

type ServerGroupOption = {
  id: string;
  label: string;
  platformLabel: string;
};

const moneyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number): string {
  return moneyFormatter.format(value);
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
  const [page, setPage] = useState(1);
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

  const [accessAccount, setAccessAccount] = useState<TradingAccount | null>(
    null,
  );
  const [accessAction, setAccessAction] =
    useState<TradingAccountAccessAction | null>(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  const loadServerGroupOptions = useCallback(async () => {
    setServerGroupsLoading(true);
    setPlatformsLoading(true);

    try {
      const [serversResponse, platformsResponse] = await Promise.all([
        listTradingServersForAdmin({ per_page: 100 }),
        listPlatforms({ per_page: 100 }),
      ]);

      setPlatformOptions(platformsResponse.data);

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
    } finally {
      setServerGroupsLoading(false);
      setPlatformsLoading(false);
    }
  }, []);

  const loadTradingAccounts = useCallback(
    async (requestedPage: number, filters: TradingAccountListFilters) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listTradingAccounts({
          ...filters,
          page: requestedPage,
          per_page: 15,
        });

        setAccounts(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setAccounts([]);
        setPagination(null);
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
    void loadTradingAccounts(page, appliedFilters);
  }, [appliedFilters, loadTradingAccounts, page]);

  function commitFilters(
    form: TradingAccountFilterFormState,
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

  function openAccessDialog(
    account: TradingAccount,
    action: TradingAccountAccessAction,
  ) {
    setAccessAccount(account);
    setAccessAction(action);
    setAccessDialogOpen(true);
  }

  const serverGroupById = useMemo(
    () => new Map(serverGroupOptions.map((option) => [option.id, option])),
    [serverGroupOptions],
  );

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

              <TableHead className="w-[120px] text-right align-bottom">
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
                        <div className="flex justify-end gap-1">
                          {account.is_trading_enabled ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Disable trading"
                              disabled={!account.is_active}
                              onClick={() =>
                                openAccessDialog(account, "disable_trading")
                              }
                            >
                              <PauseCircleIcon />
                            </ActionTooltipButton>
                          ) : (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Enable trading"
                              disabled={!account.is_active}
                              onClick={() =>
                                openAccessDialog(account, "enable_trading")
                              }
                            >
                              <PlayCircleIcon />
                            </ActionTooltipButton>
                          )}

                          {account.is_active ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Deactivate account"
                              onClick={() =>
                                openAccessDialog(account, "deactivate_account")
                              }
                            >
                              <LockIcon />
                            </ActionTooltipButton>
                          ) : (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Reactivate account"
                              onClick={() =>
                                openAccessDialog(account, "reactivate_account")
                              }
                            >
                              <UnlockIcon />
                            </ActionTooltipButton>
                          )}
                        </div>
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
          void loadTradingAccounts(page, appliedFilters);
        }}
      />
    </div>
  );
}
