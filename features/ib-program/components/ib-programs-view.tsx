"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LayersIcon, PencilIcon, PlusIcon, ScaleIcon, Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listIbPrograms } from "@/features/ib-program/api";
import { IbProgramDeleteDialog } from "@/features/ib-program/components/ib-program-delete-dialog";
import { IbProgramFormDialog } from "@/features/ib-program/components/ib-program-form-dialog";
import { ibProgramPaymentRulesPath } from "@/features/ib-program-payment-rule/routes";
import { ibProgramSymbolsPath } from "@/features/ib-program-symbol/routes";
import {
  IB_PROGRAM_SETTLEMENT_PERIODS,
  type IbProgram,
} from "@/features/ib-program/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import { cn } from "@/lib/utils";

const ibProgramsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "IB Programs", current: true },
];

const settlementPeriodLabels = Object.fromEntries(
  IB_PROGRAM_SETTLEMENT_PERIODS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function IbProgramsView() {
  const [ibPrograms, setIbPrograms] = useState<IbProgram[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProgram, setSelectedProgram] = useState<IbProgram | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<IbProgram | null>(
    null,
  );

  const loadIbPrograms = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listIbPrograms({
        page: requestedPage,
        per_page: 15,
      });

      setIbPrograms(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setIbPrograms([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIbPrograms(page);
  }, [loadIbPrograms, page]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedProgram(null);
    setFormOpen(true);
  }

  function openEditDialog(program: IbProgram) {
    setFormMode("edit");
    setSelectedProgram(program);
    setFormOpen(true);
  }

  function openDeleteDialog(program: IbProgram) {
    setProgramToDelete(program);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadIbPrograms(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={ibProgramsBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New IB program
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load IB programs" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead>Active IBs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[180px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && ibPrograms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No IB programs found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? ibPrograms.map((program) => (
                  <TableRow
                    key={program.id}
                    className={cn(
                      !program.is_active && "bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {program.description}
                    </TableCell>
                    <TableCell>
                      {settlementPeriodLabels[program.settlement_period] ??
                        program.settlement_period}
                    </TableCell>
                    <TableCell>{program.active_ibs_count ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={program.is_active ? "default" : "outline"}
                      >
                        {program.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Configure payment rules for ${program.name}`}
                          render={
                            <Link
                              href={ibProgramPaymentRulesPath(program.id)}
                            />
                          }
                        >
                          <ScaleIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Manage symbols for ${program.name}`}
                          render={
                            <Link href={ibProgramSymbolsPath(program.id)} />
                          }
                        >
                          <LayersIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${program.name}`}
                          onClick={() => openEditDialog(program)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${program.name}`}
                          onClick={() => openDeleteDialog(program)}
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

      <IbProgramFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        ibProgram={selectedProgram}
        onSuccess={handleMutationSuccess}
      />

      <IbProgramDeleteDialog
        ibProgram={programToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
