"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listContestConditions } from "@/features/contest/api";
import { ContestConditionDeleteDialog } from "@/features/contest/components/contest-condition-delete-dialog";
import { ContestConditionFormDialog } from "@/features/contest/components/contest-condition-form-dialog";
import type { ContestCondition } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const conditionsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", href: "/contests" },
  { label: "Condition library", current: true },
];

export function ContestConditionsView() {
  const [conditions, setConditions] = useState<ContestCondition[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [titleFilter, setTitleFilter] = useState("");
  const [appliedTitleFilter, setAppliedTitleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCondition, setSelectedCondition] =
    useState<ContestCondition | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [conditionToDelete, setConditionToDelete] =
    useState<ContestCondition | null>(null);

  const loadConditions = useCallback(
    async (requestedPage: number, title?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContestConditions({
          page: requestedPage,
          per_page: 15,
          ...(title ? { title } : {}),
        });

        setConditions(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setConditions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadConditions(page, appliedTitleFilter || undefined);
  }, [loadConditions, page, appliedTitleFilter]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedTitleFilter(titleFilter.trim());
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedCondition(null);
    setFormOpen(true);
  }

  function openEditDialog(condition: ContestCondition) {
    setFormMode("edit");
    setSelectedCondition(condition);
    setFormOpen(true);
  }

  function openDeleteDialog(condition: ContestCondition) {
    setConditionToDelete(condition);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadConditions(page, appliedTitleFilter || undefined);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={conditionsBreadcrumbs}
        backHref="/contests"
        backLabel="Ir atrás"
      >
        <Button variant="outline" render={<Link href="/contests" />}>
          <ArrowLeftIcon />
          Back to contests
        </Button>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New condition
        </Button>
      </PageContentToolbar>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={handleSearchSubmit}
      >
        <div className="min-w-[220px] flex-1 space-y-1">
          <label
            htmlFor="condition-title-filter"
            className="text-sm text-muted-foreground"
          >
            Title
          </label>
          <Input
            id="condition-title-filter"
            value={titleFilter}
            onChange={(event) => setTitleFilter(event.target.value)}
            placeholder="Search by title"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert title="Could not load conditions" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Body preview</TableHead>
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

            {!loading && conditions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No condition templates found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? conditions.map((condition) => (
                  <TableRow key={condition.id}>
                    <TableCell className="font-medium">
                      {condition.title}
                    </TableCell>
                    <TableCell>{condition.assignments_count ?? 0}</TableCell>
                    <TableCell className="max-w-[360px] truncate text-muted-foreground">
                      {condition.body.replace(/<[^>]+>/g, " ").trim()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${condition.title}`}
                          onClick={() => openEditDialog(condition)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${condition.title}`}
                          onClick={() => openDeleteDialog(condition)}
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

      <ContestConditionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        condition={selectedCondition}
        onSuccess={handleMutationSuccess}
      />

      <ContestConditionDeleteDialog
        condition={conditionToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
