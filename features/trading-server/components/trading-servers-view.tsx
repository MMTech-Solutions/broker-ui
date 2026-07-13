"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChartCandlestickIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getPlatform } from "@/features/platform/api";
import type { Platform } from "@/features/platform/types";
import {
  listTradingServerEnvironments,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import { TradingServerDeleteDialog } from "@/features/trading-server/components/trading-server-delete-dialog";
import { TradingServerFormDialog } from "@/features/trading-server/components/trading-server-form-dialog";
import { TradingServerSyncDialog } from "@/features/trading-server/components/trading-server-sync-dialog";
import type { TradingServer } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type TradingServersViewProps = {
  platformId: string;
};

export function TradingServersView({ platformId }: TradingServersViewProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [tradingServers, setTradingServers] = useState<TradingServer[]>([]);
  const [environmentLabels, setEnvironmentLabels] = useState<
    Record<number, string>
  >({});
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedServer, setSelectedServer] = useState<TradingServer | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<TradingServer | null>(
    null,
  );

  const [syncOpen, setSyncOpen] = useState(false);
  const [serverToSync, setServerToSync] = useState<TradingServer | null>(null);

  useEffect(() => {
    setPage(1);
    setTradingServers([]);
    setPlatform(null);
    setSuccessMessage(null);
  }, [platformId]);

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "Platforms", href: "/platforms" },
      { label: platform?.custom_name ?? platform?.name ?? "Platform" },
      { label: "Trading servers", current: true },
    ],
    [platform],
  );

  const loadEnvironmentLabels = useCallback(async () => {
    try {
      const environmentsResponse = await listTradingServerEnvironments();

      setEnvironmentLabels(
        Object.fromEntries(
          environmentsResponse.data.map((environment) => [
            environment.value,
            environment.label,
          ]),
        ),
      );
    } catch {
      setEnvironmentLabels({});
    }
  }, []);

  const loadServers = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const [platformResult, serversResponse] = await Promise.all([
          getPlatform(platformId),
          listTradingServersForAdmin({
            platform_id: platformId,
            page: requestedPage,
            per_page: 15,
          }),
        ]);

        setPlatform(platformResult.data);
        setTradingServers(serversResponse.data);
        setPagination(serversResponse.meta.pagination ?? null);

        void loadEnvironmentLabels();
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setTradingServers([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [loadEnvironmentLabels, platformId],
  );

  useEffect(() => {
    void loadServers(page);
  }, [loadServers, page]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedServer(null);
    setFormOpen(true);
  }

  function openEditDialog(server: TradingServer) {
    setFormMode("edit");
    setSelectedServer(server);
    setFormOpen(true);
  }

  function openDeleteDialog(server: TradingServer) {
    setServerToDelete(server);
    setDeleteOpen(true);
  }

  function openSyncDialog(server: TradingServer) {
    setServerToSync(server);
    setSyncOpen(true);
  }

  function handleMutationSuccess() {
    void loadServers(page);
  }

  function handleSyncSuccess(message: string) {
    setSuccessMessage(message);
    void loadServers(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref="/platforms"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New trading server
        </Button>
      </PageContentToolbar>

      {successMessage ? (
        <Alert>
          <AlertTitle>Synchronization complete</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <ApiErrorAlert title="Could not load trading servers" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Host</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[276px] text-right">Actions</TableHead>
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

            {!loading && tradingServers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No trading servers found for this platform.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? tradingServers.map((server) => {
                  const isInitialized = Boolean(server.initialized_at);

                  return (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">
                        {String(server.config.host ?? "—")}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {server.config_schema_id.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        {environmentLabels[server.environment] ??
                          server.environment}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {server.connection_id ?? server.connection_signature}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={server.is_active ? "default" : "secondary"}
                        >
                          {server.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={
                              isInitialized
                                ? "Synchronize trading server"
                                : "Initialize trading server"
                            }
                            onClick={() => openSyncDialog(server)}
                          >
                            <RefreshCwIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            disabled={!isInitialized}
                            tooltip={
                              isInitialized
                                ? "View server groups"
                                : "Initialize the trading server first"
                            }
                            render={
                              isInitialized ? (
                                <Link
                                  href={`/platforms/${platformId}/trading-servers/${server.id}/server-groups`}
                                />
                              ) : undefined
                            }
                          >
                            <LayersIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            disabled={!isInitialized}
                            tooltip={
                              isInitialized
                                ? "View securities"
                                : "Initialize the trading server first"
                            }
                            render={
                              isInitialized ? (
                                <Link
                                  href={`/platforms/${platformId}/trading-servers/${server.id}/securities`}
                                />
                              ) : undefined
                            }
                          >
                            <ChartCandlestickIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            disabled={!isInitialized}
                            tooltip={
                              isInitialized
                                ? "View symbols"
                                : "Initialize the trading server first"
                            }
                            render={
                              isInitialized ? (
                                <Link
                                  href={`/platforms/${platformId}/trading-servers/${server.id}/symbols`}
                                />
                              ) : undefined
                            }
                          >
                            <TagsIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            disabled={!isInitialized}
                            tooltip={
                              isInitialized
                                ? "Edit trading server"
                                : "Initialize the trading server first"
                            }
                            onClick={() => openEditDialog(server)}
                          >
                            <PencilIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            disabled={!isInitialized}
                            tooltip={
                              isInitialized
                                ? "Delete trading server"
                                : "Initialize the trading server first"
                            }
                            onClick={() => openDeleteDialog(server)}
                          >
                            <Trash2Icon />
                          </ActionTooltipButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      <TradingServerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        platformId={platformId}
        tradingServer={selectedServer}
        onSuccess={handleMutationSuccess}
      />

      <TradingServerDeleteDialog
        tradingServer={serverToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />

      <TradingServerSyncDialog
        tradingServer={serverToSync}
        open={syncOpen}
        onOpenChange={setSyncOpen}
        onSuccess={handleSyncSuccess}
      />
    </div>
  );
}
