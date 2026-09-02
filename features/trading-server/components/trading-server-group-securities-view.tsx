"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FilterXIcon, PercentIcon, SearchIcon, TagIcon, TagsIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  listServerGroupSecurities,
} from "@/features/trading-server/api";
import type { Security, SymbolsBulkScope, TradingServer } from "@/features/trading-server/types";
import { SetSymbolsCategoryDialog } from "@/features/trading-server/components/set-symbols-category-dialog";
import { SetSymbolsMarkupDialog } from "@/features/trading-server/components/set-symbols-markup-dialog";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type TradingServerGroupSecuritiesViewProps = {
  platformId: string;
  tradingServerId: string;
  serverGroupId: string;
};

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TradingServerGroupSecuritiesView({
  platformId,
  tradingServerId,
  serverGroupId,
}: TradingServerGroupSecuritiesViewProps) {
  const searchParams = useSearchParams();
  const serverGroupName = searchParams.get("groupName");

  const [platform, setPlatform] = useState<Platform | null>(null);
  const [tradingServer, setTradingServer] = useState<TradingServer | null>(
    null,
  );
  const [securities, setSecurities] = useState<Security[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameFilter, setNameFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [markupOpen, setMarkupOpen] = useState(false);
  const [markupScope, setMarkupScope] = useState<SymbolsBulkScope | null>(
    null,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryScope, setCategoryScope] = useState<SymbolsBulkScope | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const serverGroupsHref = `/platforms/${platformId}/trading-servers/${tradingServerId}/server-groups`;

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
      { label: "Server groups", href: serverGroupsHref },
      { label: serverGroupName ?? "Server group" },
      { label: "Securities", current: true },
    ],
    [
      platform,
      platformId,
      serverGroupName,
      serverGroupsHref,
      tradingServer,
    ],
  );

  const loadSecurities = useCallback(
    async (requestedPage: number, name: string) => {
      setLoading(true);
      setError(null);

      try {
        const [platformResult, serverResult, securitiesResponse] =
          await Promise.all([
            getPlatform(platformId),
            getTradingServerForAdmin(tradingServerId),
            listServerGroupSecurities(tradingServerId, serverGroupId, {
              name: name || undefined,
              page: requestedPage,
              per_page: 15,
            }),
          ]);

        setPlatform(platformResult.data);
        setTradingServer(serverResult.data);
        setSecurities(securitiesResponse.data);
        setPagination(securitiesResponse.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSecurities([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [platformId, serverGroupId, tradingServerId],
  );

  useEffect(() => {
    void loadSecurities(page, appliedNameFilter);
  }, [appliedNameFilter, loadSecurities, page]);

  function applyFilters() {
    setPage(1);
    setAppliedNameFilter(nameFilter.trim());
  }

  function clearFilters() {
    setNameFilter("");
    setPage(1);
    setAppliedNameFilter("");
  }

  function openMarkup(scope: SymbolsBulkScope) {
    setMarkupScope(scope);
    setMarkupOpen(true);
    setSuccessMessage(null);
  }

  function openCategory(scope: SymbolsBulkScope) {
    setCategoryScope(scope);
    setCategoryOpen(true);
    setSuccessMessage(null);
  }

  const groupLabel = serverGroupName ?? "this server group";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={serverGroupsHref}
        backLabel="Ir atrás"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              openCategory({ type: "server_group", serverGroupId, label: groupLabel })
            }
          >
            <TagIcon data-icon="inline-start" />
            Set category for group
          </Button>
          <Button
            type="button"
            onClick={() =>
              openMarkup({
                type: "server_group",
                serverGroupId,
                label: groupLabel,
              })
            }
          >
            <PercentIcon data-icon="inline-start" />
            Set markup for group
          </Button>
        </div>
      </PageContentToolbar>

      {successMessage ? (
        <Alert>
          <AlertTitle>Symbols updated</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border p-4">
        <p className="mb-4 text-sm font-medium">Filters</p>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="filter-server-group-security-name">Name</Label>
            <Input
              id="filter-server-group-security-name"
              value={nameFilter}
              placeholder="e.g. forex"
              onChange={(event) => setNameFilter(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load securities" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[120px]">Position</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[108px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && securities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No securities found for this server group.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? securities.map((security) => (
                  <TableRow key={security.id}>
                    <TableCell className="font-medium">{security.name}</TableCell>
                    <TableCell>{security.position}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(security.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Set category for ${security.name}`}
                          onClick={() =>
                            openCategory({
                              type: "security",
                              securityId: security.id,
                              label: security.name,
                            })
                          }
                        >
                          <TagIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Set markup for ${security.name}`}
                          onClick={() =>
                            openMarkup({
                              type: "security",
                              securityId: security.id,
                              label: security.name,
                            })
                          }
                        >
                          <PercentIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Symbols for ${security.name}`}
                          render={
                            <Link
                              href={`/platforms/${platformId}/trading-servers/${tradingServerId}/securities/${security.id}/symbols?securityName=${encodeURIComponent(security.name)}&serverGroupId=${encodeURIComponent(serverGroupId)}&groupName=${encodeURIComponent(serverGroupName ?? "")}`}
                            />
                          }
                        >
                          <TagsIcon />
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

      <SetSymbolsMarkupDialog
        open={markupOpen}
        onOpenChange={setMarkupOpen}
        tradingServerId={tradingServerId}
        scope={markupScope}
        onSuccess={(_result, message) => {
          setSuccessMessage(message);
        }}
      />
      <SetSymbolsCategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        tradingServerId={tradingServerId}
        scope={categoryScope}
        onSuccess={(_result, message) => setSuccessMessage(message)}
      />
    </div>
  );
}
