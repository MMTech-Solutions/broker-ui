"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
import { listLeverages } from "@/features/leverage/api";
import { LeverageDeleteDialog } from "@/features/leverage/components/leverage-delete-dialog";
import { LeverageFormDialog } from "@/features/leverage/components/leverage-form-dialog";
import type { Leverage } from "@/features/leverage/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const leveragesBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Leverages", current: true },
];

export function LeveragesView() {
  const [leverages, setLeverages] = useState<Leverage[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [valueFilter, setValueFilter] = useState<number | undefined>(undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedLeverage, setSelectedLeverage] = useState<Leverage | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leverageToDelete, setLeverageToDelete] = useState<Leverage | null>(
    null,
  );

  const loadLeverages = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listLeverages({
          page: requestedPage,
          per_page: 15,
          name: nameFilter || undefined,
          value: valueFilter,
        });

        setLeverages(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setLeverages([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [nameFilter, valueFilter],
  );

  useEffect(() => {
    void loadLeverages(page);
  }, [loadLeverages, page]);

  function applyFilters() {
    const parsedValue = valueInput.trim()
      ? Number.parseInt(valueInput, 10)
      : undefined;

    if (valueInput.trim() && (parsedValue === undefined || Number.isNaN(parsedValue))) {
      setError("value: must be a valid integer.");
      return;
    }

    setError(null);
    setPage(1);
    setNameFilter(nameInput.trim());
    setValueFilter(parsedValue);
  }

  function clearFilters() {
    setNameInput("");
    setValueInput("");
    setNameFilter("");
    setValueFilter(undefined);
    setPage(1);
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedLeverage(null);
    setFormOpen(true);
  }

  function openEditDialog(leverage: Leverage) {
    setFormMode("edit");
    setSelectedLeverage(leverage);
    setFormOpen(true);
  }

  function openDeleteDialog(leverage: Leverage) {
    setLeverageToDelete(leverage);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadLeverages(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={leveragesBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New leverage
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="leverage-filter-name">Name</Label>
          <Input
            id="leverage-filter-name"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="1:100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leverage-filter-value">Value</Label>
          <Input
            id="leverage-filter-value"
            type="number"
            min={1}
            value={valueInput}
            onChange={(event) => setValueInput(event.target.value)}
            placeholder="100"
          />
        </div>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
          <Button type="button" onClick={applyFilters}>
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load leverages" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
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

            {!loading && leverages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No leverages found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? leverages.map((leverage) => (
                  <TableRow key={leverage.id}>
                    <TableCell className="font-medium">
                      {leverage.name}
                    </TableCell>
                    <TableCell>{leverage.value}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${leverage.name}`}
                          onClick={() => openEditDialog(leverage)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${leverage.name}`}
                          onClick={() => openDeleteDialog(leverage)}
                        >
                          <Trash2Icon />
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

      <LeverageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        leverage={selectedLeverage}
        onSuccess={handleMutationSuccess}
      />

      <LeverageDeleteDialog
        leverage={leverageToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
