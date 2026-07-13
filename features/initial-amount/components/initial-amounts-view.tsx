"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

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
import { listInitialAmounts } from "@/features/initial-amount/api";
import { InitialAmountDeleteDialog } from "@/features/initial-amount/components/initial-amount-delete-dialog";
import { InitialAmountFormDialog } from "@/features/initial-amount/components/initial-amount-form-dialog";
import { InitialAmountServerGroupsDialog } from "@/features/initial-amount/components/initial-amount-server-groups-dialog";
import {
  formatInitialAmount,
  parseMajorAmountToMinorUnits,
} from "@/features/initial-amount/format";
import type { InitialAmount } from "@/features/initial-amount/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const initialAmountsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Default amounts", current: true },
];

export function InitialAmountsView() {
  const [initialAmounts, setInitialAmounts] = useState<InitialAmount[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amountInput, setAmountInput] = useState("");
  const [amountFilter, setAmountFilter] = useState<number | undefined>(
    undefined,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedInitialAmount, setSelectedInitialAmount] =
    useState<InitialAmount | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [initialAmountToDelete, setInitialAmountToDelete] =
    useState<InitialAmount | null>(null);

  const [serverGroupsOpen, setServerGroupsOpen] = useState(false);
  const [initialAmountForServerGroups, setInitialAmountForServerGroups] =
    useState<InitialAmount | null>(null);

  const loadInitialAmounts = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listInitialAmounts({
          page: requestedPage,
          per_page: 15,
          amount: amountFilter,
        });

        setInitialAmounts(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setInitialAmounts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [amountFilter],
  );

  useEffect(() => {
    void loadInitialAmounts(page);
  }, [loadInitialAmounts, page]);

  function applyFilters() {
    const parsedAmount = amountInput.trim()
      ? parseMajorAmountToMinorUnits(amountInput)
      : undefined;

    if (amountInput.trim() && parsedAmount === undefined) {
      setError("amount: must be a valid monetary value.");
      return;
    }

    setError(null);
    setPage(1);
    setAmountFilter(parsedAmount);
  }

  function clearFilters() {
    setAmountInput("");
    setAmountFilter(undefined);
    setPage(1);
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedInitialAmount(null);
    setFormOpen(true);
  }

  function openEditDialog(initialAmount: InitialAmount) {
    setFormMode("edit");
    setSelectedInitialAmount(initialAmount);
    setFormOpen(true);
  }

  function openDeleteDialog(initialAmount: InitialAmount) {
    setInitialAmountToDelete(initialAmount);
    setDeleteOpen(true);
  }

  function openServerGroupsDialog(initialAmount: InitialAmount) {
    setInitialAmountForServerGroups(initialAmount);
    setServerGroupsOpen(true);
  }

  function handleMutationSuccess() {
    void loadInitialAmounts(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={initialAmountsBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New default amount
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="initial-amount-filter-amount">Amount</Label>
          <Input
            id="initial-amount-filter-amount"
            type="number"
            min={0}
            step="0.01"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="1000.00"
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
        <ApiErrorAlert
          title="Could not load default amounts"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Server groups</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
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

            {!loading && initialAmounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No default amounts found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? initialAmounts.map((initialAmount) => (
                  <TableRow key={initialAmount.id}>
                    <TableCell className="font-medium tabular-nums">
                      {formatInitialAmount(initialAmount.amount)}
                    </TableCell>
                    <TableCell>
                      {initialAmount.server_groups_count ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip="Manage server groups"
                          onClick={() => openServerGroupsDialog(initialAmount)}
                        >
                          <LayersIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${formatInitialAmount(initialAmount.amount)}`}
                          onClick={() => openEditDialog(initialAmount)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${formatInitialAmount(initialAmount.amount)}`}
                          onClick={() => openDeleteDialog(initialAmount)}
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

      <InitialAmountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialAmount={selectedInitialAmount}
        onSuccess={handleMutationSuccess}
      />

      <InitialAmountDeleteDialog
        initialAmount={initialAmountToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />

      <InitialAmountServerGroupsDialog
        initialAmount={initialAmountForServerGroups}
        open={serverGroupsOpen}
        onOpenChange={setServerGroupsOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
