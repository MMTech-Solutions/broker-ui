"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { PageNumberPagination } from "@/components/page-number-pagination";
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
import { listSymbolCategories } from "@/features/symbol-category/api";
import { SymbolCategoryDeleteDialog } from "@/features/symbol-category/components/symbol-category-delete-dialog";
import { SymbolCategoryFormDialog } from "@/features/symbol-category/components/symbol-category-form-dialog";
import type { SymbolCategory } from "@/features/symbol-category/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Symbol categories", current: true },
];

export function SymbolCategoriesView() {
  const [categories, setCategories] = useState<SymbolCategory[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<SymbolCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listSymbolCategories({
        name: nameFilter || undefined,
        page,
        per_page: perPage,
      });
      setCategories(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setCategories([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [nameFilter, page, perPage]);

  useEffect(() => {
    // Data loading follows the same client-side view pattern used throughout this basic UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  function openCreate() {
    setSelectedCategory(null);
    setFormMode("create");
    setFormOpen(true);
  }

  function openEdit(category: SymbolCategory) {
    setSelectedCategory(category);
    setFormMode("edit");
    setFormOpen(true);
  }

  function openDelete(category: SymbolCategory) {
    setSelectedCategory(category);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs} backHref="/" backLabel="Ir atrás">
        <Button onClick={openCreate}>
          <PlusIcon />
          New category
        </Button>
      </PageContentToolbar>

      <div className="rounded-xl border p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="symbol-category-filter-name">Name</Label>
            <Input
              id="symbol-category-filter-name"
              value={nameInput}
              placeholder="e.g. Forex"
              onChange={(event) => setNameInput(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setPage(1);
                setNameFilter(nameInput.trim());
              }}
            >
              <SearchIcon />
              Apply filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNameInput("");
                setNameFilter("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {error ? <ApiErrorAlert title="Could not load categories" message={error} /> : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`category-skeleton-${index}`}>
                    <TableCell colSpan={2}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!loading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  No symbol categories found.
                </TableCell>
              </TableRow>
            ) : null}
            {!loading
              ? categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${category.name}`}
                          onClick={() => openEdit(category)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${category.name}`}
                          onClick={() => openDelete(category)}
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

      <PageNumberPagination
        currentPage={pagination?.current_page ?? page}
        lastPage={pagination?.last_page ?? 1}
        total={pagination?.total}
        disabled={loading}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(nextPerPage) => {
          setPage(1);
          setPerPage(nextPerPage);
        }}
      />

      <SymbolCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        category={selectedCategory}
        onSuccess={() => void loadCategories()}
      />
      <SymbolCategoryDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
        onSuccess={() => void loadCategories()}
      />
    </div>
  );
}
