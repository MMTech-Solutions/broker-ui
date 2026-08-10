"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { listRejectionTemplates } from "@/features/rejection-templates/api";
import { RejectionTemplateDeleteDialog } from "@/features/rejection-templates/components/rejection-template-delete-dialog";
import { RejectionTemplateFormDialog } from "@/features/rejection-templates/components/rejection-template-form-dialog";
import {
  REJECTION_TEMPLATE_CATEGORIES,
  rejectionTemplateCategoryLabel,
  type RejectionTemplate,
  type RejectionTemplateCategory,
} from "@/features/rejection-templates/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Rejection templates", current: true },
];

type CategoryFilter = "all" | RejectionTemplateCategory;

function truncateBody(body: string, max = 96): string {
  const normalized = body.replace(/\s+/g, " ").trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max)}…`;
}

export function RejectionTemplatesView() {
  const [templates, setTemplates] = useState<RejectionTemplate[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryInput, setCategoryInput] = useState<CategoryFilter>("all");
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [titleFilter, setTitleFilter] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTemplate, setSelectedTemplate] =
    useState<RejectionTemplate | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<RejectionTemplate | null>(null);

  const loadTemplates = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listRejectionTemplates({
          page: requestedPage,
          per_page: 15,
          category: categoryFilter === "all" ? undefined : categoryFilter,
          title: titleFilter || undefined,
          body: bodyFilter || undefined,
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
    [bodyFilter, categoryFilter, titleFilter],
  );

  useEffect(() => {
    void loadTemplates(page);
  }, [loadTemplates, page]);

  function applyFilters() {
    setPage(1);
    setCategoryFilter(categoryInput);
    setTitleFilter(titleInput.trim());
    setBodyFilter(bodyInput.trim());
  }

  function clearFilters() {
    setCategoryInput("all");
    setTitleInput("");
    setBodyInput("");
    setCategoryFilter("all");
    setTitleFilter("");
    setBodyFilter("");
    setPage(1);
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedTemplate(null);
    setFormOpen(true);
  }

  function openEditDialog(template: RejectionTemplate) {
    setFormMode("edit");
    setSelectedTemplate(template);
    setFormOpen(true);
  }

  function openDeleteDialog(template: RejectionTemplate) {
    setTemplateToDelete(template);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadTemplates(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New template
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="rejection-template-filter-category">Category</Label>
          <Select
            value={categoryInput}
            onValueChange={(value) =>
              setCategoryInput((value ?? "all") as CategoryFilter)
            }
          >
            <SelectTrigger
              id="rejection-template-filter-category"
              className="w-full"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {REJECTION_TEMPLATE_CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rejection-template-filter-title">Title</Label>
          <Input
            id="rejection-template-filter-title"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            placeholder="Partial match"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
          />
        </div>
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="rejection-template-filter-body">Body</Label>
          <Input
            id="rejection-template-filter-body"
            value={bodyInput}
            onChange={(event) => setBodyInput(event.target.value)}
            placeholder="Partial match"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
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
          title="Could not load rejection templates"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Body</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
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
                  No rejection templates found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {rejectionTemplateCategoryLabel(template.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {template.title}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {truncateBody(template.body)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${template.title}`}
                          onClick={() => openEditDialog(template)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${template.title}`}
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

      <RejectionTemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        template={selectedTemplate}
        onSuccess={handleMutationSuccess}
      />

      <RejectionTemplateDeleteDialog
        template={templateToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
