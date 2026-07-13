"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChartCandlestickIcon,
  FilterXIcon,
  GaugeIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlatform } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import {
  getTradingServerForAdmin,
  listServerGroupsForAdmin,
} from "@/features/trading-server/api";
import { ServerGroupEditSheet } from "@/features/trading-server/components/server-group-edit-sheet";
import { ServerGroupLeveragesSyncDialog } from "@/features/trading-server/components/server-group-leverages-sync-dialog";
import {
  formatCurrencyLabel,
} from "@/features/trading-server/format";
import type {
  ServerGroup,
  ServerGroupListFilters,
  TradingServer,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type TradingServerGroupsViewProps = {
  platformId: string;
  tradingServerId: string;
};

type ServerGroupFilterFormState = {
  name: string;
  meta_name: string;
};

const emptyServerGroupFilters: ServerGroupFilterFormState = {
  name: "",
  meta_name: "",
};

function formToAppliedFilters(
  form: ServerGroupFilterFormState,
): ServerGroupListFilters {
  const filters: ServerGroupListFilters = {};
  const name = form.name.trim();
  const metaName = form.meta_name.trim();

  if (name) {
    filters.name = name;
  }

  if (metaName) {
    filters.meta_name = metaName;
  }

  return filters;
}

export function TradingServerGroupsView({
  platformId,
  tradingServerId,
}: TradingServerGroupsViewProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [tradingServer, setTradingServer] = useState<TradingServer | null>(
    null,
  );
  const [serverGroups, setServerGroups] = useState<ServerGroup[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] = useState<ServerGroupFilterFormState>(
    emptyServerGroupFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<ServerGroupListFilters>(
    {},
  );

  const [editOpen, setEditOpen] = useState(false);
  const [leveragesSyncOpen, setLeveragesSyncOpen] = useState(false);
  const [selectedServerGroup, setSelectedServerGroup] =
    useState<ServerGroup | null>(null);

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "Platforms", href: "/platforms" },
      { label: platform?.custom_name ?? platform?.name ?? "Platform" },
      {
        label: "Trading servers",
        href: `/platforms/${platformId}/trading-servers`,
      },
      {
        label: tradingServer
          ? String(tradingServer.config.host ?? "Trading server")
          : "Trading server",
      },
      { label: "Server groups", current: true },
    ],
    [platform, platformId, tradingServer],
  );

  const loadServerGroups = useCallback(
    async (
      requestedPage: number,
      filters: ServerGroupListFilters,
      options?: { silent?: boolean },
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const [platformResult, serverResult, serverGroupsResponse] =
          await Promise.all([
            getPlatform(platformId),
            getTradingServerForAdmin(tradingServerId),
            listServerGroupsForAdmin(tradingServerId, {
              ...filters,
              page: requestedPage,
              per_page: 15,
            }),
          ]);

        setPlatform(platformResult.data);
        setTradingServer(serverResult.data);
        setServerGroups(serverGroupsResponse.data);
        setPagination(serverGroupsResponse.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setServerGroups([]);
        setPagination(null);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [platformId, tradingServerId],
  );

  useEffect(() => {
    void loadServerGroups(page, appliedFilters);
  }, [appliedFilters, loadServerGroups, page]);

  function applyFilters() {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(draftFilters));
  }

  function clearFilters() {
    setDraftFilters(emptyServerGroupFilters);
    setPage(1);
    setAppliedFilters({});
  }

  function openEditSheet(serverGroup: ServerGroup) {
    setSelectedServerGroup(serverGroup);
    setEditOpen(true);
    setSuccessMessage(null);
  }

  function openLeveragesSyncDialog(serverGroup: ServerGroup) {
    setSelectedServerGroup(serverGroup);
    setLeveragesSyncOpen(true);
    setSuccessMessage(null);
  }

  function handleEditSuccess(updatedServerGroup: ServerGroup) {
    setServerGroups((current) =>
      current.map((group) =>
        group.id === updatedServerGroup.id ? updatedServerGroup : group,
      ),
    );
    setSelectedServerGroup(updatedServerGroup);
    setSuccessMessage(`Saved settings for ${updatedServerGroup.name}.`);
    void loadServerGroups(page, appliedFilters, { silent: true });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={`/platforms/${platformId}/trading-servers`}
        backLabel="Ir atrás"
      />

      {successMessage ? (
        <Alert>
          <AlertTitle>Changes saved</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border p-4">
        <p className="mb-4 text-sm font-medium">Filters</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="filter-server-group-name">Name</Label>
            <Input
              id="filter-server-group-name"
              value={draftFilters.name}
              placeholder="e.g. demo"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-server-group-meta-name">Meta name</Label>
            <Input
              id="filter-server-group-meta-name"
              value={draftFilters.meta_name}
              placeholder="e.g. demo"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  meta_name: event.target.value,
                }))
              }
            />
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
        <ApiErrorAlert title="Could not load server groups" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Meta name</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Default amount</TableHead>
              <TableHead className="w-[120px]">Accounts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && serverGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No server groups found for this trading server.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? serverGroups.map((serverGroup) => (
                  <TableRow
                    key={serverGroup.id}
                    className="cursor-pointer"
                    onClick={() => openEditSheet(serverGroup)}
                  >
                    <TableCell className="font-medium">
                      {serverGroup.name}
                    </TableCell>
                    <TableCell>{serverGroup.meta_name}</TableCell>
                    <TableCell>
                      {formatCurrencyLabel(serverGroup.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {serverGroup.default_amount ?? "—"}
                    </TableCell>
                    <TableCell>{serverGroup.account_limits ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant={
                            serverGroup.is_active ? "default" : "secondary"
                          }
                        >
                          {serverGroup.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {serverGroup.is_default ? (
                          <Badge variant="outline">Default</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Synchronize leverages for ${serverGroup.name}`}
                          onClick={() => openLeveragesSyncDialog(serverGroup)}
                        >
                          <GaugeIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${serverGroup.name}`}
                          onClick={() => openEditSheet(serverGroup)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Securities for ${serverGroup.name}`}
                          render={
                            <Link
                              href={`/platforms/${platformId}/trading-servers/${tradingServerId}/server-groups/${serverGroup.id}/securities?groupName=${encodeURIComponent(serverGroup.name)}`}
                            />
                          }
                        >
                          <ChartCandlestickIcon />
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

      <ServerGroupEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        tradingServerId={tradingServerId}
        serverGroup={selectedServerGroup}
        onSuccess={handleEditSuccess}
      />

      <ServerGroupLeveragesSyncDialog
        open={leveragesSyncOpen}
        onOpenChange={setLeveragesSyncOpen}
        tradingServerId={tradingServerId}
        serverGroup={selectedServerGroup}
        onSuccess={(message) => setSuccessMessage(message)}
      />
    </div>
  );
}
