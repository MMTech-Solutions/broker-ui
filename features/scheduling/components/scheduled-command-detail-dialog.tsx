"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelScheduledCommandRun,
  getScheduledCommand,
} from "@/features/scheduling/api";
import { formatParameterFlags } from "@/features/scheduling/parameters";
import type {
  ScheduledCommand,
  ScheduledCommandDetail,
  ScheduledCommandRun,
  ScheduledCommandRunStatus,
} from "@/features/scheduling/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ScheduledCommandDetailDialogProps = {
  scheduledCommand: ScheduledCommand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function runStatusVariant(
  status: ScheduledCommandRunStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "running":
      return "secondary";
    case "pending":
      return "outline";
    case "cancelled":
      return "secondary";
    default:
      return "outline";
  }
}

export function ScheduledCommandDetailDialog({
  scheduledCommand,
  open,
  onOpenChange,
}: ScheduledCommandDetailDialogProps) {
  const [detail, setDetail] = useState<ScheduledCommandDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingRunId, setCancellingRunId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadDetail = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!scheduledCommand) {
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getScheduledCommand(scheduledCommand.id);
        setDetail(response.data);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setDetail(null);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [scheduledCommand],
  );

  useEffect(() => {
    if (!open || !scheduledCommand) {
      return;
    }

    setCancelError(null);
    void loadDetail();
  }, [open, scheduledCommand, loadDetail]);

  useEffect(() => {
    if (!open || !detail) {
      return;
    }

    const hasActiveRun = detail.recent_runs.some(
      (run) => run.status === "pending" || run.status === "running",
    );

    if (!hasActiveRun) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadDetail({ silent: true });
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [open, detail, loadDetail]);

  async function handleCancel(run: ScheduledCommandRun) {
    if (!scheduledCommand) {
      return;
    }

    setCancellingRunId(run.id);
    setCancelError(null);

    try {
      await cancelScheduledCommandRun(scheduledCommand.id, run.id);
      await loadDetail({ silent: true });
    } catch (cancelRunError) {
      setCancelError(formatBrokerApiError(cancelRunError));
    } finally {
      setCancellingRunId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Command history</DialogTitle>
          <DialogDescription>
            Recent runs for{" "}
            <span className="font-medium text-foreground">
              {scheduledCommand?.signature ?? "this command"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
          {error ? (
            <ApiErrorAlert
              title="Could not load command history"
              message={error}
            />
          ) : null}

          {cancelError ? (
            <ApiErrorAlert
              title="Could not cancel run"
              message={cancelError}
            />
          ) : null}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`detail-skeleton-${index}`} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {!loading && detail ? (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Finished</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.recent_runs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No runs recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detail.recent_runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={runStatusVariant(run.status)}>
                              {run.status}
                            </Badge>
                            {run.error_message ? (
                              <p className="max-w-[180px] truncate text-xs text-destructive">
                                {run.error_message}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {run.trigger}
                        </TableCell>
                        <TableCell>{formatDateTime(run.started_at)}</TableCell>
                        <TableCell>{formatDateTime(run.finished_at)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatParameterFlags(run.parameters)}
                        </TableCell>
                        <TableCell className="text-right">
                          {run.status === "pending" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingRunId === run.id}
                              onClick={() => void handleCancel(run)}
                            >
                              {cancellingRunId === run.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </Button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDetail()}
            disabled={loading || !scheduledCommand}
          >
            Refresh
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
