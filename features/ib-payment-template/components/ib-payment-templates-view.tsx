"use client";

import { useCallback, useEffect, useState } from "react";
import { LayersIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
import { listIbPaymentTemplates } from "@/features/ib-payment-template/api";
import { IbPaymentTemplateDeleteDialog } from "@/features/ib-payment-template/components/ib-payment-template-delete-dialog";
import { IbPaymentTemplateFormDialog } from "@/features/ib-payment-template/components/ib-payment-template-form-dialog";
import { IbPaymentTemplateLevelsDialog } from "@/features/ib-payment-template/components/ib-payment-template-levels-dialog";
import { formatPaymentTemplateRate } from "@/features/ib-payment-template/format";
import type { IbPaymentTemplate } from "@/features/ib-payment-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const ibPaymentTemplatesBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Payment templates", current: true },
];

function summarizeLevels(template: IbPaymentTemplate): string {
  const levels = [...(template.levels ?? [])].sort(
    (left, right) => left.sort_order - right.sort_order,
  );

  if (levels.length === 0) {
    return "No levels";
  }

  return levels
    .map((level) => `${level.name} (${formatPaymentTemplateRate(level.rate)})`)
    .join(" · ");
}

export function IbPaymentTemplatesView() {
  const [templates, setTemplates] = useState<IbPaymentTemplate[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<IbPaymentTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<IbPaymentTemplate | null>(null);

  const loadTemplates = useCallback(
    async (requestedPage: number, name?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listIbPaymentTemplates({
          page: requestedPage,
          per_page: 15,
          ...(name ? { name } : {}),
        });

        setTemplates(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setTemplates([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadTemplates(page, appliedNameFilter || undefined);
  }, [loadTemplates, page, appliedNameFilter]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedNameFilter(nameFilter.trim());
  }

  function openLevelsDialog(template: IbPaymentTemplate) {
    setSelectedTemplate(template);
    setLevelsOpen(true);
  }

  function openDeleteDialog(template: IbPaymentTemplate) {
    setTemplateToDelete(template);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadTemplates(page, appliedNameFilter || undefined);
  }

  useEffect(() => {
    if (!levelsOpen || !selectedTemplate) {
      return;
    }

    const refreshedTemplate = templates.find(
      (template) => template.id === selectedTemplate.id,
    );

    if (refreshedTemplate) {
      setSelectedTemplate(refreshedTemplate);
    }
  }, [levelsOpen, selectedTemplate, templates]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={ibPaymentTemplatesBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          New payment template
        </Button>
      </PageContentToolbar>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <Input
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder="Filter by name"
          className="sm:max-w-sm"
          disabled={loading}
        />
        <Button type="submit" variant="outline" disabled={loading}>
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert
          title="Could not load payment templates"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Levels</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="w-[144px] text-right">Actions</TableHead>
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

            {!loading && templates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No payment templates found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.levels?.length ?? 0}</TableCell>
                    <TableCell className="max-w-[420px] truncate text-muted-foreground">
                      {summarizeLevels(template)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Manage levels for ${template.name}`}
                          onClick={() => openLevelsDialog(template)}
                        >
                          <LayersIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${template.name}`}
                          onClick={() => openDeleteDialog(template)}
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

      <IbPaymentTemplateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleMutationSuccess}
      />

      <IbPaymentTemplateLevelsDialog
        ibPaymentTemplate={selectedTemplate}
        open={levelsOpen}
        onOpenChange={setLevelsOpen}
        onSuccess={handleMutationSuccess}
      />

      <IbPaymentTemplateDeleteDialog
        ibPaymentTemplate={templateToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
