"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterXIcon, SearchIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
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
  listSymbols,
} from "@/features/trading-server/api";
import type {
  SymbolListFilters,
  TradingServer,
  TradingSymbol,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type TradingSymbolsViewProps = {
  platformId: string;
  tradingServerId: string;
};

type SymbolFilterFormState = {
  name: string;
  alpha: string;
  stype: string;
};

const emptySymbolFilters: SymbolFilterFormState = {
  name: "",
  alpha: "",
  stype: "",
};

function formToAppliedFilters(
  form: SymbolFilterFormState,
): SymbolListFilters {
  const filters: SymbolListFilters = {};
  const name = form.name.trim();
  const alpha = form.alpha.trim();
  const stype = form.stype.trim();

  if (name) {
    filters.name = name;
  }

  if (alpha) {
    filters.alpha = alpha;
  }

  if (stype) {
    const parsed = Number(stype);

    if (Number.isFinite(parsed)) {
      filters.stype = parsed;
    }
  }

  return filters;
}

export function TradingSymbolsView({
  platformId,
  tradingServerId,
}: TradingSymbolsViewProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [tradingServer, setTradingServer] = useState<TradingServer | null>(
    null,
  );
  const [symbols, setSymbols] = useState<TradingSymbol[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<SymbolFilterFormState>(emptySymbolFilters);
  const [appliedFilters, setAppliedFilters] = useState<SymbolListFilters>({});

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
      { label: "Symbols", current: true },
    ],
    [platform, platformId, tradingServer],
  );

  const loadSymbols = useCallback(
    async (
      requestedPage: number,
      filters: SymbolListFilters,
      options?: { silent?: boolean },
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const [platformResult, serverResult, symbolsResponse] =
          await Promise.all([
            getPlatform(platformId),
            getTradingServerForAdmin(tradingServerId),
            listSymbols(tradingServerId, {
              ...filters,
              page: requestedPage,
              per_page: 15,
            }),
          ]);

        setPlatform(platformResult.data);
        setTradingServer(serverResult.data);
        setSymbols(symbolsResponse.data);
        setPagination(symbolsResponse.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSymbols([]);
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
    void loadSymbols(page, appliedFilters);
  }, [appliedFilters, loadSymbols, page]);

  function applyFilters() {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(draftFilters));
  }

  function clearFilters() {
    setDraftFilters(emptySymbolFilters);
    setPage(1);
    setAppliedFilters({});
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={`/platforms/${platformId}/trading-servers`}
        backLabel="Ir atrás"
      />

      <div className="rounded-xl border p-4">
        <p className="mb-4 text-sm font-medium">Filters</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-symbol-name">Name</Label>
            <Input
              id="filter-symbol-name"
              value={draftFilters.name}
              placeholder="e.g. EURUSD"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-symbol-alpha">Alpha</Label>
            <Input
              id="filter-symbol-alpha"
              value={draftFilters.alpha}
              placeholder="e.g. EURUSD"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  alpha: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-symbol-stype">Stype</Label>
            <Input
              id="filter-symbol-stype"
              type="number"
              min={0}
              value={draftFilters.stype}
              placeholder="e.g. 0"
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  stype: event.target.value,
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
        <ApiErrorAlert title="Could not load symbols" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Alpha</TableHead>
              <TableHead className="w-[120px]">Stype</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && symbols.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No symbols found for this trading server.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? symbols.map((symbol) => (
                  <TableRow key={symbol.id}>
                    <TableCell className="font-medium">{symbol.name}</TableCell>
                    <TableCell>{symbol.alpha}</TableCell>
                    <TableCell>{symbol.stype}</TableCell>
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
