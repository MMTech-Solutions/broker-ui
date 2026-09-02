"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterXIcon, PercentIcon, SearchIcon, TagsIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { PageNumberPagination } from "@/components/page-number-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPlatform } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import {
  getTradingServerForAdmin,
  listSymbols,
} from "@/features/trading-server/api";
import { SetSymbolsMarkupDialog } from "@/features/trading-server/components/set-symbols-markup-dialog";
import { SetSymbolsCategoryDialog } from "@/features/trading-server/components/set-symbols-category-dialog";
import { TradingSymbolsTable } from "@/features/trading-server/components/trading-symbols-table";
import type {
  SymbolListFilters,
  SymbolsBulkScope,
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
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<SymbolFilterFormState>(emptySymbolFilters);
  const [appliedFilters, setAppliedFilters] = useState<SymbolListFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [markupScope, setMarkupScope] = useState<SymbolsBulkScope | null>(
    null,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryScope, setCategoryScope] = useState<SymbolsBulkScope | null>(null);
  const [initialCategoryId, setInitialCategoryId] = useState<
    string | null | undefined
  >(undefined);
  const [initialMarkup, setInitialMarkup] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
              per_page: perPage,
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
    [platformId, tradingServerId, perPage],
  );

  useEffect(() => {
    void loadSymbols(page, appliedFilters);
    setSelectedIds([]);
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

  function openMarkup(
    scope: SymbolsBulkScope,
    markupValue: string | null = null,
  ) {
    setMarkupScope(scope);
    setInitialMarkup(markupValue);
    setMarkupOpen(true);
    setSuccessMessage(null);
  }

  function openCategory(
    scope: SymbolsBulkScope,
    categoryId?: string | null,
  ) {
    setCategoryScope(scope);
    setInitialCategoryId(categoryId);
    setCategoryOpen(true);
    setSuccessMessage(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={`/platforms/${platformId}/trading-servers`}
        backLabel="Ir atrás"
      >
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => openCategory({ type: "symbols", symbolIds: selectedIds })}
              >
                <TagsIcon data-icon="inline-start" />
                Set category ({selectedIds.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  openMarkup({ type: "symbols", symbolIds: selectedIds })
                }
              >
                <PercentIcon data-icon="inline-start" />
                Set markup ({selectedIds.length})
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => openCategory({ type: "trading_server" })}
          >
            <TagsIcon data-icon="inline-start" />
            Set category for all
          </Button>
          <Button
            type="button"
            onClick={() => openMarkup({ type: "trading_server" })}
          >
            <PercentIcon data-icon="inline-start" />
            Set markup for all
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

      <TradingSymbolsTable
        symbols={symbols}
        loading={loading}
        emptyMessage="No symbols found for this trading server."
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onSetCategory={(symbol) =>
          openCategory(
            { type: "symbols", symbolIds: [symbol.id], label: symbol.alpha },
            symbol.category?.id ?? null,
          )
        }
        onSetMarkup={(symbol) =>
          openMarkup(
            {
              type: "symbols",
              symbolIds: [symbol.id],
              label: symbol.alpha,
            },
            symbol.markup,
          )
        }
      />

      <PageNumberPagination
        currentPage={pagination?.current_page ?? page}
        lastPage={pagination?.last_page ?? 1}
        total={pagination?.total}
        disabled={loading}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(nextPerPage) => {
          setPage(1);
          setPerPage(nextPerPage);
        }}
      />

      <SetSymbolsMarkupDialog
        open={markupOpen}
        onOpenChange={setMarkupOpen}
        tradingServerId={tradingServerId}
        scope={markupScope}
        initialMarkup={initialMarkup}
        onSuccess={(_result, message) => {
          setSelectedIds([]);
          setSuccessMessage(message);
          void loadSymbols(page, appliedFilters, { silent: true });
        }}
      />
      <SetSymbolsCategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        tradingServerId={tradingServerId}
        scope={categoryScope}
        initialCategoryId={initialCategoryId}
        onSuccess={(_result, message) => {
          setSelectedIds([]);
          setSuccessMessage(message);
          void loadSymbols(page, appliedFilters, { silent: true });
        }}
      />
    </div>
  );
}
