"use client";

import { useCallback, useEffect, useState } from "react";
import { FilterXIcon, SearchIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
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
import { listTradingAccounts } from "@/features/trading-account/api";
import {
  EMPTY_TRADING_ACCOUNT_FILTERS,
  type TradingAccount,
  type TradingAccountFilterFormState,
  type TradingAccountListFilters,
} from "@/features/trading-account/types";
import {
  listServerGroupsForAdmin,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const tradingAccountsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Trading accounts", current: true },
];

type ServerGroupOption = {
  id: string;
  label: string;
};

const moneyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

function formToAppliedFilters(
  form: TradingAccountFilterFormState,
): TradingAccountListFilters {
  const filters: TradingAccountListFilters = {};

  const externalUserId = form.external_user_id.trim();
  const externalTraderId = form.external_trader_id.trim();
  const serverGroupId = form.server_group_id.trim();

  if (externalUserId) {
    filters.external_user_id = externalUserId;
  }

  if (externalTraderId) {
    filters.external_trader_id = externalTraderId;
  }

  if (serverGroupId && serverGroupId !== "all") {
    filters.server_group_id = serverGroupId;
  }

  if (form.is_active === "true" || form.is_active === "false") {
    filters.is_active = form.is_active === "true";
  }

  return filters;
}

function abbreviateUuid(value: string): string {
  return `${value.slice(0, 8)}…`;
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
  const [appliedFilters, setAppliedFilters] = useState<TradingAccountListFilters>(
    {},
  );

  const [serverGroupOptions, setServerGroupOptions] = useState<
    ServerGroupOption[]
  >([]);
  const [serverGroupsLoading, setServerGroupsLoading] = useState(true);

  const loadServerGroupOptions = useCallback(async () => {
    setServerGroupsLoading(true);

    try {
      const serversResponse = await listTradingServersForAdmin({ per_page: 100 });
      const groupsByServer = await Promise.all(
        serversResponse.data.map(async (server) => {
          const groupsResponse = await listServerGroupsForAdmin(server.id, {
            per_page: 100,
          });

          return groupsResponse.data.map((group) => ({
            id: group.id,
            label: group.name,
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
    } finally {
      setServerGroupsLoading(false);
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

  function applyFilters() {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(draftFilters));
  }

  function clearFilters() {
    setDraftFilters(EMPTY_TRADING_ACCOUNT_FILTERS);
    setPage(1);
    setAppliedFilters({});
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={tradingAccountsBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      />

      <div className="rounded-xl border p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Filters</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-external-trader-id">Trader ID</Label>
            <Input
              id="filter-external-trader-id"
              value={draftFilters.external_trader_id}
              placeholder="e.g. 1102"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  external_trader_id: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-external-user-id">External user ID</Label>
            <Input
              id="filter-external-user-id"
              value={draftFilters.external_user_id}
              placeholder="UUID"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  external_user_id: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-server-group-id">Server group</Label>
            <Select
              value={draftFilters.server_group_id || "all"}
              onValueChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  server_group_id: value === "all" ? "" : (value ?? ""),
                }))
              }
              disabled={serverGroupsLoading}
            >
              <SelectTrigger id="filter-server-group-id" className="w-full">
                <SelectValue
                  placeholder={
                    serverGroupsLoading ? "Loading groups…" : "All groups"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {serverGroupOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-is-active">Status</Label>
            <Select
              value={draftFilters.is_active || "all"}
              onValueChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  is_active:
                    value === "true" || value === "false"
                      ? value
                      : "",
                }))
              }
            >
              <SelectTrigger id="filter-is-active" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={applyFilters} disabled={loading}>
            <SearchIcon data-icon="inline-start" />
            Apply filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            disabled={loading}
          >
            <FilterXIcon data-icon="inline-start" />
            Clear
          </Button>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load trading accounts" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trader ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>External user</TableHead>
              <TableHead>Server group</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Equity</TableHead>
              <TableHead>Trading</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No trading accounts found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.external_trader_id}
                    </TableCell>
                    <TableCell>{account.custom_name ?? "—"}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {abbreviateUuid(account.external_user_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {abbreviateUuid(account.server_group_id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(account.current_balance)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(account.current_equity)}
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
    </div>
  );
}
