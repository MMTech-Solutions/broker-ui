"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ListXIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
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
import { listBonusOfferTemplates } from "@/features/bonus-offer-template/api";
import { BonusOfferTemplateDeleteDialog } from "@/features/bonus-offer-template/components/bonus-offer-template-delete-dialog";
import { BonusOfferTemplateFormDialog } from "@/features/bonus-offer-template/components/bonus-offer-template-form-dialog";
import type { BonusOfferTemplate } from "@/features/bonus-offer-template/types";
import { bonusOfferTemplateExcludedInstrumentsPath } from "@/features/bonus-excluded-instrument/routes";
import { invalidateBonusOfferFormCatalog } from "@/features/bonus-offer/api";
import { listPlatforms } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const bonusOfferTemplatesBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus offer templates", current: true },
];

export function BonusOfferTemplatesView() {
  const [templates, setTemplates] = useState<BonusOfferTemplate[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<BonusOfferTemplate | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<BonusOfferTemplate | null>(null);

  const platformLabels = useMemo(
    () =>
      Object.fromEntries(
        platforms.map((platform) => [
          platform.id,
          platform.custom_name ?? platform.name,
        ]),
      ),
    [platforms],
  );

  const loadTemplates = useCallback(
    async (requestedPage: number, name?: string) => {
      setLoading(true);
      setError(null);

      try {
        const [templatesResponse, platformsResponse] = await Promise.all([
          listBonusOfferTemplates({
            page: requestedPage,
            per_page: 15,
            ...(name ? { name } : {}),
          }),
          listPlatforms({ per_page: 100 }),
        ]);

        setTemplates(templatesResponse.data);
        setPagination(templatesResponse.meta.pagination ?? null);
        setPlatforms(platformsResponse.data);
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

  function openCreateDialog() {
    setFormMode("create");
    setSelectedTemplate(null);
    setFormOpen(true);
  }

  function openEditDialog(template: BonusOfferTemplate) {
    setFormMode("edit");
    setSelectedTemplate(template);
    setFormOpen(true);
  }

  function openDeleteDialog(template: BonusOfferTemplate) {
    setTemplateToDelete(template);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    invalidateBonusOfferFormCatalog();
    void loadTemplates(page, appliedNameFilter || undefined);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={bonusOfferTemplatesBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New template
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
          className="sm:max-w-xs"
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert
          title="Could not load bonus offer templates"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Conversion window</TableHead>
              <TableHead>Activity / credit</TableHead>
              <TableHead>Excluded</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[132px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && templates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No bonus offer templates found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      {platformLabels[template.platform_id] ??
                        template.platform_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{template.conversion_window_days} days</TableCell>
                    <TableCell>{template.activity_per_credit_unit}</TableCell>
                    <TableCell>
                      {template.excluded_instruments_count ?? 0}
                    </TableCell>
                    <TableCell>{template.offers_count ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={template.is_active ? "default" : "secondary"}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Excluded instruments for ${template.name}`}
                          render={
                            <Link
                              href={bonusOfferTemplateExcludedInstrumentsPath(
                                template.id,
                              )}
                            />
                          }
                        >
                          <ListXIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${template.name}`}
                          onClick={() => openEditDialog(template)}
                        >
                          <PencilIcon />
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

      <BonusOfferTemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        bonusOfferTemplate={selectedTemplate}
        onSuccess={handleMutationSuccess}
      />

      <BonusOfferTemplateDeleteDialog
        bonusOfferTemplate={templateToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
