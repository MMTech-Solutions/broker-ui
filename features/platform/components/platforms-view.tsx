"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon, ServerIcon, Trash2Icon } from "lucide-react";

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
import { listPlatforms } from "@/features/platform/api";
import { PlatformDeleteDialog } from "@/features/platform/components/platform-delete-dialog";
import { PlatformFormDialog } from "@/features/platform/components/platform-form-dialog";
import type { Platform } from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const platformsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Platforms", current: true },
];

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(
    null,
  );

  const loadPlatforms = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listPlatforms({
        page: requestedPage,
        per_page: 15,
      });

      setPlatforms(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setPlatforms([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlatforms(page);
  }, [loadPlatforms, page]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedPlatform(null);
    setFormOpen(true);
  }

  function openEditDialog(platform: Platform) {
    setFormMode("edit");
    setSelectedPlatform(platform);
    setFormOpen(true);
  }

  function openDeleteDialog(platform: Platform) {
    setPlatformToDelete(platform);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadPlatforms(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={platformsBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New platform
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load platforms" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Custom name</TableHead>
              <TableHead>Volume factor</TableHead>
              <TableHead>Trading servers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[156px] text-right">Actions</TableHead>
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

            {!loading && platforms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No platforms found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? platforms.map((platform) => (
                  <TableRow key={platform.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/platforms/${platform.id}/trading-servers`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {platform.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {platform.custom_name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{platform.volume_factor}</TableCell>
                    <TableCell>
                      <Link
                        href={`/platforms/${platform.id}/trading-servers`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {platform.trading_servers_count ?? 0}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {platform.is_active === undefined ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          variant={
                            platform.is_active ? "default" : "secondary"
                          }
                        >
                          {platform.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Trading servers for ${platform.name}`}
                          render={
                            <Link
                              href={`/platforms/${platform.id}/trading-servers`}
                            />
                          }
                        >
                          <ServerIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${platform.name}`}
                          onClick={() => openEditDialog(platform)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${platform.name}`}
                          onClick={() => openDeleteDialog(platform)}
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

      <PlatformFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        platform={selectedPlatform}
        onSuccess={handleMutationSuccess}
      />

      <PlatformDeleteDialog
        platform={platformToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
