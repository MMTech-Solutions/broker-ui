"use client";

import { useCallback, useEffect, useState } from "react";
import { HistoryIcon, PencilIcon, PlayIcon } from "lucide-react";

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
import { listScheduledCommands } from "@/features/scheduling/api";
import { ScheduledCommandDetailDialog } from "@/features/scheduling/components/scheduled-command-detail-dialog";
import { ScheduledCommandFormDialog } from "@/features/scheduling/components/scheduled-command-form-dialog";
import { ScheduledCommandRunDialog } from "@/features/scheduling/components/scheduled-command-run-dialog";
import { formatParameterFlags } from "@/features/scheduling/parameters";
import {
  SCHEDULED_COMMAND_FEATURE_AREAS,
  type ScheduledCommand,
} from "@/features/scheduling/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const schedulingBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Scheduling", current: true },
];

const featureAreaLabels = Object.fromEntries(
  SCHEDULED_COMMAND_FEATURE_AREAS.map((option) => [option.value, option.label]),
) as Record<string, string>;

type AutomaticFilter = "all" | "automatic" | "manual";

export function ScheduledCommandsView() {
  const [commands, setCommands] = useState<ScheduledCommand[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [signatureInput, setSignatureInput] = useState("");
  const [signatureFilter, setSignatureFilter] = useState("");
  const [featureAreaFilter, setFeatureAreaFilter] = useState<string>("all");
  const [automaticFilter, setAutomaticFilter] =
    useState<AutomaticFilter>("all");

  const [selectedCommand, setSelectedCommand] =
    useState<ScheduledCommand | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadCommands = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listScheduledCommands({
          page: requestedPage,
          per_page: 15,
          signature: signatureFilter || undefined,
          feature_area:
            featureAreaFilter === "all" ? undefined : featureAreaFilter,
          is_automatic:
            automaticFilter === "all"
              ? undefined
              : automaticFilter === "automatic",
        });

        setCommands(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setCommands([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [signatureFilter, featureAreaFilter, automaticFilter],
  );

  useEffect(() => {
    void loadCommands(page);
  }, [loadCommands, page]);

  function applyFilters() {
    setPage(1);
    setSignatureFilter(signatureInput.trim());
  }

  function clearFilters() {
    setSignatureInput("");
    setSignatureFilter("");
    setFeatureAreaFilter("all");
    setAutomaticFilter("all");
    setPage(1);
  }

  function openEditDialog(command: ScheduledCommand) {
    setSelectedCommand(command);
    setFormOpen(true);
  }

  function openRunDialog(command: ScheduledCommand) {
    setSelectedCommand(command);
    setRunOpen(true);
  }

  function openDetailDialog(command: ScheduledCommand) {
    setSelectedCommand(command);
    setDetailOpen(true);
  }

  function handleMutationSuccess() {
    void loadCommands(page);
  }

  function handleRunSuccess() {
    void loadCommands(page);
    setDetailOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={schedulingBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      />

      <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled-command-signature-filter">Signature</Label>
          <Input
            id="scheduled-command-signature-filter"
            value={signatureInput}
            onChange={(event) => setSignatureInput(event.target.value)}
            placeholder="run:ib-program-settlement"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled-command-feature-area-filter">
            Feature area
          </Label>
          <Select
            value={featureAreaFilter}
            onValueChange={(value) => {
              setFeatureAreaFilter(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger
              id="scheduled-command-feature-area-filter"
              className="w-full"
            >
              <SelectValue placeholder="All areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All areas</SelectItem>
              {SCHEDULED_COMMAND_FEATURE_AREAS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduled-command-automatic-filter">Mode</Label>
          <Select
            value={automaticFilter}
            onValueChange={(value) => {
              setAutomaticFilter((value ?? "all") as AutomaticFilter);
              setPage(1);
            }}
          >
            <SelectTrigger
              id="scheduled-command-automatic-filter"
              className="w-full"
            >
              <SelectValue placeholder="All modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={applyFilters}>Apply</Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert
          title="Could not load scheduled commands"
          message={error}
        />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signature</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Cron</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Parameters</TableHead>
              <TableHead className="w-[132px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && commands.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No scheduled commands found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? commands.map((command) => (
                  <TableRow key={command.id}>
                    <TableCell>
                      <div
                        className="flex items-center gap-2"
                        title={
                          command.is_automatic
                            ? "Automatic: runs on schedule"
                            : "Manual: not on the scheduler"
                        }
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            command.is_automatic
                              ? "bg-emerald-500"
                              : "bg-destructive",
                          )}
                        />
                        <span
                          className={cn(
                            "font-mono text-xs font-medium",
                            command.is_automatic
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive",
                          )}
                        >
                          {command.signature}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {featureAreaLabels[command.feature_area] ??
                        command.feature_area}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {command.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {command.cron_expression ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={command.is_automatic ? "default" : "secondary"}
                      >
                        {command.is_automatic ? "Automatic" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatParameterFlags(command.parameters)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${command.signature}`}
                          onClick={() => openEditDialog(command)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Run ${command.signature}`}
                          onClick={() => openRunDialog(command)}
                        >
                          <PlayIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`History for ${command.signature}`}
                          onClick={() => openDetailDialog(command)}
                        >
                          <HistoryIcon />
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

      <ScheduledCommandFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        scheduledCommand={selectedCommand}
        onSuccess={handleMutationSuccess}
      />

      <ScheduledCommandRunDialog
        scheduledCommand={selectedCommand}
        open={runOpen}
        onOpenChange={setRunOpen}
        onSuccess={handleRunSuccess}
      />

      <ScheduledCommandDetailDialog
        scheduledCommand={selectedCommand}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
