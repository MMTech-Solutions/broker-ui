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
import { listContestAwards } from "@/features/contest/api";
import { ContestAwardDeleteDialog } from "@/features/contest/components/contest-award-delete-dialog";
import { ContestAwardFormDialog } from "@/features/contest/components/contest-award-form-dialog";
import {
  CONTEST_AWARD_TYPES,
  type ContestAward,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const awardsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", href: "/contests" },
  { label: "Award library", current: true },
];

const awardTypeLabels = Object.fromEntries(
  CONTEST_AWARD_TYPES.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function ContestAwardsView() {
  const [awards, setAwards] = useState<ContestAward[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedAward, setSelectedAward] = useState<ContestAward | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [awardToDelete, setAwardToDelete] = useState<ContestAward | null>(null);

  const loadAwards = useCallback(
    async (requestedPage: number, name?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContestAwards({
          page: requestedPage,
          per_page: 15,
          ...(name ? { name } : {}),
        });

        setAwards(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setAwards([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadAwards(page, appliedNameFilter || undefined);
  }, [loadAwards, page, appliedNameFilter]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedNameFilter(nameFilter.trim());
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedAward(null);
    setFormOpen(true);
  }

  function openEditDialog(award: ContestAward) {
    setFormMode("edit");
    setSelectedAward(award);
    setFormOpen(true);
  }

  function openDeleteDialog(award: ContestAward) {
    setAwardToDelete(award);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadAwards(page, appliedNameFilter || undefined);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={awardsBreadcrumbs}
        backHref="/contests"
        backLabel="Ir atrás"
      >
        <Button variant="outline" render={<Link href="/contests" />}>
          <ArrowLeftIcon />
          Back to contests
        </Button>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New award
        </Button>
      </PageContentToolbar>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={handleSearchSubmit}
      >
        <div className="min-w-[220px] flex-1 space-y-1">
          <label
            htmlFor="award-name-filter"
            className="text-sm text-muted-foreground"
          >
            Name
          </label>
          <Input
            id="award-name-filter"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Search by name"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert title="Could not load awards" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assignments</TableHead>
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

            {!loading && awards.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No award templates found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? awards.map((award) => (
                  <TableRow key={award.id}>
                    <TableCell className="font-medium">{award.name}</TableCell>
                    <TableCell>
                      {awardTypeLabels[award.award_type] ?? award.award_type}
                    </TableCell>
                    <TableCell>{award.assignments_count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${award.name}`}
                          onClick={() => openEditDialog(award)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${award.name}`}
                          onClick={() => openDeleteDialog(award)}
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

      <ContestAwardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        award={selectedAward}
        onSuccess={handleMutationSuccess}
      />

      <ContestAwardDeleteDialog
        award={awardToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
