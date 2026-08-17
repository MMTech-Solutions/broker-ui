"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterXIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  EMPTY_BONUS_OFFER_TEMPLATE_FILTERS,
  type BonusOfferTemplate,
  type BonusOfferTemplateFilterFormState,
  type BonusOfferTemplateListFilters,
  type BonusOfferTemplateSortBy,
  type BonusOfferTemplateSortDirection,
} from "@/features/bonus-offer-template/types";
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

const TABLE_COLUMN_COUNT = 8;

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formToAppliedFilters(
  form: BonusOfferTemplateFilterFormState,
  sortBy: BonusOfferTemplateSortBy,
  sortDirection: BonusOfferTemplateSortDirection,
): BonusOfferTemplateListFilters {
  const filters: BonusOfferTemplateListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const name = form.name.trim();
  if (name) {
    filters.name = name;
  }

  const platformId = form.platform_id.trim();
  if (platformId && platformId !== "all") {
    filters.platform_id = platformId;
  }

  const conversionWindowDays = parseOptionalNumber(form.conversion_window_days);
  if (conversionWindowDays !== undefined) {
    filters.conversion_window_days = conversionWindowDays;
  }

  const activityPerCreditUnit = parseOptionalNumber(
    form.activity_per_credit_unit,
  );
  if (activityPerCreditUnit !== undefined) {
    filters.activity_per_credit_unit = activityPerCreditUnit;
  }

  const excludedCount = parseOptionalNumber(form.excluded_instruments_count);
  if (excludedCount !== undefined) {
    filters.excluded_instruments_count = excludedCount;
  }

  const offersCount = parseOptionalNumber(form.offers_count);
  if (offersCount !== undefined) {
    filters.offers_count = offersCount;
  }

  if (form.is_active === "true" || form.is_active === "false") {
    filters.is_active = form.is_active === "true";
  }

  return filters;
}

type ColumnSortHeadProps = {
  label: string;
  sortKey: BonusOfferTemplateSortBy;
  activeSortBy: BonusOfferTemplateSortBy;
  activeDirection: BonusOfferTemplateSortDirection;
  onSort: (sortKey: BonusOfferTemplateSortBy) => void;
  disabled?: boolean;
};

function ColumnSortHead({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
}: ColumnSortHeadProps) {
  const isActive = activeSortBy === sortKey;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0"
        disabled={disabled}
        title={
          isActive
            ? `Sorted ${activeDirection === "asc" ? "ascending" : "descending"} — click to toggle`
            : `Sort by ${label}`
        }
        onClick={() => onSort(sortKey)}
      >
        {isActive ? (
          activeDirection === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : (
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function BonusOfferTemplatesView() {
  const [templates, setTemplates] = useState<BonusOfferTemplate[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<BonusOfferTemplateFilterFormState>(
      EMPTY_BONUS_OFFER_TEMPLATE_FILTERS,
    );
  const [appliedFilters, setAppliedFilters] =
    useState<BonusOfferTemplateListFilters>({
      sort_by: "created_at",
      sort_direction: "desc",
    });
  const [sortBy, setSortBy] = useState<BonusOfferTemplateSortBy>("created_at");
  const [sortDirection, setSortDirection] =
    useState<BonusOfferTemplateSortDirection>("desc");

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
    async (requestedPage: number, filters: BonusOfferTemplateListFilters) => {
      setLoading(true);
      setError(null);

      try {
        const [templatesResponse, platformsResponse] = await Promise.all([
          listBonusOfferTemplates({
            ...filters,
            page: requestedPage,
            per_page: 15,
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
    void loadTemplates(page, appliedFilters);
  }, [appliedFilters, loadTemplates, page]);

  function commitFilters(
    form: BonusOfferTemplateFilterFormState,
    nextSortBy: BonusOfferTemplateSortBy,
    nextSortDirection: BonusOfferTemplateSortDirection,
  ) {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(form, nextSortBy, nextSortDirection));
  }

  function patchDraft(
    patch: Partial<BonusOfferTemplateFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...draftFilters, ...patch };
    setDraftFilters(next);
    if (options?.apply) {
      commitFilters(next, sortBy, sortDirection);
    }
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      commitFilters(draftFilters, sortBy, sortDirection);
    }
  }

  function toggleSort(column: BonusOfferTemplateSortBy) {
    let nextDirection: BonusOfferTemplateSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_BONUS_OFFER_TEMPLATE_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_BONUS_OFFER_TEMPLATE_FILTERS, "created_at", "desc");
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
    void loadTemplates(page, appliedFilters);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={bonusOfferTemplatesBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={loading}
          title="Clear column filters and sort"
        >
          <FilterXIcon data-icon="inline-start" />
          Clear filters
        </Button>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New template
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert
          title="Could not load bonus offer templates"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Name"
                  sortKey="name"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Filter… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.name}
                  onChange={(event) => patchDraft({ name: event.target.value })}
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Platform"
                  sortKey="platform_id"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.platform_id || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      { platform_id: value === "all" ? "" : (value ?? "") },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.custom_name ?? platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Conversion window"
                  sortKey="conversion_window_days"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Days… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.conversion_window_days}
                  onChange={(event) =>
                    patchDraft({ conversion_window_days: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[140px] align-bottom">
                <ColumnSortHead
                  label="Activity / credit"
                  sortKey="activity_per_credit_unit"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Value… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.activity_per_credit_unit}
                  onChange={(event) =>
                    patchDraft({ activity_per_credit_unit: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[110px] align-bottom">
                <ColumnSortHead
                  label="Excluded"
                  sortKey="excluded_instruments_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.excluded_instruments_count}
                  onChange={(event) =>
                    patchDraft({
                      excluded_instruments_count: event.target.value,
                    })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[100px] align-bottom">
                <ColumnSortHead
                  label="Offers"
                  sortKey="offers_count"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Input
                  className="mt-1.5 h-8"
                  placeholder="Count… (Enter)"
                  title="Press Enter to apply filter"
                  value={draftFilters.offers_count}
                  onChange={(event) =>
                    patchDraft({ offers_count: event.target.value })
                  }
                  onKeyDown={onFilterEnter}
                />
              </TableHead>
              <TableHead className="min-w-[120px] align-bottom">
                <ColumnSortHead
                  label="Status"
                  sortKey="is_active"
                  activeSortBy={sortBy}
                  activeDirection={sortDirection}
                  onSort={toggleSort}
                  disabled={loading}
                />
                <Select
                  value={draftFilters.is_active || "all"}
                  onValueChange={(value) =>
                    patchDraft(
                      {
                        is_active:
                          value === "all" ? "" : (value as "true" | "false"),
                      },
                      { apply: true },
                    )
                  }
                >
                  <SelectTrigger className="mt-1.5 h-8 w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="w-[132px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && templates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
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
